// controllers/metaAppController.js
const MetaAppService = require("../services/metaAppService");
const Helpers = require("../utils/helpers");
const logger = require("../utils/logger");

class MetaAppController {
  constructor() {
    this.metaAppService = new MetaAppService();
  }

  // Arrow methods keep `this` bound when passed to Express
  createMetaApp = async (req, res) => {
    try {
      const metaApp = await this.metaAppService.createMetaApp(
        req.user.id,
        req.body
      );
      const { appSecret, ...safeMetaApp } = metaApp.toJSON(); // never return secret
      res.status(201).json({ metaApp: safeMetaApp });
    } catch (error) {
      logger.error("Create Meta app error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(400).json({ error: error.message });
    }
  };

  getMetaApps = async (req, res) => {
    try {
      const metaApps = await this.metaAppService.getUserMetaApps(req.user.id);
      res.json({ metaApps });
    } catch (error) {
      logger.error("Get Meta apps error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to fetch Meta apps" });
    }
  };

  getMetaApp = async (req, res) => {
    try {
      const { MetaApp } = require("../models");
      const metaApp = await MetaApp.findOne({
        where: { id: req.params.id, userId: req.user.id },
        attributes: [
          "id",
          "appId",
          "appName",
          "webhookUrl",
          "isVerified",
          "verificationStatus",
          "createdAt",
        ],
      });
      if (!metaApp)
        return res.status(404).json({ error: "Meta app not found" });
      res.json({ metaApp });
    } catch (error) {
      logger.error("Get Meta app error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to fetch Meta app" });
    }
  };

  updateMetaApp = async (req, res) => {
    try {
      const metaApp = await this.metaAppService.updateMetaApp(
        req.params.id,
        req.user.id,
        req.body
      );
      const { appSecret, ...safeMetaApp } = metaApp.toJSON();
      res.json({ metaApp: safeMetaApp });
    } catch (error) {
      logger.error("Update Meta app error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(400).json({ error: error.message });
    }
  };

  deleteMetaApp = async (req, res) => {
    try {
      await this.metaAppService.deleteMetaApp(req.params.id, req.user.id);
      res.json({ message: "Meta app deleted successfully" });
    } catch (error) {
      logger.error("Delete Meta app error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(400).json({ error: error.message });
    }
  };

  verifyMetaApp = async (req, res) => {
    try {
      const { MetaApp } = require("../models");
      const metaApp = await MetaApp.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });
      if (!metaApp)
        return res.status(404).json({ error: "Meta app not found" });

      const decryptedSecret = Helpers.decrypt(metaApp.appSecret);
      const isValid = await this.metaAppService.validateAppCredentials(
        metaApp.appId,
        decryptedSecret
      );

      if (isValid) {
        await metaApp.update({
          isVerified: true,
          verificationStatus: "VERIFIED",
          lastVerifiedAt: new Date(),
        });
        return res.json({
          message: "Meta app verified successfully",
          verified: true,
        });
      } else {
        await metaApp.update({
          isVerified: false,
          verificationStatus: "FAILED",
        });
        return res
          .status(400)
          .json({ error: "Invalid Meta app credentials", verified: false });
      }
    } catch (error) {
      logger.error("Verify Meta app error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Verification failed" });
    }
  };
}

module.exports = new MetaAppController();
