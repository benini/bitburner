export async function main(ns) {
  const player = ns.getPlayer()
  const skills = player.skills

  const curr_work = ns.singularity.getCurrentWork()
  if (curr_work != null && !["CLASS", "CRIME"].includes(curr_work.type))
    return

  if (skills.hacking < 50)
    return ns.singularity.universityCourse("Rothman University", "algorithms")

  let crime = "Mug"
  let target_skill = ns.singularity.getCrimeChance(crime) >= 1 ? 0 : 40
  let workout = ["agility", "defense", "dexterity", "strength"]
  if (ns.getTotalScriptIncome()[0] > 50000) {
    crime = "Traffick Arms"
    target_skill = ns.singularity.getCrimeChance(crime) >= 1 ? 0 : 500
    workout = ["agility", "defense", "dexterity", "strength", "charisma"]
  } else if (ns.getTotalScriptIncome()[0] > 5000) {
    crime = "Deal Drugs"
    target_skill = ns.singularity.getCrimeChance(crime) >= 1 ? 0 : 150
    workout = ["agility", "dexterity", "charisma"]
  }

  const focus = ns.singularity.isFocused()
  workout.sort((a, b) => skills[a] - skills[b])
  if (skills[workout[0]] < target_skill) {
    if (curr_work != null && curr_work.type == "CLASS" && workout[0].startsWith(curr_work.classType))
      return

    if (workout[0] == "charisma") {
      return ns.singularity.universityCourse("Rothman University", "leadership", focus)
    }
    return ns.singularity.gymWorkout("powerhouse gym", workout[0], focus)
  }

  if (curr_work != null && curr_work.type == "CRIME" && curr_work.crimeType == crime)
    return

  return ns.singularity.commitCrime(crime, focus)

  //skill == "charisma"
  //ns.singularity.universityCourse("Rothman University", "leadership")

  // Access the property using bracket notation
  // work[work.type.toLowerCase() + "Type"];

  //{
  //  "type": "CRIME",
  //    "cyclesWorked": 38,
  //      "crimeType": "Mug"
  //}
  //{
  //  "type": "CLASS",
  //    "cyclesWorked": 20,
  //      "classType": "str",
  //        "location": "Powerhouse Gym"
  //}

  //for (const [skill, value] of Object.entries(skills)) {
  //  if (value > 45) continue;
  //  if (["agility", "defense", "dexterity", "strength"].includes(skill)) {
  //    ns.singularity.gymWorkout("powerhouse gym", skill)
  //  }
  //  if (skill == "charisma") {
  //    ns.singularity.universityCourse("Rothman University", "leadership")
  //  }
  //}

  // console.log(ns.getPlayer())
  // console.log(ns.singularity.getCurrentWork())
  // console.log(Object.entries(skills))
  // ns.singularity.gymWorkout("millenium fitness gym", "Agility")
  // ns.singularity.universityCourse("zb", "Algorithms")
  // ns.singularity.universityCourse("zb", "Leadership")
  // const programs = ns.singularity.getDarkwebPrograms();

}
