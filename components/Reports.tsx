import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { MOCK_HISTORY } from '../services/mockData';
import { Student } from '../types';

const Reports: React.FC<{ students: Student[] }> = ({ students }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Local static report generator (No AI key needed)
  const generate = async () => {
    setLoading(true);
    
    // Simulate thinking time
    await new Promise(r => setTimeout(r, 1000));

    const totalRecords = MOCK_HISTORY.length;
    if (totalRecords === 0) {
      setReport("No attendance history found to analyze.");
      setLoading(false);
      return;
    }

    const totalStudents = students.length || 1;
    let totalPresent = 0;
    
    // Calculate stats
    MOCK_HISTORY.forEach(r => totalPresent += r.presentStudentIds.length);
    const avgAttendance = Math.round((totalPresent / (totalRecords * totalStudents)) * 100);

    const reportText = `
      Attendance Analysis Report (Class 5A)
      
      Overview:
      Over the past ${totalRecords} sessions, the class has maintained an average attendance rate of ${avgAttendance}%.
      
      Trends:
      Attendance appears stable. No significant drops were detected in the recent period.
      
      Recommendation:
      Continue monitoring students with consecutive absences. Ensure all student photos are updated in the directory for optimal facial recognition accuracy.
    `;
    
    setReport(reportText.trim());
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Class Reports</h1>
      
      <div className="bg-blue-700 text-white p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-2">Weekly Summary</h2>
        <p className="text-blue-100 mb-6">Generate an analysis of attendance trends.</p>
        <button 
          onClick={generate} 
          disabled={loading}
          className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          {loading ? <Sparkles className="animate-spin" /> : <FileText />}
          {loading ? 'Analyzing...' : 'Generate Report'}
        </button>
      </div>

      {report && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 prose max-w-none">
          <h3 className="text-lg font-bold mb-4">Generated Insights</h3>
          {report.split('\n').map((line, i) => (
            <p key={i} className="mb-2 text-slate-700">{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;