import { useState } from 'react';
import { Plus, Clock, Coffee, UserSquare2, Download, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { Select } from '../ui/Select';
import { useNavigate } from 'react-router-dom';

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

const MOCK_SUBJECTS_CHILD_1 = [
  { subject: 'Mathematics', teacher: 'Sarah J.', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'Physics', teacher: 'John D.', color: 'bg-[#E4B76D]/10 text-[#E4B76D]' },
  { subject: 'Chemistry', teacher: 'Alice M.', color: 'bg-[#88AC88]/10 text-[#88AC88]' },
  { subject: 'English', teacher: 'Bob T.', color: 'bg-[#C37A67]/10 text-[#C37A67]' },
  { subject: 'History', teacher: 'Emma W.', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'Geography', teacher: 'Tom H.', color: 'bg-[#88AC88]/10 text-[#88AC88]' },
];

const MOCK_SUBJECTS_CHILD_2 = [
  { subject: 'Art', teacher: 'Ms. Clara', color: 'bg-[#E4B76D]/10 text-[#E4B76D]' },
  { subject: 'Mathematics', teacher: 'Sarah J.', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'English', teacher: 'Emma W.', color: 'bg-[#C37A67]/10 text-[#C37A67]' },
  { subject: 'Science', teacher: 'Dr. Alan Grant', color: 'bg-[#88AC88]/10 text-[#88AC88]' },
  { subject: 'Music', teacher: 'Mr. Ray', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'Physical Ed', teacher: 'Mike S.', color: 'bg-blue-500/10 text-blue-500' },
];

const getSubjectForSlot = (dayIdx: number, periodIdx: number, childId: string) => {
  const subjects = childId === 'child_1' ? MOCK_SUBJECTS_CHILD_1 : MOCK_SUBJECTS_CHILD_2;
  const index = (dayIdx * 3 + periodIdx) % subjects.length;
  return subjects[index];
};

const SPECIAL_DAYS: Record<string, { type: 'holiday' | 'exam', label: string }> = {
  'Wednesday': { type: 'exam', label: 'Mid-Term Exams' },
  'Friday': { type: 'holiday', label: 'Diwali Break' }
};

export function ParentTimetable() {
  const { user, checkPermission } = useAuth();
  const navigate = useNavigate();
  const canCreate = checkPermission('TIMETABLE', 'create');
  
  // Mock children list for the parent
  const childrenOptions = [
    { label: 'Jason Todd (Class 10-A)', value: 'child_1', classInfo: '10-A' },
    { label: 'Tim Drake (Class 8-C)', value: 'child_2', classInfo: '8-C' }
  ];

  const [selectedChild, setSelectedChild] = useState('child_1');
  const currentChild = childrenOptions.find(c => c.value === selectedChild);

  return (
    <div className="min-h-screen text-[#2C2625] font-['Outfit'] pb-20">
      <div className="relative mt-4 mx-0 flex min-h-[220px] flex-col justify-between gap-5 overflow-hidden rounded-[28px] bg-brand-green px-6 pb-5 pt-6 transition-all duration-500 sm:mx-4 sm:p-8 md:flex-row md:items-center md:gap-6 md:rounded-[32px] md:p-10 lg:mx-6">
        <div className="relative z-10 flex h-full max-w-xl flex-col justify-center pr-[108px] sm:pr-0">
          <h1 className="text-[2.15rem] font-black leading-none tracking-tight text-white sm:text-4xl">Children's Timetable</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="bg-white/20 border-white/20 text-white font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
              Session 2026-27
            </Badge>
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest italic">{user?.name || 'Parent'}</span>
          </div>
          <p className="mt-3 hidden max-w-md text-xs font-bold text-white/90 md:block">
            View your children's daily class schedules, subjects, and teachers.
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
        
        {/* Child Selector & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] border border-[#E9E1D5] shadow-sm mb-6 mt-2">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-[280px]">
              <Select
                label="Select Child"
                value={selectedChild}
                onChange={setSelectedChild}
                options={childrenOptions}
                className="px-3"
              />
            </div>
            <div className="hidden sm:flex bg-[#FCFAF6] border border-[#E9E1D5] px-4 py-2 rounded-xl items-center gap-2 mt-[22px]">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">Class</span>
               <span className="text-xs font-bold text-[#2C2625]">{currentChild?.classInfo}</span>
            </div>
          </div>
          <div className="flex w-full sm:w-auto gap-3 mt-4 sm:mt-[22px]">
            {canCreate && (
              <Button onClick={() => navigate('/timetable/create')} className="flex-1 sm:flex-none whitespace-nowrap bg-primary text-white hover:bg-primary/90 font-bold rounded-xl h-10 px-4 text-xs">
                <Plus className="w-4 h-4 mr-2" /> Create Timetable
              </Button>
            )}
            <Button className="flex-1 sm:flex-none whitespace-nowrap bg-brand-green text-white hover:bg-brand-green/90 font-bold rounded-xl h-10 px-4 text-xs">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Quick Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 stagger-container">
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
                <h4 className="text-2xl font-black text-[#2C2625]">{selectedChild === 'child_1' ? 'Mathematics' : 'Art'}</h4>
                <div className="flex items-center gap-3 mt-1.5 text-sm font-bold text-[#2C2625]/70">
                  <span className="flex items-center gap-1"><UserSquare2 className="w-4 h-4" /> {selectedChild === 'child_1' ? 'Mrs. Sarah J.' : 'Ms. Clara'}</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/45 mb-1">Ends in</p>
                <p className="text-xl font-black text-[#2C2625]">15 mins</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events/Holidays Widget */}
          <div className="rounded-[24px] border border-brand-green/20 bg-gradient-to-b from-brand-green/10 to-brand-green/5 p-5 sm:p-6 shadow-sm relative overflow-hidden hover-lift">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Calendar className="w-24 h-24 text-brand-green" />
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Calendar className="w-4 h-4 text-brand-green" />
              <h3 className="text-xs font-black uppercase tracking-widest text-brand-green">Upcoming Event</h3>
            </div>
            <div className="space-y-4 relative z-10 flex-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/60 flex flex-col items-center justify-center shrink-0 shadow-sm border border-brand-green/10">
                  <span className="text-[9px] font-black uppercase text-brand-green">Nov</span>
                  <span className="text-sm font-black text-brand-green">12</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#2C2625]">Diwali Break</h4>
                  <p className="text-xs font-bold text-[#2C2625]/60 mt-0.5">In 12 days • School Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
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
                              <div className={cn("rounded-2xl p-3 h-full border border-transparent flex flex-col items-center justify-center text-center opacity-80", specialDay.type === 'exam' ? 'bg-[#E63946]/10 text-[#E63946]' : 'bg-brand-green/10 text-brand-green')}>
                                <span className="text-sm font-black tracking-wider uppercase mb-1">{specialDay.type}</span>
                                <span className="text-[10px] font-bold">{specialDay.label}</span>
                              </div>
                            </td>
                          );
                        }

                        const slot = getSubjectForSlot(dIdx, pIdx, selectedChild);
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
