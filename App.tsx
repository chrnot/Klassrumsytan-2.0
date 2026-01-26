
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToolType, Student, WidgetInstance } from './types';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import Randomizer from './components/Randomizer';
import NoiseMeter from './components/NoiseMeter';
import TrafficLight from './components/TrafficLight';
import GroupingTool from './components/GroupingTool';
import GeminiAssistant from './components/GeminiAssistant';
import InstructionTools from './components/InstructionTools';
import PollingTool from './components/PollingTool';
import WidgetFrame from './components/WidgetFrame';
import BackgroundSelector from './components/BackgroundSelector';

const App: React.FC = () => {
  const [background, setBackground] = useState(() => {
    return localStorage.getItem('kp_background') || 'bg-slate-100';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);

  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    const saved = localStorage.getItem('kp_widgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('kp_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [maxZIndex, setMaxZIndex] = useState(10);

  useEffect(() => {
    localStorage.setItem('kp_widgets', JSON.stringify(widgets));
    localStorage.setItem('kp_background', background);
  }, [widgets, background]);

  useEffect(() => {
    if (widgets.some(w => w.isOpen)) {
      setShowWelcome(false);
    }
  }, []);

  const handleSelectBackground = (bg: string) => {
    setBackground(bg);
    setShowWelcome(false);
    setIsBackgroundSettingsOpen(false);
    setIsSidebarOpen(true);
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    setIsSidebarOpen(false);
  };

  const handleSelectTool = (type: ToolType) => {
    if (type === ToolType.DASHBOARD) {
      clearAll();
    } else if (type === ToolType.BACKGROUND) {
      setIsBackgroundSettingsOpen(true);
      setShowWelcome(false);
    } else if (type === ToolType.MATTEYTAN) {
      window.open('https://matteytan.se/', '_blank');
    } else {
      toggleWidget(type);
    }
  };

  const toggleWidget = (type: ToolType) => {
    const existing = widgets.find(w => w.type === type);
    if (existing) {
      setWidgets(prev => prev.map(w => w.type === type ? { ...w, isOpen: !w.isOpen, zIndex: w.isOpen ? w.zIndex : maxZIndex + 1 } : w));
      if (!existing.isOpen) setMaxZIndex(prev => prev + 1);
    } else {
      const newZ = maxZIndex + 1;
      const newWidget: WidgetInstance = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: 100 + (widgets.length * 40),
        y: 100 + (widgets.length * 20),
        zIndex: newZ,
        isOpen: true,
        width: type === ToolType.INSTRUCTIONS || type === ToolType.POLLING ? 800 : 500
      };
      setWidgets([...widgets, newWidget]);
      setMaxZIndex(newZ);
    }
    setShowWelcome(false);
    setIsBackgroundSettingsOpen(false);
  };

  const moveWidget = useCallback((type: ToolType, x: number, y: number) => {
    setWidgets(prev => prev.map(w => w.type === type ? { ...w, x, y } : w));
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
    setWidgets([]);
    setShowWelcome(true);
    setIsBackgroundSettingsOpen(false);
    setIsSidebarOpen(true);
  };

  const getWidgetConfig = (type: ToolType) => {
    switch (type) {
      case ToolType.TIMER: return { title: 'Timer', icon: '⏱️', component: <Timer /> };
      case ToolType.RANDOMIZER: return { title: 'Slumpa Elev', icon: '🎲', component: <Randomizer students={students} setStudents={setStudents} /> };
      case ToolType.NOISE_METER: return { title: 'Ljudmätare', icon: '🔊', component: <NoiseMeter /> };
      case ToolType.TRAFFIC_LIGHT: return { title: 'Trafikljus', icon: '🚦', component: <TrafficLight /> };
      case ToolType.GROUPING: return { title: 'Gruppering', icon: '👥', component: <GroupingTool students={students} /> };
      case ToolType.ASSISTANT: return { title: 'AI Assistent', icon: '✨', component: <GeminiAssistant /> };
      case ToolType.INSTRUCTIONS: return { title: 'Instruktioner', icon: '📝', component: <InstructionTools /> };
      case ToolType.POLLING: return { title: 'Omröstning', icon: '📊', component: <PollingTool /> };
      default: return null;
    }
  };

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

  return (
    <div 
      className={`flex h-screen overflow-hidden transition-all duration-700 ${backgroundClass}`}
      style={backgroundStyle}
    >
      {(background.includes('url') || background.startsWith('http') || background.startsWith('data:image')) && (
        <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
      )}
      
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-20 md:w-80' : 'w-0 overflow-hidden'}`}>
        <Sidebar 
          activeTool={null} 
          onSelectTool={handleSelectTool} 
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 p-8">
          {widgets.filter(w => w.isOpen).map((w) => {
            const config = getWidgetConfig(w.type);
            if (!config) return null;
            return (
              <WidgetFrame
                key={w.type}
                title={config.title}
                icon={config.icon}
                x={w.x}
                y={w.y}
                zIndex={w.zIndex}
                initialWidth={w.width}
                onMove={(x, y) => moveWidget(w.type, x, y)}
                onFocus={() => focusWidget(w.type)}
                onClose={() => closeWidget(w.type)}
              >
                {config.component}
              </WidgetFrame>
            );
          })}

          {showWelcome && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
               <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] shadow-2xl border border-white/40 max-w-2xl relative">
                 <button 
                   onClick={handleCloseWelcome}
                   className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2 text-xl hover:scale-110 transition-transform"
                   title="Minimera"
                 >
                   ✕
                 </button>
                 <h2 className="text-5xl font-black text-slate-800 mb-4 leading-tight">Välkommen till din <span className="text-indigo-600">arbetsyta!</span></h2>
                 <p className="text-xl text-slate-600 mb-10">Ditt digitala klassrum står redo. Utforska menyn till vänster och klicka på ett verktyg för att börja skräddarsy din lektionstavla.</p>
                 
                 <div className="space-y-6">
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Snabbval: Bakgrund</p>
                   <BackgroundSelector current={background} onSelect={handleSelectBackground} />
                 </div>
               </div>
               <p className="text-slate-500 font-medium">✨ Allt sparas automatiskt i din webbläsare.</p>
            </div>
          )}

          {isBackgroundSettingsOpen && (
            <div className="absolute inset-0 z-[50] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-xl w-full border border-slate-100 relative">
                <button 
                  onClick={() => setIsBackgroundSettingsOpen(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2"
                >
                  ✕
                </button>
                <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className="text-4xl">🖼️</span> Ändra bakgrund
                </h3>
                <BackgroundSelector current={background} onSelect={handleSelectBackground} />
                <p className="mt-8 text-slate-400 text-sm italic">Välj en bild, färg eller ladda upp en egen för att anpassa din yta.</p>
              </div>
            </div>
          )}
        </div>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:bg-indigo-700 hover:scale-110 transition-all z-[9999] border-4 border-white animate-in slide-in-from-right-10"
            title="Öppna meny"
          >
            🏫
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
