const XLSX = require("xlsx");
const querystring = require("querystring");
const xl = require("excel4node");
const Excel = require('exceljs');
const stream = require('stream');

/**
 * Downloader.js controller
 *
 * @description: A set of functions called "actions" of the `downloader` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async ctx => {
    const { token } = ctx.params;

    const { filename, mimetype, extension, expired_at } = await strapi
      .query("link")
      .findOne({ id: token });

    if (expired_at < new Date().getTime()) ctx.send("链接已过期");

    let [collection, query] = filename.split("?");
    const s = collection.replace(/s$/, "");
    const service = strapi.query(s);

    query = querystring.parse(query);

    let fetcher = null;
    let counter = null;
    if (query._q != null) {
      counter = async(q) => await service.countSearch(q);
      fetcher = async (q) => await service.search(q);
    } else {
      counter = async(q) => await service.count(q);
      fetcher = async (q) => await service.find(q);
    }

    const count = await counter(query);

    let downloadName = [collection];
    (query.filters || []).forEach(v => downloadName.push(`${v.id}:${v.value}`));
    ctx.attachment(downloadName.join('_') + '.csv');

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('My Sheet');
    sheet.columns = [{key: 'name'}, {key: 'code'}];

    let _start = 0;
    const _limit = 100;
    
    async function * generate() {
      yield Buffer.from([0xEF, 0xBB, 0xBF]); // bom: utf-8
      while (_start < count) {
        const q = Object.assign(query, {_start, _limit});
        let data = await fetcher(q);
        _start += _limit;
        sheet.addRows(data);
        let d = await workbook.csv.writeBuffer();
        yield d;
      }
    }
    
    ctx.body = stream.Readable.from(generate());
  }
};

