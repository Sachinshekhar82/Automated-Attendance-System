import { Student, AttendanceRecord } from '../types';
import { MOCK_STUDENTS } from './mockData';

const KEYS = {
  STUDENTS: 'gramin_students_v1',
  RECORDS: 'gramin_records_v1',
  AUTH: 'gramin_auth_v1'
};

// --- Students ---
export const loadStudents = (): Student[] => {
  const stored = localStorage.getItem(KEYS.STUDENTS);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default to mock data if empty
  return MOCK_STUDENTS;
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

// --- Attendance Records ---
export const loadRecords = (): AttendanceRecord[] => {
  const stored = localStorage.getItem(KEYS.RECORDS);
  return stored ? JSON.parse(stored) : [];
};

export const saveRecord = (record: AttendanceRecord) => {
  const existing = loadRecords();
  const updated = [record, ...existing]; // Newest first
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(updated));
};

// --- Auth (Simulated) ---
export const getStoredCredentials = () => {
  const stored = localStorage.getItem(KEYS.AUTH);
  return stored ? JSON.parse(stored) : { username: 'admin', password: 'password' };
};

export const updateCredentials = (password: string) => {
  const creds = getStoredCredentials();
  creds.password = password;
  localStorage.setItem(KEYS.AUTH, JSON.stringify(creds));
};
