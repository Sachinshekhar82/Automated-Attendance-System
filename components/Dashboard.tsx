import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, UserCheck, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react';
import { getAttendanceStats, MOCK_HISTORY } from '../services/mockData';
import { AppView, Student } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
  students: Student[];
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView, students }) => {
  const { average, trend } = getAttendanceStats(students, MOCK_HISTORY);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Dashboard</h1>
           <p className="text-slate-500 font-medium">Overview for Class 5A</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 text-sm font-bold text-slate-600 flex gap-2 items-center">
          <Calendar className="w-5 h-5 text-indigo-500" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Total Students</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
             <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Avg Attendance</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{average}%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
             <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Low Attendance</p>
            <h3 className="text-3xl font-extrabold text-slate-900">2</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Weekly Attendance Trend</h2>
            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} domain={[0, 100]} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                />
                <Bar dataKey="attendance" fill="#4f46e5" radius={[8, 8, 8, 8]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-xl flex flex-col justify-between h-[240px]">
                <div>
                    <h3 className="text-2xl font-bold mb-2">View Records</h3>
                    <p className="text-indigo-100 text-sm opacity-90">Access permanent history of all classroom sessions and absentee reports.</p>
                </div>
                <button 
                onClick={() => onChangeView(AppView.RECORDS)}
                className="bg-white text-indigo-700 px-6 py-4 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                >
                Open Records
                <ArrowUpRight className="w-5 h-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>

            <div onClick={() => onChangeView(AppView.STUDENTS)} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all hover:shadow-md flex items-center justify-between group">
               <div>
                  <h3 className="text-lg font-bold text-slate-800">Add Student</h3>
                  <p className="text-slate-400 text-sm font-medium">Register new profile</p>
               </div>
               <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <ArrowUpRight className="w-6 h-6" />
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
