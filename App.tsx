
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ToolType, Student, PlacementStudent, WidgetInstance, PageData } from './types';
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
import VideoPlayer from './components/VideoPlayer';
import QuickLinks from './components/QuickLinks';
import LinkWidget from './components/LinkWidget';
import ClassroomPlacement from './components/ClassroomPlacement';
import LessonNavigator from './components/LessonNavigator';

const App: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const pollIdFromUrl = queryParams.get('join');
  const isStudent = !!pollIdFromUrl;

  // --- TILLSTÅND ---
  const [pages, setPages] = useState<PageData[]>(() => {
    const saved = localStorage.getItem('kp_pages_v2');
    if (saved) return JSON.parse(saved);
    return [{
      id: Math.random().toString(36).substr(2, 9),
      name: 'Sida 1',
      background: 'bg-slate-100',
      widgets: []
    }];
  });
  
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isStudent && window.innerWidth > 1024);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  
  const [students, setStudents] = useState<PlacementStudent[]>(() => {
    const saved = localStorage.getItem('kp_students_v3');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [maxZIndex, setMaxZIndex] = useState(200);

  const currentPage = pages[activePageIndex] || pages[0];
  const activeWidgets = currentPage.widgets.filter(w => w.isOpen);
  const openWidgetTypes = [...new Set(activeWidgets.map(w => w.type))];

  useEffect(() => {
    if (!isStudent) {
      localStorage.setItem('kp_pages_v2', JSON.stringify(pages));
      localStorage.setItem('kp_students_v3', JSON.stringify(students));
    }
  }, [pages, students, isStudent]);

  const updateCurrentPage = useCallback((updates: Partial<PageData>) => {
    setPages(prev => prev.map((p, i) => i === activePageIndex ? { ...p, ...updates } : p));
  }, [activePageIndex]);

  const getInitialDimensions = (type: ToolType) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return { width: window.innerWidth, height: window.innerHeight };
    switch (type) {
      case ToolType.TIMER: return { width: 450, height: 680 };
      case ToolType.RANDOMIZER: return { width: 600, height: 600 };
      case ToolType.POLLING: return { width: 850, height: 750 };
      case ToolType.ASSISTANT: return { width: 500, height: 750 };
      case ToolType.NOISE_METER: return { width: 500, height: 700 };
      case ToolType.TRAFFIC_LIGHT: return { width: 500, height: 700 };
      case ToolType.CHECKLIST: return { width: 550, height: 750 };
      case ToolType.GROUPING: return { width: 750, height: 750 };
      case ToolType.VIDEO_PLAYER: return { width: 800, height: 600 };
      case ToolType.QUICK_LINKS: return { width: 400, height: 650 };
      case ToolType.PLACEMENT: return { width: 1100, height: 850 };
      case ToolType.LINK: return { width: 220, height: 220 };
      case ToolType.LESSON_NAVIGATOR: return { width: 750, height: 750 };
      default: return { width: 700, height: 750 };
    }
  };

  const toolDescriptions: Record<ToolType, string> = {
    [ToolType.TIMER]: "Sätt en tidsgräns för lektionsmoment. Välj mellan klassisk nedräkning, TimeTimer för visuell tid, eller ett vanligt stoppur.",
    [ToolType.RANDOMIZER]: "Välj en slumpmässig elev på ett rättvist sätt. Du kan hantera klasslistan direkt i verktyget eller massimportera namn.",
    [ToolType.POLLING]: "Låt eleverna rösta live via sina egna enheter. Perfekt för att stämma av förståelse eller göra snabba omröstningar.",
    [ToolType.ASSISTANT]: "Din pedagogiska AI-assistent. Få förslag på 5-minutersaktiviteter, mattegåtor eller diskussionsfrågor via text eller röst.",
    [ToolType.NOISE_METER]: "Visar ljudnivån i klassrummet i realtid. Om det blir för högt hörs en varningssignal för att hjälpa eleverna reglera volymen.",
    [ToolType.TRAFFIC_LIGHT]: "Kommunicera visuellt vad som förväntas. Redigera texterna för att passa din lektion och använd 'Fokusläge' för att visa stort på tavlan.",
    [ToolType.GROUPING]: "Dela in klassen i slumpmässiga grupper. Du kan redigera grupperna i efterhand och visa resultatet stort på tavlan.",
    [ToolType.CHECKLIST]: "Gör lektionsplaneringen tydlig. Lägg till moment, sätt timers och använd 'Fokusläge' för att markera vad klassen jobbar med just nu.",
    [ToolType.WHITEBOARD]: "En rityta med stöd för olika pappersmönster som matterutor och linjer. Perfekt för snabba förklaringar eller genomgångar.",
    [ToolType.IMAGE_ANNOTATOR]: "Ladda upp en bild och rita direkt ovanpå den. Användbart för att gå igenom texter, kartor eller diagram tillsammans.",
    [ToolType.QR_CODE]: "Skapa en QR-kod från vilken länk som helst. Eleverna kan sedan enkelt skanna koden med sina enheter för att besöka webbplatsen.",
    [ToolType.VIDEO_PLAYER]: "Spela YouTube-videor utan distraktioner. Klistra in en länk så bäddas videon in snyggt på din arbetsyta.",
    [ToolType.QUICK_LINKS]: "Hanterare för genvägar. Skapa fristående små fönster för de webbplatser du vill att eleverna ska ha nära till hands.",
    [ToolType.PLACEMENT]: "Verktyg för att planera klassrummets möblering och placering. Algoritmen hjälper dig att placera eleverna utifrån dina pedagogiska regler.",
    [ToolType.LESSON_NAVIGATOR]: "Lektions-Navigatören hjälper dig att strukturera lektionen visuellt. Sätt upp mål, lista centrala begrepp och följ lektionens olika moment på en tydlig tidslinje för att ge eleverna lugn och förutsägbarhet.",
    [ToolType.LINK]: "En snabbknapp som öppnar en specifik webbplats i en ny flik.",
    [ToolType.DASHBOARD]: "",
    [ToolType.BACKGROUND]: "",
    [ToolType.MATTEYTAN]: "",
    [ToolType.ARRANGE]: ""
  };

  const toggleWidget = useCallback((type: ToolType) => {
    if (type === ToolType.LINK) return;

    const existing = currentPage.widgets.find(w => w.type === type);
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);

    if (existing) {
      updateCurrentPage({ 
        widgets: currentPage.widgets.map(w => w.type === type ? { ...w, isOpen: !w.isOpen, zIndex: newZ } : w) 
      });
    } else {
      const { width, height } = getInitialDimensions(type);
      const pos = { x: (window.innerWidth - width) / 2, y: (window.innerHeight - height) / 2 };
      
      updateCurrentPage({ 
        widgets: [...currentPage.widgets, { 
          id: Math.random().toString(36).substr(2, 9), 
          type, x: pos.x, y: pos.y, zIndex: newZ, 
          isOpen: true, width, height 
        }] 
      });
    }
  }, [currentPage, maxZIndex, updateCurrentPage]);

  const addLinkWidget = useCallback((url: string, title: string) => {
    const currentLinks = currentPage.widgets.filter(w => w.type === ToolType.LINK && w.isOpen);
    if (currentLinks.length >= 5) {
      alert("Max 5 fristående länkar per sida tillåtna.");
      return;
    }

    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    const { width, height } = getInitialDimensions(ToolType.LINK);
    const offset = currentLinks.length * 30;
    const pos = { x: 100 + offset, y: 100 + offset };

    updateCurrentPage({ 
      widgets: [...currentPage.widgets, { 
        id: Math.random().toString(36).substr(2, 9), 
        type: ToolType.LINK, 
        x: pos.x, y: pos.y, zIndex: newZ, 
        isOpen: true, width, height,
        data: { url, title }
      }] 
    });
  }, [currentPage, maxZIndex, updateCurrentPage]);

  const arrangeWidgets = useCallback(() => {
    const active = currentPage.widgets.filter(w => w.isOpen);
    if (active.length === 0) return;
    const sidebarWidth = isSidebarOpen ? 288 : 0;
    const padding = 40;
    const availW = window.innerWidth - sidebarWidth - (padding * 2);
    const availH = window.innerHeight - (padding * 2);
    const cols = active.length > 4 ? 3 : active.length > 1 ? 2 : 1;
    const rows = Math.ceil(active.length / cols);
    const cellW = availW / cols;
    const cellH = availH / rows;

    updateCurrentPage({
      widgets: currentPage.widgets.map(w => {
        if (!w.isOpen) return w;
        const idx = active.findIndex(aw => aw.id === w.id);
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const dims = getInitialDimensions(w.type);
        const targetW = Math.min(w.width || dims.width, cellW - 30);
        const targetH = Math.min(w.height || dims.height, cellH - 30);
        return { 
          ...w, 
          x: sidebarWidth + padding + (col * cellW) + (cellW - targetW) / 2, 
          y: padding + (row * cellH) + (cellH - targetH) / 2, 
          width: targetW, height: targetH 
        };
      })
    });
  }, [currentPage, isSidebarOpen, updateCurrentPage]);

  const clearWorkspace = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (window.confirm("Vill du stänga alla verktyg på denna sida?")) {
      const targetPageId = currentPage.id;
      setPages(prev => prev.map(p => p.id === targetPageId ? { ...p, widgets: [] } : p));
      setIsSystemMenuOpen(false);
      setMaxZIndex(200);
    }
  };

  const updateWidgetPosition = (id: string, x: number, y: number) => {
    updateCurrentPage({ widgets: currentPage.widgets.map(w => w.id === id ? { ...w, x, y } : w) });
  };

  const updateWidgetSize = (id: string, width: number, height: number) => {
    updateCurrentPage({ widgets: currentPage.widgets.map(w => w.id === id ? { ...w, width, height } : w) });
  };

  const focusWidget = (id: string) => {
    const target = currentPage.widgets.find(w => w.id === id);
    if (!target || target.zIndex === maxZIndex) return;
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    updateCurrentPage({ widgets: currentPage.widgets.map(w => w.id === id ? { ...w, zIndex: newZ } : w) });
  };

  const closeWidget = (id: string) => {
    updateCurrentPage({ widgets: currentPage.widgets.map(z => z.id === id ? { ...z, isOpen: false } : z) });
  };

  const getWidgetComponent = (widget: WidgetInstance) => {
    switch (widget.type) {
      case ToolType.TIMER: return <Timer />;
      case ToolType.RANDOMIZER: return <Randomizer students={students} setStudents={setStudents} />;
      case ToolType.POLLING: return <PollingTool />;
      case ToolType.ASSISTANT: return <GeminiAssistant />;
      case ToolType.NOISE_METER: return <NoiseMeter />;
      case ToolType.TRAFFIC_LIGHT: return <TrafficLight />;
      case ToolType.GROUPING: return <GroupingTool students={students} onResize={(w, h) => updateWidgetSize(widget.id, w, h)} />;
      case ToolType.CHECKLIST: return <SmartChecklist />;
      case ToolType.WHITEBOARD: return <Whiteboard />;
      case ToolType.IMAGE_ANNOTATOR: return <ImageAnnotator />;
      case ToolType.QR_CODE: return <QRCodeWidget />;
      case ToolType.VIDEO_PLAYER: return <VideoPlayer />;
      case ToolType.QUICK_LINKS: 
        return <QuickLinks 
          onAddLink={addLinkWidget} 
          existingLinksCount={currentPage.widgets.filter(w => w.type === ToolType.LINK && w.isOpen).length} 
        />;
      case ToolType.PLACEMENT: return <ClassroomPlacement students={students} setStudents={setStudents} />;
      case ToolType.LINK: return <LinkWidget url={widget.data?.url} title={widget.data?.title} />;
      case ToolType.LESSON_NAVIGATOR: return <LessonNavigator />;
      default: return null;
    }
  };

  const metaData: Record<string, { title: string, icon: string }> = {
    [ToolType.TIMER]: { title: 'Timer', icon: '⏱️' },
    [ToolType.RANDOMIZER]: { title: 'Slumpa', icon: '🎲' },
    [ToolType.POLLING]: { title: 'Omröstning', icon: '📊' },
    [ToolType.ASSISTANT]: { title: 'AI-Aktivitet', icon: '✨' },
    [ToolType.NOISE_METER]: { title: 'Ljudmätare', icon: '🔊' },
    [ToolType.TRAFFIC_LIGHT]: { title: 'Trafikljus', icon: '🚦' },
    [ToolType.GROUPING]: { title: 'Gruppering', icon: '👥' },
    [ToolType.CHECKLIST]: { title: 'Arbetsgång', icon: '✅' },
    [ToolType.WHITEBOARD]: { title: 'Whiteboard', icon: '🎨' },
    [ToolType.IMAGE_ANNOTATOR]: { title: 'Bild-rita', icon: '📸' },
    [ToolType.QR_CODE]: { title: 'QR-Kod', icon: '📱' },
    [ToolType.VIDEO_PLAYER]: { title: 'Video', icon: '🎬' },
    [ToolType.QUICK_LINKS]: { title: 'Genvägar', icon: '🔗' },
    [ToolType.PLACEMENT]: { title: 'Klassplacering', icon: '🪑' },
    [ToolType.LESSON_NAVIGATOR]: { title: 'Lektions-Navigatör', icon: '🧭' },
    [ToolType.LINK]: { title: 'Länk', icon: '🔗' }
  };

  if (isStudent && pollIdFromUrl) return <StudentPollView pollId={pollIdFromUrl} />;

  const isImageUrl = currentPage.background.startsWith('http') || currentPage.background.startsWith('data:image');
  const isColorHex = currentPage.background.startsWith('#');

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden transition-all duration-700 ${currentPage.background.includes('bg-') ? currentPage.background : ''}`} 
      style={{ 
        backgroundColor: isColorHex ? currentPage.background : undefined,
        backgroundImage: isImageUrl ? `url("${currentPage.background}")` : undefined,
        backgroundSize: isImageUrl ? 'cover' : undefined,
        backgroundPosition: isImageUrl ? 'center' : undefined,
      }}
    >
      {isSidebarOpen && (
        <div className="fixed inset-0 lg:relative lg:inset-auto w-full md:w-72 z-[100000] animate-in slide-in-from-left duration-300">
          <Sidebar activeTool={null} onSelectTool={(t) => { t === ToolType.MATTEYTAN ? window.open('https://matteytan.se/', '_blank') : toggleWidget(t); setIsSidebarOpen(false); }} onClose={() => setIsSidebarOpen(false)} openWidgets={openWidgetTypes} />
        </div>
      )}

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {!isStudent && (
          <div className="absolute top-6 left-6 w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-2xl z-[99999] hover:scale-110 transition-transform cursor-pointer" onClick={() => setIsSidebarOpen(true)}>🏫</div>
        )}

        {/* Widget layer */}
        <div key={currentPage.id} className="absolute inset-0 z-10 pointer-events-none">
          {activeWidgets.map((w) => (
            <div key={w.id} className="pointer-events-auto">
              <WidgetFrame
                title={w.type === ToolType.LINK ? (w.data?.title || 'Länk') : (metaData[w.type]?.title || 'Verktyg')} 
                icon={w.type === ToolType.LINK ? '🔗' : (metaData[w.type]?.icon || '⚙️')} 
                description={toolDescriptions[w.type]}
                x={w.x} y={w.y} zIndex={w.zIndex} initialWidth={w.width} initialHeight={w.height}
                onMove={(nx, ny) => updateWidgetPosition(w.id, nx, ny)}
                onResize={(nw, nh) => updateWidgetSize(w.id, nw, nh)}
                onFocus={() => focusWidget(w.id)}
                onClose={() => closeWidget(w.id)}
              >
                {getWidgetComponent(w)}
              </WidgetFrame>
            </div>
          ))}
        </div>

        {/* System & Options Controls */}
        {!isStudent && (
          <div className="absolute top-6 right-6 z-[99999] flex items-start gap-3">
            <button onClick={arrangeWidgets} title="Ordna fönster" className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all border border-white">🧩</button>
            <div className="flex flex-col gap-2 items-end">
              <button onClick={() => setIsSystemMenuOpen(!isSystemMenuOpen)} className={`w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all border border-white ${isSystemMenuOpen ? 'ring-2 ring-indigo-500' : ''}`}>⚙️</button>
              {isSystemMenuOpen && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300">
                  <button onClick={clearWorkspace} className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white group">
                    <span className="text-xl">🧹</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 group-hover:text-red-500 mt-0.5">Rensa</span>
                  </button>
                  <button onClick={() => { toggleWidget(ToolType.QUICK_LINKS); setIsSystemMenuOpen(false); }} className={`w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white group ${openWidgetTypes.includes(ToolType.QUICK_LINKS) ? 'ring-2 ring-indigo-500' : ''}`}>
                    <span className="text-xl">🔗</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 group-hover:text-indigo-500 mt-0.5">Länkar</span>
                  </button>
                  <button onClick={() => { toggleWidget(ToolType.NOISE_METER); setIsSystemMenuOpen(false); }} className={`w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white group ${openWidgetTypes.includes(ToolType.NOISE_METER) ? 'ring-2 ring-indigo-500' : ''}`}>
                    <span className="text-xl">🔊</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 group-hover:text-indigo-500 mt-0.5">Ljud</span>
                  </button>
                  <button onClick={() => { setIsBackgroundSettingsOpen(true); setIsSystemMenuOpen(false); }} className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white group">
                    <span className="text-xl">🖼️</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 group-hover:text-indigo-500 mt-0.5">Miljö</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Page Navigation */}
        {!isStudent && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/50 animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex gap-3">
              {pages.map((p, idx) => (
                <div key={p.id} className="relative group">
                  <button onClick={() => setActivePageIndex(idx)} className={`w-12 h-12 rounded-2xl font-black transition-all flex items-center justify-center border-2 ${activePageIndex === idx ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl scale-110' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'}`}>{idx + 1}</button>
                  {pages.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); setPages(prev => prev.filter((_, i) => i !== idx)); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">✕</button>
                  )}
                </div>
              ))}
              {pages.length < 6 && (
                <button onClick={() => { const newP = { id: Math.random().toString(36).substr(2, 9), name: `Sida ${pages.length + 1}`, background: 'bg-slate-100', widgets: [] }; setPages([...pages, newP]); setActivePageIndex(pages.length); }} className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 flex items-center justify-center hover:border-indigo-300 hover:text-indigo-500 transition-all">＋</button>
              )}
            </div>
          </div>
        )}

        {isBackgroundSettingsOpen && (
          <div className="absolute inset-0 z-[1000000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBackgroundSettingsOpen(false)} />
            <div className="relative bg-white/95 backdrop-blur-xl border border-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><span className="text-3xl">🖼️</span> Välj stämning</h3>
                <button onClick={() => setIsBackgroundSettingsOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">✕</button>
              </div>
              <BackgroundSelector current={currentPage.background} onSelect={(bg) => updateCurrentPage({ background: bg })} />
            </div>
          </div>
        )}
        
        {activeWidgets.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4 md:p-10 overflow-y-auto">
            <Dashboard onSelectTool={toggleWidget} studentsCount={students.length} currentBackground={currentPage.background} onBackgroundSelect={(bg) => updateCurrentPage({ background: bg })} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
