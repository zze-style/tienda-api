const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.status(200).json({ ok: true, count: products.length, products });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  res.status(200).json({ ok: true, product });
});

// POST /api/products (solo admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    createdBy: req.user._id,
  });
  res.status(201).json({ ok: true, message: 'Producto creado', product });
});

// PUT /api/products/:id (solo admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price, stock, category },
    { new: true, runValidators: true }
  );
  if (!product) throw new AppError('Producto no encontrado', 404);
  res.status(200).json({ ok: true, message: 'Producto actualizado', product });
});

// DELETE /api/products/:id (solo admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  res.status(200).json({ ok: true, message: 'Producto eliminado' });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
