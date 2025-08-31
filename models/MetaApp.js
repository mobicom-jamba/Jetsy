const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MetaApp = sequelize.define(
    "MetaApp",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      appId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      appSecret: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      configId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      appName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      appDomain: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      webhookUrl: {
        type: DataTypes.STRING,
      },
      businessConfigEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      supportedFeatures: {
        type: DataTypes.JSON,
        defaultValue: ["ads_management", "page_management", "insights"],
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationStatus: {
        type: DataTypes.ENUM,
        values: ["PENDING", "VERIFIED", "FAILED"],
        defaultValue: "PENDING",
      },
      lastVerifiedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "meta_apps",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["userId", "appId"] },
        { fields: ["configId"] },
      ],
    }
  );

  return MetaApp;
};
