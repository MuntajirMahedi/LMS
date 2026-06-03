import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, ArrowUp, ArrowDown, X, ArrowLeft, Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const getFilteredClasses = (isHOD: boolean, hodDepartment: string) => {
  let classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  if (isHOD && hodDepartment) {
    try {
      const data = localStorage.getItem('schoolClassStructures');
      if (data) {
        const structures = JSON.parse(data);
        const filtered = Object.keys(structures).filter(c => structures[c].some((d: any) => d.name === hodDepartment));
        if (filtered.length > 0) classes = filtered;
      } else {
        if (hodDepartment === 'Science' || hodDepartment === 'Commerce' || hodDepartment === 'Arts') {
          classes = ['Class 11', 'Class 12'];
        } else {
          classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
        }
      }
    } catch(e) {}
  }
  return classes.map(c => ({ label: c, value: c }));
};

// --- THEMED TIME PICKER COMPONENT ---
const ThemedTimePicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
  shift?: number;
}> = ({ value, onChange, className, align = 'center', shift = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;
    const handlePositioning = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popoverWidth = 260;
      let top = rect.bottom + 8;
      let left = rect.left;
      if (align === 'right') left = rect.right - popoverWidth + 40;
      else if (align === 'center') left = rect.left + rect.width / 2 - popoverWidth / 2;
      left += shift;
      if (left < 12) left = 12;
      else if (left + popoverWidth > viewportWidth - 12) left = viewportWidth - 12 - popoverWidth;
      const popoverHeight = 250;
      if (top + popoverHeight > viewportHeight - 12 && rect.top > popoverHeight + 12) {
        top = rect.top - popoverHeight - 8;
      }
      setPortalStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        zIndex: 99999,
      });
    };
    handlePositioning();
    const timer = setTimeout(handlePositioning, 20);
    window.addEventListener('resize', handlePositioning);
    window.addEventListener('scroll', handlePositioning, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handlePositioning);
      window.removeEventListener('scroll', handlePositioning, true);
    };
  }, [isOpen, align, shift]);

  const timeState = useMemo(() => {
    if (!value) return { hour: '09', minute: '00', ampm: 'AM' };
    if (value.includes('AM') || value.includes('PM')) {
      const parts = value.split(':');
      const hour = parts[0].trim().padStart(2, '0');
      const minAmpm = parts[1].split(' ');
      const minute = minAmpm[0].trim().padStart(2, '0');
      const ampm = minAmpm[1].trim();
      return { hour, minute, ampm };
    }
    const [hStr, mStr] = value.split(':');
    const h = parseInt(hStr || '9');
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return {
      hour: displayH.toString().padStart(2, '0'),
      minute: m.padStart(2, '0'),
      ampm
    };
  }, [value]);

  const displayTime = useMemo(() => {
    return `${timeState.hour}:${timeState.minute} ${timeState.ampm}`;
  }, [timeState]);

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  const ampmList = ['AM', 'PM'];

  const handleSelect = (type: 'hour' | 'minute' | 'ampm', val: string) => {
    const hour = type === 'hour' ? val : timeState.hour;
    const minute = type === 'minute' ? val : timeState.minute;
    const ampm = type === 'ampm' ? val : timeState.ampm;
    let h = parseInt(hour);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const time24Str = `${h.toString().padStart(2, '0')}:${minute} ${ampm}`;
    onChange(time24Str);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        type="text"
        readOnly
        value={displayTime}
        onClick={() => setIsOpen(!isOpen)}
        className={cn("cursor-pointer text-center select-none bg-white", className)}
        placeholder="hh:mm AM/PM"
      />
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={portalStyle}
          className="bg-[#FDFBF7] border border-[#E9E1D5] rounded-[32px] shadow-2xl p-5 w-[260px] animate-in fade-in duration-200"
        >
          <div className="flex gap-2.5 h-[170px] mb-4">
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1.5 pr-1" style={{ scrollbarWidth: 'none' }}>
              <span className="text-[8px] font-black uppercase text-[#2C2625]/45 tracking-widest mb-1.5 sticky top-0 bg-[#FDFBF7] py-1 block w-full text-center">Hour</span>
              {hoursList.map(h => {
                const isActive = h === timeState.hour;
                return (
                  <button
                    key={`h-${h}`}
                    type="button"
                    onClick={() => handleSelect('hour', h)}
                    className={cn(
                      "w-full text-center py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                      isActive
                        ? "bg-[#C37A67] text-white border-[#C37A67] shadow-md shadow-[#C37A67]/20 scale-105"
                        : "bg-white border-[#E9E1D5]/40 text-[#2C2625] hover:bg-[#C37A67]/10 hover:text-[#C37A67] hover:border-[#C37A67]/25"
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1.5 pr-1 border-x border-[#E9E1D5]/40 px-1" style={{ scrollbarWidth: 'none' }}>
              <span className="text-[8px] font-black uppercase text-[#2C2625]/45 tracking-widest mb-1.5 sticky top-0 bg-[#FDFBF7] py-1 block w-full text-center">Min</span>
              {minutesList.map(m => {
                const isActive = m === timeState.minute;
                return (
                  <button
                    key={`m-${m}`}
                    type="button"
                    onClick={() => handleSelect('minute', m)}
                    className={cn(
                      "w-full text-center py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                      isActive
                        ? "bg-[#C37A67] text-white border-[#C37A67] shadow-md shadow-[#C37A67]/20 scale-105"
                        : "bg-white border-[#E9E1D5]/40 text-[#2C2625] hover:bg-[#C37A67]/10 hover:text-[#C37A67] hover:border-[#C37A67]/25"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1.5 pr-1" style={{ scrollbarWidth: 'none' }}>
              <span className="text-[8px] font-black uppercase text-[#2C2625]/45 tracking-widest mb-1.5 sticky top-0 bg-[#FDFBF7] py-1 block w-full text-center">Period</span>
              {ampmList.map(a => {
                const isActive = a === timeState.ampm;
                return (
                  <button
                    key={`a-${a}`}
                    type="button"
                    onClick={() => handleSelect('ampm', a)}
                    className={cn(
                      "w-full text-center py-2.5 rounded-lg text-[10px] font-black transition-all border",
                      isActive
                        ? "bg-[#C37A67] text-white border-[#C37A67] shadow-md shadow-[#C37A67]/20 scale-105"
                        : "bg-white border-[#E9E1D5]/40 text-[#2C2625] hover:bg-[#C37A67]/10 hover:text-[#C37A67] hover:border-[#C37A67]/25"
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full h-10 rounded-2xl bg-[#C37A67] hover:bg-[#C37A67]/90 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-[#C37A67]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Apply Time
          </Button>
        </div>,
        document.body
      )}
    </div>
  );
};

const SUBJECT_TEACHER_MAP: Record<string, string> = {
  'Mathematics': 'Sarah Jenkins',
  'Physics': 'Dr. Alan Grant',
  'Chemistry': 'Marie Curie',
  'English': 'Emma Watson',
  'History': 'John Doe',
  'Biology Lab': 'Dr. Alan Grant',
  'Chemistry Lab': 'Marie Curie',
};

export default function CreateTimetablePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole, user } = useAuth();

  const isHOD = activeRole === 'HOD';
  const hodDepartment = user?.metadata?.departmentId || '';

  const [builderData, setBuilderData] = useState({
    academicYear: '2026 - 2027',
    semester: 'Fall Semester',
    targetClass: location.state?.targetClass || '',
    section: location.state?.section || '',
    department: isHOD && hodDepartment ? hodDepartment : location.state?.department || '',
  });

  const [activeDay, setActiveDay] = useState('Monday');
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  type TimetableItem = {
    id: number;
    type: 'period' | 'break' | 'lab';
    startTime: string;
    endTime: string;
    subject?: string;
    teacher?: string;
    breakName?: string;
  };

  const createDefaultPeriod = (): TimetableItem => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    type: 'period',
    startTime: '08:00 AM',
    endTime: '08:45 AM',
    subject: '',
    teacher: ''
  });

  const [daySchedules, setDaySchedules] = useState<Record<string, TimetableItem[]>>(() =>
    Object.fromEntries(DAYS.map((day) => [day, [createDefaultPeriod()]]))
  );

  const periods = daySchedules[activeDay] || [];

  const handleAddPeriod = () => {
    setDaySchedules((prev) => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), { id: Date.now(), type: 'period', startTime: '09:00 AM', endTime: '09:45 AM', subject: '', teacher: '' }],
    }));
  };

  const handleAddLab = () => {
    setDaySchedules((prev) => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), { id: Date.now(), type: 'lab', startTime: '11:00 AM', endTime: '11:45 AM', subject: '', teacher: '' }],
    }));
  };

  const handleAddBreak = () => {
    setDaySchedules((prev) => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), { id: Date.now(), type: 'break', startTime: '10:00 AM', endTime: '10:30 AM', breakName: 'Lunch Break' }],
    }));
  };

  const handleRemovePeriod = (id: number) => {
    setDaySchedules((prev) => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).filter((p) => p.id !== id),
    }));
  };

  const moveUp = (index: number) => {
    setDaySchedules((prev) => {
      const current = [...(prev[activeDay] || [])];
      if (index === 0) return prev;
      [current[index - 1], current[index]] = [current[index], current[index - 1]];
      return { ...prev, [activeDay]: current };
    });
  };

  const moveDown = (index: number) => {
    setDaySchedules((prev) => {
      const current = [...(prev[activeDay] || [])];
      if (index === current.length - 1) return prev;
      [current[index + 1], current[index]] = [current[index], current[index + 1]];
      return { ...prev, [activeDay]: current };
    });
  };

  const updatePeriod = (index: number, key: string, value: string) => {
    setDaySchedules((prev) => {
      const current = [...(prev[activeDay] || [])];
      current[index] = { ...current[index], [key]: value };
      if (key === 'subject' && SUBJECT_TEACHER_MAP[value]) {
        current[index].teacher = SUBJECT_TEACHER_MAP[value];
      }
      return { ...prev, [activeDay]: current };
    });
  };

  return (
    <div className="min-h-screen text-[#2C2625] font-['Outfit'] pb-20">
      {/* Top Navigation / Header */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/timetable')}
            className="w-10 h-10 rounded-xl bg-white border border-[#E9E1D5] flex items-center justify-center hover:bg-[#FDFBF7] transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#2C2625]" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#2C2625]">Create Timetable</h1>
            <p className="text-xs font-bold text-[#2C2625]/60">Configure and allocate schedules</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/timetable')} className="rounded-xl border-[#E9E1D5] font-bold text-[#2C2625] h-10">
            Cancel
          </Button>
          <Button className="rounded-xl bg-[#C37A67] hover:bg-[#C37A67]/90 text-white font-bold px-6 h-10">
            Save & Publish
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-4 flex flex-col gap-10 overflow-visible">
        
        {/* Top Panel: Configuration (Horizontal Layout) */}
        <div className="w-full flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            
            {!isHOD && (
              <div className="bg-white p-5 rounded-[32px] border border-[#E9E1D5] shadow-sm">
                <h3 className="text-sm font-black text-[#2C2625] uppercase tracking-widest mb-4">1. Setup Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Select 
                    label="Academic Year"
                    className="px-3"
                    value={builderData.academicYear}
                    onChange={(v) => setBuilderData({...builderData, academicYear: v})}
                    options={[{label: '2026 - 2027', value: '2026 - 2027'}, {label: '2027 - 2028', value: '2027 - 2028'}]}
                  />
                  <Select 
                    label="Semester"
                    className="px-3"
                    value={builderData.semester}
                    onChange={(v) => setBuilderData({...builderData, semester: v})}
                    options={[{label: 'Fall Semester', value: 'Fall Semester'}, {label: 'Spring Semester', value: 'Spring Semester'}]}
                  />
                </div>
              </div>
            )}

            {/* Target Class Section */}
            <div className={cn("bg-white p-5 rounded-[32px] border border-[#E9E1D5] shadow-sm", isHOD && "lg:col-span-2")}>
              <h3 className="text-sm font-black text-[#2C2625] uppercase tracking-widest mb-4">2. Target Class</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Select 
                  label="Target Class"
                  placeholder="Select Class"
                  className="px-3"
                  value={builderData.targetClass}
                  onChange={(v) => setBuilderData({...builderData, targetClass: v})}
                  options={getFilteredClasses(isHOD, hodDepartment)}
                />
                <Select 
                  label="Section"
                  placeholder="Select Section"
                  className="px-3"
                  value={builderData.section}
                  onChange={(v) => setBuilderData({...builderData, section: v})}
                  options={[{label: 'Section A', value: 'Section A'}, {label: 'Section B', value: 'Section B'}]}
                />
                <Select 
                  label="Department"
                  placeholder="Select Department"
                  className="px-3"
                  value={builderData.department}
                  onChange={(v) => setBuilderData({...builderData, department: v})}
                  options={isHOD && hodDepartment ? [{label: hodDepartment, value: hodDepartment}] : [{label: 'Science', value: 'Science'}, {label: 'Arts', value: 'Arts'}, {label: 'General', value: 'General'}]}
                  disabled={isHOD}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Panel: Daily Schedule Builder */}
        <div className="w-full min-w-0 overflow-visible bg-white p-6 md:p-8 rounded-[32px] border border-[#E9E1D5] shadow-sm">
          <h3 className="text-sm font-black text-[#2C2625] uppercase tracking-widest mb-4">3. Daily Schedule</h3>
          
          {/* Days Tabs */}
          <div className="flex flex-wrap gap-2.5 pb-4 shrink-0 overflow-visible">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeDay === day 
                    ? "bg-[#C37A67] text-white shadow-md shadow-[#C37A67]/20"
                    : "bg-white text-[#2C2625]/60 hover:bg-white/60"
                )}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-5 overflow-visible">
            {!builderData.targetClass || !builderData.section ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-[#2C2625]/40" />
                </div>
                <h3 className="text-lg font-black text-[#2C2625] mb-1">Select Target Class</h3>
                <p className="text-xs font-bold text-[#2C2625]/60 max-w-sm">Please select a Target Class and Section from the left panel to start building the schedule.</p>
              </div>
            ) : (
              <>
                {periods.map((p, index) => (
                  <div key={p.id} className={cn(
                    "group flex gap-4 items-start p-4 md:p-5 rounded-[24px] border shadow-sm overflow-visible",
                    p.type === 'break' ? "bg-[#FFF8EC] border-[#F3D8A0]" : "bg-white border-[#E9E1D5]"
                  )}>
                    {/* Shuffle Controls */}
                    <div className="flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1.5 hover:bg-white rounded-lg text-[#2C2625]/60 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveDown(index)} disabled={index === periods.length - 1} className="p-1.5 hover:bg-white rounded-lg text-[#2C2625]/60 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>

                    {/* Row Content */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 items-end min-w-0">
                      <div className="xl:col-span-2 min-w-0">
                        <label className="text-[9px] font-black uppercase text-[#2C2625]/60 mb-2 block">Start Time</label>
                        <ThemedTimePicker value={p.startTime} onChange={(v) => updatePeriod(index, 'startTime', v)} className="h-12 text-sm rounded-2xl border-none shadow-sm" />
                      </div>
                      <div className="xl:col-span-2 min-w-0">
                        <label className="text-[9px] font-black uppercase text-[#2C2625]/60 mb-2 block">End Time</label>
                        <ThemedTimePicker value={p.endTime} onChange={(v) => updatePeriod(index, 'endTime', v)} className="h-12 text-sm rounded-2xl border-none shadow-sm" />
                      </div>

                      {p.type === 'period' || p.type === 'lab' ? (
                        <>
                          <div className="xl:col-span-4 min-w-0">
                            <Select 
                              label={p.type === 'lab' ? "Lab Subject" : "Subject"}
                              value={p.subject}
                              onChange={(v) => updatePeriod(index, 'subject', v)}
                              options={Object.keys(SUBJECT_TEACHER_MAP).map(sub => ({label: sub, value: sub}))}
                              className="h-12 text-sm rounded-2xl border-none shadow-sm"
                            />
                          </div>
                          <div className="xl:col-span-4 min-w-0">
                            <label className="text-[9px] font-black uppercase text-[#2C2625]/60 mb-2 block">Teacher</label>
                            <Input readOnly value={p.teacher} placeholder="Auto-assigned" className="h-12 text-sm rounded-2xl bg-white border-none shadow-sm px-4 font-bold text-[#2C2625]" />
                          </div>
                        </>
                      ) : (
                        <div className="sm:col-span-2 xl:col-span-8 flex items-end">
                          <div className="flex-1 min-w-0">
                            <label className="text-[9px] font-black uppercase text-[#2C2625]/60 mb-2 block">Break Name</label>
                            <Input value={p.breakName} onChange={(e) => updatePeriod(index, 'breakName', e.target.value)} placeholder="Lunch Break, Recess..." className="h-12 text-sm rounded-2xl border-none shadow-sm px-4 font-bold bg-[#E4B76D]/10 text-[#C37A67]" />
                          </div>
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleRemovePeriod(p.id)} className="p-3 text-[#E63946] hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
                  <Button onClick={handleAddPeriod} variant="outline" className="h-12 rounded-2xl border-dashed border-[#88AC88] text-[#88AC88] hover:bg-[#88AC88]/10 text-xs font-black uppercase tracking-widest w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Period
                  </Button>
                  <Button onClick={handleAddLab} variant="outline" className="h-12 rounded-2xl border-dashed border-[#A78BFA] text-[#A78BFA] hover:bg-[#A78BFA]/10 text-xs font-black uppercase tracking-widest w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Lab
                  </Button>
                  <Button onClick={handleAddBreak} variant="outline" className="h-12 rounded-2xl border-dashed border-[#E4B76D] text-[#E4B76D] hover:bg-[#E4B76D]/10 text-xs font-black uppercase tracking-widest w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Break
                  </Button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
