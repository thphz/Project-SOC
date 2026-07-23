import React, { useState } from 'react';
import { 
  Search, 
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
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { PALETTE_ITEMS, type PaletteItem } from '../data/mockData';
import type { DeviceType } from '../types/soc';

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

interface LeftSidebarProps {
  onAddNode: (item: PaletteItem) => void;
  nodeCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAddNode, nodeCount }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = PALETTE_ITEMS.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  if (collapsed) {
    return (
      <div className="w-12 h-full soc-glass border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 z-20 shrink-0">
        <button 
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white mb-4 border border-slate-300 dark:border-slate-700"
          title="Expand Palette"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="writing-mode-vertical text-xs font-mono text-slate-500 dark:text-gray-400 tracking-wider rotate-180 uppercase font-semibold">
          Device Palette ({nodeCount})
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 h-full soc-glass border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">Asset Palette</h3>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">Drag or click to add device ({nodeCount} active)</p>
        </div>
        <button 
          onClick={() => setCollapsed(true)}
          className="p-1 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800/60 overflow-x-auto text-[10px] font-medium no-scrollbar">
        {['all', 'endpoints', 'networking', 'servers', 'security'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-1 rounded capitalize whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-600/30 dark:text-blue-300 dark:border-blue-500/40 font-bold'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-gray-500">No matching assets found</div>
        ) : (
          filteredItems.map(item => {
            const Icon = ICON_MAP[item.type] || Server;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => onAddNode(item)}
                className="group flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/60 hover:bg-blue-50/60 dark:hover:bg-slate-800/60 cursor-grab active:cursor-grabbing transition-all shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-600/20 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-white">{item.label}</h5>
                    <p className="text-[9px] text-slate-500 dark:text-gray-400 font-mono">{item.defaultOs}</p>
                  </div>
                </div>
                <button 
                  className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  title="Add to canvas"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
