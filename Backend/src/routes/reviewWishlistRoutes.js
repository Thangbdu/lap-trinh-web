const express = require('express');
const router = express.Router();
const rw = require('../controllers/reviewWishlistController');
const { authenticate } = require('../middleware/auth');

// Reviews (public đọc, auth để viết)
router.get('/reviews/:product_id', rw.getReviewsByProduct);
router.post('/reviews', authenticate, rw.createReview);

// Wishlist (cần auth)
router.get('/wishlist', authenticate, rw.getWishlist);
router.post('/wishlist', authenticate, rw.addToWishlist);
router.delete('/wishlist/:product_id', authenticate, rw.removeFromWishlist);

module.exports = router;
