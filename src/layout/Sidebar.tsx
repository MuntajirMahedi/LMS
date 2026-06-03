import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Bus,
  Library,
  Building2,
  GraduationCap,
  MessageSquare,
  Users2,
  BarChart3,
  ShieldCheck,
  History,
  School,
  BookOpen,
  Layout,
  ClipboardList,
  Trophy,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { hasPermission } from '../config/permissions';
import type { Module } from '../config/roles';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  module: Module;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', module: 'DASHBOARD' },
  { icon: School, label: 'School Structure', path: '/school-structure', module: 'SCHOOL_STRUCTURE' },
  { icon: UserPlus, label: 'Admissions', path: '/admissions', module: 'ADMISSIONS' },
  { icon: Users, label: 'Student Mgmt', path: '/students', module: 'STUDENT_MANAGEMENT' },
  { icon: BookOpen, label: 'Academic Content', path: '/academics', module: 'ACADEMIC_CONTENT' },
  { icon: Layout, label: 'Timetable', path: '/timetable', module: 'TIMETABLE' },
  { icon: Calendar, label: 'Attendance', path: '/attendance', module: 'ATTENDANCE' },
  { icon: ClipboardList, label: 'Assignments', path: '/assignments', module: 'ASSIGNMENTS' },
  { icon: Trophy, label: 'Exams & Results', path: '/exams', module: 'EXAMS' },
  { icon: CreditCard, label: 'Fees & Finance', path: '/finance', module: 'FINANCE' },
  { icon: MessageSquare, label: 'Communication', path: '/communication', module: 'COMMUNICATION' },
  { icon: Bus, label: 'Transport', path: '/transport', module: 'TRANSPORT' },
  { icon: Users2, label: 'HR & Staff', path: '/hr-staff', module: 'HR_STAFF' },
  { icon: CalendarDays, label: 'Apply Leave', path: '/leave-application', module: 'LEAVE_APPLICATION' },
  { icon: Library, label: 'Library', path: '/library', module: 'LIBRARY' },
  { icon: Building2, label: 'Hostel', path: '/hostel', module: 'HOSTEL' },
  { icon: BarChart3, label: 'Reports', path: '/reports', module: 'REPORTS' },

  { icon: ShieldCheck, label: 'Roles & Admin', path: '/role-admin', module: 'ROLE_PERMISSION_ADMIN' },
  { icon: History, label: 'Audit Logs', path: '/audit-logs', module: 'AUDIT_LOGS' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobile }) => {
  const { activeRole, permissions } = useAuth();
  const filteredNavItems = navItems.filter(item =>
    activeRole ? hasPermission(activeRole, item.module, 'view', permissions) : false
  );

  return (
    <div className={cn(
      "h-screen bg-background lg:border-r border-border flex flex-col relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
      isCollapsed ? "w-20" : "w-[260px]"
    )}>
      {/* Toggle Button - Positioned to not overlap logo */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-20 w-8 h-8 bg-white border border-border rounded-full hidden lg:flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300 shadow-md z-50 group",
          isCollapsed ? "-right-4" : "-right-4"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo Section */}
      <div className={cn(
        "flex items-center overflow-hidden whitespace-nowrap transition-all duration-500",
        isCollapsed ? "p-2 justify-center h-28" : "p-8 gap-4 h-32"
      )}>
        <div className={cn(
          "rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 transition-all duration-500",
          isCollapsed ? "w-10 h-10" : "w-12 h-12"
        )}>
          <GraduationCap className={cn("text-primary-foreground transition-all", isCollapsed ? "w-5 h-5" : "w-6 h-6")} />
        </div>
        <div className={cn(
          "flex flex-col transition-all duration-500",
          isCollapsed ? "opacity-0 -translate-x-4 pointer-events-none w-0" : "opacity-100 translate-x-0 w-auto"
        )}>
          <span className="font-bold text-xl leading-none tracking-tight text-foreground">EduSync</span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5">
            {activeRole?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Menu Header */}
      <div className={cn(
        "px-8 mb-4 transition-all duration-500",
        isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-40"
      )}>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">MENU</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (isMobile) onToggle();
            }}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[12px] lg:text-[14px] font-bold transition-all duration-300 relative group overflow-hidden whitespace-nowrap",
              isActive
                ? "bg-[#F6EFE9] text-primary"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
              isCollapsed && "justify-center px-0"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                )}
                <item.icon className={cn(
                  "w-7 h-7 lg:w-5 lg:h-5 transition-transform group-hover:scale-110 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground opacity-80"
                )} />
                {!isCollapsed && (
                  <span className="transition-all duration-500 opacity-100 translate-x-0 w-auto">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="p-4 mt-auto">
        <button className={cn(
          "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[12px] lg:text-[14px] font-bold text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-300 w-full group",
          isCollapsed && "justify-center px-0"
        )}>
          <History className="w-7 h-7 lg:w-5 lg:h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && (
            <span className="transition-all duration-500 opacity-100 translate-x-0 w-auto">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
