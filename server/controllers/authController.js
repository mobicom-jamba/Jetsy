const jwt = require('jsonwebtoken');
const { User, MetaAccount } = require('../models');
const OAuthService = require('../services/oauthService');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const user = await User.create({ email, password, name });

      const token = jwt.sign(
        { userId: user.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user || !await user.validatePassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await user.update({ lastLoginAt: new Date() });

      const token = jwt.sign(
        { userId: user.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async getMetaAuthUrl(req, res) {
    try {
      const oauthService = new OAuthService();
      const authUrl = oauthService.generateMetaAuthUrl(req.user.id);

      res.json({ authUrl });
    } catch (error) {
      logger.error('Meta auth URL generation error:', error);
      res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  }

  async handleMetaCallback(req, res) {
    try {
      const { code, state } = req.query;
      const [, userId] = state.split(':');

      const oauthService = new OAuthService();
      
      const tokenData = await oauthService.exchangeCodeForToken(code);
      const longLivedToken = await oauthService.getLongLivedToken(tokenData.access_token);
      const adAccounts = await oauthService.getAdAccounts(longLivedToken.access_token);

      for (const account of adAccounts) {
        await MetaAccount.findOrCreate({
          where: { userId, accountId: account.account_id },
          defaults: {
            userId,
            accountId: account.account_id,
            accountName: account.name,
            accessToken: longLivedToken.access_token,
            tokenExpiresAt: longLivedToken.expires_in 
              ? new Date(Date.now() + longLivedToken.expires_in * 1000) 
              : null,
            accountStatus: account.account_status,
            currency: account.currency,
            timezone: account.timezone_name,
            businessId: account.business?.id
          }
        });
      }

      res.redirect(`${process.env.CLIENT_URL}/dashboard?connected=true`);
    } catch (error) {
      logger.error('Meta callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/dashboard?error=connection_failed`);
    }
  }

  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'email', 'name', 'avatar'],
        include: [
          {
            model: MetaAccount,
            attributes: ['id', 'accountName', 'currency', 'accountStatus']
          }
        ]
      });

      res.json({ user });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  }
}

module.exports = new AuthController();

