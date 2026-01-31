
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToolType, Student, WidgetInstance } from './types';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import Randomizer from './components/Randomizer';
import NoiseMeter from './components/NoiseMeter';
import TrafficLight from './components/TrafficLight';
import GroupingTool from './components/GroupingTool';
import GeminiAssistant from './components/GeminiAssistant';
import SmartChecklist from './components/SmartChecklist';
import Whiteboard from './components/Whiteboard';
import QRCodeWidget from './components/QRCodeWidget';
import PollingTool from './components/PollingTool';
import WidgetFrame from './components/WidgetFrame';
import BackgroundSelector from './components/BackgroundSelector';
import Dashboard from './components/Dashboard';
import ImageAnnotator from './components/ImageAnnotator';
import StudentPollView from './components/StudentPollView';

const App: React.FC = () => {
  const [background, setBackground] = useState(() => {
    return localStorage.getItem('kp_background') || 'bg-slate-100';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [pollId, setPollId] = useState<string | null>(null);

  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    const saved = localStorage.getItem('kp_widgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('kp_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [maxZIndex, setMaxZIndex] = useState(100);

  // Check for Student Mode on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      setIsStudentMode(true);
      setPollId(joinId);
    }
  }, []);

  useEffect(() => {
    if (!isStudentMode) {
      localStorage.setItem('kp_widgets', JSON.stringify(widgets));
      localStorage.setItem('kp_background', background);
      localStorage.setItem('kp_students', JSON.stringify(students));
    }
  }, [widgets, background, students, isStudentMode]);

  const handleSelectBackground = (bg: string) => {
    setBackground(bg);
    setIsBackgroundSettingsOpen(false);
  };

  const handleSelectTool = (type: ToolType) => {
    if (type === ToolType.DASHBOARD) {
      clearAll();
    } else if (type === ToolType.BACKGROUND) {
      setIsBackgroundSettingsOpen(true);
      setIsSidebarOpen(false);
    } else if (type === ToolType.MATTEYTAN) {
      window.open('https://matteytan.se/', '_blank');
      setIsSidebarOpen(false);
    } else {
      toggleWidget(type);
      setIsSidebarOpen(false);
    }
  };

  const getInitialDimensions = (type: ToolType) => {
    switch (type) {
      case ToolType.CHECKLIST: return { width: 500, height: 600 };
      case ToolType.WHITEBOARD: return { width: 850, height: 650 };
      case ToolType.IMAGE_ANNOTATOR: return { width: 850, height: 650 };
      case ToolType.QR_CODE: return { width: 400, height: 500 };
      case ToolType.POLLING: return { width: 850, height: 700 };
      case ToolType.TRAFFIC_LIGHT: return { width: 850, height: 600 };
      case ToolType.GROUPING: return { width: 850, height: 600 };
      case ToolType.ASSISTANT: return { width: 650, height: 750 };
      case ToolType.RANDOMIZER: return { width: 850, height: 600 };
      case ToolType.TIMER: return { width: 600, height: 650 };
      case ToolType.NOISE_METER: return { width: 400, height: 550 };
      default: return { width: 700, height: 550 };
    }
  };

  const findSmartPosition = (width: number, height: number) => {
    const sidebarWidth = isSidebarOpen ? (window.innerWidth < 768 ? 80 : 288) : 0;
    const margin = 100;
    const availableWidth = window.innerWidth - sidebarWidth - width - margin;
    const availableHeight = window.innerHeight - height - margin;

    const slots = [
      { x: sidebarWidth + 50, y: 80 },
      { x: sidebarWidth + (availableWidth / 2), y: 80 },
      { x: sidebarWidth + availableWidth, y: 80 },
    ];

    const openWidgets = widgets.filter(w => w.isOpen);
    if (openWidgets.length === 0) return slots[0];

    return slots[openWidgets.length % slots.length];
  };

  const toggleWidget = (type: ToolType) => {
    const existing = widgets.find(w => w.type === type);
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);

    if (existing) {
      setWidgets(prev => prev.map(w => 
        w.type === type ? { ...w, isOpen: !w.isOpen, zIndex: newZ } : w
      ));
    } else {
      const { width, height } = getInitialDimensions(type);
      const pos = findSmartPosition(width, height);
      
      const newWidget: WidgetInstance = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: pos.x,
        y: pos.y,
        zIndex: newZ,
        isOpen: true,
        width,
        height
      };
      setWidgets([...widgets, newWidget]);
    }
  };

  const autoArrangeWidgets = () => {
    const openWidgets = widgets.filter(w => w.isOpen);
    if (openWidgets.length === 0) return;

    const margin = 24;
    const topBarHeight = 80;
    const sidebarWidth = isSidebarOpen ? (window.innerWidth < 768 ? 80 : 288) : 0;
    
    let currentX = margin + sidebarWidth;
    let currentY = topBarHeight; 
    let rowMaxHeight = 0;

    const newWidgets = widgets.map(w => {
      if (!w.isOpen) return w;
      const wWidth = w.width || 700;
      const wHeight = w.height || 550;

      if (currentX + wWidth > window.innerWidth - margin && currentX > margin + sidebarWidth) {
        currentX = margin + sidebarWidth;
        currentY += rowMaxHeight + margin;
        rowMaxHeight = 0;
      }

      const updated = { ...w, x: currentX, y: currentY };
      currentX += wWidth + margin;
      rowMaxHeight = Math.max(rowMaxHeight, wHeight);
      return updated;
    });

    setWidgets(newWidgets);
  };

  const moveWidget = useCallback((type: ToolType, x: number, y: number) => {
    setWidgets(prev => prev.map(w => w.type === type ? { ...w, x, y } : w));
  }, []);

  const resizeWidget = useCallback((type: ToolType, width: number, height: number) => {
    setWidgets(prev => prev.map(w => w.type === type ? { ...w, width, height } : w));
  }, []);

  const focusWidget = (type: ToolType) => {
    const newZ = maxZIndex + 1;
    setWidgets(prev => prev.map(w => w.type === type ? { ...w, zIndex: newZ } : w));
    setMaxZIndex(newZ);
  };

  const closeWidget = (type: ToolType) => {
    setWidgets(prev => prev.map(w => w.type === type ? { ...w, isOpen: false } : w));
  };

  const clearAll = () => {
    setWidgets(prev => prev.map(w => ({ ...w, isOpen: false })));
    setIsBackgroundSettingsOpen(false);
  };

  const getWidgetConfig = (type: ToolType) => {
    switch (type) {
      case ToolType.TIMER: return { title: 'Timer', icon: '⏱️', component: <Timer /> };
      case ToolType.RANDOMIZER: return { title: 'Slumpa Elev', icon: '🎲', component: <Randomizer students={students} setStudents={setStudents} /> };
      case ToolType.NOISE_METER: return { title: 'Ljudmätare', icon: '🔊', component: <NoiseMeter /> };
      case ToolType.TRAFFIC_LIGHT: return { title: 'Trafikljus', icon: '🚦', component: <TrafficLight /> };
      case ToolType.GROUPING: return { title: 'Gruppering', icon: '👥', component: <GroupingTool students={students} /> };
      case ToolType.ASSISTANT: return { title: 'AI Assistent', icon: '✨', component: <GeminiAssistant /> };
      case ToolType.CHECKLIST: return { title: 'Arbetsgång', icon: '✅', component: <SmartChecklist /> };
      case ToolType.WHITEBOARD: return { title: 'Whiteboard', icon: '🎨', component: <Whiteboard /> };
      case ToolType.IMAGE_ANNOTATOR: return { title: 'Bild-rita', icon: '📸', component: <ImageAnnotator /> };
      case ToolType.QR_CODE: return { title: 'QR-Kod', icon: '📱', component: <QRCodeWidget /> };
      case ToolType.POLLING: return { title: 'Omröstning', icon: '📊', component: <PollingTool /> };
      default: return null;
    }
  };

  if (isStudentMode && pollId) {
    return <StudentPollView pollId={pollId} />;
  }

  const backgroundStyle = useMemo(() => {
    if (background.startsWith('#')) return { backgroundColor: background };
    if (background.startsWith('http') || background.startsWith('data:image')) {
      return { backgroundImage: `url("${background}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  }, [background]);

  const backgroundClass = useMemo(() => {
    if (background.startsWith('#') || background.startsWith('http') || background.startsWith('data:image')) return '';
    return background;
  }, [background]);

  const activeWidgets = useMemo(() => widgets.filter(w => w.isOpen), [widgets]);

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden transition-all duration-700 ${backgroundClass}`}
      style={backgroundStyle}
    >
      <div 
        className={`transition-all duration-300 ease-in-out shrink-0 relative z-[9999] ${isSidebarOpen ? 'w-20 md:w-72' : 'w-0 opacity-0 overflow-hidden'}`}
      >
        <Sidebar 
          activeTool={null} 
          onSelectTool={handleSelectTool} 
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 relative overflow-hidden h-full">
        <div className="absolute inset-0 z-10 pointer-events-none">
          {activeWidgets.map((w) => {
            const config = getWidgetConfig(w.type);
            if (!config) return null;
            return (
              <div key={w.type} className="pointer-events-auto">
                <WidgetFrame
                  title={config.title}
                  icon={config.icon}
                  x={w.x}
                  y={w.y}
                  zIndex={w.zIndex}
                  initialWidth={w.width}
                  initialHeight={w.height}
                  onMove={(x, y) => moveWidget(w.type, x, y)}
                  onResize={(width, height) => resizeWidget(w.type, width, height)}
                  onFocus={() => focusWidget(w.type)}
                  onClose={() => closeWidget(w.type)}
                >
                  {config.component}
                </WidgetFrame>
              </div>
            );
          })}
        </div>

        {activeWidgets.length === 0 && !isBackgroundSettingsOpen && (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-0">
             <div className="w-full max-w-5xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                <Dashboard 
                  onSelectTool={handleSelectTool} 
                  studentsCount={students.length}
                  currentBackground={background}
                  onBackgroundSelect={handleSelectBackground}
                />
             </div>
          </div>
        )}

        {isBackgroundSettingsOpen && (
          <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl max-w-xl w-full border border-slate-100 relative mx-4">
              <button 
                onClick={() => setIsBackgroundSettingsOpen(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                ✕
              </button>
              <h3 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
                <span className="text-4xl">🖼️</span> Bakgrund
              </h3>
              <BackgroundSelector current={background} onSelect={handleSelectBackground} />
            </div>
          </div>
        )}

        <div className="absolute top-6 left-6 flex gap-4 z-[999]">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-14 h-14 bg-white/90 backdrop-blur-md text-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-2xl hover:scale-110 transition-all border border-white/50"
              title="Öppna meny"
            >
              🏫
            </button>
          )}
        </div>

        {activeWidgets.length > 0 && (
          <button 
            onClick={autoArrangeWidgets}
            className="absolute top-6 right-6 px-6 h-14 bg-white/90 backdrop-blur-md text-indigo-600 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-bold hover:scale-105 transition-all z-[999] border border-white/50 animate-in fade-in slide-in-from-right-4"
            title="Sortera fönster"
          >
            <span className="text-xl">🪄</span>
            <span className="hidden md:block">Organisera</span>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
