"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meta_accounts", {
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
      accountId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      accountName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      accessToken: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      refreshToken: {
        type: Sequelize.TEXT,
      },
      tokenExpiresAt: {
        type: Sequelize.DATE,
      },
      accountStatus: {
        type: Sequelize.STRING,
        defaultValue: "ACTIVE",
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: "USD",
      },
      timezone: {
        type: Sequelize.STRING,
      },
      businessId: {
        type: Sequelize.STRING,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("meta_accounts");
  },
};
