import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import RoleManagementPage from './pages/RoleManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SchoolStructurePage from './pages/SchoolStructurePage';
import CreateSchoolPage from './pages/CreateSchoolPage';
import AdmissionsPage from './pages/AdmissionsPage';
import StudentsPage from './pages/StudentsPage';
import EnrollmentPage from './pages/EnrollmentPage';
import StudentDataPage from './pages/StudentDataPage';
import AcademicContentPage from './pages/AcademicContentPage';
import QuizBuilderPage from './pages/QuizBuilderPage';
import CommunicationPage from './pages/communication/CommunicationPage';
import NoticeBoardPage from './pages/communication/NoticeBoardPage';
import ComposePage from './pages/communication/ComposePage';
import ChatPage from './pages/communication/ChatPage';
import TransportPage from './pages/TransportPage';
import LibraryPage from './pages/LibraryPage';
import HostelPage from './pages/HostelPage';
import AttendancePage from './pages/AttendancePage';
import TimetablePage from './pages/TimetablePage';
import CreateTimetablePage from './pages/CreateTimetablePage';
import TeacherSchedulePage from './pages/TeacherSchedulePage';
import AssignmentsPage from './pages/AssignmentsPage';
import ExamsResultsPage from './pages/ExamsResultsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { EmptyModule } from './components/dashboard/DashboardWidgets';
import HRStaffPage from './pages/hr/HRStaffPage';
import LeaveApplicationPage from './pages/LeaveApplicationPage';
import SettingsPage from './pages/SettingsPage';
import FinancePage from './pages/FinancePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={
              <ProtectedRoute module="DASHBOARD">
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/school-structure" element={
              <ProtectedRoute module="SCHOOL_STRUCTURE">
                <SchoolStructurePage />
              </ProtectedRoute>
            } />

            <Route path="/school-structure/create" element={
              <ProtectedRoute module="SCHOOL_STRUCTURE">
                <CreateSchoolPage />
              </ProtectedRoute>
            } />

            <Route path="/admissions" element={
              <ProtectedRoute module="ADMISSIONS">
                <AdmissionsPage />
              </ProtectedRoute>
            } />

            <Route path="/students" element={
              <ProtectedRoute module="STUDENT_MANAGEMENT">
                <StudentsPage />
              </ProtectedRoute>
            } />

            <Route path="/students/:id" element={
              <ProtectedRoute module="STUDENT_MANAGEMENT">
                <StudentDataPage />
              </ProtectedRoute>
            } />

            <Route path="/enrollment" element={
              <ProtectedRoute module="STUDENT_MANAGEMENT">
                <EnrollmentPage />
              </ProtectedRoute>
            } />

            <Route path="/academics" element={
              <ProtectedRoute module="ACADEMIC_CONTENT">
                <AcademicContentPage />
              </ProtectedRoute>
            } />

            <Route path="/academics/quiz-builder" element={
              <ProtectedRoute module="ACADEMIC_CONTENT">
                <QuizBuilderPage />
              </ProtectedRoute>
            } />

            <Route path="/timetable" element={
              <ProtectedRoute module="TIMETABLE">
                <TimetablePage />
              </ProtectedRoute>
            } />

            <Route path="/timetable/create" element={
              <ProtectedRoute module="TIMETABLE">
                <CreateTimetablePage />
              </ProtectedRoute>
            } />

            <Route path="/timetable/teacher" element={
              <ProtectedRoute module="TIMETABLE">
                <TeacherSchedulePage />
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={
              <ProtectedRoute module="ATTENDANCE">
                <AttendancePage />
              </ProtectedRoute>
            } />

            <Route path="/assignments" element={
              <ProtectedRoute module="ASSIGNMENTS">
                <AssignmentsPage />
              </ProtectedRoute>
            } />

            <Route path="/exams" element={
              <ProtectedRoute module="EXAMS">
                <ExamsResultsPage />
              </ProtectedRoute>
            } />

            <Route path="/finance" element={
              <ProtectedRoute module="FINANCE">
                <FinancePage />
              </ProtectedRoute>
            } />

            <Route path="/communication/*" element={
              <ProtectedRoute module="COMMUNICATION">
                <Outlet />
              </ProtectedRoute>
            }>
              <Route index element={<CommunicationPage />} />
              <Route path="notices" element={<NoticeBoardPage />} />
              <Route path="compose" element={<ComposePage />} />
              <Route path="chat" element={<ChatPage />} />
            </Route>

            <Route path="/transport" element={
              <ProtectedRoute module="TRANSPORT">
                <TransportPage />
              </ProtectedRoute>
            } />

            <Route path="/leave-application" element={
              <ProtectedRoute module="LEAVE_APPLICATION">
                <LeaveApplicationPage />
              </ProtectedRoute>
            } />

            <Route path="/hr-staff" element={
              <ProtectedRoute module="HR_STAFF">
                <HRStaffPage />
              </ProtectedRoute>
            } />

            <Route path="/library" element={
              <ProtectedRoute module="LIBRARY">
                <LibraryPage />
              </ProtectedRoute>
            } />

            <Route path="/hostel" element={
              <ProtectedRoute module="HOSTEL">
                <HostelPage />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute module="REPORTS">
                <EmptyModule moduleName="Reports" />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute module="SETTINGS">
                <SettingsPage />
              </ProtectedRoute>
            } />

            <Route path="/role-admin" element={
              <ProtectedRoute module="ROLE_PERMISSION_ADMIN">
                <RoleManagementPage />
              </ProtectedRoute>
            } />

            <Route path="/audit-logs" element={
              <ProtectedRoute module="AUDIT_LOGS">
                <AuditLogsPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
