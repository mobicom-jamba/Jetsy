const express = require("express");
const metaAppController = require("../controllers/metaAppController");
const { authenticateToken } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimiter");
const { validate, schemas } = require("../middleware/validation");

const router = express.Router();

router.use(authenticateToken);
router.use(apiLimiter);

router.post(
  "/",
  validate(schemas.createMetaApp),
  metaAppController.createMetaApp
);
router.get("/", metaAppController.getMetaApps);
router.get("/:id", metaAppController.getMetaApp);
router.put(
  "/:id",
  validate(schemas.updateMetaApp),
  metaAppController.updateMetaApp
);
router.delete("/:id", metaAppController.deleteMetaApp);
router.post("/:id/verify", metaAppController.verifyMetaApp);

module.exports = router;
