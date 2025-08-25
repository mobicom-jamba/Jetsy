const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MetaAccount = sequelize.define(
    "MetaAccount",
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
      accountId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accessToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      refreshToken: DataTypes.TEXT,
      tokenExpiresAt: DataTypes.DATE,
      accountStatus: {
        type: DataTypes.STRING,
        defaultValue: "ACTIVE",
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "USD",
      },
      timezone: DataTypes.STRING,
      businessId: DataTypes.STRING,
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "meta_accounts",
      timestamps: true,
    }
  );

  return MetaAccount;
};
