import type { DeviceNodeData } from '../../types/soc';
import type { Patch, SystemContext } from '../../types/engine';
import { getProfile } from '../../data/deviceProfiles';
import { jitterClamped, chance } from '../../utils/random';

/**
 * TelemetrySystem: jitter CPU, RAM, disk, temperature, power, fan, sessions
 * for every node according to its device profile.
 */
export function telemetryTick(
  nodes: { id: string; data: DeviceNodeData }[],
  _edges: any[],
  ctx: SystemContext
): Patch[] {
  const patches: Patch[] = [];

  for (const node of nodes) {
    const profile = getProfile(node.data.deviceType);
    const data = node.data;

    // CPU jitter + random spikes
    let cpu = jitterClamped(data.cpu, profile.cpuJitter, 1, 99);
    if (chance(profile.cpuSpikeChance)) {
      cpu = Math.min(cpu + profile.cpuSpikeMagnitude, 99);
    }

    // RAM jitter
    const ram = jitterClamped(data.ram, profile.ramJitter, 0.1, data.maxRam);

    // Disk — slow growth
    const disk = jitterClamped(data.disk, profile.diskGrowthPerTick, 1, 99);

    // Temperature — correlates with CPU
    const tempBase = data.temperature ?? profile.baseTempC;
    const tempDelta = (cpu - profile.baseCpu) * 0.3;
    const temp = jitterClamped(tempBase + tempDelta, profile.tempJitter, 25, 95);

    // Power — rough CPU * 1.5
    const power = Math.round(cpu * 1.2 + (data.ram / data.maxRam) * 20);

    // Fan RPM — scales with temperature
    const fanRpm = Math.round(800 + (temp - 30) * 30);

    // Sessions — gentle jitter around current or from profile
    const sessions = Math.max(0, (data.sessions ?? 0) + Math.round(jitterClamped(0, 2, -3, 5)));

    patches.push({
      nodeId: node.id,
      data: {
        cpu: Math.round(cpu),
        ram: Math.round(ram * 10) / 10,
        disk: Math.round(disk),
        temperature: Math.round(temp),
        power,
        fanRpm,
        sessions,
        lastTickAt: ctx.simTime,
      },
    });
  }

  return patches;
}
