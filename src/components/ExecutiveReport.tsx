import React, { useMemo } from 'react';
import { 
  ShieldAlert, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Activity, 
  TrendingDown, 
  ShieldCheck, 
  FileSpreadsheet,
  X,
  Lock,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import type { EventLogItem, DeviceNodeData } from '../types/soc';
import type { Node } from '@xyflow/react';

interface ExecutiveReportProps {
  nodes: Node[];
  logs: EventLogItem[];
  alertCount: number;
  onIsolateNode?: (nodeId: string) => void;
  onClearInfections?: (nodeId: string) => void;
  onClose?: () => void;
}

export const ExecutiveReport: React.FC<ExecutiveReportProps> = ({
  nodes,
  logs,
  alertCount,
  onIsolateNode,
  onClearInfections,
  onClose
}) => {
  // Asset counts
  const totalAssets = nodes.length;
  const compromisedCount = nodes.filter(n => (n.data as DeviceNodeData).status === 'compromised').length;
  const warningCount = nodes.filter(n => (n.data as DeviceNodeData).status === 'warning' || (n.data as DeviceNodeData).status === 'scanning').length;
  const healthyCount = nodes.filter(n => (n.data as DeviceNodeData).status === 'healthy').length;
  const isolatedCount = nodes.filter(n => (n.data as DeviceNodeData).isIsolated).length;
  const vulnerableCount = nodes.filter(n => (n.data as DeviceNodeData).isVulnerable).length;

  // Calculate Threat Risk Score (0 - 100)
  const threatScore = useMemo(() => {
    const rawScore = (compromisedCount * 30) + (warningCount * 12) + (alertCount * 4) + (vulnerableCount * 8);
    return Math.min(100, Math.max(0, Math.round(rawScore)));
  }, [compromisedCount, warningCount, alertCount, vulnerableCount]);

  // Risk Level Category
  const riskCategory = useMemo(() => {
    if (threatScore >= 75) return { label: 'CRITICAL RISK', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/40' };
    if (threatScore >= 45) return { label: 'ELEVATED RISK', color: 'text-amber-500', bg: 'bg-amber-500/20', border: 'border-amber-500/40' };
    if (threatScore >= 20) return { label: 'MODERATE RISK', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' };
    return { label: 'LOW RISK', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
  }, [threatScore]);

  // Incident Severity Distribution Pie Chart Data
  const severityPieData = useMemo(() => {
    const counts = { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
    logs.forEach(l => {
      if (counts[l.level] !== undefined) counts[l.level]++;
    });

    return [
      { name: 'Info', value: counts.INFO || 1, color: '#3B82F6' },
      { name: 'Warning', value: counts.WARNING || 0, color: '#F59E0B' },
      { name: 'Error', value: counts.ERROR || 0, color: '#F97316' },
      { name: 'Critical', value: counts.CRITICAL || 0, color: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [logs]);

  // Attack Category Breakdown Bar Chart Data
  const attackCategoryData = useMemo(() => {
    return [
      { category: 'Reconnaissance', count: logs.filter(l => l.mitrePhase?.toLowerCase().includes('recon') || l.message.toLowerCase().includes('scan')).length || 2 },
      { category: 'Initial Access', count: logs.filter(l => l.message.toLowerCase().includes('phishing') || l.message.toLowerCase().includes('exploit')).length || 4 },
      { category: 'Execution', count: logs.filter(l => l.message.toLowerCase().includes('script') || l.message.toLowerCase().includes('payload')).length || 3 },
      { category: 'Credential Access', count: logs.filter(l => l.message.toLowerCase().includes('credential') || l.message.toLowerCase().includes('lsass')).length || 1 },
      { category: 'Lateral Spreading', count: logs.filter(l => l.message.toLowerCase().includes('lateral') || l.message.toLowerCase().includes('pivoting')).length || 2 },
      { category: 'Ransomware / Impact', count: logs.filter(l => l.message.toLowerCase().includes('ransomware') || l.message.toLowerCase().includes('encrypt')).length || 2 },
    ];
  }, [logs]);

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="h-full w-full bg-[#0B1220] text-gray-100 font-sans overflow-y-auto print:bg-white print:text-black print:overflow-visible p-6">
      {/* Printable CSS Media Rules */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
          .print-text {
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden on Print) */}
      <div className="no-print mb-6 flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              Executive Security Summary & Threat Metrics Dashboard
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              C-Level Security Posture • Real-time Threat Score • Asset Health Audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Export PDF / Print Report
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition"
              title="Close Report View"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Report Header for Print / Display */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 print:border-slate-300 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-100 print-text flex items-center gap-3">
            ArcCyber Enterprise SOC Security Report
          </h1>
          <p className="text-xs text-slate-400 print-text font-mono mt-1">
            Generated on: {new Date().toLocaleString()} | Scope: Enterprise Infrastructure Subnet
          </p>
        </div>

        <div className="mt-3 md:mt-0 font-mono text-right text-xs text-slate-400 print-text">
          <p>Classification: <strong className="text-amber-400 print-text">CONFIDENTIAL / C-SUITE</strong></p>
          <p>Cyber Range Engine v2.4</p>
        </div>
      </div>

      {/* 1. KEY KPI METRIC CARDS & THREAT SCORE GAUGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* THREAT SCORE GAUGE DIAL CARD */}
        <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <span className="text-xs font-bold text-slate-400 print-text uppercase tracking-wider font-mono">
            Overall Threat Score Dial
          </span>

          {/* Semi-circular SVG Gauge Dial */}
          <div className="relative w-36 h-20 my-2 flex items-end justify-center">
            <svg viewBox="0 0 100 50" className="w-36 h-20">
              {/* Background Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1E293B"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Colored Active Arc based on Threat Score */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke={threatScore > 65 ? '#EF4444' : threatScore > 35 ? '#F59E0B' : '#10B981'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * threatScore) / 100}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute bottom-0 text-center">
              <span className="text-2xl font-extrabold text-white print-text font-mono">
                {threatScore}
              </span>
              <span className="text-[10px] text-slate-400 print-text block">/ 100 Risk</span>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${riskCategory.bg} ${riskCategory.color} ${riskCategory.border}`}>
            {riskCategory.label}
          </div>
        </div>

        {/* MTTD KPI CARD */}
        <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 print-text uppercase tracking-wider font-mono">
              MTTD (Mean Time to Detect)
            </span>
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white print-text font-mono">
              1.8 <span className="text-xs text-slate-400 font-normal">mins</span>
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
              <TrendingDown className="w-3.5 h-3.5" /> 18% faster than SLA benchmark
            </p>
          </div>

          <div className="text-[10px] text-slate-500 print-text font-mono">
            Automated EDR Telemetry Detection
          </div>
        </div>

        {/* MTTR KPI CARD */}
        <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 print-text uppercase tracking-wider font-mono">
              MTTR (Mean Time to Respond)
            </span>
            <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white print-text font-mono">
              4.2 <span className="text-xs text-slate-400 font-normal">mins</span>
            </h3>
            <p className="text-[11px] text-blue-400 font-mono flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Auto-isolation active
            </p>
          </div>

          <div className="text-[10px] text-slate-500 print-text font-mono">
            Automated Incident Response Workflow
          </div>
        </div>

        {/* ASSET PROTECTION STATUS CARD */}
        <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 print-text uppercase tracking-wider font-mono">
              Asset Protection Index
            </span>
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white print-text font-mono">
              {healthyCount} / {totalAssets} <span className="text-xs text-slate-400 font-normal">Healthy</span>
            </h3>
            <p className="text-[11px] text-red-400 font-mono mt-1">
              {compromisedCount} Compromised | {isolatedCount} Isolated
            </p>
          </div>

          <div className="text-[10px] text-slate-500 print-text font-mono">
            Subnet Health & Isolation Status
          </div>
        </div>
      </div>

      {/* 2. INCIDENT BREAKDOWN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Severity Distribution Pie Chart */}
        <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-gray-200 print-text uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Incident Severity Distribution
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                  labelLine={true}
                  label={({ name, percent, x, y }) => {
                    return (
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#94A3B8" fontSize={10} fontFamily="monospace">
                        {`${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F8FAFC',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                  formatter={(value: any, name: any) => [`${value} events`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  iconType="circle"
                  iconSize={8}
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Category Breakdown Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-gray-200 print-text uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            MITRE ATT&CK Category Breakdown
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackCategoryData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#64748B"
                  fontSize={9}
                  tick={{ fill: '#94A3B8', fontSize: 9 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  interval={0}
                  angle={0}
                  textAnchor="middle"
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F8FAFC',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  name="Incident Count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. COMPROMISED & ISOLATED ASSET INVENTORY TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-800 print:border-slate-300 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-200 print-text uppercase tracking-wider font-mono flex items-center gap-2">
              <Server className="w-4 h-4 text-red-400" />
              Compromised & Monitored Asset Inventory
            </h3>
            <p className="text-[11px] text-slate-400 print-text font-mono">
              Live device health audit and response control panel
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 print:bg-slate-100 text-slate-400 print:text-slate-700 text-[10px] uppercase tracking-wider border-b border-slate-800 print:border-slate-300">
                <th className="py-2.5 px-4">Hostname</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">Device Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">OS & Ports</th>
                <th className="py-2.5 px-4">Active Alerts</th>
                <th className="py-2.5 px-4 text-right no-print">Remediation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {nodes.map((node) => {
                const data = node.data as DeviceNodeData;
                const isCompromised = data.status === 'compromised';
                const isWarning = data.status === 'warning' || data.status === 'scanning';
                const isIsolated = data.isIsolated;

                return (
                  <tr
                    key={node.id}
                    className={`hover:bg-slate-800/50 print:hover:bg-transparent ${
                      isCompromised ? 'bg-red-950/20 print:bg-red-50' : isWarning ? 'bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-gray-200 print-text">
                      {data.hostname}
                    </td>
                    <td className="py-3 px-4 text-blue-400 print-text">
                      {data.ip}
                    </td>
                    <td className="py-3 px-4 text-slate-300 print-text uppercase text-[10px]">
                      {data.deviceType}
                    </td>
                    <td className="py-3 px-4">
                      {isIsolated ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3 text-amber-400" /> ISOLATED
                        </span>
                      ) : isCompromised ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3 h-3" /> COMPROMISED
                        </span>
                      ) : isWarning ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> WARNING
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> HEALTHY
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 print-text text-[11px]">
                      {data.os} | Ports: {data.openPorts?.slice(0, 3).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-red-400 print-text">
                      {data.alerts?.length || 0} Alerts
                    </td>
                    <td className="py-3 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        {onIsolateNode && (
                          <button
                            onClick={() => onIsolateNode(node.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition ${
                              isIsolated
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                            }`}
                          >
                            {isIsolated ? 'Reconnect' : 'Isolate Network'}
                          </button>
                        )}
                        {onClearInfections && isCompromised && (
                          <button
                            onClick={() => onClearInfections(node.id)}
                            className="px-2.5 py-1 rounded text-[10px] font-bold font-mono bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Remediate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. EXECUTIVE SIGN-OFF & RECOMMENDATIONS FOOTER */}
      <div className="bg-slate-900/90 border border-slate-800 print-card rounded-xl p-4 text-xs font-mono text-slate-300">
        <h4 className="font-bold text-gray-100 print-text mb-2 uppercase tracking-wider">
          Strategic SOC Remediation Recommendations
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-400 print-text">
          <li>Isolate any remaining compromised endpoints using automated network NAC isolation.</li>
          <li>Apply urgent zero-day patches to public-facing Web API servers and Database clusters.</li>
          <li>Rotate compromised Active Directory domain credentials and enforce MFA gateway authentication.</li>
        </ul>

        <div className="mt-4 pt-4 border-t border-slate-800 print:border-slate-300 flex items-center justify-between text-[10px] text-slate-500 print-text">
          <span>Report Generated by ArcCyber SOC Digital Twin Range</span>
          <span>Chief Information Security Officer (CISO) Approval Sign-off</span>
        </div>
      </div>
    </div>
  );
};
