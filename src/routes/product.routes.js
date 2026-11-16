const { Router } = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = Router();

// Catálogo público
router.get('/', getProducts);
router.get('/:id', getProductById);

// Gestión de inventario: requiere token y rol admin
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
