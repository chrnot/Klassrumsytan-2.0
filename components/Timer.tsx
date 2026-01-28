
import React, { useState, useEffect, useRef } from 'react';

enum TimerMode {
  COUNTDOWN = 'COUNTDOWN',
  STOPWATCH = 'STOPWATCH',
  CLOCK = 'CLOCK'
}

type ClockType = 'digital' | 'analog';

const Timer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.COUNTDOWN);
  const [clockType, setClockType] = useState<ClockType>('digital');
  
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

  // Circular progress calculation
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const offset = initialTime > 0 ? circumference - (seconds / initialTime) * circumference : circumference;

  // Analog Clock Calculations
  const now = currentTime;
  const s = now.getSeconds();
  const m = now.getMinutes();
  const h = now.getHours();

  const secondDeg = (s / 60) * 360;
  const minuteDeg = (m / 60) * 360 + (s / 60) * 6;
  const hourDeg = ((h % 12) / 12) * 360 + (m / 60) * 30;

  return (
    <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
      {/* Mode Switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit shrink-0">
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

      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center relative overflow-hidden flex-1 min-h-0">
        
        {mode === TimerMode.COUNTDOWN && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <h2 className="text-slate-400 font-medium uppercase tracking-widest text-[10px] mb-4">Arbetspass</h2>
            
            <div className="relative flex items-center justify-center mb-6">
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
              <button onClick={() => addTime(1)} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-100 border border-indigo-100 transition-all text-[10px]">+1 min</button>
              <button onClick={() => addTime(5)} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-100 border border-indigo-100 transition-all text-[10px]">+5 min</button>
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
          <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            {/* Clock Type Toggle */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 mb-8 shrink-0">
              <button
                onClick={() => setClockType('digital')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  clockType === 'digital' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                Digital
              </button>
              <button
                onClick={() => setClockType('analog')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  clockType === 'analog' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                Analog
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {clockType === 'digital' ? (
                <div className="flex flex-col items-center justify-center">
                  <h2 className="text-slate-400 font-medium uppercase tracking-widest text-[10px] mb-4">Aktuell tid</h2>
                  <div className="text-6xl md:text-8xl font-black text-slate-800 tabular-nums tracking-tighter leading-none">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <span className="text-3xl md:text-4xl text-indigo-400 font-medium ml-2">
                      {currentTime.toLocaleTimeString([], { second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Analog Clock Face */}
                  <div className="absolute inset-0 rounded-full border-[10px] border-slate-800 bg-white shadow-2xl flex items-center justify-center">
                    {/* Tick Marks */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-3 md:h-4 bg-slate-300 rounded-full"
                        style={{
                          transform: `rotate(${i * 30}deg) translateY(-${120}px)`,
                          transformOrigin: '50% 50%',
                        }}
                      />
                    ))}
                    {/* Hour Hand */}
                    <div 
                      className="absolute w-2 h-20 md:h-24 bg-slate-800 rounded-full shadow-sm"
                      style={{ 
                        transform: `rotate(${hourDeg}deg) translateY(-40%)`,
                        transformOrigin: '50% 100%',
                        zIndex: 10 
                      }}
                    />
                    {/* Minute Hand */}
                    <div 
                      className="absolute w-1.5 h-28 md:h-32 bg-slate-600 rounded-full shadow-sm"
                      style={{ 
                        transform: `rotate(${minuteDeg}deg) translateY(-45%)`,
                        transformOrigin: '50% 100%',
                        zIndex: 9 
                      }}
                    />
                    {/* Second Hand */}
                    <div 
                      className="absolute w-0.5 h-32 md:h-36 bg-rose-500 rounded-full"
                      style={{ 
                        transform: `rotate(${secondDeg}deg) translateY(-50%)`,
                        transformOrigin: '50% 100%',
                        zIndex: 11 
                      }}
                    />
                    {/* Center Point */}
                    <div className="absolute w-4 h-4 bg-slate-800 rounded-full z-20 border-4 border-white shadow-sm" />
                  </div>
                </div>
              )}
              
              <div className="mt-8 text-lg text-slate-400 font-medium shrink-0">
                {currentTime.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        )}

      </div>
      
      <p className="text-slate-400 text-[10px] font-medium text-center shrink-0">
        {mode === TimerMode.COUNTDOWN && "Ställ in en tid för att starta nedräkningen."}
        {mode === TimerMode.STOPWATCH && "Använd stoppuret för att mäta tidsåtgång."}
        {mode === TimerMode.CLOCK && "Hjälp klassen att hålla koll på tiden."}
      </p>
    </div>
  );
};

export default Timer;
