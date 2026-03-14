const pool = require('../config/db');

// Lấy giỏ hàng của user
exports.getCart = async (req, res) => {
  try {
    const [cart] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [req.user.user_id]);
    if (cart.length === 0) {
      return res.json({ success: true, data: { items: [], total: 0 } });
    }

    const [items] = await pool.query(
      `SELECT ci.*, p.product_name, p.price, p.thumbnail_url, p.stock_quantity,
        (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_primary = 1 LIMIT 1) AS primary_image
       FROM cartitems ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      [cart[0].cart_id]
    );

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ success: true, data: { cart_id: cart[0].cart_id, items, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm sản phẩm vào giỏ
exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    // Lấy hoặc tạo cart
    let [cart] = await pool.query('SELECT cart_id FROM cart WHERE user_id = ?', [req.user.user_id]);
    if (cart.length === 0) {
      const [result] = await pool.query('INSERT INTO cart (user_id) VALUES (?)', [req.user.user_id]);
      cart = [{ cart_id: result.insertId }];
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const [existing] = await pool.query(
      'SELECT * FROM cartitems WHERE cart_id = ? AND product_id = ?',
      [cart[0].cart_id, product_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE cartitems SET quantity = quantity + ? WHERE cart_item_id = ?',
        [quantity, existing[0].cart_item_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cartitems (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cart[0].cart_id, product_id, quantity]
      );
    }

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật số lượng
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await pool.query('DELETE FROM cartitems WHERE cart_item_id = ?', [id]);
      return res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ.' });
    }

    await pool.query('UPDATE cartitems SET quantity = ? WHERE cart_item_id = ?', [quantity, id]);
    res.json({ success: true, message: 'Cập nhật số lượng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ
exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM cartitems WHERE cart_item_id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
