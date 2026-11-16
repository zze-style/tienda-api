const { Router } = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  returnOrder,
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

// Todas las rutas de órdenes son privadas
router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/return', returnOrder);

module.exports = router;
