
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
      glow: 'shadow-[0_0_60px_rgba(239,68,68,0.5)]',
      desc: 'Läraren pratar eller så krävs totalt fokus. Ingen pratar.'
    },
    { 
      id: 'yellow', 
      type: 'light',
      color: 'bg-amber-400', 
      icon: '🟡',
      label: 'Gör klart / Vänta', 
      glow: 'shadow-[0_0_60px_rgba(251,191,36,0.5)]',
      desc: 'Avsluta det du gör. Förbered dig på nästa steg.'
    },
    { 
      id: 'green', 
      type: 'light',
      color: 'bg-emerald-500', 
      icon: '🟢',
      label: 'Börja arbeta', 
      glow: 'shadow-[0_0_60px_rgba(16,185,129,0.5)]',
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
      desc: 'Prata så tyst att bara din bänkkompis hör.'
    },
    {
      id: 'ask_neighbor',
      type: 'symbol',
      icon: '🙋‍♂️',
      label: 'Fråga grannen',
      desc: 'Om du behöver hjälp, fråga först en kompis, sedan läraren.'
    },
    {
      id: 'group',
      type: 'symbol',
      icon: '👥',
      label: 'Grupparbete',
      desc: 'Samarbeta och diskutera i gruppen på normal samtalsnivå.'
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Klassrumsstatus</h2>
          <p className="text-slate-500">Styr energin och ljudnivån i rummet visuellt.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
            isEditing 
              ? 'bg-amber-100 border-amber-200 text-amber-700' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
          }`}
        >
          {isEditing ? 'Spara ändringar' : 'Anpassa text ⚙️'}
        </button>
      </header>

      <div className="flex flex-col gap-10">
        {/* Top Section: Traffic Lights + Display Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Traffic Light Container - Larger circles */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-slate-800 p-8 rounded-[4.5rem] shadow-2xl flex flex-col gap-8 border-8 border-slate-700 w-fit">
              {lights.map((light) => (
                <button
                  key={light.id}
                  onClick={() => setActiveId(light.id)}
                  className={`w-28 h-28 md:w-36 md:h-36 rounded-full transition-all duration-300 border-4 border-slate-900/20 flex items-center justify-center text-4xl ${
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

          {/* Display Area - Reduced text size */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            <div className={`flex-1 bg-white p-10 rounded-[3rem] border-2 shadow-sm flex flex-col items-center justify-center text-center min-h-[350px] transition-all duration-500 ${
              activeMode?.type === 'light' ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100'
            }`}>
              {activeId ? (
                <div key={activeId} className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-2xl">
                  <div className="text-7xl mb-8 transform hover:scale-110 transition-transform cursor-default">
                    {activeMode?.icon}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4 text-left">
                      <label className="block text-xs font-bold uppercase text-slate-400">Rubrik</label>
                      <input 
                        type="text"
                        value={activeMode?.label}
                        onChange={(e) => updateModeText(activeMode!.id, 'label', e.target.value)}
                        className="w-full text-3xl font-black text-slate-800 bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <label className="block text-xs font-bold uppercase text-slate-400 mt-4">Instruktion</label>
                      <textarea 
                        value={activeMode?.desc}
                        onChange={(e) => updateModeText(activeMode!.id, 'desc', e.target.value)}
                        className="w-full text-lg text-slate-600 bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className={`text-5xl font-black mb-4 ${
                        activeMode?.id === 'red' ? 'text-red-500' : 
                        activeMode?.id === 'yellow' ? 'text-amber-500' : 
                        activeMode?.id === 'green' ? 'text-emerald-500' : 'text-indigo-600'
                      }`}>
                        {activeMode?.label}
                      </h3>
                      <p className="text-xl text-slate-600 font-medium leading-relaxed">
                        {activeMode?.desc}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <div className="text-8xl mb-6 opacity-20">📢</div>
                  <p className="text-xl italic font-medium">Välj ett läge för att ge klassen instruktioner.</p>
                </div>
              )}
            </div>
            
            {activeId && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setActiveId(null)}
                  className="bg-slate-200 text-slate-600 px-8 py-3 rounded-2xl font-bold hover:bg-slate-300 transition-all"
                >
                  Nollställ tavlan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Working Symbols Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {symbols.map((symbol) => (
            <button
              key={symbol.id}
              onClick={() => setActiveId(symbol.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] transition-all border-2 ${
                activeId === symbol.id
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
              }`}
            >
              <span className="text-3xl mb-2">{symbol.icon}</span>
              <span className="font-bold text-sm">{symbol.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Edit Overlay for all modes when editing */}
      {isEditing && (
        <div className="mt-12 p-8 bg-amber-50 rounded-[2rem] border border-amber-100">
          <h4 className="text-amber-800 font-bold mb-6 flex items-center gap-2">
            <span>✏️</span> Snabbredigering av alla lägen
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span>{m.icon}</span>
                  <span className="font-bold text-slate-700">{m.id}</span>
                </div>
                <input 
                  type="text"
                  value={m.label}
                  onChange={(e) => updateModeText(m.id, 'label', e.target.value)}
                  placeholder="Rubrik..."
                  className="w-full text-sm border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
                />
                <input 
                  type="text"
                  value={m.desc}
                  onChange={(e) => updateModeText(m.id, 'desc', e.target.value)}
                  placeholder="Beskrivning..."
                  className="w-full text-xs border border-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-300"
                />
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsEditing(false)}
            className="mt-8 w-full bg-amber-600 text-white py-4 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
          >
            Klar med anpassning
          </button>
        </div>
      )}
    </div>
  );
};

export default TrafficLight;
