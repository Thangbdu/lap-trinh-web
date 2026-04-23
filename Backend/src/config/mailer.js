const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Kiểm tra kết nối SMTP
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP kết nối thất bại:', error.message);
    if (error.code === 'EAUTH') {
      console.error('👉 Lỗi: Tài khoản hoặc Mật khẩu ứng dụng (App Password) không chính xác.');
      console.error('👉 Vui lòng kiểm tra lại SMTP_USER và SMTP_PASS trong file .env');
    }
  } else {
    console.log('✅ SMTP sẵn sàng gửi email!');
  }
});

module.exports = transporter;
