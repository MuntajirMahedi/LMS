export type Role =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'VICE_PRINCIPAL'
  | 'HOD'
  | 'ACADEMIC_COORDINATOR'
  | 'EXAM_CONTROLLER'
  | 'TEACHER'
  | 'CLASS_TEACHER'
  | 'LAB_INSTRUCTOR'
  | 'STUDENT'
  | 'PARENT'
  | 'ADMISSION_OFFICER'
  | 'OFFICE_ADMIN'
  | 'ACCOUNTANT'
  | 'HR_MANAGER'
  | 'TRANSPORT_MANAGER'
  | 'BUS_DRIVER'
  | 'HOSTEL_WARDEN'
  | 'LIBRARIAN'
  | 'IT_ADMIN';

export type Module =
  | 'DASHBOARD'
  | 'SCHOOL_STRUCTURE'
  | 'ADMISSIONS'
  | 'STUDENT_MANAGEMENT'
  | 'ACADEMIC_CONTENT'
  | 'TIMETABLE'
  | 'ATTENDANCE'
  | 'ASSIGNMENTS'
  | 'EXAMS'
  | 'FINANCE'
  | 'COMMUNICATION'
  | 'TRANSPORT'
  | 'HR_STAFF'
  | 'LIBRARY'
  | 'HOSTEL'
  | 'REPORTS'
  | 'SETTINGS'
  | 'ROLE_PERMISSION_ADMIN'
  | 'AUDIT_LOGS'
  | 'LEAVE_APPLICATION';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'publish' | 'assign';

export interface Permission {
  module: Module;
  actions: Action[];
}
