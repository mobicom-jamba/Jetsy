
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MetaApp = sequelize.define('MetaApp', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    appId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    appSecret: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    appName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    webhookUrl: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationStatus: {
      type: DataTypes.ENUM,
      values: ['PENDING', 'VERIFIED', 'FAILED'],
      defaultValue: 'PENDING'
    },
    lastVerifiedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'meta_apps',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'appId']
      }
    ]
  });

  return MetaApp;
};

