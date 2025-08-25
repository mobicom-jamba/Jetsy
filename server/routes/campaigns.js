// server/routes/campaigns.js
const express = require("express");
const campaignController = require("../controllers/campaignController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.post("/", campaignController.createCampaign);
router.get("/", campaignController.getCampaigns);
router.get("/:id", campaignController.getCampaign);
router.patch("/:id/status", campaignController.updateCampaignStatus);

module.exports = router;
