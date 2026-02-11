
import React, { useState, useEffect, useCallback, useMemo } from 'react';

type SubjectMode = 'general' | 'so' | 'no' | 'language';

interface Bubble {
  id: string;
  category: 'build' | 'challenge' | 'clarify' | 'connect';
  text: string;
}

const CATEGORIES = {
  build: { label: 'Bygga vidare', color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', icon: '🌱' },
  challenge: { label: 'Utmana/Vända', color: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', icon: '🔄' },
  clarify: { label: 'Förtydliga', color: 'bg-amber-400', light: 'bg-amber-50', text: 'text-amber-700', icon: '🔍' },
  connect: { label: 'Undra/Koppla', color: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', icon: '🔗' }
};

const BUBBLE_DATA: Record<SubjectMode, Bubble[]> = {
  general: [
    { id: 'g1', category: 'build', text: 'Jag vill fylla på det du sa med att...' },
    { id: 'g2', category: 'build', text: 'En annan sak som hänger ihop med det är...' },
    { id: 'g3', category: 'challenge', text: 'Å andra sidan skulle det kunna vara...' },
    { id: 'g4', category: 'challenge', text: 'Jag håller med om X, men inte om Y för att...' },
    { id: 'g5', category: 'clarify', text: 'Det viktigaste i det jag säger är...' },
    { id: 'g6', category: 'clarify', text: 'Menar du att...? Kan du förklara mer?' },
    { id: 'g7', category: 'connect', text: 'Det här påminner mig om när vi...' },
    { id: 'g8', category: 'connect', text: 'Vad skulle hända om vi istället...?' }
  ],
  so: [
    { id: 's1', category: 'build', text: 'En konsekvens av detta blev att...' },
    { id: 's2', category: 'challenge', text: 'Om vi kollar på källan så ser vi att...' },
    { id: 's3', category: 'clarify', text: 'Huvudorsaken till händelsen var...' },
    { id: 's4', category: 'connect', text: 'Det här liknar en annan tidsepok då...' },
    { id: 's5', category: 'challenge', text: 'Vems perspektiv är det vi hör här?' }
  ],
  no: [
    { id: 'n1', category: 'build', text: 'Min hypotes inför försöket är...' },
    { id: 'n2', category: 'clarify', text: 'Resultatet tyder på att...' },
    { id: 'n3', category: 'challenge', text: 'Skulle felkällan kunna vara att...?' },
    { id: 'n4', category: 'connect', text: 'Detta fenomen kan vi se i vardagen när...' },
    { id: 'n5', category: 'build', text: 'Vi kan dra slutsatsen att...' }
  ],
  language: [
    { id: 'l1', category: 'clarify', text: 'Jag tolkar budskapet i texten som...' },
    { id: 'l2', category: 'build', text: 'Textens stämning skapas genom att...' },
    { id: 'l3', category: 'connect', text: 'Huvudpersonen påminner mig om...' },
    { id: 'l4', category: 'challenge', text: 'Man kan också se motivet som...' },
    { id: 'l5', category: 'clarify', text: 'Författaren använder liknelsen för att...' }
  ]
};

const ConversationBubbles: React.FC = () => {
  const [mode, setMode] = useState<SubjectMode>('general');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [randomizing, setRandomizing] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const currentBubbles = useMemo(() => BUBBLE_DATA[mode], [mode]);

  const slumpa = () => {
    setRandomizing(true);
    setHighlightedId(null);
    let count = 0;
    const interval = setInterval(() => {
      const rand = currentBubbles[Math.floor(Math.random() * currentBubbles.length)];
      setHighlightedId(rand.id);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setRandomizing(false);
      }
    }, 100);
  };

  const adjustTimer = (amount: number) => {
    setTimerSeconds(prev => Math.max(0, prev + amount));
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 px-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Snack-Bubblan 2.0</h2>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Samtalsstöd & meningsbyggare</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={mode} 
            onChange={(e) => { setMode(e.target.value as SubjectMode); setHighlightedId(null); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="general">🌍 Generellt</option>
            <option value="so">🏛️ SO-läge</option>
            <option value="no">🧪 NO-läge</option>
            <option value="language">📖 Språk/Analys</option>
          </select>
          <button 
            onClick={slumpa} 
            disabled={randomizing}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"
          >
            🎲 Slumpa utmaning
          </button>
        </div>
      </header>

      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* CENTER TIMER DISK */}
        <div className="z-20 mb-8 md:mb-0">
          <div className={`w-32 h-32 md:w-44 md:h-44 rounded-full border-8 border-slate-50 shadow-2xl flex flex-col items-center justify-center transition-all duration-700 ${isTimerActive ? 'bg-indigo-50 ring-8 ring-indigo-100' : 'bg-white'}`}>
             <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Samtalstid</span>
             <span className={`text-2xl md:text-4xl font-black tabular-nums transition-colors ${isTimerActive ? 'text-indigo-600' : 'text-slate-800'}`}>
               {formatTime(timerSeconds)}
             </span>
             <div className="flex gap-2 mt-2">
               <button onClick={() => setIsTimerActive(!isTimerActive)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-xs hover:scale-110 transition-transform">
                 {isTimerActive ? '⏸' : '▶'}
               </button>
               <button onClick={() => adjustTimer(60)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-100 text-[10px] font-bold hover:scale-110 transition-transform">
                 +1m
               </button>
             </div>
          </div>
        </div>

        {/* FLOATING BUBBLES GRID */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 overflow-y-auto custom-scrollbar px-2 max-h-[60%] md:max-h-none">
          {currentBubbles.map((bubble) => {
            const cat = CATEGORIES[bubble.category];
            const isHighlighted = highlightedId === bubble.id;
            
            return (
              <button
                key={bubble.id}
                onClick={() => setHighlightedId(isHighlighted ? null : bubble.id)}
                className={`text-left p-5 rounded-[2.5rem] border-2 transition-all duration-500 group relative overflow-hidden ${
                  isHighlighted 
                    ? `${cat.color} border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-105 z-10` 
                    : `${cat.light} border-transparent opacity-80 hover:opacity-100 hover:scale-[1.02]`
                }`}
              >
                <div className="flex items-start gap-4 relative z-10">
                  <span className={`text-2xl transition-transform duration-500 ${isHighlighted ? 'scale-125' : 'group-hover:scale-110'}`}>
                    {cat.icon}
                  </span>
                  <div className="flex-1">
                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isHighlighted ? 'text-white/80' : 'text-slate-400'}`}>
                      {cat.label}
                    </p>
                    <h3 className={`text-sm md:text-base font-bold leading-tight ${isHighlighted ? 'text-white' : 'text-slate-700'}`}>
                      "{bubble.text}"
                    </h3>
                  </div>
                  {isHighlighted && (
                    <div className="absolute -top-2 -right-2 text-white/40 animate-pulse">✨</div>
                  )}
                </div>
                {/* Decorative background shape */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-all duration-1000 ${isHighlighted ? 'bg-white opacity-10' : 'bg-black opacity-[0.02]'}`} />
              </button>
            );
          })}
        </div>
      </div>

      <footer className="shrink-0 p-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center rounded-b-[2.5rem]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Klassens samtalsmål: Lyssna färdigt</span>
        </div>
        <p className="text-[9px] text-slate-400 font-medium italic">
          Tryck på en bubbla för att highlighta "Dagens Bubbla".
        </p>
      </footer>
    </div>
  );
};

export default ConversationBubbles;
