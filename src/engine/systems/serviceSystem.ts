import type { DeviceNodeData, DeviceService } from '../../types/soc';
import type { Patch, SystemContext } from '../../types/engine';
import { getProfile } from '../../data/deviceProfiles';
import { chance } from '../../utils/random';

/**
 * ServiceSystem: transition service states (running → stopped → restarting → running)
 * according to profile templates.
 */
export function serviceTick(
  nodes: { id: string; data: DeviceNodeData }[],
  _edges: any[],
  _ctx: SystemContext
): Patch[] {
  const patches: Patch[] = [];

  for (const node of nodes) {
    const profile = getProfile(node.data.deviceType);
    const currentServices: DeviceService[] = node.data.services ? [...node.data.services] : [];
    let changed = false;

    // Ensure profile services are present
    for (const tmpl of profile.serviceTemplates) {
      const existing = currentServices.find(s => s.name === tmpl.name);
      if (!existing) {
        currentServices.push({
          name: tmpl.name,
          port: tmpl.port,
          status: 'running',
          protocol: tmpl.protocol,
        });
        changed = true;
      }
    }

    // Random state transitions for existing services
    for (let i = 0; i < currentServices.length; i++) {
      const svc = currentServices[i];
      const tmpl = profile.serviceTemplates.find(t => t.name === svc.name);
      if (!tmpl) continue;

      if (svc.status === 'running' && chance(tmpl.stopChance)) {
        currentServices[i] = { ...svc, status: 'stopped' };
        changed = true;
      } else if (svc.status === 'stopped' && chance(tmpl.restartChance)) {
        currentServices[i] = { ...svc, status: 'restarting' };
        changed = true;
      } else if (svc.status === 'restarting' && chance(0.5)) {
        currentServices[i] = { ...svc, status: 'running' };
        changed = true;
      }
    }

    if (changed) {
      patches.push({
        nodeId: node.id,
        data: { services: currentServices },
      });
    }
  }

  return patches;
}
