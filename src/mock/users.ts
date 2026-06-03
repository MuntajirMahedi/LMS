import type { Role } from '../config/roles';
import { getStorageData, setStorageData } from '../lib/storage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role; // Default/Active role
  roles: Role[]; // All assigned roles
  avatar?: string;
  schoolName?: string;
  metadata?: {
    assignedClasses?: string[]; // For teachers
    childrenIds?: string[];    // For parents
    classId?: string;          // For students
    sectionId?: string;        // For students
    departmentId?: string;     // For staff
    routeId?: string;          // For transport
    hostelId?: string;         // For hostel
  };
}

export const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'admin@school.com',
    role: 'SCHOOL_ADMIN',
    roles: ['SCHOOL_ADMIN', 'IT_ADMIN'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    metadata: { departmentId: 'Administration' }
  },
  {
    id: '2',
    name: 'David Miller',
    email: 'teacher@school.com',
    role: 'TEACHER',
    roles: ['TEACHER', 'CLASS_TEACHER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    metadata: {
      assignedClasses: ['10-A', '11-B', '8-C'],
      departmentId: 'Academic'
    }
  },
  {
    id: '3',
    name: 'Robert Wilson',
    email: 'parent@school.com',
    role: 'PARENT',
    roles: ['PARENT'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    metadata: {
      childrenIds: ['4']
    }
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'student@school.com',
    role: 'STUDENT',
    roles: ['STUDENT'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    metadata: {
      classId: '8-C',
      sectionId: 'C'
    }
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'accountant@school.com',
    role: 'ACCOUNTANT',
    roles: ['ACCOUNTANT'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    metadata: { departmentId: 'Finance' }
  },
  {
    id: '6',
    name: 'James Smith',
    email: 'driver@school.com',
    role: 'BUS_DRIVER',
    roles: ['BUS_DRIVER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    metadata: { departmentId: 'Transport' }
  },
  {
    id: '7',
    name: 'Admin User',
    email: 'super@school.com',
    role: 'SUPER_ADMIN',
    roles: ['SUPER_ADMIN'],
    schoolName: 'EduSync Network',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Super',
    metadata: { departmentId: 'Administration' }
  },
  {
    id: '8',
    name: 'Dr. Arthur Pendragon',
    email: 'principal@school.com',
    role: 'SCHOOL_ADMIN',
    roles: ['SCHOOL_ADMIN', 'VICE_PRINCIPAL'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur',
    metadata: { departmentId: 'Administration' }
  },
  {
    id: '9',
    name: 'Sarah Connor',
    email: 'accountant@school.com',
    role: 'ACCOUNTANT',
    roles: ['ACCOUNTANT'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahC',
    metadata: { departmentId: 'Finance' }
  },
  {
    id: '10',
    name: 'Thomas Anderson',
    email: 'it@school.com',
    role: 'IT_ADMIN',
    roles: ['IT_ADMIN'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo',
    metadata: { departmentId: 'Administration' }
  },
  {
    id: '11',
    name: 'Linda Belcher',
    email: 'admission@school.com',
    role: 'ADMISSION_OFFICER',
    roles: ['ADMISSION_OFFICER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linda',
    metadata: { departmentId: 'Administration' }
  },
  {
    id: '12',
    name: 'Robert Stark',
    email: 'hod@school.com',
    role: 'HOD',
    roles: ['HOD'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robb',
    metadata: { departmentId: 'Science' }
  },
  {
    id: '13',
    name: 'Monica Geller',
    email: 'hr@school.com',
    role: 'HR_MANAGER',
    roles: ['HR_MANAGER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Monica',
    metadata: { departmentId: 'Administration' }
  },
  {
    id: '14',
    name: 'Bruce Wayne',
    email: 'transport@school.com',
    role: 'TRANSPORT_MANAGER',
    roles: ['TRANSPORT_MANAGER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruce',
    metadata: { departmentId: 'Transport' }
  },
  {
    id: '15',
    name: 'Peter Parker',
    email: 'librarian@school.com',
    role: 'LIBRARIAN',
    roles: ['LIBRARIAN'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter',
    metadata: { departmentId: 'Academic' }
  },
  {
    id: '16',
    name: 'Diana Prince',
    email: 'exams@school.com',
    role: 'EXAM_CONTROLLER',
    roles: ['EXAM_CONTROLLER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    metadata: { departmentId: 'Academic' }
  },
  {
    id: '18',
    name: 'Jason Todd',
    email: 'jason@school.com',
    role: 'STUDENT',
    roles: ['STUDENT'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jason',
    metadata: { classId: '10-A', sectionId: 'A' }
  },
  {
    id: '19',
    name: 'Tim Drake',
    email: 'tim@school.com',
    role: 'STUDENT',
    roles: ['STUDENT'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tim',
    metadata: { classId: '10-A', sectionId: 'A' }
  },
  {
    id: '20',
    name: 'Barbara Gordon',
    email: 'barbara@school.com',
    role: 'TEACHER',
    roles: ['TEACHER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Barbara',
    metadata: { assignedClasses: ['10-A'], departmentId: 'Academic' }
  },
  {
    id: '21',
    name: 'Alfred Pennyworth',
    email: 'alfred@school.com',
    role: 'PARENT',
    roles: ['PARENT'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alfred',
    metadata: { childrenIds: ['18', '19'] }
  },
  {
    id: '22',
    name: 'Severus Snape',
    email: 'coordinator@school.com',
    role: 'ACADEMIC_COORDINATOR',
    roles: ['ACADEMIC_COORDINATOR'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Severus',
    metadata: { departmentId: 'Academic' }
  },
  {
    id: '23',
    name: 'Walter White',
    email: 'lab@school.com',
    role: 'LAB_INSTRUCTOR',
    roles: ['LAB_INSTRUCTOR'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Walter',
    metadata: { departmentId: 'Academic' }
  },
  {
    id: '26',
    name: 'Jane Doe',
    email: 'classteacher@school.com',
    role: 'CLASS_TEACHER',
    roles: ['CLASS_TEACHER', 'TEACHER'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JaneDoe',
    metadata: {
      assignedClasses: ['8-A'],
      departmentId: 'General'
    }
  },
  {
    id: '24',
    name: 'Pam Beesly',
    email: 'office@school.com',
    role: 'OFFICE_ADMIN',
    roles: ['OFFICE_ADMIN'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pam',
    metadata: { departmentId: 'Administration' }
  },
  {
    id: '25',
    name: 'Minerva McGonagall',
    email: 'warden@school.com',
    role: 'HOSTEL_WARDEN',
    roles: ['HOSTEL_WARDEN'],
    schoolName: 'Greenwood High School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minerva',
    metadata: { departmentId: 'Administration' }
  }
];

export const USERS_STORAGE_KEY = 'lms_users';

export const getUsers = (): User[] => {
  return getStorageData<User[]>(USERS_STORAGE_KEY, DEFAULT_USERS);
};

export const saveUsers = (users: User[]) => {
  setStorageData(USERS_STORAGE_KEY, users);
};

export const MOCK_USERS = DEFAULT_USERS; // For backwards compatibility until refactor is complete
