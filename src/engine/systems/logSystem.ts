import type { DeviceNodeData, EventLogItem } from '../../types/soc';
import type { SystemContext, LogCategory } from '../../types/engine';
import { getProfile } from '../../data/deviceProfiles';
import { chance, pickRandom } from '../../utils/random';
import { genId } from '../../utils/id';

const LOG_MESSAGES: Record<LogCategory, string[]> = {
  application: [
    'Application health check passed',
    'Scheduled task completed successfully',
    'Cache invalidation triggered',
    'Database connection pool at {n}% capacity',
    'API request processed in {n}ms',
    'Memory usage threshold warning: {n}%',
    'File system write operation completed',
    'Application config reloaded',
    'Background job completed: cleanup',
  ],
  security: [
    'Failed login attempt from {ip}',
    'Firewall rule {n} matched: packet dropped',
    'IDS signature update applied',
    'User account locked after {n} failed attempts',
    'Authentication success: {user}',
    'Privilege escalation detected: {user}',
    'Suspicious outbound connection to {ip}:{port}',
    'Certificate validation warning',
    'Audit log rotated',
  ],
  network: [
    'Interface {name}: {n} packets dropped',
    'Route table updated via BGP',
    'ARP cache entry aged out',
    'Link state change: {name} UP',
    'STP topology change detected',
    'DHCP lease assigned to {ip}',
    'DNS query resolved in {n}ms',
    'NAT pool exhaustion at {n}%',
    'TCP retransmit rate: {n}%',
  ],
  syslog: [
    'Kernel: OOM killer invoked for PID {n}',
    'Disk I/O latency warning: {n}ms',
    'Systemd: Service {name} entered failed state',
    'Kernel module {name} loaded',
    'Cron job executed: {name}',
    'Memory cgroup limit reached for {name}',
    'Filesystem {name} at {n}% capacity',
    'Swap usage: {n}%',
  ],
};

function formatMessage(template: string, node: DeviceNodeData): string {
  const ip = node.ip || '10.0.0.1';
  const port = node.openPorts[0] || 80;
  const n = Math.round(Math.random() * 1000);
  const user = node.users?.[0]?.username || 'unknown';
  const name = node.hostname || 'unknown';
  return template
    .replace('{n}', String(n))
    .replace('{ip}', String(ip))
    .replace('{port}', String(port))
    .replace('{user}', user)
    .replace('{name}', name);
}

const LOG_LEVELS: Array<'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'> = [
  'INFO', 'INFO', 'INFO', 'WARNING', 'WARNING', 'ERROR',
];

/**
 * LogSystem: generate background event logs for nodes based on their
 * device profile's backgroundEventChance and logCategories.
 */
export function logTick(
  nodes: { id: string; data: DeviceNodeData }[],
  _edges: any[],
  ctx: SystemContext
): EventLogItem[] {
  const logs: EventLogItem[] = [];

  for (const node of nodes) {
    const profile = getProfile(node.data.deviceType);

    if (!chance(profile.backgroundEventChance)) continue;

    const logCategory = pickRandom(profile.logCategories);
    const messages = LOG_MESSAGES[logCategory];
    const template = pickRandom(messages);
    const message = formatMessage(template, node.data);
    const level = pickRandom(LOG_LEVELS);
    const sourceHost = node.data.hostname || node.id;

    logs.push({
      id: genId('log'),
      timestamp: ctx.simTime,
      level,
      sourceNodeId: node.id,
      sourceHost,
      message,
      details: `[${logCategory.toUpperCase()}] ${message}`,
    });
  }

  return logs;
}
