const express = require("express");
const campaignController = require("../controllers/campaignController");
const { authenticateToken } = require("../middleware/auth");
const { apiLimiter, metaApiLimiter } = require("../middleware/rateLimiter");
const { validate, schemas } = require("../middleware/validation");

const router = express.Router();

router.use(authenticateToken);
router.use(apiLimiter);

router.post(
  "/",
  metaApiLimiter,
  validate(schemas.createCampaign),
  campaignController.createCampaign
);
router.get("/", campaignController.getCampaigns);
router.get("/:id", campaignController.getCampaign);
router.patch(
  "/:id/status",
  metaApiLimiter,
  validate(schemas.updateCampaignStatus),
  campaignController.updateCampaignStatus
);

module.exports = router;
