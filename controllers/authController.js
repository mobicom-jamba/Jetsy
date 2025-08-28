// server/controllers/authController.js (UPDATED)
const jwt = require("jsonwebtoken");
const { User, MetaApp, MetaAccount } = require("../models");
const OAuthService = require("../services/oauthService");
const logger = require("../utils/logger");

class AuthController {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const user = await User.create({ email, password, name });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      logger.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await user.update({ lastLoginAt: new Date() });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  async getMetaAuthUrl(req, res) {
    try {
      const { metaAppId } = req.query;

      if (!metaAppId) {
        return res.status(400).json({ error: "Meta app ID is required" });
      }

      const oauthService = new OAuthService();
      const authUrl = await oauthService.generateMetaAuthUrl(
        req.user.id,
        metaAppId
      );

      res.json({ authUrl });
    } catch (error) {
      logger.error("Meta auth URL generation error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async handleMetaCallback(req, res) {
    try {
      const { code, state } = req.query;

      if (!code || !state) {
        return res.redirect(
          `${process.env.CLIENT_URL}/dashboard?error=invalid_request`
        );
      }

      const [, userId, metaAppId] = state.split(":");

      if (!userId || !metaAppId) {
        return res.redirect(
          `${process.env.CLIENT_URL}/dashboard?error=invalid_state`
        );
      }

      const oauthService = new OAuthService();

      const tokenData = await oauthService.exchangeCodeForToken(
        code,
        metaAppId,
        userId
      );
      const longLivedToken = await oauthService.getLongLivedToken(
        tokenData.access_token,
        metaAppId,
        userId
      );
      const adAccounts = await oauthService.getAdAccounts(
        longLivedToken.access_token
      );

      for (const account of adAccounts) {
        await oauthService.saveMetaAccount(
          userId,
          metaAppId,
          longLivedToken,
          account
        );
      }

      res.redirect(
        `${process.env.CLIENT_URL}/dashboard?connected=true&accounts=${adAccounts.length}`
      );
    } catch (error) {
      logger.error("Meta callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/dashboard?error=connection_failed`
      );
    }
  }

  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "email", "name", "avatar", "createdAt"],
        include: [
          {
            model: MetaApp,
            attributes: ["id", "appName", "isVerified", "createdAt"],
            where: { isActive: true },
            required: false,
          },
          {
            model: MetaAccount,
            attributes: ["id", "accountName", "currency", "accountStatus"],
            where: { isActive: true },
            required: false,
          },
        ],
      });

      res.json({ user });
    } catch (error) {
      logger.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  }
}

module.exports = new AuthController();
