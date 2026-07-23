import type { DeviceNodeData } from '../../types/soc';
import type { Patch, SystemContext } from '../../types/engine';
import { getProfile } from '../../data/deviceProfiles';
import { chance, randInt, jitterClamped } from '../../utils/random';

/**
 * ProcessSystem: spawn and kill processes for each node according to its
 * device profile process templates.
 */
export function processTick(
  nodes: { id: string; data: DeviceNodeData }[],
  _edges: any[],
  _ctx: SystemContext
): Patch[] {
  const patches: Patch[] = [];

  for (const node of nodes) {
    const profile = getProfile(node.data.deviceType);
    const currentProcesses = [...(node.data.processes ?? [])];
    let changed = false;

    // Try to spawn new processes
    for (const tmpl of profile.processTemplates) {
      if (chance(tmpl.spawnChance)) {
        const alreadyRunning = currentProcesses.some(p => p.name === tmpl.name);
        if (!alreadyRunning) {
          currentProcesses.push({
            pid: randInt(2000, 32000),
            name: tmpl.name,
            cpu: jitterClamped(tmpl.cpuBase, tmpl.cpuJitter, 0.5, 99),
            memoryMb: Math.round(jitterClamped(tmpl.memoryMbBase, tmpl.memoryMbJitter, 10, 64000)),
            isMalicious: tmpl.isMalicious,
          });
          changed = true;
        }
      }
    }

    // Try to kill existing non-malicious processes
    for (let i = currentProcesses.length - 1; i >= 0; i--) {
      const proc = currentProcesses[i];
      if (proc.isMalicious) continue; // don't auto-kill malicious processes
      const tmpl = profile.processTemplates.find(t => t.name === proc.name);
      if (tmpl && chance(tmpl.killChance)) {
        currentProcesses.splice(i, 1);
        changed = true;
      }
    }

    if (changed) {
      patches.push({
        nodeId: node.id,
        data: { processes: currentProcesses },
      });
    }
  }

  return patches;
}
