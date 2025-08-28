const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AdSet = sequelize.define(
    "AdSet",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      campaignId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      metaAdSetId: {
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["ACTIVE", "PAUSED", "DELETED"],
        defaultValue: "ACTIVE",
      },
      budgetType: {
        type: DataTypes.ENUM,
        values: ["DAILY", "LIFETIME"],
      },
      budget: DataTypes.DECIMAL(10, 2),
      bidStrategy: {
        type: DataTypes.STRING,
        defaultValue: "LOWEST_COST_WITHOUT_CAP",
      },
      targeting: DataTypes.JSON,
      placements: DataTypes.JSON,
      optimization: DataTypes.JSON,
    },
    {
      tableName: "adsets",
      timestamps: true,
    }
  );

  return AdSet;
};
