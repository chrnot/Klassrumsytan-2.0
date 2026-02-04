
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

const COLORS = ['bg-emerald-500', 'bg-amber-400', 'bg-rose-500', 'bg-indigo-500', 'bg-purple-500', 'bg-cyan-500'];

const TEMPLATES: PollTemplate[] = [
  {
    id: 'true-false',
    title: 'Sant / Falskt',
    question: 'Är påståendet sant?',
    options: [
      { id: '1', label: 'Sant', icon: '✅', votes: 0, color: 'bg-emerald-500' },
      { id: '2', label: 'Falskt', icon: '❌', votes: 0, color: 'bg-rose-500' }
    ]
  },
  {
    id: 'choice-3',
    title: 'Flerval (3)',
    question: 'Vilket svar är rätt?',
    options: [
      { id: '1', label: 'Svar A', icon: 'A', votes: 0, color: 'bg-indigo-500' },
      { id: '2', label: 'Svar B', icon: 'B', votes: 0, color: 'bg-purple-500' },
      { id: '3', label: 'Svar C', icon: 'C', votes: 0, color: 'bg-cyan-500' }
    ]
  },
  {
    id: 'choice-4',
    title: 'Flerval (4)',
    question: 'Välj ett alternativ:',
    options: [
      { id: '1', label: 'Alt 1', icon: '1', votes: 0, color: 'bg-indigo-500' },
      { id: '2', label: 'Alt 2', icon: '2', votes: 0, color: 'bg-indigo-500' },
      { id: '3', label: 'Alt 3', icon: '3', votes: 0, color: 'bg-indigo-500' },
      { id: '4', label: 'Alt 4', icon: '4', votes: 0, color: 'bg-indigo-500' }
    ]
  },
  {
    id: 'feeling',
    title: 'Snabbkoll',
    question: 'Hur känns det just nu?',
    options: [
      { id: '1', label: 'Bra', icon: '😃', votes: 0, color: 'bg-emerald-500' },
      { id: '2', label: 'Okej', icon: '😐', votes: 0, color: 'bg-amber-400' },
      { id: '3', label: 'Svårt', icon: '😟', votes: 0, color: 'bg-rose-500' }
    ]
  }
];

const API_BASE = 'https://api.restful-api.dev/objects';

const PollingTool: React.FC = () => {
  const [question, setQuestion] = useState(TEMPLATES[0].question);
  const [options, setOptions] = useState<PollOption[]>(() => JSON.parse(JSON.stringify(TEMPLATES[0].options)));
  const [showResults, setShowResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isLive, setIsLive] = useState(() => localStorage.getItem('kp_poll_live') === 'true');
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('kp_poll_sid'));
  const [isSyncing, setIsSyncing] = useState(false);
  
  const pollInterval = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const totalVotes = useMemo(() => options.reduce((acc, opt) => acc + opt.votes, 0), [options]);

  const resetVotes = () => {
    const nextOptions = options.map(opt => ({ ...opt, votes: 0 }));
    setOptions(nextOptions);
    if (isLive && sessionId) syncToServer(nextOptions);
  };

  const handleVote = (id: string) => {
    const nextOptions = options.map(opt => opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt);
    setOptions(nextOptions);
    if (isLive && sessionId) syncToServer(nextOptions);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    const newId = (options.length + 1).toString();
    const newOption: PollOption = {
      id: newId,
      label: `Alternativ ${newId}`,
      icon: newId,
      votes: 0,
      color: COLORS[options.length % COLORS.length]
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
  };

  const updateOption = (id: string, field: keyof PollOption, value: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const startLiveSession = async () => {
    setIsSyncing(true);
    try {
      localStorage.removeItem('kp_poll_live');
      localStorage.removeItem('kp_poll_sid');

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: `KP_POLL_${Date.now()}`,
          data: { question, options, updatedAt: Date.now() }
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSessionId(data.id);
      setIsLive(true);
      localStorage.setItem('kp_poll_live', 'true');
      localStorage.setItem('kp_poll_sid', data.id);
      startPolling(data.id);
    } catch (err: any) {
      alert(`Kunde inte starta live: ${err.message}`);
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
    pollInterval.current = window.setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) return;
        const serverData = await res.json();
        if (serverData.data?.updatedAt > lastUpdateRef.current) {
          setOptions(current => current.map(local => {
            const remote = serverData.data.options.find((r: any) => r.id === local.id);
            return remote ? { ...local, votes: remote.votes } : local;
          }));
          lastUpdateRef.current = serverData.data.updatedAt;
        }
      } catch (e) {}
    }, 3000);
  };

  const syncToServer = async (newOpts: PollOption[]) => {
    if (!sessionId) return;
    const now = Date.now();
    lastUpdateRef.current = now;
    try {
      await fetch(`${API_BASE}/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "KP_POLL_ACTIVE",
          data: { question, options: newOpts, updatedAt: now }
        })
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isLive && sessionId) startPolling(sessionId);
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [isLive, sessionId]);

  const shareLink = sessionId ? `${window.location.origin}${window.location.pathname}?join=${sessionId}` : '';

  // Dynamisk grid-layout beroende på antal alternativ
  const gridCols = options.length <= 2 ? 'grid-cols-2' : options.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3';

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4 shrink-0">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">📊 Omröstning</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {!isLive ? (
            <button onClick={startLiveSession} disabled={isSyncing} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg">
              {isSyncing ? '⏳ Startar...' : '🚀 Sänd Live'}
            </button>
          ) : (
            <button onClick={stopLiveSession} className="bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-100">🔴 Stoppa</button>
          )}
          <button onClick={() => {
            if (isEditing && isLive && sessionId) syncToServer(options);
            setIsEditing(!isEditing);
          }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
            {isEditing ? 'Klar ✅' : '⚙️ Redigera'}
          </button>
          <button onClick={resetVotes} className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:text-red-500 transition-colors">Nollställ</button>
        </div>
      </header>

      {isLive && sessionId && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-6 shrink-0">
          <div className="shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-emerald-100">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}`} alt="QR" className="w-24 h-24" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-emerald-800 font-black text-xs uppercase tracking-widest mb-1">Live nu!</h4>
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-emerald-100 shadow-inner max-w-xs mx-auto md:mx-0">
               <code className="text-[9px] font-bold text-emerald-700 truncate flex-1">{shareLink}</code>
               <button onClick={() => { navigator.clipboard.writeText(shareLink); alert("Kopierat!"); }} className="bg-emerald-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg">Kopiera</button>
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6 py-2 animate-in fade-in duration-300">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fråga</label>
            <input 
              type="text" 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-indigo-500" 
              placeholder="Skriv din fråga här..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mallar</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TEMPLATES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { 
                    setQuestion(t.question); 
                    setOptions(JSON.parse(JSON.stringify(t.options)));
                  }} 
                  className="p-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Alternativ</label>
              <button onClick={addOption} disabled={options.length >= 6} className="text-indigo-600 font-bold text-xs hover:underline disabled:opacity-30">
                + Lägg till svar
              </button>
            </div>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl group shadow-sm">
                  <input 
                    type="text" 
                    value={opt.icon} 
                    onChange={(e) => updateOption(opt.id, 'icon', e.target.value)}
                    className="w-10 h-10 text-center bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold outline-none focus:border-indigo-400"
                    placeholder="🎨"
                  />
                  <input 
                    type="text" 
                    value={opt.label} 
                    onChange={(e) => updateOption(opt.id, 'label', e.target.value)}
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-400 outline-none font-bold text-slate-700 py-1"
                    placeholder="Svarstext..."
                  />
                  <button onClick={() => removeOption(opt.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 py-4 flex-1 flex flex-col justify-center">
          <h3 className="text-3xl md:text-5xl font-black text-slate-800 text-center leading-tight tracking-tight px-4">{question}</h3>
          
          <div className={`grid ${gridCols} gap-3 md:gap-4 max-w-4xl mx-auto w-full px-2`}>
            {options.map((opt) => (
              <button 
                key={opt.id} 
                onClick={() => handleVote(opt.id)} 
                className="flex flex-col items-center justify-center p-6 md:p-10 bg-white rounded-3xl border border-slate-100 hover:border-indigo-400 hover:shadow-xl transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                <div className="text-5xl md:text-7xl mb-4 group-hover:scale-110 transition-transform">{opt.icon}</div>
                <span className="text-sm md:text-xl font-black text-slate-700">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto w-full bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 mt-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl md:text-2xl font-black text-slate-800">{totalVotes} <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-2">röster</span></div>
              <button 
                onClick={() => setShowResults(!showResults)} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${showResults ? 'bg-white text-slate-500 border border-slate-100' : 'bg-indigo-600 text-white'}`}
              >
                {showResults ? 'Dölj Resultat' : 'Visa Resultat'}
              </button>
            </div>
            
            {showResults && (
              <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                {options.map((opt) => {
                  const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                  return (
                    <div key={opt.id} className="space-y-2">
                      <div className="flex justify-between font-black text-[10px] md:text-xs px-2 uppercase tracking-wider">
                        <span className="text-slate-700">{opt.icon} {opt.label}</span>
                        <span className="text-indigo-600">{Math.round(percentage)}% ({opt.votes})</span>
                      </div>
                      <div className="h-4 bg-white rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                        <div 
                          className={`h-full ${opt.color} rounded-full transition-all duration-1000 ease-out`} 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollingTool;
