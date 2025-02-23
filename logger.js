const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, json } = format;

// Custom format for console logs
const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: timestamp({ format: "DD MMM YYYY HH:mm:ss" }), // Add timestamp globally
  transports: [
    // Console transport
    new transports.Console({
      format: combine(colorize(), consoleLogFormat), // Colorize console logs
    }),
    // File transport
    new transports.File({
      filename: "app.log",
      format: json(), // JSON format for structured logs
    }),
  ],
});

module.exports = logger;
