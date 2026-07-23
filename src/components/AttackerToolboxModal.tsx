import React, { useState, useEffect } from 'react';
import { type Node } from '@xyflow/react';
import { 
  X, 
  Crosshair, 
  Terminal, 
  Key, 
  Skull, 
  Zap, 
  ExternalLink,
  ShieldAlert,
  Server,
  Play
} from 'lucide-react';
import type { DeviceNodeData } from '../types/soc';

export type AttackType = 'nmap' | 'brute_force' | 'ransomware' | 'ddos' | 'exfiltration';

export interface AttackerToolboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  selectedNodeId: string | null;
  onTriggerAttack: (targetNodeId: string, attackType: AttackType) => void;
}

export const AttackerToolboxModal: React.FC<AttackerToolboxModalProps> = ({
  isOpen,
  onClose,
  nodes,
  selectedNodeId,
  onTriggerAttack
}) => {
  const [targetId, setTargetId] = useState<string>('');

  useEffect(() => {
    if (selectedNodeId) {
      setTargetId(selectedNodeId);
    } else if (nodes.length > 0 && !targetId) {
      setTargetId(nodes[0].id);
    }
  }, [selectedNodeId, nodes, targetId]);

  if (!isOpen) return null;

  const currentTargetNode = nodes.find(n => n.id === targetId);
  const currentTargetData = currentTargetNode?.data as DeviceNodeData | undefined;

  const attackVectors: Array<{
    id: AttackType;
    title: string;
    description: string;
    mitreStage: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    btnClass: string;
    severityBadge: string;
  }> = [
    {
      id: 'nmap',
      title: '1. Nmap Network Port Scan',
      description: 'Executes port scan, sets node status to scanning, populates open ports log, and triggers yellow edge animation.',
      mitreStage: 'T1595 - Active Scanning (Reconnaissance)',
      icon: Terminal,
      colorClass: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
      btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
      severityBadge: 'INFO / RECON'
    },
    {
      id: 'brute_force',
      title: '2. Brute Force SSH/RDP',
      description: 'Injects failed login alerts, spikes CPU, sets node status to warning, and advances MITRE matrix to Credential Access.',
      mitreStage: 'T1110 - Brute Force (Credential Access)',
      icon: Key,
      colorClass: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
      btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
      severityBadge: 'HIGH / CRED ACCESS'
    },
    {
      id: 'ransomware',
      title: '3. Ransomware Payload Execution',
      description: 'Injects encryptor.exe process, transitions node status to compromised, spikes CPU to 99%, appends CRITICAL log event, triggers red edge animation and siren audio alarm.',
      mitreStage: 'T1486 - Data Encrypted for Impact',
      icon: Skull,
      colorClass: 'text-red-400 border-red-500/40 bg-red-950/30',
      btnClass: 'bg-red-600 hover:bg-red-500 text-white',
      severityBadge: 'CRITICAL / IMPACT'
    },
    {
      id: 'ddos',
      title: '4. Volumetric DDoS SYN Flood',
      description: 'Maxes out target node traffic, spikes CPU to 100%, appends high volume log entries, and transitions node status to compromised/warning.',
      mitreStage: 'T1498 - Network Denial of Service',
      icon: Zap,
      colorClass: 'text-purple-400 border-purple-500/40 bg-purple-950/30',
      btnClass: 'bg-purple-600 hover:bg-purple-500 text-white',
      severityBadge: 'CRITICAL / DDOS'
    },
    {
      id: 'exfiltration',
      title: '5. Covert Data Exfiltration',
      description: 'Injects exfiltration process (exfil_agent.exe), logs outbound data flow to external IP, and advances MITRE matrix to Exfiltration.',
      mitreStage: 'T1041 - Exfiltration Over C2 Channel',
      icon: ExternalLink,
      colorClass: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
      btnClass: 'bg-rose-600 hover:bg-rose-500 text-white',
      severityBadge: 'CRITICAL / EXFIL'
    }
  ];

  const handleLaunch = (attackType: AttackType) => {
    if (!targetId) return;
    onTriggerAttack(targetId, attackType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-sm">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-100 flex items-center gap-2 font-mono">
                Interactive Attacker Toolbox <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-sans">Cyber Range Suite</span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">Manual Attack Vector Injector & Adversary Emulation Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Target Node Selection */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" /> Target Node Selection
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {nodes.map((node) => {
                    const data = node.data as DeviceNodeData;
                    return (
                      <option key={node.id} value={node.id}>
                        {data.hostname} ({data.ip}) - [{data.status.toUpperCase()}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {currentTargetData && (
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <Server className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-gray-200 block truncate">{currentTargetData.hostname}</span>
                      <span className="text-[10px] text-gray-400">{currentTargetData.os}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    currentTargetData.status === 'compromised' 
                      ? 'bg-red-950 text-red-400 border-red-800' 
                      : currentTargetData.status === 'warning'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    {currentTargetData.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 5 Manual Attack Vectors */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
              Select Attack Vector to Launch Target Exploitation
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {attackVectors.map((vec) => {
                const IconComponent = vec.icon;
                return (
                  <div
                    key={vec.id}
                    className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-600 ${vec.colorClass}`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold font-mono text-gray-100">{vec.title}</h4>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-gray-300 border border-slate-700">
                            {vec.severityBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-snug">{vec.description}</p>
                        <p className="text-[10px] font-mono text-cyan-400/90">MITRE: {vec.mitreStage}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunch(vec.id)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95 ${vec.btnClass}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Launch Attack
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Target Selected: <strong className="text-cyan-400">{currentTargetData?.hostname || targetId}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 transition"
          >
            Close Toolbox
          </button>
        </div>
      </div>
    </div>
  );
};
