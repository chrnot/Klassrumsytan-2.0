
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, Modality, LiveServerMessage } from "@google/genai";
import { Message } from '../types';

interface GeminiAssistantProps {
  // Dessa props styrs nu internt för att hålla Live-logiken isolerad
}

// Hjälpfunktioner för ljudhantering enligt API-riktlinjer
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hej! Jag är din digitala assistent. Klicka på "Prata Live" för att starta en röstkonversation eller skriv din fråga här för att få förslag på en snabb aktivitet.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContexts = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isLiveActive]);

  const stopLive = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContexts.current.input) audioContexts.current.input.close();
    if (audioContexts.current.output) audioContexts.current.output.close();
    audioContexts.current = {};
    audioSourcesRef.current.forEach(s => s.stop());
    audioSourcesRef.current.clear();
    setIsLiveActive(false);
    setIsConnecting(false);
  }, []);

  const startLive = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContexts.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsLiveActive(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContexts.current.output) {
              const ctx = audioContexts.current.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopLive(),
          onerror: (e) => {
            console.error("Live Error:", e);
            stopLive();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: 'Du är en hjälpsam lärarassistent i ett svenskt klassrum. Din huvuduppgift är att föreslå snabba, engagerande aktiviteter för eleverna. Svara kort och vänligt.'
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      alert("Kunde inte starta röstsamtal. Kontrollera mikrofonen.");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: "Du är en expertpedagog och lärarassistent. Din huvuduppgift är att föreslå snabba, engagerande aktiviteter för eleverna (ca 5 minuter). Svara kortfattat på svenska.",
          temperature: 0.7,
        },
      });

      const reply = response.text || "Jag kunde inte generera ett svar just nu.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Ett fel uppstod." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[1.5rem] overflow-hidden">
      <header className="bg-indigo-600 p-5 text-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">✨</span> 5-min Aktivitet
          </h2>
          <p className="text-indigo-100 text-[10px] opacity-80 uppercase tracking-widest font-black">
            {isLiveActive ? 'Live Röstläge' : 'AI-genererad inspiration'}
          </p>
        </div>
        
        <button
          onClick={isLiveActive ? stopLive : startLive}
          disabled={isConnecting}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
            isLiveActive 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-white text-indigo-600 hover:scale-105'
          }`}
        >
          {isConnecting ? 'Ansluter...' : isLiveActive ? '🔴 Avsluta' : '🎙️ Prata Live'}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white self-end ml-auto shadow-indigo-100 shadow-md' 
                : 'bg-slate-50 text-slate-700 self-start border border-slate-100'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-slate-50 text-slate-400 p-4 rounded-3xl self-start flex gap-1.5 w-fit">
            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}

        {isLiveActive && (
          <div className="flex flex-col items-center justify-center py-10 text-indigo-500 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex gap-1.5 items-end h-16">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ 
                    height: `${20 + Math.random() * 80}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
            <p className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Assistenten lyssnar...</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/30 shrink-0">
        {!isLiveActive && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["5-minuters icebreaker", "Diskussionsfråga", "Mattegåta"].map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="text-[10px] bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all font-bold uppercase tracking-tight"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLiveActive}
            placeholder={isLiveActive ? "Använd rösten för att prata..." : "Be om en aktivitet..."}
            className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isLiveActive}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              isLoading || !input.trim() || isLiveActive
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
            }`}
          >
            Sänd
          </button>
        </form>
      </div>
    </div>
  );
};

export default GeminiAssistant;
