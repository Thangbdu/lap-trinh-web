const express = require('express');
const router = express.Router();
const cb = require('../controllers/categoryBrandController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Categories
router.get('/categories', cb.getCategories);
router.post('/categories', authenticate, authorizeAdmin, cb.createCategory);
router.put('/categories/:id', authenticate, authorizeAdmin, cb.updateCategory);
router.delete('/categories/:id', authenticate, authorizeAdmin, cb.deleteCategory);

// Brands
router.get('/brands', cb.getBrands);
router.post('/brands', authenticate, authorizeAdmin, cb.createBrand);
router.put('/brands/:id', authenticate, authorizeAdmin, cb.updateBrand);
router.delete('/brands/:id', authenticate, authorizeAdmin, cb.deleteBrand);

module.exports = router;
