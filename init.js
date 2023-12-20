import { Servers, fmt } from "find_servers.js";

function free_mem(ns, host) {
  let res = ns.getServer(host).maxRam - ns.getServer(host).ramUsed
  if (host === "home") {
    const ram = ns.getServer(host).maxRam
    const ram1 = ns.getScriptRam("contract.js")
    const ram2 = ns.getScriptRam("workout.js")
    if (ram > ram1) { res -= ram1 }
    else if (ram > ram2) { res -= ram2 }
  }
  return res
}

class HackServers {
  constructor(ns, servers_stats) {
    this.share_script = "faction_share.js";
    this.hack_script = "hack.js";
    this.hack_ram = ns.getScriptRam(this.hack_script)
    this.grow_script = "grow_weak.js";
    this.grow_servers = servers_stats.slice().sort((a, b) => b[2] - a[2]);
    let scripts = []
    for (const host of this.grow_servers.map(e => e[0])) {
      scripts.push(...ns.ps(host).filter(e => e.filename === this.grow_script));
    }
    for (let serv of this.grow_servers) {
      const server_name = serv[0];
      for (const running_th of scripts.filter(e => e.args.includes(server_name))) {
        serv[3] -= running_th.threads;
      }
    }
    const soft_max = (value) => value == 0 ? 0 : Math.pow(1.5, value / 1000)
    const hack_servers_sum = servers_stats.reduce((sum, e) => sum + e[1], 0)
    this.hack_servers = servers_stats.slice()
      .map(e => { e[1] = e[1] / hack_servers_sum; return e })
      .sort((a, b) => b[1] - a[1]);

    this.money_th = Math.floor(0.6 * hack_servers_sum / this.hack_ram)

    const tot_ram = this.hack_servers.map(e => e[0])
      .filter(host => ns.hasRootAccess(host))
      .reduce((sum, host) => sum + ns.getServer(host).maxRam, 0)

    console.log(
      ns.formatNumber(ns.getTotalScriptIncome()[0]),
      ns.formatNumber(hack_servers_sum),
      ns.formatRam(tot_ram),
      ns.formatRam(this.money_th * this.hack_ram),
      this.hack_servers)
  }

  do_grow(ns, host) {
    const money_th = this.money_th - ns.ps(host)
      .filter(e => e.filename === this.hack_script)
      .reduce((th, e) => th + e.threads, 0)
    const reserve_mem = host == "ahome" ? 0 : Math.max(0, money_th) * this.hack_ram;
    const avail_mem = free_mem(ns, host) - reserve_mem
    let avail_th = Math.floor(avail_mem / ns.getScriptRam(this.grow_script));
    const hack_level = ns.getHackingLevel() + 10
    for (let grow_serv of this.grow_servers.filter(e => hack_level >= ns.getServerRequiredHackingLevel(e[0]))) {
      if (avail_th <= 0) break;
      const need_th = Math.ceil(grow_serv[3]);
      const th = Math.min(avail_th, need_th);
      if (th > 0) {
        const server_name = grow_serv[0];
        const expected = ns.weakenAnalyze(th, ns.getServer(host).cpuCores);
        const security_min = ns.getServerMinSecurityLevel(server_name) + Math.min(4, 4 * expected);
        const process = ns.exec(this.grow_script, host, th, server_name, security_min);
        ns.print(`run ${this.grow_script} -t ${th} ${server_name} on ${host} (pid: ${process})`);
        avail_th -= th;
        grow_serv[3] -= th;
      }
    }
  }

  do_hack(ns, host) {
    let avail_th = Math.floor(free_mem(ns, host) / ns.getScriptRam(this.hack_script))
    for (let hack_serv of this.hack_servers) {
      if (avail_th <= 0) break;
      const need_th = Math.ceil(avail_th * hack_serv[1])
      const th = Math.min(avail_th, need_th);
      if (th > 0) {
        const server_name = hack_serv[0]
        const expected = ns.weakenAnalyze(th, ns.getServer(host).cpuCores);
        const security_min = ns.getServerMinSecurityLevel(server_name) + Math.min(4, 4 * expected);
        const process = ns.exec(this.hack_script, host, th, server_name, security_min);
        //const avail_money = ns.getServerMoneyAvailable(server_name)
        //const pid = ns.exec(this.hack_script, host, th, server_name, th * 100, avail_money);
        ns.print(`run ${this.hack_script} -t ${th} ${server_name} on ${host} (pid: ${process})`);
        avail_th -= th;
      }
    }
  }

  do_share(ns, host) {
    if (ns.ps(host).filter(e => e.filename === this.share_script).length != 0) return

    let avail_th = Math.floor(free_mem(ns, host) / ns.getScriptRam(this.share_script))
    avail_th = Math.min(2, avail_th)
    if (avail_th > 0) {
      const process = ns.exec(this.share_script, host, avail_th, 4 * 60);
      ns.print(`run ${this.share_script} -t ${avail_th} on ${host} (pid: ${process})`);
    }
  }
}

export async function main(ns) {
  if (!ns.isRunning("stock.js")) {
    ns.exec("stock.js", "home");
  }
  if (!ns.isRunning("gang.js")) {
    ns.exec("gang.js", "home");
  }

  let serv_obj = new Servers(ns);

  ns.disableLog("ALL");

  let update_servers = 0;
  while (true) {
    if ((update_servers % 32) == 0) {
      ns.exec("buy_base.js", "home");
      await ns.sleep(1000);
      ns.exec("extra_servers.js", "home");
      await ns.sleep(4000);
    } else {
      await ns.sleep(5000);
    }

    if ((update_servers % 32) == 0) {
      serv_obj.update();
      for (const serv of serv_obj.servers) {
        serv_obj.own(serv);
      }
    }
    if ((update_servers % 32) == 1) {
      ns.exec("workout.js", "home");
    }
    if ((update_servers % 64) == 2) {
      ns.exec("contract.js", "home");
    }
    if ((update_servers++ % 64) == 8) {
      ns.exec("backdoor.js", "home", 1, "bg");
    }

    const servers_stats = serv_obj.stats(ns.getServer("home").cpuCores);
    let hack_servers = new HackServers(ns, servers_stats);
    let curr_work = null
    try {
      curr_work = ns.singularity.getCurrentWork()
    } catch (error) { }
    const faction_share = (curr_work != null && curr_work.type == "FACTION")
    for (const host of serv_obj.servers.filter(e => ns.getServer(e).hasAdminRights)) {
      if (faction_share) {
        hack_servers.do_share(ns, host)
      }
      hack_servers.do_grow(ns, host)
      hack_servers.do_hack(ns, host)
    }
  }
}
