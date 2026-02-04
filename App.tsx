
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ToolType, Student, WidgetInstance } from './types';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import Randomizer from './components/Randomizer';
import NoiseMeter from './components/NoiseMeter';
import TrafficLight from './components/TrafficLight';
import GroupingTool from './components/GroupingTool';
import SmartChecklist from './components/SmartChecklist';
import Whiteboard from './components/Whiteboard';
import QRCodeWidget from './components/QRCodeWidget';
import PollingTool from './components/PollingTool';
import WidgetFrame from './components/WidgetFrame';
import Dashboard from './components/Dashboard';
import BackgroundSelector from './components/BackgroundSelector';
import ImageAnnotator from './components/ImageAnnotator';
import StudentPollView from './components/StudentPollView';
import GeminiAssistant from './components/GeminiAssistant';

const App: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const pollIdFromUrl = queryParams.get('join');
  const isStudent = !!pollIdFromUrl;

  const [background, setBackground] = useState(() => localStorage.getItem('kp_background') || 'bg-slate-100');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isStudent && window.innerWidth > 1024);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    const saved = localStorage.getItem('kp_widgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('kp_students');
    return saved ? JSON.parse(saved) : [];
  });
  const [maxZIndex, setMaxZIndex] = useState(200);

  useEffect(() => {
    if (!isStudent) {
      localStorage.setItem('kp_widgets', JSON.stringify(widgets));
      localStorage.setItem('kp_background', background);
      localStorage.setItem('kp_students', JSON.stringify(students));
    }
  }, [widgets, background, students, isStudent]);

  const getInitialDimensions = useCallback((type: ToolType) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return { width: window.innerWidth, height: window.innerHeight };
    
    switch (type) {
      case ToolType.TIMER: return { width: 450, height: 680 };
      case ToolType.RANDOMIZER: return { width: 600, height: 600 };
      case ToolType.POLLING: return { width: 850, height: 750 };
      case ToolType.ASSISTANT: return { width: 500, height: 750 };
      case ToolType.TRAFFIC_LIGHT: return { width: 500, height: 700 };
      case ToolType.CHECKLIST: return { width: 550, height: 750 };
      case ToolType.GROUPING: return { width: 750, height: 750 };
      default: return { width: 700, height: 750 };
    }
  }, []);

  const arrangeWidgets = useCallback(() => {
    const active = widgets.filter(w => w.isOpen);
    if (active.length === 0) return;

    const sidebarWidth = isSidebarOpen ? 288 : 0;
    const padding = 40;
    const availableWidth = window.innerWidth - sidebarWidth - (padding * 2);
    const availableHeight = window.innerHeight - (padding * 2);

    const count = active.length;
    let cols = 1;
    if (count > 1) cols = 2;
    if (count > 4) cols = 3;
    if (count > 9) cols = 4;
    const rows = Math.ceil(count / cols);

    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    setWidgets(prev => prev.map(w => {
      if (!w.isOpen) return w;
      const index = active.findIndex(aw => aw.id === w.id);
      const row = Math.floor(index / cols);
      const col = index % cols;

      const dims = getInitialDimensions(w.type);
      const targetWidth = Math.min(dims.width, cellWidth - 30);
      const targetHeight = Math.min(dims.height, cellHeight - 30);

      const x = sidebarWidth + padding + (col * cellWidth) + (cellWidth - targetWidth) / 2;
      const y = padding + (row * cellHeight) + (cellHeight - targetHeight) / 2;

      return { ...w, x, y, width: targetWidth, height: targetHeight };
    }));
  }, [widgets, isSidebarOpen, getInitialDimensions]);

  const toggleWidget = useCallback((type: ToolType) => {
    const isMobile = window.innerWidth < 768;
    const existing = widgets.find(w => w.type === type);
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);

    if (existing) {
      setWidgets(prev => prev.map(w => w.type === type ? { ...w, isOpen: !w.isOpen, zIndex: newZ } : w));
    } else {
      const { width, height } = getInitialDimensions(type);
      const startX = isMobile ? 0 : 120 + (widgets.filter(w => w.isOpen).length * 40);
      const startY = isMobile ? 0 : 80 + (widgets.filter(w => w.isOpen).length * 40);
      setWidgets([...widgets, { 
        id: Math.random().toString(36).substr(2, 9), 
        type, x: startX, y: startY, zIndex: newZ, 
        isOpen: true, width, height 
      }]);
    }
  }, [widgets, maxZIndex, getInitialDimensions]);

  const handleSelectTool = useCallback((type: ToolType) => {
    if (type === ToolType.DASHBOARD) {
      if (window.confirm("Vill du rensa arbetsytan och stänga alla verktyg?")) {
        setWidgets([]);
        localStorage.removeItem('kp_widgets');
      }
    } else if (type === ToolType.ARRANGE) {
      arrangeWidgets();
    } else if (type === ToolType.BACKGROUND) {
      setIsBackgroundSettingsOpen(true);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    } else if (type === ToolType.MATTEYTAN) {
      window.open('https://matteytan.se/', '_blank');
    } else {
      toggleWidget(type);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  }, [toggleWidget, arrangeWidgets]);

  const updateWidgetPosition = useCallback((type: ToolType, x: number, y: number) => {
    setWidgets(prev => prev.map(w => w.type === type ? { ...w, x, y } : w));
  }, []);

  const updateWidgetSize = useCallback((type: ToolType, width: number, height: number) => {
    setWidgets(prev => prev.map(w => w.type === type ? { ...w, width, height } : w));
  }, []);

  const focusWidget = useCallback((type: ToolType) => {
    setWidgets(prev => {
      const target = prev.find(w => w.type === type);
      if (!target || target.zIndex === maxZIndex) return prev;
      const newZ = maxZIndex + 1;
      setMaxZIndex(newZ);
      return prev.map(w => w.type === type ? { ...w, zIndex: newZ } : w);
    });
  }, [maxZIndex]);

  const closeWidget = useCallback((type: ToolType) => {
    setWidgets(prev => prev.map(z => z.type === type ? { ...z, isOpen: false } : z));
  }, []);

  const activeWidgets = widgets.filter(w => w.isOpen);
  const openWidgetTypes = activeWidgets.map(w => w.type);

  const getWidgetComponent = (type: ToolType) => {
    switch (type) {
      case ToolType.TIMER: return <Timer />;
      case ToolType.RANDOMIZER: return <Randomizer students={students} setStudents={setStudents} />;
      case ToolType.POLLING: return <PollingTool />;
      case ToolType.ASSISTANT: return <GeminiAssistant />;
      case ToolType.NOISE_METER: return <NoiseMeter />;
      case ToolType.TRAFFIC_LIGHT: return <TrafficLight />;
      case ToolType.GROUPING: return <GroupingTool students={students} onResize={(w, h) => updateWidgetSize(ToolType.GROUPING, w, h)} />;
      case ToolType.CHECKLIST: return <SmartChecklist />;
      case ToolType.WHITEBOARD: return <Whiteboard />;
      case ToolType.IMAGE_ANNOTATOR: return <ImageAnnotator />;
      case ToolType.QR_CODE: return <QRCodeWidget />;
      default: return null;
    }
  };

  const getWidgetMetadata = (type: ToolType) => {
    switch (type) {
      case ToolType.TIMER: return { title: 'Timer', icon: '⏱️' };
      case ToolType.RANDOMIZER: return { title: 'Slumpa', icon: '🎲' };
      case ToolType.POLLING: return { title: 'Omröstning', icon: '📊' };
      case ToolType.ASSISTANT: return { title: 'AI Assistent', icon: '✨' };
      case ToolType.NOISE_METER: return { title: 'Ljudmätare', icon: '🔊' };
      case ToolType.TRAFFIC_LIGHT: return { title: 'Trafikljus', icon: '🚦' };
      case ToolType.GROUPING: return { title: 'Gruppering', icon: '👥' };
      case ToolType.CHECKLIST: return { title: 'Arbetsgång', icon: '✅' };
      case ToolType.WHITEBOARD: return { title: 'Whiteboard', icon: '🎨' };
      case ToolType.IMAGE_ANNOTATOR: return { title: 'Bild-rita', icon: '📸' };
      case ToolType.QR_CODE: return { title: 'QR-Kod', icon: '📱' };
      default: return { title: 'Verktyg', icon: '⚙️' };
    }
  };

  if (isStudent && pollIdFromUrl) return <StudentPollView pollId={pollIdFromUrl} />;

  const backgroundStyle = useMemo(() => {
    if (background.startsWith('#')) return { backgroundColor: background };
    if (background.startsWith('http') || background.startsWith('data:image')) {
      return { backgroundImage: `url("${background}")`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  }, [background]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${background.includes('bg-') ? background : ''}`} style={backgroundStyle}>
      {isSidebarOpen && (
        <div className="fixed inset-0 lg:relative lg:inset-auto w-full md:w-72 z-[9999]">
          <Sidebar activeTool={null} onSelectTool={handleSelectTool} onClose={() => setIsSidebarOpen(false)} openWidgets={openWidgetTypes} />
        </div>
      )}
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-10 pointer-events-none">
          {activeWidgets.map((w) => {
            const meta = getWidgetMetadata(w.type);
            return (
              <div key={w.type} className="pointer-events-auto">
                <WidgetFrame
                  title={meta.title} icon={meta.icon} x={w.x} y={w.y} zIndex={w.zIndex} initialWidth={w.width} initialHeight={w.height}
                  onMove={(nx, ny) => updateWidgetPosition(w.type, nx, ny)}
                  onResize={(nw, nh) => updateWidgetSize(w.type, nw, nh)}
                  onFocus={() => focusWidget(w.type)}
                  onClose={() => closeWidget(w.type)}
                >
                  {getWidgetComponent(w.type)}
                </WidgetFrame>
              </div>
            );
          })}
        </div>

        {isBackgroundSettingsOpen && (
          <div className="absolute inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBackgroundSettingsOpen(false)} />
            <div className="relative bg-white/95 backdrop-blur-xl border border-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <span className="text-3xl">🖼️</span> Välj stämning
                </h3>
                <button onClick={() => setIsBackgroundSettingsOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">✕</button>
              </div>
              <BackgroundSelector current={background} onSelect={(bg) => setBackground(bg)} />
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsBackgroundSettingsOpen(false)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg">Klar</button>
              </div>
            </div>
          </div>
        )}

        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="absolute top-6 left-6 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-2xl z-[999] hover:scale-110 transition-transform">🏫</button>
        )}
        
        {activeWidgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10 overflow-y-auto">
            <Dashboard onSelectTool={handleSelectTool} studentsCount={students.length} currentBackground={background} onBackgroundSelect={setBackground} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
