
import React, { useState, useMemo, useEffect, useRef } from 'react';

interface PollOption {
  id: string;
  label: string;
  icon: string;
  votes: number;
  color: string;
}

interface PollTemplate {
  id: string;
  title: string;
  question: string;
  options: PollOption[];
}

const TEMPLATES: PollTemplate[] = [
  {
    id: 'default',
    title: 'Snabbkoll',
    question: 'Känslan inför uppgiften?',
    options: [
      { id: '1', label: 'Lätt', icon: '😃', votes: 0, color: 'bg-emerald-500' },
      { id: '2', label: 'Okej', icon: '😐', votes: 0, color: 'bg-amber-400' },
      { id: '3', label: 'Svårt', icon: '😟', votes: 0, color: 'bg-red-500' }
    ]
  },
  {
    id: 'exit-ticket',
    title: 'Exit Ticket',
    question: 'Hur väl förstod du dagens genomgång?',
    options: [
      { id: '1', label: 'Full koll!', icon: '🟢', votes: 0, color: 'bg-emerald-500' },
      { id: '2', label: 'Lite osäker', icon: '🟡', votes: 0, color: 'bg-amber-400' },
      { id: '3', label: 'Behöver hjälp', icon: '🔴', votes: 0, color: 'bg-red-500' }
    ]
  },
  {
    id: 'temp',
    title: 'Energi',
    question: 'Hur är din energinivå just nu?',
    options: [
      { id: '1', label: 'Toppen!', icon: '🚀', votes: 0, color: 'bg-indigo-500' },
      { id: '2', label: 'Okej', icon: '😐', votes: 0, color: 'bg-slate-400' },
      { id: '3', label: 'Trött', icon: '💤', votes: 0, color: 'bg-amber-600' }
    ]
  }
];

const cloneOptions = (opts: PollOption[]) => JSON.parse(JSON.stringify(opts));

const PollingTool: React.FC = () => {
  const [question, setQuestion] = useState(TEMPLATES[0].question);
  const [options, setOptions] = useState<PollOption[]>(cloneOptions(TEMPLATES[0].options));
  const [showResults, setShowResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isLive, setIsLive] = useState(() => localStorage.getItem('kp_poll_live') === 'true');
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('kp_poll_sid'));
  const [isSyncing, setIsSyncing] = useState(false);
  
  const pollInterval = useRef<number | null>(null);
  const lastKnownVotes = useRef<Record<string, number>>({});

  const totalVotes = useMemo(() => options.reduce((acc, opt) => acc + opt.votes, 0), [options]);

  const handleVote = (id: string) => {
    const nextOptions = options.map(opt => opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt);
    setOptions(nextOptions);
    if (isLive && sessionId) {
      syncOptionsToServer(nextOptions);
    }
  };

  const applyTemplate = (templateId: string) => {
    const t = TEMPLATES.find(x => x.id === templateId);
    if (t) {
      const newOpts = cloneOptions(t.options);
      setQuestion(t.question);
      setOptions(newOpts);
      setShowResults(false);
      setIsEditing(false);
      if (isLive && sessionId) syncOptionsToServer(newOpts, t.question);
    }
  };

  const resetVotes = () => {
    const resetOpts = options.map(opt => ({ ...opt, votes: 0 }));
    setOptions(resetOpts);
    setShowResults(false);
    if (isLive && sessionId) syncOptionsToServer(resetOpts);
  };

  // --- LIVE SYNC LOGIC ---

  const startLiveSession = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Klassrumsytan_Poll_V9",
          data: { question, options, active: true, updatedAt: Date.now() }
        })
      });
      const data = await response.json();
      setSessionId(data.id);
      setIsLive(true);
      localStorage.setItem('kp_poll_live', 'true');
      localStorage.setItem('kp_poll_sid', data.id);
      
      startPolling(data.id);
    } catch (err) {
      alert("Kunde inte ansluta till servern.");
    } finally {
      setIsSyncing(false);
    }
  };

  const stopLiveSession = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    setIsLive(false);
    setSessionId(null);
    localStorage.removeItem('kp_poll_live');
    localStorage.removeItem('kp_poll_sid');
  };

  const startPolling = (id: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = window.setInterval(() => fetchResults(id), 3000);
  };

  const fetchResults = async (id: string) => {
    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${id}`);
      if (!response.ok) return;
      const serverData = await response.json();
      
      if (serverData.data && serverData.data.options) {
        const serverOpts = serverData.data.options as PollOption[];
        
        // Jämför rösterna. Uppdatera bara om rösterna ökat för att undvika överlagring av nollställda värden
        setOptions(current => {
          let hasChanges = false;
          const merged = current.map(localOpt => {
            const sOpt = serverOpts.find(s => s.id === localOpt.id);
            if (sOpt && sOpt.votes > localOpt.votes) {
              hasChanges = true;
              return { ...localOpt, votes: sOpt.votes };
            }
            return localOpt;
          });
          return hasChanges ? merged : current;
        });
      }
    } catch (err) {
      console.warn("Polling error");
    }
  };

  const syncOptionsToServer = async (newOpts: PollOption[], newQuestion?: string) => {
    if (!sessionId) return;
    try {
      await fetch(`https://api.restful-api.dev/objects/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Klassrumsytan_Poll_V9",
          data: { 
            question: newQuestion || question, 
            options: newOpts, 
            active: true,
            updatedAt: Date.now()
          }
        })
      });
    } catch (err) {
      console.error("Sync error");
    }
  };

  useEffect(() => {
    if (isLive && sessionId) {
      startPolling(sessionId);
    }
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [isLive, sessionId]);

  const shareLink = `${window.location.origin}${window.location.pathname}?join=${sessionId}`;

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pr-2 pb-10">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="bg-indigo-100 p-2 rounded-xl text-xl">📊</span> 
            Omröstning
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Stäm av läget i klassrummet i realtid.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isLive ? (
            <button
              onClick={startLiveSession}
              disabled={isSyncing}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              {isSyncing ? 'Ansluter...' : '🚀 Sänd Live'}
            </button>
          ) : (
            <button
              onClick={stopLiveSession}
              className="bg-red-50 text-red-500 border border-red-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
            >
              🔴 Avsluta Live
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:border-indigo-300 transition-all"
          >
            {isEditing ? 'Spara' : '⚙️ Anpassa'}
          </button>
          <button
            onClick={resetVotes}
            className="bg-slate-50 text-slate-400 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Nollställ
          </button>
        </div>
      </header>

      {isLive && sessionId && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-top-4">
          <div className="shrink-0 bg-white p-4 rounded-3xl shadow-sm">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}`} 
              alt="QR Code" 
              className="w-24 h-24 md:w-32 md:h-32"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-emerald-800 font-black text-lg mb-1">Live-omröstning aktiv!</h4>
            <p className="text-emerald-600 text-sm font-medium mb-4">Be eleverna skanna QR-koden eller gå till länken nedan:</p>
            <div className="flex items-center gap-2 bg-white/50 p-2 rounded-xl border border-emerald-100">
               <code className="text-[10px] font-bold text-emerald-700 truncate flex-1">{shareLink}</code>
               <button 
                 onClick={() => { navigator.clipboard.writeText(shareLink); alert("Länk kopierad!"); }}
                 className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-all"
               >Kopiera</button>
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-left hover:border-indigo-200 transition-all group"
              >
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Mall</div>
                <div className="font-bold text-slate-700">{t.title}</div>
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Fråga</label>
              <input 
                type="text" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-2xl">
                  <span className="text-2xl">{opt.icon}</span>
                  <input 
                    type="text" 
                    value={opt.label}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx].label = e.target.value;
                      setOptions(next);
                    }}
                    className="flex-1 bg-transparent border-b border-slate-100 outline-none text-sm font-bold text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 py-6">
          <h3 className="text-4xl md:text-5xl font-black text-slate-800 text-center leading-tight max-w-3xl mx-auto">
            {question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                className="group relative flex flex-col items-center justify-center p-10 bg-white rounded-[3.5rem] border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {opt.icon}
                </div>
                <span className="text-xl font-black text-slate-700">{opt.label}</span>
                <div className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-[10px] font-black text-slate-300">
                  +1
                </div>
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto w-full bg-slate-50/50 p-10 rounded-[4rem] border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-slate-400 uppercase tracking-[0.2em] text-[10px] font-black mb-1">Statistik</h4>
                <div className="text-2xl font-black text-slate-800">{totalVotes} <span className="text-slate-400 text-lg font-bold">röster</span></div>
              </div>
              <button
                onClick={() => setShowResults(!showResults)}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  showResults 
                    ? 'bg-white text-slate-500 border border-slate-200 shadow-sm' 
                    : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:scale-105'
                }`}
              >
                {showResults ? 'Dölj Resultat' : 'Visa Resultat'}
              </button>
            </div>

            {showResults ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95">
                {options.map((opt) => {
                  const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                  return (
                    <div key={opt.id} className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-3">
                           <span className="text-2xl">{opt.icon}</span>
                           <span className="font-black text-slate-700">{opt.label}</span>
                        </span>
                        <span className="font-black text-indigo-600">{Math.round(percentage)}%</span>
                      </div>
                      <div className="h-6 w-full bg-white rounded-full overflow-hidden p-1 shadow-inner border border-slate-100">
                        <div 
                          className={`h-full ${opt.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-30 grayscale">
                 <div className="text-7xl mb-4">🕵️‍♂️</div>
                 <p className="font-black text-lg uppercase tracking-widest">Resultat dolda</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollingTool;
