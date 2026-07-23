import { useState } from 'react';
import { 
  Link, 
  Trash2, 
  Layout, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Activity, 
  ShieldAlert, 
  Radio, 
  RotateCcw,
  Crosshair,
  ChevronDown
} from 'lucide-react';
import type { ViewOverlayMode } from '../types/soc';

interface ToolbarOverlayProps {
  viewMode: ViewOverlayMode;
  onChangeViewMode: (mode: ViewOverlayMode) => void;
  onAutoLayout: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onClearCanvas: () => void;
  onDeleteSelected: () => void;
  isConnecting: boolean;
  onToggleConnect: () => void;
  onOpenAttackerToolbox?: () => void;
}

const VIEW_MODES: { id: ViewOverlayMode; label: string; icon: React.ElementType }[] = [
  { id: 'logical', label: 'Logical View', icon: Layout },
  { id: 'traffic', label: 'Traffic Heatmap', icon: Radio },
  { id: 'health', label: 'Health Overview', icon: Activity },
  { id: 'threat', label: 'Threat Vectors', icon: ShieldAlert },
];

export const ToolbarOverlay: React.FC<ToolbarOverlayProps> = ({
  viewMode,
  onChangeViewMode,
  onAutoLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onClearCanvas,
  onDeleteSelected,
  isConnecting,
  onToggleConnect,
  onOpenAttackerToolbox = () => {}
}) => {
  const [isViewModeOpen, setIsViewModeOpen] = useState(false);
  const activeMode = VIEW_MODES.find(vm => vm.id === viewMode) || VIEW_MODES[0];
  const ActiveIcon = activeMode.icon;

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {/* Top Bar: View Overlay Mode Selector (Collapsible) */}
      <div className="soc-glass rounded-xl shadow-md border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setIsViewModeOpen(!isViewModeOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition w-full"
          title="Switch View Mode"
        >
          <ActiveIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{activeMode.label}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isViewModeOpen ? 'rotate-180' : ''}`} />
        </button>

        {isViewModeOpen && (
          <div className="flex items-center gap-1 px-2 pb-2 border-t border-slate-200 dark:border-slate-800 pt-1.5">
            {VIEW_MODES.map(vm => {
              const Icon = vm.icon;
              const isActive = viewMode === vm.id;
              return (
                <button
                  key={vm.id}
                  onClick={() => {
                    onChangeViewMode(vm.id);
                    setIsViewModeOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40 font-bold' 
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{vm.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Second Line: Graph Tool Actions */}
      <div className="soc-glass p-1 rounded-xl flex items-center gap-1 shadow-md border border-slate-200 dark:border-slate-800 self-start">
        {/* Attacker Toolbox / Launch Attack Tool Button */}
        <button
          onClick={onOpenAttackerToolbox}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition bg-red-600/90 hover:bg-red-600 text-white font-bold shadow-xs border border-red-500/50"
          title="Open Interactive Attacker Toolbox & Launch Attacks"
        >
          <Crosshair className="w-3.5 h-3.5 text-red-200 animate-pulse" />
          <span>Attacker Toolbox</span>
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Connect Link Tool */}
        <button
          onClick={onToggleConnect}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            isConnecting 
              ? 'bg-amber-600 text-white font-bold animate-pulse' 
              : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Click to Connect Nodes with Cables"
        >
          <Link className="w-3.5 h-3.5" />
          <span>{isConnecting ? 'Click Node to Link' : 'Connect Cable'}</span>
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          className="p-1.5 rounded-lg text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Auto Layout Network Tree"
        >
          <Layout className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </button>

        {/* Zoom controls */}
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onFitView}
          className="p-1.5 rounded-lg text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Fit Canvas View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Delete Selected */}
        <button
          onClick={onDeleteSelected}
          className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          title="Delete Selected Node/Edge"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Reset / Clear */}
        <button
          onClick={onClearCanvas}
          className="p-1.5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Clear Entire Canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
