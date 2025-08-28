// server/controllers/accountController.js
const { MetaAccount } = require("../models");
const MetaApiClient = require("../services/metaApiClient");
const logger = require("../utils/logger");

class AccountController {
  async getConnectedAccounts(req, res) {
    try {
      const accounts = await MetaAccount.findAll({
        where: { userId: req.user.id, isActive: true },
        attributes: [
          "id",
          "accountId",
          "accountName",
          "currency",
          "accountStatus",
          "createdAt",
        ],
      });

      res.json({ accounts });
    } catch (error) {
      logger.error("Get connected accounts error:", error);
      res.status(500).json({ error: "Failed to fetch connected accounts" });
    }
  }

  async getAccountDetails(req, res) {
    try {
      const account = await MetaAccount.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      const metaApi = new MetaApiClient(account.accessToken);
      const accountDetails = await metaApi.getAdAccounts();
      const currentAccount = accountDetails.find(
        (acc) => acc.account_id === account.accountId
      );

      res.json({
        account: {
          ...account.toJSON(),
          balance: currentAccount?.balance,
          amountSpent: currentAccount?.amount_spent,
        },
      });
    } catch (error) {
      logger.error("Get account details error:", error);
      res.status(500).json({ error: "Failed to fetch account details" });
    }
  }

  async syncAccount(req, res) {
    try {
      const account = await MetaAccount.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
          isActive: true,
        },
      });

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      const metaApi = new MetaApiClient(account.accessToken);
      const accountDetails = await metaApi.getAdAccounts();
      const currentAccount = accountDetails.find(
        (acc) => acc.account_id === account.accountId
      );

      if (currentAccount) {
        await account.update({
          accountName: currentAccount.name,
          accountStatus: currentAccount.account_status,
          currency: currentAccount.currency,
          timezone: currentAccount.timezone_name,
        });
      }

      res.json({ account });
    } catch (error) {
      logger.error("Sync account error:", error);
      res.status(500).json({ error: "Failed to sync account" });
    }
  }

  async disconnectAccount(req, res) {
    try {
      const account = await MetaAccount.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      await account.update({ isActive: false });

      res.json({ message: "Account disconnected successfully" });
    } catch (error) {
      logger.error("Disconnect account error:", error);
      res.status(500).json({ error: "Failed to disconnect account" });
    }
  }
}

module.exports = new AccountController();
