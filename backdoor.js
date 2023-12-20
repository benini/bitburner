import { Servers } from "find_servers.js";

export async function main(ns) {
  const output = ns.tprint
  if (ns.args[0] == "bg") {
    if (!ns.singularity.isFocused()) return
    output = console.log
  }

  let scan = new Servers(ns).update();
  scan.servers.sort((a, b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b))
  const in_faction = (server_name) =>
    ['The-Cave', 'run4theh111z', 'I.I.I.I', 'avmnite-02h', 'CSEC', 'w0r1d']
      .filter(e => server_name.includes(e)).length
  scan.servers.sort((a, b) => in_faction(b) - in_faction(a))
  for (const target of scan.servers.filter(e => e !== "home")) {
    const serv = ns.getServer(target)
    if (serv.purchasedByPlayer || serv.backdoorInstalled) continue

    if (ns.hasRootAccess(target) && ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
      for (const host of scan.path[target]) {
        await ns.singularity.connect(host)
      }
      output("installing backdoor on ", target)
      await ns.singularity.installBackdoor();
      await ns.singularity.connect("home")
    }
    for (const faction of ns.singularity.checkFactionInvitations()) {
      ns.singularity.joinFaction(faction)
    }
    break
  }
}
