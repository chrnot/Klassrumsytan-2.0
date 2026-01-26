
import React, { useState, useRef, useEffect } from 'react';

enum SubTool {
  TEXT = 'TEXT',
  WHITEBOARD = 'WHITEBOARD',
  QR = 'QR'
}

const InstructionTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTool>(SubTool.TEXT);
  const [note, setNote] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [url, setUrl] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#4f46e5');
  const [penWidth, setPenWidth] = useState(4);

  useEffect(() => {
    if (activeTab === SubTool.WHITEBOARD && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  // Funktion för att hämta korrekta koordinater oavsett skalning
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Hämta klient-koordinater för mus eller touch
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    // Räkna ut skalningsfaktorn (pixel size vs css size)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
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
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    // Förhindra scrolling på touch-enheter när man ritar
    if ('touches' in e && e.cancelable) {
        e.preventDefault();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit shrink-0">
        {Object.values(SubTool).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {t === SubTool.TEXT ? 'Text' : t === SubTool.WHITEBOARD ? 'Rita' : 'QR'}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 p-2 overflow-hidden flex flex-col">
        {activeTab === SubTool.TEXT && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-2 p-2 border-b border-slate-50 shrink-0">
               <input 
                 type="range" 
                 min="12" 
                 max="150" 
                 value={fontSize} 
                 onChange={(e) => setFontSize(parseInt(e.target.value))} 
                 className="w-24 accent-indigo-600" 
               />
               <span className="text-[10px] font-bold text-slate-400">{fontSize}px</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Skriv instruktioner..."
              className="flex-1 w-full bg-transparent resize-none focus:outline-none font-bold text-slate-800 leading-tight p-2"
              style={{ fontSize: `${fontSize}px` }}
            />
          </div>
        )}

        {activeTab === SubTool.WHITEBOARD && (
          <div className="flex-1 flex flex-col relative animate-in fade-in duration-300 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 mb-2 p-2 border-b border-slate-50 shrink-0">
               <div className="flex gap-1.5 mr-2">
                {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setPenColor(c)} 
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${penColor === c ? 'border-slate-400 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`} 
                    style={{ background: c }} 
                  />
                ))}
               </div>
               <div className="flex items-center gap-2 mr-2">
                 <input 
                   type="range" 
                   min="1" 
                   max="25" 
                   value={penWidth} 
                   onChange={(e) => setPenWidth(parseInt(e.target.value))} 
                   className="w-16 accent-indigo-600" 
                 />
               </div>
               <button 
                onClick={() => {
                  const canvas = canvasRef.current;
                  if(canvas) canvas.getContext('2d')?.clearRect(0,0, canvas.width, canvas.height);
                }} 
                className="ml-auto text-xs bg-slate-50 text-slate-400 px-3 py-1 rounded-lg font-bold hover:bg-slate-100 transition-colors"
               >
                 Töm tavlan
               </button>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={2000}
                height={1200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full block touch-none cursor-crosshair"
              />
            </div>
          </div>
        )}

        {activeTab === SubTool.QR && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Länk eller text</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exempel.se"
                className="w-full mb-6 px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
            {url ? (
              <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-50 animate-in zoom-in-90">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`} 
                  alt="QR"
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-200">
                <div className="text-7xl mb-2">📱</div>
                <p className="text-xs font-bold uppercase tracking-wider">Klistra in länk ovan</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructionTools;
