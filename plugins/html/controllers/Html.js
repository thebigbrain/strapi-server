"use strict";

/**
 * Html.js controller
 *
 * @description: A set of functions called "actions" of the `html` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async ctx => {
    // Add your own logic here.
    ctx.set("Content-Type", "html");

    // Send 200 `ok`
    ctx.send({
      message: "ok"
    });
  },

  static: async (ctx, next) => {
    // Add your own logic here.

    if (!ctx.accepts("html")) return next();

    ctx.set("Content-Type", "html");

    // Send 200 `ok`
    ctx.send("hello html");
  }
};
