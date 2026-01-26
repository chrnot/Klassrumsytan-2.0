
import React from 'react';
import { ToolType } from '../types';

interface DashboardProps {
  onSelectTool: (tool: ToolType) => void;
  studentsCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTool, studentsCount }) => {
  const cards = [
    { type: ToolType.INSTRUCTIONS, title: 'Instruktioner', desc: 'Skriv, rita eller visa QR-koder på tavlan.', icon: '📝', color: 'bg-amber-100 text-amber-600' },
    { type: ToolType.TIMER, title: 'Timer', desc: 'Sätt fokus med en visuell nedräkning.', icon: '⏱️', color: 'bg-blue-100 text-blue-600' },
    { type: ToolType.POLLING, title: 'Omröstning', desc: 'Stäm av läget med snabba frågor.', icon: '📊', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.RANDOMIZER, title: 'Slumpa', desc: 'Välj en elev på ett rättvist sätt.', icon: '🎲', color: 'bg-purple-100 text-purple-600' },
    { type: ToolType.NOISE_METER, title: 'Ljud', desc: 'Håll ljudnivån på en bra nivå.', icon: '🔊', color: 'bg-green-100 text-green-600' },
    { type: ToolType.TRAFFIC_LIGHT, title: 'Status', desc: 'Kommunicera tydligt med färg.', icon: '🚦', color: 'bg-red-100 text-red-600' },
    { type: ToolType.GROUPING, title: 'Grupper', desc: 'Skapa slumpmässiga studiegrupper.', icon: '👥', color: 'bg-orange-100 text-orange-600' },
    { type: ToolType.ASSISTANT, title: 'AI Tips', desc: 'Lektionsidéer direkt från Gemini.', icon: '✨', color: 'bg-indigo-100 text-indigo-600' },
    { type: ToolType.MATTEYTAN, title: 'Matteytan', desc: 'Interaktiva matematikövningar för alla årskurser.', icon: '🔢', color: 'bg-teal-100 text-teal-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">God morgon, lärare! 👋</h2>
        <p className="text-slate-500 mt-2">Ditt klassrum är redo. Du har {studentsCount} elever inlagda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.type}
            onClick={() => onSelectTool(card.type)}
            className="group flex flex-col p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left"
          >
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">{card.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h3 className="text-2xl font-bold mb-3">Behöver du inspiration?</h3>
          <p className="text-indigo-100 mb-6">Använd vår AI-assistent för att generera en snabb "icebreaker" eller en 5-minuters aktivitet anpassad för din grupp.</p>
          <button 
            onClick={() => onSelectTool(ToolType.ASSISTANT)}
            className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors"
          >
            Öppna AI Assistenten
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full mr-10 -mb-10"></div>
      </div>
    </div>
  );
};

export default Dashboard;
