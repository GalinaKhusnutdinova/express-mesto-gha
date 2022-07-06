const MONGO_DUPLICATE_ERROR_CODE = 11000;
const regexUrl = /https?:\/\/(www\.)?[-a-z0-9-._~:/?#@!$&'()*+,;=]+/gi;

module.exports = {
  MONGO_DUPLICATE_ERROR_CODE,
  regexUrl,
};
