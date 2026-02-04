
import React, { useState, useEffect } from 'react';

interface StatusMode {
  id: string;
  type: 'light' | 'symbol';
  color?: string;
  icon: string;
  label: string;
  desc: string;
  glow?: string;
  focusBg?: string;
}

const TrafficLight: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Configuration for modes
  const defaultModes: StatusMode[] = [
    { 
      id: 'red', 
      type: 'light',
      color: 'bg-red-500', 
      icon: '🔴',
      label: 'Stopp / Lyssna', 
      glow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]',
      focusBg: 'bg-red-50/50',
      desc: 'Läraren pratar eller så krävs totalt fokus. Ingen pratar.'
    },
    { 
      id: 'yellow', 
      type: 'light',
      color: 'bg-amber-400', 
      icon: '🟡',
      label: 'Gör klart / Vänta', 
      glow: 'shadow-[0_0_50px_rgba(251,191,36,0.5)]',
      focusBg: 'bg-amber-50/50',
      desc: 'Avsluta det du gör. Förbered dig på nästa steg.'
    },
    { 
      id: 'green', 
      type: 'light',
      color: 'bg-emerald-500', 
      icon: '🟢',
      label: 'Börja arbeta', 
      glow: 'shadow-[0_0_50px_rgba(16,185,129,0.5)]',
      focusBg: 'bg-emerald-50/50',
      desc: 'Sätt igång med uppgiften! Följ arbetssymbolen nedan.'
    },
    {
      id: 'silence',
      type: 'symbol',
      icon: '🤫',
      label: 'Tystnad',
      focusBg: 'bg-indigo-50/50',
      desc: 'Arbeta helt självständigt utan att prata.'
    },
    {
      id: 'whisper',
      type: 'symbol',
      icon: '👤👤',
      label: 'Viska',
      focusBg: 'bg-indigo-50/50',
      desc: 'Prata så tyst att bara bänkkompisen hör.'
    },
    {
      id: 'ask_neighbor',
      type: 'symbol',
      icon: '🙋‍♂️',
      label: 'Fråga grannen',
      focusBg: 'bg-indigo-50/50',
      desc: 'Fråga först en kompis, sedan läraren.'
    },
    {
      id: 'group',
      type: 'symbol',
      icon: '👥',
      label: 'Grupparbete',
      focusBg: 'bg-indigo-50/50',
      desc: 'Samarbeta och diskutera på normal nivå.'
    }
  ];

  const [modes, setModes] = useState<StatusMode[]>(() => {
    const saved = localStorage.getItem('kp_traffic_modes');
    return saved ? JSON.parse(saved) : defaultModes;
  });

  useEffect(() => {
    localStorage.setItem('kp_traffic_modes', JSON.stringify(modes));
  }, [modes]);

  const handleSelectStatus = (id: string) => {
    setActiveId(id);
    setIsMinimized(true); // Gå in i fokusläge direkt vid val
  };

  const updateModeText = (id: string, field: 'label' | 'desc', value: string) => {
    setModes(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const activeMode = modes.find(m => m.id === activeId);
  const lights = modes.filter(m => m.type === 'light');
  const symbols = modes.filter(m => m.type === 'symbol');

  // RENDER FOKUSLÄGE (Här visas endast det valda meddelandet)
  if (isMinimized && activeMode) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className={`h-full flex flex-col items-center justify-center cursor-pointer group p-8 rounded-[2rem] transition-all duration-500 ${activeMode.focusBg || 'bg-white'}`}
      >
        <div className={`text-9xl md:text-[10rem] mb-8 transition-transform duration-500 group-hover:scale-110 ${activeMode.glow}`}>
          {activeMode.icon}
        </div>
        <h2 className={`text-5xl md:text-7xl font-black text-center mb-6 tracking-tight ${
          activeMode.id === 'red' ? 'text-red-600' : 
          activeMode.id === 'yellow' ? 'text-amber-600' : 
          activeMode.id === 'green' ? 'text-emerald-600' : 'text-indigo-600'
        }`}>
          {activeMode.label}
        </h2>
        <p className="text-xl md:text-2xl text-slate-500 font-bold text-center max-w-2xl leading-relaxed">
          {activeMode.desc}
        </p>
        
        <div className="absolute bottom-6 opacity-0 group-hover:opacity-40 transition-opacity text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Klicka för att ändra status
        </div>
      </div>
    );
  }

  // RENDER INSTÄLLNINGSLÄGE
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 h-full">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-xl text-lg">🚦</div>
          <div>
            <h2 className="text-lg font-black text-slate-800 leading-tight">Välj Status</h2>
          </div>
        </div>
        <div className="flex gap-2">
           <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
              isEditing 
                ? 'bg-amber-100 border-amber-200 text-amber-700' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
            }`}
          >
            {isEditing ? 'Spara' : 'Redigera ✏️'}
          </button>
          {activeId && (
            <button
              onClick={() => setActiveId(null)}
              className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"
            >
              Stäng av
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Kontroller för ljus */}
        <div className="md:col-span-4 flex flex-col justify-center items-center gap-4">
          <div className="bg-slate-800 p-4 rounded-[3.5rem] shadow-xl flex flex-col gap-4 border-4 border-slate-700 w-fit">
            {lights.map((light) => (
              <button
                key={light.id}
                onClick={() => handleSelectStatus(light.id)}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full transition-all duration-300 border-2 border-slate-900/20 flex items-center justify-center text-4xl ${
                  activeId === light.id 
                    ? `${light.color} shadow-[0_0_30px_rgba(0,0,0,0.2)] scale-105` 
                    : 'bg-slate-900/50 grayscale opacity-30 hover:opacity-70'
                }`}
              >
                <span>{light.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Förhandsvisning och instruktioner */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="flex-1 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 p-6 flex flex-col items-center justify-center text-center">
            {activeId ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="text-5xl mb-3">{activeMode?.icon}</div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input 
                      type="text"
                      value={activeMode?.label}
                      onChange={(e) => updateModeText(activeMode!.id, 'label', e.target.value)}
                      className="w-full text-center text-xl font-black bg-white border border-indigo-100 rounded-xl px-4 py-2"
                    />
                    <textarea 
                      value={activeMode?.desc}
                      onChange={(e) => updateModeText(activeMode!.id, 'desc', e.target.value)}
                      className="w-full text-center text-sm text-slate-500 bg-white border border-indigo-100 rounded-xl px-4 py-2 h-20 resize-none"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{activeMode?.label}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">{activeMode?.desc}</p>
                    <button 
                      onClick={() => setIsMinimized(true)}
                      className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    >
                      Framhäv på tavlan 🔦
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">Ingen status aktiv</p>
            )}
          </div>
        </div>
      </div>

      {/* Arbetssymboler */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {symbols.map((symbol) => (
          <button
            key={symbol.id}
            onClick={() => handleSelectStatus(symbol.id)}
            className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all border ${
              activeId === symbol.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'
            }`}
          >
            <span className="text-2xl mb-1">{symbol.icon}</span>
            <span className="font-black text-[9px] uppercase tracking-tighter">{symbol.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrafficLight;
