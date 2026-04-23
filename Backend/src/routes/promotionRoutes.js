const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// [Public/User] Kiểm tra mã giảm giá (Cần đăng nhập)
router.post('/check', authenticate, promotionController.checkVoucher);

// [Admin] Quản lý mã giảm giá
router.get('/', authenticate, authorizeAdmin, promotionController.getAllPromotions);
router.post('/', authenticate, authorizeAdmin, promotionController.createPromotion);
router.put('/:id', authenticate, authorizeAdmin, promotionController.updatePromotion);
router.delete('/:id', authenticate, authorizeAdmin, promotionController.deletePromotion);

module.exports = router;
