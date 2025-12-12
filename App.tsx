import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceScanner from './components/AttendanceScanner';
import StudentList from './components/StudentList';
import Reports from './components/Reports';
import { AppView, Student } from './types';
import { MOCK_STUDENTS } from './services/mockData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  // Lifted state to manage students across the app
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

  const handleAddStudent = (newStudent: Student) => {
    setStudents([...students, newStudent]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} totalStudents={students.length} />;
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
        return <Dashboard onChangeView={setCurrentView} totalStudents={students.length} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;