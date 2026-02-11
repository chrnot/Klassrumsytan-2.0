
import React from 'react';

interface LinkWidgetProps {
  url: string;
  title: string;
}

const LinkWidget: React.FC<LinkWidgetProps> = ({ url, title }) => {
  const formatUrl = (u: string) => {
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      return `https://${u}`;
    }
    return u;
  };

  const getFavicon = (u: string) => {
    try {
      const domain = new URL(formatUrl(u)).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      return null;
    }
  };

  const favicon = getFavicon(url);

  return (
    <div className="h-full flex flex-col items-center justify-center p-2 animate-in fade-in duration-300">
      <a
        href={formatUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center w-full h-full group transition-all"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-50 transition-all shadow-inner border border-slate-100">
          {favicon ? (
            <img 
              src={favicon} 
              alt="" 
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-4xl">🔗</span>
          )}
        </div>
        <h3 className="font-black text-slate-800 text-sm md:text-lg text-center leading-tight truncate w-full px-2">
          {title}
        </h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Öppna länk ↗
        </p>
      </a>
    </div>
  );
};

export default LinkWidget;
