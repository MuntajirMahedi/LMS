import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Download,
  LayoutGrid,
  List,
  UserCheck,
  UserMinus,
  AlertTriangle,
  History,
  BarChart3,
  Save,
  RefreshCcw,
  FileText,
  User,
  GraduationCap,
  ShieldAlert
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { cn } from "../lib/utils";
import { getStorageData, setStorageData } from "../lib/storage";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import ParentAttendance from "../components/attendance/ParentAttendance";

// --- MOCK DATA ---

const ATTENDANCE_STORAGE_KEY = 'school_attendance_marking';
const ATTENDANCE_REASON_STORAGE_KEY = 'school_attendance_reasons';

const ATTENDANCE_KPIS = [
  { label: "Total Students", value: "1,248", icon: Users, color: "bg-primary" },
  { label: "Present Today", value: "1,156", icon: CheckCircle2, color: "bg-brand-green" },
  { label: "Absent Today", value: "42", icon: XCircle, color: "bg-brand-orange" },
  { label: "Late Arrivals", value: "32", icon: Clock, color: "bg-brand-purple" },
  { label: "Half Day", value: "18", icon: UserMinus, color: "bg-brand-blue" },
  { label: "Attendance %", value: "94.2%", icon: BarChart3, color: "bg-oat" },
];

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D"];
const SUBJECTS = ["General", "Mathematics", "Science", "English", "Social Studies", "Physics", "Chemistry", "Biology"];
const DEPARTMENTS = ["General", "Science", "Commerce", "Arts"];

const STUDENTS_FOR_MARKING = [
  { id: "S001", name: "Sarah Jenkins", roll: "2026001", class: "10-A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "Present" },
  { id: "S003", name: "Emily Wilson", roll: "2026085", class: "10-A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily", status: "Late" },
  { id: "S002", name: "Michael Chen", roll: "2026042", class: "10-A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael", status: "Absent" },
  { id: "S004", name: "Robert Taylor", roll: "2026112", class: "10-A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert", status: "Half Day" },
  { id: "S005", name: "Jessica Alba", roll: "2026154", class: "10-A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica", status: "" },
  { id: "S006", name: "David Miller", roll: "2026198", class: "10-A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David", status: "" },
];

const ATTENDANCE_RECORDS = [
  { id: "R001", name: "Sarah Jenkins", roll: "2026001", class: "10-A", status: "Present", time: "08:15 AM", markedBy: "Dr. Arthur", remarks: "Early arrival", updated: "2h ago" },
  { id: "R002", name: "Michael Chen", roll: "2026042", class: "10-A", status: "Absent", time: "-", markedBy: "Dr. Arthur", remarks: "Uninformed", updated: "2h ago" },
  { id: "R003", name: "Emily Wilson", roll: "2026085", class: "10-A", status: "Late", time: "09:10 AM", markedBy: "Dr. Arthur", remarks: "Bus delay", updated: "1h ago" },
  { id: "R004", name: "Robert Taylor", roll: "2026112", class: "10-A", status: "Half Day", time: "08:30 AM", markedBy: "Dr. Arthur", remarks: "Doctor appt", updated: "30m ago" },
];


// --- STUDENT MOCK DATA ---

const STUDENT_DAY_LOG = [
  { period: "1st Period", subject: "Mathematics", time: "08:15 AM - 09:00 AM", status: "Present" },
  { period: "2nd Period", subject: "Science", time: "09:00 AM - 09:45 AM", status: "Present" },
  { period: "3rd Period", subject: "English", time: "10:00 AM - 10:45 AM", status: "Half Day (Exit)" },
  { period: "4th Period", subject: "Lunch Break", time: "10:45 AM - 11:30 AM", status: "Absent" },
  { period: "5th Period", subject: "History", time: "11:30 AM - 12:15 PM", status: "Absent" },
  { period: "6th Period", subject: "Physics", time: "12:15 PM - 01:00 PM", status: "Absent" },
];

const AttendancePage: React.FC = () => {
  const { activeRole } = useAuth();
  const [markedStudents, setMarkedStudents] = useState(() =>
    [...getStorageData(ATTENDANCE_STORAGE_KEY, STUDENTS_FOR_MARKING)].sort((a, b) => a.roll.localeCompare(b.roll))
  );
  const [markedReasons, setMarkedReasons] = useState<Record<string, string>>(() => getStorageData(ATTENDANCE_REASON_STORAGE_KEY, {}));
  const [activeTab, setActiveTab] = useState<"marking" | "records" | "analytics">("marking");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [selectedClass, setSelectedClass] = useState("10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedPeriod, setSelectedPeriod] = useState("1st Period");
  const [selectedDepartment, setSelectedDepartment] = useState("General");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentViewDate, setStudentViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordFilterDate, setRecordFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const todayStr = new Date().toISOString().split('T')[0];

  // Analytics Specific Local Filters
  const [anaClass, setAnaClass] = useState("10");
  const [anaSection, setAnaSection] = useState("A");
  const [anaDept, setAnaDept] = useState("General");
  const [anaDate, setAnaDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setStorageData(ATTENDANCE_STORAGE_KEY, markedStudents);
  }, [markedStudents]);

  useEffect(() => {
    setStorageData(ATTENDANCE_REASON_STORAGE_KEY, markedReasons);
  }, [markedReasons]);

  const handleStatusChange = (studentId: string, status: string) => {
    setMarkedStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        // Toggle off if clicking the same status
        return { ...s, status: s.status === status ? "" : status };
      }
      return s;
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setMarkedReasons(prev => ({ ...prev, [studentId]: reason }));
  };

  const handleBulkMarkPresent = () => {
    setMarkedStudents(prev => prev.map(s => ({ ...s, status: "Present" })));
  };

  // --- Dynamic Attendance Calculation ---
  const SUBJECT_PERFORMANCE = [
    { name: "Mathematics", percentage: 94.5, status: "Excellent", attended: 85, total: 90 },
    { name: "Science", percentage: 88.2, status: "Good", attended: 75, total: 85 },
    { name: "English", percentage: 91.0, status: "Very Good", attended: 82, total: 90 },
    { name: "Physics", percentage: 96.8, status: "Excellent", attended: 30, total: 31 },
    { name: "History", percentage: 82.4, status: "Average", attended: 14, total: 17 }
  ];

  const overallAttendance = useMemo(() => {
    const totalAttended = SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + curr.attended, 0);
    const totalHeld = SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + curr.total, 0);
    return ((totalAttended / totalHeld) * 100).toFixed(1);
  }, []);

  const totalAbsences = SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + (curr.total - curr.attended), 0);

  const studentSummary = [
    { label: "Overall Attendance %", value: `${overallAttendance}%`, icon: BarChart3, color: "bg-primary" },
    { label: "Total Subject Periods", value: SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + curr.total, 0).toString(), icon: Calendar, color: "bg-oat" },
    { label: "Periods Attended", value: SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + curr.attended, 0).toString(), icon: CheckCircle2, color: "bg-brand-green" },
    { label: "Periods Missed", value: totalAbsences.toString(), icon: XCircle, color: "bg-brand-orange" },
    { label: "Late Arrivals", value: "04", icon: Clock, color: "bg-brand-purple" },
    { label: "Half Days", value: "01", icon: UserMinus, color: "bg-brand-blue" },
  ];

  const isStudent = activeRole === "STUDENT";

  // --- STUDENT VIEW COMPONENTS ---

  const renderStudentView = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 1. Student Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 lg:px-6">
        <div>
          <h1 className="text-4xl font-black text-[#3A2C2B] tracking-tight">Personal Attendance</h1>
          <p className="text-sm text-muted-foreground font-medium mt-2">Cumulative performance and daily period tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 h-11 px-6 font-black uppercase text-[10px] tracking-widest gap-2 bg-white">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* 2. Cumulative Summary Cards - 2-Column on Mobile */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
          {studentSummary.map((kpi, i) => (
            <StatsCard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} color={kpi.color} />
          ))}
        </div>
      </div>

      {/* 3. Daily Breakdown Section */}
      <div className="px-4 lg:px-6 space-y-6">
        <Card className="rounded-[28px] border-none shadow-lg bg-white/80 backdrop-blur-md border border-white/20 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group">
          <CardContent className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#3A2C2B]">Daily Period Breakdown</h3>
                <p className="text-sm text-muted-foreground font-medium">Track your presence across every subject period</p>
              </div>

              {/* Date Filter */}
              <div className="flex flex-col space-y-2 min-w-[200px]">
                <div className="flex items-center gap-2 ml-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Tracking Date</label>
                </div>
                <Input
                  type="date"
                  value={studentViewDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStudentViewDate(e.target.value)}
                  className="h-11 rounded-xl border-primary/20 shadow-sm bg-white font-bold text-[#3A2C2B]"
                />
              </div>
            </div>

            {/* Period Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {STUDENT_DAY_LOG.map((log, i) => (
                <div key={i} className={cn(
                  "relative p-6 rounded-[24px] border transition-all duration-300 group",
                  log.status === 'Present' ? "bg-brand-green/5 border-brand-green/10" :
                    log.status.includes('Half Day') ? "bg-brand-orange/5 border-brand-orange/20" :
                      "bg-destructive/5 border-destructive/10 opacity-70"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                      log.status === 'Present' ? "bg-brand-green text-white" :
                        log.status.includes('Half Day') ? "bg-brand-orange text-white" :
                          "bg-destructive text-white"
                    )}>
                      {log.status === 'Present' ? <CheckCircle2 className="w-5 h-5" /> :
                        log.status.includes('Half Day') ? <UserMinus className="w-5 h-5" /> :
                          <XCircle className="w-5 h-5" />}
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-current",
                      log.status === 'Present' ? "text-brand-green" :
                        log.status.includes('Half Day') ? "text-brand-orange" :
                          "text-destructive"
                    )}>
                      {log.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-[#3A2C2B] leading-tight">{log.subject}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{log.period}</p>
                    <div className="flex items-center gap-2 mt-4 text-[#3A2C2B]/60">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Subject Performance Summary */}
      <div className="px-4 lg:px-6">
        <Card className="rounded-[32px] border-none shadow-xl bg-[#3A2C2B] text-white p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h3 className="text-2xl font-black italic">Subject Wise Consistency</h3>
            <p className="text-xs font-bold text-white/60 tracking-widest uppercase">Target Eligibility: 75.00%</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {SUBJECT_PERFORMANCE.map((sub, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{sub.name}</p>
                <h4 className="text-4xl font-black tracking-tighter">{sub.percentage}%</h4>
                <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-brand-green rounded-full" style={{ width: `${sub.percentage}%` }} />
                </div>
                <p className={cn(
                  "text-[9px] font-bold uppercase mt-1",
                  sub.percentage >= 90 ? "text-brand-green" : sub.percentage >= 75 ? "text-brand-blue" : "text-brand-orange"
                )}>{sub.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // --- SHARED COMPONENTS ---

  const renderAttendanceHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 lg:px-6">
      <div>
        <h1 className="text-4xl font-black text-[#3A2C2B] tracking-tight">Attendance Management</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary font-bold px-3">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold px-3">
            Session: 2026-27
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 h-11 px-6 font-black uppercase text-[10px] tracking-widest gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
        <Button className="rounded-xl bg-primary text-white h-11 px-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
          <Save className="w-4 h-4 mr-2" /> Save Attendance
        </Button>
      </div>
    </div>
  );

  const renderFilterSection = () => (
    <div className="px-4 lg:px-6">
      <Card className="rounded-[32px] border-none shadow-xl bg-white/80 backdrop-blur-md border border-white/20 relative z-20">
        <CardContent className="p-3.5 md:p-8 space-y-3 md:space-y-8">
          {/* Top Row: Global Search & Active Session Info */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="w-full xl:max-w-xl">
              <div className="flex items-center gap-2 ml-1 mb-1.5">
                <Search className="w-3 h-3 text-primary" />
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">Quick Search</label>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <Input
                  placeholder="Search by name, roll number, or ID..."
                  className="pl-12 h-12 rounded-2xl border-border/40 bg-white shadow-sm focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end text-left md:text-right">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black px-4 py-1.5 mb-2 rounded-xl text-[10px] uppercase tracking-widest">
                Active Marking Session
              </Badge>
              <h3 className="text-xl font-black text-[#3A2C2B] leading-tight">
                {selectedClass}-{selectedSection} • {selectedSubject}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {markingDate} • {selectedPeriod} • Session 2026-27
              </p>
            </div>
          </div>

          {/* Bottom Row: Hierarchical Filters - 2-Column Grid on Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-6 items-end">
            {/* 1. Academic Year */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 ml-1">
                <Calendar className="w-2.5 h-2.5 text-primary" />
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.12em]">Academic Year</label>
              </div>
              <Select value="2026-27" options={[{ label: "2026-27", value: "2026-27" }]} className="h-11 shadow-sm" />
            </div>

            {/* 2. Date Filter */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 ml-1">
                <Calendar className="w-3 h-3 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Attendance Date</label>
              </div>
              <Input
                type="date"
                value={markingDate}
                min={todayStr}
                max={todayStr}
                onChange={(e) => setMarkingDate(e.target.value)}
                className="h-11 rounded-xl border-primary/20 shadow-sm bg-white font-bold text-[#3A2C2B]"
              />
            </div>

            {/* 3. Class */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 ml-1">
                <GraduationCap className="w-3 h-3 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Select Class</label>
              </div>
              <Select value={selectedClass} onChange={setSelectedClass} options={CLASSES.map(c => ({ label: c, value: c }))} className="h-11 shadow-sm" />
            </div>

            {/* 4. Department */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 ml-1">
                <Users className="w-3 h-3 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Department</label>
              </div>
              <Select value={selectedDepartment} onChange={setSelectedDepartment} options={DEPARTMENTS.map(d => ({ label: d, value: d }))} className="h-11 shadow-sm" />
            </div>

            {/* 5. Section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 ml-1">
                <LayoutGrid className="w-3 h-3 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Section</label>
              </div>
              <Select value={selectedSection} onChange={setSelectedSection} options={SECTIONS.map(s => ({ label: s, value: s }))} className="h-11 shadow-sm" />
            </div>

            {/* 6. Period */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 ml-1">
                <Clock className="w-3 h-3 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Select Period</label>
              </div>
              <Select value={selectedPeriod} onChange={setSelectedPeriod} options={["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(p => ({ label: p, value: `${p} Period` }))} className="h-11 shadow-sm" />
            </div>

            {/* 7. Subject */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 ml-1">
                <FileText className="w-3 h-3 text-primary" />
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Select Subject</label>
              </div>
              <Select value={selectedSubject} onChange={setSelectedSubject} options={SUBJECTS.map(s => ({ label: s, value: s }))} className="h-11 shadow-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAttendanceMarking = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h3 className="text-2xl font-black text-[#3A2C2B]">Student Directory</h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">Select students to update their attendance status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl">
            <button onClick={() => setViewMode('card')} className={cn("p-2 rounded-lg transition-all", viewMode === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={cn("p-2 rounded-lg transition-all", viewMode === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleBulkMarkPresent} variant="outline" className="rounded-xl h-11 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6">
            <UserCheck className="w-4 h-4 mr-2" /> Bulk Mark Present
          </Button>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className={cn(
          "flex overflow-x-auto no-scrollbar gap-6 pb-12 px-4 -mx-4 scroll-smooth", // Mobile: Horizontal Scroll
          "md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:pb-10 md:px-0 md:mx-0" // Desktop: Grid
        )}>
          {markedStudents.map((student) => (
            <Card key={student.id} className="flex-none w-[300px] md:w-full rounded-[32px] border-none shadow-xl bg-white overflow-hidden group md:hover:-translate-y-1 transition-all duration-300 h-fit">
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-soft-parchment flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      <img src={student.avatar} alt={student.name} className="w-14 h-14 object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-black truncate">{student.name}</h4>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Roll: {student.roll}</p>
                      <p className="text-[10px] font-bold text-primary uppercase">Class {student.class}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleStatusChange(student.id, 'Present')}
                      variant={student.status === 'Present' ? 'default' : 'outline'}
                      className={cn("h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", student.status === 'Present' ? "bg-brand-green hover:bg-brand-green/90 text-white" : "border-brand-green/20 text-brand-green hover:bg-brand-green/5")}
                    >
                      Present
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(student.id, 'Absent')}
                      variant={student.status === 'Absent' ? 'default' : 'outline'}
                      className={cn("h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", student.status === 'Absent' ? "bg-destructive hover:bg-destructive/90 text-white" : "border-destructive/20 text-destructive hover:bg-destructive/5")}
                    >
                      Absent
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(student.id, 'Late')}
                      variant={student.status === 'Late' ? 'default' : 'outline'}
                      className={cn("h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", student.status === 'Late' ? "bg-brand-purple hover:bg-brand-purple/90 text-white" : "border-brand-purple/20 text-brand-purple hover:bg-brand-purple/5")}
                    >
                      Late
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(student.id, 'Half Day')}
                      variant={student.status === 'Half Day' ? 'default' : 'outline'}
                      className={cn("h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", student.status === 'Half Day' ? "bg-brand-orange hover:bg-brand-orange/90 text-white" : "border-brand-orange/20 text-brand-orange hover:bg-brand-orange/5")}
                    >
                      Half Day
                    </Button>
                  </div>

                  {student.status === 'Late' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[9px] font-black text-destructive uppercase tracking-widest flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Reason for Late
                        </label>
                        {!markedReasons[student.id] && (
                          <span className="text-[8px] font-bold text-destructive uppercase animate-pulse">* Required</span>
                        )}
                      </div>
                      <Input
                        placeholder="Why is the student late?"
                        value={markedReasons[student.id] || ""}
                        onChange={(e) => handleReasonChange(student.id, e.target.value)}
                        className="h-10 rounded-xl ring-1 ring-destructive/30 bg-destructive/5 focus:ring-destructive text-xs"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-[32px] border-none shadow-xl bg-white relative z-10 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left table-fixed min-w-[800px]">
                <thead>
                  <tr className="bg-[#3A2C2B] text-white/70">
                    <th className="w-[35%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Student</th>
                    <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Roll Number</th>
                    <th className="w-[40%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {markedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-8 py-5 align-top">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} className="w-8 h-8 rounded-lg bg-soft-parchment" alt="" />
                          <span className="text-sm font-black text-[#3A2C2B]">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-muted-foreground align-top">{student.roll}</td>
                      <td className="px-8 py-5 align-top">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex justify-center gap-2">
                            {[
                              { label: 'P', value: 'Present' },
                              { label: 'A', value: 'Absent' },
                              { label: 'L', value: 'Late' },
                              { label: 'HD', value: 'Half Day' }
                            ].map((s) => (
                              <button
                                key={s.label}
                                onClick={() => handleStatusChange(student.id, s.value)}
                                className={cn("w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all border",
                                  student.status === s.value ? "bg-primary text-white border-primary" : "border-border/30 hover:border-primary/30 text-muted-foreground"
                                )}>{s.label}</button>
                            ))}
                          </div>
                          {student.status === 'Late' && (
                            <div className="w-full max-w-[240px] animate-in slide-in-from-top-2 duration-300 space-y-1">
                              {!markedReasons[student.id] && (
                                <div className="flex justify-end">
                                  <span className="text-[7px] font-black text-destructive uppercase animate-pulse">* Required</span>
                                </div>
                              )}
                              <Input
                                placeholder="Reason for late..."
                                value={markedReasons[student.id] || ""}
                                onChange={(e) => handleReasonChange(student.id, e.target.value)}
                                className="h-9 rounded-xl ring-1 ring-destructive/20 bg-destructive/5 focus:ring-destructive text-[10px] font-medium"
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAttendanceRecords = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h3 className="text-2xl font-black text-[#3A2C2B]">Attendance Records</h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">Review and manage historical attendance data</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-2 ml-1">
              <Calendar className="w-3 h-3 text-primary" />
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Historical View</label>
            </div>
            <Input
              type="date"
              value={recordFilterDate}
              max={todayStr}
              onChange={(e) => setRecordFilterDate(e.target.value)}
              className="h-10 rounded-xl border-primary/10 shadow-sm bg-white font-bold text-xs"
            />
          </div>
          <Button variant="outline" className="rounded-xl h-10 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 self-end">
            <RefreshCcw className="w-4 h-4 mr-2" /> Sync Data
          </Button>
        </div>
      </div>

      <Card className="rounded-[28px] border-none shadow-xl bg-white overflow-hidden relative z-10">
        <CardContent className="p-0">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[1000px] flex flex-col">
              <div className="bg-[#3A2C2B] shrink-0">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="text-white/70">
                      <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Student</th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Time</th>
                      <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Marked By</th>
                      <th className="w-[25%] px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest">Last Updated</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody className="divide-y divide-border/10">
                    {ATTENDANCE_RECORDS.map((rec) => (
                      <tr key={rec.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="w-[20%] px-8 py-5">
                          <p className="text-sm font-black text-[#3A2C2B]">{rec.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{rec.roll}</p>
                        </td>
                        <td className="w-[15%] px-8 py-5 text-center">
                          <Badge variant={
                            rec.status === 'Present' ? 'brand-green' :
                              rec.status === 'Absent' ? 'destructive' :
                                rec.status === 'Late' ? 'brand-purple' : 'brand-orange'
                          } className="text-[8px] px-2 py-0.5 font-black uppercase">
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="w-[15%] px-8 py-5 text-center text-sm font-bold text-muted-foreground tabular-nums">{rec.time}</td>
                        <td className="w-[25%] px-8 py-5">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-bold">{rec.markedBy}</span>
                          </div>
                        </td>
                        <td className="w-[25%] px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase">{rec.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="px-8 py-4 border-t border-border/10 flex items-center justify-between bg-secondary/5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Showing 4 of 42 records</p>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" className="h-8 w-8 p-0 rounded-lg text-[10px] font-black bg-[#3A2C2B] text-white">1</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5">2</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5">3</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );


  const renderAnalyticsSection = () => {
    // Local mock data for new 'real' charts
    const TREND_DATA = [
      { date: '01 May', percentage: 94 },
      { date: '05 May', percentage: 92 },
      { date: '10 May', percentage: 95 },
      { date: '15 May', percentage: 88 },
      { date: '20 May', percentage: 91 },
      { date: '25 May', percentage: 96 },
      { date: '30 May', percentage: 93 },
    ];



    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Local Analytics Filters */}
        <Card className="rounded-[32px] border-none shadow-xl bg-white p-6 border border-primary/20 overflow-visible relative z-20">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-[#3A2C2B]">
              <Select
                label="Academic Class"
                value={anaClass}
                onChange={setAnaClass}
                options={[
                  { label: "Class 10", value: "10" },
                  { label: "Class 11", value: "11" },
                  { label: "Class 12", value: "12" }
                ]}
                className="bg-secondary/5 border-primary/10"
              />
              <Select
                label="Section"
                value={anaSection}
                onChange={setAnaSection}
                options={[
                  { label: "Section A", value: "A" },
                  { label: "Section B", value: "B" },
                  { label: "Section C", value: "C" }
                ]}
                className="bg-secondary/5 border-primary/10"
              />
              <Select
                label="Department"
                value={anaDept}
                onChange={setAnaDept}
                options={[
                  { label: "General", value: "General" },
                  { label: "Science", value: "Science" },
                  { label: "Commerce", value: "Commerce" }
                ]}
                className="bg-secondary/5 border-primary/10"
              />
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Report Date</label>
                <Input
                  type="date"
                  value={anaDate}
                  onChange={(e) => setAnaDate(e.target.value)}
                  className="bg-secondary/5 border-primary/10 h-12 rounded-2xl font-bold text-xs"
                />
              </div>
            </div>
            <Button className="bg-primary text-white hover:bg-primary/90 rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
              Update Analytics
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Trend Line Chart - Full Width */}
          <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden h-[400px]">
            <CardHeader className="p-8 border-b border-border/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-[#3A2C2B]">Global Attendance Trend</CardTitle>
                <CardDescription>Aggregate daily attendance across all subjects (Past 30 Days)</CardDescription>
              </div>
              <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Avg: 92.4%</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E1D5" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#3A2C2B', fontSize: 10, fontWeight: 900 }} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#3A2C2B', fontSize: 10, fontWeight: 900 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="percentage" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-[32px] border-none shadow-xl bg-soft-parchment p-8 flex flex-col items-center text-center gap-4 border border-primary/10">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-3xl font-black text-[#3A2C2B]">12%</h4>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Global Late Trend</p>
                <p className="text-[10px] font-bold text-destructive mt-2">↑ 2.4% for {anaDept} Dept</p>
              </div>
            </Card>
            <Card className="rounded-[32px] border-none shadow-xl bg-soft-sky p-8 flex flex-col items-center text-center gap-4 border border-primary/10">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-3xl font-black text-[#3A2C2B]">96%</h4>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Class {anaClass} Avg</p>
                <p className="text-[10px] font-bold text-brand-green mt-2">Section {anaSection} Leading</p>
              </div>
            </Card>
            <Card className="rounded-[32px] border-none shadow-xl bg-soft-honey p-8 flex flex-col items-center text-center gap-4 border border-primary/10">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-3xl font-black text-[#3A2C2B]">08</h4>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Critical Alerts</p>
                <p className="text-[10px] font-bold text-destructive mt-2">As of {anaDate}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  if (isStudent) {
    return renderStudentView();
  }

  if (activeRole === "PARENT") {
    return <ParentAttendance />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 sm:space-y-10 pb-20">
      {renderAttendanceHeader()}

      {/* Stats Section */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
          {ATTENDANCE_KPIS.map((kpi, i) => (
            <StatsCard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} color={kpi.color} />
          ))}
        </div>
      </div>

      {renderFilterSection()}

      {/* Main Tabs Navigation - Responsive Pill */}
      <div className="px-4 md:px-6 mb-8 md:mb-12">
        <TabSwitcher
          tabs={[
            { id: 'marking', label: 'Marking', icon: UserCheck },
            { id: 'records', label: 'Records', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
          color="bg-primary"
        />
      </div>

      {/* Content Area */}
      <div className="px-4 lg:px-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'marking' && renderAttendanceMarking()}
        {activeTab === 'records' && renderAttendanceRecords()}
        {activeTab === 'analytics' && renderAnalyticsSection()}
      </div>

      {/* Edge Case UI: Locked Attendance Example */}
      <div className="px-4 lg:px-6">
        <Card className="rounded-[24px] border-2 border-dashed border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-primary">Attendance Submission Policy</h4>
              <p className="text-xs font-medium text-primary/60 italic">Daily attendance must be submitted before 10:00 AM. Records are locked after 24 hours.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;
