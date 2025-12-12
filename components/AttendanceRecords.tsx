import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, Users, Search } from 'lucide-react';
import { AttendanceRecord, Student } from '../types';
import { loadRecords } from '../services/storage';

interface AttendanceRecordsProps {
  students: Student[];
}

const AttendanceRecords: React.FC<AttendanceRecordsProps> = ({ students }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredRecords = records.filter(r => 
    r.date.includes(searchTerm) || 
    r.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentDetails = (id: string) => students.find(s => s.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2">Attendance Records</h1>
           <p className="text-indigo-100 opacity-90">Permanent history of all class sessions.</p>
        </div>
        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-48 h-48 text-white opacity-10" />
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
         <div className="flex items-center gap-3 w-full max-w-md bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search className="text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by date or class..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none w-full text-slate-700 font-medium"
            />
         </div>
         <div className="text-right">
            <span className="text-2xl font-bold text-slate-800">{records.length}</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sessions</p>
         </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600">No Records Found</h3>
              <p className="text-slate-400">Perform a scan to save your first record.</p>
           </div>
        ) : (
          filteredRecords.map((record) => {
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            // Calculate Present vs Absent Lists based on CURRENT student directory
            // Note: In a real app, you'd save the full student object snapshot.
            const presentStudents = record.presentStudentIds
                .map(id => getStudentDetails(id))
                .filter((s): s is Student => !!s);
                
            const absentStudents = students.filter(s => !record.presentStudentIds.includes(s.id));
            
            const attendancePct = Math.round((record.presentStudentIds.length / students.length) * 100);
            const isExpanded = expandedId === record.id;

            return (
              <div key={record.id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-xl border-indigo-200 ring-4 ring-indigo-50' : 'shadow-sm border-slate-100 hover:shadow-md'}`}>
                
                {/* Card Header */}
                <div 
                  onClick={() => toggleExpand(record.id)}
                  className="p-6 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                     <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-white shadow-lg ${attendancePct > 75 ? 'bg-emerald-500' : attendancePct > 50 ? 'bg-amber-500' : 'bg-red-500'}`}>
                        <span className="text-xl">{attendancePct}%</span>
                        <span className="text-[10px] opacity-80 uppercase">Present</span>
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">{formattedDate}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                           <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Class {record.className}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(record.timestamp).toLocaleTimeString()}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <div className="hidden md:flex gap-8 text-right">
                        <div>
                           <p className="text-2xl font-bold text-emerald-600">{presentStudents.length}</p>
                           <p className="text-xs text-slate-400 font-bold uppercase">Present</p>
                        </div>
                        <div>
                           <p className="text-2xl font-bold text-red-500">{absentStudents.length}</p>
                           <p className="text-xs text-slate-400 font-bold uppercase">Absent</p>
                        </div>
                     </div>
                     <div className={`bg-slate-100 p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}>
                        <ChevronDown className="w-6 h-6" />
                     </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                   <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         
                         {/* Present List */}
                         <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
                            <h4 className="flex items-center gap-2 text-emerald-700 font-bold mb-4 border-b border-emerald-50 pb-3">
                               <CheckCircle className="w-5 h-5" /> Present Students ({presentStudents.length})
                            </h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                               {presentStudents.map(s => (
                                  <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                                     <img src={s.photoUrl} className="w-10 h-10 rounded-full border border-emerald-200 object-cover" />
                                     <div>
                                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                                        <p className="text-xs text-emerald-600 font-medium">{s.rollNumber}</p>
                                     </div>
                                  </div>
                               ))}
                               {presentStudents.length === 0 && <p className="text-slate-400 text-sm italic">No one present.</p>}
                            </div>
                         </div>

                         {/* Absent List */}
                         <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                            <h4 className="flex items-center gap-2 text-red-700 font-bold mb-4 border-b border-red-50 pb-3">
                               <XCircle className="w-5 h-5" /> Absent Students ({absentStudents.length})
                            </h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                               {absentStudents.map(s => (
                                  <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                     <img src={s.photoUrl} className="w-10 h-10 rounded-full border border-red-200 grayscale object-cover" />
                                     <div>
                                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                                        <p className="text-xs text-red-500 font-medium">Guardian: {s.guardianName}</p>
                                     </div>
                                     <button className="ml-auto text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold hover:bg-red-200">
                                        Call
                                     </button>
                                  </div>
                               ))}
                               {absentStudents.length === 0 && <p className="text-slate-400 text-sm italic">Everyone present!</p>}
                            </div>
                         </div>

                      </div>
                   </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;
