const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: {
      code: 'NOT_FOUND',
    },
  });
};

module.exports = notFoundHandler;
