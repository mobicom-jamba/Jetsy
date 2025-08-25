const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.details?.map((detail) => detail.message) || err.message,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Resource already exists",
      details: err.message,
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors.map((e) => e.message),
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ error: "Route not found" });
};

module.exports = { errorHandler, notFound };
