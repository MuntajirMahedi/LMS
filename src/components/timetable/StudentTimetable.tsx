import { Clock, Coffee, UserSquare2, Download, CalendarDays, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

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

const SPECIAL_DAYS: Record<string, { type: 'holiday' | 'exam', label: string }> = {
  'Wednesday': { type: 'exam', label: 'Mid-Term Exams' },
  'Friday': { type: 'holiday', label: 'Diwali Break' }
};

export function StudentTimetable() {
  const { user } = useAuth();
  const classId = user?.metadata?.classId || 'Not Assigned';
  const sectionId = user?.metadata?.sectionId || '';

  return (
    <div className="min-h-screen text-[#2C2625] font-['Outfit'] pb-20">
      <div className="relative mt-4 mx-0 flex min-h-[220px] flex-col justify-between gap-5 overflow-hidden rounded-[28px] bg-[#A78BFA] px-6 pb-5 pt-6 transition-all duration-500 sm:mx-4 sm:p-8 md:flex-row md:items-center md:gap-6 md:rounded-[32px] md:p-10 lg:mx-6">
        <div className="relative z-10 flex h-full max-w-xl flex-col justify-center pr-[108px] sm:pr-0">
          <h1 className="text-[2.15rem] font-black leading-none tracking-tight text-white sm:text-4xl">My Timetable</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="bg-white/20 border-white/20 text-white font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
              Session 2026-27
            </Badge>
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest italic">Class {classId} {sectionId && `- Section ${sectionId}`}</span>
          </div>
          <p className="mt-3 hidden max-w-md text-xs font-bold text-white/90 md:block">
            View your daily class schedule, subjects, and teachers.
          </p>
        </div>
        <div className="pointer-events-none absolute bottom-2 -right-2 sm:right-4 z-0 flex justify-end select-none lg:hidden">
          <img src="/time.png" alt="Timetable Illustration" className="h-auto w-[168px] object-contain sm:w-[220px]" />
        </div>
        <div className="absolute right-8 bottom-0 top-0 hidden lg:flex items-center justify-end w-1/3 pointer-events-none select-none">
          <img src="/time.png" alt="Timetable Illustration" className="object-contain h-[140%] translate-y-12 translate-x-4 max-h-[260px]" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        {/* Happening Now & Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 stagger-container">
          {/* Quick Stats */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Happening Now Widget */}
            <div className="bg-[#FDFBF7] rounded-[24px] border border-[#E9E1D5] p-5 sm:p-6 shadow-sm flex flex-col justify-center relative overflow-hidden hover-lift">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Clock className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E63946]"></span>
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#E63946]">Happening Now</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between relative z-10">
                <div>
                  <h4 className="text-2xl font-black text-[#2C2625]">Mathematics</h4>
                  <div className="flex items-center gap-3 mt-1.5 text-sm font-bold text-[#2C2625]/70">
                    <span className="flex items-center gap-1"><UserSquare2 className="w-4 h-4" /> Mrs. Sarah J.</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/45 mb-1">Ends in</p>
                  <p className="text-xl font-black text-[#2C2625]">15 mins</p>
                </div>
              </div>
            </div>

            {/* Upcoming Holidays Widget */}
            <div className="rounded-[24px] border border-[#88AC88]/20 bg-gradient-to-b from-[#88AC88]/10 to-[#88AC88]/5 p-5 sm:p-6 shadow-sm relative overflow-hidden hover-lift">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Calendar className="w-24 h-24 text-[#88AC88]" />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Calendar className="w-4 h-4 text-[#88AC88]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#88AC88]">Upcoming Holidays</h3>
              </div>
              <div className="space-y-4 relative z-10 flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex flex-col items-center justify-center shrink-0 shadow-sm border border-[#88AC88]/10">
                    <span className="text-[9px] font-black uppercase text-[#88AC88]">Nov</span>
                    <span className="text-sm font-black text-[#88AC88]">12</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#2C2625]">Diwali Break</h4>
                    <p className="text-xs font-bold text-[#2C2625]/60 mt-0.5">In 12 days • Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Widget */}
          <div className="rounded-[24px] border border-[#A78BFA]/20 bg-gradient-to-b from-[#A78BFA]/10 to-[#A78BFA]/5 p-5 sm:p-6 shadow-sm relative overflow-hidden hover-lift">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <CalendarDays className="w-24 h-24 text-[#A78BFA]" />
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <CalendarDays className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#A78BFA]">Upcoming Events</h3>
            </div>
            <div className="space-y-4 relative z-10 flex-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/60 flex flex-col items-center justify-center shrink-0 shadow-sm border border-[#A78BFA]/10">
                  <span className="text-[9px] font-black uppercase text-[#A78BFA]">Nov</span>
                  <span className="text-sm font-black text-[#A78BFA]">24</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#2C2625]">Science Fair</h4>
                  <p className="text-xs font-bold text-[#2C2625]/60 mt-0.5">In 24 days • Main Hall</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] border border-[#E9E1D5] shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5] flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-[#2C2625]/60" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#2C2625]">Weekly Schedule</h2>
              <p className="text-sm font-bold text-[#2C2625]/60">Your current classes</p>
            </div>
          </div>
          <Button className="flex-1 sm:flex-none whitespace-nowrap bg-[#C37A67] text-white hover:bg-[#C37A67]/90 font-bold rounded-xl h-10 px-4 text-xs">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>

        <div className="bg-white rounded-[32px] border border-[#E9E1D5] shadow-sm overflow-hidden">
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
              <tbody className="divide-y divide-[#E9E1D5] stagger-container">
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

                        const slot = getSubjectForSlot(dIdx, pIdx);
                        return (
                          <td key={day} className="p-2.5 border-r border-[#E9E1D5] last:border-0 align-top group hover:bg-[#FDFBF7]/50 transition-colors cursor-pointer">
                            <div className={cn("rounded-2xl p-3 h-full border border-transparent group-hover:border-[#E9E1D5]/60 transition-all", slot.color.split(' ')[0])}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className={cn("text-sm font-black", slot.color.split(' ')[1])}>{slot.subject}</h4>
                              </div>
                              <div className={cn("flex items-center gap-1.5 text-[11px] font-bold opacity-70", slot.color.split(' ')[1])}>
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
      </main>
    </div>
  );
}
