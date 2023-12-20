
export async function main(ns) {
  while (true) {
    await ns.sleep(5000);

    let gang_names
    try {
      gang_names = ns.gang.getMemberNames()
    } catch (err) {
      return
    }
    const gang = gang_names.map(ns.gang.getMemberInformation);
    for (let i = gang.length; ns.gang.recruitMember("douchbag" + i); i++) {
      ns.gang.setMemberTask("douchbag" + i, "Train Combat");
    }
    const avail_members = gang.filter(member => {
      if (member.str > 300)
        return true;

      const test_members = ["douchbag7", "douchbag8", "douchbag9", "douchbag10", "douchbag11"];
      if (!test_members.includes(member.name)) {
        return false;
      }

      let ascend = undefined
      const asc = ns.gang.getAscensionResult(member.name);
      /*
      console.log(asc)
      const new_str = (asc == undefined) ? 1 : asc.str
      const extra_str = member.str * new_str - member.str;
      console.log(member.name, member.str, member.str * new_str,
       member.str * new_str - member.str)
       
      console.log("exp, tempo", member.str_exp, member.str_exp / member.str)
      const recupero = member.str_exp / extra_str
      console.log("recupero", recupero
        , member.str_exp + recupero * member.str
        , recupero * member.str * new_str)
  
      console.log("Ascende se recupero < speso ?", recupero, member.str / member.str)
      */
      const target = 1.1 + 0.1 * test_members.indexOf(member.name);
      if (asc && asc.str > target) {
        console.log(member.name, target, asc, member)
        ascend = ns.gang.ascendMember(member.name);
      }
      if (ascend != undefined || member.task != "Train Combat") {
        ns.gang.setMemberTask(member.name, "Train Combat");
      }
      return false;

      if (member.str_asc_mult > 6 || member.str > gang.length * 20)
        return true;

    });
    let n_vigilantes = Math.floor(20 * (1.02 - ns.gang.getGangInformation().wantedPenalty));
    n_vigilantes = Math.min(n_vigilantes, avail_members - 1);
    for (const member of avail_members) {
      if (n_vigilantes-- > 0) {
        const task = "Vigilante Justice";
        if (member.task != task)
          ns.gang.setMemberTask(member.name, task);
      } else if (["Mug People", "Human Trafficking", "Train Combat", "Vigilante Justice"].includes(member.task)) {
        const task = member.str < 500 ? "Mug People" : "Human Trafficking";
        if (member.task != task)
          ns.gang.setMemberTask(member.name, task);
      }
    }
  }
}
