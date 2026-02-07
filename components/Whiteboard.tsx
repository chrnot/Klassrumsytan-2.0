
import React, { useState, useRef, useEffect } from 'react';

type Tool = 'pen' | 'text';
type PaperPattern = 'none' | 'grid' | 'lines' | 'dots';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [paperPattern, setPaperPattern] = useState<PaperPattern>('none');
  const [penColor, setPenColor] = useState('#4f46e5');
  const [penWidth, setPenWidth] = useState(12); 
  
  const [textInput, setTextInput] = useState<{ x: number, y: number, value: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  useEffect(() => {
    if (textInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [textInput]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (textInput) {
      handleTextSubmit();
      return;
    }

    if (activeTool === 'text') {
      const coords = getCoordinates(e);
      setTextInput({ x: coords.x, y: coords.y, value: '' });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTool !== 'pen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Öka fontstorleken kraftigt pga 2000px bred canvas
    const fontSize = Math.max(30, penWidth * 12); 
    ctx.fillStyle = penColor;
    ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    
    setTextInput(null);
  };

  const getPatternClass = () => {
    switch (paperPattern) {
      case 'grid': return 'bg-pattern-grid';
      case 'lines': return 'bg-pattern-lines';
      case 'dots': return 'bg-pattern-dots';
      default: return 'bg-white';
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500 relative">
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0 shadow-sm">
        {/* VERKTYGSVÄLJARE */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => { setActiveTool('pen'); setTextInput(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTool === 'pen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            ✏️ <span className="hidden sm:inline">Penna</span>
          </button>
          <button 
            onClick={() => setActiveTool('text')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTool === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Aa <span className="hidden sm:inline">Text</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1" />

        {/* PAPPERSTYP */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setPaperPattern('none')}
            title="Blankt"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${paperPattern === 'none' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            ⬜
          </button>
          <button 
            onClick={() => setPaperPattern('grid')}
            title="Matterutor"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${paperPattern === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            🟦
          </button>
          <button 
            onClick={() => setPaperPattern('lines')}
            title="Linjerat"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${paperPattern === 'lines' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            🗒️
          </button>
          <button 
            onClick={() => setPaperPattern('dots')}
            title="Prickat"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${paperPattern === 'dots' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            ⁙
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1" />

        {/* FÄRGVÄLJARE */}
        <div className="flex gap-2">
          {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
            <button 
              key={c} 
              onClick={() => setPenColor(c)} 
              className={`w-8 h-8 rounded-full border-2 transition-transform ${penColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent hover:scale-110'}`} 
              style={{ background: c }} 
            />
          ))}
        </div>

        <button 
          onClick={() => {
            const canvas = canvasRef.current;
            if(canvas) canvas.getContext('2d')?.clearRect(0,0, canvas.width, canvas.height);
          }} 
          className="ml-auto text-[10px] bg-white text-red-500 px-4 py-2 rounded-xl font-black border border-red-50 hover:bg-red-50 transition-colors uppercase tracking-widest"
        >
          Rensa
        </button>
      </div>

      <div className={`flex-1 rounded-[2.5rem] relative overflow-hidden border-2 border-slate-50 shadow-inner group transition-all duration-300 ${getPatternClass()}`}>
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
          className={`w-full h-full block touch-none bg-transparent ${activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}
        />

        {textInput && (
          <div 
            className="absolute z-[100] p-2"
            style={{ 
              left: (textInput.x / 2000) * 100 + '%', 
              top: (textInput.y / 1500) * 100 + '%',
              transform: 'translate(-15px, -15px)' 
            }}
            onMouseDown={(e) => e.stopPropagation()} 
          >
            <div className="bg-white border-2 border-indigo-500 rounded-2xl p-2 shadow-[0_25px_60px_rgba(79,70,229,0.35)] flex flex-col gap-2 min-w-[250px]">
              <input
                ref={inputRef}
                type="text"
                value={textInput.value}
                onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                className="bg-slate-50 border-none rounded-xl px-4 py-3 outline-none font-bold text-slate-800 w-full"
                style={{ fontSize: '18px', color: penColor }}
                placeholder="Skriv här..."
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enter för att spara</span>
                <button 
                  onClick={() => handleTextSubmit()}
                  className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  KLAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-1">
        <div className="flex items-center gap-3">
          <input 
            type="range" min="4" max="80" value={penWidth} 
            onChange={(e) => setPenWidth(parseInt(e.target.value))} 
            className="w-24 accent-indigo-600 cursor-pointer" 
          />
          <span className="text-[10px] font-black text-slate-400 w-12 uppercase tracking-tighter">
            Bredd: {penWidth}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          <div className="w-2 h-2 rounded-full" style={{ background: penColor }}></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Aktiv Färg</span>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
