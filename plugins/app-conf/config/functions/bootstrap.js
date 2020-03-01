module.exports = async () => {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "plugin",
    name: "app-conf"
  });

  let clients = strapi.config.clients;
  if (clients) {
    await pluginStore.set({
      key: "clients",
      value: clients
    });
  } else {
    clients = await pluginStore.get({ key: "clients" });
  }

  strapi.config.clients = clients || {};
};
