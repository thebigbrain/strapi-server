const _ = require("lodash");

module.exports = {
  async fetch(params, populate) {
    let data;

    if (_.has(params, "_q")) {
      // use core strapi query to search for users
      data = await strapi
        .query("provider", "oauth-provider")
        .search(params, populate);
    } else {
      data = await strapi
        .query("provider", "oauth-provider")
        .find(params, populate);
    }
    return data;
  }
};
