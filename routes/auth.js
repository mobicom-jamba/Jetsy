// server/routes/auth.js (FIXED)
const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { validate, schemas } = require("../middleware/validation");

const router = express.Router();

// Auth routes with proper parameter syntax
router.post(
  "/register",
  authLimiter,
  validate(schemas.register),
  authController.register
);
router.post(
  "/login",
  authLimiter,
  validate(schemas.login),
  authController.login
);
router.get("/me", authenticateToken, authController.me);
router.get("/meta/connect", authenticateToken, authController.getMetaAuthUrl);
router.get("/meta/callback", authController.handleMetaCallback);

module.exports = router;
