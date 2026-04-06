const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorizeStaff } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, authorizeStaff, productController.createProduct);
router.put('/:id', authenticate, authorizeStaff, productController.updateProduct);
router.delete('/:id', authenticate, authorizeStaff, productController.deleteProduct);

module.exports = router;
