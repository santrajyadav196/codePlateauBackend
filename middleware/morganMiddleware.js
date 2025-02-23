const morgan = require("morgan");
const logger = require("../logger");

// Custom Morgan format
const morganFormat = ":method :url :status :response-time ms";

// Integrate Morgan with Winston
const morganMiddleware = morgan(morganFormat, {
  stream: {
    write: (message) => {
      // Log HTTP request details as structured JSON
      const logObject = {
        method: message.split(" ")[0],
        url: message.split(" ")[1],
        status: message.split(" ")[2],
        responseTime: `${message.split(" ")[3]}ms`,
      };
      logger.info(JSON.stringify(logObject));
      // const logDetails = message.trim(); // Avoid trailing spaces in logs
      // logger.info(logDetails); // Send structured log to Winston
    },
  },
});

module.exports = morganMiddleware;
