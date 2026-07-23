import type { ScreenMode } from '../types/soc';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Bell, 
  Activity,
  Layers,
  Network,
  FileText,
  Grid,
  BarChart2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/mockData';

interface HeaderProps {
  currentScenarioId: string;
  onSelectScenario: (id: string) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  alertCount: number;
  totalEvents: number;
  simTime: string;
  screenMode?: ScreenMode;
  onSelectScreenMode?: (mode: ScreenMode) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenarioId,
  onSelectScenario,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  simSpeed,
  onChangeSpeed,
  darkMode,
  onToggleDarkMode,
  alertCount,
  simTime,
  screenMode = 'canvas',
  onSelectScreenMode = () => {},
  isMuted = false,
  onToggleMute = () => {}
}) => {
  return (
    <header className="h-[52px] w-full soc-glass flex items-center justify-between px-3 z-30 border-b border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-[13px] font-bold tracking-wide text-slate-800 dark:text-gray-100 flex items-center gap-1.5">
            ArcCyber <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 font-mono font-semibold">SOC Digital Twin</span>
          </h1>
          <p className="text-[8px] text-slate-500 dark:text-gray-400 font-mono leading-tight">Cyber Range Event Simulation</p>
        </div>
      </div>

      {/* Center Screen Mode Tabs */}
      <nav className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900/90 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
        {[
          { id: 'canvas', label: 'Canvas', desc: 'Digital Twin Canvas', icon: Network },
          { id: 'logs', label: 'Logs', desc: 'SIEM Log Explorer', icon: FileText },
          { id: 'mitre', label: 'MITRE', desc: '14-column ATT&CK Matrix', icon: Grid },
          { id: 'report', label: 'Report', desc: 'Executive Security Summary', icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = screenMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectScreenMode(tab.id as ScreenMode)}
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
              }`}
              title={tab.desc}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Scenario Selector & Controls */}
      <div className="flex items-center gap-2">
        {/* Scenario Dropdown */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2 py-1 text-[11px] text-slate-800 dark:text-gray-200">
          <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1.5 shrink-0" />
          <select 
            value={currentScenarioId} 
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-transparent text-[11px] text-slate-800 dark:text-gray-200 focus:outline-none cursor-pointer pr-3 font-medium"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-300">-- Custom --</option>
            {PRESET_SCENARIOS.map(sc => (
              <option key={sc.id} value={sc.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-200">
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={onToggleSimulation}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
              isSimulating 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-600/30 dark:text-amber-300 dark:border-amber-500/50' 
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/50'
            }`}
          >
            {isSimulating ? (
              <><Pause className="w-3 h-3" /></>
            ) : (
              <><Play className="w-3 h-3" /></>
            )}
          </button>

          <button
            onClick={onResetSimulation}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center border-l border-slate-300 dark:border-slate-800 pl-0.5 ml-0.5 gap-0.5">
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-1 py-0.5 text-[9px] font-mono rounded ${
                  simSpeed === spd 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Metrics & User */}
      <div className="flex items-center gap-2">
        {/* Simulation Clock & Alert Badge */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-800">
            <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="text-slate-500 dark:text-gray-400 text-[9px]">T:</span>
            <span className="text-blue-700 dark:text-blue-300 font-bold text-[11px]">{simTime}</span>
          </div>

          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[9px]">A:</span>
            <span className="font-bold text-red-700 dark:text-red-300 text-[11px]">{alertCount}</span>
          </div>
        </div>

        {/* Theme + Mute Toggles */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-lg p-0.5">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-gray-400 transition"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded transition ${
              isMuted
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
            title={isMuted ? "Unmute Siren" : "Mute Siren"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition">
          <Bell className="w-3.5 h-3.5" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-[8px] font-bold text-white rounded-full flex items-center justify-center border border-white dark:border-slate-900">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-800 pl-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-600/30 border border-blue-300 dark:border-blue-500/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-[9px]">
            SOC
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-[11px] font-bold text-slate-800 dark:text-gray-200 leading-tight">Analyst</p>
            <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold leading-tight">L2</p>
          </div>
        </div>
      </div>
    </header>
  );
};
