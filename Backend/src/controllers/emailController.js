const transporter = require('../config/mailer');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ── Tạo OTP ngẫu nhiên 6 số ──────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Template email ────────────────────────────────────────────────────────────
const otpEmailTemplate = (otp, name) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">📱</div>
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">MobileStore</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Xác thực tài khoản của bạn</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#94a3b8;font-size:15px;">Xin chào <strong style="color:#e2e8f0;">${name}</strong>,</p>
          <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
            Sử dụng mã OTP bên dưới để tiếp tục:
          </p>
          <!-- OTP Box -->
          <div style="background:#0f172a;border:2px solid #6366f1;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
            <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">MÃ XÁC THỰC</p>
            <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#818cf8;font-family:monospace;">${otp}</div>
            <p style="margin:8px 0 0;color:#64748b;font-size:12px;">⏱ Hiệu lực trong <strong style="color:#f59e0b;">10 phút</strong></p>
          </div>
          <p style="margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.6;">
            ⚠️ <strong style="color:#94a3b8;">Không chia sẻ mã này với bất kỳ ai</strong> — MobileStore sẽ không bao giờ yêu cầu mã OTP qua điện thoại.
          </p>
          <p style="margin:0;color:#64748b;font-size:13px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="margin:0;color:#475569;font-size:12px;">© 2024 MobileStore. Tất cả quyền được bảo lưu.</p>
          <p style="margin:4px 0 0;color:#334155;font-size:11px;">📍 Hệ thống tự động — Vui lòng không trả lời email này</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const welcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 40px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">🎉</div>
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Chào mừng đến MobileStore!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Tài khoản của bạn đã được tạo thành công</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;">Xin chào <strong style="color:#e2e8f0;">${name}</strong>,</p>
          <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
            Chào mừng bạn đến với <strong style="color:#10b981;">MobileStore</strong> — nơi công nghệ và phong cách gặp nhau! 
            Tài khoản của bạn đã được kích hoạt thành công.
          </p>
          <div style="background:#0f172a;border-radius:12px;padding:20px;margin:0 0 28px;">
            <h3 style="margin:0 0 16px;color:#e2e8f0;font-size:15px;">✨ Bạn có thể làm gì ngay bây giờ:</h3>
            <ul style="margin:0;padding:0 0 0 20px;color:#94a3b8;font-size:14px;line-height:2;">
              <li>🛒 Khám phá hàng ngàn sản phẩm điện thoại cao cấp</li>
              <li>💝 Lưu sản phẩm yêu thích vào Wishlist</li>
              <li>📦 Theo dõi đơn hàng theo thời gian thực</li>
              <li>⭐ Đánh giá sản phẩm sau khi mua</li>
            </ul>
          </div>
          <div style="text-align:center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
              🛍️ Mua sắm ngay
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="margin:0;color:#475569;font-size:12px;">© 2024 MobileStore. Tất cả quyền được bảo lưu.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ── [POST] /auth/forgot-password ─────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập email.' });

    const [users] = await pool.query('SELECT user_id, full_name, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Trả về success để tránh lộ thông tin email tồn tại không
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi mã OTP.' });
    }
    const user = users[0];
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Lưu OTP vào DB (xóa OTP cũ nếu có)
    await pool.query('DELETE FROM password_reset_otps WHERE user_id = ?', [user.user_id]);
    await pool.query(
      'INSERT INTO password_reset_otps (user_id, otp, expires_at) VALUES (?, ?, ?)',
      [user.user_id, otp, expiresAt]
    );

    // Gửi email
    await transporter.sendMail({
      from: `"MobileStore" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `[MobileStore] Mã OTP đặt lại mật khẩu: ${otp}`,
      html: otpEmailTemplate(otp, user.full_name),
    });

    res.json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi gửi email. Vui lòng thử lại.' });
  }
};

// ── [POST] /auth/verify-otp ───────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });

    const [users] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Email không tồn tại.' });

    const userId = users[0].user_id;
    const [otps] = await pool.query(
      'SELECT * FROM password_reset_otps WHERE user_id = ? AND otp = ? AND expires_at > NOW()',
      [userId, otp]
    );

    if (otps.length === 0) {
      return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    // Đánh dấu OTP đã được xác thực
    await pool.query('UPDATE password_reset_otps SET verified = 1 WHERE user_id = ? AND otp = ?', [userId, otp]);

    res.json({ success: true, message: 'Xác thực OTP thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── [POST] /auth/reset-password ──────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const [users] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Email không tồn tại.' });

    const userId = users[0].user_id;
    const [otps] = await pool.query(
      'SELECT * FROM password_reset_otps WHERE user_id = ? AND otp = ? AND verified = 1 AND expires_at > NOW()',
      [userId, otp]
    );

    if (otps.length === 0) {
      return res.status(400).json({ success: false, message: 'Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thử lại.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, userId]);
    await pool.query('DELETE FROM password_reset_otps WHERE user_id = ?', [userId]);

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Gửi email chào mừng ───────────────────────────────────────────────────────
exports.sendWelcomeEmail = async (email, name) => {
  if (!process.env.SMTP_USER) return; // Skip nếu chưa cấu hình SMTP
  try {
    await transporter.sendMail({
      from: `"MobileStore" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 Chào mừng bạn đến với MobileStore!',
      html: welcomeEmailTemplate(name),
    });
    console.log(`✅ Đã gửi email chào mừng đến ${email}`);
  } catch (err) {
    console.error('Welcome email error:', err.message);
  }
};
