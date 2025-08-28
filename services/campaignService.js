const { Campaign, AdSet, MetaAccount } = require("../models");
const MetaApiClient = require("./metaApiClient");
const logger = require("../utils/logger");

class CampaignService {
  constructor() {
    this.validObjectives = [
      "OUTCOME_AWARENESS",
      "OUTCOME_TRAFFIC",
      "OUTCOME_ENGAGEMENT",
      "OUTCOME_LEADS",
      "OUTCOME_APP_PROMOTION",
      "OUTCOME_SALES",
    ];
  }

  async createCampaign(userId, campaignData) {
    try {
      const metaAccount = await MetaAccount.findOne({
        where: { id: campaignData.metaAccountId, userId, isActive: true },
      });

      if (!metaAccount) {
        throw new Error("Meta account not found or inactive");
      }

      this.validateCampaignData(campaignData);

      const metaApi = new MetaApiClient(metaAccount.accessToken);
      const metaCampaignResult = await metaApi.createCampaign(
        metaAccount.accountId,
        campaignData
      );

      const campaign = await Campaign.create({
        userId,
        metaAccountId: metaAccount.id,
        metaCampaignId: metaCampaignResult.id,
        name: campaignData.name,
        objective: campaignData.objective,
        status: campaignData.status || "PAUSED",
        budgetType: campaignData.budgetType || "DAILY",
        budget: campaignData.budget,
        startTime: campaignData.startTime,
        endTime: campaignData.endTime,
        configuration: campaignData.configuration || {},
      });

      logger.info(`Campaign created: ${campaign.id}`);
      return { campaign, metaResponse: metaCampaignResult };
    } catch (error) {
      logger.error("Campaign creation failed:", error);
      throw new Error(`Campaign creation failed: ${error.message}`);
    }
  }

  async getCampaigns(userId, filters = {}) {
    const whereClause = { userId };

    if (filters.status) whereClause.status = filters.status;
    if (filters.metaAccountId)
      whereClause.metaAccountId = filters.metaAccountId;

    const campaigns = await Campaign.findAll({
      where: whereClause,
      include: [
        { model: MetaAccount, attributes: ["accountName", "currency"] },
        { model: AdSet, attributes: ["id", "name", "status"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    });

    return campaigns;
  }

  validateCampaignData(data) {
    if (!data.name || data.name.length < 1) {
      throw new Error("Campaign name is required");
    }

    if (!this.validObjectives.includes(data.objective)) {
      throw new Error(
        `Invalid objective. Must be one of: ${this.validObjectives.join(", ")}`
      );
    }

    if (data.budget && (data.budget < 1 || data.budget > 999999)) {
      throw new Error("Budget must be between $1 and $999,999");
    }
  }

  async updateCampaignStatus(campaignId, status, userId) {
    const campaign = await Campaign.findOne({
      where: { id: campaignId, userId },
      include: [{ model: MetaAccount }],
    });
    if (!campaign) throw new Error("Campaign not found");

    const accessToken = campaign.MetaAccount?.accessToken;
    if (!accessToken) throw new Error("Missing Meta access token");
    const api = new MetaApiClient(accessToken);
    await api.updateCampaignStatus(campaign.metaCampaignId, status);

    await campaign.update({ status });
    return campaign;
  }
}

module.exports = CampaignService;
