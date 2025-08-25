const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Campaign = sequelize.define(
    "Campaign",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      metaAccountId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      metaCampaignId: {
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      objective: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"],
        defaultValue: "ACTIVE",
      },
      budgetType: {
        type: DataTypes.ENUM,
        values: ["DAILY", "LIFETIME"],
        defaultValue: "DAILY",
      },
      budget: DataTypes.DECIMAL(10, 2),
      startTime: DataTypes.DATE,
      endTime: DataTypes.DATE,
      configuration: DataTypes.JSON,
    },
    {
      tableName: "campaigns",
      timestamps: true,
    }
  );

  return Campaign;
};
