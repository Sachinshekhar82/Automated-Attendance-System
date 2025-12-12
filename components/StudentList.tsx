import React, { useState, useRef, useEffect } from 'react';
import { Phone, Search, Trash2, AlertTriangle, Plus, Upload, X, QrCode, Camera } from 'lucide-react';
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
  const [newStudentName, setNewStudentName] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newGuardian, setNewGuardian] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhoto, setNewPhoto] = useState<string>('');
  
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

  // Clean up stream on unmount or modal close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Resize uploaded image
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
           const canvas = document.createElement('canvas');
           const MAX_WIDTH = 400;
           const scaleSize = MAX_WIDTH / img.width;
           canvas.width = MAX_WIDTH;
           canvas.height = img.height * scaleSize;
           const ctx = canvas.getContext('2d');
           if (ctx) {
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             setNewPhoto(canvas.toDataURL('image/jpeg', 0.8));
           }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (e) {
      console.error(e);
      alert("Unable to access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Resize to reduce memory usage and API payload
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const MAX_WIDTH = 400;
      const scale = MAX_WIDTH / videoWidth;
      
      canvas.width = MAX_WIDTH;
      canvas.height = videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // No mirror transform here, keep it simple for facial ID
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setNewPhoto(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newRollNo || !newPhoto) {
      alert("Name, Roll Number and Photo are required.");
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName,
      rollNumber: newRollNo,
      className: '5A',
      photoUrl: newPhoto,
      guardianName: newGuardian || 'N/A',
      contactNumber: newContact || 'N/A'
    };

    onAddStudent(newStudent);
    
    // Reset and Close
    setNewStudentName('');
    setNewRollNo('');
    setNewGuardian('');
    setNewContact('');
    setNewPhoto('');
    setIsAddModalOpen(false);
    stopCamera();
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <img 
                src={student.photoUrl} 
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-slate-100"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setStudentForQr(student)}
                  className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                  title="Show QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setStudentToDelete(student)}
                  className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Student"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
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

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Add New Student</h2>
              <button onClick={() => { setIsAddModalOpen(false); stopCamera(); }}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              
              {/* Photo Section */}
              <div className="flex flex-col items-center mb-6">
                 {isCameraOpen ? (
                   <div className="flex flex-col items-center gap-3 w-full">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-inner bg-black relative">
                         <video 
                           ref={videoRef} 
                           autoPlay 
                           playsInline 
                           muted 
                           className="w-full h-full object-cover transform scale-x-[-1]" 
                         />
                      </div>
                      <div className="flex gap-3">
                        <button 
                          type="button" 
                          onClick={capturePhoto} 
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          Capture
                        </button>
                        <button 
                          type="button" 
                          onClick={stopCamera} 
                          className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-3">
                     <div className="relative group">
                       <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                         {newPhoto ? (
                           <img src={newPhoto} alt="Preview" className="w-full h-full object-cover" />
                         ) : (
                           <Upload className="w-8 h-8 text-slate-400" />
                         )}
                       </div>
                       
                       {/* Overlay for File Upload */}
                       <input 
                         type="file" 
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         title="Upload Photo"
                       />
                     </div>
                     
                     <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-600 font-medium">Upload File</span>
                        <span className="text-slate-300">or</span>
                        <button 
                          type="button" 
                          onClick={startCamera} 
                          className="flex items-center gap-1.5 text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full transition-colors"
                        >
                           <Camera className="w-4 h-4" />
                           Take Photo
                        </button>
                     </div>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input required type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number *</label>
                  <input required type="text" value={newRollNo} onChange={e => setNewRollNo(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Name</label>
                  <input type="text" value={newGuardian} onChange={e => setNewGuardian(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                  <input type="text" value={newContact} onChange={e => setNewContact(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 mt-4">
                Register Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {studentForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 flex flex-col items-center">
             <div className="w-full flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Student QR Code</h3>
                <button onClick={() => setStudentForQr(null)}><X className="w-6 h-6 text-slate-400" /></button>
             </div>
             <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4 shadow-sm">
               <QRCode 
                  value={JSON.stringify({ id: studentForQr.id, name: studentForQr.name })}
                  size={200}
                  level="H"
               />
             </div>
             <h4 className="text-lg font-bold text-slate-900">{studentForQr.name}</h4>
             <p className="text-slate-500 text-sm mb-6">{studentForQr.rollNumber}</p>
             
             <button onClick={() => setStudentForQr(null)} className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">
               Close
             </button>
           </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Student?</h3>
             <p className="text-slate-500 mb-6">Are you sure you want to remove {studentToDelete.name}?</p>
             <div className="flex gap-3 justify-center">
                <button onClick={() => setStudentToDelete(null)} className="px-5 py-2.5 rounded-xl border border-slate-200">Cancel</button>
                <button onClick={confirmDelete} className="px-5 py-2.5 rounded-xl bg-red-600 text-white">Delete</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;