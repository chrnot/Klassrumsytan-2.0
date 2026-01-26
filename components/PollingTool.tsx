
import React, { useState, useMemo } from 'react';

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
    title: 'Temperatur',
    question: 'Hur är din energinivå just nu?',
    options: [
      { id: '1', label: 'Toppen!', icon: '🚀', votes: 0, color: 'bg-indigo-500' },
      { id: '2', label: 'Helt okej', icon: '😐', votes: 0, color: 'bg-slate-400' },
      { id: '3', label: 'Trött/Låg', icon: '💤', votes: 0, color: 'bg-amber-600' }
    ]
  },
  {
    id: 'democracy',
    title: 'Inflytande',
    question: 'Hur vill du redovisa uppgiften?',
    options: [
      { id: '1', label: 'Muntligt', icon: '🗣️', votes: 0, color: 'bg-blue-500' },
      { id: '2', label: 'Skriftligt', icon: '📝', votes: 0, color: 'bg-purple-500' },
      { id: '3', label: 'Bild/Film', icon: '🎨', votes: 0, color: 'bg-rose-500' }
    ]
  }
];

const PollingTool: React.FC = () => {
  const [question, setQuestion] = useState(TEMPLATES[0].question);
  const [options, setOptions] = useState<PollOption[]>(TEMPLATES[0].options);
  const [showResults, setShowResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const totalVotes = useMemo(() => options.reduce((acc, opt) => acc + opt.votes, 0), [options]);

  const handleVote = (id: string) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt));
  };

  const applyTemplate = (templateId: string) => {
    const t = TEMPLATES.find(x => x.id === templateId);
    if (t) {
      setQuestion(t.question);
      setOptions(t.options.map(o => ({ ...o, votes: 0 })));
      setShowResults(false);
      setIsEditing(false);
    }
  };

  const resetVotes = () => {
    setOptions(prev => prev.map(opt => ({ ...opt, votes: 0 })));
    setShowResults(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            📊 Omröstning
          </h2>
          <p className="text-slate-500 text-sm">Gör en snabb avstämning med klassen.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              isEditing ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {isEditing ? 'Spara fråga' : 'Ändra fråga ⚙️'}
          </button>
          <button
            onClick={resetVotes}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Nollställ
          </button>
        </div>
      </header>

      {/* Template selection */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-bold hover:bg-indigo-100 border border-indigo-100 transition-all"
            >
              Mall: {t.title}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center">
        {isEditing ? (
          <div className="w-full max-w-2xl space-y-4 animate-in slide-in-from-top-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Fråga</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full text-2xl font-bold text-slate-800 bg-slate-50 border-2 border-indigo-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, idx) => (
                <div key={opt.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[idx].label = e.target.value;
                      setOptions(newOptions);
                    }}
                    className="flex-1 bg-transparent border-b border-slate-100 focus:border-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
              ))}
            </div>
            <button 
                onClick={() => setIsEditing(false)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
                Starta omröstning
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-10">
            <h3 className="text-4xl font-black text-slate-800 text-center max-w-3xl leading-tight">
              {question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">
                    {opt.icon}
                  </div>
                  <span className="text-xl font-black text-slate-700">{opt.label}</span>
                  
                  {/* Vote counter (small) */}
                  <div className="absolute top-4 right-4 bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
                    +1
                  </div>
                </button>
              ))}
            </div>

            {/* Results Section */}
            <div className="w-full max-w-4xl bg-slate-50/50 p-8 md:p-12 rounded-[3.5rem] border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-slate-400 uppercase tracking-widest text-sm font-bold">Resultat ({totalVotes} röster)</h4>
                <button
                  onClick={() => setShowResults(!showResults)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                    showResults 
                      ? 'bg-white text-slate-600 border border-slate-200' 
                      : 'bg-indigo-600 text-white border border-indigo-500'
                  }`}
                >
                  {showResults ? 'Dölj för klassen 🫣' : 'Visa resultat 👁️'}
                </button>
              </div>

              {showResults ? (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  {options.map((opt) => {
                    const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                    return (
                      <div key={opt.id} className="space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-700 px-1">
                          <span className="flex items-center gap-2">
                             <span>{opt.icon}</span>
                             <span>{opt.label}</span>
                          </span>
                          <span>{Math.round(percentage)}% ({opt.votes})</span>
                        </div>
                        <div className="h-6 w-full bg-slate-200/50 rounded-full overflow-hidden border border-slate-100 p-1">
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
                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                   <div className="text-6xl mb-4">🕵️‍♂️</div>
                   <p className="font-bold italic text-lg">Resultaten är dolda för eleverna...</p>
                   <p className="text-xs mt-2 uppercase tracking-widest font-bold opacity-50">Klicka på "Visa resultat" när alla röstat klart</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
        <div className="text-2xl mt-1">💡</div>
        <div>
           <p className="text-indigo-900 font-bold mb-1">Pedagogiskt tips</p>
           <p className="text-indigo-700/80 text-sm leading-relaxed">
             Omröstningar är ett kraftfullt verktyg för formativ bedömning. Håll resultaten dolda under röstningen för att minska risken för att eleverna påverkas av vad deras klasskamrater väljer.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PollingTool;
