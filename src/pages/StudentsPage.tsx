import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  FileText,
  Search,
  Download,
  Filter,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowRight,
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileSearch,
  BookOpen,
  X,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { getStorageData, setStorageData } from '../lib/storage';

// Mock Data
const kpiData = [
  { label: 'Total Students', value: '2,840', icon: Users, color: 'bg-brand-blue', sub: '+4% vs last year' },
  { label: 'Active Students', value: '2,710', icon: UserCheck, color: 'bg-brand-green', sub: '95% of total' },
  { label: 'Promoted', value: '450', icon: UserPlus, color: 'bg-brand-orange', sub: 'This session' },
  { label: 'Transferred', value: '24', icon: ArrowUpRight, color: 'bg-primary', sub: 'In/Out records' },
  { label: 'Suspended', value: '12', icon: UserX, color: 'bg-brand-purple', sub: 'Requires attention' },
  { label: 'Pending Documents', value: '185', icon: FileSearch, color: 'bg-oat', sub: 'Incomplete profiles' },
];

const classDistData = [
  { name: 'Gr 1', value: 240 },
  { name: 'Gr 2', value: 220 },
  { name: 'Gr 3', value: 250 },
  { name: 'Gr 4', value: 230 },
  { name: 'Gr 5', value: 260 },
  { name: 'Gr 6', value: 210 },
  { name: 'Gr 7', value: 245 },
  { name: 'Gr 8', value: 235 },
  { name: 'Gr 9', value: 280 },
  { name: 'Gr 10', value: 270 },
];

const statusData = [
  { name: 'Active', value: 2710, fill: '#94C2BA' },
  { name: 'Suspended', value: 12, fill: '#D99EA5' },
  { name: 'Transferred', value: 24, fill: '#8EBADB' },
  { name: 'Archived', value: 94, fill: '#C9B79C' },
];

const recentAdmissions = [
  { id: 'STU001', name: 'Sophia Miller', class: 'Class 5', section: 'A', date: '2024-05-01', status: 'Active' },
  { id: 'STU002', name: 'James Wilson', class: 'Class 8', section: 'B', date: '2024-05-02', status: 'Pending Docs' },
  { id: 'STU003', name: 'Emma Davis', class: 'Class 3', section: 'A', date: '2024-05-03', status: 'Active' },
];

const initialStudentDirectory = [
  { id: '2024001', name: 'Alexander Knight', class: 'Class 10', section: 'A', roll: '10-A-01', parent: 'Thomas Knight', date: '2021-06-15', status: 'Active', academicYear: '2026-2027', department: 'General' },
  { id: '2024002', name: 'Bella Swan', class: 'Class 10', section: 'A', roll: '10-A-02', parent: 'Charlie Swan', date: '2021-06-15', status: 'Active', academicYear: '2026-2027', department: 'General' },
  { id: '2024003', name: 'Caleb Rivers', class: 'Class 9', section: 'B', roll: '09-B-05', parent: 'Ashley Rivers', date: '2022-06-10', status: 'Suspended', academicYear: '2025-2026', department: 'Science' },
  { id: '2024004', name: 'Daisy Miller', class: 'Class 8', section: 'C', roll: '08-C-12', parent: 'David Miller', date: '2023-06-20', status: 'Active', academicYear: '2024-2025', department: 'General' },
  { id: '2024005', name: 'Ethan Hunt', class: 'Class 10', section: 'B', roll: '10-B-08', parent: 'Rebecca Hunt', date: '2021-06-15', status: 'Active', academicYear: '2026-2027', department: 'Commerce' },
];

const STUDENT_DIRECTORY_STORAGE_KEY = 'lms_student_directory';
const FINALIZED_STUDENTS_STORAGE_KEY = 'lms_finalized_students';

const loadStudentDirectory = () => {
  const storedStudents = getStorageData(STUDENT_DIRECTORY_STORAGE_KEY, initialStudentDirectory);
  const finalizedStudents = getStorageData<any[]>(FINALIZED_STUDENTS_STORAGE_KEY, []);
  const seenIds = new Set(storedStudents.map((student: any) => student.id));
  const mergedFinalized = finalizedStudents.filter((student: any) => {
    if (seenIds.has(student.id)) return false;
    seenIds.add(student.id);
    return true;
  });

  return [...mergedFinalized, ...storedStudents];
};

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = React.useState(loadStudentDirectory);

  // Filter States
  const [yearFilter, setYearFilter] = useState('2026-2027');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentAdmissionsView, setRecentAdmissionsView] = useState<'list' | 'card'>('list');
  const [directoryView, setDirectoryView] = useState<'list' | 'card'>('list');

  // Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    studentId: '',
    newSection: '',
    newDepartment: ''
  });

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === transferForm.studentId);
    if (!student) return;

    // Calculate New Roll Number
    // Logic: Find last roll number in target section/dept
    const targetSection = transferForm.newSection;
    const targetDept = transferForm.newDepartment;

    const studentsInTarget = students.filter(s =>
      s.class === student.class &&
      s.section === targetSection &&
      s.department === targetDept
    );

    // Find the max sequence number in the target section/dept
    const lastSeq = studentsInTarget.reduce((max, s) => {
      const parts = s.roll.split('-');
      const seq = parseInt(parts[parts.length - 1]);
      return isNaN(seq) ? max : (seq > max ? seq : max);
    }, 0);

    const nextSeq = lastSeq + 1;
    const seqStr = nextSeq.toString().padStart(2, '0');
    const deptShort = targetDept.substring(0, 3).toUpperCase();

    // Format: Grade-Section-Dept-Seq
    const newRoll = `${student.class.split(' ')[1]}-${targetSection}-${deptShort}-${seqStr}`;

    setStudents(prev => prev.map(s => {
      if (s.id === transferForm.studentId) {
        return {
          ...s,
          section: targetSection,
          department: targetDept,
          roll: newRoll
        };
      }
      return s;
    }));

    alert(`Student transferred successfully! New Roll No: ${newRoll}`);
    setShowTransferModal(false);
  };

  useEffect(() => {
    setStorageData(STUDENT_DIRECTORY_STORAGE_KEY, students);
  }, [students]);

  // 2. FILTERING LOGIC
  const filteredStudents = students.filter(student => {
    const matchesYear = yearFilter === 'All' || student.academicYear === yearFilter;
    const matchesClass = classFilter === 'All' || student.class === classFilter;
    const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
    const matchesDept = deptFilter === 'All' || student.department === deptFilter;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesYear && matchesClass && matchesSection && matchesDept && matchesSearch;
  });

  const handleViewProfile = (student: any) => {
    navigate(`/students/${student.id}`);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* GLOBAL TOP SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
            <span>ERP</span>
            <ChevronRight className="w-3 h-3" />
            <span>Student Management</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#3A2C2B] uppercase">Student Management</h1>
          <p className="text-muted-foreground font-medium italic">Unified hub for student records, academic history, and operational workflows</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group mr-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#3A2C2B] transition-colors" />
            <Input
              placeholder="Global Student Search..."
              className="pl-12 pr-4 h-12 w-64 rounded-2xl bg-white border-none shadow-sm focus-visible:ring-2 focus-visible:ring-[#3A2C2B]/20 font-bold"
            />
          </div>

          <Button variant="outline" className="h-12 rounded-2xl px-4 border-[#3A2C2B]/10 hover:bg-[#3A2C2B]/5 font-black uppercase tracking-widest text-[10px]">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            onClick={() => navigate('/school-structure', { state: { activeTab: 'promotion' } })}
            variant="outline"
            className="h-12 rounded-2xl px-4 border-[#3A2C2B]/10 hover:bg-emerald-50 text-emerald-700 font-black uppercase tracking-widest text-[10px]"
          >
            <ArrowUpRight className="w-4 h-4 mr-2" /> Promote
          </Button>
        </div>
      </div>

      {/* GLOBAL KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {kpiData.map((kpi, i) => (
          <StatsCard key={i} {...kpi} />
        ))}
      </div>

      {/* SECTION 1 — STUDENT OVERVIEW */}
      <div className="space-y-8">
        {/* Growth & Distribution Chart */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
            <Select
              label="Academic Year"
              options={[
                { label: '2023-24', value: '2023-24' },
                { label: '2022-23', value: '2022-23' },
              ]}
              value="2023-24"
              className="min-w-[180px]"
            />
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10">
              <Filter className="w-5 h-5 text-[#3A2C2B]" />
            </Button>
          </div>

          <Card className="w-full border-none shadow-2xl rounded-[20px] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-border/50">
              <CardTitle className="text-xl font-black uppercase text-[#3A2C2B]">Student Growth & Distribution</CardTitle>
              <CardDescription className="font-medium italic">Enrollment trends across academic years and classes</CardDescription>
            </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-[300px] w-full">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-6 tracking-widest text-center">Class-wise Enrollment Distribution</p>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={classDistData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#999' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#999' }} />
                  <Tooltip
                    cursor={{ fill: '#3A2C2B', fillOpacity: 0.05 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                  />
                  <Bar dataKey="value" fill="#D99EA5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Student Status Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-4">
            <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full">
              <div className="w-full md:w-40">
                <Select
                  placeholder="Year"
                  options={[
                    { label: 'All Years', value: 'All' },
                    { label: '2026-2027', value: '2026-2027' },
                    { label: '2025-2026', value: '2025-2026' },
                    { label: '2024-2025', value: '2024-2025' },
                  ]}
                  value={yearFilter}
                  onChange={setYearFilter}
                  className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
                />
              </div>
              <div className="w-full md:w-40">
                <Select
                  placeholder="Class"
                  options={[
                    { label: 'All Classes', value: 'All' },
                    { label: 'Class 10', value: 'Class 10' },
                    { label: 'Class 9', value: 'Class 9' },
                    { label: 'Class 8', value: 'Class 8' },
                  ]}
                  value={classFilter}
                  onChange={setClassFilter}
                  className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
                />
              </div>
              <div className="w-full md:w-40">
                <Select
                  placeholder="Section"
                  options={[
                    { label: 'All Sections', value: 'All' },
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'C', value: 'C' },
                  ]}
                  value={sectionFilter}
                  onChange={setSectionFilter}
                  className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
                />
              </div>
              <div className="w-full md:w-40">
                <Select
                  placeholder="Department"
                  options={[
                    { label: 'All Dept', value: 'All' },
                    { label: 'General', value: 'General' },
                    { label: 'Science', value: 'Science' },
                    { label: 'Commerce', value: 'Commerce' },
                    { label: 'Arts', value: 'Arts' },
                  ]}
                  value={deptFilter}
                  onChange={setDeptFilter}
                  className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
                />
              </div>
            </div>
          </div>

          <Card className="w-full border-none shadow-2xl rounded-[20px] overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-border/50">
            <CardTitle className="text-xl font-black uppercase text-[#3A2C2B]">Student Status</CardTitle>
            <CardDescription className="font-medium italic">Current population breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex flex-col">
            <div className="h-[200px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#3A2C2B]/2 border border-[#3A2C2B]/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.fill }} />
                    <span className="text-[10px] font-black uppercase text-[#3A2C2B] tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-[#3A2C2B]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

      <div id="recent-admissions" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#3A2C2B]">Recent Admissions</h2>
            <p className="text-muted-foreground font-medium italic text-xs">Confirmed enrollments awaiting class assignment</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#3A2C2B]/5 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setRecentAdmissionsView('list')}
                className={cn("p-2 rounded-lg transition-all", recentAdmissionsView === 'list' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary")}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setRecentAdmissionsView('card')}
                className={cn("p-2 rounded-lg transition-all", recentAdmissionsView === 'card' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={() => navigate('/enrollment')}
              className="bg-[#3A2C2B] text-white rounded-2xl h-14 px-8 font-black uppercase text-xs flex items-center gap-3 shadow-xl shadow-black/10 hover:scale-105 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              PROCESS ENROLLMENTS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {recentAdmissionsView === 'list' ? (
          <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[750px] flex flex-col">
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white">
                        <th className="w-[40%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Student Details
                        </th>
                        <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Enroll ID
                        </th>
                        <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Applied Class
                        </th>
                        <th className="w-[15%] px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/70">
                          Status
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div
                  className="overflow-y-auto custom-scrollbar"
                  style={{ maxHeight: "280px" }}
                >
                  <table className="w-full text-left table-fixed">
                    <tbody className="divide-y divide-[#3A2C2B]/5">
                      {recentAdmissions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                                <Users className="w-8 h-8 opacity-20" />
                              </div>
                              <p className="text-sm font-black text-[#3A2C2B]">No Recent Admissions</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        recentAdmissions.map((stu, idx) => (
                          <tr key={`${stu.id}-${idx}`} className="hover:bg-white/60 transition-colors group">
                            <td className="w-[40%] px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#3A2C2B]/5 flex items-center justify-center text-xs font-black text-primary shadow-inner">
                                  {stu.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-[#3A2C2B]">{stu.name}</span>
                                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stu.date}</span>
                                </div>
                              </div>
                            </td>
                            <td className="w-[20%] px-8 py-5">
                              <code className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-tight">{stu.id}</code>
                            </td>
                            <td className="w-[25%] px-8 py-5">
                              <Badge variant="secondary" className="rounded-lg font-black text-[9px] uppercase bg-[#3A2C2B]/5 text-primary border-none">{stu.class}</Badge>
                            </td>
                            <td className="w-[15%] px-8 py-5 text-right">
                              <Badge className="bg-emerald-100 text-emerald-700 rounded-lg font-black text-[9px] uppercase px-3 py-1 border-none shadow-sm">
                                Confirmed
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth px-2">
            {recentAdmissions.length === 0 ? (
              <div className="w-full py-20 text-center bg-white rounded-[24px] border border-[#3A2C2B]/20">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Users className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-black text-[#3A2C2B]">No Recent Admissions</p>
                </div>
              </div>
            ) : (
              recentAdmissions.map((stu, idx) => (
                <div key={`${stu.id}-${idx}`} className={cn(
                  "flex-none w-[240px] p-5 rounded-[24px] border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden",
                  idx % 4 === 0 ? "bg-[#B1D3EC]" : idx % 4 === 1 ? "bg-[#BFDDD8]" : idx % 4 === 2 ? "bg-[#F0E0AD]" : "bg-[#EBBDC2]"
                )}>
                  <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                    <UserPlus className="w-20 h-20 text-[#3A2C2B]" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-xs font-black text-[#3A2C2B] shadow-inner ring-2 ring-white/50">
                      {stu.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-[#3A2C2B] leading-tight">{stu.name}</h4>
                      <p className="text-[9px] font-bold text-[#3A2C2B]/60 uppercase tracking-widest">{stu.date}</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/20 border border-white/30">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#3A2C2B]/50">Enroll ID</span>
                      <code className="text-[9px] font-black text-[#3A2C2B] uppercase">{stu.id}</code>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/20 border border-white/30">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#3A2C2B]/50">Class</span>
                      <span className="text-[9px] font-black text-[#3A2C2B]">{stu.class}</span>
                    </div>
                    <div className="pt-1">
                      <Badge className="w-full justify-center bg-[#3A2C2B] text-white rounded-lg font-black text-[8px] uppercase py-2 border-none shadow-md">
                        Confirmed Entry
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* SECTION 2 — STUDENT DIRECTORY */}
      <div id="directory" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#3A2C2B]">Student Directory</h2>
            <p className="text-muted-foreground font-medium italic text-xs">Filter and manage student records comprehensively</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center bg-[#3A2C2B]/5 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setDirectoryView('list')}
                className={cn("p-2 rounded-lg transition-all", directoryView === 'list' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary")}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDirectoryView('card')}
                className={cn("p-2 rounded-lg transition-all", directoryView === 'card' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" className="h-11 rounded-xl border-[#3A2C2B]/10 font-black text-[10px] uppercase text-[#3A2C2B] hover:bg-[#3A2C2B]/5">
              <Download className="w-4 h-4 mr-2" /> DATA EXPORT
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:flex-nowrap gap-3 px-4">
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-36">
              <Select
                placeholder="Year"
                options={[
                  { label: 'All Years', value: 'All' },
                  { label: '2026-2027', value: '2026-2027' },
                  { label: '2025-2026', value: '2025-2026' },
                  { label: '2024-2025', value: '2024-2025' },
                ]}
                value={yearFilter}
                onChange={setYearFilter}
                className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
              />
            </div>
            <div className="w-full md:w-36">
              <Select
                placeholder="Class"
                options={[
                  { label: 'All Classes', value: 'All' },
                  { label: 'Class 10', value: 'Class 10' },
                  { label: 'Class 9', value: 'Class 9' },
                  { label: 'Class 8', value: 'Class 8' },
                ]}
                value={classFilter}
                onChange={setClassFilter}
                className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
              />
            </div>
            <div className="w-full md:w-36">
              <Select
                placeholder="Section"
                options={[
                  { label: 'All Sections', value: 'All' },
                  { label: 'A', value: 'A' },
                  { label: 'B', value: 'B' },
                  { label: 'C', value: 'C' },
                ]}
                value={sectionFilter}
                onChange={setSectionFilter}
                className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
              />
            </div>
            <div className="w-full md:w-40">
              <Select
                placeholder="Department"
                options={[
                  { label: 'All Dept', value: 'All' },
                  { label: 'General', value: 'General' },
                  { label: 'Science', value: 'Science' },
                  { label: 'Commerce', value: 'Commerce' },
                  { label: 'Arts', value: 'Arts' },
                ]}
                value={deptFilter}
                onChange={setDeptFilter}
                className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
              />
            </div>
          </div>
        </div>

        {directoryView === 'list' ? (
          <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[1000px] flex flex-col">
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white">
                        <th className="w-[35%] px-8 py-5 text-[11px] font-black uppercase tracking-widest text-white/70">
                          Student
                        </th>
                        <th className="w-[25%] px-8 py-5 text-[11px] font-black uppercase tracking-widest text-white/70">
                          Academic Info
                        </th>
                        <th className="w-[25%] px-8 py-5 text-[11px] font-black uppercase tracking-widest text-white/70">
                          Parent/Guardian
                        </th>
                        <th className="w-[15%] px-8 py-5 text-right text-[11px] font-black uppercase tracking-widest text-white/70">
                          Admission Date
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div
                  className="overflow-y-auto custom-scrollbar"
                  style={{ maxHeight: "450px" }}
                >
                  <table className="w-full text-left table-fixed">
                    <tbody className="divide-y divide-[#3A2C2B]/5">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-40 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                              <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center">
                                <Search className="w-10 h-10 opacity-20" />
                              </div>
                              <div>
                                <p className="text-lg font-black text-[#3A2C2B]">No Students Found</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Try adjusting your directory filters</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student, idx) => (
                          <tr
                            key={`${student.id}-${idx}`}
                            onClick={() => handleViewProfile(student)}
                            className="hover:bg-white/60 transition-all group cursor-pointer"
                          >
                            <td className="w-[35%] px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#3A2C2B]/5 flex items-center justify-center text-primary font-black text-lg shadow-inner shrink-0">
                                  {student.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{student.name}</span>
                                    <Badge className={cn(
                                      "w-fit mt-1 rounded-md text-[8px] font-black uppercase px-2 py-0.5 shadow-sm border-none",
                                      student.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                      {student.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="w-[25%] px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="rounded-lg font-black text-[9px] uppercase bg-[#3A2C2B]/5 text-primary border-none">{student.class}</Badge>
                                  <Badge variant="secondary" className="rounded-lg font-black text-[9px] uppercase bg-[#3A2C2B]/5 text-primary border-none">Sec {student.section}</Badge>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Roll: {student.roll}</span>
                              </div>
                            </td>
                            <td className="w-[25%] px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-[#3A2C2B]">{student.parent}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Primary Contact</span>
                              </div>
                            </td>
                            <td className="w-[15%] px-8 py-6 text-sm font-bold text-muted-foreground text-right">
                              {student.date}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-8 overflow-x-auto pb-10 pt-4 no-scrollbar scroll-smooth px-2">
            {filteredStudents.length === 0 ? (
              <div className="w-full py-40 text-center bg-white rounded-[32px] border border-[#3A2C2B]/20">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center">
                    <Search className="w-10 h-10 opacity-20" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#3A2C2B]">No Students Found</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Try adjusting your directory filters</p>
                  </div>
                </div>
              </div>
            ) : (
              filteredStudents.map((student, idx) => (
                <div
                  key={`${student.id}-${idx}`}
                  onClick={() => handleViewProfile(student)}
                  className={cn(
                    "flex-none w-[260px] group rounded-[32px] border border-black/5 p-7 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative",
                    idx % 5 === 0 ? "bg-[#B1D3EC]" : idx % 5 === 1 ? "bg-[#BFDDD8]" : idx % 5 === 2 ? "bg-[#F0E0AD]" : idx % 5 === 3 ? "bg-[#DCD2C3]" : "bg-[#D1C4E9]"
                  )}
                >
                  <img
                    src="/student.png"
                    alt=""
                    className="absolute -right-10 -bottom-10 w-52 h-52 object-contain opacity-30 pointer-events-none z-0"
                  />
                  <div className="flex items-start justify-between mb-6 relative">
                    <div className="w-16 h-16 rounded-[20px] bg-white/40 flex items-center justify-center text-[#3A2C2B] font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/30">
                      {student.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <Badge className={cn(
                      "rounded-lg text-[8px] font-black uppercase px-3 py-1 shadow-sm border-none",
                      student.status === 'Active' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}>
                      {student.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 mb-6 relative">
                    <h4 className="text-[16px] font-black text-[#3A2C2B] truncate tracking-tight">{student.name}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#3A2C2B]/30" />
                      <p className="text-[9px] font-black text-[#3A2C2B]/40 uppercase tracking-widest">STU-{student.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6 relative">
                    <div className="p-3 rounded-2xl bg-white/30 border border-white/20 shadow-sm">
                      <p className="text-[7px] font-black text-[#3A2C2B]/50 uppercase mb-1 tracking-widest">Class</p>
                      <p className="text-xs font-black text-[#3A2C2B]">{student.class}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/30 border border-white/20 shadow-sm">
                      <p className="text-[7px] font-black text-[#3A2C2B]/50 uppercase mb-1 tracking-widest">Roll No</p>
                      <p className="text-xs font-black text-[#3A2C2B]">{student.roll}</p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-dashed border-[#3A2C2B]/10 relative flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-[#3A2C2B]/40 uppercase mb-0.5 tracking-widest">Parent</span>
                      <span className="text-[11px] font-black text-[#3A2C2B]">{student.parent}</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#3A2C2B] text-white flex items-center justify-center shadow-lg shadow-black/10 scale-90 group-hover:scale-100 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-[#3A2C2B]/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-[24px] shadow-sm">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center sm:text-left">
            Showing <span className="text-[#3A2C2B] font-black">{filteredStudents.length}</span> of <span className="text-[#3A2C2B] font-black">2,840</span> students
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[1, 2, 3, '...', 142].map((page, i) => (
              <Button 
                key={i} 
                variant={page === 1 ? 'default' : 'ghost'} 
                size="sm" 
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl text-[10px] font-black transition-all",
                  page === 1 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10 hover:bg-[#3A2C2B]/90" : "text-[#3A2C2B] hover:bg-white border border-transparent hover:border-border/20"
                )}
                disabled={page === '...'}
              >
                {page}
              </Button>
            ))}
            <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 4 — STUDENT OPERATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg rounded-[20px] bg-[#C37A67] p-6 hover:-translate-y-2 transition-transform duration-500 group overflow-hidden relative min-h-[200px]">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-[#3A2C2B]" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight leading-none text-[#3A2C2B]">Promote Students</h3>
                <p className="text-[#3A2C2B]/60 text-[9px] font-medium italic mt-1">Mass promotion workflow</p>
              </div>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate('/school-structure', { state: { activeTab: 'promotion' } })}
                variant="ghost"
                className="w-full h-10 rounded-xl bg-white text-[#C37A67] hover:bg-white/90 font-black uppercase text-[9px] tracking-widest shadow-xl"
              >
                START WORKFLOW
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-lg rounded-[20px] bg-[#EBBDC2] p-6 hover:-translate-y-2 transition-transform duration-500 group overflow-hidden relative min-h-[200px]">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-[#3A2C2B] shrink-0">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight leading-none text-[#3A2C2B]">Transfer Student</h3>
                <p className="text-[#3A2C2B]/60 text-[9px] font-medium italic mt-1">Branch/External transfers</p>
              </div>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => setShowTransferModal(true)}
                variant="ghost"
                className="w-full h-10 rounded-xl bg-white text-[#C37A67] hover:bg-white transition-colors font-black uppercase text-[9px] tracking-widest shadow-xl"
              >
                REQUEST TRANSFER
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-lg rounded-[20px] bg-[#BFDDD8] p-6 hover:-translate-y-2 transition-transform duration-500 group overflow-hidden relative min-h-[200px]">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-[#3A2C2B] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight leading-none text-[#3A2C2B]">Assign Class/Sec</h3>
                <p className="text-[#3A2C2B]/60 text-[9px] font-medium italic mt-1">Adjust classroom placements</p>
              </div>
            </div>
            <div className="mt-auto">
              <Button
                onClick={() => navigate('/enrollment')}
                variant="ghost"
                className="w-full h-10 rounded-xl bg-white text-[#10B981] hover:bg-white transition-colors font-black uppercase text-[9px] tracking-widest shadow-xl"
              >
                MANAGE SECTION
              </Button>
            </div>
          </div>
        </Card>
      </div>



      {/* SECTION 6 — REPORTS */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#3A2C2B]">Management Reports</h2>
            <p className="text-muted-foreground font-medium italic text-xs">Generate and export comprehensive student data reports</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 rounded-xl border-[#3A2C2B]/10 font-black text-[10px] uppercase text-[#3A2C2B] hover:bg-[#3A2C2B]/5">
              <Download className="w-4 h-4 mr-2" /> PDF EXPORT
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-[#3A2C2B]/10 font-black text-[10px] uppercase text-[#3A2C2B] hover:bg-[#3A2C2B]/5">
              <Download className="w-4 h-4 mr-2" /> EXCEL EXPORT
            </Button>
          </div>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth px-2">
          {[
            { title: 'Student Enrollment Report', desc: 'Detailed breakdown of all enrolled students by class and status.', icon: FileText, color: 'bg-[#B1D3EC]' },
            { title: 'Academic Performance Report', desc: 'GPA and subject-wise performance analysis across all grades.', icon: GraduationCap, color: 'bg-[#F0E0AD]' },
            { title: 'Attendance Analytics', desc: 'Monthly and session-wise attendance trends and exceptions.', icon: Calendar, color: 'bg-[#BFDDD8]' },
          ].map((report, i) => (
            <div key={i} className={cn("flex-none w-[300px] flex flex-col gap-6 p-8 rounded-[24px] transition-all group cursor-pointer hover:shadow-xl hover:-translate-y-1 border border-black/5", report.color)}>
              <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center shadow-sm">
                <report.icon className="w-6 h-6 text-[#3A2C2B]" />
              </div>
              <div className="space-y-3">
                <h5 className="text-[15px] font-black text-[#3A2C2B] uppercase tracking-tight leading-tight">{report.title}</h5>
                <p className="text-[11px] font-medium text-[#3A2C2B]/70 italic leading-relaxed min-h-[40px]">{report.desc}</p>
                <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase text-[#3A2C2B] hover:bg-transparent flex items-center gap-2 mt-4">
                  CONFIGURE & RUN
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Student Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl rounded-[20px] bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-border/50 bg-[#EBBDC2]/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase text-[#3A2C2B]">Student Transfer Request</CardTitle>
                  <p className="text-muted-foreground font-medium italic text-[11px]">Change section or department within the same class</p>
                </div>
                <Button variant="ghost" onClick={() => setShowTransferModal(false)} className="rounded-full w-10 h-10 p-0 text-[#3A2C2B]">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleTransferSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Select Student</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#3A2C2B]" />
                    <select
                      value={transferForm.studentId}
                      onChange={(e) => {
                        const student = students.find(s => s.id === e.target.value);
                        setTransferForm({
                          ...transferForm,
                          studentId: e.target.value,
                          newSection: student?.section || '',
                          newDepartment: student?.department || ''
                        });
                      }}
                      className="w-full rounded-2xl h-14 bg-[#3A2C2B]/5 border-none font-bold px-12 appearance-none focus:ring-2 focus:ring-[#3A2C2B]/10 transition-all text-sm"
                      required
                    >
                      <option value="">Select Student...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id}) - {s.class} {s.section}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Target Section</label>
                    <div className="relative">
                      <select
                        value={transferForm.newSection}
                        onChange={(e) => setTransferForm({ ...transferForm, newSection: e.target.value })}
                        className="w-full rounded-2xl h-14 bg-[#3A2C2B]/5 border-none font-bold px-4 appearance-none focus:ring-2 focus:ring-[#3A2C2B]/10 transition-all text-sm"
                        required
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Target Department</label>
                    <div className="relative">
                      <select
                        value={transferForm.newDepartment}
                        onChange={(e) => setTransferForm({ ...transferForm, newDepartment: e.target.value })}
                        className="w-full rounded-2xl h-14 bg-[#3A2C2B]/5 border-none font-bold px-4 appearance-none focus:ring-2 focus:ring-[#3A2C2B]/10 transition-all text-sm"
                        required
                      >
                        <option value="General">General</option>
                        <option value="Science">Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {transferForm.studentId && (
                  <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 space-y-4 shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Preview Change</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-emerald-100/50">
                      <span className="text-[11px] font-black text-emerald-700/60 uppercase">New Roll Number:</span>
                      <code className="bg-[#3A2C2B] text-white px-4 py-1.5 rounded-xl font-black text-[11px] tracking-widest shadow-lg shadow-black/10 animate-in zoom-in-95 duration-300">
                        {(() => {
                          const student = students.find(s => s.id === transferForm.studentId);
                          if (!student) return '---';
                          const studentsInTarget = students.filter(s =>
                            s.class === student.class &&
                            s.section === transferForm.newSection &&
                            s.department === transferForm.newDepartment
                          );
                          const lastSeq = studentsInTarget.reduce((max, s) => {
                            const parts = s.roll.split('-');
                            const seq = parseInt(parts[parts.length - 1]);
                            return isNaN(seq) ? max : (seq > max ? seq : max);
                          }, 0);
                          const nextSeq = lastSeq + 1;
                          const seqStr = nextSeq.toString().padStart(2, '0');
                          const deptShort = transferForm.newDepartment.substring(0, 3).toUpperCase();
                          return `${student.class.split(' ')[1]}-${transferForm.newSection}-${deptShort}-${seqStr}`;
                        })()}
                      </code>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-16 rounded-2xl bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90 font-black uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all"
                >
                  CONFIRM TRANSFER
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
