const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Metrics = sequelize.define(
    "Metrics",
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
      adSetId: DataTypes.UUID,
      adId: DataTypes.UUID,
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      impressions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      spend: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      conversions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      ctr: {
        type: DataTypes.DECIMAL(5, 4),
        defaultValue: 0,
      },
      cpc: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      cpm: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      roas: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: "metrics",
      timestamps: true,
      indexes: [{ fields: ["campaignId", "date"] }, { fields: ["date"] }],
    }
  );

  return Metrics;
};
