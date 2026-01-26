
import React, { useState, useRef, useEffect } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  
  const frameRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.close-btn') || target.closest('.resize-handle')) return;

    onFocus();
    setIsDragging(true);
    
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.pageX - rect.left,
        y: e.pageY - rect.top
      });
    }
    e.stopPropagation();
  };

  const startResize = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onFocus();
    setIsResizing(true);
    
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStart({
        width: rect.width,
        height: rect.height,
        x: e.pageX,
        y: e.pageY
      });
    }
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        let nextX = e.pageX - dragOffset.x;
        let nextY = e.pageY - dragOffset.y;
        nextX = Math.max(-20, nextX);
        nextY = Math.max(0, nextY);
        onMove(nextX, nextY);
      } else if (isResizing) {
        const deltaX = e.pageX - resizeStart.x;
        const deltaY = e.pageY - resizeStart.y;
        
        const nextWidth = Math.max(250, resizeStart.width + deltaX);
        const nextHeight = Math.max(200, resizeStart.height + deltaY);
        
        onResize(nextWidth, nextHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, onMove, onResize]);

  return (
    <div 
      ref={frameRef}
      className={`absolute bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-white/40 flex flex-col overflow-hidden transition-shadow ${
        isDragging || isResizing ? 'shadow-indigo-500/20 shadow-2xl scale-[1.005]' : 'shadow-xl'
      } animate-in zoom-in-95 duration-200`}
      style={{ 
        left: x, 
        top: y, 
        zIndex, 
        width: initialWidth,
        height: initialHeight,
        maxWidth: '95vw',
        maxHeight: '90vh',
      }}
      onMouseDown={onFocus}
    >
      {/* Header / Drag Area */}
      <div 
        className="h-16 bg-slate-50/50 border-b border-slate-100/50 flex items-center justify-between px-6 cursor-grab active:cursor-grabbing select-none shrink-0"
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-bold text-slate-800 tracking-tight">{title}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="close-btn w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {children}
      </div>

      {/* Resize Handle */}
      <div 
        className="resize-handle absolute bottom-0 right-0 w-10 h-10 flex items-end justify-end p-2 cursor-nwse-resize group"
        onMouseDown={startResize}
      >
        <div className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="21" y1="21" x2="10" y2="10" />
            <line x1="21" y1="14" x2="14" y2="21" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WidgetFrame;
