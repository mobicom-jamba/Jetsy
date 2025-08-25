const { Metrics, Campaign, MetaAccount } = require("../models");
const MetaApiClient = require("./metaApiClient");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

class AnalyticsService {
  async syncCampaignMetrics(campaignId, dateRange = {}) {
    try {
      const campaign = await Campaign.findByPk(campaignId, {
        include: [{ model: MetaAccount }],
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      const metaApi = new MetaApiClient(campaign.MetaAccount.accessToken);
      const insights = await metaApi.getCampaignInsights(
        campaign.metaCampaignId,
        dateRange
      );

      if (!insights || Object.keys(insights).length === 0) {
        return null;
      }

      const metricsData = {
        campaignId,
        date: new Date().toISOString().split("T")[0],
        impressions: parseInt(insights.impressions) || 0,
        clicks: parseInt(insights.clicks) || 0,
        spend: parseFloat(insights.spend) || 0,
        conversions: parseInt(insights.conversions) || 0,
        ctr: parseFloat(insights.ctr) || 0,
        cpc: parseFloat(insights.cpc) || 0,
        cpm: parseFloat(insights.cpm) || 0,
      };

      const [metrics, created] = await Metrics.upsert(metricsData, {
        where: { campaignId, date: metricsData.date },
      });

      return metrics;
    } catch (error) {
      logger.error("Failed to sync campaign metrics:", error);
      throw new Error(`Failed to sync campaign metrics: ${error.message}`);
    }
  }

  async getMetricsData(filters = {}) {
    try {
      const whereClause = {};

      if (filters.campaignId) {
        whereClause.campaignId = filters.campaignId;
      }

      if (filters.campaignIds) {
        whereClause.campaignId = { [Op.in]: filters.campaignIds };
      }

      if (filters.dateRange) {
        whereClause.date = {
          [Op.between]: [filters.dateRange.start, filters.dateRange.end],
        };
      }

      const metrics = await Metrics.findAll({
        where: whereClause,
        include: [
          {
            model: Campaign,
            attributes: ["name", "objective", "status"],
            include: [
              {
                model: MetaAccount,
                attributes: ["accountName", "currency"],
              },
            ],
          },
        ],
        order: [["date", "DESC"]],
        limit: filters.limit || 100,
      });

      return metrics;
    } catch (error) {
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }
  }
}

module.exports = AnalyticsService;
