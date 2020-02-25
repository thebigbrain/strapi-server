"use strict";
const uuid = require("uuid/v4");
const { sanitizeEntity } = require("strapi-utils");

const vericodeCache = new Map();

async function getRole(ctx) {
  const pluginStore = await strapi.store({
    environment: "",
    type: "plugin",
    name: "users-permissions"
  });

  const settings = await pluginStore.get({
    key: "advanced"
  });

  const role = await strapi
    .query("role", "users-permissions")
    .findOne({ type: settings.default_role }, []);

  if (!role) ctx.throw(451, "默认角色不存在");

  return role;
}

async function createUser(ctx, phone) {
  const service = strapi.query("user", "users-permissions");
  let r = await service.find({
    username: phone
  });

  r = r && r[0];

  if (!r) {
    const role = await getRole(ctx);

    r = await service.create({
      username: phone,
      email: "test@gmail.com",
      password: uuid(),
      role: role.id
    });
  }
}

/**
 * AuthPhone.js controller
 *
 * @description: A set of functions called "actions" of the `auth-phone` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */
  vericode: async ctx => {
    let { phone } = ctx.request.query;

    if (!phone) ctx.throw(400, "参数错误");
    phone = phone.replace(/ /g, "");

    await createUser(ctx, phone);

    let code = await strapi.plugins["auth-phone"].services.vericode.sendCode(
      phone
    );

    ctx.send(code);
  },

  login: async ctx => {
    // Get parameters from the request
    let { phone, code } = ctx.request.body;

    if (!phone || !code) ctx.throw(400, "参数错误");
    phone = phone.replace(/ /g, "");

    const verified = await strapi.plugins[
      "auth-phone"
    ].services.vericode.verify(phone, code);
    if (!verified) {
      ctx.throw(400, "验证码错误");
      return;
    }

    // Get the list of users using the plugin's queries
    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ username: phone });

    ctx.send({
      jwt: strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id
      }),
      user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
        model: strapi.query("user", "users-permissions").model
      })
    });
  }
};
