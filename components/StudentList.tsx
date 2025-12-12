import React, { useState, useRef, useEffect } from 'react';
import { Phone, Search, Trash2, Plus, Upload, X, QrCode, Camera } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent, onDeleteStudent }) => {
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentForQr, setStudentForQr] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [guardian, setGuardian] = useState('');
  const [contact, setContact] = useState('');
  const [photo, setPhoto] = useState<string>('');
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (e) {
      console.error(e);
      alert("Camera access denied.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      // OPTIMIZATION: Increased resolution for better AI accuracy
      const MAX_WIDTH = 800; // Changed from 400 to 800
      const scale = MAX_WIDTH / videoWidth;
      canvas.width = MAX_WIDTH;
      canvas.height = videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // No mirroring for ID purposes
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL('image/jpeg', 0.9)); // Increased quality to 0.9
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        // Resize uploaded file too
        const img = new Image();
        img.src = ev.target?.result as string;
        img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 800; // Changed from 400 to 800
           const scale = MAX_WIDTH / img.width;
           canvas.width = MAX_WIDTH;
           canvas.height = img.height * scale;
           const ctx = canvas.getContext('2d');
           if (ctx) {
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             setPhoto(canvas.toDataURL('image/jpeg', 0.9));
           }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roll || !photo) {
      alert("Please provide Name, Roll No and a Photo.");
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name,
      rollNumber: roll,
      className: '5A',
      photoUrl: photo,
      guardianName: guardian || 'N/A',
      contactNumber: contact || 'N/A'
    };

    onAddStudent(newStudent);
    
    // Reset
    setName(''); setRoll(''); setGuardian(''); setContact(''); setPhoto('');
    setIsAddModalOpen(false);
    stopCamera();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <img 
                src={student.photoUrl} 
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
              />
              <div className="flex gap-1">
                <button onClick={() => setStudentForQr(student)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                  <QrCode className="w-5 h-5" />
                </button>
                <button onClick={() => setStudentToDelete(student)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-slate-900 text-lg">{student.name}</h3>
            <p className="text-sm text-slate-500">Roll: {student.rollNumber} • Class {student.className}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-50 space-y-2 text-sm text-slate-600">
               <div className="flex justify-between">
                 <span>Guardian:</span>
                 <span className="font-medium">{student.guardianName}</span>
               </div>
               <div className="flex justify-between">
                 <span>Contact:</span>
                 <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span className="font-medium">{student.contactNumber}</span>
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Add New Student</h2>
              <button onClick={() => { setIsAddModalOpen(false); stopCamera(); }}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="flex flex-col items-center mb-6 gap-4">
                 {isCameraOpen ? (
                   <div className="w-full flex flex-col items-center gap-3">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 bg-black">
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={capturePhoto} className="bg-blue-600 text-white px-4 py-1 rounded text-sm font-medium">Capture</button>
                        <button type="button" onClick={stopCamera} className="bg-slate-200 text-slate-700 px-4 py-1 rounded text-sm font-medium">Cancel</button>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-3">
                     <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                       {photo ? (
                         <img src={photo} className="w-full h-full object-cover" />
                       ) : (
                         <Upload className="w-8 h-8 text-slate-400" />
                       )}
                       <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>
                     <button type="button" onClick={startCamera} className="text-blue-600 font-medium text-sm flex items-center gap-1">
                        <Camera className="w-4 h-4" /> Use Camera
                     </button>
                   </div>
                 )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">FULL NAME *</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ROLL NO *</label>
                    <input required type="text" value={roll} onChange={e => setRoll(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">GUARDIAN NAME</label>
                    <input type="text" value={guardian} onChange={e => setGuardian(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">CONTACT NUMBER</label>
                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 mt-6 shadow-lg">
                Register Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {studentForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-6 flex flex-col items-center max-w-sm w-full">
             <div className="w-full flex justify-end mb-2">
               <button onClick={() => setStudentForQr(null)}><X className="w-6 h-6 text-slate-400" /></button>
             </div>
             <div className="bg-white p-2 rounded-xl border border-slate-100 mb-4">
               <QRCode value={JSON.stringify({ id: studentForQr.id })} size={180} />
             </div>
             <h3 className="font-bold text-lg">{studentForQr.name}</h3>
             <p className="text-slate-500">{studentForQr.rollNumber}</p>
           </div>
        </div>
      )}

      {/* Delete Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
             <h3 className="font-bold text-lg mb-2">Delete Student?</h3>
             <p className="text-slate-500 mb-6 text-sm">This action cannot be undone.</p>
             <div className="flex gap-3 justify-center">
               <button onClick={() => setStudentToDelete(null)} className="px-4 py-2 rounded-lg border">Cancel</button>
               <button onClick={() => { onDeleteStudent(studentToDelete.id); setStudentToDelete(null); }} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
