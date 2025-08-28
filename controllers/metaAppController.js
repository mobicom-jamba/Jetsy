const MetaAppService = require("../services/metaAppService");
const logger = require("../utils/logger");

class MetaAppController {
  constructor() {
    this.metaAppService = new MetaAppService();
  }

  async createMetaApp(req, res) {
    try {
      const metaApp = await this.metaAppService.createMetaApp(
        req.user.id,
        req.body
      );

      // Don't return the secret in response
      const { appSecret, ...safeMetaApp } = metaApp.toJSON();

      res.status(201).json({ metaApp: safeMetaApp });
    } catch (error) {
      logger.error("Create Meta app error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async getMetaApps(req, res) {
    try {
      const metaApps = await this.metaAppService.getUserMetaApps(req.user.id);
      res.json({ metaApps });
    } catch (error) {
      logger.error("Get Meta apps error:", error);
      res.status(500).json({ error: "Failed to fetch Meta apps" });
    }
  }

  async getMetaApp(req, res) {
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

      if (!metaApp) {
        return res.status(404).json({ error: "Meta app not found" });
      }

      res.json({ metaApp });
    } catch (error) {
      logger.error("Get Meta app error:", error);
      res.status(500).json({ error: "Failed to fetch Meta app" });
    }
  }

  async updateMetaApp(req, res) {
    try {
      const metaApp = await this.metaAppService.updateMetaApp(
        req.params.id,
        req.user.id,
        req.body
      );

      const { appSecret, ...safeMetaApp } = metaApp.toJSON();
      res.json({ metaApp: safeMetaApp });
    } catch (error) {
      logger.error("Update Meta app error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMetaApp(req, res) {
    try {
      await this.metaAppService.deleteMetaApp(req.params.id, req.user.id);
      res.json({ message: "Meta app deleted successfully" });
    } catch (error) {
      logger.error("Delete Meta app error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async verifyMetaApp(req, res) {
    try {
      const { MetaApp } = require("../models");

      const metaApp = await MetaApp.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!metaApp) {
        return res.status(404).json({ error: "Meta app not found" });
      }

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

        res.json({ message: "Meta app verified successfully", verified: true });
      } else {
        await metaApp.update({
          isVerified: false,
          verificationStatus: "FAILED",
        });

        res
          .status(400)
          .json({ error: "Invalid Meta app credentials", verified: false });
      }
    } catch (error) {
      logger.error("Verify Meta app error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  }
}

module.exports = new MetaAppController();
