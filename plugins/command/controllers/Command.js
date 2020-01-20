'use strict';

/**
 * Command.js controller
 *
 * @description: A set of functions called "actions" of the `command` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    // Add your own logic here.
    const {collection} = ctx.params;
    const {body} = ctx.request;
    const s = collection.endsWith('s') ? collection.substr(0, collection.length - 1) : collection;
    const service = strapi.query(s);

    let r = await service.create(body);

    // Send 200 `ok`
    ctx.send(r);
  },
  /**
   * Promise to edit record
   *
   * @return {Promise}
   */
  async update(params, data, { files } = {}) {
    const entry = await strapi.query(model).update(params, data);

    if (files) {
      // automatically uploads the files based on the entry and the model
      await this.uploadFiles(entry, files, { model: strapi.models.restaurant });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },
  /**
   * Promise to delete a record
   *
   * @return {Promise}
   */

  delete(params) {
    return strapi.query('restaurant').delete(params);
  },
};
