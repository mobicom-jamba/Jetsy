// ================================================================
// SERVER - ROUTES
// ================================================================

// server/routes/index.js
const express = require("express");
const authRoutes = require("./auth");
const campaignRoutes = require("./campaigns");
const analyticsRoutes = require("./analytics");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;
