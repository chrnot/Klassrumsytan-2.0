
import React, { useState, useEffect } from 'react';

interface TimelineStep {
  id: string;
  label: string;
  duration: number; // minuter
  completed: boolean;
}

interface Concept {
  id: string;
  label: string;
  highlighted: boolean;
}

const LessonNavigator: React.FC = () => {
  const [goal, setGoal] = useState("Förstå kopplingen mellan...");
  const [steps, setSteps] = useState<TimelineStep[]>([
    { id: '1', label: 'Genomgång', duration: 10, completed: false },
    { id: '2', label: 'Eget arbete', duration: 25, completed: false },
    { id: '3', label: 'Avslutning', duration: 5, completed: false }
  ]);
  const [concepts, setConcepts] = useState<Concept[]>([
    { id: 'c1', label: 'Begrepp 1', highlighted: false },
    { id: 'c2', label: 'Begrepp 2', highlighted: false }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (activeStepId && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeStepId) {
      setActiveStepId(null);
    }
    return () => clearInterval(interval);
  }, [activeStepId, timeLeft]);

  const startStep = (step: TimelineStep) => {
    setActiveStepId(step.id);
    setTimeLeft(step.duration * 60);
  };

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    if (activeStepId === id) setActiveStepId(null);
  };

  const toggleConcept = (id: string) => {
    setConcepts(prev => prev.map(c => c.id === id ? { ...c, highlighted: !c.highlighted } : c));
  };

  const addStep = () => {
    setSteps([...steps, { id: Math.random().toString(36).substr(2, 9), label: 'Nytt moment', duration: 10, completed: false }]);
  };

  const addConcept = () => {
    setConcepts([...concepts, { id: Math.random().toString(36).substr(2, 9), label: 'Nytt ord', highlighted: false }]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      {/* HEADER: MÅL */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>
        <div className="relative z-10">
          <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block mb-2 px-1">Idag ska vi förstå...</label>
          {isEditing ? (
            <textarea 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-white border border-indigo-100 rounded-xl p-3 font-bold text-slate-700 text-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
            />
          ) : (
            <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight px-1">
              {goal || "Lektionens mål..."}
            </h3>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* BEGREPPS-BANKEN */}
        <div className="md:w-1/3 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Begrepps-bank</h4>
            {isEditing && (
              <button onClick={addConcept} className="text-indigo-600 font-bold text-[10px] uppercase">+ Lägg till</button>
            )}
          </div>
          <div className="flex-1 bg-slate-50/50 rounded-[2rem] border border-slate-100 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {concepts.map(c => (
              <div key={c.id} className="flex gap-2 group">
                {isEditing ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={c.label}
                      onChange={(e) => setConcepts(prev => prev.map(pc => pc.id === c.id ? { ...pc, label: e.target.value } : pc))}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                    <button onClick={() => setConcepts(prev => prev.filter(pc => pc.id !== c.id))} className="text-red-300 hover:text-red-500">✕</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => toggleConcept(c.id)}
                    className={`flex-1 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-tight transition-all border-2 text-center ${
                      c.highlighted 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-100 scale-105' 
                        : 'bg-white border-white text-slate-500 hover:border-indigo-100'
                    }`}
                  >
                    {c.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TIDSLINJE MOMENT */}
        <div className="flex-1 flex flex-col">
           <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hållplatser</h4>
            {isEditing && (
              <button onClick={addStep} className="text-indigo-600 font-bold text-[10px] uppercase">+ Lägg till</button>
            )}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                className={`group flex items-center gap-4 p-4 rounded-3xl border-2 transition-all ${
                  activeStepId === step.id 
                    ? 'bg-indigo-50 border-indigo-200 scale-[1.02] shadow-md' 
                    : step.completed 
                      ? 'bg-slate-50 border-slate-50 opacity-40' 
                      : 'bg-white border-slate-50 hover:border-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step.completed ? '✓' : idx + 1}
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={step.label}
                        onChange={(e) => setSteps(prev => prev.map(ps => ps.id === step.id ? { ...ps, label: e.target.value } : ps))}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-bold"
                      />
                      <input 
                        type="number" 
                        value={step.duration}
                        onChange={(e) => setSteps(prev => prev.map(ps => ps.id === step.id ? { ...ps, duration: parseInt(e.target.value) || 0 } : ps))}
                        className="w-12 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-center"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className={`font-black text-sm uppercase tracking-tight ${step.completed ? 'line-through' : 'text-slate-700'}`}>{step.label}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step.duration} min</span>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {!step.completed && (
                      <button 
                        onClick={() => activeStepId === step.id ? setActiveStepId(null) : startStep(step)}
                        className={`p-2 rounded-xl text-xs ${activeStepId === step.id ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}
                      >
                        {activeStepId === step.id ? '⏸' : '▶'}
                      </button>
                    )}
                    <button 
                      onClick={() => toggleStep(step.id)}
                      className={`p-2 rounded-xl text-xs border ${step.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 hover:text-emerald-500'}`}
                    >
                      {step.completed ? 'Ångra' : 'Klar'}
                    </button>
                  </div>
                )}
                {isEditing && (
                  <button onClick={() => setSteps(prev => prev.filter(ps => ps.id !== step.id))} className="text-red-300 hover:text-red-500">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER: PROGRESS & TIMER */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lektionens gång</span>
            <div className="flex gap-2">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full border-2 transition-all ${s.completed ? 'bg-emerald-500 border-emerald-500' : activeStepId === s.id ? 'bg-amber-400 border-amber-400 scale-125' : 'bg-white border-slate-200'}`} />
                  {i < steps.length - 1 && <div className={`h-0.5 w-6 md:w-10 ${s.completed ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            {activeStepId && (
              <div className="flex flex-col items-end animate-in slide-in-from-right-2">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Aktiv timer</span>
                <span className="text-3xl font-black text-slate-800 tabular-nums leading-none">{formatTime(timeLeft)}</span>
              </div>
            )}
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="mt-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600"
            >
              {isEditing ? '💾 Spara Navigator' : '✏️ Redigera plan'}
            </button>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default LessonNavigator;
