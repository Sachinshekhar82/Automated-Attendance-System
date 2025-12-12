export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  photoUrl: string; // Base64 or URL
  guardianName: string;
  contactNumber: string;
  descriptor?: number[]; // The unique face math vector (128 numbers)
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO YYYY-MM-DD
  timestamp: number; // For sorting
  presentStudentIds: string[];
  totalStudentsCount: number;
  className: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE = 'ATTENDANCE',
  STUDENTS = 'STUDENTS',
  RECORDS = 'RECORDS', 
}