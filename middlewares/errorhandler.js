const APIError = require("../util/APIError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Handle Mongoose invalid ObjectId error (CastError)
  if (err.name === "CastError") {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map(val => val.message).join(". ");
    statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid Token!";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Token Expired! Please log in again.";
    statusCode = 401;
  }

  res.status(statusCode).json({
    status: "failure",
    message
  });
};

module.exports = errorHandler;
