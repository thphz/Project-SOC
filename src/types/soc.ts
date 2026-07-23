export type DeviceType = 
  | 'pc' 
  | 'laptop' 
  | 'router' 
  | 'switch' 
  | 'firewall' 
  | 'cloud' 
  | 'database' 
  | 'server_linux' 
  | 'server_win' 
  | 'iot' 
  | 'camera' 
  | 'ap' 
  | 'mail' 
  | 'dns' 
  | 'internet'
  | 'honeypot';

export type NodeHealthStatus = 
  | 'healthy' 
  | 'selected' 
  | 'warning' 
  | 'scanning' 
  | 'compromised' 
  | 'offline';

export interface DeviceProcess {
  pid: number;
  name: string;
  cpu: number;
  memoryMb: number;
  isMalicious?: boolean;
}

export type ServiceStatus = 'running' | 'stopped' | 'restarting';

export interface DeviceService {
  name: string;
  port: number;
  status: ServiceStatus;
  protocol?: 'tcp' | 'udp';
}

export type UserActivity = 'login' | 'logout' | 'idle' | 'download' | 'upload';

export interface DeviceUser {
  username: string;
  role: 'admin' | 'employee' | 'guest';
  state: UserActivity;
  since?: string; // timestamp of last activity
  transferredMb?: number;
}

export interface DeviceAlert {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
}

export interface DeviceNodeData {
  hostname: string;
  ip: string;
  deviceType: DeviceType;
  status: NodeHealthStatus;
  cpu: number; // %
  ram: number; // GB used
  maxRam: number;
  disk: number; // %
  temperature?: number; // °C
  power?: number; // watts
  fanRpm?: number;
  sessions?: number; // active network sessions
  os: string;
  openPorts: number[];
  processes: DeviceProcess[];
  services?: DeviceService[];
  users?: DeviceUser[];
  alerts: DeviceAlert[];
  isIsolated?: boolean;
  isVulnerable?: boolean;
  viewMode?: ViewOverlayMode;
  cves?: string[];
  throughputMbps?: number;
  pps?: number;
  latency?: number; // ms
  packetLoss?: number; // %
  congestion?: number; // 0-1
  category: 'endpoints' | 'networking' | 'servers' | 'security';
  lastTickAt?: string;
  [key: string]: any; // Allow React Flow node indexing
}

export type EventLogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface EventLogItem {
  id: string;
  timestamp: string;
  level: EventLogLevel;
  sourceNodeId?: string;
  sourceHost?: string;
  targetHost?: string;
  message: string;
  details?: string;
  mitrePhase?: string;
}

export interface MitrePhase {
  id: string;
  name: string;
  stage: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  techniqueId?: string;
}

export interface AttackScenarioStep {
  stepIndex: number;
  title: string;
  description: string;
  mitrePhaseId: string;
  mitreTechnique: string;
  sourceNodeId: string;
  targetNodeId: string;
  targetStatus: NodeHealthStatus;
  edgeAnimation: 'packet' | 'attack' | 'warning';
  logMessage: string;
  logLevel: EventLogLevel;
  maliciousProcess?: string;
  alertTitle?: string;
}

export interface AttackScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: AttackScenarioStep[];
}

export type ViewOverlayMode = 'logical' | 'traffic' | 'health' | 'threat';

export type ScreenMode = 'canvas' | 'logs' | 'mitre' | 'report';

export interface ToastAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  hostName?: string;
  hostIp?: string;
  timestamp: string;
  message: string;
}
