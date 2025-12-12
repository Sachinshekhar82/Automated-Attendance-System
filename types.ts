export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  photoUrl: string;
  guardianName: string;
  contactNumber: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  presentStudentIds: string[];
  totalStudents: number;
  notes?: string;
  verifiedBy?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE = 'ATTENDANCE',
  STUDENTS = 'STUDENTS',
  REPORTS = 'REPORTS',
}

export interface ChartDataPoint {
  name: string;
  attendance: number;
}