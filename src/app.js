const express = require('express');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'API de tienda virtual operativa' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
