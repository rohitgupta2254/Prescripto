const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  let error = { ...err };
  error.message = err.message;

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    const message = 'Referenced record not found';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;