const { MetaApp } = require("../models");
const axios = require("axios");
const Helpers = require("../utils/helpers");
const logger = require("../utils/logger");

class MetaAppService {
  /**
   * Create new Meta app for user
   */
  async createMetaApp(userId, appData) {
    try {
      // Validate app credentials
      await this.validateAppCredentials(appData.appId, appData.appSecret);

      // Encrypt app secret
      const encryptedSecret = Helpers.encrypt(appData.appSecret);

      const metaApp = await MetaApp.create({
        userId,
        appId: appData.appId,
        appSecret: encryptedSecret,
        appName: appData.appName,
        webhookUrl: appData.webhookUrl,
        isActive: true,
        verificationStatus: "VERIFIED",
        lastVerifiedAt: new Date(),
      });

      logger.info(`Meta app created for user ${userId}: ${metaApp.id}`);
      return metaApp;
    } catch (error) {
      logger.error("Meta app creation failed:", error);
      throw error;
    }
  }

  /**
   * Get user's Meta apps
   */
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
      logger.error("Failed to fetch Meta apps:", error);
      throw error;
    }
  }

  /**
   * Update Meta app
   */
  async updateMetaApp(metaAppId, userId, updateData) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId },
      });

      if (!metaApp) {
        throw new Error("Meta app not found");
      }

      const updateFields = {};

      if (updateData.appName) {
        updateFields.appName = updateData.appName;
      }

      if (updateData.webhookUrl) {
        updateFields.webhookUrl = updateData.webhookUrl;
      }

      if (updateData.appSecret) {
        // Validate new credentials
        await this.validateAppCredentials(metaApp.appId, updateData.appSecret);
        updateFields.appSecret = Helpers.encrypt(updateData.appSecret);
        updateFields.verificationStatus = "VERIFIED";
        updateFields.lastVerifiedAt = new Date();
      }

      await metaApp.update(updateFields);
      return metaApp;
    } catch (error) {
      logger.error("Meta app update failed:", error);
      throw error;
    }
  }

  /**
   * Delete Meta app
   */
  async deleteMetaApp(metaAppId, userId) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId },
      });

      if (!metaApp) {
        throw new Error("Meta app not found");
      }

      // Deactivate instead of hard delete to preserve data integrity
      await metaApp.update({ isActive: false });

      // Also deactivate associated Meta accounts
      await MetaAccount.update(
        { isActive: false },
        { where: { metaAppId, userId } }
      );

      logger.info(`Meta app deleted for user ${userId}: ${metaAppId}`);
      return metaApp;
    } catch (error) {
      logger.error("Meta app deletion failed:", error);
      throw error;
    }
  }

  /**
   * Validate Meta app credentials
   */
  async validateAppCredentials(appId, appSecret) {
    try {
      const response = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            client_id: appId,
            client_secret: appSecret,
            grant_type: "client_credentials",
          },
        }
      );

      return response.data.access_token ? true : false;
    } catch (error) {
      if (error.response?.data?.error) {
        const metaError = error.response.data.error;
        throw new Error(`Invalid Meta app credentials: ${metaError.message}`);
      }
      throw new Error("Failed to validate Meta app credentials");
    }
  }

  /**
   * Get decrypted app secret
   */
  async getDecryptedSecret(metaAppId, userId) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId, isActive: true },
      });

      if (!metaApp) {
        throw new Error("Meta app not found");
      }

      return Helpers.decrypt(metaApp.appSecret);
    } catch (error) {
      logger.error("Failed to decrypt app secret:", error);
      throw error;
    }
  }
}

module.exports = MetaAppService;
