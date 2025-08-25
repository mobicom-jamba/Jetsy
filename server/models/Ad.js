const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ad = sequelize.define(
    "Ad",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      adSetId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      metaAdId: {
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
      creative: DataTypes.JSON,
      adFormat: DataTypes.STRING,
    },
    {
      tableName: "ads",
      timestamps: true,
    }
  );

  return Ad;
};
