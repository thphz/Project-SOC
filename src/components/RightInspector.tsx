import { 
  X, 
  Cpu, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  Trash2,
  Wrench,
  RotateCcw,
  Crosshair
} from 'lucide-react';
import type { DeviceNodeData, DeviceProcess } from '../types/soc';

interface RightInspectorProps {
  selectedNode: { id: string; data: DeviceNodeData } | null;
  onClose: () => void;
  onIsolateNode: (nodeId: string) => void;
  onKillProcess: (nodeId: string, pid: number) => void;
  onPatchVulnerability: (nodeId: string) => void;
  onClearInfections: (nodeId: string) => void;
  onOpenAttackerToolbox?: () => void;
  multiSelectedCount?: number;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  selectedNode,
  onClose,
  onIsolateNode,
  onKillProcess,
  onPatchVulnerability,
  onClearInfections,
  onOpenAttackerToolbox = () => {},
  multiSelectedCount = 0
}) => {
  // Multi-selection state: show summary instead of single node details
  if (multiSelectedCount > 1) {
    return (
      <aside className="w-80 h-full soc-glass border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-center text-center z-20 shrink-0">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
          <Cpu className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">{multiSelectedCount} Nodes Selected</h4>
        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 mb-4">
          Drag to select more, or press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono">Shift</kbd> + click to multi-select.
        </p>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          Clear Selection
        </button>
      </aside>
    );
  }

  if (!selectedNode) {
    return (
      <aside className="w-80 h-full soc-glass border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center justify-center text-center z-20 shrink-0">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-gray-500 mb-3">
          <Activity className="w-6 h-6 text-slate-400 dark:text-gray-500" />
        </div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">No Node Selected</h4>
        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1 max-w-[200px]">
          Click any device on the network topology canvas to inspect telemetry & incident response actions.
        </p>
      </aside>
    );
  }

  const { id, data } = selectedNode;
  const isCompromised = data.status === 'compromised';
  const isIsolated = data.isIsolated || false;

  return (
    <aside className="w-80 h-full soc-glass border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-100/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            isCompromised ? 'bg-red-500 animate-ping' : data.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />
          <h3 className="text-xs font-bold text-slate-800 dark:text-gray-100 font-mono truncate">{data.hostname}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Device Status Banner */}
        <div className={`p-2.5 rounded-lg border flex items-center justify-between font-mono ${
          isCompromised 
            ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950/70 dark:border-red-500/80 dark:text-red-300' 
            : data.status === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/70 dark:border-amber-500/80 dark:text-amber-300'
            : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-500/50 dark:text-emerald-300'
        }`}>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Health Status</p>
            <p className="text-xs font-bold uppercase">{data.status}</p>
          </div>
          {isIsolated && (
            <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded border border-red-400">
              NETWORK ISOLATED
            </span>
          )}
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <span className="text-[10px] text-slate-500 dark:text-gray-400 block font-medium">IP Address</span>
            <span className="text-blue-700 dark:text-blue-300 font-bold">{data.ip}</span>
          </div>
          <div className="p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <span className="text-[10px] text-slate-500 dark:text-gray-400 block font-medium">Device OS</span>
            <span className="text-slate-800 dark:text-gray-200 text-[11px] truncate block font-semibold">{data.os}</span>
          </div>
        </div>

        {/* Resource Telemetry Meters */}
        <div className="space-y-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
          <h4 className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Resource Meters
          </h4>

          {/* CPU Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-600 dark:text-gray-400">CPU Usage</span>
              <span className={data.cpu > 80 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-800 dark:text-gray-200 font-semibold'}>{data.cpu}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${data.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${data.cpu}%` }}
              />
            </div>
          </div>

          {/* RAM Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-600 dark:text-gray-400">RAM Memory</span>
              <span className="text-slate-800 dark:text-gray-200 font-semibold">{data.ram} GB / {data.maxRam} GB</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(data.ram / data.maxRam) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Listening Ports */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <h4 className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Listening Ports</h4>
          <div className="flex flex-wrap gap-1">
            {data.openPorts && data.openPorts.length > 0 ? (
              data.openPorts.map(port => (
                <span key={port} className="text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold shadow-xs">
                  :{port}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">No listening ports</span>
            )}
          </div>
        </div>

        {/* Processes List */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Terminal className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Active Processes
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">{data.processes?.length || 0} tasks</span>
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto">
            {data.processes && data.processes.map((proc: DeviceProcess) => (
              <div 
                key={proc.pid}
                className={`flex items-center justify-between p-1.5 rounded text-[11px] font-mono border ${
                  proc.isMalicious 
                    ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-950/80 dark:border-red-500/80 dark:text-red-300 font-bold animate-pulse' 
                    : 'bg-white border-slate-200 text-slate-800 dark:bg-slate-800/60 dark:border-slate-700/50 dark:text-gray-300 font-medium'
                }`}
              >
                <div className="truncate mr-2">
                  <span>{proc.name}</span>
                  <span className="text-[9px] text-slate-400 dark:text-gray-500 ml-1.5">PID:{proc.pid}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500 dark:text-gray-400">{proc.cpu}% CPU</span>
                  {proc.isMalicious && (
                    <button
                      onClick={() => onKillProcess(id, proc.pid)}
                      className="p-0.5 rounded bg-red-600 hover:bg-red-500 text-white"
                      title="Kill malicious process"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Incident Response Actions */}
        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/30 shadow-sm dark:shadow-none space-y-2">
          <h4 className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Incident Response Actions
          </h4>

          <div className="space-y-1.5 pt-1">
            {/* Launch Attack on Target */}
            {onOpenAttackerToolbox && (
              <button
                onClick={onOpenAttackerToolbox}
                className="w-full text-xs font-bold py-1.5 px-3 rounded bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition shadow-sm font-mono"
              >
                <Crosshair className="w-3.5 h-3.5 animate-pulse" /> Launch Attack on Target
              </button>
            )}

            {/* Isolate Node */}
            <button
              onClick={() => onIsolateNode(id)}
              className={`w-full text-xs font-semibold py-1.5 px-3 rounded flex items-center justify-center gap-2 transition ${
                isIsolated
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-600/30 dark:border-emerald-500/60 dark:text-emerald-300 hover:bg-emerald-200'
                  : 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-600/30 dark:border-red-500/60 dark:text-red-300 hover:bg-red-200'
              }`}
            >
              {isIsolated ? (
                <>
                  <Unlock className="w-3.5 h-3.5" /> Reconnect to Network
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" /> Isolate Node from Subnet
                </>
              )}
            </button>

            {/* Patch Vulnerability */}
            <button
              onClick={() => onPatchVulnerability(id)}
              className="w-full text-xs font-semibold py-1.5 px-3 rounded bg-blue-100 border border-blue-300 text-blue-800 dark:bg-blue-600/20 dark:border-blue-500/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600/40 flex items-center justify-center gap-2 transition"
            >
              <Wrench className="w-3.5 h-3.5" /> Patch System Services
            </button>

            {/* Clear Infections & Restore */}
            <button
              onClick={() => onClearInfections(id)}
              className="w-full text-xs font-semibold py-1.5 px-3 rounded bg-slate-100 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Remediate & Clear Infections
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
