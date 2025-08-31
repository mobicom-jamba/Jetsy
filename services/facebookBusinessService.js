const axios = require("axios");
const crypto = require("crypto");
const { MetaAccount, FacebookPage } = require("../models");
const Helpers = require("../utils/helpers");
const logger = require("../utils/logger");
const FB = require("../config/facebook");

class FacebookBusinessService {
  generateBusinessConfigAuthUrl = async (userId) => {
    try {
      if (!FB.APP_ID || !FB.CONFIG_ID) {
        throw new Error("Meta APP_ID / CONFIG_ID not configured");
      }

      const state = crypto.randomBytes(32).toString("hex");
      const encodedState = Buffer.from(
        JSON.stringify({ userId, timestamp: Date.now(), nonce: state })
      ).toString("base64");

      const params = new URLSearchParams({
        client_id: FB.APP_ID,
        config_id: FB.CONFIG_ID,
        redirect_uri: FB.REDIRECT_URI,
        state: encodedState,
        response_type: "code",
      });

      console.log("params.toString: ---------------> ", params.toString());

      return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
    } catch (error) {
      logger.error("Business Config OAuth URL generation failed:", error);
      throw error;
    }
  };

  handleBusinessConfigCallback = async (code, state) => {
    try {
      if (!FB.APP_ID || !FB.APP_SECRET) {
        throw new Error("Meta APP_ID / APP_SECRET not configured");
      }

      // Decode & validate state
      let stateData;
      try {
        stateData = JSON.parse(Buffer.from(state, "base64").toString());
      } catch {
        throw new Error("Invalid OAuth state");
      }
      const { userId, timestamp } = stateData || {};
      if (!userId) throw new Error("Missing OAuth state fields");
      if (Date.now() - Number(timestamp) > 300000) {
        throw new Error("OAuth state expired");
      }

      // Exchange short-lived token
      const tokenRes = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            client_id: FB.APP_ID,
            client_secret: FB.APP_SECRET, // already secret, no need to decrypt
            redirect_uri: FB.REDIRECT_URI,
            code,
          },
        }
      );
      const { access_token } = tokenRes.data;

      // Exchange for long-lived token
      const longRes = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            grant_type: "fb_exchange_token",
            client_id: FB.APP_ID,
            client_secret: FB.APP_SECRET,
            fb_exchange_token: access_token,
          },
        }
      );
      const longLivedToken = longRes.data.access_token;

      // Fetch resources
      const [pages, adAccounts] = await Promise.all([
        this.getUserPages(longLivedToken),
        this.getUserAdAccounts(longLivedToken),
      ]);

      // Persist; use a single MetaApp row if provided
      const metaAppId = FB.META_APP_DB_ID || null;
      const savedPages = await this.saveUserPages(userId, metaAppId, pages);
      const savedAccounts = await this.saveUserAdAccounts(
        userId,
        metaAppId,
        adAccounts
      );

      return {
        pages: savedPages,
        adAccounts: savedAccounts,
        accessToken: longLivedToken,
      };
    } catch (error) {
      logger.error("Business Config callback handling failed:", error);
      throw error;
    }
  };

  getUserPages = async (accessToken) => {
    try {
      const res = await axios.get(
        "https://graph.facebook.com/v18.0/me/accounts",
        {
          params: {
            access_token: accessToken,
            fields: "id,name,category,link,fan_count,access_token,permissions",
          },
        }
      );
      return res.data.data || [];
    } catch (error) {
      logger.error("Failed to fetch user pages:", error);
      throw error;
    }
  };

  getUserAdAccounts = async (accessToken) => {
    try {
      const res = await axios.get(
        "https://graph.facebook.com/v18.0/me/adaccounts",
        {
          params: {
            access_token: accessToken,
            fields:
              "id,name,account_id,account_status,business,currency,timezone_name,amount_spent,balance,capabilities",
          },
        }
      );
      return res.data.data || [];
    } catch (error) {
      logger.error("Failed to fetch ad accounts:", error);
      throw error;
    }
  };

  saveUserPages = async (userId, metaAppId, pages) => {
    const saved = [];
    for (const p of pages) {
      try {
        const [row, created] = await FacebookPage.findOrCreate({
          where: { pageId: p.id, userId, ...(metaAppId && { metaAppId }) },
          defaults: {
            userId,
            metaAppId,
            pageId: p.id,
            pageName: p.name,
            pageAccessToken: p.access_token,
            pageCategory: p.category,
            pageUrl: p.link,
            fanCount: p.fan_count || 0,
            permissions: p.permissions || [],
            isActive: true,
            lastSyncAt: new Date(),
          },
        });
        if (!created) {
          await row.update({
            pageName: p.name,
            pageAccessToken: p.access_token,
            pageCategory: p.category,
            pageUrl: p.link,
            fanCount: p.fan_count || 0,
            permissions: p.permissions || [],
            lastSyncAt: new Date(),
          });
        }
        saved.push(row);
      } catch (e) {
        logger.error(`Failed to save page ${p.id}:`, e);
      }
    }
    return saved;
  };

  saveUserAdAccounts = async (userId, metaAppId, adAccounts) => {
    const saved = [];
    for (const a of adAccounts) {
      try {
        const expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000);
        const [row, created] = await MetaAccount.findOrCreate({
          where: {
            accountId: a.account_id,
            userId,
            ...(metaAppId && { metaAppId }),
          },
          defaults: {
            userId,
            metaAppId,
            accountId: a.account_id,
            accountName: a.name,
            accessToken: "placeholder",
            tokenExpiresAt: expiresAt,
            accountStatus: a.account_status,
            currency: a.currency,
            timezone: a.timezone_name,
            businessId: a.business?.id,
            permissions: a.capabilities || [],
            isActive: true,
          },
        });
        if (!created) {
          await row.update({
            accountName: a.name,
            accountStatus: a.account_status,
            currency: a.currency,
            timezone: a.timezone_name,
            businessId: a.business?.id,
            permissions: a.capabilities || [],
            lastSyncAt: new Date(),
          });
        }
        saved.push(row);
      } catch (e) {
        logger.error(`Failed to save ad account ${a.account_id}:`, e);
      }
    }
    return saved;
  };

  getPageInsights = async (
    pageId,
    accessToken,
    metrics = ["page_views", "page_fans"],
    period = "day"
  ) => {
    try {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000)
        .toISOString()
        .split("T")[0];
      const until = new Date().toISOString().split("T")[0];
      const res = await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}/insights`,
        {
          params: {
            access_token: accessToken,
            metric: metrics.join(","),
            period,
            since,
            until,
          },
        }
      );
      return res.data.data || [];
    } catch (error) {
      logger.error("Failed to fetch page insights:", error);
      throw error;
    }
  };

  createPagePost = async (
    pageId,
    pageAccessToken,
    message,
    imageUrl = null
  ) => {
    try {
      const payload = { access_token: pageAccessToken, message };
      if (imageUrl) payload.picture = imageUrl;
      const res = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        payload
      );
      return res.data;
    } catch (error) {
      logger.error("Failed to create page post:", error);
      throw error;
    }
  };

  syncUserData = async (userId, metaAppId) => {
    try {
      // if metaAppId is static, pass FB.META_APP_DB_ID from controller
      const where = { userId, isActive: true, ...(metaAppId && { metaAppId }) };
      const pages = await FacebookPage.findAll({ where });

      const results = await Promise.allSettled(
        pages.map(async (page) => {
          try {
            const res = await axios.get(
              `https://graph.facebook.com/v18.0/${page.pageId}`,
              {
                params: {
                  access_token: page.pageAccessToken,
                  fields: "id,name,category,link,fan_count",
                },
              }
            );
            await page.update({
              pageName: res.data.name,
              pageCategory: res.data.category,
              pageUrl: res.data.link,
              fanCount: res.data.fan_count || 0,
              lastSyncAt: new Date(),
            });
            return page;
          } catch (e) {
            logger.error(`Failed to sync page ${page.pageId}:`, e);
            return null;
          }
        })
      );

      return results
        .filter((r) => r.status === "fulfilled" && r.value)
        .map((r) => r.value);
    } catch (error) {
      logger.error("Failed to sync user data:", error);
      throw error;
    }
  };
}

module.exports = FacebookBusinessService;
