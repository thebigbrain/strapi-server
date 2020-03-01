const fs = require("fs");

function isStatic(path) {
  return /(.js|.css|.json|.ico|.jpg|.png)$/.test(path);
}

/**
 * AppConf.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {
  handleHTML: (origin, originalUrl) => {
    const clients = strapi.config.clients;

    console.log(origin, originalUrl);

    const hosts = Object.keys(clients);
    console.log(hosts);

    return "html";
  },
  handleStatic: originalPath => {
    const publicPath = strapi.config.currentEnvironment.public.path;
    return fs.createReadStream(
      path.resolve(publicPath, path.join(".", originalPath))
    );
  },
  updateConfig: () => {}
};
