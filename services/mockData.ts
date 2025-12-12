import { Student, AttendanceRecord } from '../types';

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Aarav Patel', rollNumber: '5A-01', className: '5A', photoUrl: 'https://picsum.photos/seed/aarav/200/200', guardianName: 'Suresh Patel', contactNumber: '9876543210' },
  { id: '2', name: 'Diya Sharma', rollNumber: '5A-02', className: '5A', photoUrl: 'https://picsum.photos/seed/diya/200/200', guardianName: 'Anita Sharma', contactNumber: '9876543211' },
  { id: '3', name: 'Ishaan Gupta', rollNumber: '5A-03', className: '5A', photoUrl: 'https://picsum.photos/seed/ishaan/200/200', guardianName: 'Vikram Gupta', contactNumber: '9876543212' },
  { id: '4', name: 'Ananya Singh', rollNumber: '5A-04', className: '5A', photoUrl: 'https://picsum.photos/seed/ananya/200/200', guardianName: 'Pooja Singh', contactNumber: '9876543213' },
  { id: '5', name: 'Vihaan Kumar', rollNumber: '5A-05', className: '5A', photoUrl: 'https://picsum.photos/seed/vihaan/200/200', guardianName: 'Rajesh Kumar', contactNumber: '9876543214' },
  { id: '6', name: 'Aditi Verma', rollNumber: '5A-06', className: '5A', photoUrl: 'https://picsum.photos/seed/aditi/200/200', guardianName: 'Sunita Verma', contactNumber: '9876543215' },
  { id: '7', name: 'Kabir Das', rollNumber: '5A-07', className: '5A', photoUrl: 'https://picsum.photos/seed/kabir/200/200', guardianName: 'Mohan Das', contactNumber: '9876543216' },
  { id: '8', name: 'Meera Reddy', rollNumber: '5A-08', className: '5A', photoUrl: 'https://picsum.photos/seed/meera/200/200', guardianName: 'Lakshmi Reddy', contactNumber: '9876543217' },
];

const generateHistory = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random attendance
    const presentIds = MOCK_STUDENTS
      .filter(() => Math.random() > 0.2) // 80% attendance avg
      .map(s => s.id);

    records.push({
      id: `rec-${i}`,
      date: dateStr,
      presentStudentIds: presentIds,
      totalStudents: MOCK_STUDENTS.length,
    });
  }
  return records;
};

export const MOCK_HISTORY = generateHistory();

export const getAttendanceStats = () => {
  const totalRecords = MOCK_HISTORY.length;
  if (totalRecords === 0) return { average: 0, trend: [] };

  const totalPresent = MOCK_HISTORY.reduce((acc, curr) => acc + curr.presentStudentIds.length, 0);
  const totalPossible = totalRecords * MOCK_STUDENTS.length;
  
  const average = Math.round((totalPresent / totalPossible) * 100);

  const trend = MOCK_HISTORY.map(rec => ({
    name: new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short' }),
    attendance: Math.round((rec.presentStudentIds.length / rec.totalStudents) * 100)
  }));

  return { average, trend };
};
