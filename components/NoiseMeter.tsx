
import React, { useState, useEffect, useRef } from 'react';

const NoiseMeter: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Cooldown to prevent sound spam
  const lastSoundTimeRef = useRef<number>(0);
  const COOLDOWN_MS = 3000;

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsListening(true);
      updateLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Kunde inte få åtkomst till mikrofonen.');
    }
  };

  const stopListening = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
    setLevel(0);
  };

  const playAlertSound = (type: 'yellow' | 'red') => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current < COOLDOWN_MS) return;
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    
    if (type === 'red') {
      // Powerful double-beep alarm for red
      const playBeep = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, startTime);
        osc.frequency.exponentialRampToValueAtTime(440, startTime + 0.2);
        
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      };

      playBeep(ctx.currentTime);
      playBeep(ctx.currentTime + 0.25); // Second pulse
    } else {
      // Clear, high-pitched "ding" for yellow
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }

    lastSoundTimeRef.current = now;
  };

  const updateLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
    const average = sum / dataArrayRef.current.length;
    
    const currentLevel = Math.min(100, Math.round(average * 1.5));
    setLevel(currentLevel);

    // Alert logic
    if (currentLevel >= 85) {
      playAlertSound('red');
    } else if (currentLevel >= 60) {
      playAlertSound('yellow');
    }

    animationRef.current = requestAnimationFrame(updateLevel);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const getStatus = () => {
    if (level < 30) return { label: 'Tyst', color: 'text-green-500', bar: 'bg-green-500' };
    if (level < 60) return { label: 'Bra', color: 'text-emerald-500', bar: 'bg-emerald-500' };
    if (level < 85) return { label: 'Högt', color: 'text-amber-500', bar: 'bg-amber-500' };
    return { label: 'För högt!', color: 'text-red-500', bar: 'bg-red-500' };
  };

  const status = getStatus();

  return (
    <div className="flex flex-col items-center h-full">
      <div className={`text-xl font-bold mb-4 transition-colors duration-300 ${status.color}`}>
        {isListening ? status.label : 'Inaktiv'}
      </div>

      <div className="relative flex-1 w-full bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-end p-2 min-h-[150px]">
        <div className="absolute top-[15%] left-0 w-full border-t border-red-200 border-dashed z-0"></div>
        <div className="absolute top-[40%] left-0 w-full border-t border-amber-200 border-dashed z-0"></div>
        
        <div 
          className={`w-full transition-all duration-75 ease-out rounded-xl relative z-10 ${status.bar}`}
          style={{ height: `${level}%` }}
        ></div>
      </div>

      <div className="mt-4 w-full">
        {!isListening ? (
          <button
            onClick={startListening}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Starta mätning
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition-all"
          >
            Stoppa
          </button>
        )}
      </div>
      
      <p className="mt-3 text-[9px] text-slate-400 font-medium text-center italic">
        Varningar ljuder automatiskt vid höga nivåer.
      </p>
    </div>
  );
};

export default NoiseMeter;
