// config/facebook.js
module.exports = {
  APP_ID: process.env.META_APP_ID,
  CONFIG_ID: process.env.META_CONFIG_ID,
  APP_SECRET: process.env.META_APP_SECRET,
  REDIRECT_URI:
    process.env.META_REDIRECT_URI || `${process.env.API_URL}/facebook/callback`,
  META_APP_DB_ID: process.env.META_APP_DB_ID,
};
