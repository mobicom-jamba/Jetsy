"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("adsets", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      campaignId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "campaigns",
          key: "id",
        },
      },
      metaAdSetId: {
        type: Sequelize.STRING,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["ACTIVE", "PAUSED", "DELETED"],
        defaultValue: "ACTIVE",
      },
      budgetType: {
        type: Sequelize.ENUM,
        values: ["DAILY", "LIFETIME"],
      },
      budget: {
        type: Sequelize.DECIMAL(10, 2),
      },
      bidStrategy: {
        type: Sequelize.STRING,
        defaultValue: "LOWEST_COST_WITHOUT_CAP",
      },
      targeting: {
        type: Sequelize.JSON,
      },
      placements: {
        type: Sequelize.JSON,
      },
      optimization: {
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
    await queryInterface.dropTable("adsets");
  },
};
