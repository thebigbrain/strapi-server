"use strict";
const uuid = require("uuid/v4");
const { sanitizeEntity } = require("strapi-utils");

const vericodeCache = new Map();

async function createUser(phone) {
  const service = strapi.query("user", "users-permissions");
  let r = await service.find({
    username: phone
  });

  r = r && r[0];

  if (!r) {
    r = await service.create({
      username: phone,
      email: "test@gmail.com",
      password: uuid()
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
    const { phone } = ctx.request.body;

    if (!phone) ctx.throw(400, "参数错误");

    await createUser(phone);

    let code = await strapi.plugins["auth-phone"].services.vericode.sendCode(
      phone
    );

    ctx.send({ message: "ok", code });
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
