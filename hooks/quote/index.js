module.exports = strapi => {
  const hook = {
    /**
     * Default options
     */

    defaults: {
      // config object
      model: "quote"
    },

    /**
     * Initialize the hook
     */

    async initialize() {
      // await someAsyncCode()
      // this().defaults['your_config'] to access to your configs.
      const q = strapi.query(this.defaults.model);
      const r = await q.find({ _limit: 10000 });
      if (r && r.map) {
        console.log(r.map(v => v.code));
      }
    }
  };

  return hook;
};
