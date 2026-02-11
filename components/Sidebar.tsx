
import React, { useState } from 'react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType | null;
  onSelectTool: (tool: ToolType) => void;
  onClose?: () => void;
  openWidgets?: ToolType[];
}

interface ToolInfo {
  type: ToolType;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, onClose, openWidgets = [] }) => {
  const [hoveredTool, setHoveredTool] = useState<ToolInfo | null>(null);

  const tools: ToolInfo[] = [
    { type: ToolType.CHECKLIST, label: 'Arbetsgång', icon: '✅', desc: 'Skapa tydliga checklistor med timers och fokusläge.', color: 'bg-emerald-100 text-emerald-600' },
    { type: ToolType.PLACEMENT, label: 'Klassplacering', icon: '🪑', desc: 'Optimera placeringar baserat på regler och behov.', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.TRAFFIC_LIGHT, label: 'Trafikljus', icon: '🚦', desc: 'Kommunicera tydligt med färg.', color: 'bg-red-100 text-red-600' },
    { type: ToolType.RANDOMIZER, label: 'Slumpa Elev', icon: '🎲', desc: 'Välj en elev på ett rättvist sätt.', color: 'bg-rose-100 text-rose-600' },
    { type: ToolType.GROUPING, label: 'Gruppering', icon: '👥', desc: 'Skapa slumpmässiga studiegrupper.', color: 'bg-orange-100 text-orange-600' },
    { type: ToolType.TIMER, label: 'Timer', icon: '⏱️', desc: 'Sätt fokus med en visuell nedräkning.', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.WHITEBOARD, label: 'Whiteboard', icon: '🎨', desc: 'Rita och förklara visuellt på tavlan.', color: 'bg-blue-100 text-blue-600' },
    { type: ToolType.VIDEO_PLAYER, label: 'Videospelare', icon: '🎬', desc: 'Spela upp YouTube-klipp eller videofiler.', color: 'bg-slate-100 text-slate-600' },
    { type: ToolType.IMAGE_ANNOTATOR, label: 'Bild-rita', icon: '📸', desc: 'Ladda upp en bild och gör anteckningar ovanpå.', color: 'bg-pink-100 text-pink-600' },
    { type: ToolType.QR_CODE, label: 'QR-Kod', icon: '📱', desc: 'Dela länkar snabbt via QR-koder.', color: 'bg-purple-100 text-purple-600' },
    { type: ToolType.POLLING, label: 'Omröstning', icon: '📊', desc: 'Stäm av läget med snabba frågor.', color: 'bg-amber-100 text-amber-600' },
    { type: ToolType.ASSISTANT, label: '5-min Aktivitet', icon: '✨', desc: 'Få förslag på snabba aktiviteter direkt från AI.', color: 'bg-indigo-100 text-indigo-600' },
  ];

  const renderButton = (item: ToolInfo) => {
    const isOpen = openWidgets.includes(item.type);

    return (
      <button
        key={item.type}
        onClick={() => onSelectTool(item.type)}
        onMouseEnter={() => setHoveredTool(item)}
        onMouseLeave={() => setHoveredTool(null)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full text-left relative ${
          activeTool === item.type
            ? 'bg-indigo-50 text-indigo-700 font-semibold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
        <span className="hidden md:block text-sm font-medium flex-1">{item.label}</span>
        {isOpen && (
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        )}
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
      
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto relative custom-scrollbar">
        {tools.map(renderButton)}

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
      
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
        <button
          onClick={() => onSelectTool(ToolType.MATTEYTAN)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-all w-full text-left group"
        >
          <span className="text-xl group-hover:scale-125 transition-transform">🔢</span>
          <div className="flex flex-col">
            <span className="hidden md:block text-sm font-bold">Matteytan</span>
            <span className="hidden md:block text-[9px] font-black uppercase text-teal-600/60 tracking-tighter">VISUALISERA MATTE</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
