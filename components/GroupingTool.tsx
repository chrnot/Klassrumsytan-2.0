
import React, { useState } from 'react';
import { Student, Group } from '../types';

interface GroupingToolProps {
  students: Student[];
}

const GroupingTool: React.FC<GroupingToolProps> = ({ students }) => {
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);

  const generateGroups = () => {
    if (students.length === 0) return;
    
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const newGroups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
      id: i + 1,
      members: []
    }));

    shuffled.forEach((student, index) => {
      newGroups[index % groupCount].members.push(student);
    });

    setGroups(newGroups);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gruppgenerator</h2>
          <p className="text-slate-500 mt-2">Dela upp klassen i slumpmässiga grupper snabbt och enkelt.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col px-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Antal Grupper</span>
            <input 
              type="number" 
              min="2" 
              max="20"
              value={groupCount}
              onChange={(e) => setGroupCount(parseInt(e.target.value) || 2)}
              className="text-xl font-bold text-indigo-600 w-16 focus:outline-none"
            />
          </div>
          <button
            onClick={generateGroups}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Generera
          </button>
        </div>
      </header>

      {groups.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
          <div className="text-6xl mb-4 opacity-30">👥</div>
          <p className="text-slate-400 text-xl">Välj antal grupper och tryck på knappen för att starta.</p>
          {students.length < 2 && (
             <p className="text-red-400 mt-4 text-sm font-medium">Du behöver lägga till minst 2 elever i listan först!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-black text-slate-800 mb-4 pb-2 border-b border-slate-50 flex justify-between">
                Grupp {group.id}
                <span className="text-slate-400 font-normal text-sm">{group.members.length} elever</span>
              </h3>
              <ul className="space-y-2">
                {group.members.map((m) => (
                  <li key={m.id} className="text-slate-600 font-medium py-1 px-2 rounded-lg hover:bg-slate-50">
                    {m.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupingTool;
