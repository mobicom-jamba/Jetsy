const cors = require("cors");
const logger = require("../utils/logger");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS?.split(",") || []),
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      logger.debug(`CORS: Allowed origin ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`CORS: Blocked origin ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200, // For legacy browser support
};

const corsMiddleware = cors(corsOptions);

// Enhanced CORS middleware with logging
const advancedCors = (req, res, next) => {
  logger.debug(
    `CORS: ${req.method} ${req.url} from ${
      req.headers.origin || "unknown origin"
    }`
  );

  corsMiddleware(req, res, (err) => {
    if (err) {
      logger.error("CORS Error:", err.message);
      return res.status(403).json({
        error: "CORS Error",
        message: err.message,
        origin: req.headers.origin,
      });
    }
    next();
  });
};

module.exports = {
  corsOptions,
  corsMiddleware,
  advancedCors,
  allowedOrigins,
};
