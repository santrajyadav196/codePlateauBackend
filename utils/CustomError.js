class CustomError extends Error {
  constructor(
    message,
    statusCode = 500,
    success = "error",
    isOperational = true
  ) {
    super(message); // Pass message to the Error constructor
    this.statusCode = statusCode;
    this.success =
      success !== "error"
        ? success
        : statusCode.toString().startsWith("4")
        ? false
        : "error"; // Logic for success flag
    this.isOperational = isOperational; // Flag for distinguishing operational vs. programming errors

    // Ensure proper stack trace for this error
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = CustomError;
