import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { MOCK_HISTORY } from '../services/mockData';
import { generateAttendanceReport } from '../services/geminiService';
import { Student } from '../types';

const Reports: React.FC<{ students: Student[] }> = ({ students }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await generateAttendanceReport(MOCK_HISTORY, students);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">AI Reports</h1>
      
      <div className="bg-blue-700 text-white p-8 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-2">Weekly Summary</h2>
        <p className="text-blue-100 mb-6">Generate a natural language analysis of attendance trends.</p>
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
