import React, { useState } from 'react';
import { FileText, Sparkles, Download, Share2 } from 'lucide-react';
import { MOCK_HISTORY, MOCK_STUDENTS } from '../services/mockData';
import { generateAttendanceReport } from '../services/geminiService';

const Reports: React.FC = () => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    const result = await generateAttendanceReport(MOCK_HISTORY, MOCK_STUDENTS);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Insights</h1>
        <p className="text-slate-500 mt-1">Generate AI-powered summaries for administration and parents.</p>
      </div>

      {/* Main Action Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Weekly Attendance Analysis</h2>
          <p className="text-blue-100 max-w-lg mb-8">
            Use our AI agent to analyze trends, identify frequent absentees, and generate a natural language report suitable for the District Education Officer.
          </p>
          <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Analyzing Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Report
              </>
            )}
          </button>
        </div>
        
        {/* Decor */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>

      {/* Report Output */}
      {report && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="font-bold text-slate-900">Generated Report</h3>
                 <p className="text-xs text-slate-500">Based on data from the last 7 days</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-8 prose prose-slate max-w-none">
            {/* Simple Markdown Rendering */}
            {report.split('\n').map((line, i) => {
               if (line.startsWith('**')) return <h4 key={i} className="font-bold text-lg mt-4 mb-2 text-slate-800">{line.replace(/\*\*/g, '')}</h4>;
               if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-4 text-slate-700">{line.replace(/^[\*\-]\s/, '')}</li>;
               return <p key={i} className="mb-2 text-slate-600 leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
      )}

      {/* Example static reports list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
           <h3 className="font-semibold text-slate-900 mb-4">Past Reports</h3>
           <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-3">
                     <FileText className="w-5 h-5 text-slate-400" />
                     <div>
                       <p className="text-sm font-medium text-slate-800">Monthly Summary - August</p>
                       <p className="text-xs text-slate-400">Generated on Aug 30, 2024</p>
                     </div>
                  </div>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">Submitted</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100">
           <h3 className="font-semibold text-slate-900 mb-4">Export Options</h3>
           <div className="space-y-3">
             <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
               <span className="font-medium text-slate-700 group-hover:text-blue-700">Excel Format (.xlsx)</span>
               <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
             </button>
             <button className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
               <span className="font-medium text-slate-700 group-hover:text-blue-700">Government Portal JSON</span>
               <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
