'use strict';

/**
 * Globalsearch.js controller
 *
 * @description: A set of functions called "actions" of the `globalsearch` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.
    const {collection} = ctx.params;
    const s = collection.endsWith('s') ? collection.substr(0, collection.length - 1) : collection;
    const query = ctx.request.query || {};
    const service = strapi.query(s);

    let count = 0;
    let data = [];
    if (query._q != null) {
      count = await service.countSearch(query);
      if (count > 0) data = await service.search(query);
    } else {
      count = await service.count(query);
      if (count > 0) data = await service.find(query);
    }

    ctx.send({count, data});
  }
};
