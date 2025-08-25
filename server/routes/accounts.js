// server/routes/accounts.js
const express = require("express");
const accountController = require("../controllers/accountController");
const { authenticateToken } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(authenticateToken);
router.use(apiLimiter);

router.get("/", accountController.getConnectedAccounts);
router.get("/:id", accountController.getAccountDetails);
router.post("/:id/sync", accountController.syncAccount);
router.delete("/:id", accountController.disconnectAccount);

module.exports = router;
