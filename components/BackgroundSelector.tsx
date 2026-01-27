
import React, { useRef, useState } from 'react';

const PRESETS = [
  { id: 'slate', value: 'bg-slate-100', label: 'Stilren Grå' },
  { id: 'ocean', value: 'bg-[url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Stilla Hav' },
  { id: 'classroom', value: 'bg-[url("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Klassrum' },
  { id: 'forest', value: 'bg-[url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Lugn Skog' },
  { id: 'mountain', value: 'bg-[url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Bergstopp' },
  { id: 'library', value: 'bg-[url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Bibliotek' },
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

  const renderPreset = (bg: typeof PRESETS[0]) => (
    <button
      key={bg.id}
      onClick={() => onSelect(bg.value)}
      className={`w-full h-16 rounded-xl border-2 transition-all overflow-hidden relative group ${
        current === bg.value ? 'border-indigo-600 scale-105 shadow-md z-10' : 'border-slate-100 hover:border-slate-300'
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
      {/* Grid container for 2 rows of 4 (8 items total) */}
      <div className="grid grid-cols-4 gap-3">
        
        {/* Color Picker Button (Item 1) */}
        <div className="w-full h-16 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center relative group overflow-hidden transition-all hover:border-slate-300">
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

        {/* Custom Settings Button (Item 2) */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`w-full h-16 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center relative transition-all ${showCustom ? 'bg-indigo-50 border-indigo-200' : 'hover:border-slate-300'}`}
        >
          <span className="text-xl">⚙️</span>
          <div className="absolute inset-x-0 bottom-1 flex justify-center opacity-60">
            <span className="text-[8px] font-bold text-slate-500 uppercase">Egen</span>
          </div>
        </button>

        {/* Preset Backgrounds (Items 3-8) */}
        {PRESETS.map(renderPreset)}
      </div>

      {showCustom && (
        <div className="flex flex-col gap-4 p-5 bg-slate-50 rounded-2xl animate-in slide-in-from-top-2 duration-200 border border-slate-100">
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bild-URL</label>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Spara</button>
            </form>
          </div>
          
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ladda upp från datorn</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Välj bildfil...
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
