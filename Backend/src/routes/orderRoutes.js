const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/all', authorizeAdmin, orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', authorizeAdmin, orderController.updateOrderStatus);

module.exports = router;
