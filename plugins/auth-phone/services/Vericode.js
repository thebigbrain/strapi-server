const vericodeCache = new Map();

const now = () => new Date().getTime();

function sendToPhone(phone, code) {
  console.log(`send to ${phone}, ${code}`);
}

module.exports = {
  sendCode: async phone => {
    if (!vericodeCache.has(phone)) {
      vericodeCache.set(phone, []);
    }

    let codes = vericodeCache.get(phone);

    let c = codes.find(v => v.createdAt + 60 * 1000 > now());
    if (c) return "60秒内不能重复发送";

    const code = Math.random()
      .toString()
      .split(".")[1]
      .substr(0, 4);

    codes.push({ code, createdAt: now() });

    sendToPhone(phone, code);

    return code;
  },
  verify: async (phone, code) => {
    if (!vericodeCache.has(phone)) return false;

    const codes = vericodeCache.get(phone);
    const c = codes.find(v => v.code === code);

    return c && c.createdAt + 5 * 60 * 1000 > now();
  }
};
