
import React, { useState, useRef, useEffect } from 'react';
import { ToolType } from '../types';

interface WidgetFrameProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
  x: number;
  y: number;
  zIndex: number;
  onMove: (x: number, y: number) => void;
  onFocus: () => void;
  initialWidth?: number;
  initialHeight?: number;
}

const WidgetFrame: React.FC<WidgetFrameProps> = ({ 
  title, icon, children, onClose, x, y, zIndex, onMove, onFocus, initialWidth = 400, initialHeight = 500 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    onFocus();
    setIsDragging(true);
    const rect = frameRef.current?.getBoundingClientRect();
    if (rect) {
      setRel({
        x: e.pageX - rect.left,
        y: e.pageY - rect.top
      });
    }
    e.stopPropagation();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      onMove(e.pageX - rel.x, e.pageY - rel.y);
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, rel, onMove]);

  return (
    <div 
      ref={frameRef}
      className={`absolute bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden transition-shadow ${isDragging ? 'shadow-indigo-500/20 ring-2 ring-indigo-500/20' : ''}`}
      style={{ 
        left: x, 
        top: y, 
        zIndex, 
        width: initialWidth,
        minHeight: 200,
        resize: 'both',
        overflow: 'auto'
      }}
      onMouseDown={onFocus}
    >
      <div 
        className="h-14 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between px-5 cursor-move select-none shrink-0"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-slate-700">{title}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default WidgetFrame;
