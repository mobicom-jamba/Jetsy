// services/metaAppService.js
const axios = require("axios");
const { MetaApp, MetaAccount } = require("../models"); // <-- import MetaAccount
const Helpers = require("../utils/helpers");
const logger = require("../utils/logger");

const GRAPH_VERSION = process.env.GRAPH_VERSION || "v18.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

class MetaAppService {
  async createMetaApp(userId, appData) {
    try {
      await this.validateAppCredentials(appData.appId, appData.appSecret);
      const encryptedSecret = Helpers.encrypt(appData.appSecret);

      const metaApp = await MetaApp.create({
        userId,
        appId: appData.appId,
        appSecret: encryptedSecret,
        appName: appData.appName,
        webhookUrl: appData.webhookUrl,
        isActive: true,
        isVerified: true, // keep in sync with verificationStatus
        verificationStatus: "VERIFIED",
        lastVerifiedAt: new Date(),
      });

      logger.info(`Meta app created for user ${userId}: ${metaApp.id}`);
      return metaApp;
    } catch (error) {
      logger.error("Meta app creation failed:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getUserMetaApps(userId) {
    try {
      const metaApps = await MetaApp.findAll({
        where: { userId, isActive: true },
        attributes: [
          "id",
          "appId",
          "appName",
          "isVerified",
          "verificationStatus",
          "createdAt",
        ],
      });
      return metaApps;
    } catch (error) {
      logger.error("Failed to fetch Meta apps:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async updateMetaApp(metaAppId, userId, updateData) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId },
      });
      if (!metaApp) throw new Error("Meta app not found");

      const updateFields = {};
      if (updateData.appName) updateFields.appName = updateData.appName;
      if (updateData.webhookUrl)
        updateFields.webhookUrl = updateData.webhookUrl;

      if (updateData.appSecret) {
        await this.validateAppCredentials(metaApp.appId, updateData.appSecret);
        updateFields.appSecret = Helpers.encrypt(updateData.appSecret);
        updateFields.isVerified = true;
        updateFields.verificationStatus = "VERIFIED";
        updateFields.lastVerifiedAt = new Date();
      }

      await metaApp.update(updateFields);
      return metaApp;
    } catch (error) {
      logger.error("Meta app update failed:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async deleteMetaApp(metaAppId, userId) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId },
      });
      if (!metaApp) throw new Error("Meta app not found");

      await metaApp.update({ isActive: false });

      // Deactivate linked accounts too
      await MetaAccount.update(
        { isActive: false },
        { where: { metaAppId, userId } }
      );

      logger.info(`Meta app deleted for user ${userId}: ${metaAppId}`);
      return metaApp;
    } catch (error) {
      logger.error("Meta app deletion failed:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async validateAppCredentials(appId, appSecret) {
    try {
      const response = await axios.get(`${GRAPH_BASE}/oauth/access_token`, {
        params: {
          client_id: appId,
          client_secret: appSecret,
          grant_type: "client_credentials",
        },
      });
      return !!response.data.access_token;
    } catch (error) {
      if (error.response?.data?.error) {
        const metaError = error.response.data.error;
        throw new Error(`Invalid Meta app credentials: ${metaError.message}`);
      }
      throw new Error("Failed to validate Meta app credentials");
    }
  }

  async getDecryptedSecret(metaAppId, userId) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId, isActive: true },
      });
      if (!metaApp) throw new Error("Meta app not found");
      return Helpers.decrypt(metaApp.appSecret);
    } catch (error) {
      logger.error("Failed to decrypt app secret:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = MetaAppService;
