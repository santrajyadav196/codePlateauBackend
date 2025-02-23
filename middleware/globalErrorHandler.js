const CustomError = require("../utils/CustomError");

module.exports = (err, req, res, next) => {
  console.log("Error:", err);
  err.statusCode = err.statusCode || 500;
  err.success = err.success ?? false;

  let error = err;

  // Handle Mongoose Validation Error
  if (error.name === "ValidationError") {
    const firstError = Object.values(error.errors)[0].message;
    error = new CustomError(firstError, 400);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]; // Extract the duplicate field name
    error = new CustomError(
      `${field} already exists. Please use a different value.`,
      400
    );
  }

  // Unified error response structure
  const response = {
    success: error.success,
    message: error.message,
  };

  // Development mode response
  if (process.env.MODE === "development") {
    response.error = error;
    response.stack = error.stack;
    return res.status(error.statusCode).json(response);
  }

  // Production mode response
  if (error.isOperational) {
    return res.status(error.statusCode).json(response);
  } else {
    // Log unexpected errors for debugging (can be sent to an error tracking service)
    console.error("Unexpected Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
