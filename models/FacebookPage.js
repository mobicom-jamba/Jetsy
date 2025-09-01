module.exports = (sequelize, DataTypes) => {
  const FacebookPage = sequelize.define(
    "FacebookPage",
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
      metaAppId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "meta_apps", key: "id" },
      },
      pageId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pageName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pageAccessToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      pageCategory: {
        type: DataTypes.STRING,
      },
      pageUrl: {
        type: DataTypes.STRING,
      },
      fanCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastSyncAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "facebook_pages",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["metaAppId", "pageId"] },
        { fields: ["userId"] },
      ],
    }
  );

  return FacebookPage;
};
