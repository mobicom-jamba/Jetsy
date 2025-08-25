require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "username",
    password: process.env.DB_PASS || "password",
    database: process.env.DB_NAME || "jetsy_meta_ads_dev",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
