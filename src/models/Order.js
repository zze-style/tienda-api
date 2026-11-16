const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Cada ítem debe referenciar un producto'],
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad mínima es 1'],
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero',
      },
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'El precio unitario no puede ser negativo'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'La orden debe pertenecer a un usuario'],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'La orden debe tener al menos un producto',
      },
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'El total no puede ser negativo'],
    },
    status: {
      type: String,
      enum: ['completada', 'devuelta'],
      default: 'completada',
    },
    returnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Order', orderSchema);
