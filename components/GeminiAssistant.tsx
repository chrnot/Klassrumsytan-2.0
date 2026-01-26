
import React, { useState } from 'react';
import { getGeminiSuggestion } from '../services/geminiService';
import { Message } from '../types';

const GeminiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hej! Jag är din digitala lärarassistent. Vad kan jag hjälpa dig med idag? Vill du ha förslag på en icebreaker, en snabb matteutmaning eller kanske hjälp att förklara ett svårt begrepp?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const suggestion = await getGeminiSuggestion(userMessage);
    
    setMessages(prev => [...prev, { role: 'assistant', content: suggestion }]);
    setIsLoading(false);
  };

  const quickPrompts = [
    "Ge mig en 5-minuters icebreaker",
    "Förslag på diskussionsfråga om demokrati",
    "Snabb mattegåta för åk 4",
    "Hur förklarar jag fotosyntes enkelt?"
  ];

  return (
    <div className="flex flex-col h-[80vh] bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
      <header className="bg-indigo-600 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">✨</span> Gemini Lärarassistent
        </h2>
        <p className="text-indigo-100 text-sm opacity-80 mt-1">Drivs av Gemini 3 Flash</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-50 text-indigo-900 self-end border border-indigo-100' 
                : 'bg-slate-50 text-slate-700 self-start border border-slate-100'
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="bg-slate-50 text-slate-500 p-4 rounded-2xl self-start flex gap-2">
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Fråga assistenten något..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              isLoading || !input.trim() 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Fråga
          </button>
        </form>
      </div>
    </div>
  );
};

export default GeminiAssistant;
