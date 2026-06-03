import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  Filter,
  GraduationCap,
  History,
  LayoutGrid,
  Lock,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Settings2,
  ShieldCheck,
  TrendingUp,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { Textarea } from '../components/ui/Textarea';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/dashboard/DashboardWidgets';

// --- OFFICIAL DESIGN SYSTEM COLORS ---
// const COLORS = {
//   primary: '#C37A67',    // Primary Terracotta
//   foreground: '#2C2625', // Foreground Charcoal
//   background: '#FDFBF7', // Background Oat
//   border: '#E9E1D5',     // Border / Input
//   green: '#88AC88',      // Brand Green
//   orange: '#E4B76D',     // Brand Orange
//   purple: '#A78BFA',     // Brand Purple
//   red: '#E63946',        // Destructive Red
// };

// Removed timeOptions

// --- TYPES ---
type ExamStatus = 'Draft' | 'Scheduled' | 'Ongoing' | 'Completed' | 'Failed/Error';
type PublishStatus = 'Locked' | 'Ready' | 'Pending' | 'Published' | 'Failed';
type ExamType = 'Term' | 'Unit Test' | 'Mid Term' | 'Final' | 'Practical' | 'Board Mock';
type DetailTab = 'Overview' | 'Subjects' | 'Marks Entry' | 'Grading Rules' | 'Results' | 'Report Cards' | 'Analytics' | 'Audit Logs';

interface InternalActivityDefinition {
  id: string;
  label: string;
  shortLabel: string;
  maxMarks: number;
  sourceType: string;
}

interface StudentInternalMarks {
  total: number;
  activities: Record<string, number>;
}

interface StudentExamMarks {
  theory: number;
  practical: number;
  submitted: boolean;
  internal?: StudentInternalMarks;
}

interface SectionAssignment {
  teacher: string;
  practicalTeacher?: string;
  dueDate: string;
  marksSubmitted?: boolean;
  theoryMarksSubmitted?: boolean;
  practicalMarksSubmitted?: boolean;
  studentMarks?: Record<string, StudentExamMarks>;
}

interface TeacherDutyAssignment {
  key: string;
  subjectName: string;
  section: string;
  dueDate: string;
  teacher: string;
  practicalTeacher?: string;
  marksSubmitted?: boolean;
  canEnterTheory: boolean;
  canEnterPractical: boolean;
  subjectObj: SubjectSchedule;
  secData: SectionAssignment;
}

const getSectionFromRoll = (roll: string) => {
  const prefix = roll.split('-')[0] || roll;
  return prefix[prefix.length - 1] || 'A';
};

const buildInternalActivityBlueprint = (subjectName: string, internalMax: number): InternalActivityDefinition[] => {
  if (internalMax <= 0) return [];

  const activitySets: Record<string, Array<{ id: string; label: string; shortLabel: string; sourceType: string }>> = {
    Mathematics: [
      { id: 'homework', label: 'Homework', shortLabel: 'HW', sourceType: 'Homework' },
      { id: 'assignment', label: 'Assignment', shortLabel: 'AS', sourceType: 'Assignment' },
      { id: 'classwork', label: 'Class Activity', shortLabel: 'AC', sourceType: 'Classwork' },
      { id: 'portfolio', label: 'Portfolio', shortLabel: 'PT', sourceType: 'Portfolio' },
    ],
    Physics: [
      { id: 'lab-record', label: 'Lab Record', shortLabel: 'LR', sourceType: 'Assignment' },
      { id: 'numerical', label: 'Numerical Sheet', shortLabel: 'NS', sourceType: 'Homework' },
      { id: 'viva', label: 'Viva Activity', shortLabel: 'VA', sourceType: 'Classwork' },
      { id: 'project', label: 'Project File', shortLabel: 'PF', sourceType: 'Portfolio' },
    ],
    Chemistry: [
      { id: 'lab-record', label: 'Lab Record', shortLabel: 'LR', sourceType: 'Assignment' },
      { id: 'worksheet', label: 'Worksheet', shortLabel: 'WS', sourceType: 'Homework' },
      { id: 'viva', label: 'Viva Activity', shortLabel: 'VA', sourceType: 'Classwork' },
      { id: 'portfolio', label: 'Portfolio', shortLabel: 'PT', sourceType: 'Portfolio' },
    ],
    Biology: [
      { id: 'observation', label: 'Observation Book', shortLabel: 'OB', sourceType: 'Assignment' },
      { id: 'diagram', label: 'Diagram Work', shortLabel: 'DW', sourceType: 'Homework' },
      { id: 'viva', label: 'Viva Activity', shortLabel: 'VA', sourceType: 'Classwork' },
      { id: 'project', label: 'Project File', shortLabel: 'PF', sourceType: 'Portfolio' },
    ],
  };

  const selectedSet = activitySets[subjectName] || activitySets.Mathematics;
  const base = Math.floor(internalMax / selectedSet.length);
  let remainder = internalMax % selectedSet.length;

  return selectedSet
    .map((activity) => {
      const maxMarks = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      return {
        ...activity,
        maxMarks,
      };
    })
    .filter((activity) => activity.maxMarks > 0);
};

const buildSeededInternalMarks = (
  studentRoll: string,
  subjectName: string,
  internalMax: number,
  overallRatio: number
): StudentInternalMarks | undefined => {
  const activities = buildInternalActivityBlueprint(subjectName, internalMax);
  if (activities.length === 0) return undefined;

  const activitiesMap: Record<string, number> = {};
  let total = 0;
  const safeRatio = Math.max(0.35, Math.min(1, overallRatio));

  activities.forEach((activity, idx) => {
    const seed = `${studentRoll}-${subjectName}-${activity.id}`;
    const variance =
      (seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 7) / 100 - 0.03 + idx * 0.005;
    const mark = Math.max(0, Math.min(activity.maxMarks, Math.round(activity.maxMarks * Math.min(1, safeRatio + variance))));
    activitiesMap[activity.id] = mark;
    total += mark;
  });

  return {
    total: Math.min(internalMax, total),
    activities: activitiesMap,
  };
};

const getSectionTheorySubmitted = (subject: SubjectSchedule | undefined, sectionData: SectionAssignment | undefined) => {
  if (!subject || subject.hasTheory === false) return true;
  if (typeof sectionData?.theoryMarksSubmitted === 'boolean') return sectionData.theoryMarksSubmitted;
  return !!sectionData?.marksSubmitted;
};

const getSectionPracticalSubmitted = (subject: SubjectSchedule | undefined, sectionData: SectionAssignment | undefined) => {
  if (!subject?.hasPractical) return true;
  if (typeof sectionData?.practicalMarksSubmitted === 'boolean') return sectionData.practicalMarksSubmitted;
  return !!sectionData?.marksSubmitted;
};

interface SubjectSchedule {
  name: string;
  teacher: string;
  total: number;
  passing: number;
  entered: number;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  practicalDate?: string;
  practicalStartTime?: string;
  practicalEndTime?: string;
  evaluatorId?: string;
  marksDueDate?: string;
  marksSubmitted?: boolean;
  studentMarks?: Record<string, StudentExamMarks>;
  sectionAssignments?: Record<string, SectionAssignment>;
  hasTheory?: boolean;
  theoryMax?: number;
  hasPractical?: boolean;
  practicalMax?: number;
  hasInternals?: boolean;
  internalMax?: number;
  internalActivities?: InternalActivityDefinition[];
}

interface ExamRecord {
  id: string;
  name: string;
  className: string;
  section: string;
  type: ExamType;
  startDate: string;
  endDate: string;
  status: ExamStatus;
  publishStatus: PublishStatus;
  subject: string;
  duration: string;
  startTime: string;
  endTime: string;
  assignedClasses: string[];
  createdBy: string;
  publishDate: string;
  completionProgress: number;
  subjectsList?: SubjectSchedule[];
  department?: string;
}

const ThemedDatePicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
}> = ({ value, onChange, className, align = 'center' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;

    const handlePositioning = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popoverWidth = 280;

      let top = rect.bottom + 8;
      let left = rect.left;

      if (align === 'right') {
        left = rect.right - popoverWidth;
      } else if (align === 'center') {
        left = rect.left + rect.width / 2 - popoverWidth / 2;
      }

      // Safety viewport boundaries
      if (left < 12) {
        left = 12;
      } else if (left + popoverWidth > viewportWidth - 12) {
        left = viewportWidth - 12 - popoverWidth;
      }

      // Flip up if it overflows the bottom
      const popoverHeight = 320;
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
  }, [isOpen, align]);

  const dateObj = useMemo(() => {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [currentYear, setCurrentYear] = useState(dateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(dateObj.getMonth());

  useEffect(() => {
    setCurrentYear(dateObj.getFullYear());
    setCurrentMonth(dateObj.getMonth());
  }, [dateObj]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const selectedDateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
    onChange(selectedDateStr);
    setIsOpen(false);
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

  const totalDays = daysInMonth(currentYear, currentMonth);
  const startOffset = startDayOfWeek(currentYear, currentMonth);

  const daysGrid: Array<number | null> = [];
  for (let i = 0; i < startOffset; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push(d);
  }

  const displayValue = useMemo(() => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
  }, [value]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        type="text"
        readOnly
        value={displayValue}
        onClick={() => setIsOpen(!isOpen)}
        className={cn("cursor-pointer text-center select-none bg-white", className)}
        placeholder="mm/dd/yyyy"
      />

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={portalStyle}
          className="bg-[#FDFBF7] border border-[#E9E1D5] rounded-[32px] shadow-2xl p-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-xl bg-[#2C2625]/5 hover:bg-[#C37A67]/10 hover:text-[#C37A67] text-[#2C2625]"
            >
              <span className="font-bold text-sm">‹</span>
            </Button>
            <span className="text-xs font-black text-[#2C2625] uppercase tracking-wider">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-xl bg-[#2C2625]/5 hover:bg-[#C37A67]/10 hover:text-[#C37A67] text-[#2C2625]"
            >
              <span className="font-bold text-sm">›</span>
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(w => (
              <span key={w} className="text-[9px] font-black uppercase text-[#2C2625]/45 tracking-widest">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-7 w-7" />;
              }

              const isSelected =
                dateObj.getDate() === day &&
                dateObj.getMonth() === currentMonth &&
                dateObj.getFullYear() === currentYear;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-7 w-7 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center",
                    isSelected
                      ? "bg-[#C37A67] text-white shadow-md shadow-[#C37A67]/20 scale-110"
                      : "text-[#2C2625] hover:bg-[#C37A67]/10 hover:text-[#C37A67]"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const ThemedTimePicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
  shift?: number;
}> = ({ value, onChange, className, align = 'center', shift = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
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

      if (align === 'right') {
        // Shift it 40px to the right to keep it perfectly inside the white modal container
        left = rect.right - popoverWidth + 40;
      } else if (align === 'center') {
        left = rect.left + rect.width / 2 - popoverWidth / 2;
      }

      left += shift;

      // Safety viewport boundaries
      if (left < 12) {
        left = 12;
      } else if (left + popoverWidth > viewportWidth - 12) {
        left = viewportWidth - 12 - popoverWidth;
      }

      // Flip up if it overflows the bottom
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
  }, [isOpen, align]);

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

    const time24Str = `${h.toString().padStart(2, '0')}:${minute}`;
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
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1.5 scrollbar-thin scrollbar-thumb-[#C37A67]/10 pr-1">
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

            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1.5 scrollbar-thin scrollbar-thumb-[#C37A67]/10 pr-1 border-x border-[#E9E1D5]/40 px-1">
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

            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1.5 scrollbar-thin scrollbar-thumb-[#C37A67]/10 pr-1">
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

interface CreateExamFormState {
  title: string;
  examCode: string;
  departments: string[];
  targetClass: string;
  academicSession: string;
  sections: string[];
  subjects: string[];
  startDate: string;
  endDate: string;
  duration: string;
  startTime: string;
  endTime: string;
  resultPublishDate: string;
  baseMarks: string;
  passingPercentage: string;
  gradingRule: string;
  instructions: string;
  subjectSchedules?: Record<string, {
    date: string;
    startTime: string;
    endTime: string;
    practicalDate?: string;
    practicalStartTime?: string;
    practicalEndTime?: string;
  }>;
  subjectConfigs?: Record<string, {
    hasTheory: boolean;
    theoryMax: number;
    hasPractical: boolean;
    practicalMax: number;
    hasInternals: boolean;
    internalMax: number;
  }>;
}

// --- MOCK DATA ---
const examRecords: ExamRecord[] = [
  {
    id: 'EX-2026-001',
    name: 'Final Term Examination 2026',
    className: 'Class 10',
    section: 'A',
    type: 'Final',
    startDate: '2026-05-15',
    endDate: '2026-05-30',
    status: 'Ongoing',
    publishStatus: 'Pending',
    subject: 'All Subjects',
    duration: '15 Days',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    assignedClasses: ['10-A', '10-B', '10-C'],
    createdBy: 'Exam Controller',
    publishDate: '2026-06-10',
    completionProgress: 45,
    subjectsList: [
      {
        name: 'Mathematics',
        teacher: 'David Miller',
        total: 100,
        passing: 35,
        entered: 0,
        status: 'Scheduled',
        date: '2026-05-15',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 100,
        hasPractical: false,
        practicalMax: 0,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: {
            teacher: 'David Miller',
            dueDate: '2026-05-22',
            marksSubmitted: false,
            studentMarks: {
              '10A-001': { theory: 62, practical: 0, submitted: true },
              '10A-002': { theory: 68, practical: 0, submitted: true },
              '10A-003': { theory: 24, practical: 0, submitted: true },
              '10A-004': { theory: 78, practical: 0, submitted: true },
              '10A-005': { theory: 56, practical: 0, submitted: true },
            }
          },
          B: { teacher: 'Prof. Charles Xavier', dueDate: '2026-05-23' },
          C: { teacher: 'Dr. Stephen Strange', dueDate: '2026-05-24' }
        }
      },
      {
        name: 'Physics',
        teacher: 'Dr. Diana Prince',
        total: 150,
        passing: 50,
        entered: 0,
        status: 'Scheduled',
        date: '2026-05-17',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 100,
        hasPractical: true,
        practicalMax: 50,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: { teacher: 'Dr. Diana Prince', dueDate: '2026-05-24' },
          B: { teacher: 'Prof. Albert Einstein', dueDate: '2026-05-25' },
          C: { teacher: 'Dr. Reed Richards', dueDate: '2026-05-26' }
        }
      },
      {
        name: 'Chemistry',
        teacher: 'Prof. Barry Allen',
        total: 150,
        passing: 50,
        entered: 0,
        status: 'Scheduled',
        date: '2026-05-18',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 100,
        hasPractical: true,
        practicalMax: 50,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: { teacher: 'Prof. Barry Allen', dueDate: '2026-05-25' },
          B: { teacher: 'Dr. Walter White', dueDate: '2026-05-26' },
          C: { teacher: 'Prof. Severus Snape', dueDate: '2026-05-27' }
        }
      },
      {
        name: 'Biology',
        teacher: 'Dr. Arthur Curry',
        total: 150,
        passing: 50,
        entered: 0,
        status: 'Scheduled',
        date: '2026-05-20',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 100,
        hasPractical: true,
        practicalMax: 50,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: { teacher: 'Dr. Arthur Curry', dueDate: '2026-05-27' },
          B: { teacher: 'Dr. Pamela Isley', dueDate: '2026-05-28' },
          C: { teacher: 'Prof. Bruce Banner', dueDate: '2026-05-29' }
        }
      }
    ],
  },
  {
    id: 'EX-2026-002',
    name: 'Mid-Term Assessment Q2',
    className: 'Class 12',
    section: 'B',
    type: 'Mid Term',
    startDate: '2026-04-10',
    endDate: '2026-04-20',
    status: 'Completed',
    publishStatus: 'Published',
    subject: 'Science Stream',
    duration: '10 Days',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    assignedClasses: ['12-A', '12-B'],
    createdBy: 'Academic Coordinator',
    publishDate: '2026-04-25',
    completionProgress: 100,
    subjectsList: [
      {
        name: 'Mathematics',
        teacher: 'Dr. Bruce Wayne',
        total: 80,
        passing: 28,
        entered: 100,
        status: 'Completed',
        date: '2026-04-10',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 80,
        hasPractical: false,
        practicalMax: 0,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: { teacher: 'Dr. Bruce Wayne', dueDate: '2026-04-17', marksSubmitted: true },
          B: { teacher: 'Prof. Charles Xavier', dueDate: '2026-04-17', marksSubmitted: true }
        }
      },
      {
        name: 'Physics',
        teacher: 'Dr. Diana Prince',
        total: 100,
        passing: 35,
        entered: 100,
        status: 'Completed',
        date: '2026-04-12',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 70,
        hasPractical: true,
        practicalMax: 30,
        practicalDate: '2026-04-13',
        practicalStartTime: '02:00 PM',
        practicalEndTime: '04:00 PM',
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: { teacher: 'Dr. Diana Prince', dueDate: '2026-04-19', marksSubmitted: true },
          B: { teacher: 'Prof. Albert Einstein', dueDate: '2026-04-19', marksSubmitted: true }
        }
      },
      {
        name: 'Chemistry',
        teacher: 'Prof. Barry Allen',
        total: 100,
        passing: 35,
        entered: 100,
        status: 'Completed',
        date: '2026-04-15',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 70,
        hasPractical: true,
        practicalMax: 30,
        practicalDate: '2026-04-16',
        practicalStartTime: '10:00 AM',
        practicalEndTime: '12:00 PM',
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: { teacher: 'Prof. Barry Allen', dueDate: '2026-04-22', marksSubmitted: true },
          B: { teacher: 'Dr. Walter White', dueDate: '2026-04-22', marksSubmitted: true }
        }
      }
    ]
  },
  {
    id: 'EX-2026-003',
    name: 'Mathematics Unit Test 3',
    className: 'Class 8',
    section: 'C',
    type: 'Unit Test',
    startDate: '2026-06-05',
    endDate: '2026-06-05',
    status: 'Scheduled',
    publishStatus: 'Locked',
    subject: 'Mathematics',
    duration: '90 Mins',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    assignedClasses: ['8-C'],
    createdBy: 'Math HOD',
    publishDate: '2026-06-12',
    completionProgress: 0,
    subjectsList: [
      {
        name: 'Mathematics',
        teacher: 'Dr. Bruce Wayne',
        total: 40,
        passing: 14,
        entered: 0,
        status: 'Pending',
        date: '2026-06-05',
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        hasTheory: true,
        theoryMax: 40,
        hasPractical: false,
        practicalMax: 0,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          C: { teacher: 'Dr. Bruce Wayne', dueDate: '2026-06-12', marksSubmitted: false }
        }
      }
    ]
  },
  {
    id: 'EX-2026-004',
    name: 'Biology Practical Finals',
    className: 'Class 11',
    section: 'A',
    type: 'Practical',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    status: 'Draft',
    publishStatus: 'Pending',
    subject: 'Biology',
    duration: '3 Days',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    assignedClasses: ['11-A', '11-B'],
    createdBy: 'Science Faculty',
    publishDate: '2026-06-01',
    completionProgress: 15,
    subjectsList: [
      {
        name: 'Biology',
        teacher: 'Dr. Arthur Curry',
        total: 80,
        passing: 28,
        entered: 0,
        status: 'Draft',
        date: '2026-05-20',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: false,
        theoryMax: 0,
        hasPractical: true,
        practicalMax: 80,
        practicalDate: '2026-05-20',
        practicalStartTime: '09:00 AM',
        practicalEndTime: '12:00 PM',
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: { teacher: 'Dr. Arthur Curry', dueDate: '2026-05-27', marksSubmitted: false },
          B: { teacher: 'Dr. Pamela Isley', dueDate: '2026-05-27', marksSubmitted: false }
        }
      }
    ]
  },
  {
    id: 'EX-2026-005',
    name: 'Quarterly Assessment Q1',
    className: 'Class 10',
    section: 'A',
    type: 'Mid Term',
    startDate: '2025-10-10',
    endDate: '2025-10-15',
    status: 'Completed',
    publishStatus: 'Published',
    subject: 'All Subjects',
    duration: '5 Days',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    assignedClasses: ['10-A', '10-B'],
    createdBy: 'Academic Coordinator',
    publishDate: '2025-10-25',
    completionProgress: 100,
    subjectsList: [
      {
        name: 'Mathematics',
        teacher: 'David Miller',
        total: 100,
        passing: 35,
        entered: 100,
        status: 'Completed',
        date: '2025-10-10',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 100,
        hasPractical: false,
        practicalMax: 0,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: {
            teacher: 'David Miller',
            dueDate: '2025-10-17',
            marksSubmitted: true,
            studentMarks: {
              '10A-001': { theory: 75, practical: 0, submitted: true },
              '10A-002': { theory: 88, practical: 0, submitted: true },
              '10A-003': { theory: 28, practical: 0, submitted: true },
              '10A-004': { theory: 92, practical: 0, submitted: true },
              '10A-005': { theory: 64, practical: 0, submitted: true },
              '10A-006': { theory: 81, practical: 0, submitted: true }
            }
          }
        }
      },
      {
        name: 'Physics',
        teacher: 'Dr. Diana Prince',
        total: 100,
        passing: 35,
        entered: 100,
        status: 'Completed',
        date: '2025-10-11',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 70,
        hasPractical: true,
        practicalMax: 30,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: {
            teacher: 'Dr. Diana Prince',
            dueDate: '2025-10-18',
            marksSubmitted: true,
            studentMarks: {
              '10A-001': { theory: 55, practical: 20, submitted: true },
              '10A-002': { theory: 62, practical: 25, submitted: true },
              '10A-003': { theory: 20, practical: 10, submitted: true },
              '10A-004': { theory: 68, practical: 29, submitted: true },
              '10A-005': { theory: 45, practical: 18, submitted: true },
              '10A-006': { theory: 58, practical: 26, submitted: true }
            }
          }
        }
      },
      {
        name: 'Chemistry',
        teacher: 'Prof. Barry Allen',
        total: 100,
        passing: 35,
        entered: 100,
        status: 'Completed',
        date: '2025-10-12',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 70,
        hasPractical: true,
        practicalMax: 30,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: {
            teacher: 'Prof. Barry Allen',
            dueDate: '2025-10-19',
            marksSubmitted: true,
            studentMarks: {
              '10A-001': { theory: 50, practical: 22, submitted: true },
              '10A-002': { theory: 58, practical: 24, submitted: true },
              '10A-003': { theory: 18, practical: 12, submitted: true },
              '10A-004': { theory: 65, practical: 27, submitted: true },
              '10A-005': { theory: 40, practical: 20, submitted: true },
              '10A-006': { theory: 55, practical: 25, submitted: true }
            }
          }
        }
      },
      {
        name: 'Biology',
        teacher: 'Dr. Arthur Curry',
        total: 100,
        passing: 35,
        entered: 100,
        status: 'Completed',
        date: '2025-10-13',
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        hasTheory: true,
        theoryMax: 70,
        hasPractical: true,
        practicalMax: 30,
        hasInternals: false,
        internalMax: 0,
        sectionAssignments: {
          A: {
            teacher: 'Dr. Arthur Curry',
            dueDate: '2025-10-20',
            marksSubmitted: true,
            studentMarks: {
              '10A-001': { theory: 52, practical: 21, submitted: true },
              '10A-002': { theory: 60, practical: 26, submitted: true },
              '10A-003': { theory: 22, practical: 11, submitted: true },
              '10A-004': { theory: 66, practical: 28, submitted: true },
              '10A-005': { theory: 42, practical: 19, submitted: true },
              '10A-006': { theory: 57, practical: 24, submitted: true }
            }
          }
        }
      }
    ]
  },
];

// Removed unused summaryCardsData, performanceTrendData, passFailData, subjectAverages

const studentsPerformance = [
  // Section A
  { name: 'Jason Todd', roll: '10A-001', marks: 88, grade: 'A', status: 'Passed' },
  { name: 'Tim Drake', roll: '10A-002', marks: 94, grade: 'A+', status: 'Passed' },
  { name: 'Damian Wayne', roll: '10A-003', marks: 32, grade: 'F', status: 'Failed' },
  { name: 'Cass Cain', roll: '10A-004', marks: 99, grade: 'A+', status: 'Passed' },
  { name: 'Steph Brown', roll: '10A-005', marks: 76, grade: 'B', status: 'Passed' },
  { name: 'Emily Davis', roll: '10A-006', marks: 85, grade: 'A', status: 'Passed' },
  // Section B
  { name: 'Clark Kent', roll: '10B-001', marks: 85, grade: 'A', status: 'Passed' },
  { name: 'Lois Lane', roll: '10B-002', marks: 92, grade: 'A+', status: 'Passed' },
  { name: 'Lex Luthor', roll: '10B-003', marks: 44, grade: 'D', status: 'Passed' },
  { name: 'Kara Zor-El', roll: '10B-004', marks: 98, grade: 'A+', status: 'Passed' },
  { name: 'Jimmy Olsen', roll: '10B-005', marks: 68, grade: 'C', status: 'Passed' },
  // Section C
  { name: 'Peter Parker', roll: '10C-001', marks: 90, grade: 'A', status: 'Passed' },
  { name: 'Mary Jane', roll: '10C-002', marks: 83, grade: 'B', status: 'Passed' },
  { name: 'Gwen Stacy', roll: '10C-003', marks: 95, grade: 'A+', status: 'Passed' },
  { name: 'Harry Osborn', roll: '10C-004', marks: 55, grade: 'C', status: 'Passed' },
  { name: 'Miles Morales', roll: '10C-005', marks: 89, grade: 'A', status: 'Passed' },
];

const subjectCards: SubjectSchedule[] = [
  {
    name: 'Mathematics',
    teacher: 'Dr. Bruce Wayne',
    total: 80,
    passing: 28,
    entered: 100,
    status: 'Completed',
    date: '2026-05-18',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hasTheory: true,
    theoryMax: 80,
    hasPractical: false,
    practicalMax: 0,
    hasInternals: false,
    internalMax: 0
  },
  {
    name: 'Physics',
    teacher: 'Dr. Diana Prince',
    total: 100,
    passing: 35,
    entered: 85,
    status: 'In Progress',
    date: '2026-05-20',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hasTheory: true,
    theoryMax: 70,
    hasPractical: true,
    practicalMax: 30,
    practicalDate: '2026-05-21',
    practicalStartTime: '02:00 PM',
    practicalEndTime: '04:00 PM',
    hasInternals: false,
    internalMax: 0
  },
  {
    name: 'Chemistry',
    teacher: 'Prof. Barry Allen',
    total: 100,
    passing: 35,
    entered: 40,
    status: 'Draft',
    date: '2026-05-20',
    startTime: '01:30 PM',
    endTime: '04:30 PM',
    hasTheory: true,
    theoryMax: 70,
    hasPractical: true,
    practicalMax: 30,
    practicalDate: '2026-05-21',
    practicalStartTime: '10:00 AM',
    practicalEndTime: '12:00 PM',
    hasInternals: false,
    internalMax: 0
  },
  {
    name: 'Biology',
    teacher: 'Dr. Arthur Curry',
    total: 50,
    passing: 18,
    entered: 0,
    status: 'Pending',
    date: '2026-05-22',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    hasTheory: true,
    theoryMax: 35,
    hasPractical: true,
    practicalMax: 15,
    practicalDate: '2026-05-23',
    practicalStartTime: '09:00 AM',
    practicalEndTime: '11:00 AM',
    hasInternals: false,
    internalMax: 0
  },
];

const auditLogsData = [
  { action: 'Marks Updated', user: 'Dr. Bruce Wayne', detail: 'Math marks for Class 10A updated', time: '2 mins ago', icon: Edit3 },
  { action: 'Result Published', user: 'Exam Controller', detail: 'Mid-term results for Class 12B published', time: '1 hour ago', icon: ShieldCheck },
  { action: 'Exam Created', user: 'Academic Coordinator', detail: 'New final term exam setup completed', time: '4 hours ago', icon: Plus },
  { action: 'Grade Rules Modified', user: 'Principal Office', detail: 'GPA scale for Grade 11 adjusted', time: 'Yesterday', icon: Settings2 },
  { action: 'Report Card Exported', user: 'Class Teacher', detail: 'PDF batch for 10C generated', time: 'Yesterday', icon: Download },
];

const gradingRules = [
  { grade: 'A+', range: '90 - 100', gpa: '4.0', description: 'Exceptional performance' },
  { grade: 'A', range: '80 - 89', gpa: '3.7', description: 'Excellent performance' },
  { grade: 'B+', range: '75 - 79', gpa: '3.3', description: 'Very good performance' },
  { grade: 'B', range: '70 - 74', gpa: '3.0', description: 'Good performance' },
  { grade: 'C', range: '60 - 69', gpa: '2.5', description: 'Satisfactory' },
  { grade: 'D', range: '35 - 59', gpa: '1.5', description: 'Needs Improvement' },
  { grade: 'F', range: '0 - 34', gpa: '0.0', description: 'Fail' },
];

const academicSessionOptions = [
  { label: '2024-25', value: '2024-25' },
  { label: '2025-26', value: '2025-26' },
  { label: '2026-27', value: '2026-27' },
];

// Removed unused assessmentTypeOptions

const targetClassOptions = [
  { label: 'Class 10', value: '10' },
  { label: 'Class 11', value: '11' },
  { label: 'Class 12', value: '12' },
];

const sectionOptions = [
  { label: 'Section A', value: 'A' },
  { label: 'Section B', value: 'B' },
  { label: 'Section C', value: 'C' },
];

const departmentOptions = [
  { label: 'General', value: 'General' },
  { label: 'Science', value: 'Science' },
  { label: 'Commerce', value: 'Commerce' },
  { label: 'Arts', value: 'Arts' },
  { label: 'Vocational', value: 'Vocational' },
];

const subjectOptions = [
  { label: 'Mathematics', value: 'math' },
  { label: 'Physics', value: 'physics' },
  { label: 'Chemistry', value: 'chemistry' },
  { label: 'Biology', value: 'biology' },
];

const gradingRuleOptions = [
  { label: 'Default School GPA Scale', value: 'default-gpa' },
  { label: 'Senior Secondary Weighted GPA', value: 'weighted-gpa' },
  { label: 'Practical Assessment Rubric', value: 'practical-rubric' },
];

const defaultCreateExamFormState: CreateExamFormState = {
  title: '',
  examCode: '',
  targetClass: '10',
  academicSession: '2025-26',
  departments: [],
  sections: [],
  subjects: [],
  startDate: '',
  endDate: '',
  duration: '',
  startTime: '09:00',
  endTime: '12:00',
  resultPublishDate: '',
  baseMarks: '100',
  passingPercentage: '35',
  gradingRule: 'default-gpa',
  instructions: '',
  subjectSchedules: {},
  subjectConfigs: {},
};

// --- STYLES ---
// Removed unused statusStyles and subjectTeachersMap

const allClassroomTeachers = [
  { name: 'Dr. Bruce Wayne', dept: 'Mathematics' },
  { name: 'Prof. Charles Xavier', dept: 'Mathematics' },
  { name: 'Dr. Stephen Strange', dept: 'Mathematics' },
  { name: 'Prof. Albus Dumbledore', dept: 'Mathematics' },
  { name: 'Dr. Diana Prince', dept: 'Physics' },
  { name: 'Prof. Albert Einstein', dept: 'Physics' },
  { name: 'Dr. Reed Richards', dept: 'Physics' },
  { name: 'Prof. Magneto', dept: 'Physics' },
  { name: 'Prof. Barry Allen', dept: 'Chemistry' },
  { name: 'Dr. Walter White', dept: 'Chemistry' },
  { name: 'Prof. Severus Snape', dept: 'Chemistry' },
  { name: 'Dr. Otto Octavius', dept: 'Chemistry' },
  { name: 'Dr. Arthur Curry', dept: 'Biology' },
  { name: 'Dr. Pamela Isley', dept: 'Biology' },
  { name: 'Prof. Bruce Banner', dept: 'Biology' },
  { name: 'Dr. Curt Connors', dept: 'Biology' },
  { name: 'Prof. Jean Grey', dept: 'English' },
  { name: 'Dr. Henry McCoy', dept: 'English' },
  { name: 'Prof. Minerva McGonagall', dept: 'English' },
  { name: 'Prof. Indiana Jones', dept: 'History' },
  { name: 'Dr. Robert Langdon', dept: 'History' },
  { name: 'Prof. Remus Lupin', dept: 'History' },
];

const getSubjectStatus = (dateStr: string, startTimeStr: string, endTimeStr: string, customStatus?: string) => {
  if (customStatus === 'Completed' || customStatus === 'Marks Entered') {
    return 'Completed';
  }
  if (!dateStr) return 'Scheduled';

  const parseTo24h = (time12h: string) => {
    if (!time12h) return '09:00';
    if (!time12h.includes('AM') && !time12h.includes('PM')) {
      return time12h;
    }
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const start24 = parseTo24h(startTimeStr);
  const end24 = parseTo24h(endTimeStr);

  const now = new Date();

  const [year, month, day] = dateStr.split('-').map(Number);
  const [startH, startM] = start24.split(':').map(Number);
  const [endH, endM] = end24.split(':').map(Number);

  const startDateTime = new Date(year, month - 1, day, startH, startM);
  const endDateTime = new Date(year, month - 1, day, endH, endM);

  if (now < startDateTime) {
    return 'Scheduled';
  } else if (now >= startDateTime && now <= endDateTime) {
    return 'Ongoing';
  } else {
    return 'Conducted';
  }
};

// --- COMPONENTS ---



const ExamRegistryCard = ({
  exam,
  variant,
  onOpen,
}: {
  exam: ExamRecord;
  variant: 'active' | 'published';
  onOpen: (exam: ExamRecord) => void;
}) => {
  const isOngoing = exam.status === 'Ongoing';
  const accentClass = variant === 'published' ? 'text-[#88AC88]' : isOngoing ? 'text-[#A78BFA]' : 'text-[#E4B76D]';
  const dotClass = variant === 'published' ? 'bg-[#88AC88]' : isOngoing ? 'bg-[#A78BFA]' : 'bg-[#E4B76D]';

  return (
    <button
      type="button"
      onClick={() => onOpen(exam)}
      className="group w-full rounded-[28px] border border-[#E9E1D5]/70 bg-white p-4 text-left shadow-lg shadow-[#2C2625]/5 transition-all active:scale-[0.985]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-sm font-black leading-tight text-[#2C2625] transition-colors group-hover:text-[#C37A67]">
            {exam.name}
          </span>
          <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.18em] text-[#2C2625]/35">
            ID: {exam.id} - {exam.subject}
          </span>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#FDFBF7] text-[#C37A67] ring-1 ring-[#E9E1D5]/70 transition-transform group-hover:translate-x-0.5">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-[#2C2625]/5 px-3 py-2.5">
          <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">Class</span>
          <span className="mt-0.5 block text-[11px] font-black text-[#2C2625]">{exam.className} - {exam.section}</span>
        </div>
        <div className="rounded-2xl bg-[#FDFBF7] px-3 py-2.5 ring-1 ring-[#E9E1D5]/60">
          <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">
            {variant === 'published' ? 'Completed' : 'Duration'}
          </span>
          <span className="mt-0.5 block text-[11px] font-black text-[#2C2625]">
            {variant === 'published' ? exam.endDate : `${exam.startDate} to ${exam.endDate}`}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#E9E1D5]/45 pt-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", dotClass, variant === 'active' && "animate-pulse")} />
          <span className={cn("text-[10px] font-black uppercase tracking-widest", accentClass)}>
            {variant === 'published' ? exam.publishStatus : exam.status}
          </span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#2C2625]/30">Tap to open</span>
      </div>
    </button>
  );
};

const ExamsResultsPage: React.FC = () => {
  const { activeRole, user } = useAuth();
  const [records, setRecords] = useState<ExamRecord[]>(examRecords);
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishOptions, setPublishOptions] = useState({
    smsNotify: true,
    emailNotify: true,
    pdfGenerate: true,
    publishDate: new Date().toISOString().split('T')[0],
  });
  const [activeTab, setActiveTab] = useState<DetailTab>('Overview');
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'registry' | 'detail'>('registry');
  const [createExamForm, setCreateExamForm] = useState<CreateExamFormState>(defaultCreateExamFormState);

  const [assigningSubject, setAssigningSubject] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState<{
    teacher: string;
    dueDate: string;
    sections?: Record<string, { teacher: string; practicalTeacher?: string; dueDate: string }>;
  }>({ teacher: '', dueDate: '', sections: {} });
  const [activeMarksSubject, setActiveMarksSubject] = useState<string>('');
  const [activeMarksSection, setActiveMarksSection] = useState<string>('');
  const [marksForm, setMarksForm] = useState<Record<string, { theory: string; practical: string }>>({});
  const [openDropdownSection, setOpenDropdownSection] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [activeConfigIndex, setActiveConfigIndex] = useState<number>(0);
  const [marksViewMode, setMarksViewMode] = useState<'admin' | 'teacher'>(activeRole === 'TEACHER' ? 'teacher' : 'admin');
  const [activeTeacherPortal, setActiveTeacherPortal] = useState<string>(user?.name || 'David Miller');
  const [activeTeacherDutyKey, setActiveTeacherDutyKey] = useState<string>('');
  const [selectedResultSection, setSelectedResultSection] = useState<string>('A');
  const [selectedResultStudentRoll, setSelectedResultStudentRoll] = useState<string | null>(null);
  const [selectedReportStudentRolls, setSelectedReportStudentRolls] = useState<string[]>([]);
  // const [selectedStudentExamId, setSelectedStudentExamId] = useState<string | null>('EX-2026-005');
  const [bulkProcessingState, setBulkProcessingState] = useState<{
    isOpen: boolean;
    progress: number;
    type: 'Download' | 'Print';
    studentCount: number;
  }>({ isOpen: false, progress: 0, type: 'Download', studentCount: 0 });

  const handleBulkDownloadPDFs = (students: any[]) => {
    const targets = selectedReportStudentRolls.length > 0
      ? students.filter(s => selectedReportStudentRolls.includes(s.roll))
      : students;
    if (targets.length === 0) return;

    setBulkProcessingState({
      isOpen: true,
      progress: 0,
      type: 'Download',
      studentCount: targets.length
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setBulkProcessingState(prev => ({ ...prev, progress: currentProgress }));
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setBulkProcessingState(prev => ({ ...prev, isOpen: false }));
        }, 800);
      }
    }, 150);
  };

  const handleBulkPrintPDFs = (students: any[]) => {
    const targets = selectedReportStudentRolls.length > 0
      ? students.filter(s => selectedReportStudentRolls.includes(s.roll))
      : students;
    if (targets.length === 0) return;

    setBulkProcessingState({
      isOpen: true,
      progress: 0,
      type: 'Print',
      studentCount: targets.length
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setBulkProcessingState(prev => ({ ...prev, progress: currentProgress }));
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setBulkProcessingState(prev => ({ ...prev, isOpen: false }));
          window.print();
        }, 800);
      }
    }, 150);
  };

  const handlePrintIndividualReportCard = (_student: any) => {
    setBulkProcessingState({
      isOpen: true,
      progress: 0,
      type: 'Print',
      studentCount: 1
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setBulkProcessingState(prev => ({ ...prev, progress: currentProgress }));
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setBulkProcessingState(prev => ({ ...prev, isOpen: false }));
          window.print();
        }, 800);
      }
    }, 100);
  };

  const handleDownloadIndividualReportCard = (_student: any) => {
    setBulkProcessingState({
      isOpen: true,
      progress: 0,
      type: 'Download',
      studentCount: 1
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setBulkProcessingState(prev => ({ ...prev, progress: currentProgress }));
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setBulkProcessingState(prev => ({ ...prev, isOpen: false }));
        }, 800);
      }
    }, 100);
  };

  useEffect(() => {
    setMarksViewMode(activeRole === 'TEACHER' ? 'teacher' : 'admin');
    setActiveTeacherPortal(user?.name || 'David Miller');
  }, [activeRole, user]);

  useEffect(() => {
    setSelectedResultStudentRoll(null);
    if (selectedExam?.assignedClasses && selectedExam.assignedClasses.length > 0) {
      const firstSec = selectedExam.assignedClasses[0].split('-')[1] || selectedExam.assignedClasses[0];
      setSelectedResultSection(firstSec);
    } else {
      setSelectedResultSection('A');
    }
  }, [selectedExam]);

  const [selectedSectionLockDetail, setSelectedSectionLockDetail] = useState<{
    subjectName: string;
    section: string;
  } | null>(null);

  const sectionDetail = useMemo(() => {
    if (!selectedSectionLockDetail || !selectedExam) return null;
    const { subjectName, section } = selectedSectionLockDetail;
    const subj = selectedExam.subjectsList?.find(s => s.name === subjectName);
    const secData = subj?.sectionAssignments?.[section];

    // Calculate total marks for this subject
    const hasTheory = subj?.hasTheory !== false;
    const theoryMax = subj?.theoryMax ?? 100;
    const hasPractical = !!subj?.hasPractical;
    const practicalMax = subj?.practicalMax ?? 0;
    const totalMax = (hasTheory ? theoryMax : 0) + (hasPractical ? practicalMax : 0);

    // Filter students in this section
    const sectionStudents = studentsPerformance.filter(student => {
      return getSectionFromRoll(student.roll) === section;
    });

    const studentMarksList = sectionStudents.map(student => {
      // 1. Check if we have exact studentMarks in the sectionAssignment
      const existingMark = secData?.studentMarks?.[student.roll];

      // 2. If not, generate realistic seeded marks based on the student's overall performance percentage
      let theoryObtained = 0;
      let practicalObtained = 0;

      if (existingMark) {
        theoryObtained = Number(existingMark.theory);
        practicalObtained = Number(existingMark.practical);
      } else {
        // Seeded fallback: use student.marks (which is percentage)
        const ratio = student.marks / 100;
        // Add a small deterministic variance based on name/roll
        const seed = student.roll.charCodeAt(student.roll.length - 1);
        const variance = ((seed % 7) - 3) / 100; // -3% to +3%
        const studentRatio = Math.max(0.2, Math.min(1.0, ratio + variance));

        if (hasTheory) {
          theoryObtained = Math.round(theoryMax * studentRatio);
        }
        if (hasPractical) {
          practicalObtained = Math.round(practicalMax * studentRatio);
        }
      }

      const totalObtained = theoryObtained + practicalObtained;
      const passed = Number(totalObtained) >= Number(subj?.passing ?? Math.round(totalMax * 0.35));

      return {
        roll: student.roll,
        name: student.name,
        theory: theoryObtained,
        practical: practicalObtained,
        total: totalObtained,
        passed
      };
    });

    const evaluator = secData?.teacher || subj?.teacher || "Unassigned";
    const dueDate = secData?.dueDate || subj?.marksDueDate || "No deadline";
    const isDone = secData ? (getSectionTheorySubmitted(subj, secData) && getSectionPracticalSubmitted(subj, secData)) : false;

    return {
      subjectName,
      section,
      evaluator,
      dueDate,
      isDone,
      hasTheory,
      theoryMax,
      hasPractical,
      practicalMax,
      totalMax,
      students: studentMarksList
    };
  }, [selectedSectionLockDetail, selectedExam]);

  const teacherDutyAssignments = useMemo<TeacherDutyAssignment[]>(() => {
    if (!selectedExam) return [];

    const activeTeacherName = activeTeacherPortal.toLowerCase();

    return (selectedExam.subjectsList || []).flatMap((subj) => {
      const activeSections = selectedExam.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
      return activeSections.flatMap((secName) => {
        const secData = subj.sectionAssignments?.[secName] || {
          teacher: subj.teacher,
          practicalTeacher: subj.teacher,
          dueDate: subj.marksDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          marksSubmitted: false,
          theoryMarksSubmitted: false,
          practicalMarksSubmitted: false,
          studentMarks: {},
        };

        const canEnterTheory =
          subj.hasTheory !== false &&
          (secData.teacher || '').toLowerCase() === activeTeacherName;
        const practicalAssignee = secData.practicalTeacher || secData.teacher;
        const canEnterPractical =
          !!subj.hasPractical &&
          (practicalAssignee || '').toLowerCase() === activeTeacherName;

        if (!canEnterTheory && !canEnterPractical) return [];

        return [{
          key: `${subj.name}__${secName}`,
          subjectName: subj.name,
          section: secName,
          dueDate: secData.dueDate,
          teacher: secData.teacher,
          practicalTeacher: secData.practicalTeacher,
          marksSubmitted: secData.marksSubmitted,
          canEnterTheory,
          canEnterPractical,
          subjectObj: subj,
          secData,
        }];
      });
    });
  }, [selectedExam, activeTeacherPortal]);

  const activeTeacherDuty = marksViewMode === 'teacher'
    ? teacherDutyAssignments.find((duty) => duty.key === activeTeacherDutyKey) || teacherDutyAssignments[0]
    : null;

  const effectiveMarksSubject = marksViewMode === 'teacher'
    ? activeTeacherDuty?.subjectName || ''
    : activeMarksSubject;

  const effectiveMarksSection = marksViewMode === 'teacher'
    ? activeTeacherDuty?.section || ''
    : activeMarksSection;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openDropdownSection && !target.closest('.evaluator-dropdown-container')) {
        setOpenDropdownSection(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [openDropdownSection]);

  useEffect(() => {
    if (!selectedExam) return;
    const conducted = (selectedExam.subjectsList || []).filter(s => {
      const status = getSubjectStatus(s.date, s.startTime, s.endTime, s.status);
      return status === 'Conducted' || status === 'Completed';
    });
    if (conducted.length > 0) {
      setActiveMarksSubject(conducted[0].name);
    } else {
      setActiveMarksSubject('');
    }
  }, [selectedExam]);

  useEffect(() => {
    if (!selectedExam) return;
    const sections = selectedExam.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A'];
    if (sections.length > 0) {
      setActiveMarksSection(sections[0]);
    } else {
      setActiveMarksSection('A');
    }
  }, [selectedExam, activeMarksSubject]);

  useEffect(() => {
    if (marksViewMode !== 'teacher') {
      setActiveTeacherDutyKey('');
      return;
    }

    if (teacherDutyAssignments.length === 0) {
      setActiveTeacherDutyKey('');
      return;
    }

    if (!teacherDutyAssignments.some((duty) => duty.key === activeTeacherDutyKey)) {
      setActiveTeacherDutyKey(teacherDutyAssignments[0].key);
    }
  }, [marksViewMode, teacherDutyAssignments, activeTeacherDutyKey]);

  useEffect(() => {
    if (!effectiveMarksSubject || !effectiveMarksSection || !selectedExam) return;
    const subj = selectedExam.subjectsList?.find(s => s.name === effectiveMarksSubject);
    const secData = subj?.sectionAssignments?.[effectiveMarksSection];
    const form: Record<string, { theory: string; practical: string }> = {};

    const sectionStudents = studentsPerformance.filter(student => {
      return getSectionFromRoll(student.roll) === effectiveMarksSection;
    });

    sectionStudents.forEach(student => {
      const existing = secData?.studentMarks?.[student.roll];
      form[student.roll] = {
        theory: existing ? String(existing.theory) : '',
        practical: existing ? String(existing.practical) : '',
      };
    });
    setMarksForm(form);
  }, [effectiveMarksSubject, effectiveMarksSection, selectedExam]);

  const handleAssignEvaluator = (subjectName: string) => {
    if (!selectedExam) return;

    const activeSections = selectedExam.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
    const subj = selectedExam.subjectsList?.find(s => s.name.toLowerCase() === subjectName.toLowerCase());

    const existingAssignments = subj?.sectionAssignments || {};
    const sectionAssignments: Record<string, SectionAssignment> = {};

    for (const sec of activeSections) {
      const secAssign = assignForm.sections?.[sec];
      const hasTheory = subj?.hasTheory !== false;
      const hasPractical = subj?.hasPractical ?? false;
      const existingSection = existingAssignments[sec];

      if (!secAssign) {
        alert(`Please configure assignments for Section ${sec}.`);
        return;
      }
      if (hasTheory && !secAssign.teacher) {
        alert(`Please assign a Theory evaluator for Section ${sec}.`);
        return;
      }
      if (hasPractical && !secAssign.practicalTeacher) {
        alert(`Please assign a Practical evaluator for Section ${sec}.`);
        return;
      }

      sectionAssignments[sec] = {
        teacher: secAssign.teacher || secAssign.practicalTeacher || '',
        practicalTeacher: secAssign.practicalTeacher || secAssign.teacher || '',
        dueDate: secAssign.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        marksSubmitted: existingSection?.marksSubmitted || false,
        theoryMarksSubmitted: existingSection?.theoryMarksSubmitted || false,
        practicalMarksSubmitted: existingSection?.practicalMarksSubmitted || false,
        studentMarks: existingSection?.studentMarks || {},
      };
    }

    const updatedSubjects = (selectedExam.subjectsList || []).map(s => {
      if (s.name.toLowerCase() === subjectName.toLowerCase()) {
        return {
          ...s,
          teacher: sectionAssignments[activeSections[0]]?.teacher || s.teacher,
          evaluatorId: sectionAssignments[activeSections[0]]?.teacher || s.teacher,
          marksDueDate: sectionAssignments[activeSections[0]]?.dueDate || s.marksDueDate,
          sectionAssignments,
        };
      }
      return s;
    });

    const updatedRecord: ExamRecord = {
      ...selectedExam,
      subjectsList: updatedSubjects,
    };

    setRecords(prev => prev.map(rec => rec.id === selectedExam.id ? updatedRecord : rec));
    setSelectedExam(updatedRecord);
    setAssigningSubject(null);
  };

  const handleSaveAndLockMarks = () => {
    if (!selectedExam || !effectiveMarksSubject || !effectiveMarksSection) return;

    const targetSubject = effectiveMarksSubject;
    const targetSection = effectiveMarksSection;
    const canSaveTheory = marksViewMode === 'teacher' ? !!activeTeacherDuty?.canEnterTheory : true;
    const canSavePractical = marksViewMode === 'teacher' ? !!activeTeacherDuty?.canEnterPractical : true;

    const updatedSubjects = (selectedExam.subjectsList || []).map(s => {
      if (s.name === targetSubject) {
        const studentMarks: Record<string, StudentExamMarks> = {};
        let enteredCount = 0;
        const currentSections = s.sectionAssignments || {};
        const activeSecData = currentSections[targetSection] || {
          teacher: s.teacher,
          practicalTeacher: s.teacher,
          dueDate: s.marksDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          marksSubmitted: false,
          theoryMarksSubmitted: false,
          practicalMarksSubmitted: false,
          studentMarks: {},
        };
        const currentStudentMarks = activeSecData.studentMarks || {};

        const sectionStudents = studentsPerformance.filter(student => {
          return getSectionFromRoll(student.roll) === targetSection;
        });

        sectionStudents.forEach(student => {
          const m = marksForm[student.roll] || { theory: '', practical: '' };
          const existing = currentStudentMarks[student.roll];
          const theoryVal = canSaveTheory ? (parseInt(m.theory) || 0) : (existing?.theory || 0);
          const practicalVal = canSavePractical ? (parseInt(m.practical) || 0) : (existing?.practical || 0);
          // const performanceRatio = (studentsPerformance.find((entry) => entry.roll === student.roll)?.marks || 75) / 100;

          studentMarks[student.roll] = {
            theory: theoryVal,
            practical: practicalVal,
            submitted: true,
            internal: undefined,
          };

          if ((canSaveTheory && m.theory !== '') || (canSavePractical && m.practical !== '')) {
            enteredCount++;
          }
        });

        const nextTheorySubmitted = getSectionTheorySubmitted(s, activeSecData) || canSaveTheory;
        const nextPracticalSubmitted = getSectionPracticalSubmitted(s, activeSecData) || canSavePractical;

        const updatedSectionAssignments = {
          ...currentSections,
          [targetSection]: {
            ...activeSecData,
            marksSubmitted: nextTheorySubmitted && nextPracticalSubmitted,
            theoryMarksSubmitted: nextTheorySubmitted,
            practicalMarksSubmitted: nextPracticalSubmitted,
            studentMarks,
          }
        };

        const activeSections = selectedExam.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
        const allSubmitted = activeSections.every(sec =>
          (updatedSectionAssignments[sec]
            ? getSectionTheorySubmitted(s, updatedSectionAssignments[sec])
            : s.hasTheory === false) &&
          (updatedSectionAssignments[sec]
            ? getSectionPracticalSubmitted(s, updatedSectionAssignments[sec])
            : !s.hasPractical)
        );

        return {
          ...s,
          status: allSubmitted ? 'Completed' : s.status,
          entered: s.entered + enteredCount,
          sectionAssignments: updatedSectionAssignments,
        };
      }
      return s;
    });

    const updatedRecord: ExamRecord = {
      ...selectedExam,
      subjectsList: updatedSubjects,
      completionProgress: Math.min(
        100,
        Math.round(((updatedSubjects.filter(s => s.status === 'Completed').length) / updatedSubjects.length) * 90) + 10
      )
    };

    setRecords(prev => prev.map(rec => rec.id === selectedExam.id ? updatedRecord : rec));
    setSelectedExam(updatedRecord);
    alert(`Marks for ${targetSubject} - Section ${targetSection} successfully saved and submitted.`);
  };

  const activeAssessments = useMemo(() => {
    return records.filter(exam => {
      const matchesSearch = (exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.className.toLowerCase().includes(searchQuery.toLowerCase()));
      const isNotCompleted = (exam.status !== 'Completed' && exam.status !== 'Failed/Error');

      if (!isNotCompleted || !matchesSearch) return false;

      if (activeRole === 'TEACHER') {
        return exam.subjectsList?.some(subj =>
          Object.values(subj.sectionAssignments || {}).some(sec =>
            sec.teacher.toLowerCase() === (user?.name || 'David Miller').toLowerCase() ||
            (sec.practicalTeacher && sec.practicalTeacher.toLowerCase() === (user?.name || 'David Miller').toLowerCase())
          )
        ) || false;
      }

      return true;
    });
  }, [searchQuery, records, activeRole, user]);

  const publishedResults = useMemo(() => {
    return records.filter(exam => {
      const matchesSearch = (exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.className.toLowerCase().includes(searchQuery.toLowerCase()));
      const isCompleted = (exam.status === 'Completed');

      if (!isCompleted || !matchesSearch) return false;

      if (activeRole === 'TEACHER') {
        return exam.subjectsList?.some(subj =>
          Object.values(subj.sectionAssignments || {}).some(sec =>
            sec.teacher.toLowerCase() === (user?.name || 'David Miller').toLowerCase() ||
            (sec.practicalTeacher && sec.practicalTeacher.toLowerCase() === (user?.name || 'David Miller').toLowerCase())
          )
        ) || false;
      }

      return true;
    });
  }, [searchQuery, records, activeRole, user]);

  const handleEditExam = () => {
    if (!selectedExam) return;

    // Map subjects back to option values
    const selectedSubjects = selectedExam.subjectsList
      ? selectedExam.subjectsList.map(s => {
        const match = subjectOptions.find(opt => opt.label.toLowerCase() === s.name.toLowerCase());
        return match ? match.value : s.name.toLowerCase();
      })
      : [selectedExam.subject.toLowerCase()];

    // Map schedules back
    const schedules: Record<string, { date: string; startTime: string; endTime: string }> = {};
    if (selectedExam.subjectsList) {
      selectedExam.subjectsList.forEach(s => {
        const match = subjectOptions.find(opt => opt.label.toLowerCase() === s.name.toLowerCase());
        const key = match ? match.value : s.name.toLowerCase();

        // Convert 12h display back to 24h format for input type="time"
        const parseTo24Hr = (time12h: string) => {
          if (!time12h) return '09:00';
          const [time, modifier] = time12h.split(' ');
          let [hours, minutes] = time.split(':');
          if (hours === '12') {
            hours = '00';
          }
          if (modifier === 'PM') {
            hours = String(parseInt(hours, 10) + 12);
          }
          return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        };

        schedules[key] = {
          date: s.date,
          startTime: parseTo24Hr(s.startTime),
          endTime: parseTo24Hr(s.endTime),
        };
      });
    }

    setCreateExamForm({
      title: selectedExam.name,
      examCode: selectedExam.id,
      targetClass: selectedExam.className.replace('Class ', ''),
      academicSession: '2025-26', // Default or from data
      departments: ['General'], // Default or from data
      sections: [selectedExam.section],
      subjects: selectedSubjects,
      startDate: selectedExam.startDate,
      endDate: selectedExam.endDate,
      duration: selectedExam.duration,
      startTime: selectedExam.startTime ? (selectedExam.startTime.includes('AM') || selectedExam.startTime.includes('PM') ? '09:00' : selectedExam.startTime) : '09:00',
      endTime: selectedExam.endTime ? (selectedExam.endTime.includes('AM') || selectedExam.endTime.includes('PM') ? '12:00' : selectedExam.endTime) : '12:00',
      resultPublishDate: selectedExam.publishDate,
      baseMarks: '100',
      passingPercentage: '35',
      gradingRule: 'default-gpa',
      instructions: '',
      subjectSchedules: schedules,
    });
    setIsCreateModalOpen(true);
  };

  const handleMoveSubject = (index: number, direction: 'up' | 'down') => {
    setCreateExamForm(prev => {
      const newSubjects = [...prev.subjects];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < newSubjects.length) {
        const sub1 = newSubjects[index];
        const sub2 = newSubjects[targetIndex];

        // Swap positions in the array
        newSubjects[index] = sub2;
        newSubjects[targetIndex] = sub1;

        // Also swap their dates in the schedules to keep the position's date sequence!
        const schedules = { ...(prev.subjectSchedules || {}) };
        const sched1 = schedules[sub1] || { date: '', startTime: '09:00', endTime: '12:00' };
        const sched2 = schedules[sub2] || { date: '', startTime: '09:00', endTime: '12:00' };

        const tempDate = sched1.date;
        schedules[sub1] = { ...sched1, date: sched2.date };
        schedules[sub2] = { ...sched2, date: tempDate };

        return {
          ...prev,
          subjects: newSubjects,
          subjectSchedules: schedules
        };
      }
      return prev;
    });
  };

  const handleSubjectScheduleChange = (
    subVal: string,
    field: 'date' | 'startTime' | 'endTime' | 'practicalDate' | 'practicalStartTime' | 'practicalEndTime',
    value: string
  ) => {
    setCreateExamForm(prev => {
      const schedules = { ...(prev.subjectSchedules || {}) };
      if (!schedules[subVal]) {
        schedules[subVal] = {
          date: prev.startDate || '',
          startTime: '09:00',
          endTime: '12:00',
          practicalDate: prev.startDate || '',
          practicalStartTime: '13:00',
          practicalEndTime: '15:00',
        };
      }
      schedules[subVal] = {
        ...schedules[subVal],
        [field]: value
      };

      const changedIndex = prev.subjects.indexOf(subVal);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const shiftForward = (seedDate: string, targetField: 'date' | 'practicalDate') => {
        if (!seedDate || changedIndex < 0) return;

        let currentDate = new Date(seedDate);
        for (let i = changedIndex + 1; i < prev.subjects.length; i++) {
          const nextSubVal = prev.subjects[i];
          currentDate.setDate(currentDate.getDate() + 1);
          const nextDateStr = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;

          const existingSched = schedules[nextSubVal] || {
            date: '',
            startTime: '09:00',
            endTime: '12:00',
            practicalDate: '',
            practicalStartTime: '13:00',
            practicalEndTime: '15:00'
          };

          schedules[nextSubVal] = {
            ...existingSched,
            [targetField]: nextDateStr
          };
        }
      };

      // Any manual date change becomes the new anchor for all later papers.
      if (field === 'date' && value) {
        shiftForward(value, 'date');
      }

      // Practical dates follow the same rule so a manual gap keeps later practical papers in sequence.
      if (field === 'practicalDate' && value) {
        shiftForward(value, 'practicalDate');
      }

      return {
        ...prev,
        subjectSchedules: schedules
      };
    });
  };

  const handleSubjectConfigChange = (
    subVal: string,
    field: 'hasTheory' | 'theoryMax' | 'hasPractical' | 'practicalMax' | 'hasInternals' | 'internalMax',
    value: any
  ) => {
    setCreateExamForm(prev => {
      const configs = { ...(prev.subjectConfigs || {}) };
      const currentConfig = configs[subVal] || {
        hasTheory: true,
        theoryMax: parseInt(prev.baseMarks) || 80,
        hasPractical: subVal === 'mathematics' || subVal === 'physics' || subVal === 'chemistry' || subVal === 'biology',
        practicalMax: (subVal === 'mathematics' || subVal === 'physics' || subVal === 'chemistry' || subVal === 'biology') ? 20 : 0,
        hasInternals: false,
        internalMax: 0,
      };

      configs[subVal] = {
        ...currentConfig,
        [field]: value
      };

      return {
        ...prev,
        subjectConfigs: configs
      };
    });
  };

  const detectConflicts = (
    subjects: string[],
    schedules: Record<string, any>
  ) => {
    const conflicts: Array<{ sub1: string; sub2: string; date: string }> = [];

    // Helper to convert time "HH:MM" to minutes from midnight
    const toMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    interface ScheduledEvent {
      subject: string;
      type: 'Theory' | 'Practical';
      date: string;
      startTime: string;
      endTime: string;
    }

    const events: ScheduledEvent[] = [];

    subjects.forEach((subVal) => {
      const option = subjectOptions.find(o => o.value === subVal);
      const name = option?.label || subVal;

      const config = (createExamForm.subjectConfigs && createExamForm.subjectConfigs[subVal]) || {
        hasTheory: true,
        theoryMax: 80,
        hasPractical: subVal === 'mathematics' || subVal === 'physics' || subVal === 'chemistry' || subVal === 'biology',
        practicalMax: 20,
        hasInternals: false,
        internalMax: 0,
      };

      const sched = schedules[subVal] || {
        date: '',
        startTime: '09:00',
        endTime: '12:00',
        practicalDate: '',
        practicalStartTime: '13:00',
        practicalEndTime: '15:00',
      };

      if (config.hasTheory && sched.date) {
        events.push({
          subject: name,
          type: 'Theory',
          date: sched.date,
          startTime: sched.startTime || '09:00',
          endTime: sched.endTime || '12:00',
        });
      }

      if (config.hasPractical) {
        const pDate = sched.practicalDate || sched.date;
        if (pDate) {
          events.push({
            subject: name,
            type: 'Practical',
            date: pDate,
            startTime: sched.practicalStartTime || '13:00',
            endTime: sched.practicalEndTime || '15:00',
          });
        }
      }
    });

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];

        if (e1.date === e2.date) {
          const start1 = toMinutes(e1.startTime);
          const end1 = toMinutes(e1.endTime);
          const start2 = toMinutes(e2.startTime);
          const end2 = toMinutes(e2.endTime);

          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              sub1: `${e1.subject} (${e1.type})`,
              sub2: `${e2.subject} (${e2.type})`,
              date: e1.date
            });
          }
        }
      }
    }

    return conflicts;
  };

  const handleSubmitExamForm = (isDraft = false) => {
    if (!createExamForm.title) {
      alert("Please enter an examination title.");
      return;
    }

    if (conflicts.length > 0) {
      alert("❌ Cannot save examination: Overlapping schedule conflicts detected on the same day! Please adjust the subject start/end times.");
      return;
    }

    const targetSubjects = createExamForm.subjects;
    const finalSubjectsList: SubjectSchedule[] = targetSubjects.map((subVal) => {
      const option = subjectOptions.find(o => o.value === subVal);
      const name = option?.label || subVal;
      const sched = (createExamForm.subjectSchedules && createExamForm.subjectSchedules[subVal]) || {
        date: createExamForm.startDate || new Date().toISOString().split('T')[0],
        startTime: createExamForm.startTime || '09:00',
        endTime: createExamForm.endTime || '12:00',
      };

      let teacher = 'Dr. Bruce Wayne';
      if (subVal === 'physics') teacher = 'Dr. Diana Prince';
      else if (subVal === 'chemistry') teacher = 'Prof. Barry Allen';
      else if (subVal === 'biology') teacher = 'Dr. Arthur Curry';

      const baseMarksNum = parseInt(createExamForm.baseMarks) || 100;
      const passingPercent = parseInt(createExamForm.passingPercentage) || 35;
      const passingMarks = Math.round((baseMarksNum * passingPercent) / 100);

      const formatTo12Hr = (timeStr: string) => {
        if (!timeStr) return '';
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        const [hStr, mStr] = timeStr.split(':');
        const h = parseInt(hStr);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH.toString().padStart(2, '0')}:${mStr} ${ampm}`;
      };

      const config = (createExamForm.subjectConfigs && createExamForm.subjectConfigs[subVal]) || {
        hasTheory: true,
        theoryMax: baseMarksNum,
        hasPractical: subVal === 'mathematics' || subVal === 'physics' || subVal === 'chemistry' || subVal === 'biology',
        practicalMax: (subVal === 'mathematics' || subVal === 'physics' || subVal === 'chemistry' || subVal === 'biology') ? 20 : 0,
        hasInternals: false,
        internalMax: 0,
      };

      return {
        name,
        teacher,
        total: (config.hasTheory ? config.theoryMax : 0) + (config.hasPractical ? config.practicalMax : 0) + (config.hasInternals ? config.internalMax : 0) || baseMarksNum,
        passing: passingMarks,
        entered: 0,
        status: 'Pending',
        date: sched.date,
        startTime: formatTo12Hr(sched.startTime),
        endTime: formatTo12Hr(sched.endTime),
        practicalDate: config.hasPractical ? (sched.practicalDate || sched.date) : undefined,
        practicalStartTime: config.hasPractical ? formatTo12Hr(sched.practicalStartTime || '13:00') : undefined,
        practicalEndTime: config.hasPractical ? formatTo12Hr(sched.practicalEndTime || '15:00') : undefined,
        hasTheory: config.hasTheory,
        theoryMax: config.theoryMax,
        hasPractical: config.hasPractical,
        practicalMax: config.practicalMax,
        hasInternals: config.hasInternals,
        internalMax: config.internalMax,
      };
    });

    const isEditMode = !!createExamForm.examCode;
    const examId = createExamForm.examCode || `EX-2026-${String(records.length + 1).padStart(3, '0')}`;

    const newOrUpdatedRecord: ExamRecord = {
      id: examId,
      name: createExamForm.title,
      className: `Class ${createExamForm.targetClass}`,
      section: createExamForm.sections[0] || 'A',
      type: 'Term',
      startDate: createExamForm.startDate || new Date().toISOString().split('T')[0],
      endDate: createExamForm.endDate || new Date().toISOString().split('T')[0],
      status: isDraft ? 'Draft' : 'Scheduled',
      publishStatus: 'Locked',
      subject: finalSubjectsList.map(s => s.name).join(', ') || 'All Subjects',
      duration: createExamForm.duration || '1 Day',
      startTime: finalSubjectsList[0] ? finalSubjectsList[0].startTime : '09:00 AM',
      endTime: finalSubjectsList[0] ? finalSubjectsList[0].endTime : '12:00 PM',
      assignedClasses: createExamForm.sections.map(sec => `${createExamForm.targetClass}-${sec}`),
      createdBy: 'Exam Controller',
      publishDate: createExamForm.resultPublishDate || new Date().toISOString().split('T')[0],
      completionProgress: isDraft ? 0 : 10,
      subjectsList: finalSubjectsList,
    };

    if (isEditMode) {
      setRecords(prev => prev.map(rec => rec.id === examId ? newOrUpdatedRecord : rec));
      if (selectedExam?.id === examId) {
        setSelectedExam(newOrUpdatedRecord);
      }
    } else {
      setRecords(prev => [newOrUpdatedRecord, ...prev]);
    }

    handleCloseCreateModal();
  };

  const handleArchiveExam = () => {
    if (!selectedExam) return;
    setRecords(prev => prev.filter(r => r.id !== selectedExam.id));
    setViewMode('registry');
    setSelectedExam(null);
  };

  const handlePublishResults = () => {
    if (!selectedExam) return;
    const updatedRecord: ExamRecord = {
      ...selectedExam,
      status: 'Completed',
      publishStatus: 'Published',
      publishDate: publishOptions.publishDate,
      completionProgress: 100,
    };
    setRecords(prev => prev.map(rec => rec.id === selectedExam.id ? updatedRecord : rec));
    setSelectedExam(updatedRecord);
    setIsPublishModalOpen(false);
    setActiveTab('Results');
    alert(`Results for ${selectedExam.name} have been successfully published.`);
  };

  const handleRetractResults = () => {
    if (!selectedExam) return;
    const confirmRetract = window.confirm(
      "Are you sure you want to retract/unpublish these results? This will revert the exam back to active status, making grades editable again and hiding results from Student/Parent portals."
    );
    if (!confirmRetract) return;
    const updatedRecord: ExamRecord = {
      ...selectedExam,
      status: 'Ongoing',
      publishStatus: 'Pending',
      completionProgress: 90,
    };
    setRecords(prev => prev.map(rec => rec.id === selectedExam.id ? updatedRecord : rec));
    setSelectedExam(updatedRecord);
    setActiveTab('Overview');
    alert(`Results for ${selectedExam.name} have been retracted to Draft.`);
  };

  const handleForcePublish = () => {
    if (!selectedExam) return;
    const confirmBypass = window.confirm(
      "Warning: Force publishing will bypass pending evaluator locks and automatically populate missing grades with baseline passing scores. Do you wish to proceed?"
    );
    if (!confirmBypass) return;

    const activeSections = selectedExam.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
    const updatedSubjects = (selectedExam.subjectsList || []).map(s => {
      const sectionAssignments = { ...(s.sectionAssignments || {}) };

      activeSections.forEach(sec => {
        const secData = sectionAssignments[sec] || { teacher: s.teacher, dueDate: s.marksDueDate || '2026-06-10' };
        const studentMarks = { ...(secData.studentMarks || {}) };

        const sectionStudents = studentsPerformance.filter(student => {
          return getSectionFromRoll(student.roll) === sec;
        });

        sectionStudents.forEach(student => {
          if (!studentMarks[student.roll]) {
            studentMarks[student.roll] = {
              theory: s.hasTheory !== false ? Math.round((s.theoryMax || 100) * 0.7) : 0,
              practical: s.hasPractical ? Math.round((s.practicalMax || 50) * 0.7) : 0,
              submitted: true,
            };
          }
        });

        sectionAssignments[sec] = {
          ...secData,
          marksSubmitted: true,
          theoryMarksSubmitted: true,
          practicalMarksSubmitted: true,
          studentMarks,
        };
      });

      return {
        ...s,
        status: 'Completed',
        sectionAssignments,
      };
    });

    const updatedRecord: ExamRecord = {
      ...selectedExam,
      subjectsList: updatedSubjects,
      completionProgress: 100,
    };

    setRecords(prev => prev.map(rec => rec.id === selectedExam.id ? updatedRecord : rec));
    setSelectedExam(updatedRecord);
    setIsPublishModalOpen(true);
  };

  const handleOpenExam = (exam: ExamRecord) => {
    setSelectedExam(exam);
    setViewMode('detail');
    if (activeRole === 'TEACHER') {
      setActiveTab('Marks Entry');
      setActiveMarksSubject('Mathematics');
      setActiveMarksSection('A');
    } else {
      setActiveTab(exam.status === 'Completed' ? 'Results' : 'Overview');
    }
  };

  const handleBackToRegistry = () => {
    setSelectedExam(null);
    setViewMode('registry');
  };

  useEffect(() => {
    if (createExamForm.startDate && createExamForm.endDate) {
      const start = new Date(createExamForm.startDate);
      const end = new Date(createExamForm.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays >= 1) {
          setCreateExamForm(prev => ({
            ...prev,
            duration: diffDays === 1 ? '1 Day' : `${diffDays} Days`
          }));
        }
      }
    }
  }, [createExamForm.startDate, createExamForm.endDate]);

  const handleCreateExamFormChange = <K extends keyof CreateExamFormState>(field: K, value: CreateExamFormState[K]) => {
    if (field === 'subjects') {
      const newSubjects = value as string[];
      setCreateExamForm((current) => {
        const schedules = { ...(current.subjectSchedules || {}) };

        // Find if we have a base starting date
        let baseDateStr = '';
        if (newSubjects.length > 0) {
          const firstSub = newSubjects[0];
          baseDateStr = schedules[firstSub]?.date || current.startDate || new Date().toISOString().split('T')[0];
        }

        // Initialize schedules for new subjects consecutively
        if (baseDateStr) {
          let currentDate = new Date(baseDateStr);
          newSubjects.forEach((sub, index) => {
            if (!schedules[sub]) {
              schedules[sub] = {
                date: '',
                startTime: '09:00',
                endTime: '12:00',
              };
            }
            // Only auto-fill if the subject doesn't have a date yet!
            if (!schedules[sub].date) {
              const pad = (n: number) => n.toString().padStart(2, '0');
              const calculatedDate = new Date(currentDate);
              calculatedDate.setDate(currentDate.getDate() + index);
              schedules[sub].date = `${calculatedDate.getFullYear()}-${pad(calculatedDate.getMonth() + 1)}-${pad(calculatedDate.getDate())}`;
            }
          });
        }

        return {
          ...current,
          subjects: newSubjects,
          subjectSchedules: schedules
        };
      });
      return;
    }

    setCreateExamForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const schedules = createExamForm.subjectSchedules || {};
    const selectedSubjects = createExamForm.subjects;

    if (selectedSubjects.length > 0) {
      const validSchedules = selectedSubjects
        .map(sub => {
          const sched = schedules[sub] || { date: '', startTime: '09:00', endTime: '12:00' };
          return { sub, sched };
        })
        .filter(item => item.sched.date);

      if (validSchedules.length > 0) {
        // Sort chronologically by date first, then by startTime
        const sorted = [...validSchedules].sort((a, b) => {
          const dateDiff = new Date(a.sched.date).getTime() - new Date(b.sched.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.sched.startTime.localeCompare(b.sched.startTime);
        });

        const firstItem = sorted[0];
        const lastItem = sorted[sorted.length - 1];

        setCreateExamForm(prev => {
          const updates: Partial<CreateExamFormState> = {};

          if (prev.startDate !== firstItem.sched.date) {
            updates.startDate = firstItem.sched.date;
          }
          if (prev.endDate !== lastItem.sched.date) {
            updates.endDate = lastItem.sched.date;
          }
          if (prev.startTime !== firstItem.sched.startTime) {
            updates.startTime = firstItem.sched.startTime;
          }
          if (prev.endTime !== lastItem.sched.endTime) {
            updates.endTime = lastItem.sched.endTime;
          }

          if (Object.keys(updates).length > 0) {
            return {
              ...prev,
              ...updates
            };
          }
          return prev;
        });
      }
    }
  }, [createExamForm.subjects, createExamForm.subjectSchedules]);

  const conflicts = useMemo(() => {
    return detectConflicts(createExamForm.subjects, createExamForm.subjectSchedules || {});
  }, [createExamForm.subjects, createExamForm.subjectSchedules, createExamForm.subjectConfigs]);

  const handleOpenCreateModal = () => {
    setCreateExamForm(defaultCreateExamFormState);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateExamForm(defaultCreateExamFormState);
    setIsCreateModalOpen(false);
  };

  const kpis = [
    { label: 'Total Exams', value: '24', sub: '+4 this session', icon: CalendarDays, color: 'bg-brand-orange' },
    { label: 'Upcoming', value: '8', sub: 'Starting in 4 days', icon: Clock3, color: 'bg-brand-blue' },
    { label: 'Results Released', value: '18', sub: '92% completion', icon: FileCheck2, color: 'bg-brand-green' },
    { label: 'Evaluations', value: '42', sub: '-5 since yesterday', icon: ClipboardCheck, color: 'bg-brand-purple' },
    { label: 'Performance', value: '78%', sub: '+3.2% vs last term', icon: TrendingUp, color: 'bg-primary' },
    { label: 'Pass Rate', value: '94.2%', sub: 'Stable cohort', icon: Award, color: 'bg-oat' },
  ];

  if (activeRole === 'STUDENT') {
    const studentName = user?.name || 'Emily Davis';
    const studentRoll = '10A-006';
    const studentClass = 'Class 10';
    const studentSection = 'A';

    const cardColorPresets = [
      {
        bg: "bg-[#FFF9F6]",
        border: "border-[#FADCD3]",
        text: "text-[#A84A32]",
        subtext: "text-[#A84A32]/70",
        badgeBg: "bg-[#FADCD3]/40",
        ring: "ring-[#FADCD3]",
        hoverText: "group-hover:text-[#A84A32]",
        accentText: "text-[#A84A32]",
        iconBg: "bg-[#FFF9F6]",
      },
      {
        bg: "bg-[#FFFDF4]",
        border: "border-[#F6E6C2]",
        text: "text-[#B2822A]",
        subtext: "text-[#B2822A]/70",
        badgeBg: "bg-[#F6E6C2]/40",
        ring: "ring-[#F6E6C2]",
        hoverText: "group-hover:text-[#B2822A]",
        accentText: "text-[#B2822A]",
        iconBg: "bg-[#FFFDF4]",
      },
      {
        bg: "bg-[#F7FAF7]",
        border: "border-[#D0E2D0]",
        text: "text-[#4F7A4F]",
        subtext: "text-[#4F7A4F]/70",
        badgeBg: "bg-[#D0E2D0]/40",
        ring: "ring-[#D0E2D0]",
        hoverText: "group-hover:text-[#4F7A4F]",
        accentText: "text-[#4F7A4F]",
        iconBg: "bg-[#F7FAF7]",
      },
      {
        bg: "bg-[#F4FAFE]",
        border: "border-[#CBE3F5]",
        text: "text-[#2D6A9F]",
        subtext: "text-[#2D6A9F]/70",
        badgeBg: "bg-[#CBE3F5]/40",
        ring: "ring-[#CBE3F5]",
        hoverText: "group-hover:text-[#2D6A9F]",
        accentText: "text-[#2D6A9F]",
        iconBg: "bg-[#F4FAFE]",
      },
      {
        bg: "bg-[#FAF7FE]",
        border: "border-[#E5D7FA]",
        text: "text-[#6D42A6]",
        subtext: "text-[#6D42A6]/70",
        badgeBg: "bg-[#E5D7FA]/40",
        ring: "ring-[#E5D7FA]",
        hoverText: "group-hover:text-[#6D42A6]",
        accentText: "text-[#6D42A6]",
        iconBg: "bg-[#FAF7FE]",
      }
    ];

    // const selectedExamIdx = selectedExam ? records.findIndex(e => e.id === selectedExam.id) : -1;
    // const themeColor = cardColorPresets[selectedExamIdx !== -1 ? selectedExamIdx % cardColorPresets.length : 0];

    // Filter exams assigned to the student's class (Class 10 / 10-A)
    const studentExams = records.filter(exam => {
      const classNameClean = exam.className.toLowerCase().replace(/\s+/g, '');
      const studentClassClean = studentClass.toLowerCase().replace(/\s+/g, '');
      const isClassMatch = classNameClean === studentClassClean || classNameClean.includes(studentClassClean) || studentClassClean.includes(classNameClean);
      const isAssigned = exam.assignedClasses?.some(ac => ac.toLowerCase().includes('10-a')) || exam.section === 'A';
      return isClassMatch || isAssigned;
    });

    const triggerReportDownload = () => {
      setBulkProcessingState({
        isOpen: true,
        progress: 0,
        type: 'Download',
        studentCount: 1,
      });

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setBulkProcessingState(prev => ({ ...prev, progress }));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBulkProcessingState(prev => ({ ...prev, isOpen: false }));
          }, 800);
        }
      }, 150);
    };

    const triggerReportPrint = () => {
      setBulkProcessingState({
        isOpen: true,
        progress: 0,
        type: 'Print',
        studentCount: 1,
      });

      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setBulkProcessingState(prev => ({ ...prev, progress }));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBulkProcessingState(prev => ({ ...prev, isOpen: false }));
            window.print();
          }, 800);
        }
      }, 100);
    };

    return (
      <div className="text-[#2C2625] selection:bg-[#C37A67]/20 animate-in fade-in duration-500">
        <div className="w-full">

          {/* --- TOP HEADER SECTION --- */}
          <header className="mb-6 flex flex-col gap-5 sm:mb-8 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#C37A67]/10 text-[#C37A67] border-none px-2 py-0.5 text-[10px] font-black tracking-widest uppercase">EduPilot ERP</Badge>
                <div className="h-1 w-1 rounded-full bg-[#E9E1D5]" />
                <span className="text-[10px] font-black tracking-widest uppercase text-[#2C2625]/40">Student Academic Center</span>
              </div>
              <h1 className="mt-2 text-[2rem] font-black leading-[0.98] tracking-tight text-[#2C2625] sm:mt-1 sm:text-4xl sm:leading-none">
                My Exams & Results
              </h1>
              <p className="mt-2 text-sm font-medium text-[#2C2625]/60 italic sm:mt-0">
                {selectedExam ? "View schedules, instructions, and verified marksheet for this assessment." : "Select an assessment below to inspect timetables, grades, and official report cards."}
              </p>
            </div>

            {/* Profile Info Badge */}
            <div className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-[#C37A67]/10 border border-[#C37A67]/15">
              <div className="h-9 w-9 rounded-xl bg-[#C37A67] text-white flex items-center justify-center font-black text-sm uppercase shrink-0">
                {studentName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left leading-none">
                <span className="text-xs font-black text-[#2C2625] block">{studentName}</span>
                <span className="text-[9px] font-bold text-[#2C2625]/50 block mt-1 uppercase tracking-wider">
                  Roll: {studentRoll} • {studentClass} - {studentSection}
                </span>
              </div>
            </div>
          </header>

          {selectedExam === null ? (
            <>
              {/* --- EXAM REGISTRY (LIST VIEW) --- */}
              <div className="space-y-4">
                <div className="flex flex-col text-left">
                  <h3 className="text-lg font-black text-[#2C2625]">My Assessments Registry</h3>
                  <span className="text-[9px] font-black uppercase text-[#2C2625]/35 tracking-widest mt-0.5">Assigned Examinations list</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {studentExams.map((exam, idx) => {
                    const isCompleted = exam.status === 'Completed';
                    const isPublished = exam.publishStatus === 'Published';
                    const color = cardColorPresets[idx % cardColorPresets.length];

                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => setSelectedExam(exam)}
                        className={cn(
                          "group w-full rounded-[28px] border p-5 text-left shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.985] flex flex-col justify-between min-h-[180px]",
                          color.bg,
                          color.border,
                          "shadow-[#2C2625]/5"
                        )}
                      >
                        <div className="w-full">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 text-left">
                              <span className={cn(
                                "block text-md font-black leading-tight transition-colors",
                                color.text,
                                color.hoverText
                              )}>
                                {exam.name}
                              </span>
                              <span className={cn(
                                "mt-1 block text-[9px] font-black uppercase tracking-[0.18em]",
                                color.subtext
                              )}>
                                ID: {exam.id} • {exam.type}
                              </span>
                            </div>
                            <div className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:translate-x-0.5 border bg-white",
                              color.border
                            )}>
                              <ChevronRight className={cn("h-4 w-4", color.text)} />
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className={cn("rounded-xl px-3 py-2 border text-left", color.badgeBg, color.border)}>
                              <span className={cn("block text-[8px] font-black uppercase tracking-widest", color.subtext)}>Schedule Duration</span>
                              <span className="mt-0.5 block text-[10px] font-bold text-[#2C2625] truncate">{exam.startDate} to {exam.endDate}</span>
                            </div>
                            <div className={cn("rounded-xl px-3 py-2 border text-left", color.badgeBg, color.border)}>
                              <span className={cn("block text-[8px] font-black uppercase tracking-widest", color.subtext)}>Results Status</span>
                              <span className={cn(
                                "mt-0.5 block text-[10px] font-black uppercase tracking-wide",
                                isPublished ? "text-[#4F7A4F]" : "text-[#B2822A]"
                              )}>
                                {isPublished ? 'Published' : 'Results Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={cn("mt-4 pt-3 border-t flex items-center justify-between w-full", color.border)}>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "h-2 w-2 rounded-full",
                              isCompleted ? "bg-[#4F7A4F]" : "bg-[#B2822A] animate-pulse"
                            )} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", color.subtext)}>
                              {exam.status}
                            </span>
                          </div>
                          <span className={cn("text-[9px] font-black uppercase tracking-wider", color.text)}>Click to Inspect</span>
                        </div>
                      </button>
                    );
                  })}

                  {studentExams.length === 0 && (
                    <div className="col-span-2 rounded-[28px] border border-dashed border-[#E9E1D5] bg-white p-12 text-center text-xs font-black uppercase tracking-widest text-[#2C2625]/30">
                      No examinations assigned to your class section.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* --- DETAILED VIEW FOR SELECTED EXAM --- */}
              <div className="mb-6 flex">
                <Button
                  onClick={() => setSelectedExam(null)}
                  variant="ghost"
                  className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-[#2C2625]/60 hover:text-[#C37A67] border border-[#E9E1D5]/40 bg-white shadow-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Assessments
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT WORKSPACE: OVERVIEW & SUBJECTS TIMETABLE */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Overview Block */}
                  <div className="rounded-[28px] border border-[#E9E1D5]/80 bg-white p-5 sm:p-6 text-left space-y-4 shadow-sm">
                    <div className="pb-3 border-b border-[#E9E1D5]/40">
                      <span className="text-[9px] font-black uppercase text-[#C37A67] tracking-widest">Assessment Scope</span>
                      <h3 className="text-lg font-black text-[#2C2625] leading-none mt-1">{selectedExam.name}</h3>
                      <span className="text-[9px] font-black text-[#2C2625]/35 uppercase tracking-widest block mt-1">ID: {selectedExam.id} • {selectedExam.type}</span>
                    </div>

                    <div className="space-y-3.5 text-xs font-bold text-[#2C2625]/70">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">Start Date</span>
                          <span className="mt-0.5 block text-[11px] font-black text-[#2C2625]">{selectedExam.startDate}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">End Date</span>
                          <span className="mt-0.5 block text-[11px] font-black text-[#2C2625]">{selectedExam.endDate}</span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">Exam Instructions</span>
                        <p className="mt-1 text-[10px] font-medium text-[#2C2625]/50 leading-relaxed italic">
                          "Students must report 15 minutes before the start time. Handheld calculators are permitted unless specified otherwise. Bring your official student ID."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Subjects Timetable */}
                  <div className="space-y-4 text-left">
                    <div>
                      <h4 className="text-md font-black text-[#2C2625] uppercase tracking-tight">Academic Timetable</h4>
                      <p className="text-[8px] font-black text-[#2C2625]/30 uppercase tracking-widest mt-0.5">Subject Paper Schedules</p>
                    </div>

                    <div className="space-y-3.5">
                      {(selectedExam.subjectsList || []).map((paper) => {
                        const status = getSubjectStatus(paper.date, paper.startTime, paper.endTime, paper.status);
                        const isPaperOngoing = status === 'Ongoing';

                        return (
                          <div
                            key={paper.name}
                            className="p-5 rounded-[24px] bg-white border border-[#E9E1D5] shadow-sm text-left space-y-3 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-[#C37A67]/10 text-[#C37A67] flex items-center justify-center shrink-0">
                                  <BookOpenCheck className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-sm font-black text-[#2C2625] block">{paper.name}</span>
                                  <span className="text-[9px] font-bold text-[#2C2625]/45 block mt-0.5">Total Marks: {paper.total} (Passing: {paper.passing})</span>
                                </div>
                              </div>

                              <Badge className={cn(
                                "border-none px-2.5 py-1 text-[8px] font-black uppercase rounded-lg",
                                isPaperOngoing ? "bg-[#A78BFA] text-white animate-pulse" :
                                  status === 'Completed' || status === 'Conducted' ? "bg-[#88AC88]/10 text-[#88AC88]" :
                                    "bg-[#E4B76D]/15 text-[#E4B76D]"
                              )}>
                                {status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E9E1D5]/40">
                              <div>
                                <span className="text-[8px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Date & Duration</span>
                                <span className="text-[10px] font-bold text-[#2C2625] block mt-0.5">{paper.date || 'TBD'}</span>
                                <span className="text-[9px] font-medium text-[#2C2625]/50 block mt-0.5">{paper.startTime || '—'} - {paper.endTime || '—'}</span>
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Teacher Duty</span>
                                <span className="text-[10px] font-bold text-[#2C2625] block mt-0.5">{paper.teacher}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {(selectedExam.subjectsList || []).length === 0 && (
                        <div className="rounded-[24px] border border-dashed border-[#E9E1D5] bg-white p-8 text-center text-xs font-black uppercase tracking-widest text-[#2C2625]/30">
                          Timetable not yet released
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT WORKSPACE: PUBLISHED RESULTS OR LOCKED ALERT */}
                <div className="lg:col-span-7 space-y-6">
                  {selectedExam.publishStatus === 'Published' ? (
                    (() => {
                      const subjectsGrades = (selectedExam.subjectsList || []).map(subj => {
                        const secData = subj.sectionAssignments?.[studentSection];
                        const marks = secData?.studentMarks?.[studentRoll];

                        let theoryVal = 0;
                        let practicalVal = 0;
                        if (marks) {
                          theoryVal = marks.theory || 0;
                          practicalVal = marks.practical || 0;
                        } else {
                          // Fallback mock seeds for Emily Davis
                          theoryVal = subj.hasTheory !== false ? Math.round((subj.theoryMax || 100) * 0.8) : 0;
                          practicalVal = subj.hasPractical ? Math.round((subj.practicalMax || 50) * 0.8) : 0;
                        }

                        const totalScore = theoryVal + practicalVal;
                        const passMarks = subj.passing || Math.round(subj.total * 0.35);
                        const passed = totalScore >= passMarks;

                        let grade = 'F';
                        const pct = subj.total > 0 ? (totalScore / subj.total) * 100 : 0;
                        if (pct >= 90) grade = 'A+';
                        else if (pct >= 80) grade = 'A';
                        else if (pct >= 70) grade = 'B';
                        else if (pct >= 60) grade = 'C';
                        else if (pct >= 50) grade = 'D';
                        else if (pct >= 35) grade = 'E';

                        return {
                          ...subj,
                          theoryVal,
                          practicalVal,
                          totalScore,
                          grade,
                          passed,
                        };
                      });

                      const totalObtainedAll = subjectsGrades.reduce((sum, s) => sum + s.totalScore, 0);
                      const totalMaxAll = subjectsGrades.reduce((sum, s) => sum + s.total, 0);
                      const overallPercentage = totalMaxAll > 0 ? Math.round((totalObtainedAll / totalMaxAll) * 100) : 0;

                      let overallGrade = 'F';
                      let overallGPA = '0.0';
                      if (overallPercentage >= 90) { overallGrade = 'A+'; overallGPA = '4.0'; }
                      else if (overallPercentage >= 80) { overallGrade = 'A'; overallGPA = '3.7'; }
                      else if (overallPercentage >= 70) { overallGrade = 'B'; overallGPA = '3.0'; }
                      else if (overallPercentage >= 60) { overallGrade = 'C'; overallGPA = '2.5'; }
                      else if (overallPercentage >= 50) { overallGrade = 'D'; overallGPA = '1.5'; }
                      else if (overallPercentage >= 35) { overallGrade = 'E'; overallGPA = '1.0'; }

                      const isAllPassed = subjectsGrades.every(s => s.passed);

                      return (
                        <div className="rounded-[36px] bg-white border border-[#E9E1D5] shadow-xl p-5 sm:p-8 space-y-6 text-left animate-in slide-in-from-right duration-300">
                          {/* Scorecard Header */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#E9E1D5]">
                            <div>
                              <h4 className="text-md font-black text-[#2C2625] uppercase tracking-tight">Verified Scorecard</h4>
                              <span className="text-[9px] font-black text-[#2C2625]/35 uppercase tracking-widest block mt-0.5">
                                Published on {selectedExam.publishDate}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={triggerReportDownload}
                                variant="outline"
                                className="h-10 rounded-xl border-[#E9E1D5] text-[10px] font-black uppercase tracking-widest text-[#2C2625] hover:bg-[#FDFBF7]"
                              >
                                <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                              </Button>
                              <Button
                                onClick={triggerReportPrint}
                                className="h-10 rounded-xl bg-[#C37A67] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#C37A67]/90 shadow-md shadow-[#C37A67]/15"
                              >
                                <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                              </Button>
                            </div>
                          </div>

                          {/* Scorecard Table */}
                          <div className="overflow-x-auto rounded-2xl border border-[#E9E1D5]/60">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-[#2C2625] text-white text-[9px] font-black uppercase tracking-widest">
                                  <th className="px-4 py-3.5">Subject</th>
                                  <th className="px-4 py-3.5 text-center">Theory</th>
                                  <th className="px-4 py-3.5 text-center">Practical</th>
                                  <th className="px-4 py-3.5 text-right">Obtained</th>
                                  <th className="px-4 py-3.5 text-center">Grade</th>
                                  <th className="px-4 py-3.5 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E9E1D5]/40 text-[11px] font-bold">
                                {subjectsGrades.map((subj) => (
                                  <tr key={subj.name} className="hover:bg-[#FDFBF7]/40 transition-colors">
                                    <td className="px-4 py-3.5 font-black text-[#2C2625]">{subj.name}</td>
                                    <td className="px-4 py-3.5 text-center text-[#2C2625]/60">
                                      {subj.hasTheory !== false ? `${subj.theoryVal} / ${subj.theoryMax}` : '—'}
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-[#2C2625]/60">
                                      {subj.hasPractical ? `${subj.practicalVal} / ${subj.practicalMax}` : '—'}
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-black text-[#2C2625]">
                                      {subj.totalScore} / {subj.total}
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                      <span className="text-xs font-black text-[#C37A67]">{subj.grade}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                      <Badge className={cn(
                                        "border-none px-2 py-0.5 text-[8px] font-black uppercase rounded-md",
                                        subj.passed ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                                      )}>
                                        {subj.passed ? 'Pass' : 'Fail'}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Totals Summary Card Row */}
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
                            <div className="p-4 rounded-2xl bg-[#2C2625]/5 border border-[#E9E1D5]/20">
                              <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block font-bold">Grand Total</span>
                              <span className="text-base font-black text-[#2C2625] block mt-0.5">{totalObtainedAll} / {totalMaxAll}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#2C2625]/5 border border-[#E9E1D5]/20">
                              <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block font-bold">Percentage</span>
                              <span className="text-base font-black text-[#2C2625] block mt-0.5">{overallPercentage}%</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#2C2625]/5 border border-[#E9E1D5]/20">
                              <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block font-bold">Final Grade</span>
                              <span className="text-base font-black text-[#C37A67] block mt-0.5">{overallGrade} ({overallGPA} GPA)</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#2C2625]/5 border border-[#E9E1D5]/20">
                              <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block font-bold">Result Status</span>
                              <span className={cn("text-xs font-black block mt-1.5 uppercase", isAllPassed ? "text-[#88AC88]" : "text-[#E63946]")}>
                                {isAllPassed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* --- LOCKED / UNPUBLISHED RESULT STATE --- */
                    <div className="rounded-[36px] bg-white border border-[#E9E1D5] shadow-xl p-8 space-y-6 text-center flex flex-col items-center justify-center min-h-[350px] animate-in slide-in-from-right duration-300">
                      <div className="h-16 w-16 rounded-[24px] bg-[#E4B76D]/15 text-[#E4B76D] flex items-center justify-center shrink-0">
                        <Lock className="w-8 h-8" />
                      </div>

                      <div className="max-w-md space-y-2.5">
                        <h4 className="text-md font-black text-[#2C2625] uppercase tracking-tight">Result Pending Publication</h4>
                        <p className="text-xs font-medium text-[#2C2625]/50 leading-relaxed">
                          The final scores and marksheets for <strong className="text-[#2C2625]">{selectedExam.name}</strong> have not been published yet. Please wait until they are officially released by the academic office.
                        </p>
                      </div>

                      <div className="px-4 py-2 bg-[#FDFBF7] border border-[#E9E1D5]/60 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#2C2625]/45">
                        Release Schedule: TBA
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

        </div>

        {/* Dynamic Processing Modal for PDF Download or Print */}
        <Modal
          isOpen={bulkProcessingState.isOpen}
          onClose={() => setBulkProcessingState(prev => ({ ...prev, isOpen: false }))}
          hideHeader
          bodyClassName="p-0"
          className="max-w-md w-[calc(100vw-1rem)] sm:w-full rounded-[40px] overflow-hidden border-[#E9E1D5] shadow-2xl"
        >
          <div className="bg-white p-8 text-center space-y-6 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-[24px] bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] animate-pulse">
              {bulkProcessingState.type === 'Download' ? <Download className="h-8 w-8 text-[#C37A67]" /> : <Printer className="h-8 w-8 text-[#C37A67]" />}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#2C2625] uppercase tracking-tight">
                {bulkProcessingState.type === 'Download' ? 'Generating Report PDF' : 'Preparing Scorecard Print'}
              </h3>
              <p className="text-[10px] font-black text-[#C37A67] uppercase tracking-widest">
                Processing Document
              </p>
            </div>

            {/* Custom Symmetrical Progress Bar */}
            <div className="w-full bg-[#E9E1D5]/40 h-2.5 rounded-full overflow-hidden relative">
              <div
                className="bg-[#C37A67] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${bulkProcessingState.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-[10px] font-black text-[#2C2625]/45 uppercase">
              <span>Status: {bulkProcessingState.progress}% Complete</span>
              <span>1 Student Record</span>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="text-[#2C2625] selection:bg-[#C37A67]/20">
      <div className="w-full">

        {/* --- TOP HEADER SECTION --- */}
        <header className="mb-6 flex flex-col gap-5 sm:mb-8 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#C37A67]/10 text-[#C37A67] border-none px-2 py-0.5 text-[10px] font-black tracking-widest uppercase">EduPilot ERP</Badge>
              <div className="h-1 w-1 rounded-full bg-[#E9E1D5]" />
              <span className="text-[10px] font-black tracking-widest uppercase text-[#2C2625]/40">Exams & Results Module</span>
            </div>
            <h1 className="mt-2 text-[2rem] font-black leading-[0.98] tracking-tight text-[#2C2625] sm:mt-1 sm:text-4xl sm:leading-none">
              {activeRole === 'TEACHER' ? "Academic Evaluations Portal" : "Academic Assessments"}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#2C2625]/60 italic sm:mt-0">
              {activeRole === 'TEACHER'
                ? "Evaluate student performance and submit conducted assessment scores"
                : "Manage, track and publish student academic performance"}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            {activeRole !== 'TEACHER' ? (
              <>
                <Button
                  onClick={handleOpenCreateModal}
                  className="h-11 flex-1 rounded-2xl bg-[#C37A67] px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-[#C37A67]/20 hover:bg-[#C37A67]/90 transition-all hover:-translate-y-0.5 sm:h-10 sm:flex-none sm:text-[11px] sm:tracking-[0.18em]"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Exam
                </Button>
                <Button variant="outline" className="h-11 flex-1 rounded-2xl border-[#E9E1D5] bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#2C2625] hover:bg-white shadow-sm transition-all hover:border-[#C37A67]/30 sm:h-10 sm:flex-none sm:text-[11px] sm:tracking-[0.18em]">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Publish Results
                </Button>
              </>
            ) : (
              <span className="w-full px-4 py-2.5 rounded-2xl bg-[#2C2625]/5 border border-[#E9E1D5]/60 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#2C2625] sm:w-auto">
                Evaluator Portal Active
              </span>
            )}
            <div className="flex items-center gap-3 ml-auto pl-3 border-l border-[#E9E1D5] sm:ml-2 sm:pl-4">
              <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9E1D5] bg-white text-[#2C2625] hover:bg-white shadow-sm transition-all hover:border-[#C37A67]/30">
                <Bell className="h-5 w-5" />
                <span className="absolute right-3.5 top-3.5 h-1.5 w-1.5 rounded-full bg-[#E63946]" />
              </button>
            </div>
          </div>
        </header>

        {/* --- KPI SECTION --- */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:gap-5 md:grid-cols-3 xl:grid-cols-6">
          {activeRole === 'TEACHER' ? (
            <>
              <StatsCard label="Assigned Duties" value="1 Active" sub="Mathematics A" icon={ClipboardCheck} color="bg-primary" />
              <StatsCard label="Target Section" value="10-A" sub="Class 10" icon={Users} color="bg-brand-purple" />
              <StatsCard label="Subject Paper" value="Math" sub="Code: MATH-10" icon={BookOpenCheck} color="bg-brand-green" />
              <StatsCard label="Status" value="Submitted" sub="Locked for Admin" icon={ShieldCheck} color="bg-brand-green" />
              <StatsCard label="Evaluated" value="5 Candidates" sub="Roll: 10A-01 to 05" icon={GraduationCap} color="bg-brand-orange" />
              <StatsCard label="Passing Ratio" value="80.0%" sub="4 / 5 Passed" icon={Award} color="bg-oat" />
            </>
          ) : (
            kpis.map((card, idx) => (
              <StatsCard key={idx} {...card} />
            ))
          )}
        </section>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex flex-col gap-8 sm:gap-12">
          {viewMode === 'registry' ? (
            <>
              {/* SECTION 1: ACTIVE ASSESSMENTS & EXAMS */}
              <section className="flex flex-col gap-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 px-0 sm:px-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-[#2C2625]">Active Assessments</h3>
                      <p className="text-xs font-bold text-[#2C2625]/40 uppercase tracking-widest mt-0.5">Upcoming & Ongoing Evaluations</p>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_2.75rem] lg:w-auto lg:grid-cols-[14rem_12rem_2.75rem]">
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2C2625]/30" />
                        <Input
                          placeholder="Search active exams..."
                          className="h-11 w-full border-[#E9E1D5] bg-white pl-10 text-xs font-bold rounded-2xl shadow-sm focus:ring-[#C37A67]/10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="w-full">
                        <MultiSelect
                          options={departmentOptions}
                          placeholder="All Depts"
                          value={[]}
                          onChange={() => { }}
                          className="h-11 border-[#E9E1D5] bg-white text-[10px] font-black rounded-2xl shadow-sm"
                        />
                      </div>
                      <Button variant="outline" className="h-11 w-full border-[#E9E1D5] bg-white p-0 rounded-2xl shadow-sm hover:border-[#C37A67]/30 sm:w-11">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:hidden">
                    {activeAssessments.map((exam) => (
                      <ExamRegistryCard key={exam.id} exam={exam} variant="active" onOpen={handleOpenExam} />
                    ))}
                    {activeAssessments.length === 0 && (
                      <div className="rounded-[28px] border border-dashed border-[#E9E1D5] bg-white p-8 text-center text-xs font-bold uppercase tracking-widest text-[#2C2625]/30">
                        No active assessments found
                      </div>
                    )}
                  </div>

                  <div className="hidden overflow-x-auto rounded-[32px] border border-[#E9E1D5]/60 shadow-xl shadow-[#2C2625]/5 bg-white lg:block">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#2C2625] text-white text-[10px] font-black uppercase tracking-widest">
                          <th className="px-4 sm:px-8 py-4 sm:py-6">Exam Details</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6">Class & Section</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6">Duration</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6">Current Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9E1D5]/40">
                        {activeAssessments.map((exam) => (
                          <tr key={exam.id} className="group hover:bg-white/80 transition-all cursor-pointer" onClick={() => handleOpenExam(exam)}>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-[#2C2625] group-hover:text-[#C37A67] transition-colors">{exam.name}</span>
                                <span className="text-[10px] font-bold text-[#2C2625]/40 mt-1 uppercase tracking-tighter">ID: {exam.id} • {exam.subject}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2C2625]/5 border border-[#2C2625]/5">
                                <span className="text-xs font-black text-[#2C2625]">{exam.className} - {exam.section}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#2C2625]">{exam.startDate}</span>
                                <span className="text-[10px] font-bold text-[#2C2625]/20 uppercase">to {exam.endDate}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="flex items-center gap-2">
                                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse",
                                  exam.status === 'Ongoing' ? "bg-[#A78BFA]" :
                                    "bg-[#E4B76D]"
                                )} />
                                <span className={cn("text-[10px] font-black uppercase tracking-widest",
                                  exam.status === 'Ongoing' ? "text-[#A78BFA]" :
                                    "text-[#E4B76D]"
                                )}>{exam.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {activeAssessments.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 sm:px-8 py-8 sm:py-12 text-center text-xs font-bold text-[#2C2625]/30 uppercase tracking-widest">No active assessments found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* SECTION 2: RESULTS ARCHIVE */}
              <section className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 px-0 sm:px-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xl font-black text-[#2C2625]">Results Archive</h3>
                        <p className="text-xs font-bold text-[#2C2625]/40 uppercase tracking-widest mt-0.5">Finalized & Published Assessments</p>
                      </div>
                      <Button variant="outline" className="h-11 w-full rounded-2xl border-[#88AC88]/30 bg-[#88AC88]/5 text-[#88AC88] px-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#88AC88] hover:text-white transition-all shadow-sm sm:h-10 sm:w-auto">
                        <Printer className="mr-2 h-4 w-4" /> Bulk Export Reports
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:hidden">
                    {publishedResults.map((exam) => (
                      <ExamRegistryCard key={exam.id} exam={exam} variant="published" onOpen={handleOpenExam} />
                    ))}
                    {publishedResults.length === 0 && (
                      <div className="rounded-[28px] border border-dashed border-[#E9E1D5] bg-white p-8 text-center text-xs font-bold uppercase tracking-widest text-[#2C2625]/30">
                        No published results found
                      </div>
                    )}
                  </div>

                  <div className="hidden overflow-x-auto rounded-[32px] border border-[#E9E1D5]/60 shadow-xl shadow-[#2C2625]/5 bg-white lg:block">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#88AC88] text-white text-[10px] font-black uppercase tracking-widest">
                          <th className="px-4 sm:px-8 py-4 sm:py-6">Exam Details</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6">Class & Section</th>
                          <th className="px-4 sm:px-8 py-4 sm:py-6">Completion Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9E1D5]/40">
                        {publishedResults.map((exam) => (
                          <tr key={exam.id} className="group hover:bg-white/80 transition-all cursor-pointer" onClick={() => handleOpenExam(exam)}>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-[#2C2625] group-hover:text-[#C37A67] transition-colors">{exam.name}</span>
                                <span className="text-[10px] font-bold text-[#2C2625]/40 mt-1 uppercase tracking-tighter">ID: {exam.id} • {exam.subject}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2C2625]/5 border border-[#2C2625]/5">
                                <span className="text-xs font-black text-[#2C2625]">{exam.className} - {exam.section}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-6">
                              <span className="text-[11px] font-black text-[#2C2625]">{exam.endDate}</span>
                            </td>
                          </tr>
                        ))}
                        {publishedResults.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 sm:px-8 py-8 sm:py-12 text-center text-xs font-bold text-[#2C2625]/30 uppercase tracking-widest">No published results found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* --- DETAIL WORKSPACE --- */
            <div className="flex flex-col gap-6 sm:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Workspace Header */}
              <div className="flex flex-col gap-4 px-0 sm:gap-6 sm:px-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-row sm:flex-row items-start sm:items-center justify-between sm:justify-start gap-4 sm:gap-6 w-full">
                  <div className="order-1 sm:order-none flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <Badge className={cn(
                        "border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg",
                        selectedExam?.status === 'Completed'
                          ? "bg-[#88AC88] text-white shadow-[#88AC88]/20"
                          : "bg-[#C37A67] text-white shadow-[#C37A67]/20"
                      )}>
                        {selectedExam?.status === 'Completed' ? 'Results Workspace' : 'Active Workspace'}
                      </Badge>
                      <div className="h-1.5 w-1.5 rounded-full bg-[#E9E1D5]" />
                      <span className="text-xs font-black text-[#2C2625]/40 uppercase tracking-widest">{selectedExam?.id}</span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-[#2C2625] sm:mt-1 sm:text-3xl">{selectedExam?.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                      <span className="text-[10px] font-black text-[#2C2625]/30 uppercase tracking-[0.2em]">{selectedExam?.className} - {selectedExam?.section}</span>
                      <div className="h-1 w-1 rounded-full bg-[#E9E1D5]" />
                      <span className="text-[10px] font-black text-[#C37A67] uppercase tracking-[0.2em]">{selectedExam?.subject}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleBackToRegistry}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-[#2C2625] text-white shadow-xl shadow-black/10 hover:bg-[#C37A67] hover:-translate-x-1 transition-all group p-0 shrink-0 flex items-center justify-center order-2 sm:order-first"
                  >
                    <X className="h-4 w-4 sm:h-6 sm:w-6 group-hover:rotate-90 transition-all" />
                  </Button>
                </div>
                {activeRole !== 'TEACHER' && (
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                    {selectedExam?.status === 'Completed' ? (
                      <Button
                        onClick={handleRetractResults}
                        variant="outline"
                        className="h-11 sm:h-12 rounded-[20px] sm:rounded-[22px] border-[#E9E1D5] bg-[#FDFBF7] px-3 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#E4B76D] hover:bg-[#E4B76D]/5 hover:border-[#E4B76D]/30 shadow-sm transition-all"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" /> Retract Results
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEditExam}
                        variant="outline"
                        className="h-11 sm:h-12 rounded-[20px] sm:rounded-[22px] border-[#E9E1D5] bg-white px-3 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#2C2625] hover:border-[#C37A67]/30 shadow-sm transition-all"
                      >
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Exam
                      </Button>
                    )}
                    <Button
                      onClick={handleArchiveExam}
                      variant="outline"
                      className="h-11 sm:h-12 rounded-[20px] sm:rounded-[22px] border-[#E9E1D5] bg-white px-3 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#E63946] hover:bg-[#E63946]/5 hover:border-[#E63946]/30 shadow-sm transition-all"
                    >
                      <History className="mr-2 h-4 w-4" /> Archive Exam
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Workspace Sidebar Nav */}
                <div className="lg:col-span-3">
                  <div className="sticky top-0 z-40 mx-auto flex h-[72px] w-full max-w-md flex-row items-center justify-between gap-2 overflow-hidden rounded-[48px] border border-[#E9E1D5]/70 bg-white/95 p-2 shadow-xl shadow-[#2C2625]/5 backdrop-blur-md sm:max-w-2xl lg:top-8 lg:z-auto lg:mx-0 lg:h-fit lg:w-full lg:max-w-none lg:flex-col lg:items-stretch lg:justify-start lg:gap-2 lg:overflow-visible lg:rounded-[40px] lg:border-[#E9E1D5] lg:bg-white lg:p-3 lg:shadow-xl lg:shadow-[#2C2625]/5">
                    {[
                      { id: 'Overview', icon: BookOpenCheck, label: 'Control Overview', hideOnCompleted: true },
                      { id: 'Subjects', icon: Filter, label: 'Subject Papers', hideOnCompleted: true },
                      { id: 'Marks Entry', icon: Edit3, label: 'Evaluation Grid', hideOnCompleted: true },
                      { id: 'Grading Rules', icon: ShieldCheck, label: 'Policy Setup', hideOnCompleted: true },
                      { id: 'Results', icon: Award, label: selectedExam?.status === 'Completed' ? 'Rankings' : 'Submission' },
                      { id: 'Report Cards', icon: Printer, label: 'Bulk Printing', showOnlyOnCompleted: true },
                      { id: 'Analytics', icon: BarChart3, label: 'Deep Insights', showOnlyOnCompleted: true },
                      { id: 'Audit Logs', icon: History, label: 'Action Trail', showOnlyOnCompleted: true },
                    ].filter(tab => {
                      if (activeRole === 'TEACHER') {
                        return ['Overview', 'Marks Entry'].includes(tab.id);
                      }
                      if (selectedExam?.status === 'Completed') {
                        return !tab.hideOnCompleted;
                      } else {
                        return tab.id === 'Results' || !tab.showOnlyOnCompleted;
                      }
                    }).map((tab) => {
                      const isSelected = activeTab === tab.id;
                      const getMobileLabel = (id: string) => {
                        switch (id) {
                          case 'Overview': return 'Overview';
                          case 'Subjects': return 'Subjects';
                          case 'Marks Entry': return 'Marks';
                          case 'Grading Rules': return 'Rules';
                          case 'Results': return selectedExam?.status === 'Completed' ? 'Results' : 'Publish';
                          case 'Report Cards': return 'Reports';
                          case 'Analytics': return 'Charts';
                          case 'Audit Logs': return 'Logs';
                          default: return id;
                        }
                      };
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as DetailTab)}
                          className={cn(
                            "transition-all duration-300 group relative text-center outline-none cursor-pointer border-b-0",
                            // Desktop Styles
                            "lg:flex lg:items-center lg:gap-4 lg:px-6 lg:py-5 lg:rounded-[28px] lg:w-full lg:h-auto lg:translate-y-0 lg:bg-transparent lg:shadow-none lg:scale-100",
                            isSelected
                              ? "lg:bg-[#C37A67] lg:text-white lg:shadow-2xl lg:shadow-[#C37A67]/20 lg:-translate-y-0.5"
                              : "lg:text-[#2C2625]/40 lg:hover:text-[#C37A67] lg:hover:bg-[#C37A67]/5",
                            // Mobile Styles
                            "flex flex-1 flex-col items-center justify-center gap-1 text-[9px] font-black uppercase tracking-tighter h-full min-w-0",
                            isSelected
                              ? "h-14 w-14 flex-none rounded-full bg-[#C37A67] text-white shadow-xl shadow-[#C37A67]/20 scale-105 z-10"
                              : "text-[#2C2625]/40 hover:bg-[#C37A67]/5 hover:text-[#C37A67] rounded-full"
                          )}
                        >
                          <tab.icon className={cn(
                            "h-4.5 w-4.5 lg:h-5 lg:w-5 shrink-0 transition-transform",
                            isSelected ? "text-white" : "text-[#2C2625]/40 lg:group-hover:scale-110",
                            "lg:text-inherit"
                          )} />
                          <div className="flex flex-col items-center gap-0 leading-none min-w-0">
                            <span className={cn(
                              "text-[7px] lg:text-[11px] font-black uppercase tracking-tighter lg:tracking-widest leading-none truncate max-w-full",
                              isSelected ? "block text-white" : "hidden sm:block text-[#2C2625]/40"
                            )}>
                              {getMobileLabel(tab.id)}
                            </span>
                            <span className={cn(
                              "hidden lg:block text-[9px] font-bold uppercase tracking-tighter mt-0.5 whitespace-nowrap",
                              isSelected ? "text-white/60" : "text-[#2C2625]/20"
                            )}>
                              {tab.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Workspace Content View */}
                <div className="lg:col-span-9">
                  <div className="min-h-auto lg:min-h-[700px] rounded-[24px] sm:rounded-[36px] md:rounded-[50px] bg-white border border-[#E9E1D5] shadow-2xl shadow-[#2C2625]/5 overflow-hidden p-4 sm:p-6 md:p-10 lg:p-12">
                    {activeTab === 'Overview' && (() => {
                      const subjects = selectedExam?.subjectsList || [];

                      // 1. Calculate Theory Date Range dynamically
                      const theorySubjects = subjects.filter(s => s.hasTheory !== false && s.date);
                      const theoryDates = theorySubjects.map(s => new Date(s.date).getTime());
                      const theoryStart = theoryDates.length > 0
                        ? new Date(Math.min(...theoryDates)).toISOString().split('T')[0]
                        : (selectedExam?.startDate || '2026-05-15');
                      const theoryEnd = theoryDates.length > 0
                        ? new Date(Math.max(...theoryDates)).toISOString().split('T')[0]
                        : (selectedExam?.endDate || '2026-05-30');

                      // 2. Calculate Practical Date Range dynamically
                      const practicalSubjects = subjects.filter(s => s.hasPractical && (s.practicalDate || s.date));
                      const practicalDates = practicalSubjects.map(s => new Date(s.practicalDate || s.date).getTime());
                      const practicalStart = practicalDates.length > 0
                        ? new Date(Math.min(...practicalDates)).toISOString().split('T')[0]
                        : theoryStart;
                      const practicalEnd = practicalDates.length > 0
                        ? new Date(Math.max(...practicalDates)).toISOString().split('T')[0]
                        : theoryEnd;

                      const hasPracticalComponent = subjects.some(s => s.hasPractical);

                      const formatCompactDate = (dateStr: string) => {
                        if (!dateStr) return '';
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return dateStr;
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${months[date.getMonth()]} ${date.getDate()}`;
                      };

                      return (
                        <div className="space-y-12 animate-in fade-in duration-500">
                          {/* KPI Row: Symmetrical 3 Columns on Mobile, spacious 3 Columns on Desktop */}
                          {/* Mobile View */}
                          <div className="grid grid-cols-3 gap-2.5 md:hidden">
                            {/* Status */}
                            <div className="py-2.5 px-2 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5] flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                              <div className={cn(
                                "h-7 w-7 rounded-lg relative flex items-center justify-center shrink-0",
                                selectedExam?.status === 'Ongoing' ? "bg-[#A78BFA]/10 text-[#A78BFA]" : "bg-[#88AC88]/10 text-[#88AC88]"
                              )}>
                                <Clock3 className="h-4 w-4" />
                                <span className={cn(
                                  "absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-white",
                                  selectedExam?.status === 'Ongoing' ? "bg-[#A78BFA] animate-pulse" : "bg-[#88AC88]"
                                )} />
                              </div>
                              <div className="flex flex-col items-center leading-none">
                                <span className="text-[7.5px] font-black uppercase text-[#2C2625]/40 tracking-wider">Status</span>
                                <span className="text-[10px] font-black text-[#2C2625] uppercase mt-0.5">{selectedExam?.status}</span>
                              </div>
                            </div>

                            {/* Weightage */}
                            <div className="py-2.5 px-2 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5] flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                              <div className="h-7 w-7 rounded-lg bg-[#C37A67]/10 text-[#C37A67] flex items-center justify-center shrink-0">
                                <Award className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col items-center leading-none">
                                <span className="text-[7.5px] font-black uppercase text-[#2C2625]/40 tracking-wider">Weightage</span>
                                <span className="text-[10px] font-black text-[#2C2625] uppercase mt-0.5">
                                  {(selectedExam?.subjectsList || []).reduce((sum, s) => sum + (s.total || 0), 0)} M
                                </span>
                              </div>
                            </div>

                            {/* Enrolled */}
                            <div className="py-2.5 px-2 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5] flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
                              <div className="h-7 w-7 rounded-lg bg-[#88AC88]/10 text-[#88AC88] flex items-center justify-center shrink-0">
                                <Users className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col items-center leading-none">
                                <span className="text-[7.5px] font-black uppercase text-[#2C2625]/40 tracking-wider">Enrolled</span>
                                <span className="text-[10px] font-black text-[#2C2625] uppercase mt-0.5">124</span>
                              </div>
                            </div>
                          </div>

                          {/* Desktop View */}
                          <div className="hidden md:grid md:grid-cols-3 gap-4 xl:gap-6">
                            <div className="col-span-1 py-5 px-5 rounded-[40px] bg-[#FDFBF7] border border-[#E9E1D5] shadow-sm space-y-4 text-left">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">Status</h3>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "p-2 rounded-xl relative flex items-center justify-center shrink-0",
                                  selectedExam?.status === 'Ongoing' ? "bg-[#A78BFA]/10 text-[#A78BFA]" : "bg-[#88AC88]/10 text-[#88AC88]"
                                )}>
                                  <Clock3 className="h-5 w-5" />
                                  <span className={cn(
                                    "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-white",
                                    selectedExam?.status === 'Ongoing' ? "bg-[#A78BFA] animate-pulse" : "bg-[#88AC88]"
                                  )} />
                                </div>
                                <span className="text-sm font-black text-[#2C2625] uppercase tracking-tight break-words">{selectedExam?.status}</span>
                              </div>
                            </div>
                            <div className="col-span-1 py-5 px-5 rounded-[40px] bg-[#FDFBF7] border border-[#E9E1D5] shadow-sm space-y-4 text-left">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">Weightage</h3>
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-[#C37A67]/10 text-[#C37A67] shrink-0">
                                  <Award className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-black text-[#2C2625] break-words">
                                  {(selectedExam?.subjectsList || []).reduce((sum, s) => sum + (s.total || 0), 0)} Marks
                                </span>
                              </div>
                            </div>
                            <div className="col-span-1 py-5 px-5 rounded-[40px] bg-[#FDFBF7] border border-[#E9E1D5] shadow-sm space-y-4 text-left">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">Enrolled Students</h3>
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-[#88AC88]/10 text-[#88AC88] shrink-0">
                                  <Users className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-black text-[#2C2625] break-words">124</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-8">
                            {/* Mobile View: High-Density Unified List Container (Zero Messy Wrap & Zero Truncation!) */}
                            <div className="md:hidden space-y-4 text-left">
                              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#2C2625]/30">Exam Details</h4>
                              <div className="p-4 rounded-[24px] bg-[#FDFBF7] border border-[#E9E1D5] shadow-sm divide-y divide-[#E9E1D5]/40 space-y-3">
                                {/* Academic Session */}
                                <div className="flex items-start gap-3 pt-3 first:pt-0">
                                  <div className="h-7 w-7 rounded-lg bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0 mt-0.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-[#2C2625]/45 leading-none">Session</span>
                                    <span className="text-[12px] font-black text-[#2C2625] uppercase mt-1 leading-tight">2025-26</span>
                                  </div>
                                </div>

                                {/* Departments */}
                                <div className="flex items-start gap-3 pt-3">
                                  <div className="h-7 w-7 rounded-lg bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0 mt-0.5">
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-[#2C2625]/45 leading-none">Departments</span>
                                    <span className="text-[12px] font-black text-[#2C2625] uppercase mt-1 leading-tight">
                                      {selectedExam?.department || 'Academic / Arts'}
                                    </span>
                                  </div>
                                </div>

                                {/* Target Class */}
                                <div className="flex items-start gap-3 pt-3">
                                  <div className="h-7 w-7 rounded-lg bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0 mt-0.5">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-[#2C2625]/45 leading-none">Target Class</span>
                                    <span className="text-[12px] font-black text-[#2C2625] uppercase mt-1 leading-tight">
                                      {selectedExam?.className} ({selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac).join(', ') || selectedExam?.section || 'A'})
                                    </span>
                                  </div>
                                </div>

                                {/* Grading Rule */}
                                <div className="flex items-start gap-3 pt-3">
                                  <div className="h-7 w-7 rounded-lg bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0 mt-0.5">
                                    <Award className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-[#2C2625]/45 leading-none">Grading Rule</span>
                                    <span className="text-[12px] font-black text-[#2C2625] uppercase mt-1 leading-tight">GPA 4.0 Scale</span>
                                  </div>
                                </div>

                                {/* Theory Schedule */}
                                <div className="flex items-start gap-3 pt-3">
                                  <div className="h-7 w-7 rounded-lg bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0 mt-0.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-[#2C2625]/45 leading-none">Theory Schedule</span>
                                    <span className="text-[12px] font-black text-[#2C2625] uppercase mt-1 leading-tight">
                                      {formatCompactDate(theoryStart)} to {formatCompactDate(theoryEnd)}, {new Date(theoryStart).getFullYear()}
                                    </span>
                                  </div>
                                </div>

                                {/* Practical Schedule */}
                                <div className="flex items-start gap-3 pt-3">
                                  <div className="h-7 w-7 rounded-lg bg-[#88AC88]/10 flex items-center justify-center text-[#88AC88] shrink-0 mt-0.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-[8px] font-black uppercase tracking-wider text-[#2C2625]/45 leading-none">Practical Schedule</span>
                                    <span className="text-[12px] font-black text-[#2C2625] uppercase mt-1 leading-tight">
                                      {hasPracticalComponent
                                        ? `${formatCompactDate(practicalStart)} to ${formatCompactDate(practicalEnd)}, ${new Date(practicalStart).getFullYear()}`
                                        : 'Not Applicable'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Desktop View: Original Spacious Cards (Exactly Unchanged!) */}
                            <div className="hidden md:block space-y-6 text-left">
                              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#2C2625]/30">Exam Details</h4>
                              <div className="p-6 rounded-[32px] bg-[#FDFBF7] border border-[#E9E1D5] shadow-sm space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                  {/* Academic Session */}
                                  <div className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-[#E9E1D5]/10 border border-[#E9E1D5]/20 hover:bg-[#E9E1D5]/20 hover:scale-[1.02] transition-all duration-300">
                                    <div className="h-8.5 w-8.5 rounded-xl bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0">
                                      <CalendarDays className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="w-full">
                                      <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block mb-0.5">Session</span>
                                      <span className="text-[13px] font-black text-[#2C2625] uppercase block break-words leading-tight">2025-26</span>
                                    </div>
                                  </div>

                                  {/* Departments */}
                                  <div className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-[#E9E1D5]/10 border border-[#E9E1D5]/20 hover:bg-[#E9E1D5]/20 hover:scale-[1.02] transition-all duration-300">
                                    <div className="h-8.5 w-8.5 rounded-xl bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0">
                                      <LayoutGrid className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="w-full space-y-0.5">
                                      <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block mb-1">Departments</span>
                                      {(selectedExam?.department || 'Academic / Arts')
                                        .split('/')
                                        .map(d => d.trim())
                                        .filter(Boolean)
                                        .map((d, idx) => (
                                          <span key={idx} className="text-[13px] font-black text-[#2C2625] uppercase block break-words leading-tight">
                                            {d}
                                          </span>
                                        ))}
                                    </div>
                                  </div>

                                  {/* Target Class & Sections */}
                                  <div className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-[#E9E1D5]/10 border border-[#E9E1D5]/20 hover:bg-[#E9E1D5]/20 hover:scale-[1.02] transition-all duration-300">
                                    <div className="h-8.5 w-8.5 rounded-xl bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0">
                                      <GraduationCap className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="w-full">
                                      <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block mb-0.5">Target Class</span>
                                      <span className="text-[13px] font-black text-[#2C2625] uppercase block break-words leading-tight">
                                        {selectedExam?.className}
                                        <span className="text-[#2C2625]/50 font-bold ml-1">
                                          ({selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac).join(', ') || selectedExam?.section || 'A'})
                                        </span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Grading Rule */}
                                  <div className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-[#E9E1D5]/10 border border-[#E9E1D5]/20 hover:bg-[#E9E1D5]/20 hover:scale-[1.02] transition-all duration-300">
                                    <div className="h-8.5 w-8.5 rounded-xl bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0">
                                      <Award className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="w-full">
                                      <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block mb-0.5">Grading Rule</span>
                                      <span className="text-[13px] font-black text-[#2C2625] uppercase block break-words leading-tight">GPA 4.0 Scale</span>
                                    </div>
                                  </div>

                                  {/* Theory Schedule */}
                                  <div className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-[#E9E1D5]/10 border border-[#E9E1D5]/20 hover:bg-[#E9E1D5]/20 hover:scale-[1.02] transition-all duration-300">
                                    <div className="h-8.5 w-8.5 rounded-xl bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0">
                                      <CalendarDays className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="w-full">
                                      <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block mb-0.5">Theory</span>
                                      <span className="text-[13px] font-black text-[#2C2625] uppercase block break-words leading-tight">
                                        {theoryStart} to {theoryEnd}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Practical Schedule */}
                                  <div className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-[#E9E1D5]/10 border border-[#E9E1D5]/20 hover:bg-[#E9E1D5]/20 hover:scale-[1.02] transition-all duration-300">
                                    <div className="h-8.5 w-8.5 rounded-xl bg-[#88AC88]/10 flex items-center justify-center text-[#88AC88] shrink-0">
                                      <CalendarDays className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="w-full">
                                      <span className="text-[8px] font-black text-[#2C2625]/45 uppercase tracking-widest block mb-0.5">Practical</span>
                                      <span className="text-[13px] font-black text-[#2C2625] uppercase block break-words leading-tight">
                                        {hasPracticalComponent
                                          ? `${practicalStart} to ${practicalEnd}`
                                          : 'Not Applicable'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Mark Distribution Card */}
                            {(() => {
                              const totalTheory = subjects.reduce((sum, s) => sum + (s.hasTheory !== false ? (s.theoryMax || 100) : 0), 0);
                              const totalPractical = subjects.reduce((sum, s) => sum + (s.hasPractical ? (s.practicalMax || 50) : 0), 0);
                              const totalInternals = subjects.reduce((sum, s) => sum + (s.hasInternals ? (s.internalMax || 20) : 0), 0);
                              const grandTotal = totalTheory + totalPractical + totalInternals;

                              const pctTheory = grandTotal > 0 ? (totalTheory / grandTotal) * 100 : 0;
                              const pctPractical = grandTotal > 0 ? (totalPractical / grandTotal) * 100 : 0;
                              const pctInternals = grandTotal > 0 ? (totalInternals / grandTotal) * 100 : 0;

                              return (
                                <div className="space-y-6 text-left animate-in fade-in duration-500">
                                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#2C2625]/30">Weightage Distribution</h4>
                                  <div className="p-6 rounded-[32px] bg-[#FDFBF7] border border-[#E9E1D5] shadow-sm space-y-6">
                                    {/* Multi-Segment Stacked Progress Bar */}
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Combined marks pool composition</span>
                                      <div className="h-3 w-full bg-[#E9E1D5]/30 rounded-full overflow-hidden flex shadow-inner">
                                        {totalTheory > 0 && (
                                          <div
                                            className="h-full bg-[#C37A67] transition-all duration-500"
                                            style={{ width: `${pctTheory}%` }}
                                            title={`Theory: ${totalTheory} Marks (${pctTheory.toFixed(1)}%)`}
                                          />
                                        )}
                                        {totalPractical > 0 && (
                                          <div
                                            className="h-full bg-[#88AC88] transition-all duration-500"
                                            style={{ width: `${pctPractical}%` }}
                                            title={`Practical: ${totalPractical} Marks (${pctPractical.toFixed(1)}%)`}
                                          />
                                        )}
                                        {totalInternals > 0 && (
                                          <div
                                            className="h-full bg-[#A78BFA] transition-all duration-500"
                                            style={{ width: `${pctInternals}%` }}
                                            title={`Internals: ${totalInternals} Marks (${pctInternals.toFixed(1)}%)`}
                                          />
                                        )}
                                      </div>
                                    </div>

                                    {/* Mobile View: High-Density Inline List Rows */}
                                    <div className="flex flex-col gap-2.5 md:hidden">
                                      {/* Theory Inline Row */}
                                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#C37A67]/5 border border-[#C37A67]/15">
                                        <div className="flex items-center gap-2">
                                          <div className="h-7 w-7 rounded-lg bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0">
                                            <BookOpenCheck className="h-4 w-4" />
                                          </div>
                                          <span className="text-[11px] font-black text-[#2C2625] uppercase tracking-wider">Theory Papers</span>
                                        </div>
                                        <span className="text-xs font-black text-[#2C2625]">{totalTheory} Marks</span>
                                      </div>

                                      {/* Practical Inline Row */}
                                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#88AC88]/5 border border-[#88AC88]/15">
                                        <div className="flex items-center gap-2">
                                          <div className="h-7 w-7 rounded-lg bg-[#88AC88]/10 flex items-center justify-center text-[#88AC88] shrink-0">
                                            <FileCheck2 className="h-4 w-4" />
                                          </div>
                                          <span className="text-[11px] font-black text-[#2C2625] uppercase tracking-wider">Practical / Lab</span>
                                        </div>
                                        <span className="text-xs font-black text-[#2C2625]">{totalPractical} Marks</span>
                                      </div>

                                      {/* Internals Inline Row */}
                                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#A78BFA]/5 border border-[#A78BFA]/15">
                                        <div className="flex items-center gap-2">
                                          <div className="h-7 w-7 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                                            <Award className="h-4 w-4" />
                                          </div>
                                          <span className="text-[11px] font-black text-[#2C2625] uppercase tracking-wider">Continuous Internals</span>
                                        </div>
                                        <span className="text-xs font-black text-[#2C2625]">{totalInternals} Marks</span>
                                      </div>
                                    </div>

                                    {/* Desktop View: Original Spacious Cards (Exactly Unchanged!) */}
                                    <div className="hidden md:grid md:grid-cols-3 gap-4">
                                      {/* Theory Card */}
                                      <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-[#C37A67]/5 border border-[#C37A67]/15 hover:bg-[#C37A67]/10 hover:scale-[1.02] transition-all duration-300 animate-in fade-in duration-300">
                                        <div className="h-8.5 w-8.5 rounded-xl bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] shrink-0">
                                          <BookOpenCheck className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="w-full">
                                          <span className="text-[10px] font-black uppercase text-[#2C2625] tracking-wider block break-words leading-tight mb-2">Theory Papers</span>
                                          <div className="flex items-baseline justify-between">
                                            <span className="text-[9px] font-black text-[#2C2625]/45 uppercase tracking-widest">Subtotal</span>
                                            <span className="text-[13px] font-black text-[#2C2625]">{totalTheory} Marks</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Practical Card */}
                                      <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-[#88AC88]/5 border border-[#88AC88]/15 hover:bg-[#88AC88]/10 hover:scale-[1.02] transition-all duration-300 animate-in fade-in duration-300">
                                        <div className="h-8.5 w-8.5 rounded-xl bg-[#88AC88]/10 flex items-center justify-center text-[#88AC88] shrink-0">
                                          <FileCheck2 className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="w-full">
                                          <span className="text-[10px] font-black uppercase text-[#2C2625] tracking-wider block break-words leading-tight mb-2">Practical / Lab</span>
                                          <div className="flex items-baseline justify-between">
                                            <span className="text-[9px] font-black text-[#2C2625]/45 uppercase tracking-widest">Subtotal</span>
                                            <span className="text-[13px] font-black text-[#2C2625]">{totalPractical} Marks</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Internals Card */}
                                      <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-[#A78BFA]/5 border border-[#A78BFA]/15 hover:bg-[#A78BFA]/10 hover:scale-[1.02] transition-all duration-300 animate-in fade-in duration-300">
                                        <div className="h-8.5 w-8.5 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                                          <Award className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="w-full">
                                          <span className="text-[10px] font-black uppercase text-[#2C2625] tracking-wider block break-words leading-tight mb-2">Continuous Internals</span>
                                          <div className="flex items-baseline justify-between">
                                            <span className="text-[9px] font-black text-[#2C2625]/45 uppercase tracking-widest">Subtotal</span>
                                            <span className="text-[13px] font-black text-[#2C2625]">{totalInternals} Marks</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Grand Total Footer Card */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E9E1D5]/20 border border-[#E9E1D5]/40 mt-2">
                                      <span className="text-[10px] font-black uppercase text-[#2C2625]/60 tracking-wider">Grand Total marks pool</span>
                                      <span className="text-[19px] font-black text-[#C37A67] tracking-tight">{grandTotal} Marks</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })()}

                    {activeTab === 'Subjects' && (
                      <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-2xl font-black text-[#2C2625]">Subject Papers</h3>
                          <Button className="h-11 w-full rounded-xl bg-[#2C2625] text-white px-5 text-[10px] font-black uppercase tracking-widest sm:h-10 sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add Subject
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          {((selectedExam?.subjectsList && selectedExam.subjectsList.length > 0)
                            ? selectedExam.subjectsList
                            : subjectCards
                          ).map((subj, idx) => {
                            const computedStatus = getSubjectStatus(subj.date, subj.startTime, subj.endTime, subj.status);
                            const activeSections = selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
                            const isExpanded = !!expandedSubjects[subj.name];

                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "group p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-[#FDFBF7] border border-[#E9E1D5] hover:border-[#C37A67]/30 transition-all duration-300 shadow-sm flex flex-col justify-start h-fit",
                                  isExpanded && "ring-1 ring-[#C37A67]/20 shadow-md"
                                )}
                              >
                                {/* Clickable Header for Collapsing/Expanding */}
                                <div
                                  onClick={() => setExpandedSubjects(prev => ({ ...prev, [subj.name]: !prev[subj.name] }))}
                                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                                >
                                  <div className="flex min-w-0 flex-col text-left">
                                    <span className="text-[15px] font-black text-[#2C2625] group-hover:text-[#C37A67] transition-colors flex items-center gap-2">
                                      {subj.name}
                                    </span>
                                    <span className="text-[9px] font-bold text-[#2C2625]/40 uppercase tracking-widest mt-0.5">{subj.teacher}</span>
                                    {/* High-Fidelity Evaluation Component Badges */}
                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                      {subj.hasTheory !== false && (
                                        <span className="text-[7.5px] font-black uppercase px-1.5 py-0.5 bg-[#C37A67]/10 text-[#C37A67] rounded-md tracking-wider">
                                          Theory ({subj.theoryMax ?? 100}M)
                                        </span>
                                      )}
                                      {subj.hasPractical && (
                                        <span className="text-[7.5px] font-black uppercase px-1.5 py-0.5 bg-[#88AC88]/10 text-[#88AC88] rounded-md tracking-wider">
                                          Practical ({subj.practicalMax ?? 0}M)
                                        </span>
                                      )}
                                      {subj.hasInternals && (
                                        <span className="text-[7.5px] font-black uppercase px-1.5 py-0.5 bg-[#A78BFA]/10 text-[#A78BFA] rounded-md tracking-wider">
                                          Internals ({subj.internalMax ?? 0}M)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
                                    <Badge className={cn(
                                      "border-none px-2.5 py-0.5 text-[8px] font-black uppercase rounded-lg text-white shrink-0",
                                      computedStatus === 'Completed' ? "bg-[#88AC88]" :
                                        computedStatus === 'Ongoing' ? "bg-[#A78BFA]" :
                                          computedStatus === 'Conducted' ? "bg-[#C37A67]" : "bg-[#2C2625]/20 text-[#2C2625]/60"
                                    )}>
                                      {computedStatus}
                                    </Badge>

                                    {/* Animated Expand Chevron */}
                                    <button className="p-1 rounded-xl bg-[#2C2625]/5 text-[#C37A67] hover:bg-[#C37A67]/10 transition-all shrink-0">
                                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                                    </button>
                                  </div>
                                </div>

                                {/* Smoothly Animated Collapsible Body Details */}
                                {isExpanded && (
                                  <div className="mt-4 pt-3 sm:mt-5 sm:pt-4 border-t border-[#E9E1D5]/60 space-y-3 sm:space-y-4 animate-in slide-in-from-top-2 duration-300 text-left">
                                    <div className="space-y-3 sm:space-y-4 bg-[#FDFBF7]/40 p-3 sm:p-4 rounded-[24px] sm:rounded-3xl border border-[#E9E1D5]/40">
                                      {/* Theory schedule slot (if theory is active) */}
                                      {subj.hasTheory !== false && (
                                        <div className="flex flex-col gap-2 rounded-[20px] bg-white/80 p-3 border border-[#E9E1D5]/35 sm:rounded-none sm:bg-transparent sm:p-0 sm:border-0 pb-0 sm:pb-2.5 sm:border-b sm:border-[#E9E1D5]/30 last:border-b-0 last:pb-0">
                                          <span className="text-[9px] font-black text-[#C37A67] uppercase tracking-wider block">Theory Paper Slot</span>
                                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            <div className="space-y-0.5">
                                              <span className="text-[8px] sm:text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Scheduled Date</span>
                                              <span className="text-[10px] sm:text-[11px] font-black text-[#2C2625] block">{subj.date}</span>
                                            </div>
                                            <div className="space-y-0.5 text-right sm:text-left">
                                              <span className="text-[8px] sm:text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Session Time</span>
                                              <span className="inline-flex max-w-full items-center justify-end sm:justify-start text-[9px] sm:text-[10px] font-black text-[#C37A67] bg-[#C37A67]/10 px-2 py-0.5 rounded-lg uppercase tracking-wider break-words">
                                                {subj.startTime} - {subj.endTime}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Practical schedule slot (if practical is active) */}
                                      {subj.hasPractical && subj.practicalDate && (
                                        <div className="flex flex-col gap-2 rounded-[20px] bg-white/80 p-3 border border-[#E9E1D5]/35 sm:rounded-none sm:bg-transparent sm:p-0 sm:border-0 pt-0 sm:pt-2.5 sm:border-t sm:border-[#E9E1D5]/30 first:border-t-0 first:pt-0">
                                          <span className="text-[9px] font-black text-[#C37A67] uppercase tracking-wider block">Practical Paper Slot</span>
                                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            <div className="space-y-0.5">
                                              <span className="text-[8px] sm:text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Scheduled Date</span>
                                              <span className="text-[10px] sm:text-[11px] font-black text-[#2C2625] block">{subj.practicalDate}</span>
                                            </div>
                                            <div className="space-y-0.5 text-right sm:text-left">
                                              <span className="text-[8px] sm:text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Session Time</span>
                                              <span className="inline-flex max-w-full items-center justify-end sm:justify-start text-[9px] sm:text-[10px] font-black text-[#C37A67] bg-[#C37A67]/10 px-2 py-0.5 rounded-lg uppercase tracking-wider break-words">
                                                {subj.practicalStartTime} - {subj.practicalEndTime}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Internals portfolio slot (if internals is active) */}
                                      {subj.hasInternals && (
                                        <div className="flex flex-col gap-2 rounded-[20px] bg-white/80 p-3 border border-[#E9E1D5]/35 sm:rounded-none sm:bg-transparent sm:p-0 sm:border-0 pt-0 sm:pt-2.5 sm:border-t sm:border-[#E9E1D5]/30 first:border-t-0 first:pt-0">
                                          <span className="text-[9px] font-black text-[#A78BFA] uppercase tracking-wider block">Continuous Internals Slot</span>
                                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                            <div className="space-y-0.5">
                                              <span className="text-[8px] sm:text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Assessment Mode</span>
                                              <span className="inline-flex max-w-full items-center text-[9px] sm:text-[10px] font-black text-[#A78BFA] bg-[#A78BFA]/10 px-2 py-0.5 rounded-lg uppercase tracking-wider break-words">
                                                LMS Sync & Portfolio
                                              </span>
                                            </div>
                                            <div className="space-y-0.5 text-right sm:text-left">
                                              <span className="text-[8px] sm:text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Max Marks</span>
                                              <span className="text-[10px] sm:text-[11px] font-black text-[#2C2625] block">{subj.internalMax ?? 20} Marks</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:gap-4 bg-[#FDFBF7]/40 p-3 sm:p-4 rounded-[24px] sm:rounded-3xl border border-[#E9E1D5]/40">
                                      <div className="min-w-0 rounded-[18px] bg-white/80 p-2.5 sm:bg-transparent sm:p-0">
                                        <p className="text-[7px] sm:text-[8px] font-black text-[#2C2625]/30 uppercase tracking-widest mb-1 leading-tight">Aggregate Total Marks</p>
                                        <p className="text-[11px] sm:text-xs font-black text-[#2C2625] leading-tight break-words">{subj.total} Max Marks</p>
                                      </div>
                                      <div className="min-w-0 rounded-[18px] bg-white/80 p-2.5 sm:bg-transparent sm:p-0">
                                        <p className="text-[7px] sm:text-[8px] font-black text-[#2C2625]/30 uppercase tracking-widest mb-1 leading-tight">Aggregate Pass Marks</p>
                                        <p className="text-[11px] sm:text-xs font-black text-[#2C2625] leading-tight break-words">{subj.passing} Pass Cutoff</p>
                                      </div>
                                    </div>

                                    {/* Active Component Weightage Breakdown */}
                                    <div className="space-y-2 bg-[#FDFBF7]/40 p-3 sm:p-4 rounded-[24px] sm:rounded-3xl border border-[#E9E1D5]/40 animate-in fade-in duration-300">
                                      <span className="text-[9px] font-black uppercase text-[#2C2625]/40 tracking-wider block">Component Evaluation Breakdown</span>
                                      <div className={cn(
                                        "grid gap-2",
                                        subj.hasTheory !== false && subj.hasPractical && subj.hasInternals
                                          ? "grid-cols-3"
                                          : "grid-cols-2"
                                      )}>
                                        {subj.hasTheory !== false && (
                                          <div className="flex min-w-0 flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#E9E1D5]/35 hover:bg-[#C37A67]/5 transition-all duration-300 shadow-xs select-none">
                                            <span className="text-[12px] font-black text-[#C37A67] leading-none">{subj.theoryMax ?? 100}<span className="text-[9px] font-bold ml-0.5">M</span></span>
                                            <span className="text-[7px] sm:text-[7.5px] font-black text-[#2C2625]/45 uppercase tracking-wide mt-1.5 leading-none text-center">Theory</span>
                                          </div>
                                        )}
                                        {subj.hasPractical && (
                                          <div className="flex min-w-0 flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#E9E1D5]/35 hover:bg-[#88AC88]/5 transition-all duration-300 shadow-xs select-none">
                                            <span className="text-[12px] font-black text-[#88AC88] leading-none">{subj.practicalMax ?? 0}<span className="text-[9px] font-bold ml-0.5">M</span></span>
                                            <span className="text-[6.5px] sm:text-[7px] font-black text-[#2C2625]/45 uppercase tracking-wide mt-1.5 leading-none text-center">Practical</span>
                                          </div>
                                        )}
                                        {subj.hasInternals && (
                                          <div className="flex min-w-0 flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#E9E1D5]/35 hover:bg-[#A78BFA]/5 transition-all duration-300 shadow-xs select-none">
                                            <span className="text-[12px] font-black text-[#A78BFA] leading-none">{subj.internalMax ?? 0}<span className="text-[9px] font-bold ml-0.5">M</span></span>
                                            <span className="text-[6.5px] sm:text-[7px] font-black text-[#2C2625]/45 uppercase tracking-wide mt-1.5 leading-none text-center">Internals</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Section-Wise Current Assignments */}
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-black uppercase text-[#2C2625]/40 tracking-wider block">Section-Wise Evaluators</span>
                                      {subj.sectionAssignments ? (
                                        <div className="space-y-2.5 bg-[#2C2625]/5 p-3 sm:p-3.5 rounded-[22px] sm:rounded-[24px] border border-[#E9E1D5]/40">
                                          <div className="flex items-center justify-between pb-2 border-b border-[#E9E1D5]/20">
                                            <span className="text-[8px] font-black text-[#2C2625]/40 uppercase tracking-wider">Submission Due</span>
                                            <span className="text-[9px] font-black text-[#C37A67] bg-[#C37A67]/10 px-1.5 py-0.5 rounded uppercase">
                                              {Object.values(subj.sectionAssignments)[0]?.dueDate || subj.marksDueDate || "Pending"}
                                            </span>
                                          </div>
                                          <div className="space-y-2">
                                            {Object.entries(subj.sectionAssignments).map(([sec, data]) => (
                                              <div key={sec} className="flex w-full min-w-0 flex-col gap-2 p-3 rounded-2xl bg-white border border-[#E9E1D5]/40 text-[10px] text-[#2C2625] overflow-hidden">
                                                <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#E9E1D5]/20">
                                                  <span className="text-[8px] font-black text-white bg-[#C37A67] px-1.5 py-0.5 rounded uppercase">Sec {sec}</span>
                                                  <span className="min-w-0 text-[7px] sm:text-[7.5px] font-black text-[#2C2625]/40 uppercase tracking-wider text-right">Class Evaluators</span>
                                                </div>
                                                <div className="space-y-2">
                                                  {subj.hasTheory !== false && (
                                                    <div className="grid grid-cols-1 gap-0.5 text-[10px] sm:grid-cols-[1fr_auto] sm:items-start sm:gap-2">
                                                      <span className="font-bold text-[#2C2625]/50">Theory Evaluator:</span>
                                                      <span className="font-black text-[#2C2625] sm:text-right break-words">{data.teacher || 'Not Assigned'}</span>
                                                    </div>
                                                  )}
                                                  {subj.hasPractical && (
                                                    <div className="grid grid-cols-1 gap-0.5 text-[10px] pt-2 border-t border-[#E9E1D5]/20 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-2">
                                                      <span className="font-bold text-[#88AC88]">Practical Evaluator:</span>
                                                      <span className="font-black text-[#2C2625] sm:text-right break-words">{data.practicalTeacher || data.teacher || 'Same as Theory'}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="p-3 bg-[#2C2625]/5 rounded-[20px] border border-[#E9E1D5]/40 text-center">
                                          <span className="text-[10px] font-bold text-[#2C2625]/40 uppercase tracking-wider block">No Evaluators Assigned</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Evaluator Assignment Action section */}
                                    <div className="pt-2">
                                      <Button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAssigningSubject(subj.name);
                                          const currentSections: Record<string, { teacher: string; practicalTeacher?: string; dueDate: string }> = {};
                                          activeSections.forEach(sec => {
                                            const existing = subj.sectionAssignments?.[sec];
                                            currentSections[sec] = {
                                              teacher: existing?.teacher || '',
                                              practicalTeacher: existing?.practicalTeacher || '',
                                              dueDate: existing?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                            };
                                          });
                                          setAssignForm({
                                            teacher: subj.evaluatorId || '',
                                            dueDate: subj.marksDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                            sections: currentSections
                                          });
                                        }}
                                        className="w-full h-10 rounded-2xl border border-[#C37A67]/30 hover:border-[#C37A67] bg-transparent text-[#C37A67] hover:bg-[#C37A67]/5 transition-all text-[10px] font-black uppercase tracking-widest"
                                      >
                                        {subj.sectionAssignments ? "Modify Section Evaluators" : "Assign Section Evaluators"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Beautiful High-Fidelity Custom Evaluator Assignment Modal */}
                        {assigningSubject && (() => {
                          const activeSections = selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
                          return (
                            <Modal
                              isOpen={!!assigningSubject}
                              onClose={() => setAssigningSubject(null)}
                              title={`${assigningSubject} (Paper)`}
                              description="Assign classroom teachers for each section. All section evaluators share a common marks entry deadline."
                              className="max-w-lg w-[calc(100vw-1rem)] sm:w-[95vw] h-[calc(100dvh-1rem)] sm:h-[90vh] md:h-[540px] max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] md:max-h-[540px] rounded-[28px] sm:rounded-[32px] md:rounded-[40px]"
                              bodyClassName="p-3 sm:p-5"
                              footer={
                                <div className="flex gap-3 sm:gap-4 w-full">
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      handleAssignEvaluator(assigningSubject || '');
                                      setAssigningSubject(null);
                                    }}
                                    className="h-10 sm:h-11 rounded-[16px] sm:rounded-[20px] bg-[#88AC88] text-white px-6 text-[10px] font-black uppercase tracking-wider flex-1 hover:bg-[#88AC88]/90 transition-all shadow-sm"
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAssigningSubject(null)}
                                    className="h-10 sm:h-11 rounded-[16px] sm:rounded-[20px] border-[#E9E1D5] text-[10px] font-black uppercase tracking-wider flex-1 hover:bg-[#2C2625]/5 transition-all"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              }
                            >
                              <div className="space-y-4 sm:space-y-5 text-left py-1 sm:py-2">
                                {/* Premium Horizontal Common Deadline Selector */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#FDFBF7] p-3.5 sm:p-4 rounded-[20px] sm:rounded-[24px] border border-[#E9E1D5]">
                                  <div className="flex items-center gap-2.5">
                                    <Clock3 className="w-5 h-5 text-[#C37A67]" />
                                    <div className="text-left">
                                      <span className="text-[9px] font-black uppercase text-[#2C2625]/40 tracking-wider block">Common Deadline</span>
                                      <span className="text-[12px] font-black text-[#2C2625] uppercase tracking-wider">Marks Entry Due Date</span>
                                    </div>
                                  </div>
                                  <div className="w-full sm:w-48">
                                    <Input
                                      type="date"
                                      value={assignForm.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                      onChange={(e) => {
                                        const commonDate = e.target.value;
                                        setAssignForm(prev => {
                                          const updatedSections = { ...prev.sections };
                                          Object.keys(updatedSections).forEach(sec => {
                                            updatedSections[sec] = {
                                              ...updatedSections[sec],
                                              dueDate: commonDate
                                            };
                                          });
                                          return {
                                            ...prev,
                                            dueDate: commonDate,
                                            sections: updatedSections
                                          };
                                        });
                                      }}
                                      className="h-10 rounded-xl border-[#E9E1D5] bg-white text-xs font-black px-4 focus:border-[#C37A67] cursor-pointer w-full shadow-2xs"
                                    />
                                  </div>
                                </div>

                                {/* Section Cards List */}
                                <div className="space-y-4 pb-12 px-0.5">
                                  {activeSections.map(sec => {
                                    const currentAssign = assignForm.sections?.[sec] || { teacher: '', practicalTeacher: '', dueDate: assignForm.dueDate };
                                    const subjObj = selectedExam?.subjectsList?.find(s => s.name === assigningSubject);
                                    const showPractical = subjObj?.hasPractical ?? false;
                                    const dropdownKey = `${assigningSubject}-${sec}`;

                                    return (
                                      <div key={sec} className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-[#FDFBF7] border border-[#E9E1D5]/80 shadow-2xs space-y-3.5 sm:space-y-4 hover:border-[#C37A67]/40 transition-all duration-300 relative">
                                        {/* Card Header: Section Badge & Title */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E9E1D5]/40">
                                          <div className="flex items-center gap-1.5 sm:gap-2">
                                            <span className="text-[9px] sm:text-[10px] font-black text-white bg-[#C37A67] px-2.5 sm:px-3.5 py-1 rounded-lg sm:rounded-xl uppercase tracking-wider">
                                              Section {sec}
                                            </span>
                                            <span className="text-[8px] sm:text-[9px] font-bold text-[#2C2625]/40 uppercase tracking-widest">
                                              Evaluator Setup
                                            </span>
                                          </div>
                                          <span className="text-[7.5px] sm:text-[8.5px] font-black text-[#C37A67] bg-[#C37A67]/10 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg uppercase tracking-wider">
                                            Active Classroom
                                          </span>
                                        </div>

                                        {/* Dropdowns Layout in Balanced Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          {/* Theory Evaluator Dropdown */}
                                          {subjObj?.hasTheory !== false && (
                                            <div className="flex flex-col gap-1.5 text-left">
                                              <span className="text-[8px] font-black text-[#C37A67] uppercase tracking-widest ml-1 block">
                                                Theory Evaluator
                                              </span>
                                              <div className="relative evaluator-dropdown-container">
                                                <button
                                                  type="button"
                                                  onClick={() => setOpenDropdownSection(openDropdownSection === `${dropdownKey}-theory` ? null : `${dropdownKey}-theory`)}
                                                  className="w-full h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border border-[#E9E1D5] bg-white text-[10px] sm:text-[11px] font-black text-[#2C2625] hover:border-[#C37A67] transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                                                >
                                                  <span className="truncate">
                                                    {currentAssign.teacher || "Select Theory Teacher"}
                                                  </span>
                                                  <ChevronDown className={cn("w-4 h-4 text-[#C37A67] transition-transform duration-300", openDropdownSection === `${dropdownKey}-theory` && "rotate-180")} />
                                                </button>

                                                {/* Theory absolute dropdown */}
                                                {openDropdownSection === `${dropdownKey}-theory` && (
                                                  <div className="absolute z-50 top-full mt-1.5 left-0 right-0 max-h-40 overflow-y-auto rounded-[20px] bg-white border border-[#E9E1D5] shadow-xl p-1.5 animate-in slide-in-from-top-2 duration-200">
                                                    <div
                                                      onClick={() => {
                                                        setAssignForm(prev => ({
                                                          ...prev,
                                                          sections: {
                                                            ...prev.sections,
                                                            [sec]: {
                                                              ...prev.sections?.[sec],
                                                              teacher: '',
                                                              dueDate: prev.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                            }
                                                          }
                                                        }));
                                                        setOpenDropdownSection(null);
                                                      }}
                                                      className="w-full px-3 py-2 text-[10px] font-black text-[#2C2625]/40 hover:bg-[#C37A67]/5 hover:text-[#C37A67] rounded-xl transition-all text-left cursor-pointer uppercase tracking-wider"
                                                    >
                                                      -- Choose Theory Teacher --
                                                    </div>
                                                    {allClassroomTeachers.map(t => {
                                                      const isSelected = currentAssign.teacher === t.name;
                                                      return (
                                                        <div
                                                          key={`${t.name}-${t.dept}-theory`}
                                                          onClick={() => {
                                                            setAssignForm(prev => ({
                                                              ...prev,
                                                              sections: {
                                                                ...prev.sections,
                                                                [sec]: {
                                                                  ...prev.sections?.[sec],
                                                                  teacher: t.name,
                                                                  dueDate: prev.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                                }
                                                              }
                                                            }));
                                                            setOpenDropdownSection(null);
                                                          }}
                                                          className={cn(
                                                            "w-full px-3 py-2 text-[11px] font-bold rounded-xl transition-all text-left cursor-pointer flex items-center justify-between",
                                                            isSelected
                                                              ? "bg-[#C37A67]/10 text-[#C37A67] font-black"
                                                              : "text-[#2C2625] hover:bg-[#C37A67]/5 hover:text-[#C37A67]"
                                                          )}
                                                        >
                                                          <span>{t.name} <span className="opacity-40 font-normal">({t.dept})</span></span>
                                                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C37A67]" />}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* Practical Evaluator Dropdown */}
                                          {showPractical && (
                                            <div className="flex flex-col gap-1.5 text-left">
                                              <span className="text-[8px] font-black text-[#88AC88] uppercase tracking-widest ml-1 block">
                                                Practical Evaluator
                                              </span>
                                              <div className="relative evaluator-dropdown-container">
                                                <button
                                                  type="button"
                                                  onClick={() => setOpenDropdownSection(openDropdownSection === `${dropdownKey}-practical` ? null : `${dropdownKey}-practical`)}
                                                  className="w-full h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border border-[#E9E1D5] bg-white text-[10px] sm:text-[11px] font-black text-[#2C2625] hover:border-[#88AC88] transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                                                >
                                                  <span className="truncate">
                                                    {currentAssign.practicalTeacher || currentAssign.teacher || "Select Practical Teacher"}
                                                  </span>
                                                  <ChevronDown className={cn("w-4 h-4 text-[#88AC88] transition-transform duration-300", openDropdownSection === `${dropdownKey}-practical` && "rotate-180")} />
                                                </button>

                                                {/* Practical absolute dropdown */}
                                                {openDropdownSection === `${dropdownKey}-practical` && (
                                                  <div className="absolute z-50 top-full mt-1.5 left-0 right-0 max-h-40 overflow-y-auto rounded-[20px] bg-white border border-[#E9E1D5] shadow-xl p-1.5 animate-in slide-in-from-top-2 duration-200">
                                                    <div
                                                      onClick={() => {
                                                        setAssignForm(prev => ({
                                                          ...prev,
                                                          sections: {
                                                            ...prev.sections,
                                                            [sec]: {
                                                              teacher: prev.sections?.[sec]?.teacher || '',
                                                              practicalTeacher: '',
                                                              dueDate: prev.sections?.[sec]?.dueDate || prev.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                            }
                                                          }
                                                        }));
                                                        setOpenDropdownSection(null);
                                                      }}
                                                      className="w-full px-3 py-2 text-[10px] font-black text-[#88AC88]/40 hover:bg-[#88AC88]/5 hover:text-[#88AC88] rounded-xl transition-all text-left cursor-pointer uppercase tracking-wider"
                                                    >
                                                      -- Choose Practical Teacher --
                                                    </div>
                                                    {allClassroomTeachers.map(t => {
                                                      const isSelected = currentAssign.practicalTeacher === t.name;
                                                      return (
                                                        <div
                                                          key={`${t.name}-${t.dept}-practical`}
                                                          onClick={() => {
                                                            setAssignForm(prev => ({
                                                              ...prev,
                                                              sections: {
                                                                ...prev.sections,
                                                                [sec]: {
                                                                  teacher: prev.sections?.[sec]?.teacher || '',
                                                                  practicalTeacher: t.name,
                                                                  dueDate: prev.sections?.[sec]?.dueDate || prev.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                                                }
                                                              }
                                                            }));
                                                            setOpenDropdownSection(null);
                                                          }}
                                                          className={cn(
                                                            "w-full px-3 py-2 text-[11px] font-bold rounded-xl transition-all text-left cursor-pointer flex items-center justify-between",
                                                            isSelected
                                                              ? "bg-[#88AC88]/10 text-[#88AC88] font-black"
                                                              : "text-[#2C2625] hover:bg-[#88AC88]/5 hover:text-[#88AC88]"
                                                          )}
                                                        >
                                                          <span>{t.name} <span className="opacity-40 font-normal">({t.dept})</span></span>
                                                          {isSelected && <Check className="w-3.5 h-3.5 text-[#88AC88]" />}
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </Modal>
                          );
                        })()}
                      </div>
                    )}

                    {activeTab === 'Marks Entry' && (() => {
                      const conductedSubjects = (selectedExam?.subjectsList || []).filter(s => {
                        const status = getSubjectStatus(s.date, s.startTime, s.endTime, s.status);
                        return status === 'Conducted' || status === 'Completed';
                      });

                      if (conductedSubjects.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center p-12 text-center bg-[#FDFBF7] border border-[#E9E1D5] rounded-[40px] space-y-4 shadow-sm">
                            <AlertTriangle className="w-12 h-12 text-[#C37A67]" />
                            <h3 className="text-lg font-black text-[#2C2625] uppercase tracking-tight">No Conducted Papers Available</h3>
                            <p className="text-xs font-bold text-[#2C2625]/40 max-w-sm uppercase tracking-wider leading-relaxed text-center">
                              Subject papers must be fully conducted (exam date and time has passed) before marks evaluation can be entered and locked!
                            </p>
                          </div>
                        );
                      }

                      const activeSubName = activeMarksSubject || conductedSubjects[0]?.name;
                      const activeSubj = conductedSubjects.find(s => s.name === activeSubName) || conductedSubjects[0];
                      const targetSections = selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
                      const activeSec = activeMarksSection || targetSections[0];



                      const currentSubj = marksViewMode === 'teacher'
                        ? (activeTeacherDuty ? activeTeacherDuty.subjectObj : activeSubj)
                        : activeSubj;

                      const currentSec = marksViewMode === 'teacher'
                        ? (activeTeacherDuty ? activeTeacherDuty.section : activeSec)
                        : activeSec;

                      const currentSecData = currentSubj?.sectionAssignments?.[currentSec] || (currentSubj ? {
                        teacher: currentSubj.teacher,
                        practicalTeacher: currentSubj.teacher,
                        dueDate: currentSubj.marksDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        marksSubmitted: false,
                        theoryMarksSubmitted: false,
                        practicalMarksSubmitted: false,
                        studentMarks: {},
                      } : undefined);

                      const schema = {
                        hasTheory: currentSubj?.hasTheory !== false,
                        theoryMax: currentSubj?.theoryMax ?? 100,
                        hasPractical: !!currentSubj?.hasPractical,
                        practicalMax: currentSubj?.practicalMax ?? 0,
                        hasInternals: false,
                        internalMax: 0,
                        totalMax: (currentSubj?.hasTheory !== false ? (currentSubj?.theoryMax ?? 100) : 0) + (currentSubj?.hasPractical ? (currentSubj?.practicalMax ?? 0) : 0)
                      };

                      const internalActivities = buildInternalActivityBlueprint(currentSubj?.name || '', schema.internalMax);
                      const teacherCanEnterTheory = marksViewMode === 'teacher' ? !!activeTeacherDuty?.canEnterTheory : !!schema.hasTheory;
                      const teacherCanEnterPractical = marksViewMode === 'teacher' ? !!activeTeacherDuty?.canEnterPractical : !!schema.hasPractical;
                      const theorySubmitted = getSectionTheorySubmitted(currentSubj, currentSecData);
                      const practicalSubmitted = getSectionPracticalSubmitted(currentSubj, currentSecData);
                      const showTheoryColumn = !!schema.hasTheory && (marksViewMode === 'admin' || teacherCanEnterTheory);
                      const showPracticalColumn = !!schema.hasPractical && (marksViewMode === 'admin' || teacherCanEnterPractical);
                      const canSubmitMarks = marksViewMode === 'teacher' && (
                        (teacherCanEnterTheory && !theorySubmitted) ||
                        (teacherCanEnterPractical && !practicalSubmitted)
                      );

                      const sectionStudents = studentsPerformance.filter(student => {
                        return getSectionFromRoll(student.roll) === currentSec;
                      });

                      const getInternalBreakdown = (studentRoll: string) => {
                        if (schema.internalMax <= 0) return null;
                        const existing = currentSecData?.studentMarks?.[studentRoll]?.internal;
                        if (existing) return existing;
                        const student = studentsPerformance.find(s => s.roll === studentRoll) || { marks: 75 };
                        return buildSeededInternalMarks(studentRoll, currentSubj?.name || '', schema.internalMax, student.marks / 100) || null;
                      };

                      return (
                        <div className="space-y-6 animate-in fade-in duration-500 text-left">




                          {/* Standard Admin Selectors (only visible in Admin consolidated mode) */}
                          {marksViewMode === 'admin' && (
                            <div className="flex flex-col gap-5 bg-[#FDFBF7] border border-[#E9E1D5] p-6 rounded-[32px] shadow-sm w-full">
                              {/* Row 1: Paper Selector & Target Sections Switching */}
                              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
                                {/* Left: Paper Selector */}
                                <div className="text-left w-full sm:max-w-xs">
                                  <Select
                                    label="Select Conducted Paper"
                                    options={conductedSubjects.map(s => ({ label: `${s.name} (Paper)`, value: s.name }))}
                                    value={activeSubName}
                                    onChange={(val) => setActiveMarksSubject(val)}
                                    className="min-w-[220px]"
                                  />
                                </div>

                                {/* Right: Section Switcher */}
                                <div className="space-y-2 text-left w-full sm:w-auto">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-[#2C2625]/40 block">Target Sections Switching</label>
                                  <div className="grid grid-cols-3 items-center gap-1.5 overflow-hidden bg-[#2C2625]/5 p-1 rounded-xl w-full sm:flex sm:w-fit sm:overflow-x-auto scrollbar-hide">
                                    {targetSections.map(sec => (
                                      <Button
                                        key={sec}
                                        type="button"
                                        onClick={() => setActiveMarksSection(sec)}
                                        className={cn(
                                          "h-8 min-w-0 rounded-lg px-2 sm:px-4 text-[8px] sm:text-[9px] font-black uppercase tracking-wider transition-all border-none shadow-none",
                                          activeSec === sec
                                            ? "bg-[#C37A67] text-white shadow-sm"
                                            : "bg-transparent text-[#2C2625]/60 hover:text-[#2C2625]"
                                        )}
                                      >
                                        Section {sec}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Row 2: Evaluator and Due Date Cards (aligned directly below dropdown) */}
                              {currentSecData && (
                                <div className="flex flex-row gap-2 text-left shrink-0">
                                  <div className="p-2.5 bg-[#2C2625]/5 rounded-xl border border-[#E9E1D5]/40 min-w-[110px] sm:min-w-[125px]">
                                    <span className="text-[8px] font-black uppercase text-[#2C2625]/40 tracking-wider block leading-none mb-1">Theory Evaluator</span>
                                    <span className="text-[10px] font-black text-[#2C2625] leading-none block">{currentSecData.teacher || "Unassigned"}</span>
                                  </div>
                                  {schema.hasPractical && (
                                    <div className="p-2.5 bg-[#2C2625]/5 rounded-xl border border-[#E9E1D5]/40 min-w-[110px] sm:min-w-[125px]">
                                      <span className="text-[8px] font-black uppercase text-[#2C2625]/40 tracking-wider block leading-none mb-1">Practical Evaluator</span>
                                      <span className="text-[10px] font-black text-[#2C2625] leading-none block">{currentSecData.practicalTeacher || currentSecData.teacher || "Unassigned"}</span>
                                    </div>
                                  )}
                                  <div className="p-2.5 bg-[#2C2625]/5 rounded-xl border border-[#E9E1D5]/40 min-w-[90px] sm:min-w-[105px]">
                                    <span className="text-[8px] font-black uppercase text-[#2C2625]/40 tracking-wider block leading-none mb-1">Due Date</span>
                                    <span className="text-[10px] font-black text-[#C37A67] leading-none block">{currentSecData.dueDate || "No deadline"}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Evaluation Grid Controls & Status */}
                          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-left">
                              <h3 className="text-2xl font-black text-[#2C2625]">
                                Consolidated Marks Sheet
                              </h3>
                              <p className="text-xs font-bold text-[#2C2625]/40 uppercase tracking-widest mt-1">
                                {currentSubj?.name} • Section {currentSec} (Class {selectedExam?.className})
                              </p>
                            </div>
                            <div className="flex w-full items-center gap-3 sm:w-auto">
                              {marksViewMode === 'teacher' && (
                                <Button
                                  onClick={handleSaveAndLockMarks}
                                  disabled={!canSubmitMarks}
                                  className={cn(
                                    "h-11 w-full rounded-2xl text-white px-6 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all border-none sm:w-auto",
                                    !canSubmitMarks
                                      ? "bg-[#88AC88]/50 text-white cursor-not-allowed shadow-none"
                                      : "bg-[#88AC88] hover:bg-[#88AC88]/90 shadow-[#88AC88]/20"
                                  )}
                                >
                                  <ShieldCheck className="mr-2 h-4.5 w-4.5" />
                                  {!canSubmitMarks ? "Marks Submitted" : "Save & Submit Marks"}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Consolidated Evaluation Table */}
                          <div className="space-y-3 lg:hidden">
                            {sectionStudents.map((student) => {
                              const m = marksForm[student.roll] || { theory: '', practical: '' };
                              const theoryNum = parseInt(m.theory) || 0;
                              const practicalNum = parseInt(m.practical) || 0;
                              const breakdown = getInternalBreakdown(student.roll);
                              const internalMarks = breakdown ? breakdown.total : 0;
                              const totalObtained = (schema.hasTheory ? theoryNum : 0) + (schema.hasPractical ? practicalNum : 0) + internalMarks;
                              const passed = Number(totalObtained) >= Number(currentSubj?.passing ?? Math.round(schema.totalMax * 0.35));

                              return (
                                <div key={student.roll} className="rounded-[28px] border border-[#E9E1D5]/70 bg-[#FDFBF7] p-4 shadow-sm">
                                  <div className="flex items-start justify-between gap-3 border-b border-[#E9E1D5]/50 pb-3">
                                    <div className="min-w-0">
                                      <span className="block text-sm font-black leading-tight text-[#2C2625]">{student.name}</span>
                                      <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.18em] text-[#2C2625]/35">{student.roll}</span>
                                    </div>
                                    <div className={cn(
                                      "shrink-0 rounded-2xl px-3 py-2 text-right",
                                      passed ? "bg-[#88AC88]/10 text-[#88AC88]" : "bg-[#E63946]/10 text-[#E63946]"
                                    )}>
                                      <span className="block text-[8px] font-black uppercase tracking-widest opacity-70">Total</span>
                                      <span className="block text-xs font-black">{totalObtained} / {schema.totalMax}</span>
                                      <span className="block text-[8px] font-black uppercase mt-0.5">{passed ? "Passed" : "Failed"}</span>
                                    </div>
                                  </div>

                                  <div className={cn(
                                    "mt-4 grid grid-cols-1 gap-3",
                                    showTheoryColumn && showPracticalColumn && "sm:grid-cols-2"
                                  )}>
                                    {showTheoryColumn && (
                                      <div className="rounded-2xl border border-[#E9E1D5]/60 bg-white p-3">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/40">Theory</span>
                                          <span className="text-[9px] font-black text-[#C37A67]">Max {schema.theoryMax}</span>
                                        </div>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={schema.theoryMax}
                                          disabled={marksViewMode === 'admin' || !teacherCanEnterTheory || theorySubmitted}
                                          value={m.theory}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || (Number(val) >= 0 && Number(val) <= schema.theoryMax)) {
                                              setMarksForm(prev => ({
                                                ...prev,
                                                [student.roll]: {
                                                  theory: val,
                                                  practical: prev[student.roll]?.practical || ''
                                                }
                                              }));
                                            }
                                          }}
                                          placeholder="-"
                                          className={cn(
                                            "h-11 w-full rounded-xl text-center font-black",
                                            "border-[#E9E1D5] bg-white disabled:bg-[#E9E1D5]/20 disabled:text-[#2C2625]/70"
                                          )}
                                        />
                                      </div>
                                    )}

                                    {showPracticalColumn && (
                                      <div className="rounded-2xl border border-[#E9E1D5]/60 bg-white p-3">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/40">Practical</span>
                                          <span className="text-[9px] font-black text-[#88AC88]">Max {schema.practicalMax}</span>
                                        </div>
                                        <Input
                                          type="number"
                                          min="0"
                                          max={schema.practicalMax}
                                          disabled={marksViewMode === 'admin' || !teacherCanEnterPractical || practicalSubmitted}
                                          value={m.practical}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || (Number(val) >= 0 && Number(val) <= schema.practicalMax)) {
                                              setMarksForm(prev => ({
                                                ...prev,
                                                [student.roll]: {
                                                  theory: prev[student.roll]?.theory || '',
                                                  practical: val
                                                }
                                              }));
                                            }
                                          }}
                                          placeholder="-"
                                          className={cn(
                                            "h-11 w-full rounded-xl text-center font-black",
                                            "border-[#E9E1D5] bg-white disabled:bg-[#E9E1D5]/20 disabled:text-[#2C2625]/70"
                                          )}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {schema.internalMax > 0 && (
                                    <div className="mt-3 rounded-2xl border border-[#88AC88]/15 bg-[#88AC88]/5 p-3">
                                      {breakdown ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/40">LMS Internals</span>
                                            <span className="text-[10px] font-black text-[#88AC88]">{breakdown.total} / {schema.internalMax}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                                            {internalActivities.map((activity) => (
                                              <span key={`${student.roll}-${activity.id}`} className="rounded-lg bg-white px-1.5 py-1 text-center text-[8px] font-black uppercase text-[#2C2625]/50">
                                                {activity.shortLabel} {(breakdown.activities[activity.id] || 0)}/{activity.maxMarks}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/30">No internal sync available</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="hidden overflow-x-auto rounded-[32px] border border-[#E9E1D5]/60 bg-[#FDFBF7]/30 lg:block">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-[#2C2625] text-white text-[10px] font-black uppercase tracking-widest">
                                  <th className="px-8 py-5">Roll No</th>
                                  <th className="px-8 py-5">Student Candidate</th>
                                  {showTheoryColumn && (
                                    <th className="px-8 py-5 text-center">
                                      <div className="flex flex-col items-center">
                                        <span>Theory (Max {schema.theoryMax})</span>
                                        {currentSecData?.teacher && (
                                          <span className="text-[7.5px] font-bold text-white/55 lowercase bg-white/10 px-1.5 py-0.5 rounded mt-0.5 tracking-wider block">
                                            Evaluator: {currentSecData.teacher}
                                          </span>
                                        )}
                                      </div>
                                    </th>
                                  )}
                                  {showPracticalColumn && (
                                    <th className="px-8 py-5 text-center">
                                      <div className="flex flex-col items-center">
                                        <span>Practical (Max {schema.practicalMax})</span>
                                        {(currentSecData?.practicalTeacher || currentSecData?.teacher) && (
                                          <span className="text-[7.5px] font-bold text-white/55 lowercase bg-white/10 px-1.5 py-0.5 rounded mt-0.5 tracking-wider block">
                                            Evaluator: {currentSecData.practicalTeacher || currentSecData.teacher}
                                          </span>
                                        )}
                                      </div>
                                    </th>
                                  )}
                                  {schema.internalMax > 0 && (
                                    <th className="px-8 py-5 text-center">LMS Internals (Max {schema.internalMax})</th>
                                  )}
                                  <th className="px-8 py-5 text-right">Obtained Marks ({schema.totalMax})</th>
                                  <th className="px-8 py-5 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E9E1D5]/40">
                                {sectionStudents.map((student) => {
                                  const m = marksForm[student.roll] || { theory: '', practical: '' };
                                  const theoryNum = parseInt(m.theory) || 0;
                                  const practicalNum = parseInt(m.practical) || 0;

                                  const breakdown = getInternalBreakdown(student.roll);
                                  const internalMarks = breakdown ? breakdown.total : 0;

                                  const totalObtained = (schema.hasTheory ? theoryNum : 0) + (schema.hasPractical ? practicalNum : 0) + internalMarks;

                                  return (
                                    <tr key={student.roll} className="hover:bg-white transition-colors">
                                      <td className="px-8 py-5 text-[11px] font-black text-[#2C2625]/40">{student.roll}</td>
                                      <td className="px-8 py-5 text-[11px] font-black text-[#2C2625]">{student.name}</td>

                                      {/* Theory Mark Input */}
                                      {showTheoryColumn && (
                                        <td className="px-8 py-5">
                                          <Input
                                            type="number"
                                            min="0"
                                            max={schema.theoryMax}
                                            disabled={marksViewMode === 'admin' || !teacherCanEnterTheory || theorySubmitted}
                                            value={m.theory}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (val === '' || (Number(val) >= 0 && Number(val) <= schema.theoryMax)) {
                                                setMarksForm(prev => ({
                                                  ...prev,
                                                  [student.roll]: {
                                                    theory: val,
                                                    practical: prev[student.roll]?.practical || ''
                                                  }
                                                }));
                                              }
                                            }}
                                            placeholder={schema.hasTheory ? '—' : 'N/A'}
                                            className={cn(
                                              "mx-auto w-24 h-10 text-center font-black rounded-xl",
                                              schema.hasTheory
                                                ? "border-[#E9E1D5] bg-white disabled:bg-[#E9E1D5]/20 disabled:text-[#2C2625]/70"
                                                : "border-[#E9E1D5]/40 bg-[#2C2625]/5 text-[#2C2625]/30 cursor-not-allowed shadow-none"
                                            )}
                                          />
                                        </td>
                                      )}

                                      {/* Practical Mark Input */}
                                      {showPracticalColumn && (
                                        <td className="px-8 py-5">
                                          <Input
                                            type="number"
                                            min="0"
                                            max={schema.practicalMax}
                                            disabled={marksViewMode === 'admin' || !teacherCanEnterPractical || practicalSubmitted}
                                            value={m.practical}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (val === '' || (Number(val) >= 0 && Number(val) <= schema.practicalMax)) {
                                                setMarksForm(prev => ({
                                                  ...prev,
                                                  [student.roll]: {
                                                    theory: prev[student.roll]?.theory || '',
                                                    practical: val
                                                  }
                                                }));
                                              }
                                            }}
                                            placeholder={schema.hasPractical ? '—' : 'N/A'}
                                            className={cn(
                                              "mx-auto w-24 h-10 text-center font-black rounded-xl",
                                              schema.hasPractical
                                                ? "border-[#E9E1D5] bg-white disabled:bg-[#E9E1D5]/20 disabled:text-[#2C2625]/70"
                                                : "border-[#E9E1D5]/40 bg-[#2C2625]/5 text-[#2C2625]/30 cursor-not-allowed shadow-none"
                                            )}
                                          />
                                        </td>
                                      )}

                                      {/* LMS Continuous Internals Breakdown Sync */}
                                      {schema.internalMax > 0 && (
                                        <td className="px-8 py-5 text-center min-w-[280px]">
                                          {breakdown ? (
                                            <div className="flex flex-col items-center gap-1.5">
                                              <span className="px-3 py-1 rounded-xl bg-[#88AC88]/10 text-[#88AC88] border border-[#88AC88]/20 text-[9px] font-black uppercase tracking-wider block">
                                                Obtained: {breakdown.total} / {schema.internalMax}
                                              </span>
                                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                {internalActivities.map((activity) => (
                                                  <span key={`${student.roll}-desktop-${activity.id}`} className="px-1.5 py-0.5 rounded-md bg-[#2C2625]/5 text-[#2C2625]/50 text-[8px] font-black uppercase" title={`${activity.label} Marks`}>
                                                    {activity.shortLabel}: {(breakdown.activities[activity.id] || 0)}/{activity.maxMarks}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-[#2C2625]/30 font-bold">—</span>
                                          )}
                                        </td>
                                      )}

                                      {/* Cumulative Grand Total */}
                                      <td className="px-8 py-5 text-right">
                                        <span className={cn("text-xs font-black", Number(totalObtained) < Number(currentSubj?.passing ?? Math.round(schema.totalMax * 0.35)) ? "text-[#E63946]" : "text-[#88AC88]")}>
                                          {totalObtained} / {schema.totalMax}
                                        </span>
                                      </td>
                                      <td className="px-8 py-5 text-right">
                                        <Badge className={cn(
                                          "border-none px-2.5 py-1 text-[8px] font-black uppercase rounded-lg",
                                          Number(totalObtained) >= Number(currentSubj?.passing ?? Math.round(schema.totalMax * 0.35)) ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                                        )}>
                                          {Number(totalObtained) >= Number(currentSubj?.passing ?? Math.round(schema.totalMax * 0.35)) ? "Passed" : "Failed"}
                                        </Badge>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}

                    {activeTab === 'Grading Rules' && (
                      <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-2xl font-black text-[#2C2625]">Policy Setup</h3>
                          <Badge className="bg-[#2C2625] text-white border-none px-4 py-1.5 text-[9px] font-black uppercase rounded-xl">Current: GPA 4.0 Scale</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {gradingRules.map((rule, idx) => (
                            <div key={idx} className="p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] bg-[#FDFBF7] border border-[#E9E1D5] space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-3xl font-black text-[#C37A67]">{rule.grade}</span>
                                <span className="text-xs font-black text-[#2C2625]/40 uppercase tracking-widest">{rule.gpa} GPA</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-[#2C2625]/30 uppercase tracking-widest">Mark Range</p>
                                <p className="text-sm font-black text-[#2C2625]">{rule.range}%</p>
                              </div>
                              <p className="text-[10px] font-bold text-[#2C2625]/50 italic">{rule.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'Results' && (
                      selectedExam?.status === 'Completed' ? (() => {
                        const targetSections = selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];

                        const sectionStudents = studentsPerformance.filter(student => {
                          return getSectionFromRoll(student.roll) === selectedResultSection;
                        });

                        const sectionStudentsData = sectionStudents.map(student => {
                          let totalObtainedAll = 0;
                          let totalMaxAll = 0;
                          let hasFailedAny = false;

                          const subjectsPerformance = (selectedExam.subjectsList || []).map(subj => {
                            const secData = subj.sectionAssignments?.[selectedResultSection];
                            const studentMarks = secData?.studentMarks?.[student.roll];

                            let theoryObtained = 0;
                            let practicalObtained = 0;

                            const hasTheory = subj.hasTheory !== false;
                            const theoryMax = subj.theoryMax ?? 100;
                            const hasPractical = !!subj.hasPractical;
                            const practicalMax = subj.practicalMax ?? 0;
                            const totalMax = (hasTheory ? theoryMax : 0) + (hasPractical ? practicalMax : 0);

                            if (studentMarks) {
                              theoryObtained = Number(studentMarks.theory) || 0;
                              practicalObtained = Number(studentMarks.practical) || 0;
                            } else {
                              const studentRoll = student.roll;
                              const studentSeed = studentRoll.split('-')[1] || '001';
                              const studentNum = parseInt(studentSeed) || 1;
                              const studentRatio = 1 - ((studentNum - 1) * 0.08);

                              if (hasTheory) {
                                theoryObtained = Math.round(theoryMax * studentRatio);
                              }
                              if (hasPractical) {
                                practicalObtained = Math.round(practicalMax * studentRatio);
                              }
                            }

                            const totalObtained = theoryObtained + practicalObtained;
                            const passed = Number(totalObtained) >= Number(subj.passing ?? Math.round(totalMax * 0.35));

                            if (!passed) hasFailedAny = true;

                            totalObtainedAll += totalObtained;
                            totalMaxAll += totalMax;

                            let grade = 'F';
                            const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                            if (pct >= 90) grade = 'A+';
                            else if (pct >= 80) grade = 'A';
                            else if (pct >= 70) grade = 'B';
                            else if (pct >= 60) grade = 'C';
                            else if (pct >= 50) grade = 'D';
                            else if (pct >= 35) grade = 'E';

                            return {
                              subjectName: subj.name,
                              theory: theoryObtained,
                              theoryMax,
                              hasTheory,
                              practical: practicalObtained,
                              practicalMax,
                              hasPractical,
                              totalObtained,
                              totalMax,
                              grade,
                              passed
                            };
                          });

                          const percentage = totalMaxAll > 0 ? Math.round((totalObtainedAll / totalMaxAll) * 100) : 0;

                          let overallGrade = 'F';
                          if (percentage >= 90) overallGrade = 'A+';
                          else if (percentage >= 80) overallGrade = 'A';
                          else if (percentage >= 70) overallGrade = 'B';
                          else if (percentage >= 60) overallGrade = 'C';
                          else if (percentage >= 50) overallGrade = 'D';
                          else if (percentage >= 35) overallGrade = 'E';

                          return {
                            roll: student.roll,
                            name: student.name,
                            subjects: subjectsPerformance,
                            totalObtained: totalObtainedAll,
                            totalMax: totalMaxAll,
                            percentage,
                            grade: overallGrade,
                            status: hasFailedAny ? 'Failed' : 'Passed'
                          };
                        });

                        const sortedStudents = sectionStudentsData.slice().sort((a, b) => b.totalObtained - a.totalObtained);

                        if (selectedResultStudentRoll) {
                          const currentStudent = sortedStudents.find(s => s.roll === selectedResultStudentRoll);
                          if (!currentStudent) {
                            setSelectedResultStudentRoll(null);
                            return null;
                          }

                          const studentRank = sortedStudents.findIndex(s => s.roll === selectedResultStudentRoll) + 1;

                          return (
                            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                  type="button"
                                  onClick={() => setSelectedResultStudentRoll(null)}
                                  className="flex items-center gap-2 text-xs font-black uppercase text-[#2C2625]/60 hover:text-[#2C2625]"
                                >
                                  <ArrowLeft className="w-4 h-4" /> Back to Section Results
                                </button>

                                <div className="grid grid-cols-2 gap-2 sm:flex">
                                  <Button size="sm" variant="outline" className="rounded-xl border-[#E9E1D5] text-[10px] font-black uppercase">
                                    <BarChart3 className="mr-2 h-4 w-4" /> Export Report
                                  </Button>
                                  <Button size="sm" className="rounded-xl bg-[#2C2625] text-white text-[10px] font-black uppercase" onClick={() => window.print()}>
                                    <Printer className="mr-2 h-4 w-4" /> Print Sheet
                                  </Button>
                                </div>
                              </div>

                              <div className="p-6 sm:p-8 rounded-[32px] bg-[#FDFBF7] border border-[#E9E1D5] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                  <span className="text-[10px] font-black uppercase text-[#C37A67] tracking-widest block">Student Result Sheet</span>
                                  <h4 className="text-2xl font-black text-[#2C2625]">{currentStudent.name}</h4>
                                  <div className="flex items-center gap-3 text-xs font-bold text-[#2C2625]/50 uppercase tracking-wider">
                                    <span>Roll: {currentStudent.roll}</span>
                                    <span>•</span>
                                    <span>Class: {selectedExam.className}</span>
                                    <span>•</span>
                                    <span>Section: {selectedResultSection}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Section Rank</span>
                                    <span className="text-lg font-black text-[#C37A67]">#{studentRank} of {sortedStudents.length}</span>
                                  </div>
                                  <Badge className={cn(
                                    "border-none px-4 py-2 text-[10px] font-black uppercase rounded-xl",
                                    currentStudent.status === 'Passed' ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                                  )}>
                                    {currentStudent.status}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="p-6 rounded-[28px] bg-white border border-[#E9E1D5] shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/40">Aggregate Score</span>
                                  <span className="text-3xl font-black text-[#2C2625]">{currentStudent.totalObtained} / {currentStudent.totalMax}</span>
                                  <div className="w-full bg-[#E9E1D5]/40 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div className="bg-[#C37A67] h-full" style={{ width: `${currentStudent.percentage}%` }} />
                                  </div>
                                </div>

                                <div className="p-6 rounded-[28px] bg-white border border-[#E9E1D5] shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/40">Cumulative Percentage</span>
                                  <span className="text-3xl font-black text-[#C37A67]">{currentStudent.percentage}%</span>
                                  <span className="text-[9px] font-bold text-[#2C2625]/30">Out of 100% aggregate</span>
                                </div>

                                <div className="p-6 rounded-[28px] bg-white border border-[#E9E1D5] shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/40">Overall Grade</span>
                                  <span className="text-3xl font-black text-[#88AC88]">{currentStudent.grade}</span>
                                  <span className="text-[9px] font-bold text-[#2C2625]/30">Evaluated on absolute grading scale</span>
                                </div>
                              </div>

                              <div className="space-y-4 pt-2">
                                <h5 className="text-sm font-black text-[#2C2625] uppercase tracking-wider">Subject-wise Academic Performance</h5>

                                <div className="space-y-3 lg:hidden">
                                  {currentStudent.subjects.map((subj, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E9E1D5] space-y-3 shadow-sm text-left">
                                      <div className="flex items-center justify-between border-b border-[#E9E1D5]/40 pb-2">
                                        <span className="text-sm font-black text-[#2C2625]">{subj.subjectName}</span>
                                        <Badge className={cn(
                                          "border-none px-2 py-0.5 text-[7.5px] font-black uppercase rounded",
                                          subj.passed ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                                        )}>
                                          {subj.passed ? "Passed" : "Failed"}
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-[#FDFBF7] rounded-xl">
                                          <span className="block text-[7px] font-black uppercase text-[#2C2625]/30">Theory</span>
                                          <span className="block text-[11px] font-black text-[#2C2625]">{subj.hasTheory ? `${subj.theory}/${subj.theoryMax}` : '—'}</span>
                                        </div>
                                        <div className="p-2 bg-[#FDFBF7] rounded-xl">
                                          <span className="block text-[7px] font-black uppercase text-[#2C2625]/30">Practical</span>
                                          <span className="block text-[11px] font-black text-[#2C2625]">{subj.hasPractical ? `${subj.practical}/${subj.practicalMax}` : '—'}</span>
                                        </div>
                                        <div className="p-2 bg-[#FDFBF7] rounded-xl">
                                          <span className="block text-[7px] font-black uppercase text-[#2C2625]/30">Grade</span>
                                          <span className="block text-[11px] font-black text-[#C37A67]">{subj.grade}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-1">
                                        <span className="text-[9px] font-black uppercase text-[#2C2625]/40">Subject Total</span>
                                        <span className="text-xs font-black text-[#2C2625]">{subj.totalObtained} / {subj.totalMax}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="hidden lg:block overflow-hidden rounded-[24px] border border-[#E9E1D5]/60 bg-white">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="bg-[#2C2625] text-white text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4 text-center">Theory Marks</th>
                                        <th className="px-6 py-4 text-center">Practical Marks</th>
                                        <th className="px-6 py-4 text-center">Grade</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Total Marks</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E9E1D5]/40">
                                      {currentStudent.subjects.map((subj, idx) => (
                                        <tr key={idx} className="hover:bg-[#FDFBF7]/50 transition-colors">
                                          <td className="px-6 py-4 text-sm font-black text-[#2C2625]">{subj.subjectName}</td>
                                          <td className="px-6 py-4 text-center text-sm font-bold text-[#2C2625]/70">
                                            {subj.hasTheory ? `${subj.theory} / ${subj.theoryMax}` : '—'}
                                          </td>
                                          <td className="px-6 py-4 text-center text-sm font-bold text-[#2C2625]/70">
                                            {subj.hasPractical ? `${subj.practical} / ${subj.practicalMax}` : '—'}
                                          </td>
                                          <td className="px-6 py-4 text-center text-sm font-black text-[#C37A67]">{subj.grade}</td>
                                          <td className="px-6 py-4 text-center">
                                            <Badge className={cn(
                                              "border-none px-2.5 py-1 text-[8px] font-black uppercase rounded-lg",
                                              subj.passed ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                                            )}>
                                              {subj.passed ? "Passed" : "Failed"}
                                            </Badge>
                                          </td>
                                          <td className="px-6 py-4 text-right text-sm font-black text-[#2C2625]">
                                            {subj.totalObtained} / {subj.totalMax}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-black text-[#2C2625]">Rankings & Merit</h3>
                                <p className="text-[11px] font-bold text-[#2C2625]/40 uppercase tracking-widest">Select a section filter to display corresponding student scores</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2 sm:flex">
                                <Button size="sm" variant="outline" className="rounded-xl border-[#E9E1D5] text-[10px] font-black uppercase">
                                  <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                                </Button>
                                <Button size="sm" className="rounded-xl bg-[#2C2625] text-white text-[10px] font-black uppercase">
                                  <Download className="mr-2 h-4 w-4" /> Merit List
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-[#FDFBF7] border border-[#E9E1D5] p-5 rounded-[28px] shadow-sm">
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-[#2C2625]/40 block">Section Filter</span>
                                <div className="flex items-center gap-1.5 overflow-hidden bg-[#2C2625]/5 p-1 rounded-xl w-fit">
                                  {targetSections.map(sec => (
                                    <Button
                                      key={sec}
                                      type="button"
                                      onClick={() => {
                                        setSelectedResultSection(sec);
                                        setSelectedResultStudentRoll(null);
                                      }}
                                      className={cn(
                                        "h-9 rounded-lg px-4 text-[9px] font-black uppercase tracking-wider transition-all border-none shadow-none",
                                        selectedResultSection === sec
                                          ? "bg-[#C37A67] text-white shadow-sm"
                                          : "bg-transparent text-[#2C2625]/60 hover:text-[#2C2625]"
                                      )}
                                    >
                                      Section {sec}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <span className="text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Total Enrolled</span>
                                  <span className="text-sm font-black text-[#2C2625]">{sortedStudents.length} Students</span>
                                </div>
                                <div className="text-right border-l border-[#E9E1D5] pl-6">
                                  <span className="text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Passing Rate</span>
                                  <span className="text-sm font-black text-[#88AC88]">
                                    {sortedStudents.length > 0
                                      ? `${Math.round((sortedStudents.filter(s => s.status === 'Passed').length / sortedStudents.length) * 100)}%`
                                      : '0%'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {sortedStudents.length > 0 && (
                              <div className="flex flex-row items-end justify-center gap-3 sm:gap-6 mb-10 mt-6 px-2 sm:px-6">
                                {[
                                  // 2nd Place (Left)
                                  {
                                    student: sortedStudents[1],
                                    rank: 2,
                                    blockHeight: 'h-[130px] sm:h-[170px]',
                                    blockColor: 'bg-[#E4B76D]',
                                    imgSize: 'w-18 sm:w-28',
                                    order: 'order-1'
                                  },
                                  // 1st Place (Center — tallest)
                                  {
                                    student: sortedStudents[0],
                                    rank: 1,
                                    blockHeight: 'h-[190px] sm:h-[250px]',
                                    blockColor: 'bg-[#C37A67]',
                                    imgSize: 'w-18 sm:w-28',
                                    order: 'order-2'
                                  },
                                  // 3rd Place (Right)
                                  {
                                    student: sortedStudents[2],
                                    rank: 3,
                                    blockHeight: 'h-[100px] sm:h-[120px]',
                                    blockColor: 'bg-[#88AC88]',
                                    imgSize: 'w-18 sm:w-28',
                                    order: 'order-3'
                                  }
                                ].map((podiumData) => {
                                  if (!podiumData.student) return null;
                                  const { student, rank, blockHeight, blockColor, imgSize, order } = podiumData;
                                  return (
                                    <div
                                      key={rank}
                                      onClick={() => setSelectedResultStudentRoll(student.roll)}
                                      className={cn(
                                        "flex flex-col items-center w-[30%] sm:w-[28%] max-w-[200px] cursor-pointer group",
                                        order
                                      )}
                                    >
                                      {/* Student Info Section (On image head - above the image) */}
                                      <div className="flex flex-col items-center mb-2 text-center transition-transform duration-300 group-hover:-translate-y-2">
                                        {/* Student Name */}
                                        <p className="text-[10px] sm:text-sm font-black text-[#2C2625] truncate w-full px-1 leading-tight">
                                          {student.name}
                                        </p>

                                        {/* Percentage */}
                                        <p className="text-xs sm:text-lg font-black text-[#2C2625] mt-0.5">
                                          {student.percentage}<span className="text-[8px] sm:text-[10px] text-[#2C2625]/50 ml-0.5">%</span>
                                        </p>

                                        {/* Pass/Fail Badge */}
                                        <Badge className={cn(
                                          "mt-1 border-none px-2 py-0.5 text-[6px] sm:text-[8px] font-black uppercase rounded",
                                          student.status === 'Passed' ? "bg-[#88AC88]/15 text-[#88AC88]" : "bg-[#E63946]/15 text-[#E63946]"
                                        )}>
                                          {student.status}
                                        </Badge>
                                      </div>

                                      {/* leaderboard.png illustration — standing directly on top of the block */}
                                      <div className="flex justify-center w-full z-10 -mb-0.5 sm:-mb-1.5 transition-transform duration-300 group-hover:-translate-y-2">
                                        <img
                                          src={['cass cain', 'steph brown', 'emily davis', 'lois lane', 'kara zor-el', 'mary jane', 'gwen stacy'].includes(student.name.toLowerCase()) ? "/leaderboard-female.png" : "/leaderboard.png"}
                                          alt={`Rank ${rank}`}
                                          className={cn("object-contain drop-shadow-sm pointer-events-none", imgSize)}
                                          draggable={false}
                                        />
                                      </div>

                                      {/* Podium Block */}
                                      <div className={cn(
                                        "w-full rounded-t-xl sm:rounded-t-[28px] flex items-start justify-center pt-3 sm:pt-5 relative overflow-hidden transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] group-hover:brightness-105",
                                        blockHeight,
                                        blockColor
                                      )}>
                                        {/* Top highlight */}
                                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/25 rounded-t-xl sm:rounded-t-[28px]" />
                                        {/* Rank Number */}
                                        <span className="text-4xl sm:text-6xl font-black text-white/95 drop-shadow-md">
                                          {rank}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory lg:hidden -mx-4 px-4 scrollbar-thin scrollbar-thumb-[#C37A67]/10">
                              {sortedStudents.map((student, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedResultStudentRoll(student.roll)}
                                  className="snap-center flex-none w-[85%] max-w-[310px] rounded-[26px] border border-[#E9E1D5]/70 bg-[#FDFBF7] p-4 shadow-sm cursor-pointer hover:bg-[#FDFBF7]/85 transition-colors text-left"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3 flex-1">
                                      <div className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black",
                                        idx === 0 ? "bg-[#C37A67] text-white" : "bg-white text-[#2C2625]/50 ring-1 ring-[#E9E1D5]"
                                      )}>
                                        #{idx + 1}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-black text-[#2C2625] break-words leading-tight">{student.name}</span>
                                        <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.16em] text-[#2C2625]/35">{student.roll}</span>
                                      </div>
                                    </div>
                                    <Badge className={cn(
                                      "shrink-0 border-none px-2.5 py-1 text-[8px] font-black uppercase rounded-lg",
                                      student.status === 'Passed' ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                                    )}>{student.status}</Badge>
                                  </div>
                                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-[#E9E1D5]/60">
                                      <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">Marks</span>
                                      <span className="mt-0.5 block text-xs font-black text-[#2C2625]">{student.totalObtained}/{student.totalMax}</span>
                                    </div>
                                    <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-[#E9E1D5]/60">
                                      <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">Grade</span>
                                      <span className="mt-0.5 block text-xs font-black text-[#C37A67]">{student.grade}</span>
                                    </div>
                                    <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-[#E9E1D5]/60">
                                      <span className="block text-[8px] font-black uppercase tracking-widest text-[#2C2625]/35">Percentage</span>
                                      <span className="mt-0.5 block text-xs font-black text-[#88AC88]">{student.percentage}%</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="hidden overflow-hidden rounded-[32px] border border-[#E9E1D5]/60 lg:block bg-white shadow-sm overflow-x-auto">
                              <table className="w-full text-left min-w-[800px] table-auto">
                                <thead>
                                  <tr className="bg-[#FDFBF7] text-[#2C2625]/40 text-[10px] font-black uppercase tracking-widest border-b border-[#E9E1D5]">
                                    <th className="px-6 py-4.5 text-left">Rank</th>
                                    <th className="px-6 py-4.5 text-left">Student</th>
                                    <th className="px-6 py-4.5 text-center">Obtained Marks</th>
                                    <th className="px-6 py-4.5 text-center">Percentage</th>
                                    <th className="px-6 py-4.5 text-center">Grade</th>
                                    <th className="px-6 py-4.5 text-center">Status</th>
                                    <th className="px-6 py-4.5 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E9E1D5]/40">
                                  {sortedStudents.map((student, idx) => (
                                    <tr key={idx} className="hover:bg-[#C37A67]/5 transition-colors">
                                      <td className="px-6 py-4.5 font-black text-[#C37A67] text-sm align-middle">#{idx + 1}</td>
                                      <td className="px-6 py-4.5 align-middle">
                                        <div className="flex items-center gap-3">
                                          <div className="h-9 w-9 rounded-full bg-[#C37A67]/10 text-[#C37A67] flex items-center justify-center font-black text-xs shrink-0">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-black text-[#2C2625] truncate">{student.name}</span>
                                            <span className="text-[10px] font-bold text-[#2C2625]/40 tracking-wider uppercase mt-0.5">{student.roll}</span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4.5 text-center text-sm font-black text-[#2C2625] whitespace-nowrap align-middle">
                                        {student.totalObtained} <span className="text-[#2C2625]/40 font-medium">/</span> {student.totalMax}
                                      </td>
                                      <td className="px-6 py-4.5 text-center text-sm font-black text-[#2C2625] align-middle">{student.percentage}%</td>
                                      <td className="px-6 py-4.5 text-center text-sm font-black text-[#C37A67] align-middle">{student.grade}</td>
                                      <td className="px-6 py-4.5 text-center align-middle whitespace-nowrap">
                                        <Badge className={cn(
                                          "border-none px-3 py-1 text-[9px] font-black uppercase rounded-lg",
                                          student.status === 'Passed' ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                                        )}>{student.status}</Badge>
                                      </td>
                                      <td className="px-6 py-4.5 text-right align-middle whitespace-nowrap">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setSelectedResultStudentRoll(student.roll)}
                                          className="h-8 rounded-lg border-[#E9E1D5] text-[8.5px] font-black uppercase hover:bg-[#C37A67] hover:text-white hover:border-transparent transition-all"
                                        >
                                          View Report Card
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="space-y-8 animate-in fade-in duration-500 text-left">
                          <div className="flex flex-col gap-2">
                            <h3 className="text-2xl font-black text-[#2C2625]">Publish Results</h3>
                            <p className="text-xs font-bold text-[#2C2625]/40 uppercase tracking-widest">Verify evaluation progress and release academic performance records</p>
                          </div>

                          {(() => {
                            const subjects = selectedExam?.subjectsList || [];
                            const activeSections = selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];
                            const totalChecklistItems = subjects.length * activeSections.length;
                            let completedChecklistItems = 0;

                            const checklist = subjects.map(s => {
                              const secAssignments = s.sectionAssignments || {};
                              const sectionStatuses = activeSections.map(sec => {
                                const secData = secAssignments[sec];
                                const theorySubmitted = getSectionTheorySubmitted(s, secData);
                                const practicalSubmitted = getSectionPracticalSubmitted(s, secData);
                                const isDone = theorySubmitted && practicalSubmitted;
                                if (isDone) completedChecklistItems++;
                                return {
                                  section: sec,
                                  isDone,
                                  theorySubmitted,
                                  practicalSubmitted,
                                  hasTheory: s.hasTheory !== false,
                                  hasPractical: s.hasPractical ?? false,
                                  teacher: secData?.teacher || s.teacher,
                                };
                              });
                              return {
                                subjectName: s.name,
                                sections: sectionStatuses,
                              };
                            });

                            const isAllCompleted = completedChecklistItems === totalChecklistItems;
                            const evaluationProgress = totalChecklistItems > 0
                              ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
                              : 0;

                            return (
                              <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#E9E1D5] shadow-lg space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-[#C37A67] tracking-widest block">Release Status</span>
                                    <h5 className="text-lg font-black text-[#2C2625] uppercase tracking-tight">
                                      {isAllCompleted ? 'Ready to Publish' : 'Pending Evaluation Submission'}
                                    </h5>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <span className="text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Submission Progress</span>
                                      <span className="text-sm font-black text-[#2C2625]">{completedChecklistItems} of {totalChecklistItems} Submitted</span>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] font-black text-xs">
                                      {evaluationProgress}%
                                    </div>
                                  </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-[#E9E1D5]/35 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[#C37A67] to-[#88AC88] h-full transition-all duration-500"
                                    style={{ width: `${evaluationProgress}%` }}
                                  />
                                </div>

                                {/* Grid of Subject - Section checklist */}
                                <div className="space-y-4 pt-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/45 block">Subject Evaluation Submission Registry</span>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {checklist.map((c, idx) => (
                                      <div key={idx} className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5] space-y-3">
                                        <span className="text-xs font-black text-[#2C2625] uppercase tracking-wider block">{c.subjectName}</span>
                                        <div className="grid grid-cols-3 gap-2">
                                          {c.sections.map((secStatus, sIdx) => (
                                            <div
                                              key={sIdx}
                                              onClick={() => {
                                                setSelectedSectionLockDetail({
                                                  subjectName: c.subjectName,
                                                  section: secStatus.section
                                                });
                                              }}
                                              className={cn(
                                                "p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer hover:border-[#C37A67]/40 hover:bg-[#C37A67]/5",
                                                secStatus.isDone
                                                  ? "bg-[#88AC88]/5 border-[#88AC88]/20 text-[#88AC88]"
                                                  : "bg-white border-[#E9E1D5]/70 text-[#2C2625]/40"
                                              )}
                                            >
                                              <span className="text-[10px] font-black">Sec {secStatus.section}</span>
                                              {secStatus.isDone ? (
                                                <div className="flex items-center gap-0.5 text-[#88AC88] whitespace-nowrap">
                                                  <Check className="w-3 h-3 shrink-0" />
                                                  <span className="text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-normal">Submitted</span>
                                                </div>
                                              ) : (
                                                <div className="flex flex-col items-center gap-0.5 text-center leading-none">
                                                  <span className="text-[7px] font-bold text-[#2C2625]/40 uppercase">Pending</span>
                                                  <span className="text-[6.5px] font-medium text-[#2C2625]/30 truncate max-w-full" title={secStatus.teacher}>
                                                    {secStatus.teacher.split(' ').pop()}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Warning alert if incomplete */}
                                {!isAllCompleted && (
                                  <div className="p-4.5 rounded-2xl bg-[#E4B76D]/5 border border-[#E4B76D]/20 flex items-start gap-3">
                                    <AlertTriangle className="w-4.5 h-4.5 text-[#E4B76D] shrink-0 mt-0.5" />
                                    <div className="space-y-0.5 text-left">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-[#E4B76D] block">Pending Evaluator Submission</span>
                                      <p className="text-[11px] font-medium text-[#2C2625]/60 leading-normal">
                                        Some evaluators have not submitted their grades. You can wait for all submissions, or bypass the submission checks and publish results using an administrative force-publish override.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                                  {!isAllCompleted && (
                                    <Button
                                      type="button"
                                      onClick={() => handleForcePublish()}
                                      variant="outline"
                                      className="w-full sm:w-auto h-11 px-5 rounded-xl border-[#E4B76D] text-[10px] font-black uppercase tracking-widest text-[#E4B76D] hover:bg-[#E4B76D]/5"
                                    >
                                      Force Publish (Override)
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    disabled={!isAllCompleted}
                                    onClick={() => setIsPublishModalOpen(true)}
                                    className={cn(
                                      "w-full sm:w-auto h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all",
                                      isAllCompleted
                                        ? "bg-[#C37A67] hover:bg-[#C37A67]/90 shadow-[#C37A67]/20 hover:-translate-y-0.5"
                                        : "bg-[#2C2625]/15 border-none cursor-not-allowed opacity-50 shadow-none"
                                    )}
                                  >
                                    Publish Results
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )
                    )}

                    {activeTab === 'Audit Logs' && (
                      <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-2xl font-black text-[#2C2625]">Action Trail</h3>
                          <p className="text-xs font-bold text-[#2C2625]/40 uppercase tracking-widest">History of administrative operations for this assessment</p>
                        </div>
                        <div className="space-y-4">
                          {auditLogsData.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 sm:gap-6 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-[#FDFBF7] border border-[#E9E1D5] hover:border-[#C37A67]/20 transition-all">
                              <div className="h-10 w-10 shrink-0 rounded-2xl bg-white border border-[#E9E1D5] flex items-center justify-center text-[#C37A67] shadow-sm sm:h-12 sm:w-12">
                                <log.icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                  <span className="text-xs font-black text-[#2C2625] uppercase tracking-wide">{log.action}</span>
                                  <span className="text-[10px] font-bold text-[#2C2625]/30 uppercase">{log.time}</span>
                                </div>
                                <p className="text-xs font-bold text-[#2C2625]/60 mb-2">{log.detail}</p>
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full bg-[#2C2625]/5 flex items-center justify-center">
                                    <UserIcon className="h-2 w-2 text-[#2C2625]/40" />
                                  </div>
                                  <span className="text-[10px] font-black text-[#2C2625]/40 uppercase tracking-widest">Modified by {log.user}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'Analytics' && (
                      <div className="flex min-h-[320px] flex-col items-center justify-center text-center gap-6 sm:h-[500px]">
                        <div className="h-20 w-20 rounded-[28px] bg-[#FDFBF7] border border-[#E9E1D5] flex items-center justify-center text-[#2C2625]/10">
                          <Settings2 className="h-10 w-10 animate-spin-slow" />
                        </div>
                        <h4 className="text-lg font-black text-[#2C2625] uppercase tracking-tight">{activeTab} Interface Ready</h4>
                        <p className="text-xs font-bold text-[#2C2625]/30 uppercase tracking-[0.2em]">Integrating administrative controls for {selectedExam?.name}</p>
                      </div>
                    )}

                    {activeTab === 'Report Cards' && (
                      selectedExam?.status === 'Completed' ? (() => {
                        const targetSections = selectedExam?.assignedClasses?.map(ac => ac.split('-')[1] || ac) || ['A', 'B', 'C'];

                        const sectionStudents = studentsPerformance.filter(student => {
                          return getSectionFromRoll(student.roll) === selectedResultSection;
                        });

                        const sectionStudentsData = sectionStudents.map(student => {
                          let totalObtainedAll = 0;
                          let totalMaxAll = 0;
                          let hasFailedAny = false;

                          const subjectsPerformance = (selectedExam.subjectsList || []).map(subj => {
                            const secData = subj.sectionAssignments?.[selectedResultSection];
                            const studentMarks = secData?.studentMarks?.[student.roll];

                            let theoryObtained = 0;
                            let practicalObtained = 0;

                            const hasTheory = subj.hasTheory !== false;
                            const theoryMax = subj.theoryMax ?? 100;
                            const hasPractical = !!subj.hasPractical;
                            const practicalMax = subj.practicalMax ?? 0;
                            const totalMax = (hasTheory ? theoryMax : 0) + (hasPractical ? practicalMax : 0);

                            if (studentMarks) {
                              theoryObtained = Number(studentMarks.theory) || 0;
                              practicalObtained = Number(studentMarks.practical) || 0;
                            } else {
                              const studentRoll = student.roll;
                              const studentSeed = studentRoll.split('-')[1] || '001';
                              const studentNum = parseInt(studentSeed) || 1;
                              const studentRatio = 1 - ((studentNum - 1) * 0.08);

                              if (hasTheory) {
                                theoryObtained = Math.round(theoryMax * studentRatio);
                              }
                              if (hasPractical) {
                                practicalObtained = Math.round(practicalMax * studentRatio);
                              }
                            }

                            const totalObtained = theoryObtained + practicalObtained;
                            const passed = Number(totalObtained) >= Number(subj.passing ?? Math.round(totalMax * 0.35));

                            if (!passed) hasFailedAny = true;

                            totalObtainedAll += totalObtained;
                            totalMaxAll += totalMax;

                            let grade = 'F';
                            const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
                            if (pct >= 90) grade = 'A+';
                            else if (pct >= 80) grade = 'A';
                            else if (pct >= 70) grade = 'B';
                            else if (pct >= 60) grade = 'C';
                            else if (pct >= 50) grade = 'D';
                            else if (pct >= 35) grade = 'E';

                            return {
                              subjectName: subj.name,
                              theory: theoryObtained,
                              theoryMax,
                              hasTheory,
                              practical: practicalObtained,
                              practicalMax,
                              hasPractical,
                              totalObtained,
                              totalMax,
                              grade,
                              passed
                            };
                          });

                          const percentage = totalMaxAll > 0 ? Math.round((totalObtainedAll / totalMaxAll) * 100) : 0;

                          let overallGrade = 'F';
                          if (percentage >= 90) overallGrade = 'A+';
                          else if (percentage >= 80) overallGrade = 'A';
                          else if (percentage >= 70) overallGrade = 'B';
                          else if (percentage >= 60) overallGrade = 'C';
                          else if (percentage >= 50) overallGrade = 'D';
                          else if (percentage >= 35) overallGrade = 'E';

                          return {
                            roll: student.roll,
                            name: student.name,
                            subjects: subjectsPerformance,
                            totalObtained: totalObtainedAll,
                            totalMax: totalMaxAll,
                            percentage,
                            grade: overallGrade,
                            status: hasFailedAny ? 'Failed' : 'Passed'
                          };
                        });

                        const sortedStudents = sectionStudentsData.slice().sort((a, b) => b.totalObtained - a.totalObtained);

                        return (
                          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left">
                            {/* Header Panel */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-black text-[#2C2625]">Report Card Registry</h3>
                                <p className="text-[11px] font-bold text-[#2C2625]/40 uppercase tracking-widest">Bulk print, download, and dispatch student report cards</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2 sm:flex">
                                <Button size="sm" variant="outline" className="rounded-xl border-[#E9E1D5] text-[10px] font-black uppercase" onClick={() => handleBulkDownloadPDFs(sortedStudents)}>
                                  <Download className="mr-2 h-4 w-4" /> Bulk Download
                                </Button>
                                <Button size="sm" className="rounded-xl bg-[#2C2625] text-white text-[10px] font-black uppercase" onClick={() => handleBulkPrintPDFs(sortedStudents)}>
                                  <Printer className="mr-2 h-4 w-4" /> Bulk Print
                                </Button>
                              </div>
                            </div>

                            {/* Section and Status Selector Card */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-[#FDFBF7] border border-[#E9E1D5] p-5 rounded-[28px] shadow-sm">
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider text-[#2C2625]/40 block">Section Filter</span>
                                <div className="flex items-center gap-1.5 overflow-hidden bg-[#2C2625]/5 p-1 rounded-xl w-fit">
                                  {targetSections.map(sec => (
                                    <Button
                                      key={sec}
                                      type="button"
                                      onClick={() => setSelectedResultSection(sec)}
                                      className={cn(
                                        "h-9 rounded-lg px-4 text-[9px] font-black uppercase tracking-wider transition-all border-none shadow-none",
                                        selectedResultSection === sec
                                          ? "bg-[#C37A67] text-white shadow-sm"
                                          : "bg-transparent text-[#2C2625]/60 hover:text-[#2C2625]"
                                      )}
                                    >
                                      Section {sec}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <span className="text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Report Cards Ready</span>
                                  <span className="text-sm font-black text-[#88AC88]">{sortedStudents.length} / {sortedStudents.length} Generated</span>
                                </div>
                                <div className="text-right border-l border-[#E9E1D5] pl-6">
                                  <span className="text-[9px] font-black text-[#2C2625]/40 uppercase tracking-widest block">Generation Quality</span>
                                  <span className="text-sm font-black text-[#C37A67]">PDF Vector (HD)</span>
                                </div>
                              </div>
                            </div>

                            {/* Student Checklist Table */}
                            <div className="hidden lg:block overflow-hidden rounded-[32px] border border-[#E9E1D5]/60 bg-white shadow-sm overflow-x-auto">
                              <table className="w-full text-left min-w-[800px] table-auto">
                                <thead>
                                  <tr className="bg-[#FDFBF7] text-[#2C2625]/40 text-[10px] font-black uppercase tracking-widest border-b border-[#E9E1D5]">
                                    <th className="px-6 py-4.5 text-left w-12">
                                      <input
                                        type="checkbox"
                                        checked={sortedStudents.length > 0 && selectedReportStudentRolls.length === sortedStudents.length}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedReportStudentRolls(sortedStudents.map(s => s.roll));
                                          } else {
                                            setSelectedReportStudentRolls([]);
                                          }
                                        }}
                                        className="h-4 w-4 rounded border-[#E9E1D5] text-[#C37A67] focus:ring-[#C37A67] cursor-pointer"
                                      />
                                    </th>
                                    <th className="px-6 py-4.5 text-left">Roll No</th>
                                    <th className="px-6 py-4.5 text-left">Student Name</th>
                                    <th className="px-6 py-4.5 text-center">Marks Obtained</th>
                                    <th className="px-6 py-4.5 text-center">Percentage</th>
                                    <th className="px-6 py-4.5 text-center">Grade</th>
                                    <th className="px-6 py-4.5 text-center">Dispatch Status</th>
                                    <th className="px-6 py-4.5 text-right">Individual Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E9E1D5]/40">
                                  {sortedStudents.map((student, _idx) => {
                                    const isChecked = selectedReportStudentRolls.includes(student.roll);
                                    return (
                                      <tr key={student.roll} className={cn("hover:bg-[#FDFBF7]/60 transition-colors", isChecked ? "bg-[#C37A67]/5" : "")}>
                                        <td className="px-6 py-4.5">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedReportStudentRolls(prev => [...prev, student.roll]);
                                              } else {
                                                setSelectedReportStudentRolls(prev => prev.filter(r => r !== student.roll));
                                              }
                                            }}
                                            className="h-4 w-4 rounded border-[#E9E1D5] text-[#C37A67] focus:ring-[#C37A67] cursor-pointer"
                                          />
                                        </td>
                                        <td className="px-6 py-4.5 text-xs font-black text-[#2C2625]/45 uppercase tracking-widest">{student.roll}</td>
                                        <td className="px-6 py-4.5 text-sm font-black text-[#2C2625]">{student.name}</td>
                                        <td className="px-6 py-4.5 text-center text-sm font-bold text-[#2C2625]/70">{student.totalObtained} / {student.totalMax}</td>
                                        <td className="px-6 py-4.5 text-center text-sm font-black text-[#88AC88]">{student.percentage}%</td>
                                        <td className="px-6 py-4.5 text-center text-sm font-black text-[#C37A67]">{student.grade}</td>
                                        <td className="px-6 py-4.5 text-center">
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#88AC88]/10 text-[#88AC88] text-[9px] font-black uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#88AC88] animate-pulse" />
                                            Ready (Signed)
                                          </span>
                                        </td>
                                        <td className="px-6 py-4.5 text-right">
                                          <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                              type="button"
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => handlePrintIndividualReportCard(student)}
                                              className="h-8 w-8 rounded-lg hover:bg-[#2C2625]/5 text-[#2C2625]/60 hover:text-[#2C2625]"
                                              title="Print Report Card"
                                            >
                                              <Printer className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              type="button"
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => handleDownloadIndividualReportCard(student)}
                                              className="h-8 w-8 rounded-lg hover:bg-[#2C2625]/5 text-[#2C2625]/60 hover:text-[#2C2625]"
                                              title="Download PDF"
                                            >
                                              <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              type="button"
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => {
                                                setSelectedResultStudentRoll(student.roll);
                                                setActiveTab('Results');
                                              }}
                                              className="h-8 w-8 rounded-lg hover:bg-[#2C2625]/5 text-[#2C2625]/60 hover:text-[#2C2625]"
                                              title="View Performance Sheet"
                                            >
                                              <Eye className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Horizontal Card List view for bulk operations checklist */}
                            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory lg:hidden -mx-4 px-4 scrollbar-thin scrollbar-thumb-[#C37A67]/10">
                              {sortedStudents.map((student, _idx) => {
                                const isChecked = selectedReportStudentRolls.includes(student.roll);
                                return (
                                  <div
                                    key={student.roll}
                                    className={cn(
                                      "snap-center flex-none w-[85%] max-w-[310px] rounded-[26px] border bg-[#FDFBF7] p-5 shadow-sm space-y-4 text-left transition-all",
                                      isChecked ? "border-[#C37A67] bg-[#C37A67]/5" : "border-[#E9E1D5]/70"
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedReportStudentRolls(prev => [...prev, student.roll]);
                                            } else {
                                              setSelectedReportStudentRolls(prev => prev.filter(r => r !== student.roll));
                                            }
                                          }}
                                          className="h-4.5 w-4.5 rounded border-[#E9E1D5] text-[#C37A67] focus:ring-[#C37A67] cursor-pointer"
                                        />
                                        <div className="min-w-0">
                                          <span className="block text-sm font-black text-[#2C2625] break-words leading-tight">{student.name}</span>
                                          <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.16em] text-[#2C2625]/35">{student.roll}</span>
                                        </div>
                                      </div>
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#88AC88]/10 text-[#88AC88] text-[8px] font-black uppercase tracking-wider">
                                        Ready
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                      <div className="rounded-2xl bg-white px-2.5 py-1.5 ring-1 ring-[#E9E1D5]/60">
                                        <span className="block text-[7.5px] font-black uppercase tracking-widest text-[#2C2625]/35">Marks</span>
                                        <span className="mt-0.5 block text-xs font-black text-[#2C2625]">{student.totalObtained}/{student.totalMax}</span>
                                      </div>
                                      <div className="rounded-2xl bg-white px-2.5 py-1.5 ring-1 ring-[#E9E1D5]/60">
                                        <span className="block text-[7.5px] font-black uppercase tracking-widest text-[#2C2625]/35">Grade</span>
                                        <span className="mt-0.5 block text-xs font-black text-[#C37A67]">{student.grade}</span>
                                      </div>
                                      <div className="rounded-2xl bg-white px-2.5 py-1.5 ring-1 ring-[#E9E1D5]/60">
                                        <span className="block text-[7.5px] font-black uppercase tracking-widest text-[#2C2625]/35">Score</span>
                                        <span className="mt-0.5 block text-xs font-black text-[#88AC88]">{student.percentage}%</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-[#E9E1D5]/50">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadIndividualReportCard(student)}
                                        className="h-8 rounded-xl px-3.5 text-[9px] font-black uppercase"
                                      >
                                        <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedResultStudentRoll(student.roll);
                                          setActiveTab('Results');
                                        }}
                                        className="h-8 rounded-xl px-3.5 bg-[#2C2625] text-white text-[9px] font-black uppercase"
                                      >
                                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="flex min-h-[320px] flex-col items-center justify-center text-center gap-6 sm:h-[500px]">
                          <div className="h-20 w-20 rounded-[28px] bg-[#FDFBF7] border border-[#E9E1D5] flex items-center justify-center text-[#2C2625]/10">
                            <Lock className="h-10 w-10 text-[#C37A67]" />
                          </div>
                          <h4 className="text-lg font-black text-[#2C2625] uppercase tracking-tight">Report Cards Locked</h4>
                          <p className="text-xs font-bold text-[#2C2625]/30 uppercase tracking-[0.2em]">Publish exam results to unlock administrative report card generation</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          hideHeader
          bodyClassName="p-0 sm:p-0"
          className="max-w-lg w-[calc(100vw-1rem)] sm:w-full h-[540px] rounded-[40px] p-0 overflow-hidden border-[#E9E1D5] shadow-2xl"
        >
          <div className="flex min-h-full flex-col bg-white text-left">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 pr-16 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseCreateModal}
                className="absolute top-5 right-6 w-10 h-10 rounded-xl bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 hover:rotate-90 transition-all duration-500"
              >
                <X className="w-5 h-5 text-[#3A2C2B]" />
              </Button>
              <h2 className="text-3xl font-black text-[#2C2625] uppercase tracking-tight leading-none">Setup New Examination</h2>
              <p className="text-[10px] font-bold text-[#2C2625]/45 uppercase tracking-widest mt-1.5">Define details and schedules for academic assessment</p>
              <div className="h-0.5 w-16 bg-[#C37A67] mt-3" />
            </div>

            {/* Form Content */}
            <div className="flex-1 px-5 pb-6 space-y-6 sm:px-6 sm:pb-8 sm:space-y-8">
              <style>{`
                  /* Theme-styled Date & Time Pickers */
                  input[type="time"],
                  input[type="date"] {
                    accent-color: #C37A67 !important;
                    color-scheme: light !important;
                    outline: none !important;
                    border-color: #E9E1D5 !important;
                    transition: all 0.2s ease-in-out !important;
                  }
                  input[type="time"]:hover,
                  input[type="date"]:hover {
                    border-color: #C37A67 !important;
                  }
                  input[type="time"]:focus,
                  input[type="date"]:focus,
                  input[type="time"]:focus-within,
                  input[type="date"]:focus-within {
                    border-color: #C37A67 !important;
                    outline: none !important;
                    box-shadow: 0 0 0 3px rgba(195, 122, 103, 0.15) !important;
                  }
                  /* Customize the selection segments inside the input */
                  input[type="time"]::-webkit-datetime-edit-field:focus,
                  input[type="date"]::-webkit-datetime-edit-field:focus,
                  input[type="time"]::-webkit-datetime-edit-hour-field:focus,
                  input[type="time"]::-webkit-datetime-edit-minute-field:focus,
                  input[type="time"]::-webkit-datetime-edit-ampm-field:focus,
                  input[type="date"]::-webkit-datetime-edit-day-field:focus,
                  input[type="date"]::-webkit-datetime-edit-month-field:focus,
                  input[type="date"]::-webkit-datetime-edit-year-field:focus {
                    background-color: #C37A67 !important;
                    color: white !important;
                    border-radius: 4px !important;
                  }
                  /* Custom general selection overrides */
                  input[type="time"]::selection,
                  input[type="date"]::selection {
                    background-color: #C37A67 !important;
                    color: white !important;
                  }
                  /* Hide native Chrome clock/calendar indicator icon inside inputs to keep text centered */
                  input[type="time"]::-webkit-calendar-picker-indicator,
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    display: none !important;
                    background: none !important;
                    -webkit-appearance: none !important;
                    margin: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                  }
                  /* Centering input text segment values */
                  input[type="time"] {
                    text-align: center !important;
                  }
                `}</style>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Examination Title</label>
                <Input
                  value={createExamForm.title}
                  onChange={(event) => handleCreateExamFormChange('title', event.target.value)}
                  placeholder="e.g. Mid-Term Evaluation Q3"
                  className="h-14 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 text-xs font-bold px-6 shadow-sm focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Select Departments</label>
                <MultiSelect
                  value={createExamForm.departments}
                  onChange={(value) => handleCreateExamFormChange('departments', value)}
                  options={departmentOptions}
                  className="rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 px-4 min-h-[56px] shadow-sm focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Target Class</label>
                  <Select
                    value={createExamForm.targetClass}
                    onChange={(value) => handleCreateExamFormChange('targetClass', value)}
                    options={targetClassOptions}
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 text-xs font-bold px-6 shadow-sm focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Academic Session</label>
                  <Select
                    value={createExamForm.academicSession}
                    onChange={(value) => handleCreateExamFormChange('academicSession', value)}
                    options={academicSessionOptions}
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 text-xs font-bold px-6 shadow-sm focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Select Sections</label>
                <MultiSelect
                  value={createExamForm.sections}
                  onChange={(value) => handleCreateExamFormChange('sections', value)}
                  options={sectionOptions}
                  className="rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 px-4 min-h-[56px] shadow-sm focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Subjects Inclusion</label>
                <MultiSelect
                  value={createExamForm.subjects}
                  onChange={(value) => handleCreateExamFormChange('subjects', value)}
                  options={subjectOptions}
                  className="rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 px-4 min-h-[56px] shadow-sm focus:bg-white transition-all"
                />
              </div>

              {/* Subject Scheduling section */}
              {createExamForm.subjects.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#E9E1D5]/60">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#2C2625]">Configure Subject Schedule</h3>

                  {conflicts.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946] flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-xs font-bold space-y-1">
                        <p className="font-black uppercase tracking-wider">Schedule Conflict Detected!</p>
                        {conflicts.map((c, idx) => (
                          <p key={idx} className="opacity-90">
                            • <strong>{c.sub1}</strong> overlaps with <strong>{c.sub2}</strong> on {c.date}.
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {createExamForm.subjects.map((subVal, index) => {
                      const option = subjectOptions.find(o => o.value === subVal);
                      const name = option?.label || subVal;
                      const sched = (createExamForm.subjectSchedules && createExamForm.subjectSchedules[subVal]) || {
                        date: createExamForm.startDate || '',
                        startTime: createExamForm.startTime || '09:00',
                        endTime: createExamForm.endTime || '12:00',
                      };

                      const config = (createExamForm.subjectConfigs && createExamForm.subjectConfigs[subVal]) || {
                        hasTheory: true,
                        theoryMax: parseInt(createExamForm.baseMarks) || 80,
                        hasPractical: subVal === 'mathematics' || subVal === 'physics' || subVal === 'chemistry' || subVal === 'biology',
                        practicalMax: (subVal === 'mathematics' || subVal === 'physics' || subVal === 'chemistry' || subVal === 'biology') ? 20 : 0,
                        hasInternals: false,
                        internalMax: 0,
                      };

                      const isExpanded = index === activeConfigIndex;
                      const paperTotalMarks = (config.hasTheory ? config.theoryMax : 0) + (config.hasPractical ? config.practicalMax : 0) + (config.hasInternals ? config.internalMax : 0);

                      if (!isExpanded) {
                        return (
                          <div
                            key={subVal}
                            onClick={() => setActiveConfigIndex(index)}
                            className="group flex min-h-16 flex-col items-start justify-between gap-3 px-4 py-4 rounded-2xl bg-[#2C2625]/5 border border-[#E9E1D5]/40 hover:bg-[#FDFBF7] hover:border-[#C37A67]/30 transition-all duration-300 cursor-pointer animate-in fade-in zoom-in-95 duration-200 sm:h-16 sm:flex-row sm:items-center sm:px-5 sm:py-0"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="text-[9px] font-black uppercase text-white bg-[#C37A67]/75 group-hover:bg-[#C37A67] px-2.5 py-1 rounded-xl transition-colors shadow-xs whitespace-nowrap shrink-0">
                                Paper {index + 1}
                              </span>
                              <span className="truncate text-xs font-black text-[#2C2625]/75 group-hover:text-[#2C2625] uppercase tracking-wider transition-colors">
                                {name}
                              </span>
                            </div>

                            <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:shrink-0">
                              <span className="text-[9px] font-black text-[#2C2625]/85 bg-[#E9E1D5]/40 px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0">
                                {paperTotalMarks} Marks Total
                              </span>
                              <span className="text-[9px] font-black uppercase text-white bg-[#C37A67]/80 group-hover:bg-[#C37A67] tracking-widest px-3 py-1 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-xs">
                                Configure
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // Expanded Card Design
                      return (
                        <div key={subVal} className="p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] bg-white border-2 border-[#C37A67] shadow-xl space-y-5 transition-all duration-300 text-left animate-in fade-in zoom-in-95 duration-300">
                          {/* Subject Header Row */}
                          <div className="flex flex-col gap-3 pb-3 border-b border-[#E9E1D5]/60 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className="text-[10px] font-black uppercase text-white bg-[#C37A67] px-2.5 py-1 rounded-xl shadow-sm">
                                Configuring Paper {index + 1}
                              </span>
                              <span className="text-sm font-black text-[#2C2625] uppercase tracking-wider">{name}</span>
                            </div>

                            {/* Reordering & Collapse Buttons */}
                            <div className="flex items-center justify-between gap-2.5 sm:justify-start">
                              <button
                                type="button"
                                onClick={() => setActiveConfigIndex(-1)}
                                className="px-3 py-1 rounded-lg bg-[#2C2625]/5 hover:bg-[#2C2625]/10 text-[9px] font-black uppercase tracking-widest transition-all text-[#2C2625]"
                                title="Collapse Config"
                              >
                                Collapse
                              </button>
                              <div className="flex items-center gap-1 bg-[#2C2625]/5 p-1 rounded-xl">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveSubject(index, 'up')}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-all hover:bg-white hover:text-[#C37A67] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center border-none bg-transparent text-[#2C2625]",
                                    index === 0 ? "cursor-not-allowed" : "cursor-pointer"
                                  )}
                                  title="Move Paper Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === createExamForm.subjects.length - 1}
                                  onClick={() => handleMoveSubject(index, 'down')}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-all hover:bg-white hover:text-[#C37A67] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center border-none bg-transparent text-[#2C2625]",
                                    index === createExamForm.subjects.length - 1 ? "cursor-not-allowed" : "cursor-pointer"
                                  )}
                                  title="Move Paper Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 1. Component Configurator Section (Vertical Structured Layout with Custom Switches) */}
                          <div className="p-5 rounded-2xl bg-[#2C2625]/5 border border-[#E9E1D5]/40 space-y-1">
                            {/* Theory Config */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4.5 border-b border-[#E9E1D5]/40 last:border-0 gap-4">
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => handleSubjectConfigChange(subVal, 'hasTheory', !config.hasTheory)}
                                  className={cn(
                                    "w-11 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none relative shrink-0",
                                    config.hasTheory ? "bg-[#C37A67]" : "bg-[#2C2625]/15"
                                  )}
                                >
                                  <div
                                    className="w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 absolute top-0.5"
                                    style={{ left: config.hasTheory ? '22px' : '2px' }}
                                  />
                                </button>
                                <div className="text-left">
                                  <span className="text-xs font-black uppercase text-[#2C2625] tracking-wide block">Theory Paper</span>
                                  <span className="text-[9px] font-bold text-[#2C2625]/40 uppercase tracking-widest block mt-0.5">Written & descriptive assessment</span>
                                </div>
                              </div>
                              {config.hasTheory && (
                                <div className="flex items-center gap-2.5 animate-in slide-in-from-right-2 duration-250">
                                  <span className="text-[10px] font-black text-[#2C2625]/45 uppercase tracking-wider">Max Marks</span>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={config.theoryMax}
                                    onChange={(e) => handleSubjectConfigChange(subVal, 'theoryMax', parseInt(e.target.value) || 0)}
                                    className="h-10 w-20 text-sm font-black rounded-xl text-center border-[#E9E1D5] focus:border-[#C37A67] bg-white transition-all shadow-xs"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Practical Config */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4.5 border-b border-[#E9E1D5]/40 last:border-0 gap-4">
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => handleSubjectConfigChange(subVal, 'hasPractical', !config.hasPractical)}
                                  className={cn(
                                    "w-11 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none relative shrink-0",
                                    config.hasPractical ? "bg-[#C37A67]" : "bg-[#2C2625]/15"
                                  )}
                                >
                                  <div
                                    className="w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 absolute top-0.5"
                                    style={{ left: config.hasPractical ? '22px' : '2px' }}
                                  />
                                </button>
                                <div className="text-left">
                                  <span className="text-xs font-black uppercase text-[#2C2625] tracking-wide block">Practical / Lab Exam</span>
                                  <span className="text-[9px] font-bold text-[#2C2625]/40 uppercase tracking-widest block mt-0.5">Experimental & hands-on evaluation</span>
                                </div>
                              </div>
                              {config.hasPractical && (
                                <div className="flex items-center gap-2.5 animate-in slide-in-from-right-2 duration-250">
                                  <span className="text-[10px] font-black text-[#2C2625]/45 uppercase tracking-wider">Max Marks</span>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={config.practicalMax}
                                    onChange={(e) => handleSubjectConfigChange(subVal, 'practicalMax', parseInt(e.target.value) || 0)}
                                    className="h-10 w-20 text-sm font-black rounded-xl text-center border-[#E9E1D5] focus:border-[#C37A67] bg-white transition-all shadow-xs"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Internals Config */}
                            {false && (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4.5 border-b border-[#E9E1D5]/40 last:border-0 gap-4">
                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={() => handleSubjectConfigChange(subVal, 'hasInternals', !config.hasInternals)}
                                    className={cn(
                                      "w-11 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none relative shrink-0",
                                      config.hasInternals ? "bg-[#C37A67]" : "bg-[#2C2625]/15"
                                    )}
                                  >
                                    <div
                                      className="w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 absolute top-0.5"
                                      style={{ left: config.hasInternals ? '22px' : '2px' }}
                                    />
                                  </button>
                                  <div className="text-left">
                                    <span className="text-xs font-black uppercase text-[#2C2625] tracking-wide block">Continuous Internals</span>
                                    <span className="text-[9px] font-bold text-[#2C2625]/40 uppercase tracking-widest block mt-0.5">LMS portfolio & classroom sync</span>
                                  </div>
                                </div>
                                {config.hasInternals && (
                                  <div className="flex items-center gap-2.5 animate-in slide-in-from-right-2 duration-250">
                                    <span className="text-[10px] font-black text-[#2C2625]/45 uppercase tracking-wider">Max Marks</span>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={config.internalMax}
                                      onChange={(e) => handleSubjectConfigChange(subVal, 'internalMax', parseInt(e.target.value) || 0)}
                                      className="h-10 w-20 text-sm font-black rounded-xl text-center border-[#E9E1D5] focus:border-[#C37A67] bg-white transition-all shadow-xs"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 2. Sleek Dynamic Timetable Split Panel (Spacious layout with un-squished Date and Time grid) */}
                          {(config.hasTheory || config.hasPractical) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-[#E9E1D5]/60 animate-in fade-in duration-300">
                              {/* Column 1: Theory Schedule Slot */}
                              {config.hasTheory ? (
                                <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5]/60 shadow-xs space-y-4 text-left">
                                  <span className="text-[10px] font-black uppercase text-[#C37A67] tracking-widest block">
                                    Theory Exam Timetable
                                  </span>

                                  <div className="space-y-4">
                                    {/* Full-width Date Picker */}
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 ml-1">Exam Date</label>
                                      <ThemedDatePicker
                                        value={sched.date}
                                        onChange={(value) => handleSubjectScheduleChange(subVal, 'date', value)}
                                        align="left"
                                        className="h-11 rounded-xl border-[#E9E1D5]"
                                      />
                                    </div>

                                    {/* 2-Column Time Slots */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                      <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 ml-1">Start Time</label>
                                        <ThemedTimePicker
                                          value={sched.startTime}
                                          onChange={(value) => handleSubjectScheduleChange(subVal, 'startTime', value)}
                                          align="left"
                                          className="h-11 rounded-xl border-[#E9E1D5] text-[11px]"
                                        />
                                      </div>
                                      <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 ml-1">End Time</label>
                                        <ThemedTimePicker
                                          value={sched.endTime}
                                          onChange={(value) => handleSubjectScheduleChange(subVal, 'endTime', value)}
                                          align="right"
                                          className="h-11 rounded-xl border-[#E9E1D5] text-[11px]"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-5 rounded-2xl bg-[#2C2625]/5 border border-dashed border-[#E9E1D5]/45 flex items-center justify-center min-h-[170px]">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/30">Theory Exam Disabled</span>
                                </div>
                              )}

                              {/* Column 2: Practical Schedule Slot */}
                              {config.hasPractical ? (
                                <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5]/60 shadow-xs space-y-4 text-left">
                                  <span className="text-[10px] font-black uppercase text-[#C37A67] tracking-widest block">
                                    Practical Exam Timetable
                                  </span>

                                  <div className="space-y-4">
                                    {/* Full-width Date Picker */}
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 ml-1">Exam Date</label>
                                      <ThemedDatePicker
                                        value={sched.practicalDate || sched.date}
                                        onChange={(value) => handleSubjectScheduleChange(subVal, 'practicalDate', value)}
                                        align="right"
                                        className="h-11 rounded-xl border-[#E9E1D5]"
                                      />
                                    </div>

                                    {/* 2-Column Time Slots */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                      <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 ml-1">Start Time</label>
                                        <ThemedTimePicker
                                          value={sched.practicalStartTime || '13:00'}
                                          onChange={(value) => handleSubjectScheduleChange(subVal, 'practicalStartTime', value)}
                                          align="left"
                                          shift={-40}
                                          className="h-11 rounded-xl border-[#E9E1D5] text-[11px]"
                                        />
                                      </div>
                                      <div className="space-y-1.5 text-left">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 ml-1">End Time</label>
                                        <ThemedTimePicker
                                          value={sched.practicalEndTime || '15:00'}
                                          onChange={(value) => handleSubjectScheduleChange(subVal, 'practicalEndTime', value)}
                                          align="right"
                                          className="h-11 rounded-xl border-[#E9E1D5] text-[11px]"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-5 rounded-2xl bg-[#2C2625]/5 border border-dashed border-[#E9E1D5]/45 flex items-center justify-center min-h-[170px]">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/30">Practical Exam Disabled</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 3. Aggregate Bottom Weightage Bar */}
                          <div className="flex items-center justify-between px-3 py-3 rounded-2xl bg-[#E9E1D5]/20 border border-[#E9E1D5]/40">
                            <span className="text-[9px] font-black text-[#2C2625]/55 uppercase tracking-widest">Aggregate Paper Weightage</span>
                            <span className="text-xs font-black text-[#2C2625] bg-white border border-[#E9E1D5] px-3.5 py-1 rounded-xl shadow-xs">
                              {paperTotalMarks} Marks Total
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">Start Date</label>
                    <span className="text-[8px] font-black uppercase tracking-wide text-[#C37A67] bg-[#C37A67]/10 px-1.5 py-0.5 rounded">Auto-derived</span>
                  </div>
                  <Input
                    type="date"
                    value={createExamForm.startDate}
                    readOnly
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#E9E1D5]/20 text-xs font-bold px-6 shadow-sm cursor-not-allowed opacity-75"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">End Date</label>
                    <span className="text-[8px] font-black uppercase tracking-wide text-[#C37A67] bg-[#C37A67]/10 px-1.5 py-0.5 rounded">Auto-derived</span>
                  </div>
                  <Input
                    type="date"
                    value={createExamForm.endDate}
                    readOnly
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#E9E1D5]/20 text-xs font-bold px-6 shadow-sm cursor-not-allowed opacity-75"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">Start Time</label>
                    <span className="text-[8px] font-black uppercase tracking-wide text-[#C37A67] bg-[#C37A67]/10 px-1.5 py-0.5 rounded">Auto</span>
                  </div>
                  <Input
                    type="time"
                    value={createExamForm.startTime}
                    readOnly
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#E9E1D5]/20 text-xs font-bold px-6 shadow-sm cursor-not-allowed opacity-75"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40">End Time</label>
                    <span className="text-[8px] font-black uppercase tracking-wide text-[#C37A67] bg-[#C37A67]/10 px-1.5 py-0.5 rounded">Auto</span>
                  </div>
                  <Input
                    type="time"
                    value={createExamForm.endTime}
                    readOnly
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#E9E1D5]/20 text-xs font-bold px-6 shadow-sm cursor-not-allowed opacity-75"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Base Marks</label>
                  <Input
                    type="number"
                    value={createExamForm.baseMarks}
                    onChange={(event) => handleCreateExamFormChange('baseMarks', event.target.value)}
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 text-xs font-bold px-6 shadow-sm focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Passing (%)</label>
                  <Input
                    type="number"
                    value={createExamForm.passingPercentage}
                    onChange={(event) => handleCreateExamFormChange('passingPercentage', event.target.value)}
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 text-xs font-bold px-6 shadow-sm focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Publish Date</label>
                  <ThemedDatePicker
                    value={createExamForm.resultPublishDate}
                    onChange={(value) => handleCreateExamFormChange('resultPublishDate', value)}
                    align="right"
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 text-xs font-bold shadow-sm focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Grading Rule</label>
                  <Select
                    value={createExamForm.gradingRule}
                    onChange={(value) => handleCreateExamFormChange('gradingRule', value)}
                    options={gradingRuleOptions}
                    className="h-14 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 text-xs font-bold px-6 shadow-sm focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#2C2625]/40 ml-1">Exam Instructions / Notes</label>
                <Textarea
                  value={createExamForm.instructions}
                  onChange={(event) => handleCreateExamFormChange('instructions', event.target.value)}
                  placeholder="Add supervision notes, special timing rules, reporting instructions, or student-facing guidance."
                  className="min-h-[120px] rounded-2xl border-[#E9E1D5] bg-[#FDFBF7]/50 px-6 py-4 text-xs font-bold shadow-sm focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-[#E9E1D5] bg-white px-5 py-4 rounded-b-[28px] sm:px-6 sm:py-5 sm:rounded-b-[40px]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={handleCloseCreateModal}
                  className="h-10 w-full px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.18em] text-[#2C2625]/40 hover:text-[#C37A67] sm:w-auto"
                >
                  Discard
                </Button>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                  <Button
                    onClick={() => handleSubmitExamForm(true)}
                    variant="outline"
                    className="h-10 px-4 sm:px-5 rounded-2xl border-[#E9E1D5] text-[10px] font-black uppercase tracking-[0.18em] text-[#2C2625] hover:bg-[#FDFBF7] shadow-sm"
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmitExamForm(false)}
                    className="h-10 px-4 sm:px-6 rounded-2xl bg-[#C37A67] text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-[#C37A67]/20 hover:-translate-y-0.5 transition-all"
                  >
                    Initialize Exam
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Confirm Result Publication Modal */}
        <Modal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          hideHeader
          bodyClassName="p-0"
          className="max-w-md w-[calc(100vw-1rem)] sm:w-full rounded-[40px] overflow-hidden border-[#E9E1D5] shadow-2xl"
        >
          <div className="bg-white flex flex-col text-left">
            {/* Header */}
            <div className="p-6 sm:p-8 bg-[#FDFBF7] border-b border-[#E9E1D5] relative">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-[#2C2625]/5 hover:bg-[#2C2625]/10 text-[#2C2625] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#88AC88]/10 text-[#88AC88] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#2C2625] uppercase tracking-tight">Confirm Publication</h3>
                  <span className="text-[9px] font-black uppercase text-[#2C2625]/45 tracking-widest block mt-0.5">Final Verification Step</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-xs font-bold text-[#2C2625]/60 leading-relaxed">
                You are about to release the results of <strong className="text-[#2C2625]">{selectedExam?.name}</strong> to the student and parent portals. Please review and configure publication settings:
              </p>

              <div className="space-y-4">
                {/* Publish Date */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 ml-1">Publish Date</label>
                  <ThemedDatePicker
                    value={publishOptions.publishDate}
                    onChange={(value) => setPublishOptions(prev => ({ ...prev, publishDate: value }))}
                    align="left"
                    className="h-12 rounded-2xl border-[#E9E1D5]"
                  />
                </div>

                {/* Checklist options */}
                <div className="space-y-3.5 pt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#2C2625]/50 block">Notification channels</span>

                  {/* SMS */}
                  <label className="flex items-center gap-3.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={publishOptions.smsNotify}
                      onChange={(e) => setPublishOptions(prev => ({ ...prev, smsNotify: e.target.checked }))}
                      className="h-4.5 w-4.5 rounded-lg border-[#E9E1D5] text-[#C37A67] focus:ring-[#C37A67]/20 cursor-pointer"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black uppercase text-[#2C2625] tracking-wide leading-none group-hover:text-[#C37A67] transition-colors">SMS Alerts</span>
                      <span className="text-[9.5px] font-medium text-[#2C2625]/40 mt-1">Send SMS push notification to verified Parent mobile numbers</span>
                    </div>
                  </label>

                  {/* Email */}
                  <label className="flex items-center gap-3.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={publishOptions.emailNotify}
                      onChange={(e) => setPublishOptions(prev => ({ ...prev, emailNotify: e.target.checked }))}
                      className="h-4.5 w-4.5 rounded-lg border-[#E9E1D5] text-[#C37A67] focus:ring-[#C37A67]/20 cursor-pointer"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black uppercase text-[#2C2625] tracking-wide leading-none group-hover:text-[#C37A67] transition-colors">Email Notification</span>
                      <span className="text-[9.5px] font-medium text-[#2C2625]/40 mt-1">Email digital report card access links to Parents & Students</span>
                    </div>
                  </label>

                  {/* PDF Report Generation */}
                  <label className="flex items-center gap-3.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={publishOptions.pdfGenerate}
                      onChange={(e) => setPublishOptions(prev => ({ ...prev, pdfGenerate: e.target.checked }))}
                      className="h-4.5 w-4.5 rounded-lg border-[#E9E1D5] text-[#C37A67] focus:ring-[#C37A67]/20 cursor-pointer"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black uppercase text-[#2C2625] tracking-wide leading-none group-hover:text-[#C37A67] transition-colors">Pre-Generate PDFs</span>
                      <span className="text-[9.5px] font-medium text-[#2C2625]/40 mt-1">Compile and index report card PDFs for instant bulk download</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#FDFBF7] border-t border-[#E9E1D5] flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setIsPublishModalOpen(false)}
                className="h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] text-[#2C2625]/45 hover:text-[#C37A67]"
              >
                Discard
              </Button>
              <Button
                onClick={handlePublishResults}
                className="h-11 px-6 rounded-xl bg-[#88AC88] text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-[#88AC88]/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Confirm & Release
              </Button>
            </div>
          </div>
        </Modal>

        {/* Bulk Processing Progress Modal */}
        <Modal
          isOpen={bulkProcessingState.isOpen}
          onClose={() => setBulkProcessingState(prev => ({ ...prev, isOpen: false }))}
          hideHeader
          bodyClassName="p-0"
          className="max-w-md w-[calc(100vw-1rem)] sm:w-full rounded-[40px] overflow-hidden border-[#E9E1D5] shadow-2xl"
        >
          <div className="bg-white p-8 text-center space-y-6 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-[24px] bg-[#C37A67]/10 flex items-center justify-center text-[#C37A67] animate-pulse">
              {bulkProcessingState.type === 'Download' ? <Download className="h-8 w-8 text-[#C37A67]" /> : <Printer className="h-8 w-8 text-[#C37A67]" />}
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-[#2C2625] uppercase tracking-tight">
                {bulkProcessingState.type === 'Download' ? 'Generating PDFs' : 'Preparing Print Batch'}
              </h4>
              <p className="text-[10px] font-black text-[#2C2625]/45 uppercase tracking-widest">
                Processing {bulkProcessingState.studentCount} report {bulkProcessingState.studentCount === 1 ? 'card' : 'cards'} for {selectedExam?.name}
              </p>
            </div>

            <div className="space-y-2 w-full">
              <div className="w-full bg-[#E9E1D5]/35 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#C37A67] to-[#88AC88] h-full transition-all duration-300"
                  style={{ width: `${bulkProcessingState.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[#2C2625]/40">
                <span>{bulkProcessingState.progress}% Completed</span>
                <span>{bulkProcessingState.progress === 100 ? 'Done' : 'Processing...'}</span>
              </div>
            </div>
          </div>
        </Modal>

        {/* Section Lock & Marks Detail Modal */}
        <Modal
          isOpen={!!selectedSectionLockDetail}
          onClose={() => setSelectedSectionLockDetail(null)}
          hideHeader
          bodyClassName="p-0 sm:p-0"
          className="max-w-2xl w-[calc(100vw-1rem)] sm:w-full h-[600px] rounded-[40px] p-0 overflow-hidden border-[#E9E1D5] shadow-2xl"
        >
          {sectionDetail && (
            <div className="flex min-h-full flex-col bg-[#FDFBF7] text-left">
              {/* Header */}
              <div className="px-8 pt-8 pb-4 pr-16 bg-white relative border-b border-[#E9E1D5]/40 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSectionLockDetail(null)}
                  className="absolute top-5 right-6 w-10 h-10 rounded-xl bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 hover:rotate-90 transition-all duration-500"
                >
                  <X className="w-5 h-5 text-[#3A2C2B]" />
                </Button>
                <div className="flex items-center gap-2.5">
                  <Badge className={cn(
                    "border-none px-2.5 py-1 text-[8px] font-black uppercase rounded-lg",
                    sectionDetail.isDone ? "bg-[#88AC88] text-white" : "bg-[#E4B76D] text-white"
                  )}>
                    {sectionDetail.isDone ? "Submitted" : "Pending Submission"}
                  </Badge>
                  <span className="text-[10px] font-black uppercase text-[#2C2625]/45 tracking-widest font-mono">
                    Section {sectionDetail.section} Evaluation
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[#2C2625] uppercase tracking-tight leading-none mt-2">
                  {sectionDetail.subjectName}
                </h2>

                {/* Evaluator detail info bar */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[10px] font-bold text-[#2C2625]/60 uppercase tracking-wider">
                  <div>
                    <span className="text-[#2C2625]/30">Evaluator:</span>{" "}
                    <span className="text-[#2C2625] font-black">{sectionDetail.evaluator}</span>
                  </div>
                  <div>
                    <span className="text-[#2C2625]/30">Due Date:</span>{" "}
                    <span className="text-[#C37A67] font-black">{sectionDetail.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-[#2C2625]/30">Paper Type:</span>{" "}
                    <span className="text-[#2C2625] font-black">
                      {[
                        sectionDetail.hasTheory ? 'Theory' : null,
                        sectionDetail.hasPractical ? 'Practical' : null
                      ].filter(Boolean).join(' + ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Table */}
              <div className="flex-1 overflow-hidden p-6 sm:p-8 flex flex-col">
                <div className="rounded-[28px] border border-[#E9E1D5]/60 bg-white overflow-hidden shadow-sm flex flex-col flex-1">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#2C2625]/5 text-[#2C2625]/50 text-[9px] font-black uppercase tracking-widest border-b border-[#E9E1D5] sticky top-0 bg-white z-10">
                          <th className="px-6 py-4">Roll No</th>
                          <th className="px-6 py-4">Student Name</th>
                          {sectionDetail.hasTheory && (
                            <th className="px-6 py-4 text-center">Theory ({sectionDetail.theoryMax})</th>
                          )}
                          {sectionDetail.hasPractical && (
                            <th className="px-6 py-4 text-center">Practical ({sectionDetail.practicalMax})</th>
                          )}
                          <th className="px-6 py-4 text-right">Obtained ({sectionDetail.totalMax})</th>
                          <th className="px-6 py-4 text-center">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9E1D5]/40">
                        {sectionDetail.students.map((std) => (
                          <tr key={std.roll} className="hover:bg-[#FDFBF7]/50 transition-colors">
                            <td className="px-6 py-3.5 text-[10px] font-black text-[#2C2625]/40">{std.roll}</td>
                            <td className="px-6 py-3.5 text-xs font-black text-[#2C2625]">{std.name}</td>
                            {sectionDetail.hasTheory && (
                              <td className="px-6 py-3.5 text-center text-xs font-bold text-[#2C2625]/70">{std.theory}</td>
                            )}
                            {sectionDetail.hasPractical && (
                              <td className="px-6 py-3.5 text-center text-xs font-bold text-[#2C2625]/70">{std.practical}</td>
                            )}
                            <td className="px-6 py-3.5 text-right text-xs font-black text-[#2C2625]">{std.total}</td>
                            <td className="px-6 py-3.5 text-center">
                              <Badge className={cn(
                                "border-none px-2 py-0.5 text-[8px] font-black uppercase rounded",
                                std.passed ? "bg-[#88AC88] text-white" : "bg-[#E63946] text-white"
                              )}>
                                {std.passed ? "Passed" : "Failed"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-white border-t border-[#E9E1D5]/40 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#2C2625]/45">
                  EduSync Gradebook Submission Viewer
                </span>
                <Button
                  type="button"
                  onClick={() => setSelectedSectionLockDetail(null)}
                  className="h-10 px-5 rounded-xl bg-[#C37A67] hover:bg-[#C37A67]/90 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Close Detail
                </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default ExamsResultsPage;
