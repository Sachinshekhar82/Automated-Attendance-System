export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  photoUrl: string; // Base64 or URL
  guardianName: string;
  contactNumber: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO YYYY-MM-DD
  presentStudentIds: string[];
  totalStudents: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE = 'ATTENDANCE',
  STUDENTS = 'STUDENTS',
  REPORTS = 'REPORTS',
}
