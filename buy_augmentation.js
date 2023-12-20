
const aug_enum = ["NeuroFlux Governor", "Augmented Targeting I", "Augmented Targeting II", "Augmented Targeting III", "Synthetic Heart", "Synfibril Muscle", "Combat Rib I", "Combat Rib II", "Combat Rib III", "Nanofiber Weave", "NEMEAN Subdermal Weave", "Wired Reflexes", "Graphene Bone Lacings", "Bionic Spine", "Graphene Bionic Spine Upgrade", "Bionic Legs", "Graphene Bionic Legs Upgrade", "Speech Processor Implant", "TITN-41 Gene-Modification Injection", "Enhanced Social Interaction Implant", "BitWire", "Artificial Bio-neural Network Implant", "Artificial Synaptic Potentiation", "Enhanced Myelin Sheathing", "Synaptic Enhancement Implant", "Neural-Retention Enhancement", "DataJack", "Embedded Netburner Module", "Embedded Netburner Module Core Implant", "Embedded Netburner Module Core V2 Upgrade", "Embedded Netburner Module Core V3 Upgrade", "Embedded Netburner Module Analyze Engine", "Embedded Netburner Module Direct Memory Access Upgrade", "Neuralstimulator", "Neural Accelerator", "Cranial Signal Processors - Gen I", "Cranial Signal Processors - Gen II", "Cranial Signal Processors - Gen III", "Cranial Signal Processors - Gen IV", "Cranial Signal Processors - Gen V", "Neuronal Densification", "Neuroreceptor Management Implant", "Nuoptimal Nootropic Injector Implant", "Speech Enhancement", "FocusWire", "PC Direct-Neural Interface", "PC Direct-Neural Interface Optimization Submodule", "PC Direct-Neural Interface NeuroNet Injector", "PCMatrix", "ADR-V1 Pheromone Gene", "ADR-V2 Pheromone Gene", "The Shadow's Simulacrum", "Hacknet Node CPU Architecture Neural-Upload", "Hacknet Node Cache Architecture Neural-Upload", "Hacknet Node NIC Architecture Neural-Upload", "Hacknet Node Kernel Direct-Neural Interface", "Hacknet Node Core Direct-Neural Interface", "Neurotrainer I", "Neurotrainer II", "Neurotrainer III", "HyperSight Corneal Implant", "LuminCloaking-V1 Skin Implant", "LuminCloaking-V2 Skin Implant", "HemoRecirculator", "SmartSonar Implant", "Power Recirculation Core", "QLink", "The Red Pill", "SPTN-97 Gene Modification", "ECorp HVMind Implant", "CordiARC Fusion Reactor", "SmartJaw", "Neotra", "Xanipher", "nextSENS Gene Modification", "OmniTek InfoLoad", "Photosynthetic Cells", "BitRunners Neurolink", "The Black Hand", "Unstable Circadian Modulator", "CRTX42-AA Gene Modification", "Neuregen Gene Modification", "CashRoot Starter Kit", "NutriGen Implant", "INFRARET Enhancement", "DermaForce Particle Barrier", "Graphene BrachiBlades Upgrade", "Graphene Bionic Arms Upgrade", "BrachiBlades", "Bionic Arms", "Social Negotiation Assistant (S.N.A)", "nickofolas Congruity Implant", "Hydroflame Left Arm", "BigD's Big ... Brain", "Z.O.Ë.", "EsperTech Bladeburner Eyewear", "EMS-4 Recombination", "ORION-MKIV Shoulder", "Hyperion Plasma Cannon V1", "Hyperion Plasma Cannon V2", "GOLEM Serum", "Vangelis Virus", "Vangelis Virus 3.0", "I.N.T.E.R.L.I.N.K.E.D", "Blade's Runners", "BLADE-51b Tesla Armor", "BLADE-51b Tesla Armor: Power Cells Upgrade", "BLADE-51b Tesla Armor: Energy Shielding Upgrade", "BLADE-51b Tesla Armor: Unibeam Upgrade", "BLADE-51b Tesla Armor: Omnibeam Upgrade", "BLADE-51b Tesla Armor: IPU Upgrade", "The Blade's Simulacrum", "Stanek's Gift - Genesis", "Stanek's Gift - Awakening", "Stanek's Gift - Serenity", "SoA - Might of Ares", "SoA - Wisdom of Athena", "SoA - Trickery of Hermes", "SoA - Beauty of Aphrodite", "SoA - Chaos of Dionysus", "SoA - Flood of Poseidon", "SoA - Hunt of Artemis", "SoA - Knowledge of Apollo", "SoA - phyzical WKS harmonizer"]

export async function main(ns) {
  const do_buy = ns.args[0] == "buy"
  const sing = ns.singularity
  const owned = ns.singularity.getOwnedAugmentations(true)

  //console.log("NWO - Netburner",
  //  sing.purchaseAugmentation("NWO", "Embedded Netburner Module Core Implant"))
  //console.log("NWO - Neurotrainer III",
  //  sing.purchaseAugmentation("NWO", "Neurotrainer III"))


  const augmentations = aug_enum
  //let augmentations = []
  //const factions = ns.singularity.getAugmentationFactions("NeuroFlux Governor")
  //const wtf = factions.map(e => { return { name: e, req: ns.singularity.getFactionInviteRequirements(e) } }
  //for (const faction of factions) {
  //  for (const name of ns.singularity.getAugmentationsFromFaction(faction)) {
  //    augmentations.push(name)
  //  }
  //}
  //augmentations = [...new Set(augmentations)]

  for (const name of augmentations.filter(e => !owned.includes(e))) {
    let stats = ns.singularity.getAugmentationStats(name);
    stats = Object.fromEntries(Object.entries(stats).filter(([key, value]) => value > 1))
    // console.log(name, ns.singularity.getAugmentationBasePrice(name), stats)
  }

  let hacky = []
  for (const name of augmentations.filter(e => !owned.includes(e))) {
    const stats = ns.singularity.getAugmentationStats(name);
    //const stat = e.hacking * e.hacking_chance * e.hacking_exp * e.hacking_grow * e.hacking_money * e.hacking_speed
    const stat = Object.keys(stats)
      .filter(key => key.startsWith('hacking'))
      .reduce((res, key) => res * stats[key], 1);

    let buy_from = sing.getAugmentationFactions(name).map(e => {
      return { faction: e, rep: sing.getFactionRep(e) }
    })
    if (buy_from.length == 0) {
      console.log(name, buy_from)
      continue
    }
    buy_from.sort((a, b) => b.rep - a.rep)

    hacky.push({
      name: name,
      cost: ns.singularity.getAugmentationPrice(name),
      stat: stat,
      stats: stats,
      factions: buy_from,
      rep: ns.singularity.getAugmentationRepReq(name),
      req: ns.singularity.getAugmentationPrereq(name).filter(e => !owned.includes(e)),
    })
  }
  hacky.sort((a, b) => (a.cost / (a.stat - 1)) - (b.cost / (b.stat - 1)))
  hacky.sort((a, b) => {
    let res = a.cost / (a.stats.hacking - 1) - b.cost / (b.stats.hacking - 1)
    if (res != 0) return res
    res = a.cost / (a.stats.hacking_chance * a.stats.hacking_exp * a.stats.hacking_money * a.stats.hacking_speed)
    res -= b.cost / (b.stats.hacking_chance * b.stats.hacking_exp * b.stats.hacking_money * b.stats.hacking_speed)
    if (res != 0) return res
    res = a.cost / (a.stats.hacking_grow - 1) - b.cost / (b.stats.hacking_grow - 1)
    if (res != 0) return res
    return b.cost / (a.stats.faction_rep - 1) - b.cost / (b.stats.faction_rep - 1)
  })
  hacky.sort((a, b) => Number(b.rep < b.factions[0].rep) - Number(a.rep < a.factions[0].rep))

  const avail = hacky.filter(e => e.rep < e.factions[0].rep)
  const fmt = ns.formatNumber
  console.log(
    tot_cost(avail).map(e => fmt(e)),
    tot_cost(hacky).map(e => fmt(e)), hacky)

  for (let i = 0; i < hacky.length; ++i) {
    const f = hacky[i].factions[0]
    let cost = f.rep >= hacky[i].rep ? '+ ' : '- '
    cost += fmt(tot_cost(hacky.slice(0, i + 1))[0])
    ns.tprint(`${cost}  ${f.faction} - ${hacky[i].name} ${fmt(hacky[i].cost)} - rep: ${fmt(hacky[i].rep)} (${fmt(f.rep)})`);
  }

  ns.tprint(`\nAvailable cost: ${fmt(tot_cost(avail)[0])}`);
  avail.sort((a, b) => {
    return b.req.reduce((min, e) => Math.min(min, sing.getAugmentationPrice(e)), b.cost)
      - a.req.reduce((min, e) => Math.min(min, sing.getAugmentationPrice(e)), a.cost)
  })

  let improvement = {}
  for (const aug of avail) {
    for (const [property, value] of Object.entries(sing.getAugmentationStats(aug.name))) {
      improvement[property] = (improvement[property] || 0) + value - 1
    }
    const f = aug.factions[0]
    const cost = sing.getAugmentationPrice(aug.name)
    let res = "FAILED!"
    if (do_buy && sing.purchaseAugmentation(f.faction, aug.name)) {
      res = "bought from"
      await ns.sleep(500)
    }
    ns.tprint(`${res} ${f.faction} - ${aug.name} (${fmt(cost)})`);
  }
  for (const [property, value] of Object.entries(improvement)) {
    if (value != 0) {
      ns.tprint(`${property} += ${ns.formatPercent(value)}`);
    }
  }

}

function tot_cost(augs) {
  const sorted = augs.slice().sort((a, b) => b.cost - a.cost)
  let stat = 0;
  let cost = 0;
  let i = 1
  for (const aug of sorted) {
    stat += aug.stat - 1
    cost += aug.cost * i
    i *= 1.9
  }
  return [cost, stat]
}
