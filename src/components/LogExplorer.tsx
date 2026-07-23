import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Copy, 
  Check, 
  X, 
  Code, 
  Terminal, 
  BarChart2, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import type { EventLogItem, EventLogLevel } from '../types/soc';

interface LogExplorerProps {
  logs: EventLogItem[];
  onClearLogs?: () => void;
  onClose?: () => void;
}

export const LogExplorer: React.FC<LogExplorerProps> = ({
  logs,
  onClearLogs,
  onClose
}) => {
  // Filter States
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRegex, setIsRegex] = useState<boolean>(false);
  const [selectedSourceHost, setSelectedSourceHost] = useState<string>('ALL');

  // JSON Modal Viewer State
  const [inspectedLog, setInspectedLog] = useState<EventLogItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Unique host sources for filtering
  const uniqueHosts = useMemo(() => {
    const hosts = new Set<string>();
    logs.forEach(l => {
      if (l.sourceHost) hosts.add(l.sourceHost);
    });
    return Array.from(hosts);
  }, [logs]);

  // Regex evaluation and search filtering
  const { filteredLogs, regexError } = useMemo(() => {
    let pattern: RegExp | null = null;
    let err: string | null = null;

    if (isRegex && searchQuery.trim()) {
      try {
        pattern = new RegExp(searchQuery, 'i');
      } catch {
        err = 'Invalid Regex Expression';
      }
    }

    const filtered = logs.filter((log) => {
      // 1. Severity filter
      if (selectedLevel !== 'ALL' && log.level !== selectedLevel) {
        return false;
      }

      // 2. Source host filter
      if (selectedSourceHost !== 'ALL' && log.sourceHost !== selectedSourceHost) {
        return false;
      }

      // 3. Search / Regex
      if (!searchQuery.trim()) return true;

      const fullText = `${log.timestamp} ${log.level} ${log.message} ${log.sourceHost || ''} ${log.targetHost || ''} ${log.mitrePhase || ''} ${log.details || ''}`;

      if (isRegex) {
        if (err || !pattern) return false;
        return pattern.test(fullText);
      } else {
        return fullText.toLowerCase().includes(searchQuery.toLowerCase());
      }
    });

    return { filteredLogs: filtered, regexError: err };
  }, [logs, selectedLevel, selectedSourceHost, searchQuery, isRegex]);

  // Histogram Data Aggregation (grouped by timestamp interval / minute)
  const histogramData = useMemo(() => {
    const timeMap: Record<string, { time: string; INFO: number; WARNING: number; ERROR: number; CRITICAL: number }> = {};

    logs.forEach((log) => {
      // Normalize timestamp to HH:MM format
      let timeKey = log.timestamp;
      if (timeKey.includes(':')) {
        const parts = timeKey.split(':');
        if (parts.length >= 2) {
          timeKey = `${parts[0]}:${parts[1]}`;
        }
      }

      if (!timeMap[timeKey]) {
        timeMap[timeKey] = { time: timeKey, INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
      }

      const lvl = log.level;
      if (lvl === 'INFO' || lvl === 'WARNING' || lvl === 'ERROR' || lvl === 'CRITICAL') {
        timeMap[timeKey][lvl] += 1;
      }
    });

    return Object.values(timeMap).sort((a, b) => a.time.localeCompare(b.time));
  }, [logs]);

  // Copy raw JSON to clipboard
  const handleCopyJson = (log: EventLogItem) => {
    const jsonStr = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Export logs to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `siem_forensic_logs_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Level Badge helper
  const getLevelBadge = (level: EventLogLevel) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 shrink-0"><ShieldAlert className="w-3 h-3" /> CRITICAL</span>;
      case 'ERROR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-600 text-white flex items-center gap-1 shrink-0"><AlertCircle className="w-3 h-3" /> ERROR</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900 flex items-center gap-1 shrink-0"><AlertTriangle className="w-3 h-3" /> WARNING</span>;
      case 'INFO':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1 shrink-0"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  // Level Counts
  const counts = useMemo(() => {
    let info = 0, warning = 0, error = 0, critical = 0;
    logs.forEach(l => {
      if (l.level === 'INFO') info++;
      else if (l.level === 'WARNING') warning++;
      else if (l.level === 'ERROR') error++;
      else if (l.level === 'CRITICAL') critical++;
    });
    return { total: logs.length, info, warning, error, critical };
  }, [logs]);

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1220] text-gray-100 font-sans overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              SIEM Log Explorer & Forensic Investigator
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
                LIVE TELEMETRY
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Real-Time Log Aggregation • Regex Pattern Matching • Payload Inspection
            </p>
          </div>
        </div>

        {/* Quick KPI Count Badges & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-gray-300">
              Total: <strong className="text-white">{counts.total}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-950/60 border border-blue-800 text-blue-300">
              INFO: <strong>{counts.info}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
              WARN: <strong>{counts.warning}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-orange-950/60 border border-orange-800 text-orange-300">
              ERR: <strong>{counts.error}</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-red-950/60 border border-red-800 text-red-300">
              CRIT: <strong>{counts.critical}</strong>
            </span>
          </div>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>

          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Clear Current Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition"
              title="Close Full-screen Explorer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* 1. Log Volume Histogram Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              Log Volume Histogram (Events per Time Interval)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Stacked Aggregation by Severity</span>
          </div>

          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px', color: '#F8FAFC', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar dataKey="INFO" stackId="a" fill="#3B82F6" name="INFO" />
                <Bar dataKey="WARNING" stackId="a" fill="#F59E0B" name="WARNING" />
                <Bar dataKey="ERROR" stackId="a" fill="#F97316" name="ERROR" />
                <Bar dataKey="CRITICAL" stackId="a" fill="#EF4444" name="CRITICAL" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Controls & Search Filter Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Severity:</span>
            {['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((lvl) => {
              const isActive = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                    isActive
                      ? lvl === 'CRITICAL' ? 'bg-red-600 text-white shadow-md' :
                        lvl === 'ERROR' ? 'bg-orange-600 text-white shadow-md' :
                        lvl === 'WARNING' ? 'bg-amber-500 text-slate-900 shadow-md' :
                        lvl === 'INFO' ? 'bg-blue-600 text-white shadow-md' :
                        'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Host Filter Dropdown */}
          {uniqueHosts.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 font-semibold">Source Host:</span>
              <select
                value={selectedSourceHost}
                onChange={(e) => setSelectedSourceHost(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-gray-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Hosts ({logs.length})</option>
                {uniqueHosts.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box & Regex Toggle */}
          <div className="flex items-center gap-2 flex-1 max-w-md min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder={isRegex ? "Regex pattern e.g. (Ransomware|Exploit|CVE-\\d+)" : "Search log text, host, MITRE phase..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-slate-950 border rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none font-mono placeholder:text-slate-500 ${
                  regexError ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Regex Switcher Button */}
            <button
              onClick={() => setIsRegex(!isRegex)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border transition-all ${
                isRegex
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
              title="Toggle Regular Expression Matching evaluating new RegExp(pattern, 'i')"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Regex</span>
            </button>
          </div>
        </div>

        {/* Regex Error Alert if any */}
        {regexError && (
          <div className="bg-red-950/60 border border-red-500/50 text-red-300 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              {regexError}: "{searchQuery}"
            </span>
            <span className="text-[10px] text-red-400">Falling back to safe evaluation</span>
          </div>
        )}

        {/* 3. Forensic Log Table */}
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10 select-none">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Source Host / ID</th>
                  <th className="py-2.5 px-3">MITRE Technique</th>
                  <th className="py-2.5 px-3">Log Message</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No event logs match your active filter query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-800/60 transition-colors group"
                    >
                      <td className="py-2 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {getLevelBadge(log.level)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-blue-400 whitespace-nowrap">
                        {log.sourceHost || log.sourceNodeId || 'SYSTEM'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {log.mitrePhase ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950/80 border border-purple-700/60 text-purple-300 font-bold">
                            {log.mitrePhase}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-200 max-w-xl truncate">
                        {log.message}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectedLog(log)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 hover:border-blue-500 flex items-center gap-1 ml-auto transition"
                          title="Inspect Raw JSON Payload"
                        >
                          <Code className="w-3 h-3" /> Raw JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Status */}
          <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between shrink-0">
            <span>
              Showing <strong className="text-gray-200">{filteredLogs.length}</strong> of{' '}
              <strong className="text-gray-200">{logs.length}</strong> event log records
            </span>
            <span className="text-[10px] text-slate-500">
              Regex Evaluator: {isRegex ? 'ACTIVE (RegExp)' : 'STANDARD (Includes)'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. RAW JSON PAYLOAD VIEWER MODAL */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-gray-100">
                    Raw EventLogItem JSON Payload Viewer
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Log ID: {inspectedLog.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedLog(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Preformatted JSON */}
            <div className="p-4 bg-slate-950 overflow-y-auto max-h-[60vh] font-mono text-xs text-emerald-400 leading-relaxed">
              <pre className="whitespace-pre-wrap break-all selection:bg-blue-600 selection:text-white">
                {JSON.stringify(inspectedLog, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span>Level:</span>
                {getLevelBadge(inspectedLog.level)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyJson(inspectedLog)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied Payload!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy JSON to Clipboard
                    </>
                  )}
                </button>

                <button
                  onClick={() => setInspectedLog(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
