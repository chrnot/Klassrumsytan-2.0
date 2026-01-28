
import React, { useState, useRef, useEffect } from 'react';

type Tool = 'pen' | 'eraser';

const ImageAnnotator: React.FC = () => {
  // States
  const [image, setImage] = useState<string | null>(() => localStorage.getItem('kp_annotator_bg'));
  const [opacity, setOpacity] = useState(() => parseFloat(localStorage.getItem('kp_annotator_opacity') || '1'));
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('kp_annotator_locked') === 'true');
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [penColor, setPenColor] = useState('#ef4444');
  const [penWidth, setPenWidth] = useState(12);
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('kp_annotator_opacity', opacity.toString());
    localStorage.setItem('kp_annotator_locked', isLocked.toString());
  }, [opacity, isLocked]);

  // Initial laddning av sparad ritning
  useEffect(() => {
    const savedDrawing = localStorage.getItem('kp_annotator_drawing');
    if (savedDrawing && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = savedDrawing;
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
        localStorage.setItem('kp_annotator_bg', result);
        setIsLocked(false);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; 
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
    }
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      localStorage.setItem('kp_annotator_drawing', canvasRef.current.toDataURL());
    }
  };

  const removeBackground = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Vill du ta bort bakgrundsbilden? Dina anteckningar stannar kvar.')) {
      setImage(null);
      localStorage.removeItem('kp_annotator_bg');
      setOpacity(1);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500 relative select-none">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/png, image/jpeg" 
        className="hidden" 
      />

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-[2rem] border border-slate-100 shrink-0 shadow-sm relative z-50">
        
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest px-1">Bakgrund</span>
          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all border border-indigo-50 active:scale-95"
            >
              📸 Ny Bild
            </button>
            {image && (
              <button 
                onClick={removeBackground}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                title="Ta bort bild"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest px-1">Verktyg</span>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button 
                onClick={() => setActiveTool('pen')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all active:scale-90 ${activeTool === 'pen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ✏️
              </button>
              <button 
                onClick={() => setActiveTool('eraser')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all active:scale-90 ${activeTool === 'eraser' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                🧽
              </button>
            </div>

            <div className="flex gap-1.5 px-1">
              {['#ef4444', '#4f46e5', '#10b981', '#000000'].map(c => (
                <button 
                  key={c} 
                  onClick={() => { setPenColor(c); setActiveTool('pen'); }} 
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${penColor === c && activeTool === 'pen' ? 'border-slate-400 scale-125 shadow-sm' : 'border-transparent hover:scale-110'}`} 
                  style={{ background: c }} 
                />
              ))}
            </div>

            <div className="flex flex-col px-1">
              <input 
                type="range" min="4" max="150" value={penWidth} 
                onChange={(e) => setPenWidth(parseInt(e.target.value))} 
                className="w-16 accent-indigo-600" 
              />
              <span className="text-[7px] font-black text-slate-400 text-center uppercase tracking-tighter">Bredd</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {image && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Synlighet</span>
              <input 
                type="range" min="0" max="1" step="0.1" value={opacity} 
                disabled={isLocked}
                onChange={(e) => setOpacity(parseFloat(e.target.value))} 
                className={`w-24 accent-indigo-600 h-1.5 ${isLocked ? 'opacity-30' : ''}`} 
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-center">Frys Bild</span>
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border shadow-sm active:scale-95 ${isLocked ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'}`}
            >
              {isLocked ? 'LÅST' : 'ÖPPEN'}
            </button>
          </div>
        </div>
      </div>

      {/* RITYTAN */}
      <div className="flex-1 bg-slate-50 rounded-[3rem] relative overflow-hidden border-2 border-slate-100 flex items-center justify-center group">
        
        {/* Bakgrundsbild */}
        {image && (
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none z-0">
            <img 
              src={image} 
              alt="Bakgrund" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl transition-all duration-500"
              style={{ opacity }}
            />
          </div>
        )}

        {/* Rit-lager */}
        <canvas
          ref={canvasRef}
          width={2000}
          height={1500}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full block touch-none z-10 ${activeTool === 'eraser' ? 'cursor-crosshair' : 'cursor-default'}`}
        />

        {/* Tom yta Overlay */}
        {!image && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-slate-50/50 backdrop-blur-[1px] pointer-events-none">
            <div className="text-8xl mb-6 opacity-10">📸</div>
            <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="bg-white text-indigo-600 px-14 py-6 rounded-[2.5rem] font-black text-sm border-2 border-indigo-100 shadow-2xl shadow-indigo-100/40 hover:scale-105 transition-all pointer-events-auto active:scale-95"
            >
              VÄLJ BILD FRÅN DATORN
            </button>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">eller dra och släpp hit</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end items-center px-6 pb-2 shrink-0 relative z-[100]">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeTool === 'eraser' ? '#cbd5e1' : penColor }}></div>
             <span className="text-[9px] font-black text-slate-500 uppercase">{activeTool === 'pen' ? 'PENNA' : 'SUDD'} {penWidth}px</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotator;
