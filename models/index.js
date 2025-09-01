// models/index.js
"use strict";
const { Sequelize, DataTypes } = require("sequelize");
const config =
  require("../config/database")[process.env.NODE_ENV || "development"];

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

const db = {};

// Load all models (case-sensitive on Linux!)
db.User = require("./User")(sequelize, DataTypes);
db.MetaApp = require("./MetaApp")(sequelize, DataTypes);
db.MetaAccount = require("./MetaAccount")(sequelize, DataTypes);
db.Campaign = require("./Campaign")(sequelize, DataTypes);
db.AdSet = require("./AdSet")(sequelize, DataTypes);
db.Ad = require("./Ad")(sequelize, DataTypes);
db.Metrics = require("./Metrics")(sequelize, DataTypes);
db.FacebookPage = require("./FacebookPage")(sequelize, DataTypes); // <-- ADD THIS

// Associations
db.User.hasMany(db.MetaApp, { foreignKey: "userId" });
db.MetaApp.belongsTo(db.User, { foreignKey: "userId" });

db.User.hasMany(db.MetaAccount, { foreignKey: "userId" });
db.MetaAccount.belongsTo(db.User, { foreignKey: "userId" });

db.MetaApp.hasMany(db.MetaAccount, { foreignKey: "metaAppId" });
db.MetaAccount.belongsTo(db.MetaApp, { foreignKey: "metaAppId" });

db.User.hasMany(db.Campaign, { foreignKey: "userId" });
db.Campaign.belongsTo(db.User, { foreignKey: "userId" });

db.MetaAccount.hasMany(db.Campaign, { foreignKey: "metaAccountId" });
db.Campaign.belongsTo(db.MetaAccount, { foreignKey: "metaAccountId" });

db.Campaign.hasMany(db.AdSet, { foreignKey: "campaignId" });
db.AdSet.belongsTo(db.Campaign, { foreignKey: "campaignId" });

db.AdSet.hasMany(db.Ad, { foreignKey: "adSetId" });
db.Ad.belongsTo(db.AdSet, { foreignKey: "adSetId" });

db.Campaign.hasMany(db.Metrics, { foreignKey: "campaignId" });
db.Metrics.belongsTo(db.Campaign, { foreignKey: "campaignId" });

// NEW: FacebookPage associations
db.FacebookPage.belongsTo(db.User, { foreignKey: "userId" });
db.User.hasMany(db.FacebookPage, { foreignKey: "userId" });

db.FacebookPage.belongsTo(db.MetaApp, { foreignKey: "metaAppId" });
db.MetaApp.hasMany(db.FacebookPage, { foreignKey: "metaAppId" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
