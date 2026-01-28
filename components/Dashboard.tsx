
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
    { type: ToolType.CHECKLIST, title: 'Arbetsgång', desc: 'Planera lektionen stegvis.', icon: '✅', color: 'bg-emerald-100 text-emerald-600' },
    { type: ToolType.WHITEBOARD, title: 'Whiteboard', desc: 'Rita och förklara visuellt.', icon: '🎨', color: 'bg-blue-100 text-blue-600' },
    { type: ToolType.TIMER, title: 'Timer', desc: 'Sätt fokus med nedräkning.', icon: '⏱️', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.RANDOMIZER, title: 'Slumpa', desc: 'Välj en elev rättvist.', icon: '🎲', color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-10 md:p-16 rounded-[4rem] shadow-2xl text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-indigo-200 mx-auto mb-8 animate-bounce duration-[3000ms]">
            🏫
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-4">
            Välkommen till <span className="text-indigo-600">Klassrumsytan</span>
          </h2>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
            Ditt digitala skrivbord för en lugnare och mer fokuserad lektion. 
            Välj ett verktyg eller sätt stämningen med en ny bakgrund nedan.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {cards.map((card) => (
            <button
              key={card.type}
              onClick={() => onSelectTool(card.type)}
              className="group flex flex-col items-center p-6 bg-white/50 border border-white hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all rounded-[2.5rem]"
            >
              <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">{card.title}</h3>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Background Section */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/40 p-10 rounded-[3.5rem] shadow-xl">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">🖼️</span> Välj stämning
          </h3>
          <BackgroundSelector current={currentBackground} onSelect={onBackgroundSelect} />
        </div>

        {/* AI Inspiration Section */}
        <div className="bg-indigo-600 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-indigo-100 group">
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
              <span className="text-3xl">✨</span> Behöver du inspiration?
            </h3>
            <p className="text-indigo-100 mb-8 leading-relaxed">
              Använd vår AI-assistent för att generera en snabb "icebreaker" eller en 5-minuters aktivitet anpassad för din grupp på {studentsCount} elever.
            </p>
            <button 
              onClick={() => onSelectTool(ToolType.ASSISTANT)}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all w-fit shadow-lg shadow-black/10 group-hover:scale-105"
            >
              Öppna AI Assistenten
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
