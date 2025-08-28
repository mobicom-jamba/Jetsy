"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("metrics", {
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
      adSetId: {
        type: Sequelize.UUID,
        references: {
          model: "adsets",
          key: "id",
        },
      },
      adId: {
        type: Sequelize.UUID,
        references: {
          model: "ads",
          key: "id",
        },
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      impressions: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      spend: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      conversions: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      ctr: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0,
      },
      cpc: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      cpm: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      roas: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
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

    await queryInterface.addIndex("metrics", ["campaignId", "date"]);
    await queryInterface.addIndex("metrics", ["date"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("metrics");
  },
};

// # ================================================================
// # TROUBLESHOOTING COMMANDS
// # ================================================================

// # Check database connection
// psql $DATABASE_URL -c "SELECT version();"

// # List tables
// psql $DATABASE_URL -c "\dt"

// # Check if tables exist
// psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
