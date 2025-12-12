import React, { useState } from 'react';
import { AppView } from '../types';
import { LayoutDashboard, UserCheck, Users, FileText, Menu, X, School } from 'lucide-react';

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
    { id: AppView.REPORTS, label: 'Reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full h-16 bg-blue-700 text-white flex items-center justify-between px-4 z-20 shadow-md">
        <span className="font-bold text-lg flex items-center gap-2"><School className="w-5 h-5" /> Gramin Shiksha</span>
        <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
      </div>

      {/* Sidebar */}
      <aside className={`
          fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-20 transition-transform duration-300
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          pt-16 lg:pt-0
      `}>
        <div className="hidden lg:flex h-16 items-center px-6 bg-blue-700 text-white font-bold text-xl gap-2">
           <School className="w-6 h-6" /> Gramin Shiksha
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onChangeView(item.id); setIsOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default Layout;
