
import React, { useState } from 'react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType | null;
  onSelectTool: (tool: ToolType) => void;
  onClose?: () => void;
}

interface ToolInfo {
  type: ToolType;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, onClose }) => {
  const [hoveredTool, setHoveredTool] = useState<ToolInfo | null>(null);

  const tools: ToolInfo[] = [
    { type: ToolType.INSTRUCTIONS, label: 'Instruktioner', icon: '📝', desc: 'Skriv, rita eller visa QR-koder på tavlan.', color: 'bg-amber-100 text-amber-600' },
    { type: ToolType.TIMER, label: 'Timer', icon: '⏱️', desc: 'Sätt fokus med en visuell nedräkning.', color: 'bg-blue-100 text-blue-600' },
    { type: ToolType.POLLING, label: 'Omröstning', icon: '📊', desc: 'Stäm av läget med snabba frågor.', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.RANDOMIZER, label: 'Slumpa Elev', icon: '🎲', desc: 'Välj en elev på ett rättvist sätt.', color: 'bg-purple-100 text-purple-600' },
    { type: ToolType.NOISE_METER, label: 'Ljudmätare', icon: '🔊', desc: 'Håll ljudnivån på en bra nivå.', color: 'bg-green-100 text-green-600' },
    { type: ToolType.TRAFFIC_LIGHT, label: 'Trafikljus', icon: '🚦', desc: 'Kommunicera tydligt med färg.', color: 'bg-red-100 text-red-600' },
    { type: ToolType.GROUPING, label: 'Gruppering', icon: '👥', desc: 'Skapa slumpmässiga studiegrupper.', color: 'bg-orange-100 text-orange-600' },
    { type: ToolType.ASSISTANT, label: 'AI Assistent', icon: '✨', desc: 'Lektionsidéer direkt från Gemini.', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.MATTEYTAN, label: 'Matteytan', icon: '🔢', desc: 'Matematikövningar för alla årskurser.', color: 'bg-teal-100 text-teal-600' },
  ];

  const renderButton = (item: ToolInfo | { type: ToolType, label: string, icon: string, desc?: string, color?: string }) => {
    const isMain = 'desc' in item;
    return (
      <button
        key={item.type}
        onClick={() => onSelectTool(item.type)}
        onMouseEnter={() => isMain && setHoveredTool(item as ToolInfo)}
        onMouseLeave={() => setHoveredTool(null)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left relative ${
          activeTool === item.type
            ? 'bg-indigo-50 text-indigo-700 font-semibold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
        <span className="hidden md:block text-sm font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-full bg-white/95 backdrop-blur-md border-r border-slate-200 flex flex-col h-screen relative">
      <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shrink-0 shadow-lg shadow-indigo-100">
            🏫
          </div>
          <h1 className="hidden md:block font-bold text-xl tracking-tight text-slate-800">
            Klassrums<span className="text-indigo-600">ytan</span>
          </h1>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="flex w-8 h-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
          >
            ✕
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto relative">
        {tools.map(renderButton)}

        {/* Floating Info Tooltip */}
        {hoveredTool && (
          <div className="hidden md:block absolute left-[100%] ml-2 top-0 mt-2 w-64 p-5 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-left-4 duration-200 z-[10000] pointer-events-none">
            <div className={`w-12 h-12 ${hoveredTool.color} rounded-2xl flex items-center justify-center text-xl mb-4`}>
              {hoveredTool.icon}
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">{hoveredTool.label}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{hoveredTool.desc}</p>
          </div>
        )}
      </nav>
      
      <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
        {renderButton({ type: ToolType.DASHBOARD, label: 'Rensa allt', icon: '🧹' })}
        {renderButton({ type: ToolType.BACKGROUND, label: 'Ändra bakgrund', icon: '🖼️' })}
      </div>
    </aside>
  );
};

export default Sidebar;
