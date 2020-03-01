const fs = require("fs");
const path = require("path");
/**
 * AppConf.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

function getMatched(origin, ctxPath) {
  const host = strapi.config.clients[origin];
  const matchedKey = Object.keys(host)
    .filter(v => ctxPath.startsWith(v))
    .sort()
    .reverse()[0];
  return matchedKey && host[matchedKey];
}

function getReadFileStream(matched, filePath = "index.html") {
  const publicPath = strapi.config.currentEnvironment.server.public.path;
  const basePath = (matched && matched.assetsBase) || ".";
  return fs.createReadStream(
    path.resolve(publicPath, path.join(basePath, filePath))
  );
}

module.exports = {
  handleHTML: (origin, ctxPath) => {
    const matched = getMatched(origin, ctxPath);
    return getReadFileStream(matched);
  },
  handleStatic: (origin, ctxPath) => {
    const matched = getMatched(origin, ctxPath);
    return getReadFileStream(matched, ctxPath);
  },
  updateConfig: () => {}
};
