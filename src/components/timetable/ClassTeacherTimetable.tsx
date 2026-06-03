import { useState } from 'react';
import { Clock, Coffee, Users, CalendarDays, CheckCircle2, AlertCircle, BookOpen, LayoutDashboard, UserSquare2, MessageSquare, ClipboardList, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { TabSwitcher } from '../ui/TabSwitcher';
import { StatsCard } from '../dashboard/DashboardWidgets';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { EditTimetableModal } from './EditTimetableModal';

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

const MOCK_CLASS_SCHEDULE = [
  { subject: 'Mathematics', teacher: 'Sarah Jenkins', color: 'bg-[#A78BFA]/10 text-[#A78BFA]', isExam: false },
  { subject: 'Physics', teacher: 'Dr. Alan Grant', color: 'bg-[#E4B76D]/10 text-[#E4B76D]', isExam: false },
  { subject: 'Chemistry', teacher: 'Alice Murphy', color: 'bg-[#88AC88]/10 text-[#88AC88]', isExam: false },
  { subject: 'English', teacher: 'Emma Watson', color: 'bg-[#C37A67]/10 text-[#C37A67]', isExam: false },
  { subject: 'History', teacher: 'John Doe', color: 'bg-blue-500/10 text-blue-500', isExam: false },
  { subject: 'Physical Ed', teacher: 'Mike Smith', color: 'bg-[#E4B76D]/10 text-[#E4B76D]', isExam: false }
];

const MOCK_TEACHER_SCHEDULE = [
  { subject: 'Mathematics', classSection: 'Class 8-A', color: 'bg-[#A78BFA]/10 text-[#A78BFA]', isExam: false },
  { subject: 'Free Period', classSection: '-', color: 'bg-[#E9E1D5]/30 text-[#2C2625]/50', isExam: false },
  { subject: 'Mathematics', classSection: 'Class 8-B', color: 'bg-[#A78BFA]/10 text-[#A78BFA]', isExam: false },
  { subject: 'Mathematics', classSection: 'Class 9-A', color: 'bg-[#C37A67]/10 text-[#C37A67]', isExam: true },
  { subject: 'Free Period', classSection: '-', color: 'bg-[#E9E1D5]/30 text-[#2C2625]/50', isExam: false },
  { subject: 'Mathematics', classSection: 'Class 10-C', color: 'bg-[#88AC88]/10 text-[#88AC88]', isExam: false }
];

const MOCK_TODAY_OVERVIEW = [
  { time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Sarah Jenkins', type: 'Core', status: 'Upcoming' },
  { time: '08:50 - 09:35', subject: 'Physics', teacher: 'Dr. Alan Grant', type: 'Lab', status: 'Upcoming' },
  { time: '09:35 - 09:50', subject: 'Morning Break', teacher: '-', type: 'Break', status: 'Upcoming' },
  { time: '09:50 - 10:35', subject: 'English Lit.', teacher: 'Emma Watson', type: 'Core', status: 'Upcoming' },
  { time: '10:40 - 11:25', subject: 'History', teacher: 'John Doe', type: 'Core', status: 'Upcoming' },
];

const getSubjectForClassSlot = (dayIdx: number, periodIdx: number) => {
  const index = (dayIdx * 3 + periodIdx) % MOCK_CLASS_SCHEDULE.length;
  return MOCK_CLASS_SCHEDULE[index];
};

const getSubjectForTeacherSlot = (dayIdx: number, periodIdx: number) => {
  const index = (dayIdx * 3 + periodIdx) % MOCK_TEACHER_SCHEDULE.length;
  return MOCK_TEACHER_SCHEDULE[index];
};

const SPECIAL_DAYS: Record<string, { type: 'holiday' | 'exam', label: string }> = {
  'Wednesday': { type: 'exam', label: 'Mid-Term Exams' },
  'Friday': { type: 'holiday', label: 'Diwali Break' }
};

export function ClassTeacherTimetable() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  
  // Simulated locked data for the Class Teacher's assigned class
  const assignedClass = {
    class: 'Class 8',
    section: 'Section A',
    department: 'General'
  };

  const KPI_DATA = [
    { label: 'Total Classes', value: '42', sub: 'Assigned Class (Week)', icon: BookOpen, color: 'bg-primary' },
    { label: 'Absent Students', value: '3', sub: 'Today', icon: Users, color: 'bg-brand-orange' },
    { label: 'Conflicts', value: '0', sub: 'All Clear', icon: AlertCircle, color: 'bg-[#88AC88]' },
    { label: 'Approvals', value: '1', sub: 'Leave Req.', icon: CheckCircle2, color: 'bg-[#C37A67]' },
  ];

  const TimetableHeader = () => (
    <div className="relative mt-4 mx-0 flex min-h-[220px] flex-col justify-between gap-5 overflow-hidden rounded-[28px] bg-brand-orange px-6 pb-5 pt-6 transition-all duration-500 sm:mx-4 sm:p-8 md:flex-row md:items-center md:gap-6 md:rounded-[32px] md:p-10 lg:mx-6">
      <div className="relative z-10 flex h-full max-w-xl flex-col justify-center pr-[108px] sm:pr-0">
        <h1 className="text-[2.15rem] font-black leading-none tracking-tight text-white sm:text-4xl">Class Teacher Timetable</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant="outline" className="bg-white/20 border-white/20 text-white font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest backdrop-blur-sm">
            SESSION 2026-27
          </Badge>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest italic">{user?.name || 'Class Teacher'}</span>
        </div>
        <p className="mt-3 hidden max-w-md text-xs font-bold text-white/90 md:block">
          View your assigned class schedule and your personal teaching schedule.
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-2 -right-2 sm:right-4 z-0 flex justify-end select-none lg:hidden">
        <CalendarDays className="w-40 h-40 text-white opacity-10" />
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

  const LockedFilters = ({ onEdit }: { onEdit?: () => void }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] border border-[#E9E1D5] shadow-sm mb-6 mx-0 sm:mx-4 lg:mx-6 mt-6">
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
        <div className="w-full sm:w-[140px]">
          <Select
            label="Select Class"
            value={assignedClass.class}
            onChange={() => {}}
            options={[{ label: assignedClass.class, value: assignedClass.class }]}
            className="px-3"
            disabled={true}
          />
        </div>
        <div className="w-full sm:w-[140px]">
          <Select
            label="Select Section"
            value={assignedClass.section}
            onChange={() => {}}
            options={[{ label: assignedClass.section, value: assignedClass.section }]}
            className="px-3"
            disabled={true}
          />
        </div>
        <div className="w-full sm:w-[140px]">
          <Select
            label="Select Department"
            value={assignedClass.department}
            onChange={() => {}}
            options={[{ label: assignedClass.department, value: assignedClass.department }]}
            className="px-3"
            disabled={true}
          />
        </div>
      </div>
      
      {onEdit && (
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Button onClick={onEdit} variant="outline" className="flex-1 sm:flex-none whitespace-nowrap border-[#C37A67] text-[#C37A67] hover:bg-[#C37A67]/10 font-bold rounded-xl h-10 px-4 text-xs">
            Edit Timetable
          </Button>
        </div>
      )}
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 mx-0 sm:mx-4 lg:mx-6 mt-6">
      <LockedFilters />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {KPI_DATA.map((kpi, idx) => (
          <StatsCard key={idx} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Schedule Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#2C2625]">Class {assignedClass.class}-{assignedClass.section.split(' ')[1]} Overview</h2>
              <p className="text-sm font-bold text-[#2C2625]/60">Today's Schedule</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-[#E9E1D5]">
            <div className="divide-y divide-[#E9E1D5]">
              {MOCK_TODAY_OVERVIEW.map((slot, idx) => (
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
                    <Badge className="bg-[#88AC88]/10 text-[#88AC88] border-none font-bold">{slot.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-sm bg-[#88AC88] text-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-black mb-2">Class Performance</h3>
              <p className="text-sm text-white/80 mb-6 font-medium leading-relaxed">Review overall attendance and upcoming assignments for Class 8-A.</p>
              <Button className="w-full bg-white text-[#88AC88] hover:bg-white/90 font-black tracking-widest text-[10px] uppercase rounded-xl h-12">
                View Reports <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-sm bg-white">
            <CardHeader className="border-b border-[#E9E1D5] px-6 py-5">
              <CardTitle className="text-base font-bold text-[#2C2625]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start text-[#2C2625] hover:bg-[#FDFBF7] rounded-xl h-12 font-bold text-sm">
                <ClipboardList className="w-4 h-4 mr-3 text-[#C37A67]" /> Take Attendance
              </Button>
              <Button variant="ghost" className="w-full justify-start text-[#2C2625] hover:bg-[#FDFBF7] rounded-xl h-12 font-bold text-sm">
                <MessageSquare className="w-4 h-4 mr-3 text-[#88AC88]" /> Message Parents
              </Button>
              <Button variant="ghost" className="w-full justify-start text-[#2C2625] hover:bg-[#FDFBF7] rounded-xl h-12 font-bold text-sm">
                <Users className="w-4 h-4 mr-3 text-[#A78BFA]" /> View Student List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const ClassScheduleView = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
      <div className="space-y-6 animate-in fade-in duration-500 mx-0 sm:mx-4 lg:mx-6 mt-6">
        <EditTimetableModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          targetClass={assignedClass.class} 
          section={assignedClass.section} 
          department={assignedClass.department} 
        />
        <LockedFilters onEdit={() => setIsEditModalOpen(true)} />
        <div className="bg-white rounded-[32px] border border-[#E9E1D5] shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-[#E9E1D5] pb-2 relative">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-20 shadow-sm">
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
                  <td className="p-4 border-r border-[#E9E1D5] bg-[#FDFBF7]/50 sticky left-0 z-10">
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
                      const specialDay = SPECIAL_DAYS[day];
                      if (specialDay) {
                        return (
                          <td key={day} className="p-2.5 border-r border-[#E9E1D5] last:border-0 align-top">
                            <div className={cn("rounded-2xl p-3 h-full border border-transparent flex flex-col items-center justify-center text-center opacity-80", specialDay.type === 'exam' ? 'bg-[#E63946]/10 text-[#E63946]' : 'bg-[#88AC88]/10 text-[#88AC88]')}>
                              <span className="text-sm font-black tracking-wider uppercase mb-1">{specialDay.type}</span>
                              <span className="text-[10px] font-bold">{specialDay.label}</span>
                            </div>
                          </td>
                        );
                      }

                      const slot = getSubjectForClassSlot(dIdx, pIdx);
                      return (
                        <td key={day} className="p-2.5 border-r border-[#E9E1D5] last:border-0 align-top group hover:bg-[#FDFBF7]/50 transition-colors cursor-pointer">
                          <div className={cn("rounded-2xl p-3 h-full border border-transparent group-hover:border-[#E9E1D5]/60 transition-all", slot.color.split(' ')[0])}>
                            <div className="flex flex-col gap-1.5 mb-2">
                              <h4 className={cn("text-sm font-black", slot.color.split(' ')[1])}>{slot.subject}</h4>
                            </div>
                            <div className={cn("flex items-center gap-1.5 text-[11px] font-bold opacity-70", slot.color.split(' ')[1])}>
                              <Users className="w-3.5 h-3.5" /> {slot.teacher}
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

  const TeacherScheduleView = () => (
    <div className="space-y-6 animate-in fade-in duration-500 mx-0 sm:mx-4 lg:mx-6 mt-6">
      <div className="bg-white rounded-[32px] border border-[#E9E1D5] shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-[#E9E1D5] pb-2 relative">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-20 shadow-sm">
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
                  <td className="p-4 border-r border-[#E9E1D5] bg-[#FDFBF7]/50 sticky left-0 z-10">
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
                      const slot = getSubjectForTeacherSlot(dIdx, pIdx);
                      if (slot.subject === 'Free Period') {
                        return (
                          <td key={day} className="p-2.5 border-r border-[#E9E1D5] last:border-0 align-top group hover:bg-[#FDFBF7]/50 transition-colors cursor-pointer">
                            <div className={cn("rounded-2xl p-3 h-full border border-transparent group-hover:border-[#E9E1D5]/60 transition-all flex flex-col items-center justify-center opacity-50", slot.color.split(' ')[0])}>
                              <h4 className={cn("text-sm font-black", slot.color.split(' ')[1])}>{slot.subject}</h4>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="p-2.5 border-r border-[#E9E1D5] last:border-0 align-top group hover:bg-[#FDFBF7]/50 transition-colors cursor-pointer">
                          <div className={cn("rounded-2xl p-3 h-full border border-transparent group-hover:border-[#E9E1D5]/60 transition-all", slot.color.split(' ')[0])}>
                            <div className="flex flex-col gap-1.5 mb-2">
                              <h4 className={cn("text-sm font-black", slot.color.split(' ')[1])}>{slot.subject}</h4>
                            </div>
                            <div className={cn("flex items-center gap-1.5 text-[11px] font-bold opacity-70", slot.color.split(' ')[1])}>
                              <Users className="w-3.5 h-3.5" /> {slot.classSection}
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

  return (
    <div className="min-h-screen text-[#2C2625] font-['Outfit'] pb-20">
      <TimetableHeader />
      <div className="sticky top-0 z-40 mb-6 mt-4 px-0 sm:px-4 lg:px-6 shrink-0">
        <TabSwitcher
          tabs={[
            { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
            { id: 'classes', label: 'CLASS SCHEDULE', icon: Users },
            { id: 'teachers', label: 'MY TEACHING SCHEDULE', icon: CalendarDays },
          ]}
          activeTab={activeView}
          onTabChange={(id) => setActiveView(id as any)}
          color="bg-[#C37A67]"
        />
      </div>

      <main className="mx-auto max-w-7xl px-3 py-2 sm:px-6 lg:px-8">
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'classes' && <ClassScheduleView />}
        {activeView === 'teachers' && <TeacherScheduleView />}
      </main>
    </div>
  );
}
