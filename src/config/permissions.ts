import type { Role, Module, Action } from './roles';

export type RolePermissions = Record<Role, Partial<Record<Module, Action[]>>>;

const ROLE_PERMISSIONS_STORAGE_KEY = 'school_role_permissions';

const ALL_ACTIONS: Action[] = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'publish', 'assign'];
const VIEW_ONLY: Action[] = ['view'];
const VIEW_CREATE_EDIT: Action[] = ['view', 'create', 'edit'];

export const ROLE_PERMISSIONS: RolePermissions = {
  SUPER_ADMIN: {
    DASHBOARD: ALL_ACTIONS,
    SCHOOL_STRUCTURE: ALL_ACTIONS,
    ADMISSIONS: ALL_ACTIONS,
    STUDENT_MANAGEMENT: ALL_ACTIONS,
    ACADEMIC_CONTENT: ALL_ACTIONS,
    TIMETABLE: ALL_ACTIONS,
    ATTENDANCE: ALL_ACTIONS,
    ASSIGNMENTS: ALL_ACTIONS,
    EXAMS: ALL_ACTIONS,
    FINANCE: ALL_ACTIONS,
    COMMUNICATION: ALL_ACTIONS,
    TRANSPORT: ALL_ACTIONS,
    HR_STAFF: ALL_ACTIONS,
    LIBRARY: ALL_ACTIONS,
    HOSTEL: ALL_ACTIONS,
    REPORTS: ALL_ACTIONS,
    SETTINGS: ALL_ACTIONS,
    ROLE_PERMISSION_ADMIN: ALL_ACTIONS,
    AUDIT_LOGS: ALL_ACTIONS,
    LEAVE_APPLICATION: ALL_ACTIONS,
  },
  SCHOOL_ADMIN: {
    DASHBOARD: ALL_ACTIONS,
    SCHOOL_STRUCTURE: ALL_ACTIONS,
    ADMISSIONS: ALL_ACTIONS,
    STUDENT_MANAGEMENT: ALL_ACTIONS,
    ACADEMIC_CONTENT: ALL_ACTIONS,
    TIMETABLE: ALL_ACTIONS,
    ATTENDANCE: ALL_ACTIONS,
    ASSIGNMENTS: ALL_ACTIONS,
    EXAMS: ALL_ACTIONS,
    FINANCE: ALL_ACTIONS,
    COMMUNICATION: ALL_ACTIONS,
    TRANSPORT: ALL_ACTIONS,
    HR_STAFF: ALL_ACTIONS,
    LIBRARY: ALL_ACTIONS,
    HOSTEL: ALL_ACTIONS,
    REPORTS: ALL_ACTIONS,
    SETTINGS: ALL_ACTIONS,
    ROLE_PERMISSION_ADMIN: ALL_ACTIONS,
    AUDIT_LOGS: VIEW_ONLY,
    LEAVE_APPLICATION: ALL_ACTIONS,
  },
  VICE_PRINCIPAL: {
    DASHBOARD: VIEW_ONLY,
    SCHOOL_STRUCTURE: VIEW_ONLY,
    ACADEMIC_CONTENT: ALL_ACTIONS,
    TIMETABLE: ALL_ACTIONS,
    ATTENDANCE: ALL_ACTIONS,
    REPORTS: ALL_ACTIONS,
    COMMUNICATION: ALL_ACTIONS,
    STUDENT_MANAGEMENT: VIEW_ONLY,
    ADMISSIONS: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  ACADEMIC_COORDINATOR: {
    DASHBOARD: VIEW_ONLY,
    SCHOOL_STRUCTURE: VIEW_ONLY,
    ACADEMIC_CONTENT: ALL_ACTIONS,
    TIMETABLE: ALL_ACTIONS,
    REPORTS: VIEW_ONLY,
    COMMUNICATION: VIEW_ONLY,
    STUDENT_MANAGEMENT: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  HOD: {
    DASHBOARD: VIEW_ONLY,
    SCHOOL_STRUCTURE: VIEW_ONLY,
    ACADEMIC_CONTENT: ['view', 'create', 'edit', 'assign'], // Can assign teachers to subjects
    TIMETABLE: ['view', 'create', 'edit', 'delete'],
    REPORTS: VIEW_ONLY,
    COMMUNICATION: VIEW_ONLY,
    EXAMS: VIEW_CREATE_EDIT,
    STUDENT_MANAGEMENT: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  EXAM_CONTROLLER: {
    DASHBOARD: VIEW_ONLY,
    EXAMS: ALL_ACTIONS,
    REPORTS: ALL_ACTIONS,
    ACADEMIC_CONTENT: VIEW_ONLY,
    TIMETABLE: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  TEACHER: {
    DASHBOARD: VIEW_ONLY,
    ACADEMIC_CONTENT: VIEW_CREATE_EDIT,
    TIMETABLE: VIEW_ONLY,
    ATTENDANCE: VIEW_CREATE_EDIT,
    ASSIGNMENTS: ALL_ACTIONS,
    EXAMS: VIEW_CREATE_EDIT,
    COMMUNICATION: VIEW_CREATE_EDIT,
    STUDENT_MANAGEMENT: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  CLASS_TEACHER: {
    DASHBOARD: VIEW_ONLY,
    STUDENT_MANAGEMENT: VIEW_ONLY,
    ATTENDANCE: ALL_ACTIONS,
    ASSIGNMENTS: VIEW_ONLY,
    COMMUNICATION: ALL_ACTIONS,
    ACADEMIC_CONTENT: VIEW_ONLY,
    TIMETABLE: VIEW_CREATE_EDIT,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  STUDENT: {
    DASHBOARD: VIEW_ONLY,
    ACADEMIC_CONTENT: VIEW_ONLY,
    TIMETABLE: VIEW_ONLY,
    ATTENDANCE: VIEW_ONLY,
    ASSIGNMENTS: VIEW_ONLY,
    EXAMS: VIEW_ONLY,
    LIBRARY: VIEW_ONLY,
    COMMUNICATION: VIEW_ONLY,
    HOSTEL: VIEW_ONLY,
  },
  PARENT: {
    DASHBOARD: VIEW_ONLY,
    TIMETABLE: VIEW_ONLY,
  },
  ADMISSION_OFFICER: {
    DASHBOARD: VIEW_ONLY,
    ADMISSIONS: ALL_ACTIONS,
    STUDENT_MANAGEMENT: ALL_ACTIONS,
    REPORTS: VIEW_ONLY,
    COMMUNICATION: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  OFFICE_ADMIN: {
    DASHBOARD: VIEW_ONLY,
    STUDENT_MANAGEMENT: ALL_ACTIONS,
    COMMUNICATION: ALL_ACTIONS,
    SCHOOL_STRUCTURE: VIEW_ONLY,
    REPORTS: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  ACCOUNTANT: {
    DASHBOARD: VIEW_ONLY,
    FINANCE: ALL_ACTIONS,
    REPORTS: ALL_ACTIONS,
    COMMUNICATION: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  HR_MANAGER: {
    DASHBOARD: VIEW_ONLY,
    HR_STAFF: ALL_ACTIONS,
    ATTENDANCE: VIEW_ONLY,
    REPORTS: VIEW_ONLY,
    COMMUNICATION: VIEW_ONLY,
    LEAVE_APPLICATION: ALL_ACTIONS,
  },
  TRANSPORT_MANAGER: {
    DASHBOARD: VIEW_ONLY,
    TRANSPORT: ALL_ACTIONS, // Includes assigning students and drivers
    REPORTS: VIEW_ONLY,
    COMMUNICATION: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  BUS_DRIVER: {
    DASHBOARD: VIEW_ONLY,
    TRANSPORT: VIEW_ONLY,
    ATTENDANCE: VIEW_CREATE_EDIT,
    COMMUNICATION: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  HOSTEL_WARDEN: {
    DASHBOARD: VIEW_ONLY,
    HOSTEL: ALL_ACTIONS,
    ATTENDANCE: VIEW_CREATE_EDIT,
    COMMUNICATION: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  LIBRARIAN: {
    DASHBOARD: VIEW_ONLY,
    LIBRARY: ALL_ACTIONS,
    COMMUNICATION: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  IT_ADMIN: {
    DASHBOARD: ALL_ACTIONS,
    SETTINGS: ALL_ACTIONS,
    AUDIT_LOGS: ALL_ACTIONS,
    ROLE_PERMISSION_ADMIN: ALL_ACTIONS,
    COMMUNICATION: ALL_ACTIONS,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
  LAB_INSTRUCTOR: {
    DASHBOARD: VIEW_ONLY,
    ACADEMIC_CONTENT: VIEW_CREATE_EDIT,
    TIMETABLE: VIEW_ONLY,
    LEAVE_APPLICATION: VIEW_CREATE_EDIT,
  },
};

const clonePermissions = (permissions: RolePermissions): RolePermissions => JSON.parse(JSON.stringify(permissions));

export const getDefaultRolePermissions = (): RolePermissions => clonePermissions(ROLE_PERMISSIONS);

export const loadStoredRolePermissions = (): RolePermissions => {
  if (typeof window === 'undefined') return getDefaultRolePermissions();

  const raw = localStorage.getItem(ROLE_PERMISSIONS_STORAGE_KEY);
  if (!raw) return getDefaultRolePermissions();

  try {
    const parsed = JSON.parse(raw) as RolePermissions;
    const defaultPerms = getDefaultRolePermissions();

    // Start with defaults to ensure all roles exist
    const merged = { ...defaultPerms };

    // For each role in stored data, USE STORED DATA as the truth
    // (not just merging over defaults — the admin intentionally set these)
    for (const role in parsed) {
      if (parsed[role as Role] && Object.keys(parsed[role as Role]).length > 0) {
        // Use stored permissions as the authoritative source for this role
        merged[role as Role] = { ...parsed[role as Role] };
      }
    }

    // SAFETY OVERRIDE: Prevent admins from locking themselves out of Role Management
    const ALL_ACTIONS: Action[] = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'publish', 'assign'];
    if (merged['SCHOOL_ADMIN']) merged['SCHOOL_ADMIN']['ROLE_PERMISSION_ADMIN'] = ALL_ACTIONS;
    if (merged['SUPER_ADMIN']) merged['SUPER_ADMIN']['ROLE_PERMISSION_ADMIN'] = ALL_ACTIONS;

    // Auto-heal the stored data
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_PERMISSIONS_STORAGE_KEY, JSON.stringify(merged));
    }

    return merged;
  } catch {
    return getDefaultRolePermissions();
  }
};

export const saveStoredRolePermissions = (permissions: RolePermissions) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
};

export const hasPermission = (
  role: Role,
  module: Module,
  action: Action = 'view',
  permissionsSource: RolePermissions = ROLE_PERMISSIONS
): boolean => {
  const permissions = permissionsSource[role];
  if (!permissions) return false;

  const modulePermissions = permissions[module];
  if (!modulePermissions) return false;

  return modulePermissions.includes(action);
};

export const hasAnyPermission = (
  role: Role,
  module: Module,
  permissionsSource: RolePermissions = ROLE_PERMISSIONS
): boolean => {
  const permissions = permissionsSource[role];
  if (!permissions) return false;

  const modulePermissions = permissions[module];
  return Array.isArray(modulePermissions) && modulePermissions.length > 0;
};

export const getModulesForRole = (role: Role, permissionsSource: RolePermissions = ROLE_PERMISSIONS): Module[] => {
  const permissions = permissionsSource[role];
  if (!permissions) return [];
  return Object.keys(permissions) as Module[];
};
