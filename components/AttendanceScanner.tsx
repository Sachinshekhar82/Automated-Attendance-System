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

  // Auto-Scan Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoScanning && stream && !submitted) {
      // Run every 3 seconds to allow for parallel processing time
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
      alert("Could not access camera. Please check permissions.");
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

    // Only check absent students to save AI resources
    const absentStudents = students.filter(s => !attendance[s.id]);

    if (absentStudents.length === 0) {
      setIsAutoScanning(false);
      alert("All students are present!");
      return;
    }

    setIsProcessing(true);
    
    try {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // --- OPTIMIZATION START ---
        // Resize video frame to 600px width.
        // 600px provides better detail for faces than 500px while keeping payload manageable.
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        const targetWidth = 600;
        const scale = targetWidth / videoWidth;
        const targetHeight = videoHeight * scale;

        canvasRef.current.width = targetWidth;
        canvasRef.current.height = targetHeight;
        
        // Draw resize
        context.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);
        
        // Convert to quality JPEG
        const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
        // --- OPTIMIZATION END ---

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
    // Reset after animation
    setTimeout(() => {
        setSubmitted(false);
        setAttendance({});
        setLastScannedCount(0);
        setIsAutoScanning(false);
    }, 2500);
  };

  if (submitted) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Attendance Recorded</h2>
            <p className="text-slate-500">The class register has been updated.</p>
        </div>
    );
  }

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Attendance</h1>
          <p className="text-slate-500">
            Scanning Class 5A • {presentCount} Present
          </p>
        </div>
        
        <button
          onClick={() => setIsAutoScanning(!isAutoScanning)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md w-full sm:w-auto justify-center
            ${isAutoScanning 
              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
              : 'bg-blue-600 text-white hover:bg-blue-700'}
          `}
        >
          {isAutoScanning ? (
            <> <StopCircle className="w-5 h-5" /> Stop Scan </>
          ) : (
            <> <PlayCircle className="w-5 h-5" /> Start Auto Scan </>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        
        {/* Camera Feed */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-200 min-h-[300px]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover" 
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Status Overlays */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md flex items-center gap-2">
                <Camera className="w-3 h-3" />
                {isAutoScanning ? 'AI Watching...' : 'Camera Standby'}
              </div>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                 <div className="bg-white/90 text-blue-700 px-5 py-2 rounded-full flex items-center gap-3 shadow-lg backdrop-blur-sm animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-bold text-sm">Identifying Faces...</span>
                 </div>
              </div>
            )}
            
            {!isProcessing && lastScannedCount > 0 && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce">
                 Found {lastScannedCount} Students!
               </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
             <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
             <p className="text-sm text-blue-800">
               <strong>Tip:</strong> Ensure adequate lighting. The AI scans every 3 seconds. Students can sit naturally; they don't need to line up.
             </p>
          </div>
        </div>

        {/* Register List */}
        <div className="lg:w-1/3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-[500px] lg:h-auto">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Class Register</h3>
            <span className="text-xs font-medium px-2 py-1 bg-white border rounded text-slate-500">{students.length} Total</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {students.map(student => {
              const isPresent = attendance[student.id];
              return (
                <div 
                  key={student.id} 
                  className={`
                    flex items-center justify-between p-3 rounded-xl transition-all border
                    ${isPresent 
                      ? 'bg-green-50 border-green-200 shadow-sm' 
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
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 ring-2 ring-white">
                           <CheckCircle className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isPresent ? 'text-green-800' : 'text-slate-900'}`}>
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500">{student.rollNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleManualToggle(student.id)}
                    className={`
                       px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                       ${isPresent 
                         ? 'bg-green-200 text-green-800 hover:bg-green-300' 
                         : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                    `}
                  >
                    {isPresent ? 'P' : 'A'}
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50">
             <button 
                onClick={handleSubmit}
                disabled={presentCount === 0}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-lg"
             >
               Submit Attendance
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;
