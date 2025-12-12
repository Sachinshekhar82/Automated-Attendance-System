import React, { useState } from 'react';
import { AppView } from '../types';
import { LayoutDashboard, UserCheck, Users, Archive, Menu, X, School, LogOut } from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.ATTENDANCE, label: 'Attendance', icon: UserCheck },
    { id: AppView.STUDENTS, label: 'Students', icon: Users },
    { id: AppView.RECORDS, label: 'Records & History', icon: Archive },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full h-16 bg-indigo-700 text-white flex items-center justify-between px-4 z-20 shadow-lg">
        <span className="font-extrabold text-lg flex items-center gap-2 tracking-tight"><School className="w-6 h-6" /> Gramin Shiksha</span>
        <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
      </div>

      {/* Sidebar */}
      <aside className={`
          fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-100 z-20 transition-transform duration-300 shadow-2xl lg:shadow-none
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          pt-20 lg:pt-0 flex flex-col
      `}>
        <div className="hidden lg:flex h-24 items-center px-8 bg-gradient-to-r from-indigo-700 to-blue-700 text-white">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <School className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="font-extrabold text-lg leading-tight">Gramin Shiksha</h1>
               <p className="text-indigo-200 text-xs font-medium">Admin Portal</p>
             </div>
           </div>
        </div>

        <nav className="p-6 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onChangeView(item.id); setIsOpen(false); }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200
                  ${active 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                `}
              >
                <Icon className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
           <button 
             onClick={() => window.location.reload()}
             className="w-full flex items-center gap-3 px-5 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
           >
             <LogOut className="w-5 h-5" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0 bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
          {children}
        </div>
      </main>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default Layout;
