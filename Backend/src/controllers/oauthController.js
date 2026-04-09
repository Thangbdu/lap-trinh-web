const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const https = require('https');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Tạo JWT token
const signToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Tạo hoặc lấy user từ OAuth
const findOrCreateOAuthUser = async (email, full_name, provider) => {
  // Kiểm tra user đã tồn tại chưa
  const [existing] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    // User đã có, đăng nhập luôn
    if (!existing[0].is_active) {
      throw new Error('Tài khoản của bạn đã bị khóa.');
    }
    return existing[0];
  }

  // User chưa có → tạo mới
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, `oauth_${provider}_no_password`, 'customer', 1]
  );

  // Tạo cart cho user mới
  await pool.query('INSERT INTO cart (user_id) VALUES (?)', [result.insertId]);

  const [newUser] = await pool.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
  return newUser[0];
};

// ─── Google OAuth ───────────────────────────────────────────────────────────
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // Google JWT token từ frontend

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Thiếu token Google.' });
    }

    // Verify token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Không lấy được email từ Google.' });
    }

    const user = await findOrCreateOAuthUser(email, name || email, 'google');
    const token = signToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    res.status(401).json({ success: false, message: 'Xác thực Google thất bại: ' + error.message });
  }
};

// ─── Facebook OAuth ─────────────────────────────────────────────────────────
exports.facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Thiếu access token Facebook.' });
    }

    // Verify token và lấy thông tin user từ Facebook Graph API
    const fbData = await new Promise((resolve, reject) => {
      const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
      https.get(url, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
      }).on('error', reject);
    });

    if (fbData.error) {
      return res.status(401).json({ success: false, message: 'Token Facebook không hợp lệ.' });
    }

    const { name, email, id: fbId } = fbData;
    // Nếu Facebook không trả email, dùng fbId làm email giả
    const userEmail = email || `fb_${fbId}@facebook.com`;

    const user = await findOrCreateOAuthUser(userEmail, name || 'Facebook User', 'facebook');
    const token = signToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Đăng nhập Facebook thành công!',
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error.message);
    res.status(401).json({ success: false, message: 'Xác thực Facebook thất bại: ' + error.message });
  }
};
