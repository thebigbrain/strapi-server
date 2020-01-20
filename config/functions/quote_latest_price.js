const axios = require("axios");

function processData(data){
  let r = data.match(/"(.*)"/g);
  return r.map(v => {
    let d = v.replace(/"/g, '').split(',');
    const [
      _1, _2, 
      open, high, low, close, 
      buy1, sell1, latest, 
      settlement, last_settlement, 
      purchase, sales, 
      open_interest, 
      trading_volume
    ] = d;
    return {
      open, high, low, close, 
      buy1, sell1, latest, 
      settlement, last_settlement, 
      purchase, sales, 
      open_interest, 
      trading_volume
    }
  });
}

async function fetchPrice() {
  const q = strapi.query('quote');
  const r = await q.find({_limit: 10000});
  const quotes = r.map(v => v.code);
  const url = `https://hq.sinajs.cn/hqsn/rn=1578014142840&list=${quotes.join(',')}`;
  let { data, status } = await axios.get(url, {timeout: 3000});
  data = processData(data);

  quotes.forEach((code, i) => {
    q.update({code}, data[i]);
  });
}

module.exports = async () => {
  setInterval(() => {
    fetchPrice().catch(e => console.error(e.message));
  }, 3000);
};
