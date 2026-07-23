import type { DeviceBehaviorProfile } from '../types/engine';
import type { DeviceType } from '../types/soc';

/**
 * Default behavior profiles for all 16 DeviceTypes.
 * Each profile defines telemetry ranges, process/service/user templates,
 * and attack reactions.
 */

function noReaction(_data: any, _attackType: string): Partial<any> {
  return {}; // default: no special reaction
}

/** ── ENDPOINT PROFILES ── */

const pcProfile: DeviceBehaviorProfile = {
  deviceType: 'pc',
  baseCpu: 15, cpuJitter: 8, cpuSpikeChance: 0.05, cpuSpikeMagnitude: 30,
  baseRamGb: 6, ramJitter: 1.5,
  baseDiskPercent: 45, diskGrowthPerTick: 0.1,
  baseTempC: 42, tempJitter: 5,
  baseThroughputMbps: 15, throughputJitter: 10,
  processTemplates: [
    { name: 'chrome.exe', cpuBase: 8, cpuJitter: 4, memoryMbBase: 600, memoryMbJitter: 200, spawnChance: 0.1, killChance: 0.05 },
    { name: 'outlook.exe', cpuBase: 5, cpuJitter: 2, memoryMbBase: 300, memoryMbJitter: 100, spawnChance: 0.08, killChance: 0.03 },
    { name: 'explorer.exe', cpuBase: 3, cpuJitter: 1, memoryMbBase: 150, memoryMbJitter: 50, spawnChance: 0.02, killChance: 0.01 },
    { name: 'winword.exe', cpuBase: 6, cpuJitter: 3, memoryMbBase: 250, memoryMbJitter: 100, spawnChance: 0.06, killChance: 0.04 },
  ],
  serviceTemplates: [
    { name: 'DHCP Client', port: 68, protocol: 'udp', restartChance: 0.001, stopChance: 0.001 },
    { name: 'Windows Update', port: 443, protocol: 'tcp', restartChance: 0.002, stopChance: 0.005 },
  ],
  userTemplates: [
    { username: 'employee1', role: 'employee', loginChance: 0.05, activityChance: 0.3, logoutChance: 0.02 },
  ],
  backgroundEventChance: 0.15, logCategories: ['application', 'security'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ransomware') {
      return { cpu: Math.min(data.cpu + 50, 99), temperature: (data.temperature ?? 42) + 15 };
    }
    if (attackType === 'brute_force') {
      return { cpu: Math.min(data.cpu + 20, 85), sessions: (data.sessions ?? 0) + 50 };
    }
    return {};
  },
};

const laptopProfile: DeviceBehaviorProfile = {
  deviceType: 'laptop',
  baseCpu: 18, cpuJitter: 10, cpuSpikeChance: 0.08, cpuSpikeMagnitude: 35,
  baseRamGb: 8, ramJitter: 2,
  baseDiskPercent: 55, diskGrowthPerTick: 0.08,
  baseTempC: 48, tempJitter: 6,
  baseThroughputMbps: 25, throughputJitter: 15,
  processTemplates: [
    { name: 'vscode', cpuBase: 12, cpuJitter: 6, memoryMbBase: 1200, memoryMbJitter: 400, spawnChance: 0.12, killChance: 0.03 },
    { name: 'docker', cpuBase: 8, cpuJitter: 4, memoryMbBase: 1800, memoryMbJitter: 600, spawnChance: 0.05, killChance: 0.02 },
    { name: 'spotify', cpuBase: 3, cpuJitter: 2, memoryMbBase: 200, memoryMbJitter: 80, spawnChance: 0.07, killChance: 0.06 },
  ],
  serviceTemplates: [
    { name: 'SSH', port: 22, protocol: 'tcp', restartChance: 0.001, stopChance: 0.001 },
    { name: 'Docker Engine', port: 2375, protocol: 'tcp', restartChance: 0.002, stopChance: 0.003 },
  ],
  userTemplates: [
    { username: 'dev_admin', role: 'admin', loginChance: 0.1, activityChance: 0.4, logoutChance: 0.03 },
  ],
  backgroundEventChance: 0.12, logCategories: ['application'],
  reactToAttack: noReaction,
};

const iotProfile: DeviceBehaviorProfile = {
  deviceType: 'iot',
  baseCpu: 5, cpuJitter: 3, cpuSpikeChance: 0.02, cpuSpikeMagnitude: 15,
  baseRamGb: 0.5, ramJitter: 0.2,
  baseDiskPercent: 30, diskGrowthPerTick: 0.02,
  baseTempC: 38, tempJitter: 4,
  baseThroughputMbps: 1, throughputJitter: 0.5,
  processTemplates: [
    { name: 'sensor_daemon', cpuBase: 3, cpuJitter: 1, memoryMbBase: 40, memoryMbJitter: 10, spawnChance: 0.01, killChance: 0.005 },
    { name: 'mqtt_client', cpuBase: 2, cpuJitter: 1, memoryMbBase: 25, memoryMbJitter: 10, spawnChance: 0.03, killChance: 0.01 },
  ],
  serviceTemplates: [
    { name: 'MQTT', port: 1883, protocol: 'tcp', restartChance: 0.005, stopChance: 0.01 },
  ],
  userTemplates: [],
  backgroundEventChance: 0.05, logCategories: ['network'],
  reactToAttack: noReaction,
};

const cameraProfile: DeviceBehaviorProfile = {
  deviceType: 'camera',
  baseCpu: 8, cpuJitter: 4, cpuSpikeChance: 0.03, cpuSpikeMagnitude: 20,
  baseRamGb: 1.2, ramJitter: 0.3,
  baseDiskPercent: 60, diskGrowthPerTick: 0.15,
  baseTempC: 45, tempJitter: 3,
  baseThroughputMbps: 50, throughputJitter: 20,
  processTemplates: [
    { name: 'rtsp_server', cpuBase: 5, cpuJitter: 2, memoryMbBase: 150, memoryMbJitter: 50, spawnChance: 0.02, killChance: 0.005 },
    { name: 'motion_detect', cpuBase: 4, cpuJitter: 2, memoryMbBase: 80, memoryMbJitter: 30, spawnChance: 0.04, killChance: 0.01 },
  ],
  serviceTemplates: [
    { name: 'RTSP', port: 554, protocol: 'tcp', restartChance: 0.003, stopChance: 0.002 },
  ],
  userTemplates: [],
  backgroundEventChance: 0.08, logCategories: ['network'],
  reactToAttack: noReaction,
};

/** ── NETWORKING PROFILES ── */

const routerProfile: DeviceBehaviorProfile = {
  deviceType: 'router',
  baseCpu: 20, cpuJitter: 5, cpuSpikeChance: 0.1, cpuSpikeMagnitude: 25,
  baseRamGb: 4, ramJitter: 0.8,
  baseDiskPercent: 35, diskGrowthPerTick: 0.05,
  baseTempC: 55, tempJitter: 4,
  baseThroughputMbps: 500, throughputJitter: 100,
  processTemplates: [
    { name: 'bgpd', cpuBase: 5, cpuJitter: 2, memoryMbBase: 150, memoryMbJitter: 50, spawnChance: 0.01, killChance: 0.002 },
    { name: 'ospfd', cpuBase: 4, cpuJitter: 1, memoryMbBase: 100, memoryMbJitter: 30, spawnChance: 0.01, killChance: 0.002 },
    { name: 'snmpd', cpuBase: 2, cpuJitter: 1, memoryMbBase: 40, memoryMbJitter: 10, spawnChance: 0.02, killChance: 0.005 },
  ],
  serviceTemplates: [
    { name: 'BGP', port: 179, protocol: 'tcp', restartChance: 0.002, stopChance: 0.001 },
    { name: 'SNMP', port: 161, protocol: 'udp', restartChance: 0.002, stopChance: 0.002 },
  ],
  userTemplates: [
    { username: 'net_admin', role: 'admin', loginChance: 0.04, activityChance: 0.2, logoutChance: 0.05 },
  ],
  backgroundEventChance: 0.2, logCategories: ['network', 'syslog'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ddos') {
      return { cpu: 99, throughputMbps: 980, pps: 85000, temperature: (data.temperature ?? 55) + 20, congestion: 0.95 };
    }
    if (attackType === 'nmap') {
      return { cpu: Math.min(data.cpu + 15, 60) };
    }
    return {};
  },
};

const switchProfile: DeviceBehaviorProfile = {
  deviceType: 'switch',
  baseCpu: 12, cpuJitter: 4, cpuSpikeChance: 0.06, cpuSpikeMagnitude: 20,
  baseRamGb: 3, ramJitter: 0.5,
  baseDiskPercent: 25, diskGrowthPerTick: 0.03,
  baseTempC: 50, tempJitter: 3,
  baseThroughputMbps: 800, throughputJitter: 200,
  processTemplates: [
    { name: 'lacpd', cpuBase: 3, cpuJitter: 1, memoryMbBase: 80, memoryMbJitter: 20, spawnChance: 0.01, killChance: 0.002 },
    { name: 'stpd', cpuBase: 2, cpuJitter: 1, memoryMbBase: 50, memoryMbJitter: 15, spawnChance: 0.01, killChance: 0.002 },
    { name: 'lldpd', cpuBase: 1, cpuJitter: 0.5, memoryMbBase: 30, memoryMbJitter: 10, spawnChance: 0.02, killChance: 0.003 },
  ],
  serviceTemplates: [
    { name: 'LLDP', port: 0, protocol: 'udp', restartChance: 0.001, stopChance: 0.001 },
  ],
  userTemplates: [],
  backgroundEventChance: 0.15, logCategories: ['network', 'syslog'],
  reactToAttack: (_data, _attackType) => {
    if (_attackType === 'ddos') {
      return { cpu: 95, throughputMbps: 980, pps: 120000, congestion: 0.9 };
    }
    return {};
  },
};

const firewallProfile: DeviceBehaviorProfile = {
  deviceType: 'firewall',
  baseCpu: 22, cpuJitter: 6, cpuSpikeChance: 0.08, cpuSpikeMagnitude: 30,
  baseRamGb: 5, ramJitter: 1,
  baseDiskPercent: 30, diskGrowthPerTick: 0.08,
  baseTempC: 52, tempJitter: 4,
  baseThroughputMbps: 600, throughputJitter: 150,
  processTemplates: [
    { name: 'threat_engine', cpuBase: 12, cpuJitter: 5, memoryMbBase: 1000, memoryMbJitter: 300, spawnChance: 0.01, killChance: 0.002 },
    { name: 'pan_mgmt', cpuBase: 5, cpuJitter: 2, memoryMbBase: 400, memoryMbJitter: 100, spawnChance: 0.01, killChance: 0.002 },
    { name: 'vpn_gateway', cpuBase: 4, cpuJitter: 2, memoryMbBase: 250, memoryMbJitter: 80, spawnChance: 0.02, killChance: 0.003 },
  ],
  serviceTemplates: [
    { name: 'Web UI', port: 443, protocol: 'tcp', restartChance: 0.002, stopChance: 0.001 },
    { name: 'VPN', port: 8443, protocol: 'tcp', restartChance: 0.003, stopChance: 0.002 },
  ],
  userTemplates: [
    { username: 'sec_admin', role: 'admin', loginChance: 0.05, activityChance: 0.3, logoutChance: 0.04 },
  ],
  backgroundEventChance: 0.3, logCategories: ['security', 'network', 'syslog'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ddos') {
      return { cpu: 99, throughputMbps: 950, pps: 95000, temperature: (data.temperature ?? 52) + 18, congestion: 0.85 };
    }
    if (attackType === 'nmap') {
      // Firewall actively blocks scans
      return { cpu: Math.min(data.cpu + 25, 70), sessions: (data.sessions ?? 0) + 100 };
    }
    if (attackType === 'brute_force') {
      return { cpu: Math.min(data.cpu + 30, 80) };
    }
    return {};
  },
};

const apProfile: DeviceBehaviorProfile = {
  deviceType: 'ap',
  baseCpu: 10, cpuJitter: 5, cpuSpikeChance: 0.04, cpuSpikeMagnitude: 20,
  baseRamGb: 1.5, ramJitter: 0.4,
  baseDiskPercent: 20, diskGrowthPerTick: 0.02,
  baseTempC: 44, tempJitter: 5,
  baseThroughputMbps: 100, throughputJitter: 40,
  processTemplates: [
    { name: 'hostapd', cpuBase: 4, cpuJitter: 2, memoryMbBase: 60, memoryMbJitter: 20, spawnChance: 0.01, killChance: 0.003 },
    { name: 'dhcpd', cpuBase: 2, cpuJitter: 1, memoryMbBase: 35, memoryMbJitter: 10, spawnChance: 0.02, killChance: 0.005 },
  ],
  serviceTemplates: [
    { name: 'DHCP', port: 67, protocol: 'udp', restartChance: 0.003, stopChance: 0.002 },
    { name: 'HTTP', port: 80, protocol: 'tcp', restartChance: 0.002, stopChance: 0.002 },
  ],
  userTemplates: [
    { username: 'guest_user', role: 'guest', loginChance: 0.08, activityChance: 0.2, logoutChance: 0.06 },
  ],
  backgroundEventChance: 0.1, logCategories: ['network'],
  reactToAttack: noReaction,
};

const internetProfile: DeviceBehaviorProfile = {
  deviceType: 'internet',
  baseCpu: 8, cpuJitter: 3, cpuSpikeChance: 0.02, cpuSpikeMagnitude: 10,
  baseRamGb: 2, ramJitter: 0.5,
  baseDiskPercent: 10, diskGrowthPerTick: 0.01,
  baseTempC: 35, tempJitter: 2,
  baseThroughputMbps: 2000, throughputJitter: 500,
  processTemplates: [
    { name: 'bgpd', cpuBase: 3, cpuJitter: 1, memoryMbBase: 120, memoryMbJitter: 40, spawnChance: 0.01, killChance: 0.002 },
  ],
  serviceTemplates: [],
  userTemplates: [],
  backgroundEventChance: 0.05, logCategories: ['network'],
  reactToAttack: noReaction,
};

/** ── SERVER PROFILES ── */

const serverLinuxProfile: DeviceBehaviorProfile = {
  deviceType: 'server_linux',
  baseCpu: 30, cpuJitter: 8, cpuSpikeChance: 0.1, cpuSpikeMagnitude: 25,
  baseRamGb: 8, ramJitter: 2,
  baseDiskPercent: 50, diskGrowthPerTick: 0.12,
  baseTempC: 58, tempJitter: 5,
  baseThroughputMbps: 200, throughputJitter: 60,
  processTemplates: [
    { name: 'nginx', cpuBase: 10, cpuJitter: 4, memoryMbBase: 250, memoryMbJitter: 80, spawnChance: 0.02, killChance: 0.005 },
    { name: 'node_api', cpuBase: 15, cpuJitter: 5, memoryMbBase: 600, memoryMbJitter: 200, spawnChance: 0.03, killChance: 0.005 },
    { name: 'sshd', cpuBase: 1, cpuJitter: 0.5, memoryMbBase: 40, memoryMbJitter: 10, spawnChance: 0.02, killChance: 0.01 },
    { name: 'cron', cpuBase: 2, cpuJitter: 1, memoryMbBase: 20, memoryMbJitter: 10, spawnChance: 0.04, killChance: 0.02 },
  ],
  serviceTemplates: [
    { name: 'HTTP/HTTPS', port: 443, protocol: 'tcp', restartChance: 0.003, stopChance: 0.001 },
    { name: 'SSH', port: 22, protocol: 'tcp', restartChance: 0.002, stopChance: 0.002 },
  ],
  userTemplates: [
    { username: 'devops', role: 'admin', loginChance: 0.06, activityChance: 0.3, logoutChance: 0.04 },
  ],
  backgroundEventChance: 0.25, logCategories: ['application', 'syslog'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ransomware') {
      return { cpu: 99, disk: Math.min(data.disk + 20, 99), temperature: (data.temperature ?? 58) + 18 };
    }
    if (attackType === 'exfiltration') {
      return { throughputMbps: (data.throughputMbps ?? 200) * 1.5, sessions: (data.sessions ?? 0) + 30 };
    }
    if (attackType === 'brute_force') {
      return { cpu: Math.min(data.cpu + 20, 80), sessions: (data.sessions ?? 0) + 100 };
    }
    return {};
  },
};

const serverWinProfile: DeviceBehaviorProfile = {
  deviceType: 'server_win',
  baseCpu: 25, cpuJitter: 7, cpuSpikeChance: 0.08, cpuSpikeMagnitude: 30,
  baseRamGb: 12, ramJitter: 3,
  baseDiskPercent: 55, diskGrowthPerTick: 0.1,
  baseTempC: 56, tempJitter: 4,
  baseThroughputMbps: 150, throughputJitter: 40,
  processTemplates: [
    { name: 'lsass.exe', cpuBase: 4, cpuJitter: 2, memoryMbBase: 200, memoryMbJitter: 60, spawnChance: 0.01, killChance: 0.002 },
    { name: 'dns.exe', cpuBase: 6, cpuJitter: 2, memoryMbBase: 300, memoryMbJitter: 100, spawnChance: 0.02, killChance: 0.003 },
    { name: 'kerberos.exe', cpuBase: 5, cpuJitter: 2, memoryMbBase: 250, memoryMbJitter: 80, spawnChance: 0.02, killChance: 0.003 },
    { name: 'dfsrs.exe', cpuBase: 3, cpuJitter: 1, memoryMbBase: 180, memoryMbJitter: 50, spawnChance: 0.01, killChance: 0.002 },
  ],
  serviceTemplates: [
    { name: 'LDAP', port: 389, protocol: 'tcp', restartChance: 0.002, stopChance: 0.001 },
    { name: 'DNS', port: 53, protocol: 'udp', restartChance: 0.003, stopChance: 0.002 },
    { name: 'SMB', port: 445, protocol: 'tcp', restartChance: 0.002, stopChance: 0.001 },
  ],
  userTemplates: [
    { username: 'domain_admin', role: 'admin', loginChance: 0.08, activityChance: 0.3, logoutChance: 0.03 },
    { username: 'svc_account', role: 'admin', loginChance: 0.15, activityChance: 0.6, logoutChance: 0.02 },
  ],
  backgroundEventChance: 0.2, logCategories: ['application', 'security', 'syslog'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ransomware') {
      return { cpu: 99, disk: Math.min(data.disk + 25, 99) };
    }
    if (attackType === 'brute_force') {
      return { cpu: Math.min(data.cpu + 25, 85), sessions: (data.sessions ?? 0) + 200 };
    }
    return {};
  },
};

const databaseProfile: DeviceBehaviorProfile = {
  deviceType: 'database',
  baseCpu: 28, cpuJitter: 6, cpuSpikeChance: 0.12, cpuSpikeMagnitude: 35,
  baseRamGb: 14, ramJitter: 3,
  baseDiskPercent: 70, diskGrowthPerTick: 0.2,
  baseTempC: 60, tempJitter: 4,
  baseThroughputMbps: 250, throughputJitter: 80,
  processTemplates: [
    { name: 'postgres', cpuBase: 20, cpuJitter: 5, memoryMbBase: 4000, memoryMbJitter: 1000, spawnChance: 0.02, killChance: 0.003 },
    { name: 'sshd', cpuBase: 1, cpuJitter: 0.5, memoryMbBase: 45, memoryMbJitter: 10, spawnChance: 0.02, killChance: 0.01 },
    { name: 'pg_stat', cpuBase: 3, cpuJitter: 1, memoryMbBase: 80, memoryMbJitter: 20, spawnChance: 0.03, killChance: 0.01 },
  ],
  serviceTemplates: [
    { name: 'PostgreSQL', port: 5432, protocol: 'tcp', restartChance: 0.003, stopChance: 0.001 },
    { name: 'SSH', port: 22, protocol: 'tcp', restartChance: 0.002, stopChance: 0.002 },
  ],
  userTemplates: [
    { username: 'db_admin', role: 'admin', loginChance: 0.05, activityChance: 0.4, logoutChance: 0.03 },
    { username: 'app_user', role: 'employee', loginChance: 0.2, activityChance: 0.5, logoutChance: 0.02 },
  ],
  backgroundEventChance: 0.25, logCategories: ['application', 'syslog'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ransomware' || attackType === 'exfiltration') {
      return { cpu: 99, disk: Math.min(data.disk + 30, 99), throughputMbps: (data.throughputMbps ?? 250) * 3, sessions: (data.sessions ?? 0) + 100 };
    }
    return {};
  },
};

const mailProfile: DeviceBehaviorProfile = {
  deviceType: 'mail',
  baseCpu: 20, cpuJitter: 5, cpuSpikeChance: 0.06, cpuSpikeMagnitude: 20,
  baseRamGb: 6, ramJitter: 1.5,
  baseDiskPercent: 60, diskGrowthPerTick: 0.18,
  baseTempC: 54, tempJitter: 4,
  baseThroughputMbps: 80, throughputJitter: 30,
  processTemplates: [
    { name: 'postfix', cpuBase: 8, cpuJitter: 3, memoryMbBase: 200, memoryMbJitter: 60, spawnChance: 0.02, killChance: 0.005 },
    { name: 'dovecot', cpuBase: 6, cpuJitter: 2, memoryMbBase: 180, memoryMbJitter: 50, spawnChance: 0.02, killChance: 0.005 },
    { name: 'amavis', cpuBase: 4, cpuJitter: 2, memoryMbBase: 300, memoryMbJitter: 100, spawnChance: 0.015, killChance: 0.005 },
  ],
  serviceTemplates: [
    { name: 'SMTP', port: 25, protocol: 'tcp', restartChance: 0.003, stopChance: 0.001 },
    { name: 'IMAP', port: 143, protocol: 'tcp', restartChance: 0.002, stopChance: 0.001 },
    { name: 'IMAPS', port: 993, protocol: 'tcp', restartChance: 0.002, stopChance: 0.001 },
  ],
  userTemplates: [
    { username: 'mail_admin', role: 'admin', loginChance: 0.04, activityChance: 0.3, logoutChance: 0.03 },
  ],
  backgroundEventChance: 0.2, logCategories: ['application', 'security'],
  reactToAttack: noReaction,
};

const dnsProfile: DeviceBehaviorProfile = {
  deviceType: 'dns',
  baseCpu: 15, cpuJitter: 5, cpuSpikeChance: 0.1, cpuSpikeMagnitude: 25,
  baseRamGb: 3, ramJitter: 0.8,
  baseDiskPercent: 25, diskGrowthPerTick: 0.05,
  baseTempC: 48, tempJitter: 4,
  baseThroughputMbps: 120, throughputJitter: 40,
  processTemplates: [
    { name: 'named', cpuBase: 8, cpuJitter: 3, memoryMbBase: 350, memoryMbJitter: 100, spawnChance: 0.02, killChance: 0.003 },
    { name: 'sshd', cpuBase: 1, cpuJitter: 0.5, memoryMbBase: 40, memoryMbJitter: 10, spawnChance: 0.02, killChance: 0.01 },
  ],
  serviceTemplates: [
    { name: 'DNS', port: 53, protocol: 'udp', restartChance: 0.003, stopChance: 0.001 },
    { name: 'SSH', port: 22, protocol: 'tcp', restartChance: 0.002, stopChance: 0.002 },
  ],
  userTemplates: [],
  backgroundEventChance: 0.3, logCategories: ['network', 'syslog'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ddos') {
      return { cpu: 99, throughputMbps: (data.throughputMbps ?? 120) * 5, sessions: (data.sessions ?? 0) + 5000 };
    }
    return {};
  },
};

/** ── SECURITY PROFILES ── */

const honeypotProfile: DeviceBehaviorProfile = {
  deviceType: 'honeypot',
  baseCpu: 5, cpuJitter: 2, cpuSpikeChance: 0.3, cpuSpikeMagnitude: 40,
  baseRamGb: 2, ramJitter: 0.5,
  baseDiskPercent: 15, diskGrowthPerTick: 0.03,
  baseTempC: 40, tempJitter: 3,
  baseThroughputMbps: 10, throughputJitter: 5,
  processTemplates: [
    { name: 'dionaea', cpuBase: 3, cpuJitter: 1, memoryMbBase: 100, memoryMbJitter: 30, spawnChance: 0.02, killChance: 0.005 },
    { name: 'cowrie', cpuBase: 2, cpuJitter: 1, memoryMbBase: 80, memoryMbJitter: 20, spawnChance: 0.02, killChance: 0.005 },
  ],
  serviceTemplates: [
    { name: 'Fake SMB', port: 445, protocol: 'tcp', restartChance: 0.01, stopChance: 0.01 },
    { name: 'Fake SSH', port: 22, protocol: 'tcp', restartChance: 0.01, stopChance: 0.01 },
  ],
  userTemplates: [],
  backgroundEventChance: 0.6, logCategories: ['security', 'syslog'],
  reactToAttack: (_data, _attackType) => {
    // Honeypot logs everything aggressively
    return { cpu: Math.min(_data.cpu + 10, 50) };
  },
};

const cloudProfile: DeviceBehaviorProfile = {
  deviceType: 'cloud',
  baseCpu: 25, cpuJitter: 8, cpuSpikeChance: 0.05, cpuSpikeMagnitude: 20,
  baseRamGb: 16, ramJitter: 4,
  baseDiskPercent: 40, diskGrowthPerTick: 0.1,
  baseTempC: 42, tempJitter: 3,
  baseThroughputMbps: 1000, throughputJitter: 200,
  processTemplates: [
    { name: 'ec2_instance', cpuBase: 8, cpuJitter: 3, memoryMbBase: 2000, memoryMbJitter: 500, spawnChance: 0.015, killChance: 0.003 },
    { name: 'vpc_nat', cpuBase: 4, cpuJitter: 2, memoryMbBase: 300, memoryMbJitter: 100, spawnChance: 0.01, killChance: 0.002 },
    { name: 'elasticache', cpuBase: 6, cpuJitter: 2, memoryMbBase: 1500, memoryMbJitter: 400, spawnChance: 0.01, killChance: 0.002 },
  ],
  serviceTemplates: [
    { name: 'HTTPS API', port: 443, protocol: 'tcp', restartChance: 0.002, stopChance: 0.001 },
  ],
  userTemplates: [
    { username: 'cloud_admin', role: 'admin', loginChance: 0.06, activityChance: 0.3, logoutChance: 0.03 },
  ],
  backgroundEventChance: 0.15, logCategories: ['application', 'syslog'],
  reactToAttack: (data, attackType) => {
    if (attackType === 'ddos') {
      return { throughputMbps: (data.throughputMbps ?? 1000) * 2, sessions: (data.sessions ?? 0) + 5000 };
    }
    if (attackType === 'exfiltration') {
      return { throughputMbps: (data.throughputMbps ?? 1000) * 3, sessions: (data.sessions ?? 0) + 200 };
    }
    return {};
  },
};

/** ── REGISTRY ── */

export const DEVICE_PROFILES: Record<DeviceType, DeviceBehaviorProfile> = {
  pc: pcProfile,
  laptop: laptopProfile,
  iot: iotProfile,
  camera: cameraProfile,
  router: routerProfile,
  switch: switchProfile,
  firewall: firewallProfile,
  ap: apProfile,
  internet: internetProfile,
  server_linux: serverLinuxProfile,
  server_win: serverWinProfile,
  database: databaseProfile,
  mail: mailProfile,
  dns: dnsProfile,
  honeypot: honeypotProfile,
  cloud: cloudProfile,
};

/**
 * Get the behavior profile for a device type.
 * Falls back to a generic default if not found.
 */
export function getProfile(type: DeviceType): DeviceBehaviorProfile {
  return DEVICE_PROFILES[type] ?? serverLinuxProfile;
}
