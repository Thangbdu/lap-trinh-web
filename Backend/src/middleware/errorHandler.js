// Middleware xử lý lỗi chung
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Middleware xử lý route không tồn tại
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy route: ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
