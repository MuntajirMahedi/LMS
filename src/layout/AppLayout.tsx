import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-parchment">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const PATH_LABELS: Record<string, string> = {
    '/': 'Dashboard',
    '/school-structure': 'School Structure',
    '/admissions': 'Admissions',
    '/students': 'Student Mgmt',
    '/academics': 'Academic Content',
    '/timetable': 'Timetable',
    '/attendance': 'Attendance',
    '/assignments': 'Assignments',
    '/exams': 'Exams & Results',
    '/finance': 'Fees & Finance',
    '/communication': 'Communication',
    '/transport': 'Transport',
    '/hr-staff': 'HR & Staff',
    '/leave-application': 'Apply Leave',
    '/library': 'Library',
    '/hostel': 'Hostel',
    '/reports': 'Reports',
    '/settings': 'Settings',
    '/role-admin': 'Roles & Admin',
    '/audit-logs': 'Audit Logs',
  };
  const pageName = PATH_LABELS[location.pathname] || location.pathname.substring(1).split('/').map(p => p.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(' / ') || 'Dashboard';

  return (
    <div className="min-h-screen bg-soft-parchment flex font-outfit">
      {/* Sidebar for Desktop */}
      <div className={cn(
        "hidden lg:block flex-shrink-0 sticky top-0 h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed ? "w-20" : "w-[260px]"
      )}>
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 lg:hidden shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar isCollapsed={false} onToggle={() => setIsSidebarOpen(false)} isMobile />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-10 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            {/* Global Breadcrumb Navigation */}
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <span>Home</span>
                <span className="text-muted-foreground/30">/</span>
                <span className="text-primary">{pageName}</span>
              </div>
            </div>
            <div key={location.pathname} className="animate-page">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
