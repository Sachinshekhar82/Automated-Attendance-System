import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, RefreshCw, Users, Sparkles, AlertTriangle } from 'lucide-react';
import { MOCK_STUDENTS } from '../services/mockData';
import { analyzeClassroomImage } from '../services/geminiService';
import { Student } from '../types';

const AttendanceScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ recognized: Student[], stats?: string } | null>(null);
  
  // Manual state
  const [manualAttendance, setManualAttendance] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Initialize manual attendance
    const initial: Record<string, boolean> = {};
    MOCK_STUDENTS.forEach(s => initial[s.id] = false);
    setManualAttendance(initial);

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
      setMode('MANUAL');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (mode === 'CAMERA' && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [mode, scanResult]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setScanning(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      const base64Data = imageData.split(',')[1];

      // Simulate Face Recognition Process
      // In a real app, we would send this to a face recognition server.
      // Here we will randomly "identify" students for the demo AND use Gemini for scene analysis.
      
      try {
        // 1. Get AI Insight about the scene
        const analysis = await analyzeClassroomImage(base64Data);

        // 2. Mock Face Identification (Random subset for demo)
        const recognizedStudents = MOCK_STUDENTS.filter(() => Math.random() > 0.4);
        
        // Update manual map with recognized
        const newManual = { ...manualAttendance };
        recognizedStudents.forEach(s => newManual[s.id] = true);
        setManualAttendance(newManual);

        setScanResult({
          recognized: recognizedStudents,
          stats: analysis
        });
      } catch (e) {
        console.error(e);
      } finally {
        setScanning(false);
        stopCamera();
      }
    }
  };

  const handleManualToggle = (id: string) => {
    setManualAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // In a real app, this would POST to backend
    setTimeout(() => {
        setSubmitted(false);
        setScanResult(null);
        setMode('MANUAL'); // Reset to manual list or dashboard
        // Reset manual checks? keeping them for now as "today's state"
    }, 2000);
  };

  const resetScan = () => {
    setScanResult(null);
    setMode('CAMERA');
  };

  if (submitted) {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Attendance Recorded!</h2>
            <p className="text-slate-500 mt-2">Data has been synced with the district server.</p>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('CAMERA')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'CAMERA' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500'}`}
          >
            AI Scan
          </button>
          <button
            onClick={() => setMode('MANUAL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'MANUAL' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500'}`}
          >
            Manual List
          </button>
        </div>
      </div>

      {mode === 'CAMERA' && !scanResult && (
        <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
             <button
                onClick={captureAndAnalyze}
                disabled={scanning}
                className="bg-white text-blue-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
             >
                {scanning ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
             </button>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            Live View • Class 5A
          </div>
        </div>
      )}

      {scanResult && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
           <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                 <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                 <h3 className="text-lg font-bold text-slate-900">AI Analysis Complete</h3>
                 <p className="text-sm text-slate-600 mt-1">{scanResult.stats}</p>
                 <div className="mt-3 flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {scanResult.recognized.length} Faces Recognized
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Confirm Below
                    </span>
                 </div>
              </div>
              <button onClick={resetScan} className="text-slate-400 hover:text-slate-600">
                <RefreshCw className="w-5 h-5" />
              </button>
           </div>
           
           <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800 mb-6 flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Please verify the AI identified students before submitting.
           </div>
        </div>
      )}

      {(mode === 'MANUAL' || scanResult) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-semibold text-slate-700">Student List (Class 5A)</h3>
             <span className="text-sm text-slate-500">
               {Object.values(manualAttendance).filter(Boolean).length} / {MOCK_STUDENTS.length} Present
             </span>
           </div>
           <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
             {MOCK_STUDENTS.map(student => (
               <div key={student.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                 <img 
                    src={student.photoUrl} 
                    alt={student.name} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                 />
                 <div className="flex-1">
                   <p className="font-medium text-slate-900">{student.name}</p>
                   <p className="text-xs text-slate-500">Roll: {student.rollNumber}</p>
                 </div>
                 <button
                   onClick={() => handleManualToggle(student.id)}
                   className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${manualAttendance[student.id] 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}
                   `}
                 >
                   {manualAttendance[student.id] ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                 </button>
               </div>
             ))}
           </div>
           <div className="p-4 border-t border-slate-100 bg-slate-50">
             <button 
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
             >
               Submit Attendance
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;
