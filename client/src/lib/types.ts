export interface DashboardStats {
  totalFaculty: number;
  activeCourses: number;
  pendingTasks: number;
  avgWorkload: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'chart-line', path: '/' },
  { id: 'workload', label: 'Staff Workload', icon: 'tasks', path: '/workload' },
  { id: 'faculty', label: 'Faculty Tracker', icon: 'users', path: '/faculty' },
  { id: 'timetable', label: 'Timetable', icon: 'calendar-alt', path: '/timetable' },
  { id: 'excel', label: 'Excel Import', icon: 'file-excel', path: '/excel' },
  { id: 'student', label: 'Student View', icon: 'user-graduate', path: '/student' },
];

export const FACULTY_POSITIONS = [
  { value: 'professor', label: 'Professor', maxHours: 14 },
  { value: 'associate_professor', label: 'Associate Professor', maxHours: 16 },
  { value: 'assistant_professor', label: 'Assistant Professor', maxHours: 18 },
];

export const WORKLOAD_TYPES = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'practical', label: 'Practical' },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];
