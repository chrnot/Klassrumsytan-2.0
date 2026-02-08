
import React, { useState } from 'react';

const VideoPlayer: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [videoData, setVideoData] = useState<{ type: 'youtube' | 'direct' | null, src: string }>({ type: null, src: '' });

  const parseVideoUrl = (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    // Förbättrad regex för att fånga ID:t oavsett parametrar som ?si= eller ?t=
    const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
    const ytMatch = trimmedUrl.match(ytRegex);
    
    // Om det bara är 11 tecken (ID)
    const isDirectId = /^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl);
    
    // Direkt videofil
    const directRegex = /\.(mp4|webm|ogg)$/i;

    if (isDirectId) {
      setVideoData({ type: 'youtube', src: trimmedUrl });
    } else if (ytMatch && ytMatch[1]) {
      setVideoData({ type: 'youtube', src: ytMatch[1] });
    } else if (directRegex.test(trimmedUrl)) {
      setVideoData({ type: 'direct', src: trimmedUrl });
    } else {
      alert("Kunde inte tolka länken. Kontrollera att det är en giltig YouTube-länk.");
    }
  };

  const handleSumbit = (e: React.FormEvent) => {
    e.preventDefault();
    parseVideoUrl(inputUrl);
  };

  if (videoData.type) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
          {videoData.type === 'youtube' ? (
            <div className="w-full h-full relative">
              <iframe
                className="w-full h-full relative z-10"
                src={`https://www.youtube-nocookie.com/embed/${videoData.src}?rel=0&modestbranding=1&autoplay=1`}
                title="Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
              {/* Fallback-lager bakom iframen om den nekar åtkomst */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-900 z-0">
                <div className="text-4xl mb-4">📺</div>
                <p className="text-white font-bold mb-4">Videon kunde inte bäddas in</p>
                <p className="text-slate-400 text-sm mb-6">Detta beror ofta på att videons ägare (t.ex. SF Studios) har stängt av visning på andra webbplatser.</p>
                <a 
                  href={`https://www.youtube.com/watch?v=${videoData.src}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all"
                >
                  Öppna i ny flik ↗
                </a>
              </div>
            </div>
          ) : (
            <video 
              className="w-full h-full" 
              controls 
              autoPlay
              src={videoData.src}
            >
              Din webbläsare stöder inte videouppspelning.
            </video>
          )}
          
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-30">
            <button 
              onClick={() => setVideoData({ type: null, src: '' })}
              className="bg-white/90 text-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase shadow-xl hover:bg-white transition-all"
            >
              🔄 Byt video
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                YouTube ID: {videoData.src}
              </span>
              <a 
                href={`https://youtube.com/watch?v=${videoData.src}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] text-indigo-500 hover:underline font-bold mt-0.5"
              >
                Hittar du inte videon? Klicka här för att öppna direkt.
              </a>
            </div>
            <div className="flex gap-2">
               <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-1 rounded font-bold uppercase">Säkert läge aktivt</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-2">🎬</div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Klassrumsvideo</h3>
        <p className="text-slate-500 text-sm leading-relaxed px-4">Klistra in en länk från YouTube (t.ex. Alfons Åberg eller en instruktionsfilm) för att visa den på tavlan.</p>
        
        <form onSubmit={handleSumbit} className="flex flex-col gap-3">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm transition-all text-center font-medium"
          />
          <button 
            type="submit"
            disabled={!inputUrl.trim()}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 active:scale-95"
          >
            Starta visning 🎞️
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Vanliga problem</p>
            <div className="text-[10px] text-slate-400 space-y-1 text-left bg-slate-50 p-4 rounded-2xl">
                <p>• <b>Fel 150/153:</b> Videon är blockerad för inbäddning av ägaren.</p>
                <p>• <b>Svart skärm:</b> Kontrollera din internetanslutning.</p>
                <p>• <b>Tips:</b> Använd knappen "Dela" på YouTube för att få rätt länk.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
