export async function main(ns) {
  const target = ns.args[0];
  const security_min = ns.args[1];

  let seconds = 0;
  while (seconds < 4 * 60) {
    const start = Date.now();
    if (ns.getServerSecurityLevel(target) > security_min) {
      await ns.weaken(target);
    } else {
      const grow = await ns.grow(target);
      if (grow <= 1) break;
    }
    seconds += (Date.now() - start) / 1000;
  }
}
