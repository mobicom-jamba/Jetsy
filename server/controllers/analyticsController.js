// server/controllers/analyticsController.js
const AnalyticsService = require("../services/analyticsService");
const logger = require("../utils/logger");

class AnalyticsController {
  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async getMetrics(req, res) {
    try {
      const metrics = await this.analyticsService.getMetricsData(req.query);
      res.json({ metrics });
    } catch (error) {
      logger.error("Get metrics error:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  }

  async syncMetrics(req, res) {
    try {
      const { campaignId } = req.params;
      const dateRange = req.body.dateRange || {};

      const metrics = await this.analyticsService.syncCampaignMetrics(
        campaignId,
        dateRange
      );
      res.json({ metrics });
    } catch (error) {
      logger.error("Sync metrics error:", error);
      res.status(500).json({ error: "Failed to sync metrics" });
    }
  }
}

module.exports = new AnalyticsController();
