
import React, { useState, useEffect, useMemo, useRef } from 'react';

enum TimerMode {
  COUNTDOWN = 'COUNTDOWN',
  STOPWATCH = 'STOPWATCH',
  CLOCK = 'CLOCK',
  TIMETIMER = 'TIMETIMER'
}

type ClockType = 'digital' | 'analog';

const SOUNDS = [
  { id: 'alarm', label: 'Alarm', icon: '⏰', url: 'https://actions.google.com/sounds/v1/alarms/oscillating_beeps.ogg' },
  { id: 'digital', label: 'Digital', icon: '📟', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
  { id: 'bell', label: 'Skolklocka', icon: '🏫', url: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg' },
  { id: 'ding', label: 'Plinn', icon: '✨', url: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
];

const Timer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.COUNTDOWN);
  const [clockType, setClockType] = useState<ClockType>('digital');
  
  // States
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [isEditingSeconds, setIsEditingSeconds] = useState(false);
  const [manualSeconds, setManualSeconds] = useState('');

  const [selectedSound, setSelectedSound] = useState(SOUNDS[0]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmStopTimeoutRef = useRef<number | null>(null);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0 && isActive) {
      playAlarm();
      setIsActive(false);
      
      setTimeout(() => {
        alert('Tiden är ute! 🔔');
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, selectedSound]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (alarmStopTimeoutRef.current) {
        window.clearTimeout(alarmStopTimeoutRef.current);
      }
    };
  }, []);

  const playAlarm = () => {
    if (alarmStopTimeoutRef.current) {
      window.clearTimeout(alarmStopTimeoutRef.current);
    }

    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = selectedSound.url;
        audio.volume = 1.0;
        audio.load();
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Fallback om audioRef-elementet nekas (t.ex. pga webbläsarrestriktioner)
            const fallbackAudio = new Audio(selectedSound.url);
            fallbackAudio.volume = 1.0;
            fallbackAudio.play().catch(e => console.error("Fallback play failed", e));
          });
        }
      } catch (e) {
        console.error("Audio error", e);
      }

      alarmStopTimeoutRef.current = window.setTimeout(() => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }, 5000);
    }
  };

  const previewSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 1.0;
    audio.play().catch(e => console.error("Preview failed", e));
    setTimeout(() => {
      audio.pause();
    }, 5000);
  };

  // Stopwatch Logic
  useEffect(() => {
    let interval: any = null;
    if (stopwatchActive) {
      interval = setInterval(() => setStopwatchSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [stopwatchActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = useMemo(() => 
    initialTime > 0 ? (seconds / initialTime) * 100 : 0
  , [seconds, initialTime]);

  // Granular adjustments
  const adjustTotalTime = (delta: number) => {
    const newTotalSeconds = Math.max(0, seconds + delta);
    setSeconds(newTotalSeconds);
    setInitialTime(newTotalSeconds);
    if (newTotalSeconds === 0) setIsActive(false);
  };

  const handleManualMinutesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualMinutes);
    const currentSeconds = seconds % 60;
    if (!isNaN(val) && val >= 0) {
      const newTotal = (val * 60) + currentSeconds;
      setSeconds(newTotal);
      setInitialTime(newTotal);
      setIsActive(false);
    }
    setIsEditingMinutes(false);
    setManualMinutes('');
  };

  const handleManualSecondsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualSeconds);
    const currentMinutes = Math.floor(seconds / 60);
    if (!isNaN(val) && val >= 0) {
      const newTotal = (currentMinutes * 60) + val;
      setSeconds(newTotal);
      setInitialTime(newTotal);
      setIsActive(false);
    }
    setIsEditingSeconds(false);
    setManualSeconds('');
  };

  // Analog Clock Math
  const hourDeg = (currentTime.getHours() % 12 + currentTime.getMinutes() / 60) * 30;
  const minuteDeg = (currentTime.getMinutes() + currentTime.getSeconds() / 60) * 6;
  const secondDeg = currentTime.getSeconds() * 6;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-white overflow-hidden">
      <audio ref={audioRef} className="hidden" preload="auto" />
      
      {/* Mode Selector */}
      <div className="flex flex-wrap p-1 bg-slate-100 rounded-2xl mb-4 mx-auto w-fit border border-slate-200/50 shrink-0">
        {[
          { id: TimerMode.COUNTDOWN, label: 'Timer', icon: '⏱️' },
          { id: TimerMode.TIMETIMER, label: 'TimeTimer', icon: '⭕' },
          { id: TimerMode.STOPWATCH, label: 'Stoppur', icon: '⏱️' },
          { id: TimerMode.CLOCK, label: 'Klocka', icon: '🕒' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setIsActive(false); }}
            className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all ${
              mode === m.id 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{m.icon}</span>
            <span className="inline">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative px-2 md:px-4">
        
        {/* LÄGE: NEDRÄKNING */}
        {mode === TimerMode.COUNTDOWN && (
          <div className="flex flex-col items-center w-full max-h-full animate-in zoom-in-95 duration-300">
            <div className="relative w-32 h-32 xs:w-40 xs:h-40 md:w-52 md:h-52 mb-4 shrink min-h-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="42%" stroke="#f1f5f9" strokeWidth="6%" fill="transparent" />
                <circle
                  cx="50%" cy="50%" r="42%" stroke="url(#timerGradient)" strokeWidth="8%" fill="transparent"
                  strokeDasharray="264%"
                  strokeDashoffset={`${264 - (percentage / 100) * 264}%`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl md:text-5xl font-black text-slate-800 tabular-nums tracking-tight">
                  {formatTime(seconds)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* LÄGE: TIMETIMER */}
        {mode === TimerMode.TIMETIMER && (
          <div className="flex flex-col items-center w-full max-h-full animate-in zoom-in-95 duration-300">
            <div className="relative w-40 h-40 md:w-60 md:h-60 rounded-full border-[10px] border-slate-800 bg-white shadow-xl mb-4 overflow-hidden shrink min-h-0">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute left-1/2 top-0 w-1 h-3 md:h-5 bg-slate-300 origin-[0_80px] md:origin-[0_120px]"
                  style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
                />
              ))}
              <div 
                className="absolute inset-0 transition-all duration-1000 ease-linear"
                style={{ 
                  background: `conic-gradient(#f43f5e ${percentage}%, transparent 0deg)`,
                  transform: 'rotate(0deg)'
                }}
              />
              <div className="absolute inset-0 m-auto w-3 h-3 bg-slate-800 rounded-full z-10 shadow-lg border-2 border-white" />
            </div>
            <div className="text-3xl font-black text-slate-800 mb-2 tabular-nums">{formatTime(seconds)}</div>
          </div>
        )}

        {/* LÄGE: STOPPUR */}
        {mode === TimerMode.STOPWATCH && (
          <div className="flex flex-col items-center justify-center w-full animate-in slide-in-from-bottom-4 py-4">
            <div className="text-6xl md:text-8xl font-black text-slate-800 tabular-nums tracking-tighter mb-8">
              {formatTime(stopwatchSeconds)}
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={() => setStopwatchActive(!stopwatchActive)}
                className={`flex-[2] py-4 rounded-3xl font-bold text-lg transition-all shadow-xl ${
                  stopwatchActive ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                {stopwatchActive ? 'Pausa' : 'Starta'}
              </button>
              <button
                onClick={() => { setStopwatchActive(false); setStopwatchSeconds(0); }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-3xl font-bold text-lg hover:bg-slate-200"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* LÄGE: KLOCKA */}
        {mode === TimerMode.CLOCK && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in duration-700 px-2">
            <div className="flex bg-slate-50 p-1 rounded-xl mb-4 border border-slate-100 shrink-0">
              <button onClick={() => setClockType('digital')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${clockType === 'digital' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Digital</button>
              <button onClick={() => setClockType('analog')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${clockType === 'analog' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Analog</button>
            </div>

            <div className="flex-1 flex items-center justify-center w-full min-h-0">
              {clockType === 'digital' ? (
                <div className="text-center">
                  <div className="text-6xl md:text-8xl font-black text-slate-800 tabular-nums tracking-tighter leading-none">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-indigo-500 mt-2 bg-indigo-50 inline-block px-4 py-1 rounded-full">
                    {currentTime.toLocaleTimeString([], { second: '2-digit' })}
                  </div>
                </div>
              ) : (
                <div className="relative w-48 h-48 md:w-72 md:h-72 bg-white rounded-full border-[8px] border-slate-800 shadow-xl shrink min-h-0">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute left-1/2 top-2 w-0.5 md:w-1 h-3 md:h-5 bg-slate-300 origin-[0_88px] md:origin-[0_136px]"
                      style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
                    />
                  ))}
                  <div className="absolute left-1/2 bottom-1/2 w-1.5 h-[28%] bg-slate-800 rounded-full origin-bottom" style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)`, zIndex: 10 }} />
                  <div className="absolute left-1/2 bottom-1/2 w-1 h-[38%] bg-slate-600 rounded-full origin-bottom" style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)`, zIndex: 9 }} />
                  <div className="absolute left-1/2 bottom-1/2 w-0.5 h-[42%] bg-rose-500 rounded-full origin-bottom" style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)`, zIndex: 11 }} />
                  <div className="absolute inset-0 m-auto w-3 h-3 bg-slate-800 border-2 border-white rounded-full z-20 shadow-sm" />
                </div>
              )}
            </div>
            <div className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-4">
              {currentTime.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        )}
      </div>

      {/* Controls Area */}
      {(mode === TimerMode.COUNTDOWN || mode === TimerMode.TIMETIMER) && (
        <div className="mt-auto px-4 md:px-6 pb-6 space-y-4 shrink-0 bg-slate-50/50 rounded-t-[2rem] md:rounded-t-[2.5rem] pt-6 border-t border-slate-100">
          
          {/* Detailed Adjustment Row */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            
            {/* Minutes Column */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => adjustTotalTime(-60)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all shadow-sm"
                >
                  -
                </button>
                {isEditingMinutes ? (
                  <form onSubmit={handleManualMinutesSubmit}>
                    <input
                      autoFocus
                      type="number"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      onBlur={handleManualMinutesSubmit}
                      className="w-12 md:w-16 text-center bg-white border-2 border-indigo-400 rounded-xl px-1 py-1 text-base md:text-lg font-black text-indigo-600 outline-none tabular-nums"
                    />
                  </form>
                ) : (
                  <div 
                    onClick={() => { setManualMinutes(Math.floor(seconds / 60).toString()); setIsEditingMinutes(true); }}
                    className="flex flex-col items-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-xl transition-colors"
                  >
                    <span className="text-xl md:text-2xl font-black text-slate-800 leading-none tabular-nums">
                      {Math.floor(seconds / 60)}
                    </span>
                  </div>
                )}
                <button 
                  onClick={() => adjustTotalTime(60)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all shadow-sm"
                >
                  +
                </button>
              </div>
              <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest">Minuter</span>
            </div>

            <span className="text-xl md:text-2xl font-black text-slate-300 pb-4">:</span>

            {/* Seconds Column */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => adjustTotalTime(-10)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all shadow-sm"
                >
                  -
                </button>
                {isEditingSeconds ? (
                  <form onSubmit={handleManualSecondsSubmit}>
                    <input
                      autoFocus
                      type="number"
                      value={manualSeconds}
                      onChange={(e) => setManualSeconds(e.target.value)}
                      onBlur={handleManualSecondsSubmit}
                      className="w-12 md:w-16 text-center bg-white border-2 border-indigo-400 rounded-xl px-1 py-1 text-base md:text-lg font-black text-indigo-600 outline-none tabular-nums"
                    />
                  </form>
                ) : (
                  <div 
                    onClick={() => { setManualSeconds((seconds % 60).toString()); setIsEditingSeconds(true); }}
                    className="flex flex-col items-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-xl transition-colors"
                  >
                    <span className="text-xl md:text-2xl font-black text-slate-800 leading-none tabular-nums">
                      {Math.floor(seconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                <button 
                  onClick={() => adjustTotalTime(10)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all shadow-sm"
                >
                  +
                </button>
              </div>
              <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest">Sekunder</span>
            </div>
          </div>

          <div className="flex gap-2 max-w-sm mx-auto">
            <button
              onClick={() => setIsActive(!isActive)}
              disabled={seconds === 0}
              className={`flex-[2] py-3 md:py-4 rounded-2xl font-black text-base md:text-lg transition-all shadow-xl ${
                isActive 
                  ? 'bg-amber-100 text-amber-600 border border-amber-200' 
                  : seconds === 0 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : mode === TimerMode.TIMETIMER 
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isActive ? 'Pausa' : 'Starta'}
            </button>
            <button
              onClick={() => { setIsActive(false); setSeconds(initialTime); }}
              className="flex-1 py-3 md:py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold text-base md:text-lg hover:bg-slate-50 transition-all"
            >
              Reset
            </button>
          </div>

          {/* Sound Selector */}
          <div className="space-y-2 max-w-sm mx-auto">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Ljudsignal</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SOUNDS.map(s => (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => setSelectedSound(s)}
                    className={`w-full py-2 rounded-xl text-[9px] font-bold flex flex-col items-center gap-1 transition-all border ${
                      selectedSound.id === s.id 
                        ? 'bg-white border-indigo-400 text-indigo-600 shadow-sm' 
                        : 'bg-white/50 border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="truncate w-full text-center px-1">{s.label}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); previewSound(s.url); }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Provlyssna"
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick options */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5 max-w-sm mx-auto">
            {[5, 10, 15, 20, 30, 45, 60].map(m => (
              <button
                key={m}
                onClick={() => {
                  setSeconds(m * 60);
                  setInitialTime(m * 60);
                  setIsActive(false);
                }}
                className={`py-1.5 bg-white border rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all active:scale-95 ${
                  Math.floor(seconds / 60) === m && seconds % 60 === 0
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50' 
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
