
import React, { useState, useRef } from 'react';
import { PlacementStudent } from '../types';

interface RandomizerProps {
  students: PlacementStudent[];
  setStudents: React.Dispatch<React.SetStateAction<PlacementStudent[]>>;
}

const Randomizer: React.FC<RandomizerProps> = ({ students, setStudents }) => {
  const [newName, setNewName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PlacementStudent | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newS: PlacementStudent = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      gender: 'okant',
      condition: 'ingen',
      notWith: [],
      prefNotWith: [],
      prefWith: [],
      isPlaced: false
    };
    setStudents([...students, newS]);
    setNewName('');
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    
    const names = bulkInput
      .split(/[,\n;]/)
      .map(n => n.trim())
      .filter(n => n !== "");

    const newStudents: PlacementStudent[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      gender: 'okant',
      condition: 'ingen',
      notWith: [],
      prefNotWith: [],
      prefWith: [],
      isPlaced: false
    }));

    setStudents([...students, ...newStudents]);
    setBulkInput('');
    setIsBulkOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkInput(content);
      setIsBulkOpen(true);
    };
    reader.readAsText(file);
  };

  const pickRandom = () => {
    if (students.length === 0) return;
    setIsShuffling(true);
    setSelectedStudent(null);
    
    let iterations = 0;
    const maxIterations = 20;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setSelectedStudent(students[randomIndex]);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsShuffling(false);
      }
    }, 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500 h-full">
      <div className="flex flex-col space-y-4">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Elevlista</h2>
            <p className="text-slate-400 text-xs">Hantera eleverna i din klass.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {isBulkOpen ? 'Stäng import' : 'Massimportera 📑'}
            </button>
          </div>
        </header>

        {isBulkOpen ? (
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-indigo-100 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-700">Klistra in lista</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Separera med komma, semikolon eller ny rad</p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Anna Andersson, Bengt Bengtsson..."
              className="w-full h-32 p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleBulkAdd}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
              >
                Lägg till alla
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-sm font-bold hover:bg-slate-50"
              >
                Ladda upp fil (.txt/.csv)
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt,.csv" 
                className="hidden" 
              />
            </div>
          </div>
        ) : (
          <form onSubmit={addStudent} className="flex gap-2 shrink-0">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Namn på elev..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
            >
              Lägg till
            </button>
          </form>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex-1 min-h-[200px] flex flex-col">
          {students.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-300 italic">
              <span className="text-4xl mb-2 opacity-20">👥</span>
              Inga elever tillagda än.
            </div>
          ) : (
            <>
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{students.length} Elever</span>
                <button 
                  onClick={() => setStudents([])}
                  className="text-[10px] font-bold text-red-400 hover:text-red-600"
                >
                  Rensa listan
                </button>
              </div>
              <ul className="divide-y divide-slate-100 overflow-y-auto custom-scrollbar">
                {students.map((student) => (
                  <li key={student.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{student.name}</span>
                    <button
                      onClick={() => removeStudent(student.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1.5"
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-indigo-50/30 border border-indigo-100/50 rounded-[3rem] p-8 md:p-12 shadow-sm min-h-[350px]">
        <div className={`text-6xl md:text-7xl font-black text-center mb-12 transition-all duration-150 ${isShuffling ? 'scale-110 opacity-70 blur-[1px]' : 'scale-100 text-indigo-900'}`}>
          {selectedStudent ? selectedStudent.name : '???'}
        </div>

        <button
          onClick={pickRandom}
          disabled={isShuffling || students.length === 0}
          className={`w-full py-5 rounded-3xl font-bold text-xl transition-all shadow-xl ${
            isShuffling || students.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200/50 hover:-translate-y-1'
          }`}
        >
          {isShuffling ? 'Slumpar...' : 'Slumpa fram elev'}
        </button>
        
        {students.length === 0 && (
          <p className="mt-4 text-xs font-bold text-red-400 animate-pulse">Lägg till elever först!</p>
        )}
      </div>
    </div>
  );
};

export default Randomizer;
