
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Draggable from 'react-draggable';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { PlacementStudent, Desk, Furniture } from '../types';

type SeatingType = 'mixat' | 'separerat' | 'ingen_kon_hansyn';

interface ScoreResult {
  total: number;
  reasons: string[];
}

interface ClassroomPlacementProps {
  students: PlacementStudent[];
  setStudents: React.Dispatch<React.SetStateAction<PlacementStudent[]>>;
}

const DraggableFurniture: React.FC<{
  item: Furniture;
  setFurniture: React.Dispatch<React.SetStateAction<Furniture[]>>;
  isRotated: boolean;
}> = ({ item, setFurniture, isRotated }) => {
  const nodeRef = useRef(null);
  
  const icons = {
    teacher: '👨‍🏫',
    door: '🚪',
    window: '🪟',
    carpet: '🧶'
  };

  const colors = {
    teacher: 'bg-slate-800 text-white',
    door: 'bg-amber-100 border-amber-300 text-amber-800',
    window: 'bg-sky-50 border-sky-200 text-sky-600',
    carpet: 'bg-indigo-50 border-indigo-200 text-indigo-600'
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: item.x, y: item.y }}
      onStop={(_, data) => setFurniture(prev => prev.map(f => f.id === item.id ? { ...f, x: data.x, y: data.y } : f))}
      bounds="parent"
    >
      <div 
        ref={nodeRef}
        className={`absolute px-4 py-2 rounded-xl border-2 flex items-center gap-2 cursor-move shadow-sm group ${colors[item.type]} ${isRotated ? 'rotate-180' : ''}`}
      >
        <span className="text-xl">{icons[item.type]}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
        <button 
          onClick={() => setFurniture(prev => prev.filter(f => f.id !== item.id))}
          className="ml-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/40 transition-all text-[10px]"
        >
          ✕
        </button>
      </div>
    </Draggable>
  );
};

const DraggableDesk: React.FC<{
  desk: Desk;
  students: PlacementStudent[];
  setStudents: React.Dispatch<React.SetStateAction<PlacementStudent[]>>;
  setDesks: React.Dispatch<React.SetStateAction<Desk[]>>;
  config: any;
  calculateScore: (student: PlacementStudent, desk: Desk, partner: PlacementStudent | null, seatingType: SeatingType) => ScoreResult;
  getScoreColor: (score: number) => string;
  getStudentById: (id: string | null) => PlacementStudent | null;
}> = ({ desk, students, setStudents, setDesks, config, calculateScore, getScoreColor, getStudentById }) => {
  const nodeRef = useRef(null);
  
  const s1 = getStudentById(desk.student1Id);
  const s2 = getStudentById(desk.student2Id);
  const scoreResult1 = s1 ? calculateScore(s1, desk, s2, config.seatingType) : { total: 0, reasons: [] };
  const scoreResult2 = s2 ? calculateScore(s2, desk, s1, config.seatingType) : { total: 0, reasons: [] };

  const renderSlot = (studentId: string | null | undefined, slotKey: 'student1Id' | 'student2Id', scoreRes: ScoreResult) => {
    if (studentId === undefined) return null;

    const currentStudent = getStudentById(studentId);

    return (
      <div className="relative flex flex-col gap-1">
        <div className="relative">
          <select
            value={studentId || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              const oldId = studentId;
              setStudents(prev => prev.map(s => s.id === val ? { ...s, isPlaced: true } : s.id === oldId ? { ...s, isPlaced: false } : s));
              setDesks(prev => prev.map(d => d.id === desk.id ? { ...d, [slotKey]: val } : d));
            }}
            className={`w-full p-2.5 rounded-2xl text-[10px] font-black uppercase appearance-none outline-none text-center transition-all border-2 ${
              studentId 
                ? `${getScoreColor(scoreRes.total)} border-white/50 shadow-sm` 
                : 'bg-slate-50 border-dashed border-slate-200 text-slate-400'
            }`}
          >
            <option value="">+ Välj</option>
            {[...students].sort((a,b) => a.name.localeCompare(b.name)).map(s => (
              <option key={s.id} value={s.id} disabled={s.isPlaced && s.id !== studentId}>
                {s.name} {s.gender === 'kille' ? '♂️' : s.gender === 'tjej' ? '♀️' : ''} {s.condition !== 'ingen' ? '⚠️' : ''}
              </option>
            ))}
          </select>
          
          {scoreRes.reasons.length > 0 && (
            <div className="absolute -right-2 -top-2 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center text-[10px] group/reason cursor-help z-50">
              🚩
              <div className="absolute left-full ml-2 top-0 bg-slate-800 text-white p-3 rounded-xl text-[9px] font-bold w-32 opacity-0 group-hover/reason:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/20">
                <p className="mb-1 text-slate-400 uppercase tracking-widest text-[8px]">Placeringsanalys:</p>
                <ul className="space-y-1">
                  {scoreRes.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: desk.x, y: desk.y }}
      onStop={(_, data) => setDesks(prev => prev.map(d => d.id === desk.id ? { ...d, x: data.x, y: data.y } : d))}
      bounds="parent"
      handle=".desk-handle"
    >
      <div 
        ref={nodeRef}
        className={`absolute w-44 bg-white border border-slate-200 rounded-[2rem] shadow-xl p-3 transition-shadow hover:shadow-2xl group/desk flex flex-col gap-2 ${config.isRotated ? 'rotate-180' : ''}`}
      >
        <div className="desk-handle absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[8px] font-black cursor-grab active:cursor-grabbing opacity-0 group-hover/desk:opacity-100 transition-all border border-white whitespace-nowrap">
          BÄNK {desk.id}
        </div>
        
        {renderSlot(desk.student1Id, 'student1Id', scoreResult1)}
        {renderSlot(desk.student2Id, 'student2Id', scoreResult2)}
      </div>
    </Draggable>
  );
};

const ClassroomPlacement: React.FC<ClassroomPlacementProps> = ({ students, setStudents }) => {
  const [desks, setDesks] = useState<Desk[]>(() => {
    const saved = localStorage.getItem('kp_placement_desks_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [furniture, setFurniture] = useState<Furniture[]>(() => {
    const saved = localStorage.getItem('kp_placement_furniture');
    return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState({
    deskCount: 12,
    seatsPerDeskVal: '2', 
    seatingType: 'mixat' as SeatingType,
    isMonochrome: false,
    isRotated: false,
    activeTab: 'elever'
  });

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('kp_placement_desks_v3', JSON.stringify(desks));
  }, [desks]);

  useEffect(() => {
    localStorage.setItem('kp_placement_furniture', JSON.stringify(furniture));
  }, [furniture]);

  const getStudentById = useCallback((id: string | null) => students.find(s => s.id === id) || null, [students]);

  const updateStudent = (id: string, updates: Partial<PlacementStudent>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStudent = (id: string) => {
    if (confirm("Ta bort eleven?")) {
      setDesks(prev => prev.map(d => ({
        ...d,
        student1Id: d.student1Id === id ? null : d.student1Id,
        student2Id: d.student2Id === id ? null : d.student2Id
      })));
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const clearAllStudents = () => {
    if (confirm("Rensa hela listan och alla placeringar?")) {
      setDesks(prev => prev.map(d => ({
        ...d,
        student1Id: null,
        student2Id: d.student2Id === undefined ? undefined : null
      })));
      setStudents([]);
    }
  };

  const clearPlacementsOnly = () => {
    if (confirm("Vill du rensa ut alla elever från bänkarna? Elevlistan behålls.")) {
      setDesks(prev => prev.map(d => ({
        ...d,
        student1Id: null,
        student2Id: d.student2Id === undefined ? undefined : null
      })));
      setStudents(prev => prev.map(s => ({ ...s, isPlaced: false })));
    }
  };

  const calculateScore = useCallback((student: PlacementStudent, desk: Desk, partner: PlacementStudent | null, seatingType: SeatingType): ScoreResult => {
    let score = 0;
    const reasons: string[] = [];
    const isFront = desk.y < 250;
    const isBack = desk.y > 500;

    if (student.condition === 'fram' && !isFront) {
      score += 50;
      reasons.push("Ska sitta fram");
    }
    if (student.condition === 'bak' && !isBack) {
      score += 50;
      reasons.push("Ska sitta bak");
    }
    if (student.condition === 'vid_vagg' && !desk.isPerimeter) {
      score += 30;
      reasons.push("Behöver väggplats");
    }

    if (partner) {
      const notWith = student.notWith.map(n => n.toLowerCase());
      if (notWith.includes(partner.name.toLowerCase())) {
        score += 1000;
        reasons.push(`Får ej sitta med ${partner.name}`);
      }

      if (seatingType === 'mixat') {
        if (student.gender !== 'okant' && partner.gender !== 'okant' && student.gender === partner.gender) {
          score += 15;
          reasons.push("Sitter med samma kön (mixat valt)");
        }
      } else if (seatingType === 'separerat') {
        if (student.gender !== 'okant' && partner.gender !== 'okant' && student.gender !== partner.gender) {
          score += 1000;
          reasons.push("Sitter med motsatt kön (separerat valt)");
        }
      }
    }

    return { total: score, reasons };
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 100) return 'bg-rose-500 text-white';
    if (score >= 30) return 'bg-amber-400 text-amber-900';
    if (score > 0) return 'bg-yellow-200 text-yellow-800';
    return 'bg-emerald-500 text-white';
  }, []);

  const performPlacement = useCallback((currentStudents: PlacementStudent[], currentDesks: Desk[], seatingType: SeatingType) => {
    const updatedStudents = currentStudents.map(s => ({ ...s, isPlaced: false }));
    const updatedDesks = currentDesks.map(d => ({ ...d, student1Id: null, student2Id: d.student2Id === undefined ? undefined : null }));
    
    const sortedStudents = [...updatedStudents].sort((a, b) => {
      const scoreA = (a.condition !== 'ingen' ? 20 : 0) + a.notWith.length * 10;
      const scoreB = (b.condition !== 'ingen' ? 20 : 0) + b.notWith.length * 10;
      return scoreB - scoreA;
    });

    for (const student of sortedStudents) {
      let bestDeskIdx = -1;
      let bestScore = Infinity;
      let bestSlot: 's1' | 's2' = 's1';
      const deskIndices = updatedDesks.map((_, i) => i).sort(() => 0.5 - Math.random());
      
      for (const i of deskIndices) {
        const desk = updatedDesks[i];
        if (!desk.student1Id) {
          const scoreRes = calculateScore(student, desk, null, seatingType);
          if (scoreRes.total < bestScore) { bestScore = scoreRes.total; bestDeskIdx = i; bestSlot = 's1'; }
        }
        if (desk.student2Id === null) {
          const partner = updatedStudents.find(s => s.id === desk.student1Id) || null;
          const scoreRes = calculateScore(student, desk, partner, seatingType);
          if (scoreRes.total < bestScore) { bestScore = scoreRes.total; bestDeskIdx = i; bestSlot = 's2'; }
        }
        if (bestScore === 0) break;
      }

      if (bestDeskIdx !== -1) {
        const targetDesk = updatedDesks[bestDeskIdx];
        if (bestSlot === 's1') targetDesk.student1Id = student.id;
        else targetDesk.student2Id = student.id;
        const studentIdx = updatedStudents.findIndex(s => s.id === student.id);
        updatedStudents[studentIdx].isPlaced = true;
      }
    }
    return { updatedStudents, updatedDesks };
  }, [calculateScore]);

  const addFurniture = (type: Furniture['type'], label: string) => {
    const newItem: Furniture = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 400,
      y: 50,
      label
    };
    setFurniture([...furniture, newItem]);
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    const names = bulkInput.split(/[,\n;]/).map(n => n.trim()).filter(n => n);
    const newStudents: PlacementStudent[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      gender: 'okant', condition: 'ingen', notWith: [], prefNotWith: [], prefWith: [], isPlaced: false
    }));
    setStudents(prev => [...prev, ...newStudents]);
    setBulkInput('');
    setIsBulkOpen(false);
  };

  const createClassroom = () => {
    const { deskCount, seatsPerDeskVal, seatingType } = config;
    const newDesks: Desk[] = [];
    const cols = 3;
    let totalItems = Number(deskCount);
    if (seatsPerDeskVal === '4_island') totalItems = Number(deskCount) * 4;
    for (let i = 0; i < totalItems; i++) {
      let x = 0, y = 0;
      if (seatsPerDeskVal === '4_island') {
        const islandIdx = Math.floor(i / 4);
        const subIdx = i % 4;
        const row = Math.floor(islandIdx / cols);
        const col = islandIdx % cols;
        x = 60 + col * 260 + (subIdx % 2) * 110;
        y = 120 + row * 200 + Math.floor(subIdx / 2) * 80;
      } else {
        const row = Math.floor(i / cols);
        const col = i % cols;
        x = 80 + col * 220;
        y = 150 + row * 130;
      }
      newDesks.push({ id: i + 1, x, y, student1Id: null, student2Id: seatsPerDeskVal === '2' ? null : undefined as any, isPerimeter: true });
    }
    if (students.length > 0) {
      const { updatedStudents, updatedDesks } = performPlacement(students, newDesks, seatingType);
      setStudents(updatedStudents);
      setDesks(updatedDesks);
    } else {
      setDesks(newDesks);
    }
  };

  const runPlacement = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const { updatedStudents, updatedDesks } = performPlacement(students, desks, config.seatingType);
      setStudents(updatedStudents);
      setDesks(updatedDesks);
      setIsOptimizing(false);
    }, 600);
  };

  const renderEditModal = () => {
    const student = students.find(s => s.id === editingStudentId);
    if (!student) return null;
    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingStudentId(null)} />
        <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">Redigera Elev</h3>
            <button onClick={() => setEditingStudentId(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400">✕</button>
          </div>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Namn</label>
              <input type="text" value={student.name} onChange={(e) => updateStudent(student.id, { name: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Kön</label>
                <select value={student.gender} onChange={(e) => updateStudent(student.id, { gender: e.target.value as any })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option value="okant">Okänt</option>
                  <option value="kille">Kille</option>
                  <option value="tjej">Tjej</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Villkor</label>
                <select value={student.condition} onChange={(e) => updateStudent(student.id, { condition: e.target.value as any })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option value="ingen">Inga</option>
                  <option value="fram">Ska sitta fram</option>
                  <option value="bak">Ska sitta bak</option>
                  <option value="vid_vagg">Vid vägg</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Får INTE sitta med</label>
              <textarea value={student.notWith.join(', ')} onChange={(e) => updateStudent(student.id, { notWith: e.target.value.split(',').map(n => n.trim()).filter(n => n) })} className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm" placeholder="Ex: Alan, Grace..." />
            </div>
            <button onClick={() => setEditingStudentId(null)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg">Klar</button>
          </div>
        </div>
      </div>
    );
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  return (
    <div className={`flex flex-col h-full bg-white transition-all overflow-hidden ${config.isMonochrome ? 'monochrome-mode' : ''}`}>
      {renderEditModal()}
      
      <div className="flex border-b border-slate-100 shrink-0 px-6 gap-8 bg-slate-50/50">
        {['elever', 'inredning', 'klassrum', 'inställningar'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setConfig(prev => ({ ...prev, activeTab: tab }))} 
            className={`py-5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${config.activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'elever' ? '👥 Elever' : tab === 'inredning' ? '🪑 Inredning' : tab === 'klassrum' ? '🏫 Klassrum' : '⚙️ Inställningar'}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => {
            const data = desks.map(d => ({ "Bänk": d.id, "Plats 1": getStudentById(d.student1Id)?.name || '-', "Plats 2": getStudentById(d.student2Id)?.name || '-' }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Placering");
            XLSX.writeFile(wb, "Klassplacering.xlsx");
          }} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-500 hover:border-indigo-200 hover:text-indigo-600 shadow-sm"><span>📊 Excel</span></button>
          <button onClick={async () => {
            if (!canvasRef.current) return;
            const canvas = await html2canvas(canvasRef.current, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 10, 10, 277, 190);
            pdf.save("Klassplacering.pdf");
          }} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-indigo-700 shadow-md"><span>📄 PDF</span></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/20 overflow-y-auto custom-scrollbar p-6">
          {config.activeTab === 'elever' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lägg till elever</h4>
                  <button onClick={() => setIsBulkOpen(!isBulkOpen)} className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-lg">Import 📑</button>
                </div>
                {isBulkOpen ? (
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-3 animate-in fade-in zoom-in-95">
                    <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="Anna, Bengt..." className="w-full h-32 p-3 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                    <div className="flex gap-2"><button onClick={handleBulkAdd} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Lägg till</button><button onClick={() => setIsBulkOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Avbryt</button></div>
                  </div>
                ) : (
                  <input onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as any).value; if(val.trim()){ setStudents(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: val.trim(), gender: 'okant', condition: 'ingen', notWith: [], prefNotWith: [], prefWith: [], isPlaced: false }]); (e.target as any).value = ''; } } }} placeholder="Skriv namn och tryck Enter..." className="w-full p-4 text-sm rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-inner" />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Elever ({students.length})</h4>
                  <button onClick={clearAllStudents} className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase">Rensa alla</button>
                </div>
                <div className="space-y-1.5">{sortedStudents.map(s => (
                  <div key={s.id} className={`flex items-center gap-2 p-2 rounded-xl border transition-all group ${s.isPlaced ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${s.gender === 'kille' ? 'bg-blue-400' : s.gender === 'tjej' ? 'bg-pink-400' : 'bg-slate-300'}`} />
                    <span className={`text-xs font-bold truncate flex-1 ${s.isPlaced ? 'text-emerald-700' : 'text-slate-600'}`}>{s.name}</span>
                    <button onClick={() => setEditingStudentId(s.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all">✏️</button>
                    <button onClick={() => removeStudent(s.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all">✕</button>
                  </div>
                ))}</div>
              </div>
            </div>
          )}

          {config.activeTab === 'inredning' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Lägg till objekt</h4>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => addFurniture('teacher', 'Lärarbänk')} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-400 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">👨‍🏫</span>
                  <span className="text-xs font-bold text-slate-700">Lärarbänk</span>
                </button>
                <button onClick={() => addFurniture('door', 'Dörr')} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-400 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🚪</span>
                  <span className="text-xs font-bold text-slate-700">Dörr / Ingång</span>
                </button>
                <button onClick={() => addFurniture('window', 'Fönster')} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-400 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🪟</span>
                  <span className="text-xs font-bold text-slate-700">Fönster</span>
                </button>
                <button onClick={() => addFurniture('carpet', 'Matta')} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-400 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🧶</span>
                  <span className="text-xs font-bold text-slate-700">Samlingsmatta</span>
                </button>
              </div>
              <p className="text-[9px] text-slate-400 italic px-2">Klicka på ett objekt för att lägga till det i rummet. Dra sedan för att placera rätt.</p>
            </div>
          )}

          {config.activeTab === 'klassrum' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block px-1">Antal bänkar/öar</label><input type="number" value={config.deskCount} onChange={(e) => setConfig(prev => ({ ...prev, deskCount: Number(e.target.value) }))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-indigo-600" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block px-1">Platser per enhet</label><select value={config.seatsPerDeskVal} onChange={(e) => setConfig(prev => ({ ...prev, seatsPerDeskVal: e.target.value }))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"><option value="1">1 elev / bänk</option><option value="2">2 elever / bänk</option><option value="4_island">4 elever (Ö)</option></select></div>
                <button onClick={createClassroom} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">Bygg Layout 🏗️</button>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Optimering</h4>
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 space-y-4">
                   <select value={config.seatingType} onChange={(e) => setConfig(prev => ({ ...prev, seatingType: e.target.value as any }))} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                     <option value="mixat">Blanda Kille/Tjej</option>
                     <option value="separerat">Samma kön tillsammans</option>
                     <option value="ingen_kon_hansyn">Ingen könshänsyn</option>
                   </select>
                   <button onClick={runPlacement} disabled={isOptimizing || students.length === 0} className="w-full py-6 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all">{isOptimizing ? 'Beräknar...' : 'Smart Placering 🧠'}</button>
                   <button onClick={clearPlacementsOnly} className="w-full py-2 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase">Rensa placeringar</button>
                </div>
              </div>
            </div>
          )}

          {config.activeTab === 'inställningar' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300"><div className="space-y-3"><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Visning</h4><div className="grid grid-cols-1 gap-2"><button onClick={() => setConfig(prev => ({ ...prev, isMonochrome: !prev.isMonochrome }))} className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${config.isMonochrome ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}>Svartvit vy (Print)</button><button onClick={() => setConfig(prev => ({ ...prev, isRotated: !prev.isRotated }))} className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${config.isRotated ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}>Elevperspektiv (180°)</button></div></div><div className="pt-6 border-t border-slate-100"><button onClick={() => { if(confirm("Återställ all data?")) { setStudents([]); setDesks([]); setFurniture([]); } }} className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100">Fabriksåterställning</button></div></div>
          )}
        </aside>

        <main className="flex-1 bg-slate-100/40 p-10 overflow-auto custom-scrollbar relative flex items-center justify-center">
          <div ref={canvasRef} className={`relative bg-white shadow-2xl rounded-[4rem] border-8 border-white transition-all duration-1000 ease-in-out min-h-[850px] min-w-[1000px] ${config.isRotated ? 'rotate-180' : ''}`} style={{ width: '95%', height: '95%' }}>
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] z-20 shadow-xl opacity-80 ${config.isRotated ? 'rotate-180' : ''}`}>FRAM (Tavla)</div>
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-400 px-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] z-20 ${config.isRotated ? 'rotate-180' : ''}`}>BAK</div>
            
            {/* INREDNING */}
            {furniture.map(item => (
              <DraggableFurniture key={item.id} item={item} setFurniture={setFurniture} isRotated={config.isRotated} />
            ))}

            {/* BÄNKAR */}
            {desks.map(desk => (
              <DraggableDesk 
                key={desk.id} 
                desk={desk} 
                students={students} 
                setStudents={setStudents} 
                setDesks={setDesks}
                config={config}
                calculateScore={calculateScore}
                getScoreColor={getScoreColor}
                getStudentById={getStudentById}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassroomPlacement;
