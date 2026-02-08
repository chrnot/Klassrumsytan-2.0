
import React from 'react';
import { ToolType } from '../types';
import BackgroundSelector from './BackgroundSelector';

interface DashboardProps {
  onSelectTool: (tool: ToolType) => void;
  studentsCount: number;
  currentBackground: string;
  onBackgroundSelect: (bg: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTool, studentsCount, currentBackground, onBackgroundSelect }) => {
  const cards = [
    { type: ToolType.CHECKLIST, title: 'Arbetsgång', desc: 'Planera lektionen.', icon: '✅', color: 'bg-emerald-100 text-emerald-600' },
    { type: ToolType.WHITEBOARD, title: 'Whiteboard', desc: 'Rita och förklara.', icon: '🎨', color: 'bg-blue-100 text-blue-600' },
    { type: ToolType.TIMER, title: 'Timer', desc: 'Sätt fokus.', icon: '⏱️', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.RANDOMIZER, title: 'Slumpa', desc: 'Välj rättvist.', icon: '🎲', color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      {/* 1. VÄLKOMMEN RUTA */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 md:p-10 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/30 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/30 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-200 mx-auto mb-4 animate-bounce duration-[3000ms]">
            🏫
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
            Klassrums<span className="text-indigo-600">ytan</span>
          </h2>
          <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed opacity-80">
            Ditt digitala skrivbord för en lugnare lektion.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
          {cards.map((card) => (
            <button
              key={card.type}
              onClick={() => onSelectTool(card.type)}
              className="group flex flex-col items-center p-4 bg-white/50 border border-white hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all rounded-[2rem]"
            >
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-[11px] mb-0.5">{card.title}</h3>
              <p className="text-slate-400 text-[8px] uppercase font-black tracking-widest">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. BAKGRUNDSRUTA */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/40 p-8 rounded-[3rem] shadow-xl">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="text-2xl">🖼️</span> Bakgrund & Stämning
          </h3>
          <BackgroundSelector current={currentBackground} onSelect={onBackgroundSelect} />
        </div>

        {/* 3. AI RUTA */}
        <div className="bg-indigo-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 group">
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
              <span className="text-2xl">✨</span> Lektionsinspiration
            </h3>
            <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
              Generera en snabb aktivitet för dina {studentsCount} elever direkt med vår AI-assistent.
            </p>
            <button 
              onClick={() => onSelectTool(ToolType.ASSISTANT)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all w-fit shadow-lg shadow-black/10 group-hover:scale-105"
            >
              Öppna Assistenten
            </button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
