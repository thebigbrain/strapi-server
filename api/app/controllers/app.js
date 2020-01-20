const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  find: async ctx => {
    const {service, model} = strapi.config.functions.utils.getServiceModel('app');

    let entities;
    let query = ctx.query;

    let role = null;
    if (ctx.state.user) {
      role = ctx.state.user.role
    }

    if (ctx.query._q) {
      entities = await service.search(query);
    } else {
      entities = await service.find(query);
    }

    let entity = entities[0];
    if (role) entity.role = role;

    return [sanitizeEntity(entity, { model })];
  },
};
