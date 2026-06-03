import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, UserSquare2 } from 'lucide-react';
import { cn } from '../lib/utils';

const WEEK_DAYS = [
  { id: '1', day: 'Mon', date: '17 Sep' },
  { id: '2', day: 'Tue', date: '18 Sep' },
  { id: '3', day: 'Wed', date: '19 Sep' },
  { id: '4', day: 'Thu', date: '20 Sep' },
  { id: '5', day: 'Fri', date: '21 Sep' },
  { id: '6', day: 'Sat', date: '22 Sep' },
];

// We mock a schedule derived from the timetable logic (where a subject has an assigned teacher).
// The user requested: "todays periods of him or her which subject which class to which section and which location this and thi data come from timetable"
const MOCK_TEACHER_SCHEDULE = [
  { id: 1, time: '09:00 - 09:45', name: '1st', subject: 'Mathematics', class: 'Class 7', section: 'Section A', room: 'Room 101', color: 'bg-[#A78BFA]', textColor: 'text-[#A78BFA]', lightBg: 'bg-[#A78BFA]/10' },
  { id: 2, time: '09:45 - 10:30', name: '2nd', subject: 'Mathematics', class: 'Class 8', section: 'Section B', room: 'Room 102', color: 'bg-[#E4B76D]', textColor: 'text-[#E4B76D]', lightBg: 'bg-[#E4B76D]/10' },
  { id: 4, time: '10:45 - 11:30', name: '3rd', subject: 'Mathematics', class: 'Class 9', section: 'Section A', room: 'Room 201', color: 'bg-[#88AC88]', textColor: 'text-[#88AC88]', lightBg: 'bg-[#88AC88]/10' },
  { id: 5, time: '11:30 - 12:15', name: '4th', subject: 'Advanced Math', class: 'Class 10', section: 'Section C', room: 'Room 205', color: 'bg-[#C37A67]', textColor: 'text-[#C37A67]', lightBg: 'bg-[#C37A67]/10' },
  { id: 7, time: '01:00 - 01:45', name: '5th', subject: 'Mathematics', class: 'Class 6', section: 'Section A', room: 'Room 105', color: 'bg-[#6D8FE3]', textColor: 'text-[#6D8FE3]', lightBg: 'bg-[#6D8FE3]/10' },
];

export default function TeacherSchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDay, setActiveDay] = useState('1');
  
  // Extract teacher data from navigation state if available
  const teacher = location.state?.teacher || {
    id: 'T000',
    name: 'Unknown Teacher',
  };

  return (
    <div className="min-h-screen text-[#2C2625] font-['Outfit'] pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/timetable')}
            className="w-10 h-10 rounded-xl bg-white border border-[#E9E1D5] flex items-center justify-center hover:bg-[#FDFBF7] transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#2C2625]" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#2C2625]">Teacher Schedule</h1>
            <p className="text-xs font-bold text-[#2C2625]/60">Today's periods for {teacher.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 mt-4 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-[#E9E1D5] shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FDFBF7] border border-[#E9E1D5] flex items-center justify-center shrink-0">
            <UserSquare2 className="w-8 h-8 text-[#2C2625]/40" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2C2625]">{teacher.name}</h2>
            <p className="text-sm font-bold text-[#2C2625]/60 mt-1 flex items-center gap-2">
              Schedule Overview
              {activeDay === '1' && <span className="text-[#C37A67]">• 17 Sep</span>}
            </p>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="w-full pb-2">
          <div className="flex items-center justify-between bg-white rounded-full border border-[#E9E1D5] p-1 shadow-sm w-full">
            {WEEK_DAYS.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-2 rounded-full transition-all text-sm",
                  activeDay === day.id 
                    ? "bg-[#FDFBF7] border border-[#C37A67]/30 text-[#C37A67] shadow-sm font-bold" 
                    : "text-[#2C2625]/60 hover:bg-[#FDFBF7] font-medium"
                )}
              >
                <span>{day.day}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-4">
          {MOCK_TEACHER_SCHEDULE.map((period) => (
            <div key={period.id} className="bg-white p-5 rounded-[24px] border border-[#E9E1D5] shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden">
              {/* Colorful stick matching the theme that runs full height */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", period.color)} />
              
              <div className="flex justify-between items-start gap-4 pl-2">
                {/* Subject and substitution tag */}
                <div className="flex items-center gap-2 flex-wrap">
                   <h4 className="text-base font-black text-[#2C2625]">{period.subject}</h4>
                   <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", period.lightBg, period.textColor)}>
                     Regular
                   </span>
                </div>
                {/* Time and Period */}
                <div className="text-right flex flex-col items-end shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-[#2C2625]">{period.time}</span>
                  <span className="text-[10px] font-bold text-[#2C2625]/40 mt-0.5 uppercase tracking-widest">Period {period.name.replace(/\D/g, '')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-2">
                 <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", period.lightBg)}>
                   <UserSquare2 className={cn("w-5 h-5", period.textColor)} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-[#2C2625]">{period.class} - {period.section}</span>
                   <span className="text-xs font-bold text-[#2C2625]/40 flex items-center gap-1 mt-0.5">
                     <MapPin className="w-3 h-3" /> {period.room}
                   </span>
                 </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
