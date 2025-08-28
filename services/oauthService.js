// ================================================================
// SERVICES - UPDATED
// ================================================================

// server/services/oauthService.js (UPDATED)
const axios = require("axios");
const crypto = require("crypto");
const { User, MetaApp, MetaAccount } = require("../models");
const Helpers = require("../utils/helpers");
const logger = require("../utils/logger");

class OAuthService {
  /**
   * Generate Meta OAuth URL for user's app
   */
  async generateMetaAuthUrl(userId, metaAppId) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId, isActive: true },
      });

      if (!metaApp) {
        throw new Error("Meta app not found or inactive");
      }

      const state = crypto.randomBytes(32).toString("hex");
      const redirectUri = `${process.env.CLIENT_URL}/auth/callback`;

      const params = new URLSearchParams({
        client_id: metaApp.appId,
        redirect_uri: redirectUri,
        state: `${state}:${userId}:${metaAppId}`,
        scope: "ads_management,ads_read,read_insights,business_management",
        response_type: "code",
      });

      return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    } catch (error) {
      logger.error("OAuth URL generation failed:", error);
      throw error;
    }
  }

  /**
   * Exchange OAuth code for token using user's app credentials
   */
  async exchangeCodeForToken(code, metaAppId, userId) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId, isActive: true },
      });

      if (!metaApp) {
        throw new Error("Meta app not found");
      }

      const redirectUri = `${process.env.CLIENT_URL}/auth/callback`;

      const response = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            client_id: metaApp.appId,
            client_secret: metaApp.appSecret,
            redirect_uri: redirectUri,
            code: code,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error("OAuth token exchange failed:", error);
      throw new Error(
        `OAuth exchange failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Get long-lived token using user's app credentials
   */
  async getLongLivedToken(shortToken, metaAppId, userId) {
    try {
      const metaApp = await MetaApp.findOne({
        where: { id: metaAppId, userId, isActive: true },
      });

      if (!metaApp) {
        throw new Error("Meta app not found");
      }

      const response = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            grant_type: "fb_exchange_token",
            client_id: metaApp.appId,
            client_secret: metaApp.appSecret,
            fb_exchange_token: shortToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error("Long-lived token exchange failed:", error);
      throw new Error(`Long-lived token exchange failed: ${error.message}`);
    }
  }

  /**
   * Get ad accounts using access token
   */
  async getAdAccounts(accessToken) {
    try {
      const response = await axios.get(
        "https://graph.facebook.com/v18.0/me/adaccounts",
        {
          params: {
            access_token: accessToken,
            fields:
              "id,name,account_id,account_status,business,currency,timezone_name,amount_spent,balance",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      logger.error("Failed to fetch ad accounts:", error);
      throw new Error(`Failed to fetch ad accounts: ${error.message}`);
    }
  }

  /**
   * Save connected Meta account
   */
  async saveMetaAccount(userId, metaAppId, tokenData, accountData) {
    try {
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null;

      const metaAccount = await MetaAccount.create({
        userId,
        metaAppId,
        accountId: accountData.account_id,
        accountName: accountData.name,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
        accountStatus: accountData.account_status,
        currency: accountData.currency,
        timezone: accountData.timezone_name,
        businessId: accountData.business?.id,
        permissions: ["ads_management", "ads_read", "read_insights"],
      });

      return metaAccount;
    } catch (error) {
      logger.error("Failed to save Meta account:", error);
      throw error;
    }
  }
}

module.exports = OAuthService;
