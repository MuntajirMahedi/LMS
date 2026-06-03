import { useState } from 'react';
import {
  Users, BookOpen, AlertCircle,
  CheckCircle2, Plus,
  Download, LayoutDashboard, CalendarDays, UserSquare2,
  Clock, Printer, Coffee, Search, ArrowRight, List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TabSwitcher } from '../../components/ui/TabSwitcher';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../../components/dashboard/DashboardWidgets';
import { EditTimetableModal } from '../../components/timetable/EditTimetableModal';
// --- MOCK DATA ---
const KPI_DATA = [
  { label: 'Total Classes', value: '142', sub: 'Today', icon: BookOpen, color: 'bg-primary' },
  { label: 'Active Teachers', value: '48', sub: 'Present', icon: Users, color: 'bg-brand-orange' },
  { label: 'Conflicts', value: '2', sub: 'Unresolved', icon: AlertCircle, color: 'bg-brand-purple' },
  { label: 'Pending Approvals', value: '5', sub: 'Action Req.', icon: CheckCircle2, color: 'bg-brand-green' },
];

const SCHEDULE_DATA = [
  { time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Sarah Jenkins', type: 'Core', status: 'Published' },
  { time: '08:50 - 09:35', subject: 'Physics', teacher: 'Dr. Alan Grant', type: 'Lab', status: 'Published' },
  { time: '09:35 - 09:50', subject: 'Morning Break', teacher: '-', type: 'Break', status: 'Published' },
  { time: '09:50 - 10:35', subject: 'English Lit.', teacher: 'Emma Watson', type: 'Core', status: 'Draft' },
  { time: '10:40 - 11:25', subject: 'History', teacher: 'John Doe', type: 'Core', status: 'Conflict' },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { id: 1, time: '09:00 - 09:45', name: '1st', type: 'Class' },
  { id: 2, time: '09:45 - 10:30', name: '2nd', type: 'Class' },
  { id: 3, time: '10:30 - 10:45', name: 'Break', type: 'Break' },
  { id: 4, time: '10:45 - 11:30', name: '3rd', type: 'Class' },
  { id: 5, time: '11:30 - 12:15', name: '4th', type: 'Class' },
  { id: 6, time: '12:15 - 01:00', name: 'Lunch', type: 'Break' },
  { id: 7, time: '01:00 - 01:45', name: '5th', type: 'Class' },
  { id: 8, time: '01:45 - 02:30', name: '6th', type: 'Class' },
];

const MOCK_SUBJECTS = [
  { subject: 'Mathematics', teacher: 'Sarah J.', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'Physics', teacher: 'John D.', color: 'bg-[#E4B76D]/10 text-[#E4B76D]' },
  { subject: 'Chemistry', teacher: 'Alice M.', color: 'bg-[#88AC88]/10 text-[#88AC88]' },
  { subject: 'English', teacher: 'Bob T.', color: 'bg-[#C37A67]/10 text-[#C37A67]' },
  { subject: 'History', teacher: 'Emma W.', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'Geography', teacher: 'Tom H.', color: 'bg-[#88AC88]/10 text-[#88AC88]' },
  { subject: 'Comp Sci', teacher: 'Steve R.', color: 'bg-blue-500/10 text-blue-500' },
  { subject: 'Physical Ed', teacher: 'Mike S.', color: 'bg-[#E4B76D]/10 text-[#E4B76D]' }
];

const getSubjectForSlot = (dayIdx: number, periodIdx: number) => {
  const index = (dayIdx * 3 + periodIdx) % MOCK_SUBJECTS.length;
  return MOCK_SUBJECTS[index];
};
const ClassSchedulesView = () => {
  const { activeRole, user } = useAuth();
  const isHOD = activeRole === 'HOD';
  const hodDepartment = user?.metadata?.departmentId || '';

  const [targetClass, setTargetClass] = useState('Class 7');
  const [section, setSection] = useState('Section A');
  const [department, setDepartment] = useState(isHOD && hodDepartment ? hodDepartment : 'Science');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in mx-0 sm:mx-4 lg:mx-6 mt-6">
      <EditTimetableModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        targetClass={targetClass} 
        section={section} 
        department={department} 
      />
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] border border-[#E9E1D5] shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-[140px]">
            <Select
              label="Select Class"
              value={targetClass}
              onChange={setTargetClass}
              options={getFilteredClasses(isHOD, hodDepartment)}
              className="px-3"
            />
          </div>
          <div className="w-full sm:w-[140px]">
            <Select
              label="Select Section"
              value={section}
              onChange={setSection}
              options={[{ label: 'Section A', value: 'Section A' }, { label: 'Section B', value: 'Section B' }]}
              className="px-3"
            />
          </div>
          <div className="w-full sm:w-[140px]">
            <Select
              label="Select Department"
              value={department}
              onChange={setDepartment}
              options={isHOD && hodDepartment ? [{ label: hodDepartment, value: hodDepartment }] : [{ label: 'Science', value: 'Science' }, { label: 'Arts', value: 'Arts' }, { label: 'General', value: 'General' }]}
              className="px-3"
              disabled={isHOD}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="flex-1 sm:flex-none whitespace-nowrap border-[#C37A67] text-[#C37A67] hover:bg-[#C37A67]/10 font-bold rounded-xl h-10 px-4 text-xs">
            Edit Timetable
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none whitespace-nowrap border-[#E9E1D5] text-[#2C2625] font-bold rounded-xl h-10 px-4 text-xs">
            <Printer className="w-4 h-4 mr-2 text-[#2C2625]/60" /> Print
          </Button>
          <Button className="flex-1 sm:flex-none whitespace-nowrap bg-[#C37A67] text-white hover:bg-[#C37A67]/90 font-bold rounded-xl h-10 px-4 text-xs">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-[32px] border border-[#E9E1D5] shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E9E1D5] pb-2">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#E9E1D5]">
                <th className="p-4 text-xs font-black text-[#2C2625] uppercase tracking-widest w-[120px] text-center border-r border-[#E9E1D5]">Time</th>
                {WEEKDAYS.map(day => (
                  <th key={day} className="p-4 text-xs font-black text-[#2C2625] uppercase tracking-widest min-w-[140px] text-center border-r border-[#E9E1D5] last:border-0">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1D5]">
              {PERIODS.map((period, pIdx) => (
                <tr key={period.id}>
                  <td className="p-4 border-r border-[#E9E1D5] bg-[#FDFBF7]/50">
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black uppercase text-[#2C2625]/50 tracking-wider mb-1">{period.name}</span>
                      <span className="text-xs font-bold text-[#2C2625] whitespace-nowrap flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#2C2625]/40" />{period.time}</span>
                    </div>
                  </td>

                  {period.type === 'Break' ? (
                    <td colSpan={6} className="bg-[#FDFBF7] p-2 text-center border-b border-[#E9E1D5]">
                      <div className="py-2.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#2C2625]/40"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(44, 38, 37, 0.02) 10px, rgba(44, 38, 37, 0.02) 20px)' }}>
                        <Coffee className="w-4 h-4" /> {period.name}
                      </div>
                    </td>
                  ) : (
                    WEEKDAYS.map((day, dIdx) => {
                      const slot = getSubjectForSlot(dIdx, pIdx);
                      return (
                        <td key={day} className="p-2.5 border-r border-[#E9E1D5] last:border-0 align-top group hover:bg-[#FDFBF7]/50 transition-colors cursor-pointer">
                          <div className={cn("rounded-2xl p-3 h-full border border-transparent group-hover:border-[#E9E1D5]/60 transition-all", slot.color.split(' ')[0])}>
                            <h4 className={cn("text-sm font-black mb-2", slot.color.split(' ')[1])}>{slot.subject}</h4>
                            <div className={cn("flex items-center gap-1.5 text-[11px] font-bold mb-1 opacity-70", slot.color.split(' ')[1])}>
                              <UserSquare2 className="w-3.5 h-3.5" /> {slot.teacher}
                            </div>
                          </div>
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const TEACHER_WORKLOAD_DATA = [
  { id: 'T001', name: 'Sarah Jenkins', dept: 'Mathematics', assigned: 28, max: 30, freeToday: 0, status: 'In Class', nextFree: 'Tomorrow' },
  { id: 'T002', name: 'Dr. Alan Grant', dept: 'Science', assigned: 18, max: 30, freeToday: 3, status: 'Available', nextFree: 'Now' },
  { id: 'T003', name: 'Emma Watson', dept: 'English', assigned: 24, max: 30, freeToday: 1, status: 'In Class', nextFree: '02:00 PM' },
  { id: 'T004', name: 'John Doe', dept: 'History', assigned: 30, max: 30, freeToday: 0, status: 'Overloaded', nextFree: 'None' },
  { id: 'T005', name: 'Alice Murphy', dept: 'Chemistry', assigned: 22, max: 30, freeToday: 2, status: 'Available', nextFree: 'Now' },
  { id: 'T006', name: 'Mike Smith', dept: 'Physical Ed', assigned: 15, max: 30, freeToday: 4, status: 'Available', nextFree: 'Now' }
];

const TeacherWorkloadView = () => {
  const navigate = useNavigate();
  const { activeRole, user } = useAuth();
  const isHOD = activeRole === 'HOD';
  const hodDepartment = user?.metadata?.departmentId || '';

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState(isHOD && hodDepartment ? hodDepartment : 'All Departments');
  const [targetClass, setTargetClass] = useState('All Classes');
  const [section, setSection] = useState('All Sections');
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

  return (
    <div className="space-y-6 animate-in fade-in mx-0 sm:mx-4 lg:mx-6 mt-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] border border-[#E9E1D5] shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2625]/40" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm font-bold text-[#2C2625] bg-[#FDFBF7] border border-[#E9E1D5] rounded-xl focus:outline-none focus:border-[#C37A67] focus:ring-1 focus:ring-[#C37A67] transition-all placeholder:text-[#2C2625]/40"
            />
          </div>
          <div className="w-full sm:w-[140px]">
            <Select
              label=""
              placeholder="Class"
              value={targetClass}
              onChange={setTargetClass}
              options={getFilteredClasses(isHOD, hodDepartment)}
              className="h-10 text-xs px-3"
            />
          </div>
          <div className="w-full sm:w-[140px]">
            <Select
              label=""
              placeholder="Section"
              value={section}
              onChange={setSection}
              options={[{ label: 'All Sections', value: 'All Sections' }, { label: 'Section A', value: 'Section A' }, { label: 'Section B', value: 'Section B' }]}
              className="h-10 text-xs px-3"
            />
          </div>
          <div className="w-full sm:w-[160px]">
            <Select
              label=""
              placeholder="Department"
              value={department}
              onChange={setDepartment}
              options={isHOD && hodDepartment ? [{ label: hodDepartment, value: hodDepartment }] : [{ label: 'All Departments', value: 'All Departments' }, { label: 'Science', value: 'Science' }, { label: 'Mathematics', value: 'Mathematics' }, { label: 'English', value: 'English' }, { label: 'History', value: 'History' }]}
              className="h-10 text-xs px-3"
              disabled={isHOD}
            />
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex bg-[#FDFBF7] p-1 rounded-xl border border-[#E9E1D5]">
            <button
              onClick={() => setViewType('cards')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1", viewType === 'cards' ? "bg-white shadow-sm text-[#2C2625]" : "text-[#2C2625]/60 hover:text-[#2C2625]")}>
              <LayoutDashboard className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setViewType('table')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1", viewType === 'table' ? "bg-white shadow-sm text-[#2C2625]" : "text-[#2C2625]/60 hover:text-[#2C2625]")}>
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
          <Button className="bg-[#88AC88] text-white hover:bg-[#88AC88]/90 font-bold rounded-xl h-10 px-4 text-xs w-full sm:w-auto">
            <Users className="w-4 h-4 mr-2" /> Assign Substitute
          </Button>
        </div>
      </div>

      {/* View Content */}
      {viewType === 'cards' ? (
        <div className="flex overflow-x-auto gap-6 mb-10 pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#E9E1D5]">
          {TEACHER_WORKLOAD_DATA.map(teacher => {
            const loadPercent = Math.round((teacher.assigned / teacher.max) * 100);
            let cardBg = 'bg-[#88AC88]/5';
            if (teacher.status === 'In Class') {
              cardBg = 'bg-[#E4B76D]/5';
            }
            if (teacher.status === 'Overloaded') {
              cardBg = 'bg-[#E63946]/5';
            }

            let loadColor = 'bg-[#88AC88]';
            if (loadPercent > 80) loadColor = 'bg-[#E4B76D]';
            if (loadPercent >= 100) loadColor = 'bg-[#E63946]';

            return (
              <div key={teacher.id} className={cn("shrink-0 snap-center w-full sm:w-[380px] rounded-[24px] border border-[#E9E1D5] p-6 shadow-sm hover:shadow-md transition-shadow", cardBg)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-[#2C2625] text-lg border border-[#E9E1D5] shadow-sm">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#2C2625] leading-tight">{teacher.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-[#2C2625]/60">Periods</span>
                      <span className="text-[#2C2625]">{teacher.assigned} Completed / {teacher.max} Total</span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-[#E9E1D5]/50">
                      <div className={cn("h-full rounded-full transition-all", loadColor)} style={{ width: `${loadPercent}%` }} />
                    </div>
                  </div>

                  <Button onClick={() => navigate('/timetable/teacher', { state: { teacher } })} variant="outline" className="w-full rounded-xl border-[#E9E1D5] hover:bg-white text-[#2C2625] font-bold text-xs h-10 mt-2 transition-all group shadow-sm bg-white">
                    View Schedule
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform opacity-60" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-[#E9E1D5] shadow-sm overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#E9E1D5]">
                  <th className="p-4 text-xs font-black text-[#2C2625] uppercase tracking-widest border-r border-[#E9E1D5]">Teacher</th>
                  <th className="p-4 text-xs font-black text-[#2C2625] uppercase tracking-widest border-r border-[#E9E1D5]">Periods</th>
                  <th className="p-4 text-xs font-black text-[#2C2625] uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E1D5]">
                {TEACHER_WORKLOAD_DATA.map(teacher => {
                  const loadPercent = Math.round((teacher.assigned / teacher.max) * 100);
                  let loadColor = 'bg-[#88AC88]';
                  if (loadPercent > 80) loadColor = 'bg-[#E4B76D]';
                  if (loadPercent >= 100) loadColor = 'bg-[#E63946]';

                  return (
                    <tr key={teacher.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                      <td className="p-4 border-r border-[#E9E1D5]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-[#2C2625] border border-[#E9E1D5]">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-[#2C2625]">{teacher.name}</h3>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-r border-[#E9E1D5]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#FDFBF7] rounded-full overflow-hidden border border-[#E9E1D5]/50 w-24">
                            <div className={cn("h-full rounded-full", loadColor)} style={{ width: `${loadPercent}%` }} />
                          </div>
                          <span className="text-xs font-bold text-[#2C2625] whitespace-nowrap">{teacher.assigned} Completed / {teacher.max} Total</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Button onClick={() => navigate('/timetable/teacher', { state: { teacher } })} variant="ghost" className="h-8 px-3 text-xs font-bold text-[#2C2625] hover:bg-[#FDFBF7] border border-[#E9E1D5]">
                          View Schedule
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
import { useAuth } from '../../context/AuthContext';
import { getFilteredClasses } from '../../pages/CreateTimetablePage';

export function HodTimetable() {
  const { activeRole, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeView, setActiveView] = useState('dashboard');

  const isHOD = activeRole === 'HOD';
  const hodDepartment = user?.metadata?.departmentId || '';

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({ class: '', section: '', department: isHOD && hodDepartment ? hodDepartment : '', teacher: '' });

  const TimetableHeader = () => (
    <div className="relative mt-4 mx-0 flex min-h-[220px] flex-col justify-between gap-5 overflow-hidden rounded-[28px] bg-[#A78BFA] px-6 pb-5 pt-6 transition-all duration-500 sm:mx-4 sm:p-8 md:flex-row md:items-center md:gap-6 md:rounded-[32px] md:p-10 lg:mx-6">
      <div className="relative z-10 flex h-full max-w-xl flex-col justify-center pr-[108px] sm:pr-0">
        <h1 className="text-[2.15rem] font-black leading-none tracking-tight text-white sm:text-4xl">Academic Timetable</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant="outline" className="bg-white/20 border-white/20 text-white font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
            Session 2026-27
          </Badge>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest italic">Scheduling & Allocation</span>
        </div>
        <p className="mt-3 hidden max-w-md text-xs font-bold text-white/90 md:block">
          Manage school schedules, resolve conflicts, and track teacher workloads from a unified dashboard.
        </p>

        <div className="mt-5 flex items-center gap-3 md:mt-6">
          <Button
            onClick={() => navigate('/timetable/create')}
            className="h-9 rounded-xl bg-white px-4 text-[9px] font-black uppercase tracking-widest text-[#A78BFA] shadow-none transition-all hover:scale-105 hover:bg-white/90 sm:h-10 sm:px-6 sm:text-[10px]"
          >
            <Plus className="w-4 h-4 mr-2" /> New Timetable
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 -right-2 sm:right-4 z-0 flex justify-end select-none lg:hidden">
        <img
          src="/time.png"
          alt="Timetable Illustration"
          className="h-auto w-[168px] object-contain sm:w-[220px]"
        />
      </div>

      <div className="absolute right-8 bottom-0 top-0 hidden lg:flex items-center justify-end w-1/3 pointer-events-none select-none">
        <img
          src="/time.png"
          alt="Timetable Illustration"
          className="object-contain h-[140%] translate-y-12 translate-x-4 max-h-[260px]"
        />
      </div>
    </div>
  );



  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 mx-0 sm:mx-4 lg:mx-6 mt-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {KPI_DATA.map((kpi, idx) => (
          <StatsCard key={idx} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#2C2625]">Today's Overview</h2>
              <p className="text-sm font-bold text-[#2C2625]/60">Thursday Schedule</p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              <div className="w-full sm:w-[120px]">
                <Select
                  label="Class"
                  placeholder="All Classes"
                  value={filters.class}
                  onChange={(v) => setFilters({ ...filters, class: v })}
                  options={getFilteredClasses(isHOD, hodDepartment)}
                  className="h-10 text-xs bg-white rounded-xl"
                />
              </div>
              <div className="w-full sm:w-[120px]">
                <Select
                  label="Section"
                  placeholder="All Sections"
                  value={filters.section}
                  onChange={(v) => setFilters({ ...filters, section: v })}
                  options={[{ label: 'Section A', value: 'Section A' }, { label: 'Section B', value: 'Section B' }]}
                  className="h-10 text-xs bg-white rounded-xl"
                />
              </div>
              <div className="w-full sm:w-[120px]">
                <Select
                  label="Department"
                  placeholder="All Depts"
                  value={filters.department}
                  onChange={(v) => setFilters({ ...filters, department: v })}
                  options={isHOD && hodDepartment ? [{label: hodDepartment, value: hodDepartment}] : [{ label: 'Science', value: 'Science' }, { label: 'Arts', value: 'Arts' }, { label: 'General', value: 'General' }]}
                  className="h-10 text-xs bg-white rounded-xl"
                  disabled={isHOD}
                />
              </div>
              <div className="w-full sm:w-[120px]">
                <Select
                  label="Teacher"
                  placeholder="All Teachers"
                  value={filters.teacher}
                  onChange={(v) => setFilters({ ...filters, teacher: v })}
                  options={[{ label: 'Sarah J.', value: 'Sarah J.' }, { label: 'John D.', value: 'John D.' }]}
                  className="h-10 text-xs bg-white rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-[#E9E1D5]">
            <div className="divide-y divide-[#E9E1D5]">
              {SCHEDULE_DATA.map((slot, idx) => (
                <div key={idx} className="p-4 sm:p-6 hover:bg-[#FDFBF7] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group first:rounded-t-[30px] last:rounded-b-[30px]">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-24 shrink-0 text-sm font-bold text-[#2C2625]/70 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#2C2625]/40" />
                      {slot.time}
                    </div>
                    <div className={cn(
                      "w-1 rounded-full h-12 shrink-0",
                      slot.type === 'Break' ? 'bg-[#E9E1D5]' : 'bg-[#C37A67]'
                    )} />
                    <div>
                      <h4 className="text-base font-bold text-[#2C2625]">{slot.subject}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs font-medium text-[#2C2625]/60">
                        {slot.teacher !== '-' && (
                          <span className="flex items-center gap-1"><UserSquare2 className="w-3.5 h-3.5" /> {slot.teacher}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {slot.status === 'Published' && <Badge className="bg-[#88AC88]/10 text-[#88AC88] border-none font-bold">Published</Badge>}
                    {slot.status === 'Draft' && <Badge className="bg-[#E4B76D]/10 text-[#E4B76D] border-none font-bold">Draft</Badge>}
                    {slot.status === 'Conflict' && <Badge className="bg-[#E63946]/10 text-[#E63946] border-none font-bold hover:bg-[#E63946]/20 cursor-pointer">Conflict Detected</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-sm bg-[#C37A67] text-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-black mb-2">Publish Next Week</h3>
              <p className="text-sm text-white/80 mb-6 font-medium leading-relaxed">Review and publish the timetable for Week 12. There are 2 unresolved conflicts.</p>
              <Button className="w-full bg-white text-[#C37A67] hover:bg-white/90 font-black tracking-widest text-[10px] uppercase rounded-xl h-12">
                Review & Publish
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-sm bg-white">
            <CardHeader className="border-b border-[#E9E1D5] px-6 py-5">
              <CardTitle className="text-base font-bold text-[#2C2625]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button onClick={() => navigate('/timetable/create')} variant="ghost" className="w-full justify-start text-[#2C2625] hover:bg-[#FDFBF7] rounded-xl h-12 font-bold text-sm">
                <Plus className="w-4 h-4 mr-3 text-[#C37A67]" /> Create New Schedule
              </Button>
              <Button variant="ghost" className="w-full justify-start text-[#2C2625] hover:bg-[#FDFBF7] rounded-xl h-12 font-bold text-sm">
                <Users className="w-4 h-4 mr-3 text-[#88AC88]" /> Manage Substitutions
              </Button>
              <Button variant="ghost" className="w-full justify-start text-[#2C2625] hover:bg-[#FDFBF7] rounded-xl h-12 font-bold text-sm">
                <Download className="w-4 h-4 mr-3 text-[#A78BFA]" /> Export Timetables
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-[#2C2625] font-['Outfit'] pb-20">
      <TimetableHeader />
      <div className="sticky top-0 z-40 mb-6 mt-4 px-0 sm:px-4 lg:px-6 shrink-0">
        <TabSwitcher
          tabs={[
            { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
            { id: 'classes', label: 'CLASS SCHEDULES', icon: CalendarDays },
            { id: 'teachers', label: 'TEACHER WORKLOAD', icon: Users },
          ]}
          activeTab={activeView}
          onTabChange={(id) => setActiveView(id as any)}
          color="bg-[#C37A67]"
        />
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-3 py-2 sm:px-6 lg:px-8">
        {activeView === 'dashboard' && <DashboardView />}

        {activeView === 'classes' && <ClassSchedulesView />}

        {activeView === 'teachers' && <TeacherWorkloadView />}
      </main>


    </div>
  );
}

