"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meta_apps", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      appId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      appSecret: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      appName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      webhookUrl: {
        type: Sequelize.STRING,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationStatus: {
        type: Sequelize.ENUM("PENDING", "VERIFIED", "FAILED"),
        defaultValue: "PENDING",
      },
      lastVerifiedAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("meta_apps", ["userId", "appId"], {
      unique: true,
      name: "meta_apps_user_app_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("meta_apps");
  },
};
