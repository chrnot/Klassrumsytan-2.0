
import React, { useState, useEffect } from 'react';
import { Student, Group } from '../types';

interface GroupingToolProps {
  students: Student[];
  onResize?: (width: number, height: number) => void;
}

const GroupingTool: React.FC<GroupingToolProps> = ({ students, onResize }) => {
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingStudent, setEditingStudent] = useState<{ groupId: number, studentId: string } | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

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

  const toggleViewMode = () => {
    const nextMode = !isViewMode;
    setIsViewMode(nextMode);

    if (onResize && groups.length > 0) {
      if (nextMode) {
        // Beräkna optimal layout baserat på antal grupper
        const cols = groups.length <= 2 ? groups.length : groups.length <= 4 ? 2 : 3;
        const rows = Math.ceil(groups.length / cols);
        
        // Hitta den grupp som har flest medlemmar för att veta hur högt fönstret måste vara
        const maxMembers = Math.max(...groups.map(g => g.members.length));
        
        // Ungefärlig höjd per namn i visningsläge (ca 54px vid text-3xl)
        const nameRowHeight = 54;
        const headerAndPaddingHeight = 160; // Inkluderar widget header och grupprubrik
        
        const calculatedWidth = (cols * 320) + 60;
        const calculatedHeight = (rows * (maxMembers * nameRowHeight + 80)) + headerAndPaddingHeight;

        const finalWidth = Math.min(window.innerWidth - 60, calculatedWidth);
        const finalHeight = Math.min(window.innerHeight - 80, calculatedHeight);
        
        onResize(finalWidth, finalHeight);
      } else {
        // Återgå till standardstorlek vid redigering
        onResize(750, 750);
      }
    }
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
    <div className={`flex flex-col h-full animate-in fade-in duration-500 ${isViewMode ? 'p-0 overflow-hidden' : 'space-y-6'}`}>
      <header className={`flex items-center justify-between gap-4 shrink-0 transition-all ${isViewMode ? 'px-6 py-4 bg-slate-50/50 border-b border-slate-100' : 'mb-6'}`}>
        {!isViewMode && (
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gruppering</h2>
        )}
        
        <div className={`flex items-center gap-2 ${isViewMode ? 'w-full justify-between' : 'ml-auto'}`}>
          {isViewMode && (
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <span className="font-black text-indigo-600 text-sm uppercase tracking-widest">Studiegrupper</span>
            </div>
          )}

          {!isViewMode && (
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <div className="flex flex-col px-3">
                <span className="text-[7px] uppercase tracking-wider font-black text-slate-400">Antal</span>
                <input 
                  type="number" 
                  min="2" 
                  max="20"
                  value={groupCount}
                  onChange={(e) => setGroupCount(parseInt(e.target.value) || 2)}
                  className="text-base font-bold text-indigo-600 w-10 bg-transparent focus:outline-none"
                />
              </div>
              <button
                onClick={generateGroups}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all text-xs active:scale-95"
              >
                Slumpa
              </button>
            </div>
          )}

          {groups.length > 0 && (
            <button
              onClick={toggleViewMode}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                isViewMode 
                  ? 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-600' 
                  : 'bg-amber-500 text-white hover:scale-105 shadow-amber-200'
              }`}
            >
              {isViewMode ? '⚙️ Redigera' : '📺 Visa på tavlan'}
            </button>
          )}
        </div>
      </header>

      <div className={`flex-1 ${isViewMode ? 'p-6' : 'overflow-y-auto custom-scrollbar pr-1'}`}>
        {groups.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center h-full flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 opacity-20">👥</div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Inga grupper än</p>
            {students.length < 2 && (
               <p className="text-rose-400 mt-4 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Lägg till elever först!</p>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            isViewMode 
              ? groups.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {groups.map((group) => (
              <div 
                key={group.id} 
                className={`flex flex-col transition-all duration-300 ${
                  isViewMode 
                    ? 'bg-white border-2 border-indigo-50 rounded-[2.5rem] p-6 shadow-sm ring-4 ring-slate-50/50' 
                    : 'bg-white border border-slate-100 rounded-[2rem] p-4 hover:shadow-md'
                }`}
              >
                <h3 className={`font-black flex justify-between items-center ${
                  isViewMode 
                    ? 'text-indigo-500 text-sm mb-4 border-b-2 border-indigo-50 pb-2' 
                    : 'text-slate-800 text-sm mb-3 border-b border-slate-50 pb-2'
                }`}>
                  GRUPP {group.id}
                  <span className={`font-bold text-[10px] px-3 py-1 rounded-full ${isViewMode ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    {group.members.length} elever
                  </span>
                </h3>
                <ul className={`${isViewMode ? 'space-y-3' : 'space-y-1.5'} flex-1`}>
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
                          className="w-full text-base font-bold text-indigo-900 bg-white border-2 border-indigo-200 py-2 px-3 rounded-xl outline-none"
                        />
                      ) : (
                        <div 
                          className={`flex items-center justify-between gap-2 transition-colors rounded-xl ${
                            isViewMode 
                              ? 'py-1' 
                              : 'py-1.5 px-2 hover:bg-slate-50 cursor-pointer'
                          }`} 
                          onClick={() => !isViewMode && setEditingStudent({ groupId: group.id, studentId: m.id })}
                        >
                          <span className={`font-black truncate tracking-tight ${
                            isViewMode 
                              ? 'text-3xl md:text-4xl text-slate-800' 
                              : 'text-slate-600 text-sm'
                          }`}>{m.name}</span>
                          {!isViewMode && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeStudentFromGroup(group.id, m.id); }}
                              className="text-slate-200 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isViewMode && groups.length > 0 && (
        <div className="mt-auto bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-3 shrink-0">
          <span className="text-xl">💡</span>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Tips: Klicka på 🎯 i headern för att centrera fönstret snabbt. Använd 🧩 i menyn för att ordna alla.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupingTool;
