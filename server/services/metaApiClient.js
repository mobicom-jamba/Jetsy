const axios = require("axios");
const logger = require("../utils/logger");

class MetaApiClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = "https://graph.facebook.com/v23.0";
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });

    this.client.interceptors.request.use((config) => {
      config.params = { ...config.params, access_token: this.accessToken };
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error("Meta API Error:", error.response?.data || error.message);
        if (error.response?.data?.error) {
          const { code, message, error_subcode } = error.response.data.error;
          throw new Error(
            `Meta API Error ${code}: ${message} (${error_subcode})`
          );
        }
        throw error;
      }
    );
  }

  async getAdAccounts() {
    const response = await this.client.get("/me/adaccounts", {
      params: {
        fields:
          "id,name,account_id,account_status,business,currency,timezone_name,amount_spent,balance",
      },
    });
    return response.data.data;
  }

  async createCampaign(accountId, campaignData) {
    const response = await this.client.post(`/${accountId}/campaigns`, {
      name: campaignData.name,
      objective: campaignData.objective,
      status: campaignData.status || "PAUSED",
      special_ad_categories: campaignData.specialAdCategories || [],
      ...(campaignData.budget && {
        daily_budget: Math.round(campaignData.budget * 100),
      }),
    });
    return response.data;
  }

  async getCampaignInsights(campaignId, dateRange = {}) {
    const params = {
      fields:
        "impressions,clicks,spend,ctr,cpc,cpm,conversions,cost_per_conversion,reach,frequency",
    };

    if (dateRange.since && dateRange.until) {
      params.time_range = JSON.stringify(dateRange);
    }

    const response = await this.client.get(`/${campaignId}/insights`, {
      params,
    });
    return response.data.data[0] || {};
  }

  async updateCampaignStatus(campaignId, status) {
    const response = await this.client.post(`/${campaignId}`, { status });
    return response.data;
  }
}

module.exports = MetaApiClient;
