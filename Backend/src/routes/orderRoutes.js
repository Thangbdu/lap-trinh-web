const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate);

router.post('/', orderController.createOrder);
router.post('/seed-sample', orderController.seedSampleOrders); // Thêm dòng này
router.get('/my', orderController.getMyOrders); // Chỉnh lại cho khớp Frontend
router.get('/my-orders', orderController.getMyOrders); // Giữ lại cho tương thích cũ
router.get('/all', authorizeAdmin, orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', authorizeAdmin, orderController.updateOrderStatus);
router.get('/admin/payments-pending', authorizeAdmin, orderController.getPendingPayments);
router.put('/admin/approve-payment/:id', authorizeAdmin, orderController.approvePayment);
router.put('/admin/reject-payment/:id', authorizeAdmin, orderController.rejectPayment);
router.put('/:id/notify-payment', orderController.notifyPayment);

module.exports = router;
