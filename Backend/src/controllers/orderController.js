const pool = require('../config/db');

// Tạo đơn hàng
exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { address_id, promo_code, items } = req.body;
    // items = [{ product_id, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống.' });
    }

    // Tính tổng tiền
    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT product_id, price, stock_quantity FROM products WHERE product_id = ? AND is_active = 1',
        [item.product_id]
      );
      if (products.length === 0) {
        throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại.`);
      }
      if (products[0].stock_quantity < item.quantity) {
        throw new Error(`Sản phẩm ID ${item.product_id} không đủ hàng.`);
      }

      const price = products[0].price;
      total_amount += price * item.quantity;
      orderItems.push({ product_id: item.product_id, quantity: item.quantity, price });

      // Giảm stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Kiểm tra mã giảm giá
    let promo_id = null;
    let discount_amount = 0;

    if (promo_code) {
      const [promos] = await connection.query(
        'SELECT * FROM promotions WHERE promo_code = ? AND is_active = 1 AND start_date <= NOW() AND end_date >= NOW()',
        [promo_code]
      );
      if (promos.length > 0) {
        const promo = promos[0];
        if (total_amount >= promo.min_order_value) {
          promo_id = promo.promo_id;
          discount_amount = Math.min(
            (total_amount * promo.discount_percent) / 100,
            promo.max_discount_amount
          );
        }
      }
    }

    const final_amount = total_amount - discount_amount;

    // Tạo order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, address_id, promo_id, total_amount, discount_amount, final_amount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.user_id, address_id, promo_id, total_amount, discount_amount, final_amount]
    );

    const order_id = orderResult.insertId;

    // Tạo order items
    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO orderitems (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    // Tạo payment record
    await connection.query(
      'INSERT INTO payments (order_id, payment_method, amount) VALUES (?, ?, ?)',
      [order_id, req.body.payment_method || 'COD', final_amount]
    );

    // Xóa giỏ hàng sau khi đặt hàng
    const [cart] = await connection.query('SELECT cart_id FROM cart WHERE user_id = ?', [req.user.user_id]);
    if (cart.length > 0) {
      await connection.query('DELETE FROM cartitems WHERE cart_id = ?', [cart[0].cart_id]);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: { order_id, total_amount, discount_amount, final_amount },
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// Lấy lịch sử đơn hàng của user
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, ua.full_address, ua.recipient_name, ua.phone_number
       FROM orders o
       LEFT JOIN user_addresses ua ON o.address_id = ua.address_id
       WHERE o.user_id = ?
       ORDER BY o.order_date DESC`,
      [req.user.user_id]
    );

    // Lấy items cho mỗi đơn
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.product_name, p.thumbnail_url
         FROM orderitems oi
         JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );
      order.items = items;
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT o.*, ua.full_address, ua.recipient_name, ua.phone_number, pm.payment_method, pm.payment_status
       FROM orders o
       LEFT JOIN user_addresses ua ON o.address_id = ua.address_id
       LEFT JOIN payments pm ON o.order_id = pm.order_id
       WHERE o.order_id = ? AND o.user_id = ?`,
      [id, req.user.user_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.product_name, p.thumbnail_url
       FROM orderitems oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ success: true, data: { ...orders[0], items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT o.*, u.full_name, u.email, ua.full_address
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN user_addresses ua ON o.address_id = ua.address_id
    `;
    let countQuery = `SELECT COUNT(*) AS total FROM orders o`;
    const params = [];
    const countParams = [];

    if (status) {
      baseQuery += ' WHERE o.status = ?';
      countQuery += ' WHERE o.status = ?';
      params.push(status);
      countParams.push(status);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    baseQuery += ' ORDER BY o.order_date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [orders] = await pool.query(baseQuery, params);
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [Admin] Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, id]);

    // Nếu đã giao xong thì cập nhật thanh toán COD
    if (status === 'Đã giao') {
      await pool.query(
        "UPDATE payments SET payment_status = 'Đã thanh toán', paid_at = NOW() WHERE order_id = ? AND payment_method = 'COD'",
        [id]
      );
    }

    res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
