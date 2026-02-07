
import React, { useRef, useState } from 'react';

const PRESETS = [
  { id: 'slate', value: 'bg-slate-100', label: 'Stilren Grå', icon: '🎨' },
  { id: 'grid', value: 'bg-pattern-grid', label: 'Matterutor', icon: '🟦' },
  { id: 'lines', value: 'bg-pattern-lines', label: 'Linjerat', icon: '🗒️' },
  { id: 'dots', value: 'bg-pattern-dots', label: 'Prickat', icon: '⁙' },
  { id: 'ocean', value: 'bg-[url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Stilla Hav', icon: '🌊' },
  { id: 'classroom', value: 'bg-[url("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Klassrum', icon: '🏫' },
  { id: 'forest', value: 'bg-[url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Lugn Skog', icon: '🌲' },
  { id: 'library', value: 'bg-[url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2560")] bg-cover', label: 'Bibliotek', icon: '📚' },
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
      className={`w-full h-20 rounded-2xl border-2 transition-all overflow-hidden relative group flex flex-col items-center justify-center gap-1 ${
        current === bg.value ? 'border-indigo-600 bg-indigo-50/50 scale-105 shadow-md z-10' : 'border-slate-100 bg-white hover:border-slate-300'
      }`}
    >
      <div className={`absolute inset-0 opacity-20 pointer-events-none ${bg.value.includes('bg-') ? bg.value : ''}`} />
      <span className="text-2xl relative z-10 group-hover:scale-110 transition-transform">{bg.icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">{bg.label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Skolpapper & Miljöer</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map(renderPreset)}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Anpassat</h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Color Picker Button */}
          <div className="w-full h-16 rounded-2xl border-2 border-slate-100 bg-white flex items-center justify-center relative group overflow-hidden transition-all hover:border-slate-300">
            <input 
              type="color" 
              value={current.startsWith('#') ? current : '#ffffff'}
              onChange={(e) => onSelect(e.target.value)}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Egen Färg</span>
            </div>
          </div>

          {/* Custom Settings Button */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`w-full h-16 rounded-2xl border-2 border-slate-100 bg-white flex items-center justify-center relative transition-all ${showCustom ? 'bg-indigo-50 border-indigo-200' : 'hover:border-slate-300'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🖼️</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ladda Upp</span>
            </div>
          </button>
        </div>
      </div>

      {showCustom && (
        <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-[2rem] animate-in slide-in-from-top-2 duration-200 border border-slate-100">
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Klistra in Bild-URL</label>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://exempel.se/bild.jpg"
                className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Spara</button>
            </form>
          </div>
          
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Eller välj från din dator</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
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
