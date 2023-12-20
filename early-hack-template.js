/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const good_money = ns.args[1];
  const avail_money = ns.args[2];

  let best = 0;
  let last_good = 0;
  let consecutive_bad = 0;
  let tot_money = 0;
  while (tot_money * 2 < avail_money && consecutive_bad <= 2 && last_good < 3 * 60) {
    const start = Date.now();
    let earnedMoney = await ns.hack(target);
    const seconds = (Date.now() - start) / 1000;
    tot_money += earnedMoney
    earnedMoney = earnedMoney / seconds;
    if (earnedMoney > good_money && earnedMoney > best / 2) {
      best = Math.max(best, earnedMoney);
      last_good = 0;
      consecutive_bad = 0;
      ns.print(`${earnedMoney.toFixed(1)} - good money: ${good_money.toFixed(1)} - best: ${best.toFixed(1)}`);
    } else {
      ++consecutive_bad;
      last_good += seconds;
      ns.print(`${earnedMoney.toFixed(1)} - time since a good hack: ${last_good.toFixed(1)}`);
    }
  }
}
