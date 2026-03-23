// middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error("🔥 Error caught by middleware:", err);

  let statusCode = 500;
  let message = "Server Error";

  // Handle MongoDB duplicate key error (e.g., unique email/username)
  if (err.code && err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  // Handle Mongoose validation errors
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message);
  }

  // Handle CastError (invalid ObjectId format)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle database/server connection errors (string codes like ECONNREFUSED)
  else if (typeof err.code === "string" && err.code.startsWith("E")) {
    statusCode = 500;
    message = `Database/Server error: ${err.code}`;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
