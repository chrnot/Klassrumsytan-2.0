
import React, { useState, useEffect, useRef, useMemo } from 'react';

interface MindsetOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  hoverColor: string;
  desc: string;
}

const MINDSET_OPTIONS: MindsetOption[] = [
  { id: 'panik', label: 'Panikzonen', emoji: '🤯', color: 'bg-rose-500', hoverColor: 'bg-rose-600', desc: 'Det känns jättesvårt, jag vet inte var jag ska börja.' },
  { id: 'lar', label: 'Lär-zonen', emoji: '🌱', color: 'bg-emerald-500', hoverColor: 'bg-emerald-600', desc: 'Utmanande men spännande! Jag kämpar och lär mig.' },
  { id: 'komfort', label: 'Komfortzonen', emoji: '🛋️', color: 'bg-indigo-500', hoverColor: 'bg-indigo-600', desc: 'Det här kan jag redan, det känns tryggt och enkelt.' }
];

const API_BASE = 'https://api.restful-api.dev/objects';

const MindsetCheck: React.FC = () => {
  const [phase, setPhase] = useState<'before' | 'after' | 'compare'>('before');
  const [beforeVotes, setBeforeVotes] = useState<Record<string, number>>({ panik: 0, lar: 0, komfort: 0 });
  const [afterVotes, setAfterVotes] = useState<Record<string, number>>({ panik: 0, lar: 0, komfort: 0 });
  const [isLive, setIsLive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const pollInterval = useRef<number | null>(null);

  // Added explicit types (number) to reduce arguments to fix 'unknown' type error during sum calculation
  const totalBefore = useMemo(() => Object.values(beforeVotes).reduce((a: number, b: number) => a + b, 0), [beforeVotes]);
  const totalAfter = useMemo(() => Object.values(afterVotes).reduce((a: number, b: number) => a + b, 0), [afterVotes]);

  const startSession = async () => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `MINDSET_${Date.now()}`,
          data: { 
            type: 'MINDSET_CHECK',
            phase,
            options: MINDSET_OPTIONS,
            updatedAt: Date.now() 
          }
        })
      });
      const data = await response.json();
      setSessionId(data.id);
      setIsLive(true);
      startPolling(data.id);
    } catch (e) { alert("Kunde inte starta live-session."); }
  };

  const startPolling = (id: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = window.setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) return;
        const serverData = await res.json();
        if (serverData.data?.votes) {
          if (phase === 'before') setBeforeVotes(serverData.data.votes);
          else if (phase === 'after') setAfterVotes(serverData.data.votes);
        }
      } catch (e) {}
    }, 2000);
  };

  const syncPhaseChange = async (newPhase: 'before' | 'after' | 'compare') => {
    setPhase(newPhase);
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: "MINDSET_ACTIVE",
            data: { 
              type: 'MINDSET_CHECK',
              phase: newPhase,
              options: MINDSET_OPTIONS,
              updatedAt: Date.now(),
              // Bevara röster vid fasbyte om man vill, eller nollställ efter-röster
              votes: newPhase === 'after' ? { panik: 0, lar: 0, komfort: 0 } : beforeVotes
            }
          })
        });
      } catch (e) {}
    }
  };

  const manualVote = (id: string) => {
    if (phase === 'before') setBeforeVotes(prev => ({ ...prev, [id]: prev[id] + 1 }));
    else if (phase === 'after') setAfterVotes(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const shareLink = sessionId ? `${window.location.origin}${window.location.pathname}?join=${sessionId}` : '';

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pb-10">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="text-3xl">🌡️</span> Känslo-Termometern
          </h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Självförtroende & Mindset</p>
        </div>
        <div className="flex gap-2">
          {!isLive ? (
            <button onClick={startSession} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
              🚀 Starta Live
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mr-4">Live</span>
              <button onClick={() => { setIsLive(false); if(pollInterval.current) clearInterval(pollInterval.current); setSessionId(null); }} className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-700">Avbryt</button>
            </div>
          )}
        </div>
      </header>

      {isLive && sessionId && (
        <div className="mb-8 bg-slate-50 border border-slate-100 p-4 rounded-[2.5rem] flex items-center gap-6 animate-in slide-in-from-top-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}`} alt="QR" className="w-20 h-20" />
          </div>
          <div className="flex-1">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dela med eleverna</p>
             <div className="flex items-center gap-2">
               <code className="text-[10px] font-bold text-indigo-600 truncate max-w-[150px] bg-white px-2 py-1 rounded-lg border">{shareLink}</code>
               <button onClick={() => { navigator.clipboard.writeText(shareLink); alert("Kopierat!"); }} className="text-[9px] font-black text-indigo-500">KOPIERA</button>
             </div>
          </div>
        </div>
      )}

      {/* PHASE NAVIGATOR */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10 w-full max-w-sm mx-auto shadow-inner">
        {[
          { id: 'before', label: '1. Före momentet' },
          { id: 'after', label: '2. Efter momentet' },
          { id: 'compare', label: '3. Feedback-loopen' }
        ].map(p => (
          <button 
            key={p.id}
            onClick={() => syncPhaseChange(p.id as any)}
            className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
              phase === p.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center">
        {phase !== 'compare' ? (
          <div className="w-full space-y-12">
             <div className="text-center">
               <h3 className="text-3xl font-black text-slate-800 mb-2">
                 {phase === 'before' ? 'Hur känns det inför uppgiften?' : 'Hur känns det nu när vi är klara?'}
               </h3>
               <p className="text-slate-400 font-medium text-sm">Välj en zon som beskriver ditt nuvarande mindset.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
               {MINDSET_OPTIONS.map(opt => (
                 <button 
                  key={opt.id}
                  onClick={() => manualVote(opt.id)}
                  className="flex flex-col items-center text-center p-8 bg-white border border-slate-100 rounded-[3rem] hover:border-indigo-400 hover:shadow-2xl transition-all group relative overflow-hidden"
                 >
                   <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500">{opt.emoji}</div>
                   <h4 className="text-lg font-black text-slate-800 mb-2">{opt.label}</h4>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-6 px-4">{opt.desc}</p>
                   <div className={`mt-auto px-6 py-2 rounded-full font-black text-white text-xs ${opt.color}`}>
                     {phase === 'before' ? beforeVotes[opt.id] : afterVotes[opt.id]} RÖSTER
                   </div>
                 </button>
               ))}
             </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-12 animate-in zoom-in-95 duration-500 px-4">
            <div className="text-center">
              <h3 className="text-4xl font-black text-slate-800 mb-2">Feedback-loopen 📈</h3>
              <p className="text-slate-500 font-medium">Se hur klassens självbild förflyttades under lektionen.</p>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {MINDSET_OPTIONS.map(opt => {
                const percBefore = totalBefore > 0 ? (beforeVotes[opt.id] / totalBefore) * 100 : 0;
                const percAfter = totalAfter > 0 ? (afterVotes[opt.id] / totalAfter) * 100 : 0;
                const diff = percAfter - percBefore;

                return (
                  <div key={opt.id} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{opt.emoji}</span>
                        <span className="font-black text-slate-800 text-lg uppercase tracking-tight">{opt.label}</span>
                      </div>
                      <div className={`font-black text-xs px-3 py-1 rounded-full ${diff > 0 ? 'bg-emerald-50 text-emerald-600' : diff < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                        {diff > 0 ? `+${Math.round(diff)}% Ökning` : diff < 0 ? `${Math.round(diff)}% Minskning` : 'Ingen förändring'}
                      </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
                         <span>Före</span>
                         <span>{Math.round(percBefore)}%</span>
                       </div>
                       <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                         <div className={`h-full opacity-40 ${opt.color} rounded-full transition-all duration-1000`} style={{ width: `${percBefore}%` }} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase text-indigo-400 tracking-widest px-2">
                         <span>Efter</span>
                         <span>{Math.round(percAfter)}%</span>
                       </div>
                       <div className="h-8 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner relative">
                         <div className={`h-full ${opt.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${percAfter}%` }} />
                         {percAfter > 0 && <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-overlay">NU: {Math.round(percAfter)}%</span>}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[3rem] text-center">
              <span className="text-3xl mb-4 block">💡</span>
              <p className="text-indigo-900 font-bold text-lg leading-relaxed max-w-2xl mx-auto">
                {totalAfter > totalBefore && afterVotes.lar > beforeVotes.lar 
                  ? "Fantastiskt! Klassen har rört sig mot Lär-zonen. Det tyder på ett stärkt Growth Mindset."
                  : "Använd resultatet för att diskutera att det är okej att vara i Panikzonen ibland – det är där den största utvecklingen kan ske!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindsetCheck;
