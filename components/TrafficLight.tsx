
import React, { useState, useEffect } from 'react';

interface StatusMode {
  id: string;
  type: 'light' | 'symbol';
  color?: string;
  icon: string;
  label: string;
  desc: string;
  glow?: string;
}

const TrafficLight: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Default configuration for modes
  const defaultModes: StatusMode[] = [
    // Traffic Lights
    { 
      id: 'red', 
      type: 'light',
      color: 'bg-red-500', 
      icon: '🔴',
      label: 'Stopp / Lyssna', 
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]',
      desc: 'Läraren pratar eller så krävs totalt fokus. Ingen pratar.'
    },
    { 
      id: 'yellow', 
      type: 'light',
      color: 'bg-amber-400', 
      icon: '🟡',
      label: 'Gör klart / Vänta', 
      glow: 'shadow-[0_0_40px_rgba(251,191,36,0.4)]',
      desc: 'Avsluta det du gör. Förbered dig på nästa steg.'
    },
    { 
      id: 'green', 
      type: 'light',
      color: 'bg-emerald-500', 
      icon: '🟢',
      label: 'Börja arbeta', 
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.4)]',
      desc: 'Sätt igång med uppgiften! Följ arbetssymbolen nedan.'
    },
    // Working Symbols
    {
      id: 'silence',
      type: 'symbol',
      icon: '🤫',
      label: 'Tystnad',
      desc: 'Arbeta helt självständigt utan att prata.'
    },
    {
      id: 'whisper',
      type: 'symbol',
      icon: '👤👤',
      label: 'Viska',
      desc: 'Prata så tyst att bara bänkkompisen hör.'
    },
    {
      id: 'ask_neighbor',
      type: 'symbol',
      icon: '🙋‍♂️',
      label: 'Fråga grannen',
      desc: 'Fråga först en kompis, sedan läraren.'
    },
    {
      id: 'group',
      type: 'symbol',
      icon: '👥',
      label: 'Grupparbete',
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

  const updateModeText = (id: string, field: 'label' | 'desc', value: string) => {
    setModes(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const activeMode = modes.find(m => m.id === activeId);
  const lights = modes.filter(m => m.type === 'light');
  const symbols = modes.filter(m => m.type === 'symbol');

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 h-full max-h-full">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-xl text-lg">🚦</div>
          <div>
            <h2 className="text-lg font-black text-slate-800 leading-tight">Status</h2>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
            isEditing 
              ? 'bg-amber-100 border-amber-200 text-amber-700' 
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
          }`}
        >
          {isEditing ? 'Spara' : 'Anpassa ⚙️'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Compressed Traffic Light */}
        <div className="md:col-span-4 flex flex-col justify-center items-center">
          <div className="bg-slate-800 p-3 md:p-4 rounded-[3rem] shadow-xl flex flex-col gap-3 md:gap-4 border-4 border-slate-700 w-fit">
            {lights.map((light) => (
              <button
                key={light.id}
                onClick={() => setActiveId(light.id)}
                className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full transition-all duration-300 border-2 border-slate-900/20 flex items-center justify-center text-3xl ${
                  activeId === light.id 
                    ? `${light.color} ${light.glow} scale-105` 
                    : 'bg-slate-900/50 grayscale opacity-40 hover:opacity-70'
                }`}
              >
                <span className={activeId === light.id ? 'opacity-100' : 'opacity-0'}>{light.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compressed Display Area with LARGER TEXT */}
        <div className="md:col-span-8 flex flex-col gap-3 h-full justify-center">
          <div className={`flex-1 bg-white p-6 md:p-10 rounded-[2.5rem] border-2 shadow-sm flex flex-col items-center justify-center text-center transition-all duration-500 overflow-hidden ${
            activeMode?.type === 'light' ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-50'
          }`}>
            {activeId ? (
              <div key={activeId} className="animate-in fade-in zoom-in-95 duration-300 w-full">
                <div className="text-6xl md:text-7xl mb-4">{activeMode?.icon}</div>
                
                {isEditing ? (
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Rubrik</label>
                      <input 
                        type="text"
                        value={activeMode?.label}
                        onChange={(e) => updateModeText(activeMode!.id, 'label', e.target.value)}
                        className="w-full text-xl font-black text-slate-800 bg-white border border-indigo-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Instruktion</label>
                      <textarea 
                        value={activeMode?.desc}
                        onChange={(e) => updateModeText(activeMode!.id, 'desc', e.target.value)}
                        className="w-full text-sm text-slate-600 bg-white border border-indigo-100 rounded-xl px-4 py-2 outline-none h-20 resize-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className={`text-4xl md:text-5xl font-black mb-4 leading-tight ${
                      activeMode?.id === 'red' ? 'text-red-500' : 
                      activeMode?.id === 'yellow' ? 'text-amber-500' : 
                      activeMode?.id === 'green' ? 'text-emerald-500' : 'text-indigo-600'
                    }`}>
                      {activeMode?.label}
                    </h3>
                    <p className="text-lg md:text-xl text-slate-600 font-bold leading-snug max-w-lg mx-auto">
                      {activeMode?.desc}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-slate-200 flex flex-col items-center">
                <div className="text-6xl mb-4 opacity-30">📢</div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Välj status för klassen</p>
              </div>
            )}
          </div>
          
          {activeId && (
            <button
              onClick={() => setActiveId(null)}
              className="mx-auto bg-slate-100 text-slate-400 px-6 py-2 rounded-xl font-black text-[10px] hover:bg-slate-200 transition-all shrink-0 tracking-widest"
            >
              NOLLSTÄLL
            </button>
          )}
        </div>
      </div>

      {/* Tighter Working Symbols Grid */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {symbols.map((symbol) => (
          <button
            key={symbol.id}
            onClick={() => setActiveId(symbol.id)}
            className={`flex flex-col items-center justify-center py-4 px-1 rounded-[1.5rem] transition-all border ${
              activeId === symbol.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md scale-[1.03]'
                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100 shadow-sm'
            }`}
          >
            <span className="text-3xl mb-1">{symbol.icon}</span>
            <span className="font-black text-[10px] uppercase tracking-tighter text-center px-1 truncate w-full">{symbol.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrafficLight;
