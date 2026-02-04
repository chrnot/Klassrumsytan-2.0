
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface WidgetFrameProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
  x: number;
  y: number;
  zIndex: number;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onFocus: () => void;
  initialWidth?: number;
  initialHeight?: number;
}

const WidgetFrame: React.FC<WidgetFrameProps> = ({ 
  title, icon, children, onClose, x, y, zIndex, onMove, onResize, onFocus, 
  initialWidth = 450, initialHeight = 400
}) => {
  // Lokala koordinater för att undvika globalt lag vid drag
  const [localPos, setLocalPos] = useState({ x, y });
  const [localSize, setLocalSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const resizeStartData = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });
  const frameRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Synka lokal position när props ändras utifrån (t.ex. vid "Ordna" eller "Centrera")
  useEffect(() => {
    if (!isDragging) setLocalPos({ x, y });
  }, [x, y, isDragging]);

  useEffect(() => {
    if (!isResizing) setLocalSize({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight, isResizing]);

  useEffect(() => {
    const handleResizeCheck = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResizeCheck);
    return () => window.removeEventListener('resize', handleResizeCheck);
  }, []);

  const handleCenter = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const centerX = (window.innerWidth - localSize.width) / 2;
    const centerY = (window.innerHeight - localSize.height) / 2;
    setLocalPos({ x: centerX, y: centerY });
    onMove(centerX, centerY);
    onFocus();
  }, [localSize, onMove, onFocus]);

  const startDrag = (e: React.MouseEvent) => {
    if (isMobile || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) return;

    onFocus();
    setIsDragging(true);
    
    // Beräkna exakt var i fönstret vi klickade relativt fönstrets nuvarande x/y
    dragStartOffset.current = {
      x: e.clientX - localPos.x,
      y: e.clientY - localPos.y
    };
    
    e.stopPropagation();
    e.preventDefault();
  };

  const startResize = (e: React.MouseEvent) => {
    if (isMobile || e.button !== 0) return;
    onFocus();
    setIsResizing(true);
    
    resizeStartData.current = {
      width: localSize.width,
      height: localSize.height,
      mouseX: e.clientX,
      mouseY: e.clientY
    };
    
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Vi använder inte state-callback här för att maximera prestandan
        const newX = e.clientX - dragStartOffset.current.x;
        const newY = e.clientY - dragStartOffset.current.y;
        setLocalPos({ x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartData.current.mouseX;
        const deltaY = e.clientY - resizeStartData.current.mouseY;
        const newW = Math.max(300, resizeStartData.current.width + deltaX);
        const newH = Math.max(250, resizeStartData.current.height + deltaY);
        setLocalSize({ width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onMove(localPos.x, localPos.y); // Synka tillbaka till App-state vid släpp
      }
      if (isResizing) {
        setIsResizing(false);
        onResize(localSize.width, localSize.height);
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, localPos, localSize, onMove, onResize]);

  const frameStyle: React.CSSProperties = isMobile ? {
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10000,
    position: 'fixed'
  } : {
    // Vi använder transform för rörelsen eftersom det är mycket mjukare än left/top
    transform: `translate3d(${localPos.x}px, ${localPos.y}px, 0)`,
    width: localSize.width,
    height: localSize.height,
    zIndex,
    position: 'absolute',
    top: 0,
    left: 0,
    willChange: 'transform, width, height',
    transition: isDragging || isResizing ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.3s, height 0.3s'
  };

  return (
    <div 
      ref={frameRef}
      className={`bg-white shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-200/50 ${
        !isMobile ? 'rounded-[2.5rem]' : ''
      } ${isDragging ? 'scale-[1.02] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] opacity-90 cursor-grabbing' : 'cursor-default'}`}
      style={frameStyle}
      onMouseDown={onFocus}
    >
      <div 
        className={`h-16 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 shrink-0 select-none ${
          !isMobile ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
          <span className="font-bold text-slate-800 tracking-tight">{title}</span>
        </div>
        <div className="flex items-center gap-1 no-drag">
          {!isMobile && (
            <button 
              onClick={handleCenter}
              title="Centrera fönster"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 text-slate-400 transition-all active:scale-90"
            >
              <span className="text-lg">🎯</span>
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all active:scale-90"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
        {children}
      </div>

      {!isMobile && (
        <div 
          className="no-drag absolute bottom-0 right-0 w-8 h-8 flex items-end justify-end p-2 cursor-nwse-resize group z-50"
          onMouseDown={startResize}
        >
          <div className="w-3 h-3 border-r-2 border-b-2 border-slate-300 group-hover:border-indigo-500 transition-colors rounded-br-sm" />
        </div>
      )}
    </div>
  );
};

export default WidgetFrame;
