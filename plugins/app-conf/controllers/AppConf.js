const path = require("path");
const mime = require("mime-types");

function isStatic(path = "") {
  return /(.js|.css|.json|.ico|.jpg|.png)$/.test(path);
}

function isHTML(accept = "") {
  return /(text\/html)/.test(accept);
}

/**
 * AppConf.js controller
 *
 * @description: A set of functions called "actions" of the `app-conf` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx, next) => {
    // Add your own logic here.
    if (isHTML(ctx.get("Accept"))) {
      ctx.set("Content-Type", "text/html");
      ctx.body = await strapi.plugins["app-conf"].services[
        "appconf"
      ].handleHTML(ctx.origin, ctx.path);
      return;
    }

    if (isStatic(ctx.path)) {
      ctx.set("Content-Type", mime.contentType(path.extname(ctx.path)));
      ctx.set("Cache-Control", `max-age=${4 * 7 * 24 * 3600}`);

      ctx.body = await strapi.plugins["app-conf"].services[
        "appconf"
      ].handleStatic(ctx.origin, ctx.path);
      return;
    }

    await next();
  },
  updateConfig: async ctx => {
    const update = ctx.request.body || {};

    ctx.send("OK");
  }
};
