
import React, { useState, useEffect, useCallback } from 'react';
import { ChecklistItem } from '../types';

const KEYWORD_EMOJIS: Record<string, string> = {
  'läs': '📖',
  'skriv': '✍️',
  'diskutera': '🗣️',
  'räkna': '🔢',
  'titta': '👁️',
  'lyssna': '👂',
  'rita': '🎨',
  'samarbeta': '👥',
  'städa': '🧹',
  'lunch': '🍱',
  'rast': '⚽',
  'prov': '📝',
  'jobba': '💼'
};

const SmartChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('kp_checklist_items');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Läs sid 24-28 i boken', completed: false, isSpotlight: false, timerSeconds: 600 },
      { id: '2', text: 'Skriv svar på frågorna', completed: false, isSpotlight: false, timerSeconds: 900 },
      { id: '3', text: 'Diskutera med grannen', completed: false, isSpotlight: false, timerSeconds: 300 }
    ];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kp_checklist_items', JSON.stringify(items));
  }, [items]);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (activeTimerId) {
      interval = setInterval(() => {
        setItems(prev => prev.map(item => {
          if (item.id === activeTimerId && item.timerSeconds && item.timerSeconds > 0) {
            return { ...item, timerSeconds: item.timerSeconds - 1 };
          }
          if (item.id === activeTimerId && item.timerSeconds === 0) {
            setActiveTimerId(null);
            // Optional: add a sound or visual alert here
          }
          return item;
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerId]);

  const getAutoEmoji = (text: string) => {
    const words = text.toLowerCase().split(' ');
    for (const word of words) {
      if (KEYWORD_EMOJIS[word]) return KEYWORD_EMOJIS[word];
    }
    return null;
  };

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      completed: false,
      isSpotlight: false
    };
    setItems([...items, newItem]);
    setIsEditing(true);
  };

  const toggleComplete = (id: string) => {
    if (isEditing) return;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed, isSpotlight: false } : item
    ));
    if (activeTimerId === id) setActiveTimerId(null);
  };

  const toggleSpotlight = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isSpotlight: !item.isSpotlight } : { ...item, isSpotlight: false }
    ));
  };

  const updateItemText = (id: string, text: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  };

  const removeItem = (id: string) => {
    if (activeTimerId === id) setActiveTimerId(null);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const setTimerForItem = (id: string, minutes: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        timerSeconds: (minutes > 0 && !isNaN(minutes)) ? minutes * 60 : undefined 
      } : item
    ));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const spotlightActive = items.some(i => i.isSpotlight);

  const formatTimer = (seconds?: number) => {
    if (seconds === undefined) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Dagens Arbete</span>
          <div className="flex items-center gap-3">
             <h3 className="text-xl font-bold text-slate-800">Checklista</h3>
             <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
               {completedCount} av {items.length} klara
             </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-2 ${
              isEditing 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {isEditing ? (
              <><span className="text-sm">💾</span> Spara</>
            ) : (
              <><span className="text-sm">✏️</span> Redigera</>
            )}
          </button>
        </div>
      </header>

      {/* Checklist container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 mb-6">
        {items.map((item) => {
          const emoji = getAutoEmoji(item.text);
          const isDimmed = spotlightActive && !item.isSpotlight;

          return (
            <div 
              key={item.id}
              className={`group flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 border-2 ${
                item.isSpotlight 
                  ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100/50 scale-[1.02]' 
                  : item.completed 
                    ? 'bg-slate-50 border-slate-50 opacity-50' 
                    : isDimmed 
                      ? 'opacity-30 border-transparent blur-[0.5px]' 
                      : 'bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50/30'
              }`}
            >
              {/* Checkbox */}
              <button 
                onClick={() => toggleComplete(item.id)}
                disabled={isEditing}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  item.completed 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white border-2 border-slate-200 group-hover:border-indigo-300'
                }`}
              >
                {item.completed && '✓'}
              </button>

              {/* Text content & Time input */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItemText(item.id, e.target.value)}
                      placeholder="Vad ska vi göra?"
                      className="flex-1 bg-transparent border-b border-indigo-100 focus:border-indigo-500 outline-none font-medium text-slate-700 py-1"
                    />
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl shrink-0 group/time hover:bg-indigo-50 transition-colors">
                      <span className="text-[9px] font-black text-slate-400 group-hover/time:text-indigo-400">MIN</span>
                      <input
                        type="number"
                        min="0"
                        max="999"
                        value={item.timerSeconds ? Math.floor(item.timerSeconds / 60) : ''}
                        onChange={(e) => setTimerForItem(item.id, parseInt(e.target.value))}
                        className="w-10 bg-transparent text-sm font-black text-indigo-600 outline-none text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {emoji && <span className="text-xl shrink-0">{emoji}</span>}
                    <span className={`font-bold text-lg truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {item.text || 'Tom uppgift'}
                    </span>
                    {item.timerSeconds !== undefined && (
                      <span className={`ml-auto font-mono text-sm px-2.5 py-1 rounded-xl shadow-sm border ${
                        activeTimerId === item.id 
                          ? 'bg-amber-500 text-white border-amber-400 animate-pulse' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {formatTimer(item.timerSeconds)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing ? (
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-all"
                    title="Ta bort moment"
                  >
                    🗑️
                  </button>
                ) : (
                  !item.completed && (
                    <>
                      <button 
                        onClick={() => toggleSpotlight(item.id)}
                        className={`p-2 rounded-xl transition-all ${item.isSpotlight ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white text-slate-400 hover:text-indigo-500'}`}
                        title="Fokus-läge"
                      >
                        🔦
                      </button>
                      {item.timerSeconds !== undefined && (
                        <button 
                          onClick={() => setActiveTimerId(activeTimerId === item.id ? null : item.id)}
                          className={`p-2 rounded-xl transition-all ${activeTimerId === item.id ? 'bg-amber-100 text-amber-600' : 'hover:bg-white text-slate-400 hover:text-amber-500'}`}
                        >
                          {activeTimerId === item.id ? '⏸' : '▶'}
                        </button>
                      )}
                    </>
                  )
                )}
              </div>
            </div>
          );
        })}

        {isEditing && (
          <button 
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">➕</span> Lägg till moment
          </button>
        )}
      </div>

      {/* Footer with Progress */}
      <footer className="shrink-0 pt-4 border-t border-slate-50">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lektionens Framsteg</span>
          <span className="text-[10px] font-black text-indigo-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </footer>
    </div>
  );
};

export default SmartChecklist;
