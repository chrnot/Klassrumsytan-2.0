
import React, { useState } from 'react';

const TieredTaskCard: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [task, setTask] = useState("Kalle har 4 äpplen och Lisa har dubbelt så många. Om de äter upp 3 äpplen var, hur många har de kvar tillsammans?");
  const [hints, setHints] = useState([
    "Börja med att räkna ut hur många äpplen Lisa har.",
    "Räkna sedan ut det totala antalet äpplen de har tillsammans från början.",
    "Start-mening: Tillsammans har de ____ äpplen..."
  ]);
  const [challenge, setChallenge] = useState("Vad händer om de istället äter upp 25% av sina äpplen var? Hur många har de kvar då?");
  
  const [currentHintIdx, setCurrentHintIdx] = useState(-1);
  const [showChallenge, setShowChallenge] = useState(false);

  const resetProgress = () => {
    setCurrentHintIdx(-1);
    setShowChallenge(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col h-full bg-white p-2 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Konfigurera Nivå-Kortet</h3>
          <button 
            onClick={() => setIsEditing(false)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            Spara & Visa
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Huvuduppgift</label>
            <textarea 
              value={task} 
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block">Progressivt stöd (Ledtrådar)</label>
            {hints.map((hint, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center font-black text-xs shrink-0">{i + 1}</span>
                <textarea 
                  value={hint} 
                  onChange={(e) => {
                    const newHints = [...hints];
                    newHints[i] = e.target.value;
                    setHints(newHints);
                  }}
                  placeholder={`Ledtråd ${i+1}...`}
                  className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 min-h-[60px] resize-none"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Utmaning (För de som är klara)</label>
            <textarea 
              value={challenge} 
              onChange={(e) => setChallenge(e.target.value)}
              className="w-full bg-purple-50 border border-purple-100 rounded-2xl p-4 font-bold text-purple-900 outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      {/* TASK AREA */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full -ml-32 -mb-32 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] block mb-6 px-1">Dagens Utmaning</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 leading-tight mb-4 px-4">
            {task || "Ingen uppgift skriven ännu..."}
          </h2>
        </div>
      </div>

      {/* INTERACTIVE LAYERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* STÖDHJULET */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setCurrentHintIdx(prev => Math.min(prev + 1, hints.length - 1))}
            disabled={currentHintIdx === hints.length - 1}
            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
              currentHintIdx === hints.length - 1 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-amber-500 text-white hover:bg-amber-600 hover:scale-[1.02] shadow-amber-200 active:scale-95'
            }`}
          >
            <span>💡</span> Jag sitter fast
          </button>
          
          <div className="space-y-2">
            {hints.map((hint, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border-2 transition-all duration-500 origin-top ${
                  idx <= currentHintIdx 
                    ? 'bg-amber-50 border-amber-200 scale-100 opacity-100' 
                    : 'bg-white border-slate-50 opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-amber-500 font-black text-[10px] uppercase">Ledtråd {idx + 1}</span>
                  <p className="text-sm font-bold text-amber-900 leading-relaxed">{hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TANKENÖTEN */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setShowChallenge(!showChallenge)}
            className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
              showChallenge 
                ? 'bg-indigo-600 text-white shadow-indigo-200' 
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-[1.02] shadow-purple-200 active:scale-95'
            }`}
          >
            <span>🚀</span> Jag är klar!
          </button>

          {showChallenge && (
            <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-[2rem] animate-in zoom-in-95 duration-300 shadow-lg shadow-indigo-100/50">
              <span className="text-indigo-600 font-black text-[10px] uppercase block mb-3 tracking-widest">Utmaning: Tankenöten</span>
              <p className="text-lg font-black text-indigo-900 leading-tight">
                {challenge}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center px-2">
        <button 
          onClick={resetProgress}
          className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          Nollställ kortet
        </button>
        <button 
          onClick={() => setIsEditing(true)}
          className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
        >
          ✏️ Redigera uppgift
        </button>
      </div>
    </div>
  );
};

export default TieredTaskCard;
