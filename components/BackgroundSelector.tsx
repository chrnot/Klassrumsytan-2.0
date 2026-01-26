
import React, { useRef, useState } from 'react';

const PRESETS = [
  { id: 'slate', value: 'bg-slate-100', label: 'Stilren Grå' },
  { id: 'ocean', value: 'bg-[url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Stilla Hav' },
  { id: 'classroom', value: 'bg-[url("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Klassrum' },
  { id: 'forest', value: 'bg-[url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Lugn Skog' },
  { id: 'mountain', value: 'bg-[url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Bergstopp' },
];

interface BackgroundSelectorProps {
  current: string;
  onSelect: (bg: string) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ current, onSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const result = readerEvent.target?.result as string;
        onSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelect(customUrl.trim());
      setCustomUrl('');
    }
  };

  // Separera den första preset-bilden från resten för att kunna placera knappar emellan
  const firstPreset = PRESETS[0];
  const remainingPresets = PRESETS.slice(1);

  const renderPreset = (bg: typeof PRESETS[0]) => (
    <button
      key={bg.id}
      onClick={() => onSelect(bg.value)}
      className={`shrink-0 w-20 h-14 rounded-xl border-2 transition-all overflow-hidden relative group ${
        current === bg.value ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent hover:border-slate-300'
      }`}
    >
      <div className={`w-full h-full ${bg.value.includes('url') ? bg.value : bg.value} transition-transform group-hover:scale-110`} />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-white font-bold text-center px-1">{bg.label}</span>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-[80vw]">
        
        {/* 1. Första förvalet */}
        {renderPreset(firstPreset)}

        {/* 2. Färgval (Nu på plats 2) */}
        <div className="shrink-0 w-20 h-14 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center relative group overflow-hidden">
          <input 
            type="color" 
            value={current.startsWith('#') ? current : '#ffffff'}
            onChange={(e) => onSelect(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <span className="text-xl">🎨</span>
          <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/5 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-all">
            <span className="text-[8px] font-bold text-slate-500 uppercase">Färg</span>
          </div>
        </div>

        {/* 3. Anpassad/Egen (Nu på plats 3) */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`shrink-0 w-20 h-14 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center relative transition-all ${showCustom ? 'bg-indigo-50 border-indigo-200' : 'hover:border-slate-300'}`}
        >
          <span className="text-xl">⚙️</span>
          <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-60">
            <span className="text-[8px] font-bold text-slate-500 uppercase">Egen</span>
          </div>
        </button>

        {/* 4. Resten av förvalsbilderna */}
        {remainingPresets.map(renderPreset)}
      </div>

      {showCustom && (
        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl animate-in slide-in-from-top-2 duration-200 border border-slate-100">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bild-URL</label>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">OK</button>
            </form>
          </div>
          
          <div className="shrink-0">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ladda upp fil</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Välj bild...
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
