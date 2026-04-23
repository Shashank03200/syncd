const { createLogger, format, transports } = require("winston");
 
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    process.env.NODE_ENV === "production"
      ? format.json()
      : format.combine(format.colorize(), format.printf(({ timestamp, level, message }) =>
          `${timestamp} [${level}]: ${message}`
        ))
  ),
  transports: [
    new transports.Console(),
    // Uncomment to log to files:
    // new transports.File({ filename: "logs/error.log", level: "error" }),
    // new transports.File({ filename: "logs/combined.log" }),
  ],
});
 
module.exports = logger;
 