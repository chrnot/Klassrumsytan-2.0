
import React from 'react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType | null;
  onSelectTool: (tool: ToolType) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, onClose }) => {
  // Endast pedagogiska verktyg i huvudlistan
  const mainTools = [
    { type: ToolType.INSTRUCTIONS, label: 'Instruktioner', icon: '📝' },
    { type: ToolType.TIMER, label: 'Timer', icon: '⏱️' },
    { type: ToolType.POLLING, label: 'Omröstning', icon: '📊' },
    { type: ToolType.RANDOMIZER, label: 'Slumpa Elev', icon: '🎲' },
    { type: ToolType.NOISE_METER, label: 'Ljudmätare', icon: '🔊' },
    { type: ToolType.TRAFFIC_LIGHT, label: 'Trafikljus', icon: '🚦' },
    { type: ToolType.GROUPING, label: 'Gruppering', icon: '👥' },
    { type: ToolType.ASSISTANT, label: 'AI Assistent', icon: '✨' },
    { type: ToolType.MATTEYTAN, label: 'Matteytan', icon: '🔢' },
  ];

  const renderButton = (item: { type: ToolType, label: string, icon: string }) => (
    <button
      key={item.type}
      onClick={() => onSelectTool(item.type)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left ${
        activeTool === item.type
          ? 'bg-indigo-50 text-indigo-700 font-semibold'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
      <span className="hidden md:block text-sm font-medium">{item.label}</span>
    </button>
  );

  return (
    <aside className="w-full bg-white/90 backdrop-blur-md border-r border-slate-200 flex flex-col h-screen z-[9999]">
      <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shrink-0">
            🏫
          </div>
          <h1 className="hidden md:block font-bold text-xl tracking-tight text-slate-800 whitespace-nowrap">
            Klassrums<span className="text-indigo-600">ytan</span>
          </h1>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="flex w-8 h-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Minimera meny"
          >
            ✕
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {mainTools.map(renderButton)}
      </nav>
      
      <div className="p-3 border-t border-slate-100 space-y-1">
        {/* Åtgärdsknappar placerade i botten */}
        {renderButton({ type: ToolType.DASHBOARD, label: 'Rensa allt', icon: '🧹' })}
        {renderButton({ type: ToolType.BACKGROUND, label: 'Ändra bakgrund', icon: '🖼️' })}
        
        <div className="hidden md:block pt-2">
          <div className="bg-slate-900 rounded-xl p-4 text-white text-[10px] uppercase tracking-wider font-bold opacity-80 text-center">
            Workspace v2.1
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
