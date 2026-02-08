
import React, { useState } from 'react';

const VideoPlayer: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [videoData, setVideoData] = useState<{ type: 'youtube' | 'direct' | null, src: string }>({ type: null, src: '' });

  const parseVideoUrl = (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    // Robust regex för att extrahera exakt 11 tecken långt YouTube-ID
    const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
    const ytMatch = trimmedUrl.match(ytRegex);
    
    // Om det bara är 11 tecken antar vi att det är ett ID direkt
    const isDirectId = /^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl);
    
    // Direkt videofil (mp4, webm etc)
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

  // Origin är viktigt för att YouTube ska godkänna inbäddningen
  const origin = window.location.origin;

  if (videoData.type) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
          {videoData.type === 'youtube' ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoData.src}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(origin)}&widget_referrer=${encodeURIComponent(window.location.href)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
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
          
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
            <button 
              onClick={() => setVideoData({ type: null, src: '' })}
              className="bg-white/20 hover:bg-white/90 text-white hover:text-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase backdrop-blur-md transition-all shadow-lg"
            >
              🔄 Byt video
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                ID: {videoData.src}
              </span>
              {videoData.type === 'youtube' && (
                <a 
                  href={`https://youtube.com/watch?v=${videoData.src}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] text-indigo-500 hover:underline font-bold mt-0.5"
                >
                  Öppna direkt på YouTube ↗
                </a>
              )}
            </div>
            <p className="text-[9px] text-slate-400 italic text-right max-w-[200px]">
                Om videon visar fel beror det ofta på att ägaren blockerat inbäddning för just detta klipp.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-7xl mb-4 opacity-20">🎬</div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Spela upp video</h3>
        <p className="text-slate-500 text-sm leading-relaxed px-4">Klistra in en YouTube-länk för att visa klippet för klassen.</p>
        
        <form onSubmit={handleSumbit} className="flex flex-col gap-3">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Klistra in länk här..."
            className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm transition-all"
          />
          <button 
            type="submit"
            disabled={!inputUrl.trim()}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 active:scale-95"
          >
            Starta Film 🎞️
          </button>
        </form>

        <div className="pt-4 space-y-2">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Stöder</p>
            <div className="flex flex-wrap justify-center gap-2">
                <span className="text-[9px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400">YouTube-ID</span>
                <span className="text-[9px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400">youtu.be</span>
                <span className="text-[9px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400">Shorts</span>
                <span className="text-[9px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-400">MP4/WebM</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
