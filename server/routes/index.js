const express = require("express");
const authRoutes = require("./auth");
const campaignRoutes = require("./campaigns");
const analyticsRoutes = require("./analytics");
const accountRoutes = require("./accounts");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/accounts", accountRoutes);

module.exports = router;
