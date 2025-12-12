import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle, Loader2, Sparkles, StopCircle, PlayCircle, XCircle, Save } from 'lucide-react';
import { identifyStudentsInGroup } from '../services/geminiService';
import { saveRecord } from '../services/storage'; // NEW: Save to storage
import { Student } from '../types';

interface AttendanceScannerProps {
  students: Student[];
}

const AttendanceScanner: React.FC<AttendanceScannerProps> = ({ students }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // State
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lastScannedCount, setLastScannedCount] = useState(0);

  // Initialize Camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Auto-Scan Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoScanning && stream && !submitted) {
      interval = setInterval(processFrame, 3000); 
    }
    return () => clearInterval(interval);
  }, [isAutoScanning, stream, attendance, submitted]); 

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const processFrame = async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current) return;
    const absentStudents = students.filter(s => !attendance[s.id]);

    if (absentStudents.length === 0) {
      setIsAutoScanning(false);
      return;
    }

    setIsProcessing(true);
    
    try {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        
        const targetWidth = 600; // Reverted to 600
        const scale = targetWidth / videoWidth;
        const targetHeight = videoHeight * scale;

        canvasRef.current.width = targetWidth;
        canvasRef.current.height = targetHeight;
        context.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);
        
        const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.9);

        const foundIds = await identifyStudentsInGroup(frameBase64, absentStudents);
        
        if (foundIds.length > 0) {
          setLastScannedCount(foundIds.length);
          setAttendance(prev => {
            const next = { ...prev };
            foundIds.forEach(id => next[id] = true);
            return next;
          });
        } else {
            setLastScannedCount(0);
        }
      }
    } catch (e) {
      console.error("Scan error", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualToggle = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    // SAVE PERMANENTLY
    const presentIds = Object.keys(attendance).filter(id => attendance[id]);
    
    saveRecord({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
      presentStudentIds: presentIds,
      totalStudentsCount: students.length,
      className: '5A' // Default for demo
    });

    setSubmitted(true);
    setTimeout(() => {
        setSubmitted(false);
        setAttendance({});
        setLastScannedCount(0);
        setIsAutoScanning(false);
    }, 2500);
  };

  if (submitted) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl">
            <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                <CheckCircle className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-extrabold text-green-800 mb-4">Attendance Saved!</h2>
            <p className="text-lg text-green-700">Permanent record created successfully.</p>
        </div>
    );
  }

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Attendance</h1>
          <p className="text-slate-500 font-medium">
            Class 5A • <span className="text-green-600 font-bold">{presentCount} Present</span>
          </p>
        </div>
        
        <button
          onClick={() => setIsAutoScanning(!isAutoScanning)}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl transform hover:-translate-y-1
            ${isAutoScanning 
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white animate-pulse' 
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700'}
          `}
        >
          {isAutoScanning ? (
            <> <StopCircle className="w-6 h-6" /> Stop Scanning </>
          ) : (
            <> <PlayCircle className="w-6 h-6" /> Start Auto Scan </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
        
        {/* Camera Feed */}
        <div className="lg:w-7/12 flex flex-col gap-6">
          <div className="relative w-full h-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200 min-h-[400px]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover opacity-90" 
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Status Overlays */}
            <div className="absolute top-6 left-6">
              <div className="bg-black/50 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md flex items-center gap-2 border border-white/10">
                <Camera className="w-4 h-4 text-emerald-400" />
                {isAutoScanning ? 'AI ACTIVE' : 'CAMERA READY'}
              </div>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                 <div className="bg-indigo-600/90 text-white px-8 py-4 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-sm animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-bold text-lg">Scanning Faces...</span>
                 </div>
              </div>
            )}
            
            {!isProcessing && lastScannedCount > 0 && (
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-2xl animate-fade-in-up flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-yellow-300" />
                 Found {lastScannedCount} Students!
               </div>
            )}
          </div>
        </div>

        {/* Instant Results Panel */}
        <div className="lg:w-5/12 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden h-[600px] lg:h-auto">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                Live Register
            </h3>
            <span className="text-xs font-bold px-3 py-1 bg-white border rounded-lg text-slate-500 uppercase tracking-wide">{students.length} Students</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-slate-50/50">
            {students.map(student => {
              const isPresent = attendance[student.id];
              return (
                <div 
                  key={student.id} 
                  className={`
                    flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border-2
                    ${isPresent 
                      ? 'bg-white border-emerald-400 shadow-lg scale-[1.02] z-10' 
                      : 'bg-white border-transparent hover:border-slate-200 shadow-sm'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={student.photoUrl} 
                        alt={student.name} 
                        className={`
                          w-14 h-14 rounded-2xl object-cover border-2 shadow-md
                          ${isPresent ? 'border-emerald-500' : 'border-slate-100 grayscale-[0.5]'}
                        `}
                      />
                      {isPresent && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 ring-4 ring-white shadow-sm">
                           <CheckCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${isPresent ? 'text-slate-900' : 'text-slate-500'}`}>
                        {student.name}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{student.rollNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleManualToggle(student.id)}
                    className={`
                       w-12 h-12 rounded-xl flex items-center justify-center transition-all
                       ${isPresent 
                         ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                         : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}
                    `}
                  >
                    {isPresent ? <CheckCircle className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-white">
             <button 
                onClick={handleSubmit}
                disabled={presentCount === 0}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:transform-none transition-all flex items-center justify-center gap-3"
             >
               <Save className="w-5 h-5" />
               Save Permanent Record
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;