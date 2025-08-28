"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("campaigns", {
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
      },
      metaAccountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "meta_accounts",
          key: "id",
        },
      },
      metaCampaignId: {
        type: Sequelize.STRING,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      objective: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"],
        defaultValue: "ACTIVE",
      },
      budgetType: {
        type: Sequelize.ENUM,
        values: ["DAILY", "LIFETIME"],
        defaultValue: "DAILY",
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
      },
      startTime: {
        type: Sequelize.DATE,
      },
      endTime: {
        type: Sequelize.DATE,
      },
      configuration: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable("campaigns");
  },
};
