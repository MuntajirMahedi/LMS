import { useEffect, useMemo, useState } from 'react';
import {
  Users, BookOpen, AlertCircle,
  CheckCircle2, Plus,
  Download, LayoutDashboard, CalendarDays, UserSquare2,
  MapPin, Clock, Printer, Coffee, Search, ArrowRight, List,
  Calendar, Check, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { Country } from 'country-state-city';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import { EditTimetableModal } from '../components/timetable/EditTimetableModal';
import { getStorageData, setStorageData } from '../lib/storage';
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
  { subject: 'Mathematics', teacher: 'Sarah J.', room: 'Room 101', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'Physics', teacher: 'John D.', room: 'Lab 1', color: 'bg-[#E4B76D]/10 text-[#E4B76D]' },
  { subject: 'Chemistry', teacher: 'Alice M.', room: 'Lab 2', color: 'bg-[#88AC88]/10 text-[#88AC88]' },
  { subject: 'English', teacher: 'Bob T.', room: 'Room 203', color: 'bg-[#C37A67]/10 text-[#C37A67]' },
  { subject: 'History', teacher: 'Emma W.', room: 'Room 205', color: 'bg-[#A78BFA]/10 text-[#A78BFA]' },
  { subject: 'Geography', teacher: 'Tom H.', room: 'Room 302', color: 'bg-[#88AC88]/10 text-[#88AC88]' },
  { subject: 'Comp Sci', teacher: 'Steve R.', room: 'Lab 3', color: 'bg-blue-500/10 text-blue-500' },
  { subject: 'Physical Ed', teacher: 'Mike S.', room: 'Gym', color: 'bg-[#E4B76D]/10 text-[#E4B76D]' }
];

const getSubjectForSlot = (dayIdx: number, periodIdx: number) => {
  const index = (dayIdx * 3 + periodIdx) % MOCK_SUBJECTS.length;
  return MOCK_SUBJECTS[index];
};
type CountryMeta = {
  countryCode: string;
  countryName: string;
};

type HolidayEntry = {
  id: string;
  title: string;
  date: string;
  countryCode: string;
  countryName: string;
  selected: boolean;
  source: 'World' | 'India' | 'Custom';
  kind: 'holiday' | 'event' | 'exam';
};

const INDIA_HOLIDAYS_BY_YEAR: Record<number, { date: string; title: string }[]> = {
  2026: [
    { date: '2026-01-01', title: "New Year's Day" },
    { date: '2026-01-03', title: "Hazarat Ali's Birthday" },
    { date: '2026-01-14', title: 'Makar Sankranti / Magha Bihu / Pongal' },
    { date: '2026-01-23', title: 'Sri Panchmi / Basant Panchmi' },
    { date: '2026-01-26', title: 'Republic Day' },
    { date: '2026-02-01', title: "Guru Ravi Das's Birthday" },
    { date: '2026-02-12', title: 'Birthday of Swami Dayananda Saraswati' },
    { date: '2026-02-15', title: 'Maha Shivratri' },
    { date: '2026-02-19', title: 'Shivaji Jayanti' },
    { date: '2026-03-03', title: 'Holika Dahan / Dol Yatra' },
    { date: '2026-03-04', title: 'Holi' },
    { date: '2026-03-19', title: 'Chaitra Sukladi / Gudi Padava / Ugadi / Cheti Chand' },
    { date: '2026-03-20', title: 'Jamat-Ul-Vida' },
    { date: '2026-03-21', title: 'Id-ul-Fitr' },
    { date: '2026-03-26', title: 'Ram Navami' },
    { date: '2026-03-31', title: 'Mahavir Jayanti' },
    { date: '2026-04-03', title: 'Good Friday' },
    { date: '2026-04-05', title: 'Easter Sunday' },
    { date: '2026-04-14', title: 'Birth Anniversary of Dr. B.R. Ambedkar / Vaisakhi / Vishu / Meshadi (Tamil New Year Day)' },
    { date: '2026-04-15', title: 'Vaisakhadi (Bengal) / Bahag Bihu (Assam)' },
    { date: '2026-05-01', title: 'Budha Purnima / May Day' },
    { date: '2026-05-09', title: 'Birthday of Guru Rabindranath Tagore' },
    { date: '2026-05-27', title: 'Id-ul-Zuha (Bakrid)' },
    { date: '2026-06-26', title: 'Muharram' },
    { date: '2026-07-16', title: 'Rath Yatra' },
    { date: '2026-08-15', title: "Independence Day / Parsi New Year's Day / Nauraj" },
    { date: '2026-08-26', title: 'Milad-un-Nabi / Id-e-Milad (Birthday of Prophet Mohammad) / Onam / Thiru Onam Day' },
    { date: '2026-08-28', title: 'Raksha Bandhan' },
    { date: '2026-09-04', title: 'Janmashtami' },
    { date: '2026-09-14', title: 'Ganesh Chaturthi / Vinayak Chaturthi' },
    { date: '2026-10-02', title: "Mahatma Gandhi's Birth Day" },
    { date: '2026-10-18', title: 'Dussehra (Saptami)' },
    { date: '2026-10-19', title: 'Dussehra (Mahashtami)' },
    { date: '2026-10-20', title: 'Dussehra (Mahanavmi) / Dussehra' },
    { date: '2026-10-26', title: "Maharishi Valmiki's Birthday" },
    { date: '2026-10-29', title: 'Karaka Chaturthi (Karwa Chouth)' },
    { date: '2026-11-08', title: 'Diwali (Deepavali) / Naraka Chaturdasi' },
    { date: '2026-11-09', title: 'Govardhan Puja' },
    { date: '2026-11-11', title: 'Bhai Duj' },
    { date: '2026-11-15', title: 'Pratihar Shashthi / Surya Shashthi (Chhat Puja)' },
    { date: '2026-11-24', title: "Guru Nanak's Birthday / Guru Teg Bahadur's Martyrdom Day" },
    { date: '2026-12-23', title: "Hazrat Ali's Birthday" },
    { date: '2026-12-24', title: 'Christmas Eve' },
    { date: '2026-12-25', title: 'Christmas Day' },
  ],
  2027: [
    { date: '2027-01-26', title: 'Republic Day' },
    { date: '2027-03-09', title: 'Id-ul-Fitr' },
    { date: '2027-03-22', title: 'Holi' },
    { date: '2027-03-26', title: 'Good Friday' },
  ],
};

const HOLIDAY_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CALENDAR_TONES = {
  holiday: {
    main: 'bg-[#88AC88]',
    soft: 'bg-[#F0F7F0]',
    border: 'border-[#88AC88]/35',
    text: 'text-[#2C2625]',
    accent: 'text-[#88AC88]',
  },
  event: {
    main: 'bg-[#A78BFA]',
    soft: 'bg-[#F2EDFF]',
    border: 'border-[#A78BFA]/35',
    text: 'text-[#2C2625]',
    accent: 'text-[#A78BFA]',
  },
  exam: {
    main: 'bg-[#6D8FE3]',
    soft: 'bg-[#EEF3FF]',
    border: 'border-[#6D8FE3]/35',
    text: 'text-[#2C2625]',
    accent: 'text-[#6D8FE3]',
  },
} as const;

type CalendarToneKey = keyof typeof CALENDAR_TONES;

function getCalendarTone(kind: CalendarToneKey) {
  return CALENDAR_TONES[kind];
}

const FALLBACK_COUNTRIES: CountryMeta[] = [
  { countryCode: 'US', countryName: 'United States' },
  { countryCode: 'GB', countryName: 'United Kingdom' },
  { countryCode: 'CA', countryName: 'Canada' },
  { countryCode: 'AU', countryName: 'Australia' },
  { countryCode: 'FR', countryName: 'France' },
  { countryCode: 'DE', countryName: 'Germany' },
  { countryCode: 'JP', countryName: 'Japan' },
  { countryCode: 'BR', countryName: 'Brazil' },
  { countryCode: 'MX', countryName: 'Mexico' },
  { countryCode: 'ES', countryName: 'Spain' },
  { countryCode: 'IT', countryName: 'Italy' },
  { countryCode: 'ZA', countryName: 'South Africa' },
];

function getAllCountries(): CountryMeta[] {
  return Country.getAllCountries().map((country) => ({
    countryCode: country.isoCode,
    countryName: country.name,
  }));
}

async function fetchPublicHolidays(year: number, countryCode: string) {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getIndiaFallbackHolidays(startYear: number, endYear: number) {
  const holidays: { date: string; title: string }[] = [];
  for (let year = startYear; year <= endYear; year += 1) {
    holidays.push(...(INDIA_HOLIDAYS_BY_YEAR[year] ?? []));
  }
  return holidays.map((holiday) => ({
    id: `IN-${holiday.date}-${holiday.title}`,
    title: holiday.title,
    date: holiday.date,
    countryCode: 'IN',
    countryName: 'India',
    selected: true,
    source: 'India' as const,
    kind: 'holiday' as const,
  }));
}
const ClassSchedulesView = () => {
  const [targetClass, setTargetClass] = useState('Class 7');
  const [section, setSection] = useState('Section A');
  const [department, setDepartment] = useState('Science');
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
              options={[{ label: 'Class 6', value: 'Class 6' }, { label: 'Class 7', value: 'Class 7' }]}
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
              options={[{ label: 'Science', value: 'Science' }, { label: 'Arts', value: 'Arts' }]}
              className="px-3"
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
                            <div className={cn("flex items-center gap-1.5 text-[11px] font-bold opacity-70", slot.color.split(' ')[1])}>
                              <MapPin className="w-3.5 h-3.5" /> {slot.room}
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


const AcademicCalendarView = () => {
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(() => getStorageData('school_timetable_calendar_step', 1));
  const [academicYearStart, setAcademicYearStart] = useState(() => getStorageData('school_timetable_calendar_start', '2026-01-01'));
  const [academicYearEnd, setAcademicYearEnd] = useState(() => getStorageData('school_timetable_calendar_end', '2027-02-22'));
  const [semesters, setSemesters] = useState<{ id: string, name: string, start: string, end: string }[]>(() => getStorageData('school_timetable_calendar_semesters', []));
  const [newSemesterName, setNewSemesterName] = useState('');
  const [newSemesterStart, setNewSemesterStart] = useState('');
  const [newSemesterEnd, setNewSemesterEnd] = useState('');
  const [semesterError, setSemesterError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStatus, setFetchStatus] = useState('');
  const [fetchedHolidays, setFetchedHolidays] = useState<HolidayEntry[]>(() => getStorageData('school_timetable_calendar_holidays', []));
  const [customItems, setCustomItems] = useState<HolidayEntry[]>(() => getStorageData('school_timetable_calendar_custom_items', []));
  const [availableCountries, setAvailableCountries] = useState<CountryMeta[]>(() => getAllCountries());
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => getStorageData('school_timetable_calendar_country', 'ALL'));
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1));
  const [activeDate, setActiveDate] = useState('');
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'holiday' | 'event' | 'exam'>('holiday');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCountryCode, setDraftCountryCode] = useState('CUSTOM');

  useEffect(() => {
    setStorageData('school_timetable_calendar_step', setupStep);
  }, [setupStep]);

  useEffect(() => {
    setStorageData('school_timetable_calendar_start', academicYearStart);
  }, [academicYearStart]);

  useEffect(() => {
    setStorageData('school_timetable_calendar_end', academicYearEnd);
  }, [academicYearEnd]);

  useEffect(() => {
    setStorageData('school_timetable_calendar_semesters', semesters);
  }, [semesters]);

  useEffect(() => {
    setStorageData('school_timetable_calendar_holidays', fetchedHolidays);
  }, [fetchedHolidays]);

  useEffect(() => {
    setStorageData('school_timetable_calendar_custom_items', customItems);
  }, [customItems]);

  useEffect(() => {
    setStorageData('school_timetable_calendar_country', selectedCountryCode);
  }, [selectedCountryCode]);

  const years = useMemo(() => {
    const startYear = new Date(academicYearStart).getFullYear();
    const endYear = new Date(academicYearEnd).getFullYear();
    return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);
  }, [academicYearStart, academicYearEnd]);

  const countryOptions = useMemo(
    () => [
      { label: 'All Countries', value: 'ALL' },
      ...availableCountries.map((country) => ({
        label: country.countryName,
        value: country.countryCode,
      })),
    ],
    [availableCountries]
  );

  const selectedCountryName = useMemo(() => {
    if (selectedCountryCode === 'ALL') return 'All Countries';
    return availableCountries.find((country) => country.countryCode === selectedCountryCode)?.countryName ?? selectedCountryCode;
  }, [availableCountries, selectedCountryCode]);

  const getCountryName = (countryCode: string) => {
    if (countryCode === 'CUSTOM') return 'School';
    return availableCountries.find((country) => country.countryCode === countryCode)?.countryName
      ?? FALLBACK_COUNTRIES.find((country) => country.countryCode === countryCode)?.countryName
      ?? countryCode;
  };

  const openCalendarDialog = (dateString: string, mode: 'holiday' | 'event' | 'exam' = 'holiday', item?: HolidayEntry) => {
    setActiveDate(dateString);
    setDialogMode(mode);
    setEditingItemId(item?.id ?? null);
    setDraftTitle(item?.title ?? '');
    setDraftCountryCode(item?.countryCode ?? (mode === 'holiday' ? (selectedCountryCode !== 'ALL' ? selectedCountryCode : 'CUSTOM') : 'CUSTOM'));
    setCalendarDialogOpen(true);
  };

  const closeCalendarDialog = () => {
    setCalendarDialogOpen(false);
    setEditingItemId(null);
    setDraftTitle('');
    setDraftCountryCode('CUSTOM');
  };

  const handleFetchHolidays = async () => {
    setIsFetching(true);
    setFetchStatus('Fetching holiday data...');

    try {
      const countries = availableCountries.length > 0 ? availableCountries : FALLBACK_COUNTRIES;
      setAvailableCountries(countries);
      const holidayRows: HolidayEntry[] = [];

      for (const year of years) {
        const fetchTasks = countries.map(async (country) => {
          const data = await fetchPublicHolidays(year, country.countryCode);
          return data.map((holiday: any) => ({
            id: `${country.countryCode}-${holiday.date}-${holiday.name}`,
            title: holiday.name,
            date: holiday.date,
            countryCode: country.countryCode,
            countryName: country.countryName,
            selected: true,
            source: 'World' as const,
            kind: 'holiday' as const,
          }));
        });

        const worldHolidayGroups = await Promise.all(fetchTasks);
        holidayRows.push(...worldHolidayGroups.flat());
      }

      holidayRows.push(...getIndiaFallbackHolidays(years[0], years[years.length - 1]));

      const start = academicYearStart;
      const end = academicYearEnd;
      const filtered = holidayRows.filter((holiday) => holiday.date >= start && holiday.date <= end);
      const unique = new Map<string, HolidayEntry>();

      for (const holiday of filtered) {
        const key = `${holiday.date}::${holiday.title.toLowerCase()}`;
        if (!unique.has(key)) unique.set(key, holiday);
      }

      const sorted = [...unique.values()].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
      setFetchedHolidays(sorted);
      setCustomItems([]);
      setCurrentMonth(new Date(academicYearStart));
      setFetchStatus(`Loaded ${sorted.length} holidays.`);
      setSetupStep(2);
    } catch {
      setFetchStatus('Failed to fetch holidays. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const toggleHoliday = (id: string) => {
    setFetchedHolidays((prev) => prev.map((holiday) => holiday.id === id ? { ...holiday, selected: !holiday.selected } : holiday));
  };

  const selectedHolidayList = fetchedHolidays.filter((holiday) => holiday.selected);
  const visibleHolidayList = selectedCountryCode === 'ALL'
    ? [...selectedHolidayList, ...customItems]
    : [
      ...selectedHolidayList.filter((holiday) => holiday.countryCode === selectedCountryCode),
      ...customItems,
    ];
  const currentEvents = visibleHolidayList.filter((holiday) => holiday.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`));
  const activeDateItems = visibleHolidayList.filter((holiday) => holiday.date === activeDate);
  const termStartDate = new Date(academicYearStart);
  const termEndDate = new Date(academicYearEnd);
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const isPrevDisabled = currentMonth <= new Date(termStartDate.getFullYear(), termStartDate.getMonth(), 1);
  const isNextDisabled = currentMonth >= new Date(termEndDate.getFullYear(), termEndDate.getMonth(), 1);

  const saveCalendarItem = () => {
    if (!activeDate || !draftTitle.trim()) return;

    const baseItem: HolidayEntry = {
      id: editingItemId ?? `CUSTOM-${dialogMode}-${activeDate}-${Date.now()}`,
      title: draftTitle.trim(),
      date: activeDate,
      countryCode: dialogMode === 'holiday' ? draftCountryCode : 'CUSTOM',
      countryName: dialogMode === 'holiday' ? getCountryName(draftCountryCode) : 'School',
      selected: true,
      source: 'Custom',
      kind: dialogMode,
    };

    if (editingItemId) {
      const isFetchedItem = fetchedHolidays.some((holiday) => holiday.id === editingItemId);
      if (isFetchedItem) {
        setFetchedHolidays((prev) => prev.map((holiday) => holiday.id === editingItemId ? { ...holiday, ...baseItem, id: holiday.id, source: holiday.source, kind: holiday.kind } : holiday));
      } else {
        setCustomItems((prev) => prev.map((item) => item.id === editingItemId ? { ...item, ...baseItem, id: item.id } : item));
      }
    } else {
      setCustomItems((prev) => [...prev, baseItem]);
    }

    closeCalendarDialog();
  };

  const removeCalendarItem = (item: HolidayEntry) => {
    if (item.source === 'Custom') {
      setCustomItems((prev) => prev.filter((entry) => entry.id !== item.id));
      if (editingItemId === item.id) closeCalendarDialog();
      return;
    }
    setFetchedHolidays((prev) => prev.map((holiday) => holiday.id === item.id ? { ...holiday, selected: false } : holiday));
    if (editingItemId === item.id) closeCalendarDialog();
  };

  if (setupStep === 1) {
    return (
      <div className="mx-auto mt-6 w-full max-w-4xl rounded-[24px] border border-[#E9E1D5] bg-white p-5 shadow-sm animate-in fade-in zoom-in-95 sm:rounded-[32px] sm:p-8">
        <h2 className="text-2xl font-black text-[#2C2625] mb-2">Setup Academic Calendar</h2>
        <p className="text-sm font-bold text-[#2C2625]/60 mb-8">Fetch worldwide public holidays and India holidays for your term.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-[28px] border border-[#88AC88]/25 bg-[#F0F7F0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#88AC88]">Academic Year Start</p>
                <h3 className="text-lg font-black text-[#2C2625] mt-1">Start of academic year</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#88AC88] text-white flex items-center justify-center font-black">S</div>
            </div>
            <label className="block text-xs font-black text-[#2C2625] uppercase tracking-widest mb-2">Start Date</label>
            <input type="date" value={academicYearStart} onChange={(e) => setAcademicYearStart(e.target.value)} className="w-full h-12 px-4 text-sm font-black text-[#2C2625] bg-white border border-[#88AC88]/30 rounded-2xl focus:outline-none focus:border-[#88AC88] transition-all" />
          </div>
          <div className="rounded-[28px] border border-[#A78BFA]/25 bg-[#F2EDFF] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA]">Academic Year End</p>
                <h3 className="text-lg font-black text-[#2C2625] mt-1">End of academic year</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#A78BFA] text-white flex items-center justify-center font-black">E</div>
            </div>
            <label className="block text-xs font-black text-[#2C2625] uppercase tracking-widest mb-2">End Date</label>
            <input type="date" value={academicYearEnd} onChange={(e) => setAcademicYearEnd(e.target.value)} className="w-full h-12 px-4 text-sm font-black text-[#2C2625] bg-white border border-[#A78BFA]/30 rounded-2xl focus:outline-none focus:border-[#A78BFA] transition-all" />
          </div>
        </div>

        <Button onClick={handleFetchHolidays} disabled={isFetching || !academicYearStart || !academicYearEnd} className="w-full bg-[#88AC88] text-white hover:bg-[#88AC88]/90 font-black rounded-xl h-14 text-sm tracking-widest uppercase flex items-center justify-center gap-2">
          {isFetching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
          {isFetching ? 'Fetching Holidays...' : 'Fetch Public Holidays'}
        </Button>
        {fetchStatus && <p className="text-sm font-bold text-[#2C2625]/60 mt-4 text-center">{fetchStatus}</p>}
      </div>
    );
  }

  if (setupStep === 2) {
    return (
      <div className="mx-auto mt-6 w-full max-w-5xl rounded-[24px] border border-[#E9E1D5] bg-white p-5 shadow-sm animate-in slide-in-from-right-4 sm:rounded-[32px] sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-[#2C2625] mb-2">Confirm Holidays</h2>
            <p className="text-sm font-bold text-[#2C2625]/60">Same holiday names on the same date are merged once. Different dates stay visible.</p>
          </div>
          <div className="w-full sm:w-[240px]">
            <Select
              label="Country Filter"
              value={selectedCountryCode}
              onChange={setSelectedCountryCode}
              searchable
              searchPlaceholder="Search country..."
              options={countryOptions}
              className="px-3"
            />
          </div>
        </div>

        <div className="space-y-3 mb-8 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
          {visibleHolidayList.map((holiday) => (
            <div key={holiday.id} onClick={() => toggleHoliday(holiday.id)} className={cn('flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all', holiday.selected ? 'border-[#88AC88] bg-[#88AC88]/5' : 'border-[#E9E1D5] hover:bg-[#FDFBF7]')}>
              <div>
                <h4 className="text-sm font-black text-[#2C2625]">{holiday.title}</h4>
                <p className="text-xs font-bold text-[#2C2625]/60 mt-0.5">{holiday.date} - {holiday.countryName} - {holiday.countryCode} - {holiday.source}</p>
              </div>
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center border transition-all', holiday.selected ? 'bg-[#88AC88] border-[#88AC88] text-white' : 'border-[#E9E1D5] text-transparent')}>
                <Check className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSetupStep(1)} className="flex-1 bg-white text-[#2C2625] hover:bg-[#FDFBF7] font-black rounded-xl h-14 text-sm tracking-widest uppercase border-[#E9E1D5]">
            Back
          </Button>
          <Button onClick={() => {
            setSetupStep(3);
            if (semesters.length === 0 && !newSemesterStart) {
              setNewSemesterStart(academicYearStart);
            }
          }} className="flex-1 bg-[#2C2625] text-white hover:bg-[#2C2625]/90 font-black rounded-xl h-14 text-sm tracking-widest uppercase">
            Next: Semesters Setup
          </Button>
        </div>
      </div>
    );
  }

  if (setupStep === 3) {
    return (
      <div className="mx-auto mt-6 w-full max-w-4xl rounded-[24px] border border-[#E9E1D5] bg-white p-5 shadow-sm animate-in fade-in zoom-in-95 sm:rounded-[32px] sm:p-8">
        <h2 className="text-2xl font-black text-[#2C2625] mb-2">Setup Semesters</h2>
        <p className="text-sm font-bold text-[#2C2625]/60 mb-8">Add semesters within your academic year ({academicYearStart} to {academicYearEnd}).</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-black text-[#2C2625] uppercase tracking-widest mb-2">Semester Name</label>
            <Input value={newSemesterName} onChange={(e) => setNewSemesterName(e.target.value)} placeholder="e.g. Fall 2026" className="h-12 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7] text-sm font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-[#2C2625] uppercase tracking-widest mb-2">Start Date</label>
            <input type="date" min={academicYearStart} max={academicYearEnd} value={newSemesterStart} onChange={(e) => {setNewSemesterStart(e.target.value); setSemesterError('');}} className="w-full h-12 px-4 text-sm font-black text-[#2C2625] bg-[#FDFBF7] border border-[#E9E1D5] rounded-2xl focus:outline-none focus:border-[#C37A67] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-black text-[#2C2625] uppercase tracking-widest mb-2">End Date</label>
            <input type="date" min={academicYearStart} max={academicYearEnd} value={newSemesterEnd} onChange={(e) => {setNewSemesterEnd(e.target.value); setSemesterError('');}} className="w-full h-12 px-4 text-sm font-black text-[#2C2625] bg-[#FDFBF7] border border-[#E9E1D5] rounded-2xl focus:outline-none focus:border-[#C37A67] transition-all" />
          </div>
        </div>
        
        {semesterError && <p className="text-sm font-bold text-[#E63946] mb-4">{semesterError}</p>}
        
        <Button 
          onClick={() => {
            if (!newSemesterName || !newSemesterStart || !newSemesterEnd) {
              setSemesterError("All fields are required.");
              return;
            }
            if (newSemesterStart < academicYearStart || newSemesterEnd > academicYearEnd) {
              setSemesterError("Dates must be within the academic year.");
              return;
            }
            if (newSemesterStart > newSemesterEnd) {
              setSemesterError("Start date cannot be after end date.");
              return;
            }
            setSemesters(prev => [...prev, { id: Date.now().toString(), name: newSemesterName, start: newSemesterStart, end: newSemesterEnd }]);
            setNewSemesterName('');
            setNewSemesterStart('');
            setNewSemesterEnd('');
            setSemesterError('');
          }} 
          className="w-full sm:w-auto bg-[#C37A67] text-white hover:bg-[#C37A67]/90 font-black rounded-xl h-12 px-8 text-sm tracking-widest uppercase mb-8"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Semester
        </Button>

        <div className="space-y-3 mb-8">
          {semesters.map(sem => (
            <div key={sem.id} className="flex items-center justify-between p-4 rounded-xl border border-[#E9E1D5] bg-[#FDFBF7]">
              <div>
                <h4 className="text-sm font-black text-[#2C2625]">{sem.name}</h4>
                <p className="text-xs font-bold text-[#2C2625]/60 mt-0.5">{sem.start} to {sem.end}</p>
              </div>
              <Button variant="ghost" onClick={() => setSemesters(prev => prev.filter(s => s.id !== sem.id))} className="h-8 px-3 text-xs font-bold text-[#E63946] hover:bg-[#E63946]/10 rounded-lg">
                Remove
              </Button>
            </div>
          ))}
          {semesters.length === 0 && <p className="text-sm font-bold text-[#2C2625]/50 text-center py-4">No semesters added yet.</p>}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSetupStep(2)} className="flex-1 bg-white text-[#2C2625] hover:bg-[#FDFBF7] font-black rounded-xl h-14 text-sm tracking-widest uppercase border-[#E9E1D5]">
            Back
          </Button>
          <Button onClick={() => setSetupStep(4)} className="flex-1 bg-[#2C2625] text-white hover:bg-[#2C2625]/90 font-black rounded-xl h-14 text-sm tracking-widest uppercase">
            Generate Calendar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-0 sm:mx-4 lg:mx-6 mt-3 sm:mt-6 animate-in fade-in relative">
      <div className="bg-white rounded-[32px] border border-[#E9E1D5] shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-[#E9E1D5] bg-[#FDFBF7] flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2C2625]/45">Academic Calendar</p>
            <h3 className="text-2xl font-black text-[#2C2625] mt-2">{HOLIDAY_MONTH_LABELS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <p className="text-xs font-bold text-[#2C2625]/50 mt-1">Country filter: {selectedCountryName}. Click any date to add or edit a holiday or event.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => !isPrevDisabled && setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} disabled={isPrevDisabled} className="w-10 h-10 rounded-xl border-[#E9E1D5] p-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={() => !isNextDisabled && setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} disabled={isNextDisabled} className="w-10 h-10 rounded-xl border-[#E9E1D5] p-0">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="mb-3 grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-center text-[9px] font-black uppercase tracking-[0.16em] text-[#2C2625]/45 sm:text-[11px] sm:tracking-[0.25em]">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square sm:aspect-auto min-h-0 rounded-xl border border-transparent sm:min-h-[112px] sm:rounded-2xl" />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = visibleHolidayList.filter((holiday) => holiday.date === dateString);
              const inTerm = dateString >= academicYearStart && dateString <= academicYearEnd;
              const semesterStarts = semesters.filter(s => s.start === dateString);
              const semesterEnds = semesters.filter(s => s.end === dateString);
              const isSemesterDay = semesterStarts.length > 0 || semesterEnds.length > 0;

              const primaryKind: CalendarToneKey | null = dayEvents.some((holiday) => holiday.kind === 'event')
                ? 'event'
                : dayEvents.some((holiday) => holiday.kind === 'exam')
                  ? 'exam'
                  : dayEvents.length
                    ? 'holiday'
                    : null;
              const tone = primaryKind ? getCalendarTone(primaryKind) : null;
              return (
                <button
                  type="button"
                  key={dateString}
                  onClick={() => openCalendarDialog(dateString)}
                  className={cn(
                    'aspect-square sm:aspect-auto min-h-0 rounded-xl border p-1.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C37A67]/20 sm:min-h-[112px] sm:rounded-2xl sm:p-3',
                    !tone && !isSemesterDay && (inTerm ? 'border-[#E9E1D5] bg-white hover:border-[#C37A67]/35' : 'border-dashed border-[#E9E1D5] bg-[#FCFAF6] hover:border-[#C37A67]/25'),
                    tone && cn(tone.soft, tone.border, 'shadow-sm sm:border-transparent sm:shadow-lg sm:hover:shadow-xl', primaryKind === 'event' ? 'sm:bg-[#A78BFA]' : primaryKind === 'exam' ? 'sm:bg-[#6D8FE3]' : 'sm:bg-[#88AC88]'),
                    isSemesterDay && !tone && 'bg-[#FDF6EA] border-[#E4B76D]/35 shadow-sm sm:border-transparent sm:shadow-lg sm:hover:shadow-xl sm:bg-[#E4B76D]'
                  )}
                >
                  <div className="flex items-start justify-between sm:items-center">
                    <span className={cn('text-xs font-black sm:text-sm', tone ? 'text-[#2C2625] sm:text-white' : isSemesterDay ? 'text-[#2C2625]' : inTerm ? 'text-[#2C2625]' : 'text-[#2C2625]/35')}>{day}</span>
                  </div>
                  <div className="mt-1.5 sm:mt-3 sm:space-y-1.5">
                    <div className="flex items-center gap-1 sm:hidden">
                      {(semesterStarts.length > 0 || semesterEnds.length > 0) && <span className="h-1.5 w-1.5 rounded-full bg-[#E4B76D]" />}
                      {dayEvents.slice(0, 3).map((holiday, holidayIndex) => (
                        <span
                          key={`${holiday.id}-${holidayIndex}`}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            holiday.kind === 'event'
                              ? 'bg-[#A78BFA]'
                              : holiday.kind === 'exam'
                                ? 'bg-[#6D8FE3]'
                                : 'bg-[#88AC88]'
                          )}
                        />
                      ))}
                      {dayEvents.length > 3 && <span className="text-[8px] font-black text-[#2C2625]/50">+{dayEvents.length - 3}</span>}
                    </div>
                    <div className="hidden sm:block sm:space-y-1.5">
                      {semesterStarts.map(sem => (
                        <div key={`start-${sem.id}`} className="rounded-lg px-1.5 py-1 text-[9px] font-bold text-[#2C2625] bg-[#E4B76D] shadow-sm sm:bg-transparent sm:shadow-none sm:px-0 sm:py-0 sm:text-[11px]">
                          <span className="block truncate">{sem.name} Start</span>
                        </div>
                      ))}
                      {semesterEnds.map(sem => (
                        <div key={`end-${sem.id}`} className="rounded-lg px-1.5 py-1 text-[9px] font-bold text-[#2C2625] bg-[#E4B76D] shadow-sm sm:bg-transparent sm:shadow-none sm:px-0 sm:py-0 sm:text-[11px]">
                          <span className="block truncate">{sem.name} End</span>
                        </div>
                      ))}
                      {dayEvents.slice(0, 3).map((holiday, holidayIndex) => (
                        <div
                          key={`${holiday.id}-${holidayIndex}`}
                          className={cn(
                            'rounded-lg px-1.5 py-1 text-[9px] font-bold text-white shadow-sm sm:bg-transparent sm:shadow-none sm:px-0 sm:py-0 sm:text-[11px]',
                            holiday.kind === 'event'
                              ? getCalendarTone('event').main
                              : holiday.kind === 'exam'
                                ? getCalendarTone('exam').main
                                : getCalendarTone('holiday').main
                          )}
                        >
                          <span className="block truncate">{holiday.title}</span>
                          <span className="hidden text-[10px] opacity-80 sm:block">{holiday.countryName}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && <p className="text-[9px] font-bold text-[#2C2625]/50 sm:text-[11px]">+{dayEvents.length - 3} more</p>}
                      {(!dayEvents.length && !semesterStarts.length && !semesterEnds.length) && <div className="pt-8 text-center text-[11px] font-bold text-[#2C2625]/25">Click to add</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-[#E9E1D5] bg-[#FDFBF7] p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E4B76D] text-[#2C2625] px-3 py-1.5 text-xs font-bold shadow-sm"><span className="w-2 h-2 rounded-full bg-[#2C2625]/90" />Semester</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#88AC88] text-white px-3 py-1.5 text-xs font-bold shadow-sm"><span className="w-2 h-2 rounded-full bg-white/90" />Holiday</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#A78BFA] text-white px-3 py-1.5 text-xs font-bold shadow-sm"><span className="w-2 h-2 rounded-full bg-white/90" />Event</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#6D8FE3] text-white px-3 py-1.5 text-xs font-bold shadow-sm"><span className="w-2 h-2 rounded-full bg-white/90" />Exam</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-[#2C2625]/45 mb-3">Selected Items in this Month</p>
            <div className="flex flex-wrap gap-2">
              {currentEvents.length ? currentEvents.map((holiday) => (
                <button
                  type="button"
                  key={holiday.id}
                  onClick={() => openCalendarDialog(holiday.date, holiday.kind, holiday)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02]',
                    holiday.kind === 'event'
                      ? getCalendarTone('event').main
                      : holiday.kind === 'exam'
                        ? getCalendarTone('exam').main
                        : getCalendarTone('holiday').main
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-white/90" />
                  {holiday.title} - {holiday.countryCode}
                </button>
              )) : <span className="text-sm font-medium text-[#2C2625]/55">No holidays in this month for the selected range.</span>}
            </div>
          </div>
        </div>
      </div>

      {calendarDialogOpen && activeDate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-2xl bg-black/10 p-4">
          <button type="button" className="absolute inset-0" onClick={closeCalendarDialog} />
          <div className="relative z-10 w-full max-w-2xl h-[calc(100dvh-1rem)] sm:h-[620px] rounded-[40px] border border-[#E9E1D5]/60 bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
            <div className="bg-[#FDFBF7] border-b border-[#E9E1D5] p-5 md:p-6 flex items-start justify-between gap-4 shrink-0">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#2C2625]/45">Date Actions</p>
                <h4 className="text-2xl font-black text-[#2C2625] mt-2">{activeDate}</h4>
                <p className="text-sm font-bold text-[#2C2625]/55 mt-1">Add a holiday, add an event, edit the name, or remove an existing holiday.</p>
              </div>
              <Button variant="outline" onClick={closeCalendarDialog} className="w-10 h-10 rounded-xl border-[#E9E1D5] p-0 bg-white">
                <Check className="w-4 h-4 rotate-45" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0 flex-1 overflow-hidden">
              <div className="p-5 md:p-6 border-b lg:border-b-0 lg:border-r border-[#E9E1D5] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h5 className="text-sm font-black uppercase tracking-widest text-[#2C2625]/45">Existing items</h5>
                </div>
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  {activeDateItems.length ? activeDateItems.map((item) => (
                    <div key={item.id} className={cn('rounded-2xl border p-4 shadow-sm', item.kind === 'event' ? 'border-[#A78BFA]/25 bg-[#F9F5FF]' : item.kind === 'exam' ? 'border-[#6D8FE3]/25 bg-[#F2F6FF]' : 'border-[#88AC88]/25 bg-[#F5FAF5]')}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h6 className="text-sm font-black text-[#2C2625] truncate">{item.title}</h6>
                            <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white', item.kind === 'event' ? getCalendarTone('event').main : item.kind === 'exam' ? getCalendarTone('exam').main : getCalendarTone('holiday').main)}>
                              {item.kind}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#2C2625]/55 mt-1">
                            {item.countryName} � {item.countryCode} � {item.source}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" onClick={() => openCalendarDialog(activeDate, item.kind, item)} className="h-9 px-3 rounded-xl border-[#E9E1D5] bg-white text-xs font-bold">
                            Edit
                          </Button>
                          <Button variant="outline" onClick={() => removeCalendarItem(item)} className="h-9 px-3 rounded-xl border-[#E9E1D5] bg-white text-xs font-bold text-[#C37A67] hover:bg-[#C37A67]/5">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-[#E9E1D5] bg-[#FCFAF6] p-6 text-center">
                      <p className="text-sm font-bold text-[#2C2625]/55">No items on this date yet.</p>
                      <p className="text-xs font-medium text-[#2C2625]/40 mt-1">Use the form on the right to add your own holiday or event.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 md:p-6 bg-white flex flex-col overflow-hidden">
                <div className="rounded-[24px] border border-[#E9E1D5] bg-[#FDFBF7] p-4 mb-4 shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2C2625]/45 mb-3">Color Guide</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2C2625]/70"><span className="w-3 h-3 rounded-full bg-[#88AC88]" />Holiday / Manual Holiday</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2C2625]/70"><span className="w-3 h-3 rounded-full bg-[#A78BFA]" />Event</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2C2625]/70"><span className="w-3 h-3 rounded-full bg-[#6D8FE3]" />Exam</div>
                  </div>
                </div>

                <h5 className="text-sm font-black uppercase tracking-widest text-[#2C2625]/45 mb-4 shrink-0">Add or edit</h5>
                <div className="flex gap-2 p-1 rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5] mb-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDialogMode('holiday')}
                    className={cn(
                      'flex-1 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors',
                      dialogMode === 'holiday' ? 'bg-white shadow-sm text-[#2C2625]' : 'text-[#2C2625]/45 hover:text-[#2C2625]'
                    )}
                  >
                    Holiday
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialogMode('event')}
                    className={cn(
                      'flex-1 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors',
                      dialogMode === 'event' ? 'bg-white shadow-sm text-[#2C2625]' : 'text-[#2C2625]/45 hover:text-[#2C2625]'
                    )}
                  >
                    Event
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#2C2625]/45 mb-2">Title</label>
                    <Input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder={dialogMode === 'event' ? 'Enter event name' : dialogMode === 'exam' ? 'Enter exam name' : 'Enter holiday name'}
                      className="h-12 rounded-2xl border-[#E9E1D5] bg-[#FDFBF7] text-sm font-bold"
                    />
                  </div>

                  {dialogMode === 'holiday' && (
                    <div>
                      <Select
                        label="Country"
                        value={draftCountryCode}
                        onChange={setDraftCountryCode}
                        searchable
                        searchPlaceholder="Search country..."
                        options={[
                          { label: 'School / Custom', value: 'CUSTOM' },
                          ...countryOptions.filter((option) => option.value !== 'ALL'),
                        ]}
                        className="px-3"
                      />
                    </div>
                  )}

                  <div className="rounded-2xl bg-[#FDFBF7] border border-[#E9E1D5] p-4">
                    <p className="text-xs font-bold text-[#2C2625]/60">
                      {editingItemId ? 'You are editing an existing item.' : 'You are creating a new item for this date.'}
                    </p>
                    <p className="text-xs font-bold text-[#2C2625]/45 mt-1">
                      Holiday names can be edited, and custom school events can be added separately.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={closeCalendarDialog} className="flex-1 bg-white text-[#2C2625] hover:bg-[#FDFBF7] font-black rounded-xl h-12 text-sm tracking-widest uppercase border-[#E9E1D5]">
                      Close
                    </Button>
                    <Button onClick={saveCalendarItem} disabled={!draftTitle.trim()} className="flex-1 bg-[#2C2625] text-white hover:bg-[#2C2625]/90 font-black rounded-xl h-12 text-sm tracking-widest uppercase">
                      {editingItemId ? 'Save Changes' : 'Add Item'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const TeacherWorkloadView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
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
              options={[{ label: 'All Classes', value: 'All Classes' }, { label: 'Class 6', value: 'Class 6' }, { label: 'Class 7', value: 'Class 7' }]}
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
              options={[{ label: 'All Departments', value: 'All Departments' }, { label: 'Science', value: 'Science' }, { label: 'Mathematics', value: 'Mathematics' }, { label: 'English', value: 'English' }, { label: 'History', value: 'History' }]}
              className="h-10 text-xs px-3"
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


import { useAuth } from '../context/AuthContext';
import { StudentTimetable } from '../components/timetable/StudentTimetable';
import { TeacherTimetable } from '../components/timetable/TeacherTimetable';
import { HodTimetable } from '../components/timetable/HodTimetable';
import { ClassTeacherTimetable } from '../components/timetable/ClassTeacherTimetable';
import { ParentTimetable } from '../components/timetable/ParentTimetable';

export default function TimetablePage() {
  const { activeRole } = useAuth();
  const navigate = useNavigate();
  
  if (activeRole === 'STUDENT') {
    return <StudentTimetable />;
  }

  if (activeRole === 'TEACHER') {
    return <TeacherTimetable />;
  }

  if (activeRole === 'CLASS_TEACHER') {
    return <ClassTeacherTimetable />;
  }

  if (activeRole === 'PARENT') {
    return <ParentTimetable />;
  }

  if (activeRole === 'HOD') {
    return <HodTimetable />;
  }

  const [activeView, setActiveView] = useState('dashboard');

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({ class: '', section: '', department: '', teacher: '' });

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
                  options={[
                    { label: 'Class 6', value: 'Class 6' },
                    { label: 'Class 7', value: 'Class 7' },
                    { label: 'Class 8', value: 'Class 8' },
                    { label: 'Class 9', value: 'Class 9' },
                    { label: 'Class 10', value: 'Class 10' },
                    { label: 'Class 11', value: 'Class 11' },
                    { label: 'Class 12', value: 'Class 12' }
                  ]}
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
                  options={[{ label: 'Science', value: 'Science' }, { label: 'Arts', value: 'Arts' }]}
                  className="h-10 text-xs bg-white rounded-xl"
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
            { id: 'calendar', label: 'ACADEMIC CALENDAR', icon: Calendar },
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

        {activeView === 'calendar' && <AcademicCalendarView />}
      </main>


    </div>
  );
}

