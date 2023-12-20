import { Servers, fmt } from "find_servers.js";

export async function main(ns) {
  let scan = new Servers(ns);

  ns.disableLog("ALL");

  let servers = []
  let update_servers = 0;
  while (true) {
    await ns.sleep(5000);

    if ((update_servers++ % 64) == 0) {
      scan.update();
      for (const serv of scan.servers) {
        await scan.own(serv);
      }
      servers = scan.servers.filter(name => name != "home");
    }

    const home_server = ns.getServer("home");
    const servers_stats = scan.stats(home_server.cpuCores);
    const best_server = servers_stats.reduce((best, e) => e[0] > best[0] ? e : best)[2];
    const script = "early-hack-template.js";
    const script_ram = ns.getScriptRam(script);
    for (const serv of servers) {
      const server_obj = ns.getServer(serv);
      const free_mem = server_obj.maxRam - server_obj.ramUsed;
      const th = Math.floor(free_mem / script_ram)
      if (th > 0) {
        try {
          ns.nuke(serv);
          ns.exec(script, serv, th, best_server);
          ns.print("run " + script + " -t" + th + " " + best_server + " on " + serv);
        } catch (error) { }
      }
    }

    const ps = ns.ps("home");
    const home_script = "grow_weak.js";
    const avail_mem = home_server.maxRam - home_server.ramUsed;
    let avail_th = Math.floor(avail_mem / ns.getScriptRam(home_script));
    for (const grow_serv of servers_stats.filter(e => e[1] != 0).sort((a, b) => a[1] - b[1])) {
      if (avail_th <= 0) break;
      const need_th = Math.floor(grow_serv[1]);
      const name = grow_serv[2];
      const running_th = ps.filter(e => e.args.includes(name))
        .reduce((sum, e) => sum + e.threads, 0);
      const th = Math.min(avail_th, need_th - running_th);
      if (th > 0) {
        const pid = ns.exec(home_script, "home", th, name);
        ns.print(`run ${home_script} -t ${th} ${name} on home (pid: ${pid})`);
        avail_th -= th;
      }
    }
    avail_th = Math.floor(avail_th * ns.getScriptRam(home_script) / ns.getScriptRam(script));
    if (avail_th > 0) {
      const pid = ns.exec(script, "home", avail_th, best_server);
      ns.print(`run ${script} -t ${avail_th} ${best_server} on home (pid: ${pid})`);
    }
  }
}
