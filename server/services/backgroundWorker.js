// server/services/backgroundWorker.js
const cron = require("node-cron");
const { Campaign, MetaAccount, Metrics } = require("../models");
const MetaApiClient = require("./metaApiClient");
const AnalyticsService = require("./analyticsService");
const logger = require("../utils/logger");
const { Op } = require("sequelize");

class BackgroundWorker {
  constructor() {
    this.analyticsService = new AnalyticsService();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn("Background worker already running");
      return;
    }

    this.isRunning = true;
    logger.info("Starting background worker");

    cron.schedule("*/30 * * * *", () => {
      this.syncAllCampaignMetrics();
    });

    cron.schedule("0 2 * * *", () => {
      this.cleanOldData();
    });

    cron.schedule("0 * * * *", () => {
      this.checkTokenExpiration();
    });

    logger.info("Background worker scheduled tasks started");
  }

  stop() {
    this.isRunning = false;
    logger.info("Background worker stopped");
  }

  async syncAllCampaignMetrics() {
    try {
      logger.info("Starting metrics sync for all campaigns");

      const campaigns = await Campaign.findAll({
        where: {
          status: { [Op.in]: ["ACTIVE", "PAUSED"] },
        },
        include: [
          {
            model: MetaAccount,
            where: { isActive: true },
          },
        ],
        limit: 100,
      });

      const promises = campaigns.map(async (campaign) => {
        try {
          const dateRange = {
            since: new Date(Date.now() - 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            until: new Date().toISOString().split("T")[0],
          };

          await this.analyticsService.syncCampaignMetrics(
            campaign.id,
            dateRange
          );
          logger.debug(`Metrics synced for campaign ${campaign.id}`);
        } catch (error) {
          logger.error(
            `Failed to sync metrics for campaign ${campaign.id}:`,
            error
          );
        }
      });

      await Promise.allSettled(promises);
      logger.info(`Metrics sync completed for ${campaigns.length} campaigns`);
    } catch (error) {
      logger.error("Metrics sync job failed:", error);
    }
  }

  async cleanOldData() {
    try {
      logger.info("Starting data cleanup");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deletedMetrics = await Metrics.destroy({
        where: {
          date: { [Op.lt]: ninetyDaysAgo.toISOString().split("T")[0] },
        },
      });

      const deletedAccounts = await MetaAccount.destroy({
        where: {
          isActive: false,
          updatedAt: { [Op.lt]: thirtyDaysAgo },
        },
      });

      logger.info("Data cleanup completed", {
        deletedMetrics,
        deletedAccounts,
      });
    } catch (error) {
      logger.error("Data cleanup failed:", error);
    }
  }

  async checkTokenExpiration() {
    try {
      logger.info("Checking token expiration");

      const expiringAccounts = await MetaAccount.findAll({
        where: {
          isActive: true,
          tokenExpiresAt: {
            [Op.lt]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      for (const account of expiringAccounts) {
        logger.warn(`Token expiring soon for account ${account.id}`, {
          accountId: account.accountId,
          expiresAt: account.tokenExpiresAt,
        });
      }

      if (expiringAccounts.length === 0) {
        logger.debug("No tokens expiring soon");
      }
    } catch (error) {
      logger.error("Token expiration check failed:", error);
    }
  }

  async performHealthCheck() {
    try {
      const stats = {
        activeCampaigns: await Campaign.count({ where: { status: "ACTIVE" } }),
        activeAccounts: await MetaAccount.count({ where: { isActive: true } }),
        metricsToday: await Metrics.count({
          where: {
            date: new Date().toISOString().split("T")[0],
          },
        }),
      };

      logger.info("Health check completed", stats);
      return stats;
    } catch (error) {
      logger.error("Health check failed:", error);
      throw error;
    }
  }
}

const backgroundWorker = new BackgroundWorker();

if (process.env.NODE_ENV !== "test") {
  backgroundWorker.start();
}

module.exports = backgroundWorker;
