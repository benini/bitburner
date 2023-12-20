
export async function main(ns) {
  if (ns.getServer("home").maxRam <= 2 * 1024) {
    try {
      ns.singularity.upgradeHomeRam()
    } catch (error) { }
  }

  // let executables = ["AutoLink.exe", "BruteSSH.exe", "DeepscanV1.exe", "DeepscanV2.exe", "FTPCrack.exe", "Formulas.exe", "HTTPWorm.exe", "NUKE.exe", "SQLInject.exe", "ServerProfiler.exe", "relaySMTP.exe"]
  let executables = ["BruteSSH.exe", "FTPCrack.exe", "HTTPWorm.exe", "SQLInject.exe", "relaySMTP.exe"]
  try {
    ns.singularity.purchaseTor()
    for (const program of executables.filter(e => !ns.fileExists(e))) {
      ns.singularity.purchaseProgram(program)
    }
  } catch (error) { }
}
