import { Student, AttendanceRecord } from '../types';

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Aarav Patel', rollNumber: '5A-01', className: '5A', photoUrl: 'https://picsum.photos/seed/aarav/200/200', guardianName: 'Suresh Patel', contactNumber: '9876543210' },
  { id: '2', name: 'Diya Sharma', rollNumber: '5A-02', className: '5A', photoUrl: 'https://picsum.photos/seed/diya/200/200', guardianName: 'Anita Sharma', contactNumber: '9876543211' },
  { id: '3', name: 'Ishaan Gupta', rollNumber: '5A-03', className: '5A', photoUrl: 'https://picsum.photos/seed/ishaan/200/200', guardianName: 'Vikram Gupta', contactNumber: '9876543212' },
  { id: '4', name: 'Ananya Singh', rollNumber: '5A-04', className: '5A', photoUrl: 'https://picsum.photos/seed/ananya/200/200', guardianName: 'Pooja Singh', contactNumber: '9876543213' },
  { id: '5', name: 'Vihaan Kumar', rollNumber: '5A-05', className: '5A', photoUrl: 'https://picsum.photos/seed/vihaan/200/200', guardianName: 'Rajesh Kumar', contactNumber: '9876543214' },
];

const generateHistory = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  for (let i = 5; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Simulate ~80% attendance
    const presentIds = MOCK_STUDENTS
      .filter(() => Math.random() > 0.2)
      .map(s => s.id);

    records.push({
      id: `hist-${i}`,
      date: dateStr,
      timestamp: date.getTime(),
      presentStudentIds: presentIds,
      totalStudentsCount: MOCK_STUDENTS.length,
      className: '5A'
    });
  }
  return records;
};

export const MOCK_HISTORY = generateHistory();

export const getAttendanceStats = (currentStudents: Student[], history: AttendanceRecord[]) => {
  const totalRecords = history.length;
  if (totalRecords === 0) return { average: 0, trend: [] };

  const totalPresent = history.reduce((acc, curr) => acc + curr.presentStudentIds.length, 0);
  const totalPossible = totalRecords * currentStudents.length;
  
  const average = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

  const trend = history.map(rec => ({
    name: new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short' }),
    attendance: Math.round((rec.presentStudentIds.length / Math.max(rec.totalStudentsCount, 1)) * 100)
  }));

  return { average, trend };
};
