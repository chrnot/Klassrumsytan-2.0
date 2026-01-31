
import React, { useState, useEffect } from 'react';

interface PollOption {
  id: string;
  label: string;
  icon: string;
  votes: number;
  color: string;
}

interface PollData {
  question: string;
  options: PollOption[];
}

interface StudentPollViewProps {
  pollId: string;
}

const StudentPollView: React.FC<StudentPollViewProps> = ({ pollId }) => {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${pollId}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPoll(data.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (optionId: string) => {
    if (hasVoted || !poll) return;
    
    // Optimistisk uppdatering: Visa tack-skärmen direkt
    setHasVoted(true);

    try {
      // Step 1: Hämta absolut senaste data för att undvika överlapp
      const response = await fetch(`https://api.restful-api.dev/objects/${pollId}`);
      if (!response.ok) throw new Error();
      const latest = await response.json();
      
      // Step 2: Inkrementera
      const updatedOptions = latest.data.options.map((opt: PollOption) => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      // Step 3: Spara tillbaka
      await fetch(`https://api.restful-api.dev/objects/${pollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Klassrumsytan_Poll_V9",
          data: { ...latest.data, options: updatedOptions, updatedAt: Date.now() }
        })
      });
    } catch (err) {
      console.error("Vote failed");
      // Om röstningen misslyckas helt, tillåt nytt försök
      setHasVoted(false);
      alert("Något gick fel när rösten skickades. Försök igen!");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-indigo-600 text-white p-6">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-widest text-xs">Ansluter till klassen...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Hittade inte omröstningen</h2>
        <p className="text-slate-500 mb-8">Läraren kan ha avslutat sessionen eller så är länken felaktig.</p>
        <button 
          onClick={() => window.location.href = window.location.origin}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100"
        >
          Gå till startsidan
        </button>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-emerald-500 text-white p-10 text-center animate-in fade-in duration-500">
        <div className="text-8xl mb-8 animate-bounce">✅</div>
        <h2 className="text-3xl font-black mb-4">Tack för din röst!</h2>
        <p className="text-emerald-100 font-medium leading-relaxed">Ditt svar har skickats till läraren. Titta på tavlan för att se resultatet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col animate-in fade-in duration-500">
      <header className="mb-8 text-center">
        <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">
          Live Omröstning 🏫
        </div>
        <h1 className="text-3xl font-black text-slate-800 leading-tight">
          {poll.question}
        </h1>
      </header>

      <div className="flex-1 flex flex-col gap-4">
        {poll.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => vote(opt.id)}
            className="flex-1 bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-sm hover:border-indigo-500 active:scale-95 transition-all group"
          >
            <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">{opt.icon}</span>
            <span className="text-xl font-black text-slate-700">{opt.label}</span>
          </button>
        ))}
      </div>

      <footer className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        Klassrumsytan.se
      </footer>
    </div>
  );
};

export default StudentPollView;
