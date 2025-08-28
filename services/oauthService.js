const axios = require("axios");
const crypto = require("crypto");
const { User, MetaAccount } = require("../models");
const logger = require("../utils/logger");

class OAuthService {
  constructor() {
    this.metaAppId = process.env.META_APP_ID;
    this.metaAppSecret = process.env.META_APP_SECRET;
    this.redirectUri = process.env.META_REDIRECT_URI;
  }

  generateMetaAuthUrl(userId) {
    const state = crypto.randomBytes(32).toString("hex");

    const params = new URLSearchParams({
      client_id: this.metaAppId,
      redirect_uri: this.redirectUri,
      state: `${state}:${userId}`,
      scope: "ads_management,ads_read,read_insights,business_management",
      response_type: "code",
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            client_id: this.metaAppId,
            client_secret: this.metaAppSecret,
            redirect_uri: this.redirectUri,
            code: code,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error("OAuth token exchange failed:", error);
      throw new Error(`OAuth exchange failed: ${error.message}`);
    }
  }

  async getLongLivedToken(shortToken) {
    try {
      const response = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            grant_type: "fb_exchange_token",
            client_id: this.metaAppId,
            client_secret: this.metaAppSecret,
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

  async getAdAccounts(accessToken) {
    try {
      const response = await axios.get(
        "https://graph.facebook.com/v18.0/me/adaccounts",
        {
          params: {
            access_token: accessToken,
            fields:
              "id,name,account_id,account_status,business,currency,timezone_name",
          },
        }
      );

      return response.data.data;
    } catch (error) {
      logger.error("Failed to fetch ad accounts:", error);
      throw new Error(`Failed to fetch ad accounts: ${error.message}`);
    }
  }
}

module.exports = OAuthService;
