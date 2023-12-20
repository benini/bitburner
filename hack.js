export async function main(ns) {
  const target = ns.args[0];
  const security_min = ns.args[1];

  let zeros = 0;
  let seconds = 0;
  while (seconds < 4 * 60) {
    const security = ns.getServerSecurityLevel(target)
    const start = Date.now();
    if (security > security_min) {
      await ns.weaken(target);
    } else {
      const money = await ns.hack(target);
      if (money == 0 && ++zeros >= 2) break;
    }
    seconds += (Date.now() - start) / 1000;
  }
}
