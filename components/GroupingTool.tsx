
import React, { useState } from 'react';
import { Student, Group } from '../types';

interface GroupingToolProps {
  students: Student[];
}

const GroupingTool: React.FC<GroupingToolProps> = ({ students }) => {
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingStudent, setEditingStudent] = useState<{ groupId: number, studentId: string } | null>(null);

  const generateGroups = () => {
    if (students.length === 0) return;
    
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const newGroups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
      id: i + 1,
      members: []
    }));

    shuffled.forEach((student, index) => {
      newGroups[index % groupCount].members.push({ ...student });
    });

    setGroups(newGroups);
    setEditingStudent(null);
  };

  const updateStudentName = (groupId: number, studentId: string, newName: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.map(member => 
            member.id === studentId ? { ...member, name: newName } : member
          )
        };
      }
      return group;
    }));
  };

  const removeStudentFromGroup = (groupId: number, studentId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(m => m.id !== studentId)
        };
      }
      return group;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-[400px]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gruppgenerator</h2>
          <p className="text-slate-500 mt-2">Dela upp klassen i slumpmässiga grupper. Klicka på ett namn för att redigera.</p>
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
            <div key={group.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-lg font-black text-slate-800 mb-4 pb-2 border-b border-slate-50 flex justify-between items-center">
                Grupp {group.id}
                <span className="text-slate-400 font-normal text-xs bg-slate-50 px-2 py-0.5 rounded-full">{group.members.length}</span>
              </h3>
              <ul className="space-y-1.5 flex-1">
                {group.members.map((m) => (
                  <li key={m.id} className="group relative">
                    {editingStudent?.studentId === m.id && editingStudent.groupId === group.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={m.name}
                        onBlur={() => setEditingStudent(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingStudent(null)}
                        onChange={(e) => updateStudentName(group.id, m.id, e.target.value)}
                        className="w-full text-sm font-medium text-indigo-900 bg-indigo-50 border border-indigo-200 py-1.5 px-3 rounded-xl outline-none"
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-1 px-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setEditingStudent({ groupId: group.id, studentId: m.id })}>
                        <span className="text-slate-600 font-medium text-sm truncate">{m.name}</span>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeStudentFromGroup(group.id, m.id); }}
                            className="text-slate-300 hover:text-red-500 p-1"
                            title="Ta bort från grupp"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {group.members.length === 0 && (
                <div className="py-8 text-center text-slate-300 italic text-xs">Tom grupp</div>
              )}
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-start gap-4">
          <div className="text-2xl mt-1">✏️</div>
          <div>
             <p className="text-slate-700 font-bold mb-1">Tips</p>
             <p className="text-slate-500 text-sm leading-relaxed">
               Klicka på ett namn för att ändra det om någon saknas eller om du vill flytta en elev manuellt. Du kan också ta bort en elev från en specifik grupp genom att klicka på krysset vid namnet.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupingTool;
