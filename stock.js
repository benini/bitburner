class Stock {
  constructor(name, max_history) {
    this.name = name;
    this.buy_price = 0;
    this.sell_price = 0;
    this.price_history = [];
    this.max_history = max_history;

    this.updatePrice = (buy_price, sell_price) => {
      this.buy_price = buy_price;
      this.sell_price = sell_price;
      this.price_history.push({ buy: buy_price, sell: sell_price });
      if (this.price_history.length > this.max_history) {
        this.price_history.shift();
      }
    };

    this.long_strategy_buy_and_hold = () => {
      if (this.price_history.length < this.max_history) {
        return 0;
      }
      const first_price = this.price_history[0].buy;
      const last_price = this.price_history[this.price_history.length - 1].sell;

      const split_idx = Math.floor(this.price_history.length * 3 / 4);
      const first_half = this.price_history.slice(0, split_idx);
      const avg_first = first_half.reduce((sum, elem) => sum + elem.sell, 0) / first_half.length;
      const last_half = this.price_history.slice(split_idx);
      const avg_last = last_half.reduce((sum, elem) => sum + elem.sell, 0) / last_half.length;

      // Calculate percentage change in price
      const early_sell = (avg_last / avg_first) - 1;
      let gain_or_loss = (last_price - first_price) / first_price;

      return early_sell < 0 ? early_sell : gain_or_loss;
    };
  }

  high_speed() {
    if (this.price_history.length < this.max_history) return 0;

    let buy_price = this.price_history[0].buy;
    let max_current = -Infinity;
    let max_best = -Infinity
    for (const elem of this.price_history) {
      max_current = Math.max(max_current, (elem.sell - buy_price) / buy_price);
      max_best = Math.max(max_best, max_current);
      if (elem.buy < buy_price) {
        buy_price = elem.buy;
        max_current = -Infinity;
      }
    }
    return max_best;
  }
}

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("sleep");
  ns.disableLog("getServerMoneyAvailable");

  let tot_profit = 0;
  let stocks = [];
  while (true) {
    const syms = ns.stock.getSymbols().map(name => {
      const ask = ns.stock.getAskPrice(name);
      const bid = ns.stock.getBidPrice(name);

      if (!stocks[name]) {
        stocks[name] = new Stock(name, 20);
      }
      stocks[name].updatePrice(ask, bid);
      return [stocks[name].long_strategy_buy_and_hold(), name]
    });

    for (const stock of syms.filter(stock => stock[0] < 0)) {
      const name = stock[1];
      const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(name);
      if (sharesLong > 0) {
        const gainLong = ns.stock.getSaleGain(name, sharesLong, "Long") - avgLongPrice * sharesLong;
        const gain_perc = (1.0 * gainLong / avgLongPrice / sharesLong) * 100.0;
        ns.stock.sellStock(name, sharesLong);
        ns.printf(`SOLD: ${name} ${fmt(gainLong)} gained (${gain_perc.toFixed(1)} %%) - Forecast: ${ns.stock.getForecast(name).toFixed(1)}`);
        tot_profit += gainLong;
        ns.printf(`TOT_PROFIT: ${fmt(tot_profit)}`);
      }
    }

    const min_buy = ns.stock.getConstants().StockMarketCommission * 500;
    const money = ns.getServerMoneyAvailable("home") - min_buy;
    const dyn_coeff = -192.778 * Math.pow(money / min_buy, 0.00003896) + 192.89
    // const dyn_coeff = -103.875 * Math.pow(money / min_buy, 0.00007865) + 103.985
    // console.log("Coeff:", dyn_coeff, (money / min_buy));

    let buy_stocks = syms.filter(stock => stock[0] > 0 && ns.stock.getForecast(stock[1]) > 0.6);
    buy_stocks = buy_stocks.filter(stock => stock[0] > 0.05 || stocks[stock[1]].high_speed() > dyn_coeff);
    const tot_buy_stocks = buy_stocks.reduce((sum, e) => sum + e[0], 0);
    for (const stock of buy_stocks.sort().reverse()) {
      const name = stock[1];
      const ask_price = ns.stock.getAskPrice(name);
      const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(name);
      const max_shares = ns.stock.getMaxShares(name);
      const min_shares = Math.ceil(min_buy / ask_price);
      let limit_shares = (stock[0] * money / tot_buy_stocks) / ask_price;
      limit_shares = Math.max(limit_shares, min_shares);
      limit_shares = Math.min(limit_shares, max_shares * (stock[0] > 0.25 ? 0.2 : 0.1));
      limit_shares = Math.max(limit_shares, min_shares);
      limit_shares = Math.ceil(limit_shares);
      const n_shares = Math.min(max_shares - sharesLong, limit_shares);
      const cost = n_shares * ask_price;

      const forecast = ns.stock.getForecast(name);
      ns.printf(`May buy: ${name} ${fmt(cost)} - Trend: ${stock[0].toFixed(3)} - Forecast: ${forecast.toFixed(2)}`);
      if (cost >= min_buy) {
        const buyed = ns.stock.buyStock(name, n_shares);
        if (buyed > 0) tot_profit -= ns.stock.getConstants().StockMarketCommission;
      }
    }

    await ns.sleep(6000);
  }
}

function fmt(number) {
  let res = number < 0 ? "-" : "";
  const num = Math.abs(number);

  if (num >= 1000000000) {
    return res + (num / 1000000000).toFixed(2) + 'b';
  } else if (num >= 1000000) {
    return res + (num / 1000000).toFixed(2) + 'm';
  } else if (num >= 1000) {
    return res + (num / 1000).toFixed(2) + 'k';
  } else {
    return res + num.toString();
  }
}
