const basicAuth = require('express-basic-auth');

// Basic auth
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const APP_NAME = process.env.GCLOUD_STORAGE_BUCKET;

const auth = basicAuth({
  users: { [USER]: PASSWORD },
  challenge: true,
  realm: APP_NAME
});

module.exports = {
  auth
};
