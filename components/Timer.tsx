
import React, { useState, useEffect, useRef } from 'react';

enum TimerMode {
  COUNTDOWN = 'COUNTDOWN',
  STOPWATCH = 'STOPWATCH',
  CLOCK = 'CLOCK'
}

const Timer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.COUNTDOWN);
  
  // Countdown states
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  
  // Stopwatch states
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  
  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time for the clock mode
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      // Simple notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Klassrumsytan: Tiden är ute! 🔔');
      } else {
        alert('Tiden är ute! 🔔');
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Stopwatch logic
  useEffect(() => {
    let interval: any = null;
    if (stopwatchActive) {
      interval = setInterval(() => {
        setStopwatchSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [stopwatchActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown controls
  const setCountdownTime = (mins: number) => {
    const total = mins * 60;
    setSeconds(total);
    setInitialTime(total);
    setIsActive(false);
  };

  const addTime = (mins: number) => {
    setSeconds(prev => prev + mins * 60);
    if (initialTime === 0 || !isActive) {
        setInitialTime(prev => prev + mins * 60);
    }
  };

  const toggleCountdown = () => setIsActive(!isActive);
  const resetCountdown = () => {
    setSeconds(initialTime);
    setIsActive(false);
  };

  // Circular progress calculation - More compact radius
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const offset = initialTime > 0 ? circumference - (seconds / initialTime) * circumference : circumference;

  return (
    <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
      {/* Mode Switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
        {Object.values(TimerMode).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === m 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {m === TimerMode.COUNTDOWN ? 'Nedräkning' : m === TimerMode.STOPWATCH ? 'Stoppur' : 'Klocka'}
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center relative overflow-hidden">
        
        {mode === TimerMode.COUNTDOWN && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <h2 className="text-slate-400 font-medium uppercase tracking-widest text-[10px] mb-4">Arbetspass</h2>
            
            <div className="relative flex items-center justify-center mb-6">
              {/* SVG Visual Timer - Reduced size */}
              <svg className="w-48 h-48 md:w-56 md:h-56 transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset: isNaN(offset) ? 0 : offset }}
                  strokeLinecap="round"
                  className="text-indigo-600 transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-black text-slate-800 tabular-nums">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 w-full mb-6">
              <button
                onClick={toggleCountdown}
                className={`px-8 py-3 rounded-2xl font-bold text-base transition-all shadow-lg ${
                  isActive 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-amber-100' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                {isActive ? 'Pausa' : 'Starta'}
              </button>
              <button
                onClick={resetCountdown}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-base hover:bg-slate-200 transition-all"
              >
                Återställ
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => addTime(1)}
                className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-100 border border-indigo-100 transition-all text-[10px]"
              >
                +1 min
              </button>
              <button 
                onClick={() => addTime(5)}
                className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-100 border border-indigo-100 transition-all text-[10px]"
              >
                +5 min
              </button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 w-full pt-4 border-t border-slate-50">
              {[2, 5, 10, 15, 20, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setCountdownTime(m)}
                  className="py-1.5 px-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all"
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === TimerMode.STOPWATCH && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300 py-4">
            <h2 className="text-slate-400 font-medium uppercase tracking-widest text-[10px] mb-8">Stoppur</h2>
            
            <div className="text-6xl md:text-7xl font-black text-slate-800 tabular-nums mb-10">
              {formatTime(stopwatchSeconds)}
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button
                onClick={() => setStopwatchActive(!stopwatchActive)}
                className={`flex-1 py-3 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                  stopwatchActive 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-red-50' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                }`}
              >
                {stopwatchActive ? 'Stoppa' : 'Starta'}
              </button>
              <button
                onClick={() => {
                  setStopwatchActive(false);
                  setStopwatchSeconds(0);
                }}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
              >
                Återställ
              </button>
            </div>
          </div>
        )}

        {mode === TimerMode.CLOCK && (
          <div className="w-full flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-slate-400 font-medium uppercase tracking-widest text-[10px] mb-4">Aktuell tid</h2>
            <div className="text-5xl md:text-7xl font-black text-slate-800 tabular-nums tracking-tighter leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <span className="text-2xl md:text-3xl text-indigo-400 font-medium ml-2">
                {currentTime.toLocaleTimeString([], { second: '2-digit' })}
              </span>
            </div>
            <div className="mt-4 text-lg text-slate-400 font-medium">
              {currentTime.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        )}

      </div>
      
      <p className="text-slate-400 text-[10px] font-medium text-center">
        {mode === TimerMode.COUNTDOWN && "Ställ in en tid för att starta nedräkningen."}
        {mode === TimerMode.STOPWATCH && "Använd stoppuret för att mäta tidsåtgång."}
        {mode === TimerMode.CLOCK && "Hjälp klassen att hålla koll på tiden."}
      </p>
    </div>
  );
};

export default Timer;
