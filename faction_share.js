
export async function main(ns) {
  const n_cycles = ns.args.length == 0 ? +Infinity : (ns.args[0] / 10);
  for (let i = 0; i < n_cycles; ++i) {
    await ns.share()
  }
}
