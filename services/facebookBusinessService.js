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

      logger.info("Generated Facebook OAuth URL", {
        params: params.toString(),
        redirectUri: FB.REDIRECT_URI,
        configId: FB.CONFIG_ID,
      });

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

      logger.info("Processing Facebook callback", {
        codeLength: code?.length,
        stateLength: state?.length,
      });

      let stateData;
      try {
        stateData = JSON.parse(Buffer.from(state, "base64").toString());
        logger.info("Decoded state data", {
          userId: stateData.userId,
          timestamp: stateData.timestamp,
          age: Date.now() - Number(stateData.timestamp),
        });
      } catch (decodeError) {
        logger.error("State decode error:", decodeError);
        throw new Error("Invalid OAuth state");
      }

      const { userId, timestamp } = stateData || {};
      if (!userId) throw new Error("Missing OAuth state fields");
      if (Date.now() - Number(timestamp) > 300000) {
        throw new Error("OAuth state expired");
      }

      // Exchange short-lived token
      logger.info("Exchanging code for access token");
      const tokenRes = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            client_id: FB.APP_ID,
            client_secret: FB.APP_SECRET,
            redirect_uri: FB.REDIRECT_URI,
            code,
          },
        }
      );

      if (!tokenRes.data.access_token) {
        logger.error("No access token in response", tokenRes.data);
        throw new Error("Failed to obtain access token");
      }

      const { access_token } = tokenRes.data;
      logger.info("Successfully obtained short-lived token");

      // Exchange for long-lived token
      logger.info("Exchanging for long-lived token");
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

      if (!longRes.data.access_token) {
        logger.error("No long-lived token in response", longRes.data);
        throw new Error("Failed to obtain long-lived token");
      }

      const longLivedToken = longRes.data.access_token;
      logger.info("Successfully obtained long-lived token");

      // Fetch resources
      logger.info("Fetching user resources");
      const [pages, adAccounts] = await Promise.allSettled([
        this.getUserPages(longLivedToken),
        this.getUserAdAccounts(longLivedToken),
      ]);

      const pagesResult = pages.status === "fulfilled" ? pages.value : [];
      const adAccountsResult =
        adAccounts.status === "fulfilled" ? adAccounts.value : [];

      if (pages.status === "rejected") {
        logger.warn("Failed to fetch pages:", pages.reason);
      }
      if (adAccounts.status === "rejected") {
        logger.warn("Failed to fetch ad accounts:", adAccounts.reason);
      }

      logger.info("Resources fetched", {
        pagesCount: pagesResult.length,
        adAccountsCount: adAccountsResult.length,
      });

      // Persist; use a single MetaApp row if provided
      const metaAppId = FB.META_APP_DB_ID || null;
      const savedPages = await this.saveUserPages(
        userId,
        metaAppId,
        pagesResult
      );
      const savedAccounts = await this.saveUserAdAccounts(
        userId,
        metaAppId,
        adAccountsResult
      );

      logger.info("Successfully saved user data", {
        savedPagesCount: savedPages.length,
        savedAccountsCount: savedAccounts.length,
      });

      return {
        pages: savedPages,
        adAccounts: savedAccounts,
        accessToken: longLivedToken,
      };
    } catch (error) {
      logger.error("Business Config callback handling failed:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      throw error;
    }
  };

  getUserPages = async (accessToken) => {
    try {
      logger.info("Fetching user pages");
      const res = await axios.get(
        "https://graph.facebook.com/v18.0/me/accounts",
        {
          params: {
            access_token: accessToken,
            fields: "id,name,category,link,fan_count,access_token,permissions",
          },
        }
      );

      const pages = res.data.data || [];
      logger.info(`Fetched ${pages.length} pages`);
      return pages;
    } catch (error) {
      logger.error("Failed to fetch user pages:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  };

  getUserAdAccounts = async (accessToken) => {
    try {
      logger.info("Fetching user ad accounts");
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

      const accounts = res.data.data || [];
      logger.info(`Fetched ${accounts.length} ad accounts`);
      return accounts;
    } catch (error) {
      logger.error("Failed to fetch ad accounts:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  };

  saveUserPages = async (userId, metaAppId, pages) => {
    const saved = [];
    logger.info(`Saving ${pages.length} pages for user ${userId}`);

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
            isActive: true, // Reactivate if previously deactivated
            lastSyncAt: new Date(),
          });
        }

        saved.push(row);
        logger.info(
          `${created ? "Created" : "Updated"} page: ${p.name} (${p.id})`
        );
      } catch (e) {
        logger.error(`Failed to save page ${p.id}:`, {
          error: e.message,
          pageData: { id: p.id, name: p.name },
        });
      }
    }

    logger.info(`Successfully saved ${saved.length} pages`);
    return saved;
  };

  saveUserAdAccounts = async (userId, metaAppId, adAccounts) => {
    const saved = [];
    logger.info(`Saving ${adAccounts.length} ad accounts for user ${userId}`);

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
            accessToken: "placeholder", // You might want to store the actual token
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
            isActive: true, // Reactivate if previously deactivated
            lastSyncAt: new Date(),
          });
        }

        saved.push(row);
        logger.info(
          `${created ? "Created" : "Updated"} ad account: ${a.name} (${
            a.account_id
          })`
        );
      } catch (e) {
        logger.error(`Failed to save ad account ${a.account_id}:`, {
          error: e.message,
          accountData: { id: a.account_id, name: a.name },
        });
      }
    }

    logger.info(`Successfully saved ${saved.length} ad accounts`);
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

      logger.info("Fetching page insights", {
        pageId,
        metrics,
        period,
        since,
        until,
      });

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
      logger.error("Failed to fetch page insights:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
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

      logger.info("Creating page post", {
        pageId,
        hasImage: !!imageUrl,
        messageLength: message?.length,
      });

      const res = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        payload
      );

      logger.info("Page post created successfully", { postId: res.data.id });
      return res.data;
    } catch (error) {
      logger.error("Failed to create page post:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  };

  syncUserData = async (userId, metaAppId) => {
    try {
      logger.info("Starting user data sync", { userId, metaAppId });

      const where = { userId, isActive: true, ...(metaAppId && { metaAppId }) };
      const pages = await FacebookPage.findAll({ where });

      logger.info(`Found ${pages.length} pages to sync`);

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

            logger.info(`Synced page: ${page.pageName} (${page.pageId})`);
            return page;
          } catch (e) {
            logger.error(`Failed to sync page ${page.pageId}:`, {
              error: e.message,
              status: e.response?.status,
            });
            return null;
          }
        })
      );

      const syncedPages = results
        .filter((r) => r.status === "fulfilled" && r.value)
        .map((r) => r.value);

      logger.info(
        `Sync completed: ${syncedPages.length}/${pages.length} pages synced`
      );
      return syncedPages;
    } catch (error) {
      logger.error("Failed to sync user data:", error);
      throw error;
    }
  };
}

module.exports = FacebookBusinessService;
