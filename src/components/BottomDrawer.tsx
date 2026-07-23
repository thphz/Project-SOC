import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ListFilter, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  Terminal, 
  Download, 
  Search, 
  Send
} from 'lucide-react';
import type { EventLogItem, MitrePhase } from '../types/soc';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface BottomDrawerProps {
  logs: EventLogItem[];
  mitrePhases: MitrePhase[];
  currentStepIndex: number;
  totalSteps: number;
  onScrubStep: (step: number) => void;
  onExecuteConsoleCommand: (cmd: string) => string;
  trafficHistory: { time: string; mbps: number; alerts: number }[];
  healthyCount: number;
  warningCount: number;
  compromisedCount: number;
  onOpenLogExplorer?: () => void;
  onOpenMitreMatrix?: () => void;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  logs,
  mitrePhases,
  currentStepIndex,
  totalSteps,
  onScrubStep,
  onExecuteConsoleCommand,
  trafficHistory,
  healthyCount,
  warningCount,
  compromisedCount,
  onOpenLogExplorer,
  onOpenMitreMatrix
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [height, setHeight] = useState(240); // Height in px
  const [activeTab, setActiveTab] = useState<'logs' | 'timeline' | 'mitre' | 'stats' | 'console'>('logs');
  
  // Log filtering
  const [logFilterLevel, setLogFilterLevel] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Console state
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<{ type: 'cmd' | 'output'; text: string }[]>([
    { type: 'output', text: 'ArcCyber SOC Security Terminal v2.4 initialized.' },
    { type: 'output', text: 'Type "help" to view available simulation commands.' }
  ]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'console') {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleHistory, activeTab]);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = logFilterLevel === 'ALL' || log.level === logFilterLevel;
    const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
                          (log.sourceHost && log.sourceHost.toLowerCase().includes(logSearch.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim();
    setConsoleHistory(prev => [...prev, { type: 'cmd', text: `$ ${cmd}` }]);
    setConsoleInput('');

    const output = onExecuteConsoleCommand(cmd);
    setConsoleHistory(prev => [...prev, { type: 'output', text: output }]);
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `soc_logs_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Recharts Data
  const pieData = [
    { name: 'Healthy', value: healthyCount, color: '#10B981' },
    { name: 'Warning', value: warningCount, color: '#D97706' },
    { name: 'Compromised', value: compromisedCount, color: '#EF4444' },
  ].filter(d => d.value > 0);

  return (
    <div 
      style={{ height: isOpen ? `${height}px` : '40px' }}
      className="w-full soc-glass border-t border-slate-200 dark:border-slate-800 flex flex-col z-30 transition-all duration-300 relative shrink-0"
    >
      {/* Drawer Header & Tabs */}
      <div className="h-10 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between px-3 bg-slate-100/90 dark:bg-slate-900/80 select-none">
        {/* Left Tabs */}
        <div className="flex items-center gap-1">
          {[
            { id: 'logs', label: `Event Logs (${logs.length})`, icon: ListFilter },
            { id: 'timeline', label: 'Attack Timeline', icon: Clock },
            { id: 'mitre', label: 'MITRE ATT&CK', icon: ShieldCheck },
            { id: 'stats', label: 'SOC Analytics', icon: BarChart3 },
            { id: 'console', label: 'Interactive Console', icon: Terminal },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (!isOpen) setIsOpen(true);
                }}
                className={`px-3 py-1 rounded-t text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive && isOpen
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Toggle Drawer Height / Open */}
        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-gray-400 font-mono font-medium">
              <button onClick={() => setHeight(180)} className="px-1 hover:text-slate-900 dark:hover:text-white">180px</button>
              <span>|</span>
              <button onClick={() => setHeight(280)} className="px-1 hover:text-slate-900 dark:hover:text-white">280px</button>
              <span>|</span>
              <button onClick={() => setHeight(400)} className="px-1 hover:text-slate-900 dark:hover:text-white">400px</button>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition border border-slate-300 dark:border-slate-700"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      {isOpen && (
        <div className="flex-1 overflow-hidden p-3 bg-slate-50/90 dark:bg-slate-950/60 font-mono">
          {/* TAB 1: EVENT LOGS */}
          {activeTab === 'logs' && (
            <div className="h-full flex flex-col space-y-2">
              {/* Filter Controls Bar */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400 dark:text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Search log messages..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded pl-7 pr-2 py-1 text-xs text-slate-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 font-mono w-48 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                    />
                  </div>

                  {/* Level Filters */}
                  <div className="flex items-center gap-1">
                    {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setLogFilterLevel(lvl)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          logFilterLevel === lvl
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenLogExplorer && (
                    <button
                      onClick={onOpenLogExplorer}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs flex items-center gap-1.5 font-bold shadow-xs transition"
                    >
                      <ListFilter className="w-3.5 h-3.5" /> Full-screen Explorer
                    </button>
                  )}

                  <button
                    onClick={handleExportLogs}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>
                </div>
              </div>

              {/* Log Stream List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {filteredLogs.length === 0 ? (
                  <div className="text-slate-400 dark:text-gray-500 py-6 text-center text-xs">No matching log events recorded</div>
                ) : (
                  filteredLogs.map(log => (
                    <div 
                      key={log.id} 
                      className={`p-1.5 rounded flex items-center justify-between border ${
                        log.level === 'CRITICAL' 
                          ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-500/50 dark:text-red-300' 
                          : log.level === 'WARNING'
                          ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-300'
                          : 'bg-white border-slate-200 text-slate-800 dark:bg-slate-900/60 dark:border-slate-800 dark:text-gray-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 dark:text-gray-500 text-[10px] shrink-0 font-medium">{log.timestamp}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                          log.level === 'CRITICAL' ? 'bg-red-600 text-white' :
                          log.level === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-gray-200'
                        }`}>
                          {log.level}
                        </span>
                        {log.sourceHost && (
                          <span className="text-blue-700 dark:text-blue-400 font-bold shrink-0">[{log.sourceHost}]</span>
                        )}
                        <span className="truncate font-medium">{log.message}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ATTACK TIMELINE SCRUBBER */}
          {activeTab === 'timeline' && (
            <div className="h-full flex flex-col justify-between p-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider mb-2">Scenario Progression Timeline</h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono mb-4">
                  Current Step: <span className="text-blue-600 dark:text-blue-400 font-bold">{currentStepIndex}</span> / {totalSteps}
                </p>

                {/* Timeline Step Nodes */}
                <div className="flex items-center justify-between relative px-6">
                  {/* Line Background */}
                  <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-300 dark:bg-slate-800 -translate-y-1/2 z-0" />
                  
                  {Array.from({ length: Math.max(totalSteps, 1) }).map((_, idx) => {
                    const stepNum = idx + 1;
                    const isPassed = stepNum <= currentStepIndex;
                    const isCurrent = stepNum === currentStepIndex;
                    return (
                      <button
                        key={stepNum}
                        onClick={() => onScrubStep(stepNum)}
                        className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-blue-600 border-white text-white scale-125 shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                            : isPassed
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-gray-500 hover:border-slate-500'
                        }`}
                      >
                        {stepNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 rounded-lg text-xs font-mono shadow-xs">
                <p className="text-slate-500 dark:text-gray-400 font-medium">Step Action Summary:</p>
                <p className="text-blue-700 dark:text-blue-300 font-bold mt-1">
                  {currentStepIndex > 0 ? `Step ${currentStepIndex} execution in progress.` : 'Click "Run Scenario" in header to start simulation timeline.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MITRE ATT&CK MATRIX */}
          {activeTab === 'mitre' && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider">MITRE ATT&CK Cyber Kill Chain Tracker</h4>
                {onOpenMitreMatrix && (
                  <button
                    onClick={onOpenMitreMatrix}
                    className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs flex items-center gap-1.5 font-bold shadow-xs transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Full-screen 14-Column Matrix
                  </button>
                )}
              </div>
              <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-x-auto">
                {mitrePhases.map(phase => {
                  const isActive = phase.status === 'active';
                  const isDone = phase.status === 'completed';
                  return (
                    <div 
                      key={phase.id}
                      className={`p-2 rounded-lg border flex flex-col justify-between text-center transition-all ${
                        isActive
                          ? 'bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/80 dark:border-amber-500 dark:text-amber-300 animate-pulse shadow-sm'
                          : isDone
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/60 dark:text-emerald-300'
                          : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900/60 dark:border-slate-800 dark:text-gray-500'
                      }`}
                    >
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-gray-400 block font-semibold">STAGE {phase.stage}</span>
                        <h5 className="text-[11px] font-bold mt-1 leading-tight">{phase.name}</h5>
                      </div>
                      <div className="mt-2 text-[9px] font-mono border-t border-slate-200 dark:border-slate-800 pt-1 font-medium">
                        {phase.techniqueId || 'TBD'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SOC ANALYTICS & CHARTS */}
          {activeTab === 'stats' && (
            <div className="h-full grid grid-cols-2 gap-4">
              {/* Traffic Mbps Chart */}
              <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
                <h5 className="text-xs font-bold text-slate-800 dark:text-gray-300 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Network Throughput (Mbps)
                </h5>
                <div className="h-36 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMbps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748B" fontSize={9} tick={{ fill: '#94A3B8', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                      <YAxis stroke="#64748B" fontSize={9} tick={{ fill: '#94A3B8', fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#F8FAFC',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}
                      />
                      <Area type="monotone" dataKey="mbps" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorMbps)" dot={{ r: 2, fill: '#3B82F6', stroke: '#60A5FA', strokeWidth: 1 }} activeDot={{ r: 4, fill: '#3B82F6', stroke: '#93C5FD', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Asset Health Pie Chart */}
              <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
                <h5 className="text-xs font-bold text-slate-800 dark:text-gray-300 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> Asset Health Distribution
                </h5>
                <div className="h-36 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {pieData.map((entry, index) => (
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
                        formatter={(value: any, name: any) => [`${value} devices`, name]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                        iconType="circle"
                        iconSize={6}
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTERACTIVE CONSOLE */}
          {activeTab === 'console' && (
            <div className="h-full flex flex-col justify-between bg-slate-900 text-emerald-400 p-2 rounded border border-slate-700">
              {/* Output log scroll */}
              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px]">
                {consoleHistory.map((item, idx) => (
                  <div key={idx} className={item.type === 'cmd' ? 'text-blue-400 font-bold' : 'text-emerald-300 whitespace-pre-wrap'}>
                    {item.text}
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>

              {/* Command Input Form */}
              <form onSubmit={handleConsoleSubmit} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
                <span className="text-emerald-400 font-bold text-xs">$</span>
                <input
                  type="text"
                  placeholder="Type CLI command (help, ping, nmap, isolate, status)..."
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs text-emerald-300 font-mono focus:outline-none placeholder:text-slate-600"
                />
                <button type="submit" className="p-1 text-emerald-400 hover:text-emerald-300">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
