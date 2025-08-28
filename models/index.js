// server/models/index.js (UPDATED)
const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const User = require('./User')(sequelize);
const MetaApp = require('./MetaApp')(sequelize);
const MetaAccount = require('./MetaAccount')(sequelize);
const Campaign = require('./Campaign')(sequelize);
const AdSet = require('./AdSet')(sequelize);
const Ad = require('./Ad')(sequelize);
const Metrics = require('./Metrics')(sequelize);

// Define associations
User.hasMany(MetaApp, { foreignKey: 'userId' });
MetaApp.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MetaAccount, { foreignKey: 'userId' });
MetaAccount.belongsTo(User, { foreignKey: 'userId' });

MetaApp.hasMany(MetaAccount, { foreignKey: 'metaAppId' });
MetaAccount.belongsTo(MetaApp, { foreignKey: 'metaAppId' });

User.hasMany(Campaign, { foreignKey: 'userId' });
Campaign.belongsTo(User, { foreignKey: 'userId' });

MetaAccount.hasMany(Campaign, { foreignKey: 'metaAccountId' });
Campaign.belongsTo(MetaAccount, { foreignKey: 'metaAccountId' });

Campaign.hasMany(AdSet, { foreignKey: 'campaignId' });
AdSet.belongsTo(Campaign, { foreignKey: 'campaignId' });

AdSet.hasMany(Ad, { foreignKey: 'adSetId' });
Ad.belongsTo(AdSet, { foreignKey: 'adSetId' });

Campaign.hasMany(Metrics, { foreignKey: 'campaignId' });
Metrics.belongsTo(Campaign, { foreignKey: 'campaignId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  MetaApp,
  MetaAccount,
  Campaign,
  AdSet,
  Ad,
  Metrics
};
