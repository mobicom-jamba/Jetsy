"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add metaAppId column to meta_accounts
    await queryInterface.addColumn("meta_accounts", "metaAppId", {
      type: Sequelize.UUID,
      allowNull: true, // Temporarily nullable for migration
      references: {
        model: "meta_apps",
        key: "id",
      },
    });

    // Add permissions column
    await queryInterface.addColumn("meta_accounts", "permissions", {
      type: Sequelize.JSON,
      defaultValue: [],
    });

    // Create index for metaAppId and accountId combination
    await queryInterface.addIndex("meta_accounts", ["metaAppId", "accountId"], {
      unique: true,
      name: "meta_accounts_app_account_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "meta_accounts",
      "meta_accounts_app_account_unique"
    );
    await queryInterface.removeColumn("meta_accounts", "permissions");
    await queryInterface.removeColumn("meta_accounts", "metaAppId");
  },
};
