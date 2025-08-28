const express = require("express");
const accountController = require("../controllers/accountController");
const { authenticateToken } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(apiLimiter);

// Account routes with proper parameter syntax
router.get("/", accountController.getConnectedAccounts);
router.get("/:id", accountController.getAccountDetails); // Fixed: proper parameter syntax
router.post("/:id/sync", accountController.syncAccount); // Fixed: proper parameter syntax
router.delete("/:id", accountController.disconnectAccount); // Fixed: proper parameter syntax

module.exports = router;
