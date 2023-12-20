/** @param {NS} ns */
function scan_servers(ns) {
  let servers = []
  servers.push(ns.scan())
  for (let lvl = 0; lvl < 15; lvl++) {
    const new_lvl = [...new Set(servers[lvl].map(ns.scan).flat())];
    const prev_servers = [...new Set(servers.flat())];
    servers.push(new_lvl.filter(name => name != "home" && !prev_servers.includes(name)));
  }
  return [...new Set(servers.flat())];
}

export async function main(ns) {

  let infilt = ns.infiltration.getPossibleLocations().map(loc => ns.infiltration.getInfiltration(loc.name));
  infilt.sort((a, b) => a.reward.tradeRep / a.location.infiltrationData.maxClearanceLevel
    - b.reward.tradeRep / b.location.infiltrationData.maxClearanceLevel);

  for (const info of infilt.filter(e => e.difficulty >= 2)) {
    ns.tprint(`${info.location.name} (${info.location.city}) - Difficulty: ${info.difficulty * 33}`);
    ns.tprint(`- Clearance: ${info.location.infiltrationData.maxClearanceLevel} - Difficulty: ${info.difficulty * 33}`);
    ns.tprint(`- Rep: ${info.reward.tradeRep} - Cash: ${info.reward.sellCash} - SoARep: ${info.reward.SoARep}`);
  }
  ns.tprint(`Doable:`);

  for (const info of infilt.filter(e => e.difficulty < 2)) {
    ns.tprint(`${info.location.name} (${info.location.city}) - Difficulty: ${info.difficulty * 33}`);
    ns.tprint(`- Clearance: ${info.location.infiltrationData.maxClearanceLevel} - Difficulty: ${info.difficulty * 33}`);
    ns.tprint(`- Rep: ${info.reward.tradeRep} - Cash: ${info.reward.sellCash} - SoARep: ${info.reward.SoARep}`);
  }
}
