const { HTTP_STATUS } = require("../shared/constants");

function errorMiddleware(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = errorMiddleware;