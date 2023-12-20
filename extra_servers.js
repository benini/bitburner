
export async function main(ns) {
  let executables = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "SQLInject.exe", "relaySMTP.exe"]
  if (executables.find(e => !ns.fileExists(e)) != undefined) {
    return
  }

  const ram = ns.getServer("home").maxRam / 2;
  while (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
    if (ns.getPurchasedServers().length == ns.getPurchasedServerLimit()) {
      const worst = ns.getPurchasedServers().reduce((worst, e) => ns.getServer(e).maxRam < ns.getServer(worst).maxRam ? e : worst)
      if (ns.getServer(worst).maxRam <= ram / 4) {
        ns.killall(worst)
        ns.deleteServer(worst)
      }
    }
    if (ns.getPurchasedServers().length >= ns.getPurchasedServerLimit()) break;

    ns.purchaseServer("purch_server", ram);
  }

  while (ns.hacknet.getPurchaseNodeCost() < 10 * 1000 * 1000
    && ns.getServerMoneyAvailable("home") > ns.hacknet.getPurchaseNodeCost() + 15 * 1000 * 1000) {

    let cost = ns.getServerMoneyAvailable("home")
    const node = ns.hacknet.purchaseNode();
    ns.hacknet.upgradeLevel(node, 159);
    ns.hacknet.upgradeRam(node, 10);
    ns.hacknet.upgradeCore(node, 5);
    cost -= ns.getServerMoneyAvailable("home");
    ns.print(`Bought hack node: ${cost}`)
  }
}
