import React, { useState } from 'react';
import { FileText, Sparkles, Download, Share2 } from 'lucide-react';
import { MOCK_HISTORY } from '../services/mockData';
import { generateAttendanceReport } from '../services/geminiService';
import { Student } from '../types';

interface ReportsProps {
  students: Student[];
}

const Reports: React.FC<ReportsProps> = ({ students }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    // Use current students list instead of mock
    const result = await generateAttendanceReport(MOCK_HISTORY, students);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Insights</h1>
        <p className="text-slate-500 mt-1">Generate AI-powered summaries for administration and parents.</p>
      </div>

      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Weekly Attendance Analysis</h2>
          <p className="text-blue-100 max-w-lg mb-8">
            Analyze trends and generate a natural language report for the District Education Officer.
          </p>
          <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Analyzing...' : 'Generate AI Report'}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-900">Generated Report</h3>
             <div className="flex gap-2">
               <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><Download className="w-5 h-5" /></button>
             </div>
          </div>
          <div className="p-8 prose prose-slate max-w-none">
            {report.split('\n').map((line, i) => {
               if (line.trim().startsWith('#') || line.trim().startsWith('**')) return <h4 key={i} className="font-bold text-lg mt-4 mb-2 text-slate-800">{line.replace(/[#*]/g, '')}</h4>;
               return <p key={i} className="mb-2 text-slate-600">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;