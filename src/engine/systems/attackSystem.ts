import type { DeviceNodeData } from '../../types/soc';
import type { Patch } from '../../types/engine';
import { getProfile } from '../../data/deviceProfiles';

/**
 * AttackSystem: react to different attack types per device profile.
 * Returns patches that overlay the node's data with attack effects.
 */
export function reactToAttack(
  nodeId: string,
  currentData: DeviceNodeData,
  attackType: string
): Patch {
  const profile = getProfile(currentData.deviceType);
  const reaction = profile.reactToAttack(currentData, attackType);

  return {
    nodeId,
    data: reaction,
  };
}

/**
 * Determine if a device type is capable of routing/forwarding attacks.
 * Network devices can propagate; endpoints are leaf nodes.
 */
export function canPropagateAttack(deviceType: string): boolean {
  const routers = ['router', 'switch', 'firewall', 'internet', 'cloud', 'ap'];
  return routers.includes(deviceType);
}
