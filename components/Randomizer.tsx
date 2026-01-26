
import React, { useState, useEffect } from 'react';
import { Student } from '../types';

interface RandomizerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const Randomizer: React.FC<RandomizerProps> = ({ students, setStudents }) => {
  const [newName, setNewName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setStudents([...students, { id: Date.now().toString(), name: newName.trim() }]);
    setNewName('');
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-6">
        <header>
          <h2 className="text-2xl font-bold text-slate-800">Elevlista</h2>
          <p className="text-slate-500">Lägg till dina elever för att börja slumpa.</p>
        </header>

        <form onSubmit={addStudent} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Namn på elev..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Lägg till
          </button>
        </form>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-h-[500px] overflow-y-auto">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic">
              Inga elever tillagda än.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {students.map((student) => (
                <li key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <span className="font-medium text-slate-700">{student.name}</span>
                  <button
                    onClick={() => removeStudent(student.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[3rem] p-12 shadow-sm min-h-[400px]">
        <h3 className="text-slate-400 uppercase tracking-widest text-sm mb-12">Dagens stjärna</h3>
        
        <div className={`text-6xl font-black text-center mb-12 transition-all duration-150 ${isShuffling ? 'scale-110 opacity-70 blur-[1px]' : 'scale-100'}`}>
          {selectedStudent ? selectedStudent.name : '???'}
        </div>

        <button
          onClick={pickRandom}
          disabled={isShuffling || students.length === 0}
          className={`w-full py-6 rounded-2xl font-bold text-xl transition-all shadow-lg ${
            isShuffling || students.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          {isShuffling ? 'Slumpar...' : 'Slumpa fram elev'}
        </button>
        
        {students.length === 0 && (
          <p className="mt-4 text-sm text-red-500">Lägg till elever först!</p>
        )}
      </div>
    </div>
  );
};

export default Randomizer;
