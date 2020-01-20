'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  find: async ctx => {
    let entities;
    let query = ctx.query;
    let role = await strapi.services.role.find({name: strapi.config.publicRoleName});
    console.log(role);
    query.roles_in = ['5e0db9973874e916a456e2f4', '5e0db9973874e916a456e2f5'];

    if (ctx.query._q) {
      entities = await strapi.services.route.search(query);
    } else {
      entities = await strapi.services.route.find(query);
    }

    return entities.map(entity =>
      sanitizeEntity(entity, { model: strapi.models.route })
    );
  },
};
