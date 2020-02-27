"use strict";

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const crypto = require("crypto");
const _ = require("lodash");
const grant = require("grant-koa");
const { sanitizeEntity } = require("strapi-utils");

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const formatError = error => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] }
];

module.exports = {
  async callback(ctx) {
    const provider = ctx.params.provider || "phone";
    const params = ctx.request.body;

    const store = await strapi.store({
      environment: "",
      type: "plugin",
      name: "users-permissions"
    });

    if (!_.get(await store.get({ key: "grant" }), [provider, "enabled"])) {
      return ctx.badRequest(
        null,
        formatError({
          id: "provider.disabled",
          message: "This provider is disabled."
        })
      );
    }

    // Connect the user with the third-party provider.
    let user, error;
    try {
      [user, error] = await strapi.plugins[
        "users-permissions"
      ].services.providers.connect(provider, ctx.query);
    } catch ([data, error, redirection, errType]) {
      if (data != null) {
        return ctx.redirect(`${ctx.origin}${redirection}`);
      }
      return ctx.badRequest(null, error === "array" ? error[0] : error);
    }

    if (!user) {
      if (error)
        return ctx.badRequest(null, error === "array" ? error[0] : error);
    }

    ctx.send({
      jwt: strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id
      }),
      user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
        model: strapi.query("user", "users-permissions").model
      })
    });
  },

  async connect(ctx, next) {
    const grantConfig = await strapi
      .store({
        environment: "",
        type: "plugin",
        name: "users-permissions",
        key: "grant"
      })
      .get();

    const [protocol, host] = (
      strapi.config.publicUrl || strapi.config.url
    ).split("://");
    _.defaultsDeep(grantConfig, { defaults: { protocol, host } });

    const [requestPath] = ctx.request.url.split("?");
    const provider =
      process.platform === "win32"
        ? requestPath.split("\\")[2]
        : requestPath.split("/")[2];
    const config = grantConfig[provider];

    if (!_.get(config, "enabled")) {
      return ctx.badRequest(null, "This provider is disabled.");
    }
    // Ability to pass OAuth callback dynamically
    grantConfig[provider].callback =
      ctx.query && ctx.query.callback
        ? ctx.query.callback
        : grantConfig[provider].callback;
    return grant(grantConfig)(ctx, next);
  }
};
