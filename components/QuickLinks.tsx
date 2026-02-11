
import React, { useState } from 'react';

interface QuickLinksProps {
  onAddLink: (url: string, title: string) => void;
  existingLinksCount: number;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ onAddLink, existingLinksCount }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;
    
    onAddLink(url.trim(), title.trim());
    setUrl('');
    setTitle('');
  };

  const presets = [
    { title: 'Google', url: 'google.com' },
    { title: 'YouTube', url: 'youtube.com' },
    { title: 'SVT Play', url: 'svtplay.se' },
    { title: 'Wikipedia', url: 'wikipedia.org' },
    { title: 'Classroom', url: 'classroom.google.com' },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-xl font-black text-slate-800 mb-1">Hantera Genvägar</h2>
        <p className="text-slate-400 text-xs font-medium">
          Skapa fristående knappar för dina favoritlänkar. 
          <span className="text-indigo-600 ml-1">({existingLinksCount}/5 använda på denna sida)</span>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mb-8">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rubrik</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="T.ex. Matematik-spel"
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Webbadress (URL)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="google.se eller https://..."
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-white"
          />
        </div>
        <button 
          type="submit"
          disabled={existingLinksCount >= 5 || !url.trim() || !title.trim()}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 active:scale-95"
        >
          {existingLinksCount >= 5 ? 'Max 5 länkar nådd' : 'Skapa Länk-Widget +'}
        </button>
      </form>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Snabbval</h4>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p) => (
            <button
              key={p.url}
              onClick={() => { setUrl(p.url); setTitle(p.title); }}
              className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all text-left flex items-center gap-2"
            >
              <span className="opacity-40">🔗</span>
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-auto text-[10px] text-slate-400 italic text-center pt-8">
        Varje länk blir ett eget fönster som du kan flytta runt på ytan.
      </p>
    </div>
  );
};

export default QuickLinks;
