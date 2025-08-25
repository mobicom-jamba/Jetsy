// server/controllers/campaignController.js
const CampaignService = require('../services/campaignService');
const logger = require('../utils/logger');

class CampaignController {
  constructor() {
    this.campaignService = new CampaignService();
  }

  async createCampaign(req, res) {
    try {
      const result = await this.campaignService.createCampaign(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Campaign creation error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getCampaigns(req, res) {
    try {
      const campaigns = await this.campaignService.getCampaigns(req.user.id, req.query);
      res.json({ campaigns });
    } catch (error) {
      logger.error('Get campaigns error:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  }

  async getCampaign(req, res) {
    try {
      const { Campaign, MetaAccount, AdSet } = require('../models');
      
      const campaign = await Campaign.findOne({
        where: { id: req.params.id, userId: req.user.id },
        include: [
          { model: MetaAccount, attributes: ['accountName', 'currency'] },
          { model: AdSet }
        ]
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.json({ campaign });
    } catch (error) {
      logger.error('Get campaign error:', error);
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  }

  async updateCampaignStatus(req, res) {
    try {
      const { status } = req.body;
      const campaign = await this.campaignService.updateCampaignStatus(
        req.params.id, 
        status, 
        req.user.id
      );
      res.json({ campaign });
    } catch (error) {
      logger.error('Update campaign status error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CampaignController();
