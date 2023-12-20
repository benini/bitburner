export class Servers {
  constructor(ns) {
    this.ns = ns;
    this.servers = ["home"];
    this.path = {};
  }

  update(host = "home", path = []) {
    if (!this.path[host] || this.path[host].length > path.length) {
      this.path[host] = [...path, host];
    }
    const new_srvs = this.ns.scan(host).filter(name => !this.servers.includes(name));
    this.servers.push(...new_srvs);
    new_srvs.forEach(srv => {
      this.update(srv, [...path, host])
    });
    return this;
  }

  own(serv, update_scripts = false) {
    if (serv == "home") return false;

    if (update_scripts || !this.ns.fileExists("grow_weak.js", serv)) {
      this.ns.scp("early-hack-template.js", serv);
      this.ns.scp("hack.js", serv);
      this.ns.scp("grow_weak.js", serv);
      this.ns.scp("faction_share.js", serv);
    }
    const info = this.ns.getServer(serv);
    if (!info.hasAdminRights) {
      try {
        this.ns.brutessh(serv);
        this.ns.ftpcrack(serv);
        this.ns.relaysmtp(serv);
        this.ns.httpworm(serv);
        this.ns.sqlinject(serv);
      } catch (error) { }
      if (info.openPortCount >= info.numOpenPortsRequired) {
        this.ns.nuke(serv);
      }
    }
    return this.ns.getServer(serv).hasAdminRights
  }

  stats(cores = 1) {
    const ofile = "log_best_server_new.txt";
    this.ns.write(ofile, `Servers:\n${this.servers}:\n`, "w");

    const hack_level = this.ns.getHackingLevel()
    const res = this.servers.map(serv => {
      const serv_info = this.ns.getServer(serv)
      let grow_ratio = 0;
      const money_max = serv_info.moneyMax;
      const money = Math.min(money_max, serv_info.moneyAvailable)
      this.ns.write(ofile, `\n\n${serv}`);
      this.ns.write(ofile, `\n- Money:${money} - ${(money * 100 / money_max).toFixed(1)}% (${money_max})`);
      this.ns.write(ofile, "\n- Required level: " + serv_info.requiredHackingSkill);

      const security = serv_info.hackDifficulty;
      const security_min = serv_info.minDifficulty;
      let grow_threads = money_max == 0 ? 0 : this.ns.growthAnalyze(serv, money_max / Math.max(2, money), cores);
      let grow_time = this.ns.getGrowTime(serv);
      const weaken_time = this.ns.getWeakenTime(serv) * (security - security_min);
      const money_perc = this.ns.hackAnalyze(serv);
      const hack_time = this.ns.getHackTime(serv);
      const hack_prob = this.ns.getServerRequiredHackingLevel(serv) > hack_level ? 0 : this.ns.hackAnalyzeChance(serv);

      let money_ratio = money * money_perc * hack_prob / hack_time;
      let max_money_ratio = money_max * money_perc * hack_prob / hack_time;

      let hack_time_min_sec = hack_time;
      let hack_prob_min_sec = hack_prob;
      let hack_exp = 1;

      const player = this.ns.getPlayer();
      let server = this.ns.getServer(serv);
      server.hackDifficulty = Math.min(100, 5 + server.minDifficulty);
      try {
        grow_threads = this.ns.formulas.hacking.growThreads(server, player, money_max, cores);
        grow_time = this.ns.formulas.hacking.growTime(server, player);
        hack_exp = this.ns.formulas.hacking.hackExp(server, player);
        hack_prob_min_sec = this.ns.formulas.hacking.hackChance(server, player);
        hack_time_min_sec = this.ns.formulas.hacking.hackTime(server, player);
        const money_perc_min_sec = this.ns.formulas.hacking.hackPercent(server, player);
        max_money_ratio = hack_exp * money_max * money_perc_min_sec * hack_prob_min_sec / (hack_time_min_sec * hack_time_min_sec);
        // this.ns.formulas.hacking.weakenTime(server, player)
      } catch (error) { }

      if (!serv_info.hasAdminRights) { grow_threads = 0 }
      grow_ratio = grow_threads != 0 ?
        max_money_ratio / ((weaken_time + grow_time) * grow_threads) : 0;

      // console.log(serv, serv_info.hasAdminRights, grow_ratio, grow_threads, money, money_max, serv_info)

      if (money_max > 0) {
        this.ns.write(ofile, `\n- Security level: ${security} - min: ${security_min}`);
        this.ns.write(ofile, "\n- Security increase from grow:" + this.ns.growthAnalyzeSecurity(100000, serv, cores));
        // this.ns.write(ofile, "\n- Grow Percent_formulas:" + this.ns.formulas.hacking.growPercent(server, 1, player, cores));
        // this.ns.write(ofile, "\n- Grow Threads_formulas:" + this.ns.formulas.hacking.growThreads(server, player, money_max, cores));
        this.ns.write(ofile, `\n- Grow Threads (${cores} cores):` + grow_threads);
        // this.ns.write(ofile, "\n- Grow Time_formulas:" + this.ns.formulas.hacking.growTime(server, player));
        this.ns.write(ofile, "\n- Grow Time:" + grow_time);
        this.ns.write(ofile, "\n- Hack Exp:" + hack_exp);
        // this.ns.write(ofile, "\n- Hack Chance_formulas:" + this.ns.formulas.hacking.hackChance(server, player));
        this.ns.write(ofile, `\n- Hack Chance: ${hack_prob.toFixed(4)} - ${hack_prob_min_sec.toFixed(4)}`);
        // this.ns.write(ofile, "\n- Money Percent_formulas:" + this.ns.formulas.hacking.hackPercent(server, player));
        this.ns.write(ofile, "\n- Money Percent:" + money_perc);
        // this.ns.write(ofile, "\n- Weaken Time_formulas:" + this.ns.formulas.hacking.weakenTime(server, player));
        this.ns.write(ofile, "\n- Weaken Time:" + this.ns.getWeakenTime(serv));
        this.ns.write(ofile, "\n- Weaken Analyze_no_target?:" + this.ns.weakenAnalyze(1, cores));
        // this.ns.write(ofile, "\n- Hack Time_formulas:" + this.ns.formulas.hacking.hackTime(server, player));
        this.ns.write(ofile, `\n- Hack Time: ${hack_time} - ${hack_time_min_sec}`);
        this.ns.write(ofile, "\n- Treads to hack 1e5:" + this.ns.hackAnalyzeThreads(serv, 1e5) +
          " time_ratio " + this.ns.getHackTime(serv) / this.ns.hackAnalyzeThreads(serv, 1e5));
        this.ns.write(ofile, "\n- Money * perc * prob / time:" + money_ratio);
        this.ns.write(ofile, "\n- Max_money_ratio / grow_threads:" + grow_ratio);
      }

      return [serv, money_ratio, grow_ratio, grow_threads];
    });
    const best_server = res.reduce((best, e) => e[1] > best[1] ? e : best);
    const best_grow = res.reduce((best, e) => e[2] > best[2] ? e : best);
    this.ns.write(ofile, `\n\nBest server: ${best_server}`);
    this.ns.write(ofile, `\nBest to grow: ${best_grow}`);
    return res;
  }
}

export async function main(ns) {
  const hack_level = ns.getHackingLevel()
  let scan = new Servers(ns).update();
  const servers = (ns.args.length != 0) ? ns.args : ['CSEC', 'avmnite-02h', 'I.I.I.I', 'run4theh111z', 'The-Cave', 'w0r1d'];
  for (const server_name of servers.map(e => e.toLowerCase())) {
    for (const exact_name of Object.keys(scan.path).filter(name => name.toLowerCase().includes(server_name))) {
      ns.tprint(scan.path[exact_name].map(serv =>
        (ns.getServer(serv).backdoorInstalled ? "*" :
          ns.hasRootAccess(serv) ? "" :
            ns.getServerRequiredHackingLevel(serv) <= hack_level ? "!" : "-") + serv
      ).join(" "));
    }
  }
  for (const serv of scan.servers) {
    scan.own(serv, true);
  }
  scan.stats(ns.getServer("home").cpuCores);
}

export function fmt(number) {
  let res = number < 0 ? "-" : "";
  const num = Math.abs(number);

  if (num >= 1000000000) {
    return res + (num / 1000000000).toFixed(1) + 'b';
  } else if (num >= 1000000) {
    return res + (num / 1000000).toFixed(1) + 'm';
  } else if (num >= 1000) {
    return res + (num / 1000).toFixed(1) + 'k';
  } else {
    return res + num.toString();
  }
}
