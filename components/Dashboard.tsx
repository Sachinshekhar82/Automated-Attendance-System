import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, UserCheck, AlertCircle, Calendar } from 'lucide-react';
import { getAttendanceStats } from '../services/mockData';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
  totalStudents: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView, totalStudents }) => {
  const { average, trend } = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
           <p className="text-slate-500">Welcome back, Sourav Singh .</p>
        </div>
        <div className="text-sm bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg Attendance</p>
            <h3 className="text-2xl font-bold text-slate-900">{average}%</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Low Attendance</p>
            <h3 className="text-2xl font-bold text-slate-900">3</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Weekly Attendance Trend</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white">
            <h3 className="text-lg font-bold mb-2">Automated Report</h3>
            <p className="text-blue-100 mb-4 text-sm">Generate reports for the education department.</p>
            <button 
              onClick={() => onChangeView(AppView.REPORTS)}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Go to Reports
            </button>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-100">
           <h3 className="text-lg font-bold mb-4 text-slate-900">Quick Actions</h3>
           <div className="space-y-3">
             <button 
               onClick={() => onChangeView(AppView.STUDENTS)}
               className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 text-sm font-medium transition-colors"
             >
               Add New Student
             </button>
             <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 text-sm font-medium transition-colors">
               Export Data (CSV)
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;