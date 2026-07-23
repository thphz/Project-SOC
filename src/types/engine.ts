import type { DeviceNodeData, DeviceType, EventLogItem } from './soc';

/**
 * Simulation context passed to every system tick.
 * Contains tick counter, current sim time, speed multiplier, and RNG state.
 */
export interface SystemContext {
  tick: number;
  simTime: string;
  simSpeed: number;
}

/**
 * A patch that updates a slice of a node's data.
 * Systems emit patches; the engine applies them to the store in batch.
 */
export interface Patch {
  nodeId: string;
  data: Partial<DeviceNodeData>;
}

/**
 * A network packet flowing between two nodes.
 */
export interface Packet {
  id: string;
  sourceId: string;
  targetId: string;
  protocol: 'tcp' | 'udp' | 'icmp';
  sizeBytes: number;
  timestamp: string;
}

/**
 * Routing metrics for a connection (edge) between two nodes.
 */
export interface RoutingMetrics {
  mbps: number;
  pps: number;
  latency: number; // ms
  packetLoss: number; // % 0-100
  congestion: number; // 0-1
}

/**
 * Result of a single system's tick operation.
 */
export interface SystemTickResult {
  nodePatches: Patch[];
  edgeUpdates?: Array<{ edgeId: string; data: Partial<RoutingMetrics> }>;
  logs?: EventLogItem[];
}

export type LogCategory = 'application' | 'security' | 'network' | 'syslog';

/**
 * Behavior profile for a DeviceType.
 * Defines default telemetry ranges, templates, and reactions.
 */
export interface DeviceBehaviorProfile {
  deviceType: DeviceType;

  // CPU behavior
  baseCpu: number;
  cpuJitter: number; // max delta per tick
  cpuSpikeChance: number; // 0-1
  cpuSpikeMagnitude: number;

  // RAM behavior
  baseRamGb: number;
  ramJitter: number;

  // Disk behavior
  baseDiskPercent: number;
  diskGrowthPerTick: number; // slow growth over time

  // Temperature / power
  baseTempC: number;
  tempJitter: number;

  // Throughput behavior
  baseThroughputMbps: number;
  throughputJitter: number;

  // Process templates (spawned dynamically)
  processTemplates: DeviceProcessTemplate[];

  // Service templates
  serviceTemplates: DeviceServiceTemplate[];

  // User templates
  userTemplates: DeviceUserTemplate[];

  // Background event generation
  backgroundEventChance: number; // 0-1 per tick
  logCategories: LogCategory[];

  // Reaction when attacked — returns a partial node data overlay
  reactToAttack: (
    currentData: DeviceNodeData,
    attackType: string
  ) => Partial<DeviceNodeData>;
}

export interface DeviceProcessTemplate {
  name: string;
  cpuBase: number;
  cpuJitter: number;
  memoryMbBase: number;
  memoryMbJitter: number;
  spawnChance: number; // 0-1 per tick
  killChance: number; // 0-1 per tick
  isMalicious?: boolean;
}

export interface DeviceServiceTemplate {
  name: string;
  port: number;
  protocol: 'tcp' | 'udp';
  restartChance: number; // 0-1 per tick
  stopChance: number;
}

export interface DeviceUserTemplate {
  username: string;
  role: 'admin' | 'employee' | 'guest';
  loginChance: number; // 0-1 per tick
  activityChance: number;
  logoutChance: number;
}

/**
 * System tick function signature.
 * Every system receives nodes, edges, and context, returns patches + logs.
 */
export type SystemTickFn = (
  nodes: { id: string; data: DeviceNodeData }[],
  edges: { id: string; source: string; target: string; data?: Record<string, any> }[],
  ctx: SystemContext
) => SystemTickResult;
