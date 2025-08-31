// controllers/facebookController.js
const { FacebookPage, MetaApp } = require("../models");
const logger = require("../utils/logger");
const FacebookBusinessService = require("../services/facebookBusinessService");
const FB = require("../config/facebook");

class FacebookController {
  facebookService = new FacebookBusinessService();

  getAuthUrl = async (req, res) => {
    try {
      const authUrl = await this.facebookService.generateBusinessConfigAuthUrl(
        req.user.id
      );
      res.json({ authUrl });
    } catch (error) {
      logger.error("Get Facebook auth URL error:", error);
      res.status(500).json({ error: error.message });
    }
  };

  handleCallback = async (req, res) => {
    try {
      const { state, error } = req.query;
      if (error) {
        logger.error("Facebook OAuth error:", error);
        return res.redirect(
          `${
            process.env.CLIENT_URL
          }/dashboard?error=oauth_error&details=${encodeURIComponent(error)}`
        );
      }
      if (!state) {
        return res.redirect(
          `${process.env.CLIENT_URL}/dashboard?error=invalid_request`
        );
      }

      const result = await this.facebookService.handleBusinessConfigCallback(
        state
      );

      const params = new URLSearchParams({
        connected: "true",
        pages: String(result.pages.length ?? 0),
        accounts: String(result.adAccounts.length ?? 0),
      });
      res.redirect(`${process.env.CLIENT_URL}/dashboard?${params.toString()}`);
    } catch (error) {
      logger.error("Facebook callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/dashboard?error=connection_failed`
      );
    }
  };

  getConnectedPages = async (req, res) => {
    try {
      const pages = await FacebookPage.findAll({
        where: { userId: req.user.id, isActive: true },
        include: [{ model: MetaApp, attributes: ["id", "appName", "appId"] }],
        order: [["createdAt", "DESC"]],
      });
      res.json({ pages });
    } catch (error) {
      logger.error("Get connected pages error:", error);
      res.status(500).json({ error: "Failed to fetch connected pages" });
    }
  };

  getPageInsights = async (req, res) => {
    try {
      const { pageId } = req.params;
      const { metrics, period } = req.query;
      const page = await FacebookPage.findOne({
        where: { pageId, userId: req.user.id, isActive: true },
      });
      if (!page) return res.status(404).json({ error: "Page not found" });

      const insights = await this.facebookService.getPageInsights(
        pageId,
        page.pageAccessToken,
        metrics ? String(metrics).split(",") : undefined,
        period
      );
      res.json({ insights });
    } catch (error) {
      logger.error("Get page insights error:", error);
      res.status(500).json({ error: "Failed to fetch page insights" });
    }
  };

  createPagePost = async (req, res) => {
    try {
      const { pageId } = req.params;
      const { message, imageUrl } = req.body;
      const page = await FacebookPage.findOne({
        where: { pageId, userId: req.user.id, isActive: true },
      });
      if (!page) return res.status(404).json({ error: "Page not found" });

      const post = await this.facebookService.createPagePost(
        pageId,
        page.pageAccessToken,
        message,
        imageUrl
      );
      res.json({ post });
    } catch (error) {
      logger.error("Create page post error:", error);
      res.status(500).json({ error: "Failed to create page post" });
    }
  };

  // Keep your route as /pages/:pageId/sync; use the singleton MetaApp ID if your service filters by metaAppId
  syncPageData = async (req, res) => {
    try {
      const { pageId } = req.params;
      const page = await FacebookPage.findOne({
        where: { pageId, userId: req.user.id, isActive: true },
      });
      if (!page) return res.status(404).json({ error: "Page not found" });

      const syncedPages = await this.facebookService.syncUserData(
        req.user.id,
        FB.META_APP_DB_ID || page.metaAppId || null
      );

      res.json({
        message: "Sync completed",
        syncedPages: syncedPages?.length || 0,
      });
    } catch (error) {
      logger.error("Sync page data error:", error);
      res.status(500).json({ error: "Failed to sync page data" });
    }
  };

  disconnectPage = async (req, res) => {
    try {
      const { pageId } = req.params;
      const page = await FacebookPage.findOne({
        where: { pageId, userId: req.user.id },
      });
      if (!page) return res.status(404).json({ error: "Page not found" });
      await page.update({ isActive: false });
      res.json({ message: "Page disconnected successfully" });
    } catch (error) {
      logger.error("Disconnect page error:", error);
      res.status(500).json({ error: "Failed to disconnect page" });
    }
  };
}

module.exports = new FacebookController();
