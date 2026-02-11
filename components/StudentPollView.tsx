
import React, { useState, useEffect } from 'react';

interface PollOption {
  id: string;
  label: string;
  icon?: string;
  emoji?: string;
  votes: number;
}

interface PollData {
  type: 'standard' | 'mindset';
  question: string;
  phase?: 'before' | 'after' | 'compare';
  options: PollOption[];
  beforeVotes?: Record<string, number>;
  afterVotes?: Record<string, number>;
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
    const interval = setInterval(fetchPoll, 4000);
    return () => clearInterval(interval);
  }, [pollId]);

  const fetchPoll = async () => {
    if (!pollId) return;
    try {
      const response = await fetch(`https://api.restful-api.dev/objects/${pollId}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data && data.data) {
        // Om fasen ändras i mindset-läget, låt eleven rösta igen (för "Efter")
        if (poll && data.data.type === 'mindset' && poll.phase !== data.data.phase) {
          setHasVoted(false);
        }
        setPoll(data.data);
      } else throw new Error();
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
      
      let updatedData = { ...latest.data };
      
      if (poll.type === 'mindset') {
        const voteKey = poll.phase === 'after' ? 'afterVotes' : 'beforeVotes';
        const currentVotes = latest.data[voteKey] || {};
        updatedData[voteKey] = { ...currentVotes, [optionId]: (currentVotes[optionId] || 0) + 1 };
      } else {
        updatedData.options = latest.data.options.map((opt: PollOption) => 
          opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
        );
      }
      
      updatedData.updatedAt = Date.now();

      await fetch(`https://api.restful-api.dev/objects/${pollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "KP_POLL_ACTIVE",
          data: updatedData
        })
      });
    } catch (err) {
      setHasVoted(false);
      alert("Röstningen misslyckades.");
    }
  };

  if (loading && !poll) return (
    <div className="h-screen flex flex-col items-center justify-center bg-indigo-600 text-white font-black text-sm uppercase tracking-widest animate-pulse">
      🏫 Ansluter...
    </div>
  );

  if (error || !poll) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Omröstningen avslutad</h2>
      <p className="text-slate-500 mb-4">Läraren har stängt sessionen eller så är länken ogiltig.</p>
    </div>
  );

  if (poll.phase === 'compare') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-indigo-600 text-white p-10 text-center animate-in zoom-in-95">
        <div className="text-8xl mb-8">📈</div>
        <h2 className="text-4xl font-black mb-4">Analysera!</h2>
        <p className="text-indigo-100 text-lg">Titta på tavlan för att se klassens gemensamma resultat.</p>
      </div>
    );
  }

  if (hasVoted) return (
    <div className="h-screen flex flex-col items-center justify-center bg-emerald-500 text-white p-10 text-center animate-in zoom-in-95">
      <div className="text-8xl mb-8">✅</div>
      <h2 className="text-4xl font-black mb-4">Tack för ditt svar!</h2>
      <p className="text-emerald-100 text-lg">Håll koll på tavlan för resultaten.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col animate-in fade-in">
      <header className="mb-10 text-center shrink-0">
        <h1 className="text-3xl font-black text-slate-800 leading-tight mb-4">
          {poll.question}
        </h1>
        <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm text-[10px] font-black uppercase text-indigo-600 border border-slate-100 tracking-widest">
          Din röst är helt anonym
        </div>
      </header>

      <div className={`flex-1 flex flex-col gap-4 max-w-lg mx-auto w-full ${poll.type === 'mindset' ? '' : 'justify-center'}`}>
        {poll.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => vote(opt.id)}
            className="flex-1 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-all group"
          >
            <span className="text-7xl mb-4 group-hover:scale-110 transition-transform">{opt.icon}</span>
            <span className="text-xl font-black text-slate-700">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentPollView;
