const express = require("express");
const facebookController = require("../controllers/facebookController");
const { authenticateToken } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get(
  "/auth",
  authenticateToken,
  apiLimiter,
  facebookController.getAuthUrl
);
router.get("/callback", facebookController.handleCallback);

router.use(authenticateToken);
router.use(apiLimiter);

router.get("/pages", facebookController.getConnectedPages);
router.get("/pages/:pageId/insights", facebookController.getPageInsights);
router.post("/pages/:pageId/posts", facebookController.createPagePost);
router.post("/pages/:pageId/sync", facebookController.syncPageData);
router.delete("/pages/:pageId", facebookController.disconnectPage);

module.exports = router;
