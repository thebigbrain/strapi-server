function getServiceModel(name) {
  const service = strapi.services[name];
  const model = strapi.models[name];
  return {service, model}
}

module.exports = {
  getServiceModel
};