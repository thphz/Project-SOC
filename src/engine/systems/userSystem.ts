import type { DeviceNodeData, DeviceUser } from '../../types/soc';
import type { Patch, SystemContext } from '../../types/engine';
import { getProfile } from '../../data/deviceProfiles';
import { chance, pickRandom } from '../../utils/random';

/**
 * UserSystem: simulate user login/logout/idle/activity cycles for each node
 * according to its device profile user templates.
 */
export function userTick(
  nodes: { id: string; data: DeviceNodeData }[],
  _edges: any[],
  ctx: SystemContext
): Patch[] {
  const patches: Patch[] = [];

  for (const node of nodes) {
    const profile = getProfile(node.data.deviceType);
    if (profile.userTemplates.length === 0) continue;

    const currentUsers: DeviceUser[] = node.data.users ? [...node.data.users] : [];
    let changed = false;

    // Try to login users
    for (const tmpl of profile.userTemplates) {
      const existing = currentUsers.find(u => u.username === tmpl.username);
      if (!existing && chance(tmpl.loginChance)) {
        currentUsers.push({
          username: tmpl.username,
          role: tmpl.role,
          state: 'login',
          since: ctx.simTime,
          transferredMb: 0,
        });
        changed = true;
      }
    }

    // Transition existing users
    for (let i = 0; i < currentUsers.length; i++) {
      const user = currentUsers[i];
      const tmpl = profile.userTemplates.find(t => t.username === user.username);
      if (!tmpl) continue;

      if (user.state === 'login' && chance(0.3)) {
        currentUsers[i] = { ...user, state: 'idle', since: ctx.simTime };
        changed = true;
      } else if (user.state === 'idle' && chance(tmpl.activityChance)) {
        currentUsers[i] = {
          ...user,
          state: pickRandom(['download', 'upload']),
          since: ctx.simTime,
          transferredMb: (user.transferredMb ?? 0) + Math.round(Math.random() * 50),
        };
        changed = true;
      } else if ((user.state === 'download' || user.state === 'upload') && chance(0.4)) {
        currentUsers[i] = { ...user, state: 'idle', since: ctx.simTime };
        changed = true;
      } else if (chance(tmpl.logoutChance)) {
        currentUsers.splice(i, 1);
        i--;
        changed = true;
      }
    }

    if (changed) {
      patches.push({
        nodeId: node.id,
        data: { users: currentUsers },
      });
    }
  }

  return patches;
}
