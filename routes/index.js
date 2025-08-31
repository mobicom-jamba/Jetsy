// server/routes/index.js (UPDATED)
const express = require("express");
const authRoutes = require("./auth");
const campaignRoutes = require("./campaigns");
const analyticsRoutes = require("./analytics");
const accountRoutes = require("./accounts");
const metaAppRoutes = require("./metaApps");
const facebookRoutes = require("./facebook");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/accounts", accountRoutes);
router.use("/meta-apps", metaAppRoutes);
router.use("/facebook", facebookRoutes);

module.exports = router;
