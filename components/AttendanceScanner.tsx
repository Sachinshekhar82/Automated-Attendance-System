import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle, Loader2, Sparkles, StopCircle, PlayCircle } from 'lucide-react';
import { identifyStudentsInGroup } from '../services/geminiService';
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

  // Auto-Scan Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoScanning && stream && !submitted) {
      // Fast interval (2.5s) enabled by image resizing optimization
      interval = setInterval(processFrame, 2500); 
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
      console.error("Error accessing camera:", err);
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

    // Filter students: We only need to check students who are NOT yet marked present.
    const absentStudents = students.filter(s => !attendance[s.id]);

    if (absentStudents.length === 0) {
      setIsAutoScanning(false);
      alert("All students accounted for!");
      return;
    }

    setIsProcessing(true);
    
    try {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // OPTIMIZATION: Resize image to max 500px width.
        // This makes the payload small enough for "instant" AI response.
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        const targetWidth = 500;
        const scale = targetWidth / videoWidth;
        const targetHeight = videoHeight * scale;

        canvasRef.current.width = targetWidth;
        canvasRef.current.height = targetHeight;
        
        context.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);
        
        // Use quality 0.8 to further reduce size without losing face details
        const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.8);

        // Send to Gemini
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
        <div className="flex flex-col items-center justify-center h-[500px] text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Attendance Recorded!</h2>
            <p className="text-slate-500">Data synced with district server.</p>
        </div>
    );
  }

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-100px)]">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Attendance</h1>
          <p className="text-sm text-slate-500">
            {presentCount} Present • {students.length - presentCount} Absent
          </p>
        </div>
        
        <button
          onClick={() => setIsAutoScanning(!isAutoScanning)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg
            ${isAutoScanning 
              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
              : 'bg-blue-600 text-white hover:bg-blue-700'}
          `}
        >
          {isAutoScanning ? (
            <> <StopCircle className="w-5 h-5" /> Stop Scan </>
          ) : (
            <> <PlayCircle className="w-5 h-5" /> Auto Scan </>
          )}
        </button>
      </div>

      {/* Main Content: Split View */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left: Camera Feed */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-md border border-slate-200">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover" 
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlays */}
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
              <Camera className="w-3 h-3" />
              {isAutoScanning ? 'Live AI Active' : 'Camera Ready'}
            </div>

            {isProcessing && (
              <div className="absolute inset-0 border-4 border-blue-500/50 rounded-2xl z-10 pointer-events-none flex items-center justify-center">
                 <div className="bg-blue-600/80 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning...
                 </div>
              </div>
            )}
            
            {!isProcessing && lastScannedCount > 0 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-fade-in-up">
                 Identified {lastScannedCount} Students!
               </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <div className="flex gap-3">
               <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
               <div className="text-sm text-blue-800">
                  <strong>How it works:</strong> Turn on "Auto Scan". The AI checks every few seconds and matches faces against the student directory.
               </div>
             </div>
          </div>
        </div>

        {/* Right: Student List */}
        <div className="lg:w-1/2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Class 5A Register</h3>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            <div className="grid grid-cols-1 gap-2">
              {students.map(student => {
                const isPresent = attendance[student.id];
                return (
                  <div 
                    key={student.id} 
                    className={`
                      flex items-center justify-between p-3 rounded-xl transition-all border
                      ${isPresent 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-slate-100 hover:border-slate-300'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={student.photoUrl} 
                          alt={student.name} 
                          className={`
                            w-10 h-10 rounded-full object-cover border-2
                            ${isPresent ? 'border-green-500' : 'border-slate-200'}
                          `}
                        />
                        {isPresent && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                             <CheckCircle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${isPresent ? 'text-green-800' : 'text-slate-900'}`}>
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">{student.rollNumber}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleManualToggle(student.id)}
                      className={`
                         px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                         ${isPresent 
                           ? 'bg-green-200 text-green-800 hover:bg-green-300' 
                           : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                      `}
                    >
                      {isPresent ? 'PRESENT' : 'ABSENT'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50">
             <button 
                onClick={handleSubmit}
                disabled={presentCount === 0}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
             >
               Finalize Attendance
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;