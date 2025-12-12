import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../services/mockData';
import { Phone, Search, Trash2, AlertTriangle } from 'lucide-react';
import { Student } from '../types';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <img 
                src={student.photoUrl} 
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <button 
                onClick={() => setStudentToDelete(student)}
                className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Student"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="font-bold text-slate-900 text-lg">{student.name}</h3>
            <p className="text-sm text-slate-500 mb-4">Roll No: {student.rollNumber} • Class {student.className}</p>
            
            <div className="space-y-2 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-400">Guardian:</span>
                <span>{student.guardianName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{student.contactNumber}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
          <p>No students found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all scale-100">
              <div className="p-6 text-center">
                 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Student?</h3>
                 <p className="text-slate-500 mb-6">
                   Are you sure you want to remove <span className="font-semibold text-slate-900">{studentToDelete.name}</span> from the directory? This action cannot be undone.
                 </p>
                 
                 <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => setStudentToDelete(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                      Delete Student
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;