
import React, { useState, useEffect } from 'react';

interface Link {
  id: string;
  url: string;
  title: string;
}

const QuickLinks: React.FC = () => {
  const [links, setLinks] = useState<Link[]>(() => {
    const saved = localStorage.getItem('kp_quick_links');
    return saved ? JSON.parse(saved) : [
      { id: '1', url: 'https://classroom.google.com', title: 'Classroom' },
      { id: '2', url: 'https://youtube.com', title: 'YouTube' },
      { id: '3', url: 'https://wikipedia.org', title: 'Wikipedia' }
    ];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('kp_quick_links', JSON.stringify(links));
  }, [links]);

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(formatUrl(url)).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return '🔗';
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) return;

    const newLink: Link = {
      id: Math.random().toString(36).substr(2, 9),
      url: formatUrl(newUrl),
      title: newTitle.trim()
    };

    setLinks([...links, newLink]);
    setNewUrl('');
    setNewTitle('');
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mina Genvägar</span>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
        >
          {isEditing ? 'Klar' : '⚙️'}
        </button>
      </header>

      {isEditing && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-3 animate-in slide-in-from-top-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titel (t.ex. YouTube)"
            className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Webbadress (URL)"
            className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            Lägg till +
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
        {links.map((link) => (
          <div key={link.id} className="relative group">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all h-full text-center group"
            >
              <img 
                src={getFavicon(link.url)} 
                alt={link.title} 
                className="w-10 h-10 mb-2 rounded-xl object-contain bg-slate-50 p-1 group-hover:scale-110 transition-transform"
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>🔗</text></svg>'; }}
              />
              <span className="text-[10px] font-bold text-slate-600 truncate w-full">{link.title}</span>
            </a>
            
            {isEditing && (
              <button 
                onClick={() => removeLink(link.id)}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {!isEditing && links.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-300 italic flex flex-col items-center gap-2">
            <span className="text-4xl">🔗</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Inga länkar än</span>
          </div>
        )}
      </div>

      {!isEditing && (
        <p className="mt-4 text-[9px] text-slate-400 font-medium italic text-center">
          Klicka på en länk för att öppna den i en ny flik.
        </p>
      )}
    </div>
  );
};

export default QuickLinks;
