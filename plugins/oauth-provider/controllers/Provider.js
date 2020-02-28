"use strict";

/**
 * Provider.js controller
 *
 * @description: A set of functions called "actions" of the `oauth-provider` plugin.
 */
const _ = require("lodash");

const formatError = error => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] }
];

module.exports = {
  async find(ctx, next, { populate } = {}) {
    let data = await strapi.plugins["oauth-provider"].services.provider.fetch(
      ctx.query,
      polulate
    );
    ctx.send(data);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    let data = await strapi.query("provider", "oauth-provider").findOne({
      id
    });

    if (data) {
      console.log(data);
    }

    // Send 200 `ok`
    ctx.send(data);
  },

  async create(ctx) {
    const advanced = await strapi
      .store({
        environment: "",
        type: "plugin",
        name: "users-permissions",
        key: "advanced"
      })
      .get();

    const { provider_id, data, provider } = ctx.request.body;

    if (!provider_id) return ctx.badRequest("missing.email");

    let prov = await strapi
      .query("provider", "oauth-provider")
      .findOne({ provider, provider_id });

    try {
      if (!prov) {
        prov = await strapi.query("provider", "oauth-provider").create({
          provider,
          provider_id,
          data
        });
      }

      ctx.created(prov);
    } catch (error) {
      ctx.badRequest(null, formatError(error));
    }
  }
};
