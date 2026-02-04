
import React, { useState, useEffect } from 'react';

interface PollOption {
  id: string;
  label: string;
  icon: string;
  votes: number;
}

interface PollData {
  question: string;
  options: PollOption[];
  updatedAt: number;
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
    if (!pollId) return;
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(`https://api.restful-api.dev/objects/${pollId}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data && data.data) {
        setPoll(data.data);
      } else {
        throw new Error();
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (optionId: string) => {
    if (hasVoted || !poll) return;
    setHasVoted(true); 

    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${pollId}`);
      if (!response.ok) throw new Error();
      const latest = await response.json();
      
      const updatedOptions = latest.data.options.map((opt: PollOption) => 
        opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );

      await fetch(`https://api.restful-api.dev/objects/${pollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "KP_POLL_ACTIVE",
          data: { ...latest.data, options: updatedOptions, updatedAt: Date.now() }
        })
      });
    } catch (err) {
      setHasVoted(false);
      alert("Röstningen misslyckades. Försök igen.");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-indigo-600 text-white font-black text-sm uppercase tracking-widest animate-pulse">
      🏫 Ansluter...
    </div>
  );

  if (error || !poll) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Hittade inte omröstningen</h2>
      <p className="text-slate-500 mb-4">Länken är ogiltig eller så har läraren stängt av.</p>
      <button onClick={() => window.location.href = window.location.origin} className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg">Startsida</button>
    </div>
  );

  if (hasVoted) return (
    <div className="h-screen flex flex-col items-center justify-center bg-emerald-500 text-white p-10 text-center animate-in zoom-in-95">
      <div className="text-8xl mb-8">✅</div>
      <h2 className="text-4xl font-black mb-4">Tack!</h2>
      <p className="text-emerald-100 text-lg">Ditt svar är skickat. Titta på tavlan!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col animate-in fade-in">
      <header className="mb-10 text-center shrink-0">
        <h1 className="text-3xl font-black text-slate-800 leading-tight mb-4">{poll.question}</h1>
        <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm text-[10px] font-black uppercase text-indigo-600 border border-slate-100 tracking-widest">
          Välj ett alternativ nedan
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {poll.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => vote(opt.id)}
            className="flex-1 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <span className="text-7xl mb-4">{opt.icon}</span>
            <span className="text-xl font-black text-slate-700">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentPollView;
