// utils/logger.js
const winston = require("winston");
const { format, transports } = winston;

const isProd = process.env.NODE_ENV === "production";
const enableFileLogs = !!process.env.ENABLE_FILE_LOGS; // opt-in for local

const consoleTransport = new transports.Console({
  stderrLevels: ["error"], // errors to STDERR
  format: isProd
    ? format.json() // structured in prod
    : format.combine(format.colorize(), format.simple()),
});

const fileTransports = enableFileLogs
  ? [
      new transports.File({ filename: "error.log", level: "error" }),
      new transports.File({ filename: "combined.log" }),
    ]
  : [];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "jetsy-meta-ads", env: process.env.NODE_ENV },
  transports: [consoleTransport, ...fileTransports],
  exceptionHandlers: [consoleTransport],
  rejectionHandlers: [consoleTransport],
  exitOnError: false,
});

// Optional: integrate with morgan HTTP logs
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
