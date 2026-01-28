
import React, { useState } from 'react';

const QRCodeWidget: React.FC = () => {
  const [url, setUrl] = useState('');

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-sm mb-8">
        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest text-center">Länk till eleverna</label>
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Klistra in länk här..."
            className="w-full px-6 py-4 text-sm border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm pr-12"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔗</div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {url ? (
          <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-50 animate-in zoom-in-90 duration-300">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`} 
              alt="QR"
              className="w-64 h-64"
            />
            <p className="mt-6 text-center text-slate-400 font-medium text-xs break-all max-w-[250px] mx-auto opacity-60">
              {url}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-200 py-10">
            <div className="text-[10rem] leading-none mb-6 opacity-20">📱</div>
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Väntar på länk...</p>
          </div>
        )}
      </div>

      <p className="mt-8 text-slate-400 text-[10px] font-medium text-center leading-relaxed">
        Eleverna kan skanna koden med sina enheter för att snabbt komma till rätt sida.
      </p>
    </div>
  );
};

export default QRCodeWidget;
