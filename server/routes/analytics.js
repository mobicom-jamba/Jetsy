// server/routes/analytics.js (FIXED)
const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { authenticateToken } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(apiLimiter);

// Analytics routes with proper parameter syntax
router.get("/metrics", analyticsController.getMetrics);
router.post("/campaigns/:campaignId/sync", analyticsController.syncMetrics); // Fixed: proper parameter syntax

module.exports = router;
