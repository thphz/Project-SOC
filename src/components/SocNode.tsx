import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { 
  Monitor, 
  Laptop, 
  Router, 
  Network, 
  Shield, 
  Server, 
  Database, 
  Globe, 
  Smartphone, 
  Camera, 
  Wifi, 
  Mail, 
  Globe2, 
  Cloud, 
  Bug, 
  LayoutGrid,
  AlertTriangle,
  Lock,
  Radio,
  Cpu,
  HardDrive,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import type { DeviceNodeData, DeviceType, NodeHealthStatus } from '../types/soc';

const ICON_MAP: Record<DeviceType, React.ElementType> = {
  pc: Monitor,
  laptop: Laptop,
  router: Router,
  switch: Network,
  firewall: Shield,
  cloud: Cloud,
  database: Database,
  server_linux: Server,
  server_win: LayoutGrid,
  iot: Smartphone,
  camera: Camera,
  ap: Wifi,
  mail: Mail,
  dns: Globe2,
  internet: Globe,
  honeypot: Bug,
};

const STATUS_CONFIG: Record<NodeHealthStatus, { color: string; border: string; bg: string; label: string; text: string }> = {
  healthy: { color: '#10B981', border: 'border-emerald-300 dark:border-emerald-500/50', bg: 'bg-emerald-50/80 dark:bg-emerald-950/30', label: 'Healthy', text: 'text-emerald-700 dark:text-emerald-400' },
  selected: { color: '#2563EB', border: 'border-blue-500', bg: 'bg-blue-50/80 dark:bg-blue-950/40', label: 'Selected', text: 'text-blue-700 dark:text-blue-400' },
  warning: { color: '#D97706', border: 'border-amber-400 dark:border-amber-500/80', bg: 'bg-amber-50/80 dark:bg-amber-950/40', label: 'Warning', text: 'text-amber-700 dark:text-amber-400' },
  scanning: { color: '#EA580C', border: 'border-orange-400 dark:border-orange-500/80', bg: 'bg-orange-50/80 dark:bg-orange-950/40', label: 'Scanning', text: 'text-orange-700 dark:text-orange-400' },
  compromised: { color: '#DC2626', border: 'border-red-500/90 shadow-[0_0_18px_rgba(239,68,68,0.4)] animate-pulse', bg: 'bg-red-50/90 dark:bg-red-950/60', label: 'Compromised', text: 'text-red-700 dark:text-red-400' },
  offline: { color: '#64748B', border: 'border-slate-300 dark:border-gray-600/50', bg: 'bg-slate-100 dark:bg-gray-900/40', label: 'Offline', text: 'text-slate-600 dark:text-gray-400' },
};

const HEALTH_HALO: Record<NodeHealthStatus, string> = {
  healthy: 'shadow-[0_0_20px_rgba(16,185,129,0.65)] ring-2 ring-emerald-500/80 border-emerald-400',
  selected: 'shadow-[0_0_20px_rgba(37,99,235,0.65)] ring-2 ring-blue-500/80 border-blue-400',
  warning: 'shadow-[0_0_20px_rgba(245,158,11,0.7)] ring-2 ring-amber-500/80 border-amber-400',
  scanning: 'shadow-[0_0_20px_rgba(59,130,246,0.8)] ring-2 ring-blue-500/90 animate-pulse border-blue-400',
  compromised: 'shadow-[0_0_25px_rgba(220,38,38,0.9)] ring-2 ring-red-500/90 animate-pulse border-red-500',
  offline: 'shadow-[0_0_10px_rgba(100,116,139,0.3)] ring-2 ring-slate-500/60 border-slate-400',
};

export const SocNode = memo(({ data, selected }: NodeProps<Node<DeviceNodeData>>) => {
  const nodeData = data;
  const viewMode = nodeData.viewMode || 'logical';
  const IconComponent = ICON_MAP[nodeData.deviceType] || Server;
  const statusCfg = STATUS_CONFIG[nodeData.status] || STATUS_CONFIG.healthy;

  // Throughput metrics
  const mbps = nodeData.throughputMbps ?? Math.round((nodeData.cpu * 8.5) + 120);
  const pps = nodeData.pps ?? Math.round(mbps * 2.8 + 250);

  // CVE list
  const cves = nodeData.cves || (
    nodeData.status === 'compromised'
      ? ['CVE-2024-3094', 'CVE-2023-38606']
      : nodeData.status === 'warning'
      ? ['CVE-2024-21626']
      : nodeData.isVulnerable
      ? ['CVE-2023-38606']
      : []
  );

  // Dynamic View Mode Overlay Classes
  let modeOverlayClass = '';
  if (viewMode === 'health') {
    modeOverlayClass = HEALTH_HALO[nodeData.status] || HEALTH_HALO.healthy;
  } else if (viewMode === 'traffic') {
    modeOverlayClass = mbps > 450
      ? 'shadow-[0_0_30px_rgba(239,68,68,0.7)] border-red-500/80 bg-red-950/30'
      : mbps > 250
      ? 'shadow-[0_0_25px_rgba(245,158,11,0.6)] border-amber-500/70 bg-amber-950/20'
      : 'shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-500/60 bg-blue-950/20';
  } else if (viewMode === 'threat' && (cves.length > 0 || nodeData.status === 'compromised')) {
    modeOverlayClass = 'shadow-[0_0_25px_rgba(239,68,68,0.75)] ring-2 ring-red-500/80 border-red-500/80';
  }

  return (
    <div 
      className={`relative min-w-[170px] rounded-xl border p-3 soc-glass transition-all duration-300 ${statusCfg.border} ${statusCfg.bg} ${modeOverlayClass} ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
      }`}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-slate-900" />

      {/* Isolated Badge */}
      {nodeData.isIsolated && (
        <div className="absolute -top-3 -right-2 bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-10 border border-red-400 font-bold animate-pulse">
          <Lock className="w-2.5 h-2.5" /> ISOLATED
        </div>
      )}

      {/* Main Node Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`p-2 rounded-lg ${
          nodeData.status === 'compromised' 
            ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 animate-bounce' 
            : 'bg-slate-100 text-blue-600 dark:bg-slate-800/80 dark:text-blue-400'
        }`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate font-mono">{nodeData.hostname}</h4>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">{nodeData.ip}</p>
        </div>
      </div>

      {/* VIEW OVERLAY MODE CONTENT */}
      {viewMode === 'traffic' && (
        <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
          <div className="bg-slate-900/90 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> THROUGHPUT
            </span>
            <span className={mbps > 400 ? 'text-red-400 font-extrabold' : 'text-emerald-300'}>{mbps} Mbps</span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 dark:text-gray-400 flex justify-between px-0.5">
            <span>PACKETS:</span>
            <span className="font-semibold text-slate-700 dark:text-gray-300">{pps} pps</span>
          </div>
        </div>
      )}

      {viewMode === 'health' && (
        <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 text-[9px] font-mono">
          {/* CPU Progress Meter */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-600 dark:text-gray-400 font-semibold">
              <span className="flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-blue-500" /> CPU
              </span>
              <span>{nodeData.cpu}%</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  nodeData.cpu > 80 ? 'bg-red-500' : nodeData.cpu > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(nodeData.cpu, 100)}%` }}
              />
            </div>
          </div>

          {/* RAM Progress Meter */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-600 dark:text-gray-400 font-semibold">
              <span>RAM</span>
              <span>{nodeData.ram}GB / {nodeData.maxRam}GB</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min((nodeData.ram / (nodeData.maxRam || 16)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Disk Progress Meter */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-600 dark:text-gray-400 font-semibold">
              <span className="flex items-center gap-1">
                <HardDrive className="w-2.5 h-2.5 text-purple-500" /> DISK
              </span>
              <span>{nodeData.disk}%</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  nodeData.disk > 80 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(nodeData.disk, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'threat' && (
        <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
          {/* Prominent CVE Badges */}
          {cves.length > 0 ? (
            <div className="space-y-1">
              <div className="text-[9px] font-mono font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 text-red-500 shrink-0" />
                <span>VULNERABILITIES:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {cves.map(cve => (
                  <span 
                    key={cve}
                    className="bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/40 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5"
                  >
                    <Zap className="w-2 h-2 text-red-500" />
                    {cve}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5 text-emerald-500" /> No Known CVEs
            </div>
          )}

          {/* Threat Vector Ingress/Egress Indicators */}
          <div className="flex items-center justify-between text-[9px] font-mono pt-0.5">
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
              <ArrowDownLeft className="w-2.5 h-2.5" /> INGRESS
            </span>
            <span className={`flex items-center gap-0.5 px-1 py-0.5 rounded border ${
              nodeData.status === 'compromised'
                ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30 font-bold animate-pulse'
                : 'text-slate-500 dark:text-gray-400 bg-slate-500/10 border-slate-500/20'
            }`}>
              <ArrowUpRight className="w-2.5 h-2.5" /> EGRESS
            </span>
          </div>
        </div>
      )}

      {/* Logical Mode (Standard View) Status & CPU Metrics */}
      {viewMode === 'logical' && (
        <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.color }}></span>
              <span className={`font-semibold ${statusCfg.text}`}>{statusCfg.label}</span>
            </span>
            <span className="text-slate-500 dark:text-gray-400 font-mono font-medium">CPU {nodeData.cpu}%</span>
          </div>

          {/* CPU Bar */}
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                nodeData.cpu > 80 ? 'bg-red-500' : nodeData.cpu > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(nodeData.cpu, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Alerts Indicator (Visible across all modes if alerts exist) */}
      {nodeData.alerts && nodeData.alerts.length > 0 && (
        <div className="mt-2 text-[9px] bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono font-semibold">
          <AlertTriangle className="w-2.5 h-2.5 text-red-500 dark:text-red-400 shrink-0" />
          <span className="truncate">{nodeData.alerts[0].title}</span>
        </div>
      )}
    </div>
  );
});

SocNode.displayName = 'SocNode';
