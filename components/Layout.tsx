import React, { useState } from 'react';
import { AppView } from '../types';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  Menu, 
  X, 
  School
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.ATTENDANCE, label: 'Attendance', icon: UserCheck },
    { id: AppView.STUDENTS, label: 'Students', icon: Users },
    { id: AppView.REPORTS, label: 'Reports & AI', icon: FileText },
  ];

  const handleNavClick = (view: AppView) => {
    onChangeView(view);
    setIsSidebarOpen(false); // Close mobile menu on select
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-blue-700 text-white flex items-center justify-between px-4 z-20 shadow-md">
        <div className="flex items-center gap-2">
           <School className="w-6 h-6" />
           <span className="font-bold text-lg">Gramin Shiksha</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-20 transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          pt-16 lg:pt-0
        `}
      >
        <div className="hidden lg:flex items-center gap-3 h-16 px-6 border-b border-slate-200 bg-blue-700 text-white">
          <School className="w-6 h-6" />
          <span className="font-bold text-xl">Gramin Shiksha</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 p-4 bg-blue-50 rounded-xl">
           <p className="text-xs text-blue-600 font-semibold mb-1">Status: Online</p>
           <p className="text-xs text-slate-500">Data synced: Just now</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 h-full relative">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
