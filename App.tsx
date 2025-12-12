import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceScanner from './components/AttendanceScanner';
import StudentList from './components/StudentList';
import AttendanceRecords from './components/AttendanceRecords'; // NEW
import Login from './components/Login';
import { AppView, Student } from './types';
import { loadStudents, saveStudents } from './services/storage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Load students from storage instead of just mock data
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Load data on mount
    setStudents(loadStudents());
  }, []);

  const handleAddStudent = (newStudent: Student) => {
    const updated = [...students, newStudent];
    setStudents(updated);
    saveStudents(updated); // Save immediately
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveStudents(updated); // Save immediately
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
