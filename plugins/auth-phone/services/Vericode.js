const vericodeCache = new Map();

const now = () => new Date().getTime();

module.exports = {
  sendCode: async phone => {
    if (!vericodeCache.has(phone)) {
      vericodeCache.set(phone, []);
    }

    let c = vericodeCache.get(phone);

    const code = Math.random()
      .toString()
      .split(".")[1]
      .substr(0, 4);

    c.push({ code, createdAt: now() });
    return code;
  },
  verify: async (phone, code) => {
    const item = vericodeCache.get(phone);

    if (!item) return false;

    const c = item.find(v => v.code === code);

    return c.createdAt + 5 * 60 * 1000 > now();
  }
};
