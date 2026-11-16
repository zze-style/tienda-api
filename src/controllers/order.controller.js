const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Devuelve al inventario las cantidades ya descontadas (compensación)
const restoreStock = async (items) => {
  await Promise.all(
    items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
    )
  );
};

// Valida y agrupa los ítems recibidos: [{ productId, quantity }]
const normalizeItems = (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError('Debes enviar al menos un producto en "items"', 400);
  }

  const grouped = new Map();
  for (const item of rawItems) {
    const productId = item && item.productId;
    const quantity = Number(item && item.quantity);

    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError(`productId inválido: ${productId}`, 400);
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('La cantidad de cada producto debe ser un entero mayor o igual a 1', 400);
    }
    grouped.set(productId, (grouped.get(productId) || 0) + quantity);
  }

  return [...grouped.entries()].map(([productId, quantity]) => ({ productId, quantity }));
};

// POST /api/orders  -> crea una compra y descuenta stock
const createOrder = asyncHandler(async (req, res) => {
  const items = normalizeItems(req.body.items);

  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  for (const item of items) {
    if (!productMap.has(item.productId)) {
      throw new AppError(`Producto no encontrado: ${item.productId}`, 404);
    }
  }

  // Descuento atómico: solo se resta si el stock actual alcanza ($gte).
  // Si algún producto falla, se revierten los descuentos ya aplicados.
  const decremented = [];
  try {
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        const product = productMap.get(item.productId);
        throw new AppError(
          `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
          409
        );
      }
      decremented.push({ product: item.productId, quantity: item.quantity });
    }

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: Number((product.price * item.quantity).toFixed(2)),
      };
    });
    const total = Number(orderItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

    const order = await Order.create({ user: req.user._id, items: orderItems, total });

    res.status(201).json({ ok: true, message: 'Orden creada correctamente', order });
  } catch (error) {
    await restoreStock(decremented);
    throw error;
  }
});

// GET /api/orders  -> órdenes del usuario autenticado (admin ve todas)
const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ ok: true, count: orders.length, orders });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new AppError('Orden no encontrada', 404);

  const isOwner = Boolean(order.user) && order.user._id.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new AppError('Prohibido: esta orden no te pertenece', 403);
  }

  res.status(200).json({ ok: true, order });
});

// PATCH /api/orders/:id/return  -> devuelve la orden y restaura el stock
const returnOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Orden no encontrada', 404);

  const isOwner = order.user.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new AppError('Prohibido: esta orden no te pertenece', 403);
  }

  // Cambio de estado atómico: solo pasa a "devuelta" si sigue "completada".
  // Evita que dos peticiones simultáneas restauren el stock dos veces.
  const returned = await Order.findOneAndUpdate(
    { _id: order._id, status: 'completada' },
    { $set: { status: 'devuelta', returnedAt: new Date() } },
    { new: true }
  );
  if (!returned) {
    throw new AppError('La orden ya fue devuelta anteriormente', 409);
  }

  try {
    await restoreStock(returned.items);
  } catch (error) {
    // Si no se pudo restaurar el inventario, la orden vuelve a su estado anterior
    await Order.updateOne(
      { _id: returned._id },
      { $set: { status: 'completada', returnedAt: null } }
    );
    throw error;
  }

  res.status(200).json({
    ok: true,
    message: 'Orden devuelta y stock restaurado',
    order: returned,
  });
});

module.exports = { createOrder, getOrders, getOrderById, returnOrder };
