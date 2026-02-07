
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ToolType, Student, WidgetInstance, PageData } from './types';
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

  // --- TILLSTÅND FÖR SIDOR ---
  const [pages, setPages] = useState<PageData[]>(() => {
    const saved = localStorage.getItem('kp_pages_v2');
    if (saved) return JSON.parse(saved);
    
    // Migrering eller nystart
    const oldWidgets = localStorage.getItem('kp_widgets');
    const oldBg = localStorage.getItem('kp_background');
    
    return [{
      id: Math.random().toString(36).substr(2, 9),
      name: 'Sida 1',
      background: oldBg || 'bg-slate-100',
      widgets: oldWidgets ? JSON.parse(oldWidgets) : []
    }];
  });
  
  const [activePageIndex, setActivePageIndex] = useState(0);
  const currentPage = pages[activePageIndex];

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isStudent && window.innerWidth > 1024);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('kp_students');
    return saved ? JSON.parse(saved) : [];
  });
  const [maxZIndex, setMaxZIndex] = useState(200);

  // Synka sidor till LocalStorage
  useEffect(() => {
    if (!isStudent) {
      localStorage.setItem('kp_pages_v2', JSON.stringify(pages));
      localStorage.setItem('kp_students', JSON.stringify(students));
    }
  }, [pages, students, isStudent]);

  const activeWidgets = currentPage.widgets.filter(w => w.isOpen);
  const openWidgetTypes = activeWidgets.map(w => w.type);

  // --- HJÄLPFUNKTIONER FÖR SIDOR ---
  const addPage = () => {
    if (pages.length >= 6) return;
    const newPage: PageData = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Sida ${pages.length + 1}`,
      background: 'bg-slate-100',
      widgets: []
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const removePage = (index: number) => {
    if (pages.length <= 1) return;
    if (window.confirm(`Vill du ta bort ${pages[index].name}? Alla verktyg på denna sida försvinner.`)) {
      const newPages = pages.filter((_, i) => i !== index);
      setPages(newPages);
      setActivePageIndex(Math.max(0, activePageIndex >= index ? activePageIndex - 1 : activePageIndex));
    }
  };

  const updateCurrentPage = useCallback((updates: Partial<PageData>) => {
    setPages(prev => prev.map((p, i) => i === activePageIndex ? { ...p, ...updates } : p));
  }, [activePageIndex]);

  // --- WIDGET LOGIK (Nu kopplad till currentPage) ---
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

  const toggleWidget = useCallback((type: ToolType) => {
    const isMobile = window.innerWidth < 768;
    const existing = currentPage.widgets.find(w => w.type === type);
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);

    if (existing) {
      const newWidgets = currentPage.widgets.map(w => w.type === type ? { ...w, isOpen: !w.isOpen, zIndex: newZ } : w);
      updateCurrentPage({ widgets: newWidgets });
    } else {
      const { width, height } = getInitialDimensions(type);
      const startX = isMobile ? 0 : 120 + (currentPage.widgets.filter(w => w.isOpen).length * 40);
      const startY = isMobile ? 0 : 80 + (currentPage.widgets.filter(w => w.isOpen).length * 40);
      const newWidgets = [...currentPage.widgets, { 
        id: Math.random().toString(36).substr(2, 9), 
        type, x: startX, y: startY, zIndex: newZ, 
        isOpen: true, width, height 
      }];
      updateCurrentPage({ widgets: newWidgets });
    }
  }, [currentPage.widgets, maxZIndex, getInitialDimensions, updateCurrentPage]);

  const arrangeWidgets = useCallback(() => {
    const active = currentPage.widgets.filter(w => w.isOpen);
    if (active.length === 0) return;
    const sidebarWidth = isSidebarOpen ? 288 : 0;
    const padding = 40;
    const availableWidth = window.innerWidth - sidebarWidth - (padding * 2);
    const availableHeight = window.innerHeight - (padding * 2);
    const count = active.length;
    let cols = count > 1 ? 2 : 1;
    if (count > 4) cols = 3;
    const rows = Math.ceil(count / cols);
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;

    const newWidgets = currentPage.widgets.map(w => {
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
    });
    updateCurrentPage({ widgets: newWidgets });
  }, [currentPage.widgets, isSidebarOpen, getInitialDimensions, updateCurrentPage]);

  const clearWorkspace = useCallback(() => {
    if (window.confirm("Vill du rensa denna sida? Alla verktyg på just denna sida stängs.")) {
      updateCurrentPage({ widgets: [] });
      setIsSystemMenuOpen(false);
    }
  }, [updateCurrentPage]);

  const updateWidgetPosition = useCallback((type: ToolType, x: number, y: number) => {
    const newWidgets = currentPage.widgets.map(w => w.type === type ? { ...w, x, y } : w);
    updateCurrentPage({ widgets: newWidgets });
  }, [currentPage.widgets, updateCurrentPage]);

  const updateWidgetSize = useCallback((type: ToolType, width: number, height: number) => {
    const newWidgets = currentPage.widgets.map(w => w.type === type ? { ...w, width, height } : w);
    updateCurrentPage({ widgets: newWidgets });
  }, [currentPage.widgets, updateCurrentPage]);

  const focusWidget = useCallback((type: ToolType) => {
    const target = currentPage.widgets.find(w => w.type === type);
    if (!target || target.zIndex === maxZIndex) return;
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    const newWidgets = currentPage.widgets.map(w => w.type === type ? { ...w, zIndex: newZ } : w);
    updateCurrentPage({ widgets: newWidgets });
  }, [currentPage.widgets, maxZIndex, updateCurrentPage]);

  const closeWidget = useCallback((type: ToolType) => {
    const newWidgets = currentPage.widgets.map(z => z.type === type ? { ...z, isOpen: false } : z);
    updateCurrentPage({ widgets: newWidgets });
  }, [currentPage.widgets, updateCurrentPage]);

  // --- RENDERING HJÄLPARE ---
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

  // LOGIK FÖR ATT HANTERA OLIKA TYPER AV BAKGRUNDER
  const isImageUrl = currentPage.background.startsWith('http') || currentPage.background.startsWith('data:image');
  const isColorHex = currentPage.background.startsWith('#');
  const isPatternClass = currentPage.background.includes('bg-pattern-');

  const backgroundStyle: React.CSSProperties = {
    backgroundColor: isColorHex ? currentPage.background : undefined,
    backgroundImage: isImageUrl ? `url("${currentPage.background}")` : undefined,
    backgroundSize: isImageUrl ? 'cover' : undefined, // ENDAST cover om det är en bild-URL
    backgroundPosition: isImageUrl ? 'center' : undefined,
  };

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden transition-all duration-700 ${currentPage.background.includes('bg-') ? currentPage.background : ''}`} 
      style={backgroundStyle}
    >
      {isSidebarOpen && (
        <div className="fixed inset-0 lg:relative lg:inset-auto w-full md:w-72 z-[9999] animate-in slide-in-from-left duration-300">
          <Sidebar activeTool={null} onSelectTool={(t) => { t === ToolType.MATTEYTAN ? window.open('https://matteytan.se/', '_blank') : toggleWidget(t); setIsSidebarOpen(false); }} onClose={() => setIsSidebarOpen(false)} openWidgets={openWidgetTypes} />
        </div>
      )}
      <main className="flex-1 relative overflow-hidden">
        {/* FLYTANDE SYSTEMKONTROLLER */}
        {!isStudent && (
          <div className="absolute top-6 right-6 z-[1000] flex items-start gap-3">
            <button onClick={arrangeWidgets} title="Ordna fönster" className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all border border-white">🧩</button>
            <div className="flex flex-col gap-2 items-end">
              <button onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)} className={`w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all border border-white ${isSystemMenuOpen ? 'ring-2 ring-indigo-500' : ''}`}>⚙️</button>
              {isSystemMenuOpen && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300">
                  <button onClick={clearWorkspace} className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white group">
                    <span className="text-xl">🧹</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 group-hover:text-red-500 mt-0.5">Rensa</span>
                  </button>
                  <button onClick={() => { setIsBackgroundSettingsOpen(true); setIsSystemMenuOpen(false); }} className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white group">
                    <span className="text-xl">🖼️</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 group-hover:text-indigo-500 mt-0.5">Miljö</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WIDGETS FÖR AKTUELL SIDA */}
        <div key={currentPage.id} className="absolute inset-0 z-10 pointer-events-none animate-in fade-in slide-in-from-right-10 duration-500">
          {activeWidgets.map((w) => {
            const meta = getWidgetMetadata(w.type);
            return (
              <div key={w.id} className="pointer-events-auto">
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

        {/* SID-BLÄDDRARE (PAGER) - Längst ner i mitten */}
        {!isStudent && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-1.5 mr-4 pr-4 border-r border-slate-200/50">
              <span className="text-xl">📖</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bläddra</span>
            </div>
            
            <div className="flex gap-2">
              {pages.map((p, idx) => (
                <div key={p.id} className="relative group">
                  <button
                    onClick={() => setActivePageIndex(idx)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all flex items-center justify-center border-2 ${
                      activePageIndex === idx 
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg scale-110' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                  {pages.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePage(idx); }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  )}
                </div>
              ))}
              
              {pages.length < 6 && (
                <button
                  onClick={addPage}
                  title="Lägg till sida"
                  className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center hover:border-indigo-300 hover:text-indigo-500 transition-all hover:bg-white"
                >
                  ＋
                </button>
              )}
            </div>
          </div>
        )}

        {isBackgroundSettingsOpen && (
          <div className="absolute inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBackgroundSettingsOpen(false)} />
            <div className="relative bg-white/95 backdrop-blur-xl border border-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><span className="text-3xl">🖼️</span> Välj stämning</h3>
                <button onClick={() => setIsBackgroundSettingsOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">✕</button>
              </div>
              <BackgroundSelector current={currentPage.background} onSelect={(bg) => updateCurrentPage({ background: bg })} />
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsBackgroundSettingsOpen(false)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg">Klar</button>
              </div>
            </div>
          </div>
        )}

        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="absolute top-6 left-6 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-2xl z-[999] hover:scale-110 transition-transform animate-in fade-in zoom-in duration-300">🏫</button>
        )}
        
        {activeWidgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10 overflow-y-auto">
            <Dashboard onSelectTool={toggleWidget} studentsCount={students.length} currentBackground={currentPage.background} onBackgroundSelect={(bg) => updateCurrentPage({ background: bg })} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
