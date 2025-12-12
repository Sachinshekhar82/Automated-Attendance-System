import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceScanner from './components/AttendanceScanner';
import StudentList from './components/StudentList';
import AttendanceRecords from './components/AttendanceRecords';
import Login from './components/Login';
import { AppView, Student } from './types';
import { loadStudents, saveStudents } from './services/storage';
import { loadModels } from './services/faceService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(true);

  useEffect(() => {
    // 1. Load Data
    setStudents(loadStudents());

    // 2. Load AI Models
    const initAI = async () => {
      try {
        await loadModels();
      } catch (e) {
        console.error(e);
        alert("Failed to load facial recognition models. Please refresh.");
      } finally {
        setIsModelsLoading(false);
      }
    };
    initAI();
  }, []);

  const handleAddStudent = (newStudent: Student) => {
    const updated = [...students, newStudent];
    setStudents(updated);
    saveStudents(updated); 
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveStudents(updated); 
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} students={students} />;
      case AppView.ATTENDANCE:
        return <AttendanceScanner students={students} />;
      case AppView.STUDENTS:
        return (
          <StudentList 
            students={students} 
            onAddStudent={handleAddStudent} 
            onDeleteStudent={handleDeleteStudent} 
          />
        );
      case AppView.RECORDS:
        return <AttendanceRecords students={students} />;
      default:
        return <Dashboard onChangeView={setCurrentView} students={students} />;
    }
  };

  if (isModelsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <h2 className="text-xl font-bold text-slate-700">Loading AI Models...</h2>
        <p className="text-slate-400">This happens once. Please wait.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;