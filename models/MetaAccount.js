// server/models/MetaAccount.js (UPDATED)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MetaAccount = sequelize.define('MetaAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    metaAppId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'meta_apps', key: 'id' }
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refreshToken: DataTypes.TEXT,
    tokenExpiresAt: DataTypes.DATE,
    accountStatus: {
      type: DataTypes.STRING,
      defaultValue: 'ACTIVE'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    timezone: DataTypes.STRING,
    businessId: DataTypes.STRING,
    permissions: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'meta_accounts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['metaAppId', 'accountId']
      }
    ]
  });

  return MetaAccount;
};

