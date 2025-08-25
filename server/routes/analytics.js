// server/routes/analytics.js
const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/metrics", analyticsController.getMetrics);
router.post("/campaigns/:campaignId/sync", analyticsController.syncMetrics);

module.exports = router;
