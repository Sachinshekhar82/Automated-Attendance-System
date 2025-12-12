import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceScanner from './components/AttendanceScanner';
import StudentList from './components/StudentList';
import Reports from './components/Reports';
import Login from './components/Login';
import { AppView, Student } from './types';
import { MOCK_STUDENTS } from './services/mockData';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Removed LocalStorage logic. Always initialize with default Mock Data.
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents([...students, newStudent]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
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
      case AppView.REPORTS:
        return <Reports students={students} />;
      default:
        return <Dashboard onChangeView={setCurrentView} students={students} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;