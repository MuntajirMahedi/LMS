import { useState } from 'react';
import { 
  LayoutDashboard, Users, Calendar, CreditCard, 
  Settings, UserCheck, CalendarOff, Wallet,
  ArrowRight, Activity, Clock, ShieldAlert, CheckCircle2,
  Search, MoreVertical, LayoutGrid, List,
  Mail, Phone, Building2, UserPlus,
  ArrowLeft, Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TabSwitcher } from '../../components/ui/TabSwitcher';
import { StatsCard } from '../../components/dashboard/DashboardWidgets';
import { getUsers } from '../../mock/users';
import { useStaffAttendance } from '../../hooks/useStaffAttendance';
import { useLeaveManagement } from '../../hooks/useLeaveManagement';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- THEME COLORS ---
const CHART_COLORS = {
  primary: '#C37A67', success: '#88AC88', warning: '#E4B76D',
  purple: '#A78BFA', error: '#E63946', muted: '#8B7E74',
  border: '#E9E1D5', foreground: '#2C2625'
};

const STAFF_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SCHOOL_ADMIN', label: 'School Admin / Principal' },
  { value: 'VICE_PRINCIPAL', label: 'Vice Principal / Coordinator' },
  { value: 'HOD', label: 'HOD' },
  { value: 'ACADEMIC_COORDINATOR', label: 'Academic Coordinator' },
  { value: 'EXAM_CONTROLLER', label: 'Exam Controller' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'CLASS_TEACHER', label: 'Class Teacher' },
  { value: 'LAB_INSTRUCTOR', label: 'Lab Instructor' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent / Guardian' },
  { value: 'ADMISSION_OFFICER', label: 'Admission Officer' },
  { value: 'OFFICE_ADMIN', label: 'Office Admin' },
  { value: 'ACCOUNTANT', label: 'Accountant / Finance Officer' },
  { value: 'HR_MANAGER', label: 'HR Manager' },
  { value: 'TRANSPORT_MANAGER', label: 'Transport Manager' },
  { value: 'BUS_DRIVER', label: 'Bus Driver' },
  { value: 'HOSTEL_WARDEN', label: 'Hostel Warden' },
  { value: 'LIBRARIAN', label: 'Librarian' },
  { value: 'IT_ADMIN', label: 'IT Admin' }
];

const getRoleLabel = (roleValue: string) => {
  const role = STAFF_ROLES.find(r => r.value === roleValue);
  return role ? role.label : roleValue.replace('_', ' ');
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E9E1D5] p-3 rounded-xl shadow-xl">
        <p className="text-[#2C2625] font-black text-xs mb-2 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-[#2C2625] font-bold text-xs">
                {entry.name}: <span className="font-black">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- MOCK DATA ---

// --- INLINE COMPONENTS ---

// 1. Dashboard
const HRDashboard = ({ onNavigate }: { onNavigate: (t: string) => void }) => {
  const stats = [
    { label: "Total Staff", value: "248", sub: "+12 this year", icon: Users, color: "bg-primary" },
    { label: "Active Present", value: "235", sub: "94.8% Attendance", icon: UserCheck, color: "bg-brand-green" },
    { label: "On Leave", value: "13", sub: "5 Pending Approvals", icon: CalendarOff, color: "bg-brand-orange" },
    { label: "Monthly Payroll", value: "$184k", sub: "Disbursed yesterday", icon: Wallet, color: "bg-brand-purple" },
  ];
  const attData = [
    { name: 'Mon', present: 240, leave: 8 }, { name: 'Tue', present: 238, leave: 10 },
    { name: 'Wed', present: 242, leave: 6 }, { name: 'Thu', present: 235, leave: 13 },
    { name: 'Fri', present: 230, leave: 18 },
  ];
  const deptData = [
    { name: 'Academic', value: 180 }, { name: 'Administration', value: 30 },
    { name: 'Transport', value: 25 }, { name: 'Support', value: 13 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} color={stat.color} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-[#E9E1D5]/50 flex flex-row items-center justify-between py-5">
              <div>
                <CardTitle className="text-lg font-black text-[#2C2625]">Attendance Trends</CardTitle>
                <CardDescription>Current week staff presence vs leaves</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('leave')} className="rounded-xl">
                Details <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLeave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="present" stroke={CHART_COLORS.success} strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                  <Area type="monotone" dataKey="leave" stroke={CHART_COLORS.warning} strokeWidth={3} fillOpacity={1} fill="url(#colorLeave)" name="On Leave" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white relative">
              <CardHeader className="pb-2"><CardTitle className="text-base font-black">Staff Distribution</CardTitle></CardHeader>
              <CardContent className="h-[220px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="45%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      <Cell fill={CHART_COLORS.primary} /><Cell fill={CHART_COLORS.success} /><Cell fill={CHART_COLORS.warning} /><Cell fill={CHART_COLORS.purple} />
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl bg-[#2C2625] text-white">
              <CardHeader>
                <CardTitle className="text-base font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#E4B76D]" /> Actions Needed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer border border-white/5" onClick={() => onNavigate('leave')}>
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#E4B76D]/20 flex items-center justify-center"><Clock className="w-4 h-4 text-[#E4B76D]"/></div>
                    <div><p className="font-bold text-sm">5 Leave Requests</p><p className="text-xs text-white/60">Pending</p></div>
                  </div>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer border border-white/5">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#E63946]/20 flex items-center justify-center"><ShieldAlert className="w-4 h-4 text-[#E63946]"/></div>
                    <div><p className="font-bold text-sm">2 Expiring Contracts</p><p className="text-xs text-white/60">Action needed</p></div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-[#C37A67] hover:bg-[#a66453] text-white font-bold rounded-xl" onClick={() => onNavigate('directory')}>
                  Directory
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Card className="border-none shadow-xl bg-white flex flex-col">
          <CardHeader className="border-b border-[#E9E1D5]/50">
            <CardTitle className="text-lg font-black text-[#2C2625]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto max-h-[500px]">
            <div className="divide-y divide-[#E9E1D5]/40">
              {[
                { name: "John Doe", action: "Leave approved", time: "10 mins ago", type: "success" },
                { name: "Sarah Smith", action: "Profile updated", time: "1 hr ago", type: "info" },
                { name: "Mike Johnson", action: "Joined as IT Admin", time: "3 hrs ago", type: "warning" },
              ].map((log, i) => (
                <div key={i} className="p-5 hover:bg-[#FDFBF7] flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2C2625]">{log.name}</p>
                    <p className="text-xs text-[#2C2625]/70">{log.action}</p>
                    <span className="text-[10px] text-[#8B7E74]">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// 2. Staff Directory
const StaffDirectory = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const [view, setView] = useState<'grid'|'table'>('table');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { getAllAttendanceForDate } = useStaffAttendance();
  const attendanceToday = getAllAttendanceForDate();
  const [allUsers] = useState(() => getUsers());
  const staffUsers = allUsers.filter(u => !['STUDENT', 'PARENT', 'SUPER_ADMIN'].includes(u.role));
  
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredStaff = staffUsers.filter(u => {
    const isPresent = !!attendanceToday[u.id];
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (departmentFilter !== 'All' && u.metadata?.departmentId !== departmentFilter) return false;
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter === 'Present' && !isPresent) return false;
    if (statusFilter === 'Absent' && isPresent) return false;
    return true;
  });

  const getBadge = (isPresent: boolean) => {
    if (isPresent) return <Badge className="bg-[#88AC88]/10 text-[#88AC88]"><CheckCircle2 className="w-3 h-3 mr-1"/> Present</Badge>;
    return <Badge className="bg-[#E4B76D]/10 text-[#B45309]"><Clock className="w-3 h-3 mr-1"/> Absent</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[24px] shadow-sm border border-[#E9E1D5]">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-4 w-4 h-4 text-[#8B7E74]"/>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search staff..." className="w-full pl-9 pr-4 h-12 bg-transparent border border-border/50 rounded-2xl text-sm font-bold outline-none focus:border-primary/50" />
          </div>
          <div className="w-[140px] sm:w-40">
            <Select 
              label="Department" 
              value={departmentFilter} 
              onChange={setDepartmentFilter} 
              options={[
                { label: 'All Depts', value: 'All' },
                ...Array.from(new Set(staffUsers.map(u => u.metadata?.departmentId).filter(Boolean) as string[])).map(d => ({ label: d, value: d }))
              ]} 
            />
          </div>
          <div className="w-[140px] sm:w-40">
            <Select 
              label="Role" 
              value={roleFilter} 
              onChange={setRoleFilter} 
              options={[
                { label: 'All Roles', value: 'All' },
                ...STAFF_ROLES
              ]} 
            />
          </div>
          <div className="w-[140px] sm:w-32">
            <Select 
              label="Status" 
              value={statusFilter} 
              onChange={setStatusFilter} 
              options={[
                { label: 'All Status', value: 'All' },
                { label: 'Present', value: 'Present' },
                { label: 'Absent', value: 'Absent' }
              ]} 
            />
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="flex bg-[#FDFBF7] border border-[#E9E1D5] rounded-xl p-1">
            <button onClick={() => setView('table')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view==='table'?"bg-white text-[#C37A67] shadow-sm":"text-gray-500")}><List className="w-4 h-4"/></button>
            <button onClick={() => setView('grid')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view==='grid'?"bg-white text-[#C37A67] shadow-sm":"text-gray-500")}><LayoutGrid className="w-4 h-4"/></button>
          </div>
          <Button className="bg-[#C37A67] text-white rounded-xl font-bold h-12 px-6 hover:bg-[#a66453] transition-colors shadow-lg shadow-[#C37A67]/20" onClick={() => setShowAddStaff(true)}>
            <UserPlus className="w-4 h-4 mr-2"/> Add Staff
          </Button>
        </div>
      </div>

      {view === 'table' ? (
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-[#FDFBF7] border-b text-[10px] font-black uppercase text-[#8B7E74]">
                <th className="px-6 py-4">Employee</th><th className="px-6 py-4">Role & Dept</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Status</th><th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(s => {
                const isPresent = !!attendanceToday[s.id];
                return (
                <tr key={s.id} onClick={() => onSelect(s.id)} className="border-b hover:bg-[#FDFBF7] cursor-pointer transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} className="w-10 h-10 rounded-full bg-gray-100 object-cover" alt=""/>
                    <div><p className="font-bold text-[#2C2625]">{s.name}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">EMP-{s.id.padStart(3, '0')}</p></div>
                  </td>
                  <td className="px-6 py-4"><p className="font-bold text-sm text-[#2C2625]">{getRoleLabel(s.role)}</p><p className="text-xs text-muted-foreground">{s.metadata?.departmentId || 'Unassigned'}</p></td>
                  <td className="px-6 py-4"><p className="text-sm font-medium text-[#2C2625]">{s.email}</p><p className="text-xs text-muted-foreground">+1 555-0100</p></td>
                  <td className="px-6 py-4">{getBadge(isPresent)}</td>
                  <td className="px-6 py-4 text-right"><MoreVertical className="w-4 h-4 text-gray-400 inline"/></td>
                </tr>
              )})}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground font-bold">No staff found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </Card>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-6 snap-x scrollbar-thin scrollbar-thumb-primary/10">
          {filteredStaff.map((s, i) => {
            const isPresent = !!attendanceToday[s.id];
            const colors = ['bg-[#C37A67]', 'bg-[#88AC88]', 'bg-[#E4B76D]', 'bg-[#A78BFA]', 'bg-[#E63946]', '#D08770', '#8FBCBB'];
            const cardColor = colors[i % colors.length];

            return (
              <div key={s.id} onClick={() => onSelect(s.id)} className="w-full md:w-[280px] shrink-0 snap-center bg-white rounded-[32px] shadow-xl border border-border/50 overflow-hidden relative cursor-pointer hover:-translate-y-1 transition-transform flex flex-col h-full">
                <div className={cn("h-32 w-full shrink-0", cardColor)} />
                <div className="flex justify-center -mt-14 relative z-10 shrink-0">
                  <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 object-cover shadow-sm" alt=""/>
                </div>
                <div className="p-6 text-center flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-black text-xl text-[#2C2625] truncate">{s.name}</h3>
                    <p className="text-xs text-[#8B7E74] font-bold uppercase tracking-widest mt-1">EMP-{s.id.padStart(3, '0')}</p>
                  </div>
                  <div className="mb-4">
                    {getBadge(isPresent)}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-border/50 text-left text-sm font-medium text-[#2C2625]/80 mt-auto">
                    <div className="flex items-center gap-3 overflow-hidden"><Building2 className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">{getRoleLabel(s.role)}{s.metadata?.departmentId ? `, ${s.metadata.departmentId}` : ''}</span></div>
                    <div className="flex items-center gap-3 overflow-hidden"><Mail className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">{s.email}</span></div>
                    <div className="flex items-center gap-3 overflow-hidden"><Phone className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">+1 555-0100</span></div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredStaff.length === 0 && (
            <div className="w-full text-center p-12 bg-white rounded-[32px] border border-border shadow-sm text-muted-foreground font-bold">
              No staff found matching filters.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showAddStaff} onClose={() => setShowAddStaff(false)} title="Register New Staff">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
              <Input placeholder="Enter first name" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
              <Input placeholder="Enter last name" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Role / Designation</label>
              <Select placeholder="Select role" value="Teacher" onChange={()=>{}} options={[
                {label: 'Teacher', value: 'Teacher'},
                {label: 'HOD', value: 'HOD'},
                {label: 'Admin Staff', value: 'Admin'},
                {label: 'Principal', value: 'Principal'},
              ]} className="h-12 bg-white rounded-xl border-border/50 text-sm font-bold text-[#3A2C2B]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</label>
              <Select placeholder="Select department" value="Academic" onChange={()=>{}} options={[
                {label: 'Academic', value: 'Academic'},
                {label: 'Administration', value: 'Administration'},
                {label: 'Finance', value: 'Finance'},
                {label: 'Transport', value: 'Transport'},
              ]} className="h-12 bg-white rounded-xl border-border/50 text-sm font-bold text-[#3A2C2B]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <Input type="email" placeholder="staff@edusync.edu" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Number</label>
              <Input type="tel" placeholder="+1 (555) 000-0000" className="h-12 rounded-xl" />
            </div>
          </div>
          <Button className="w-full bg-[#C37A67] hover:bg-[#a66453] text-white font-black uppercase tracking-widest text-xs h-14 rounded-xl mt-4 shadow-lg shadow-[#C37A67]/20 transition-all-custom" onClick={() => setShowAddStaff(false)}>
            Complete Registration
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// 3. Employee Profile
const EmployeeProfile = ({ id, onBack }: { id: string, onBack: () => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl border-[#E9E1D5]"><ArrowLeft className="w-4 h-4 mr-2"/> Back</Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-[#C37A67] to-[#E4B76D] opacity-20" />
          <CardContent className="pt-0 text-center -mt-16">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 mx-auto" alt=""/>
            <h2 className="text-2xl font-black mt-4">Sarah Jenkins</h2>
            <p className="text-gray-500 text-sm">{id}</p>
            <Badge className="mt-2 bg-[#88AC88]/10 text-[#88AC88]"><CheckCircle2 className="w-3 h-3 mr-1"/> Active</Badge>
            <div className="mt-6 space-y-4 text-left text-sm">
              <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-[#C37A67]"/> Principal, Admin</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#C37A67]"/> sarah@edu.com</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#C37A67]"/> +1 555-0100</div>
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl rounded-[32px] p-8">
            <h3 className="font-black text-xl mb-6">Personal Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div><p className="text-[10px] uppercase font-black text-gray-500">Date of Birth</p><p className="font-bold">14 Aug 1985</p></div>
              <div><p className="text-[10px] uppercase font-black text-gray-500">Gender</p><p className="font-bold">Female</p></div>
              <div className="col-span-2"><p className="text-[10px] uppercase font-black text-gray-500">Address</p><p className="font-bold">123 Education Ln.</p></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 4. Leave & Attendance
const LeaveManagement = () => {
  const { checkPermission } = useAuth();
  const { getAllAttendanceForDate } = useStaffAttendance();
  const { getAllLeaves, updateLeaveStatus } = useLeaveManagement();
  const attendanceToday = getAllAttendanceForDate();
  const [allUsers] = useState(() => getUsers());
  const staffUsers = allUsers.filter(u => !['STUDENT', 'PARENT', 'SUPER_ADMIN'].includes(u.role));
  
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  const [leaveDepartmentFilter, setLeaveDepartmentFilter] = useState<string>('All');
  const [leaveRoleFilter, setLeaveRoleFilter] = useState<string>('All');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('All');

  const [view, setView] = useState<'table' | 'cards'>('table');
  const [leaveView, setLeaveView] = useState<'table' | 'cards'>('table');
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [casualLimit, setCasualLimit] = useState(12);
  const [sickLimit, setSickLimit] = useState(10);
  
  const allLeaves = getAllLeaves();
  const filteredLeaves = allLeaves.filter(l => {
    if (leaveDepartmentFilter !== 'All' && l.userDept !== leaveDepartmentFilter) return false;
    if (leaveRoleFilter !== 'All' && l.userRole !== leaveRoleFilter) return false;
    if (leaveStatusFilter !== 'All' && l.status !== leaveStatusFilter) return false;
    return true;
  });
  const canApprove = checkPermission('HR_STAFF', 'approve') || checkPermission('HR_STAFF', 'edit');

  const presentCount = staffUsers.filter(u => attendanceToday[u.id]).length;
  const absentCount = staffUsers.length - presentCount;
  const presentPercentage = staffUsers.length > 0 ? Math.round((presentCount / staffUsers.length) * 100) : 0;

  const attendanceStats = [
    { label: "Present Today", value: presentCount.toString(), sub: `${presentPercentage}% of Total Staff`, icon: UserCheck, color: "bg-brand-green" },
    { label: "Absent", value: absentCount.toString(), sub: "Includes Leaves", icon: CalendarOff, color: "bg-brand-orange" },
  ];

  const leaveStats = [
    { label: "Casual Leave", value: casualLimit.toString(), sub: "Total monthly limit", icon: Calendar, color: "bg-primary" },
    { label: "Sick Leave", value: sickLimit.toString(), sub: "Total monthly limit", icon: Activity, color: "bg-brand-green" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in pb-12">
      
      {/* ATTENDANCE SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-border/50 pb-4">
          <div>
            <h2 className="text-2xl font-black text-[#2C2625] tracking-tight">Today's Attendance</h2>
            <p className="text-sm text-[#8B7E74] font-bold mt-1 uppercase tracking-widest">Daily Workforce Tracking</p>
          </div>
          <Button variant="outline" className="rounded-xl border-border/50 font-bold bg-white text-[10px] uppercase tracking-widest h-10 shadow-sm hover-lift tap-scale hover:bg-primary/5 hover:text-primary transition-all-custom">
            <Download className="w-4 h-4 mr-2" /> Export Log
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {attendanceStats.map((stat, i) => (
            <StatsCard key={i} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} color={stat.color} />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[24px] border border-border shadow-sm mt-6">
          <div className="grid grid-cols-2 lg:flex lg:flex-row items-end lg:items-center gap-4 w-full lg:w-auto">
            <div className="w-full lg:w-48">
              <Select 
                label="Department" 
                value={departmentFilter} 
                onChange={setDepartmentFilter} 
                options={[
                  { label: 'All Departments', value: 'All' },
                  ...Array.from(new Set(staffUsers.map(u => u.metadata?.departmentId).filter(Boolean) as string[])).map(d => ({ label: d, value: d }))
                ]} 
              />
            </div>
            <div className="w-full lg:w-48">
              <Select 
                label="Role" 
                value={roleFilter} 
                onChange={setRoleFilter} 
                options={[
                  { label: 'All Roles', value: 'All' },
                  ...STAFF_ROLES
                ]} 
              />
            </div>
            <div className="w-full lg:w-40">
              <Select 
                label="Status" 
                value={statusFilter} 
                onChange={setStatusFilter} 
                options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Present', value: 'Present' },
                  { label: 'Absent', value: 'Absent' }
                ]} 
              />
            </div>
            <div className="flex justify-start items-end lg:hidden h-full pb-[2px]">
              <div className="flex bg-[#FDFBF7] border border-border rounded-xl p-1 shrink-0 h-11">
                <button onClick={() => setView('table')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view === 'table' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><List className="w-4 h-4"/></button>
                <button onClick={() => setView('cards')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view === 'cards' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><LayoutGrid className="w-4 h-4"/></button>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex bg-[#FDFBF7] border border-border rounded-xl p-1 shrink-0">
            <button onClick={() => setView('table')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view === 'table' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><List className="w-4 h-4"/></button>
            <button onClick={() => setView('cards')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", view === 'cards' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><LayoutGrid className="w-4 h-4"/></button>
          </div>
        </div>

        {view === 'table' ? (
          <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="bg-soft-parchment/30 border-b border-border/30 p-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Today's Live Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <tbody>
                  {staffUsers.filter(u => {
                    const isPresent = !!attendanceToday[u.id];
                    if (departmentFilter !== 'All' && u.metadata?.departmentId !== departmentFilter) return false;
                    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
                    if (statusFilter === 'Present' && !isPresent) return false;
                    if (statusFilter === 'Absent' && isPresent) return false;
                    return true;
                  }).map((u,i) => {
                    const isPresent = !!attendanceToday[u.id];
                    return (
                    <tr key={i} className="border-b border-border/10 last:border-0 hover:bg-soft-parchment/30 transition-colors">
                      <td className="p-4 px-6 font-bold text-[#2C2625] flex items-center gap-3">
                        <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-8 h-8 rounded-full border border-border" alt=""/>
                        <div>
                          {u.name}
                          <p className="text-[10px] text-muted-foreground uppercase">{getRoleLabel(u.role)}</p>
                        </div>
                      </td>
                      <td className="p-4 px-6 text-[#8B7E74] font-bold">
                        {isPresent ? 'Checked In' : 'Not Checked In'}
                      </td>
                      <td className="p-4 px-6 text-right">
                        <Badge className={isPresent ? "bg-brand-green/10 text-brand-green font-black uppercase tracking-widest text-[9px]" : "bg-brand-orange/10 text-brand-orange font-black uppercase tracking-widest text-[9px]"}>
                          {isPresent ? 'Present' : 'Absent'}
                        </Badge>
                      </td>
                    </tr>
                  )})}
                  {staffUsers.filter(u => {
                    const isPresent = !!attendanceToday[u.id];
                    if (departmentFilter !== 'All' && u.metadata?.departmentId !== departmentFilter) return false;
                    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
                    if (statusFilter === 'Present' && !isPresent) return false;
                    if (statusFilter === 'Absent' && isPresent) return false;
                    return true;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center p-8 text-muted-foreground font-bold">No staff found matching filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x scrollbar-thin scrollbar-thumb-primary/10">
            {staffUsers.filter(u => {
              const isPresent = !!attendanceToday[u.id];
              if (departmentFilter !== 'All' && u.metadata?.departmentId !== departmentFilter) return false;
              if (roleFilter !== 'All' && u.role !== roleFilter) return false;
              if (statusFilter === 'Present' && !isPresent) return false;
              if (statusFilter === 'Absent' && isPresent) return false;
              return true;
            }).map((u, i) => {
              const isPresent = !!attendanceToday[u.id];
              const colors = ['bg-[#C37A67]', 'bg-[#88AC88]', 'bg-[#E4B76D]', 'bg-[#A78BFA]', 'bg-[#E63946]'];
              const cardColor = colors[i % colors.length];

              return (
                <div key={i} className="w-full md:w-[280px] shrink-0 snap-center bg-white rounded-[32px] shadow-xl border border-border/50 overflow-hidden relative flex flex-col h-full">
                  <div className={cn("h-32 w-full shrink-0", cardColor)} />
                  <div className="flex justify-center -mt-14 relative z-10 shrink-0">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 object-cover shadow-sm" alt=""/>
                  </div>
                  <div className="p-6 text-center flex flex-col flex-1">
                    <div className="mb-4">
                      <h3 className="font-black text-xl text-[#2C2625] truncate">{u.name}</h3>
                      <p className="text-xs text-[#8B7E74] font-bold uppercase tracking-widest mt-1">EMP-{u.id.padStart(3, '0')}</p>
                    </div>
                    <div className="mb-4">
                      <Badge className={isPresent ? "bg-brand-green/10 text-brand-green font-black uppercase tracking-widest text-[9px]" : "bg-brand-orange/10 text-brand-orange font-black uppercase tracking-widest text-[9px]"}>
                        {isPresent ? 'Present' : 'Absent'}
                      </Badge>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-border/50 text-left text-sm font-medium text-[#2C2625]/80 mt-auto">
                      <div className="flex items-center gap-3 overflow-hidden"><Building2 className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">{getRoleLabel(u.role)}</span></div>
                      <div className="flex items-center gap-3 overflow-hidden"><Mail className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">{u.email}</span></div>
                      <div className="flex items-center gap-3 overflow-hidden"><Phone className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">+1 555-0100</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {staffUsers.filter(u => {
              const isPresent = !!attendanceToday[u.id];
              if (departmentFilter !== 'All' && u.metadata?.departmentId !== departmentFilter) return false;
              if (roleFilter !== 'All' && u.role !== roleFilter) return false;
              if (statusFilter === 'Present' && !isPresent) return false;
              if (statusFilter === 'Absent' && isPresent) return false;
              return true;
            }).length === 0 && (
              <div className="w-full text-center p-12 bg-white rounded-[32px] border border-border shadow-sm text-muted-foreground font-bold">
                No staff found matching filters.
              </div>
            )}
          </div>
        )}
      </section>

      {/* LEAVES SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-border/50 pb-4">
          <div>
            <h2 className="text-2xl font-black text-[#2C2625] tracking-tight">Leave Management</h2>
            <p className="text-sm text-[#8B7E74] font-bold mt-1 uppercase tracking-widest">Balances & Requests</p>
          </div>
          {canApprove && (
            <Button onClick={() => setShowLimitModal(true)} variant="outline" className="rounded-xl border-border/50 font-bold bg-white text-[10px] uppercase tracking-widest h-10 shadow-sm hover-lift tap-scale hover:bg-primary/5 hover:text-primary transition-all-custom">
              <Settings className="w-4 h-4 mr-2" /> Set Limits
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {leaveStats.map((stat, i) => (
            <StatsCard key={i} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} color={stat.color} />
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[24px] border border-border shadow-sm mt-6">
          <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="w-full lg:w-48">
              <Select 
                label="Department" 
                value={leaveDepartmentFilter} 
                onChange={setLeaveDepartmentFilter} 
                options={[
                  { label: 'All Departments', value: 'All' },
                  ...Array.from(new Set(staffUsers.map(u => u.metadata?.departmentId).filter(Boolean) as string[])).map(d => ({ label: d, value: d }))
                ]} 
              />
            </div>
            <div className="w-full lg:w-48">
              <Select 
                label="Role" 
                value={leaveRoleFilter} 
                onChange={setLeaveRoleFilter} 
                options={[
                  { label: 'All Roles', value: 'All' },
                  ...STAFF_ROLES
                ]} 
              />
            </div>
            <div className="w-full lg:w-40">
              <Select 
                label="Status" 
                value={leaveStatusFilter} 
                onChange={setLeaveStatusFilter} 
                options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Rejected', value: 'Rejected' }
                ]} 
              />
            </div>
            <div className="flex justify-start items-end lg:hidden h-full pb-[2px]">
              <div className="flex bg-[#FDFBF7] border border-border rounded-xl p-1 shrink-0 h-11">
                <button onClick={() => setLeaveView('table')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", leaveView === 'table' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><List className="w-4 h-4"/></button>
                <button onClick={() => setLeaveView('cards')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", leaveView === 'cards' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><LayoutGrid className="w-4 h-4"/></button>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex bg-[#FDFBF7] border border-border rounded-xl p-1 shrink-0">
            <button onClick={() => setLeaveView('table')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", leaveView === 'table' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><List className="w-4 h-4"/></button>
            <button onClick={() => setLeaveView('cards')} className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", leaveView === 'cards' ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}><LayoutGrid className="w-4 h-4"/></button>
          </div>
        </div>

        {leaveView === 'table' ? (
          <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white mt-6">
            <CardHeader className="bg-soft-parchment/30 border-b border-border/30 p-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Leave Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-soft-parchment/10 text-[#8B7E74] font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">Employee</th>
                    <th className="p-4">Department & Role</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-muted-foreground font-bold">No leave requests found.</td></tr>
                  ) : filteredLeaves.map((r,_i) => (
                    <tr key={r.id} className="border-b border-border/10 last:border-0 hover:bg-soft-parchment/30 transition-colors">
                      <td className="p-4 px-6 font-black text-[#2C2625]">{r.userName}</td>
                      <td className="p-4">
                        <p className="font-bold text-[#2C2625]">{r.userDept}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{getRoleLabel(r.userRole)}</p>
                      </td>
                      <td className="p-4 font-bold text-[#8B7E74] text-xs">{r.startDate} to {r.endDate}</td>
                      <td className="p-4">
                        <span className="text-[#8B7E74] font-bold text-xs">{r.type}</span>
                        {r.reason && (
                          <div className="mt-1">
                            <span className="italic text-[10px] text-muted-foreground">"{r.reason}"</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={r.status === 'Approved' ? "bg-brand-green/10 text-brand-green font-black uppercase tracking-widest text-[9px]" : r.status === 'Rejected' ? "bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[9px]" : "bg-brand-orange/10 text-brand-orange font-black uppercase tracking-widest text-[9px]"}>{r.status}</Badge>
                      </td>
                      <td className="p-4 pr-6 text-right flex justify-end gap-2">
                        {r.status === 'Pending' && canApprove ? (
                          <>
                            <Button onClick={() => updateLeaveStatus(r.id, 'Approved')} size="sm" className="h-7 text-[10px] bg-brand-green hover:bg-brand-green/80 text-white rounded-lg">Approve</Button>
                            <Button onClick={() => updateLeaveStatus(r.id, 'Rejected')} size="sm" variant="outline" className="h-7 text-[10px] border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg">Reject</Button>
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-6 pt-6 snap-x scrollbar-thin scrollbar-thumb-primary/10">
            {filteredLeaves.length === 0 ? (
              <div className="w-full text-center p-12 bg-white rounded-[32px] border border-border shadow-sm text-muted-foreground font-bold">No leave requests found.</div>
            ) : filteredLeaves.map((r, _i) => (
              <div key={r.id} className="w-full md:w-[280px] h-[350px] shrink-0 snap-center bg-white rounded-[32px] shadow-xl border border-border/50 p-6 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <h3 className="font-black text-xl text-[#2C2625] truncate">{r.userName}</h3>
                    <p className="text-xs text-[#8B7E74] font-bold uppercase tracking-widest mt-1">{getRoleLabel(r.userRole)}</p>
                  </div>
                  {r.status === 'Pending' && (
                    <Badge className="bg-brand-orange/10 text-brand-orange font-black uppercase tracking-widest text-[9px] shrink-0 ml-2">PENDING</Badge>
                  )}
                </div>
                <div className="space-y-3 pt-4 border-t border-border/50 text-left text-sm font-medium text-[#2C2625]/80 mt-auto">
                  <div className="flex items-center gap-3 overflow-hidden"><Building2 className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">{r.userDept}</span></div>
                  <div className="flex items-center gap-3 overflow-hidden"><Calendar className="w-4 h-4 text-primary shrink-0"/> <span className="truncate text-xs">{r.startDate} to {r.endDate}</span></div>
                  <div className="flex items-center gap-3 overflow-hidden"><Activity className="w-4 h-4 text-primary shrink-0"/> <span className="truncate">{r.type}</span></div>
                  {r.reason && (
                    <div className="p-3 bg-soft-parchment/30 rounded-xl italic text-xs leading-relaxed text-muted-foreground border border-border/30 shadow-sm relative overflow-hidden mt-3">
                      <span className="text-[#C37A67] font-serif font-black absolute -top-1 left-1.5 text-3xl opacity-20">"</span>
                      <span className="pl-4 relative z-10 line-clamp-2">{r.reason}</span>
                    </div>
                  )}
                </div>
                {r.status === 'Pending' && canApprove ? (
                  <div className="flex gap-2 pt-4 border-t border-border/50 shrink-0">
                    <Button onClick={() => updateLeaveStatus(r.id, 'Approved')} size="sm" className="flex-1 h-9 text-xs bg-brand-green hover:bg-brand-green/80 text-white rounded-xl font-bold">Approve</Button>
                    <Button onClick={() => updateLeaveStatus(r.id, 'Rejected')} size="sm" variant="outline" className="flex-1 h-9 text-xs border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold">Reject</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center pt-4 border-t border-border/10 shrink-0">
                    <div className="h-9 w-full flex items-center justify-center bg-gray-50/50 rounded-xl">
                      <span className={cn(
                        "text-xs font-black tracking-[0.2em] uppercase",
                        r.status === 'Approved' ? "text-brand-green" : r.status === 'Rejected' ? "text-red-500" : "text-brand-orange"
                      )}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} title="Set Monthly Leave Limits">
        <div className="space-y-4">
          <p className="text-sm text-[#8B7E74] mb-4 font-medium">Set the maximum allowed leaves per month for staff members. These limits apply globally across all departments.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74] ml-1">Casual Leaves (Per Month)</label>
              <Input type="number" min="0" value={casualLimit} onChange={(e) => setCasualLimit(parseInt(e.target.value) || 0)} className="h-14 rounded-2xl text-center font-bold border-border/50 focus:ring-2 focus:ring-[#C37A67]/20 transition-all text-[#2C2625]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8B7E74] ml-1">Sick Leaves (Per Month)</label>
              <Input type="number" min="0" value={sickLimit} onChange={(e) => setSickLimit(parseInt(e.target.value) || 0)} className="h-14 rounded-2xl text-center font-bold border-border/50 focus:ring-2 focus:ring-[#C37A67]/20 transition-all text-[#2C2625]" />
            </div>
          </div>
          <Button className="w-full bg-[#C37A67] hover:bg-[#a66453] text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-xl mt-6 shadow-lg shadow-[#C37A67]/20 transition-all-custom tap-scale" onClick={() => {
            setShowLimitModal(false);
          }}>
            Save Limits
          </Button>
        </div>
      </Modal>

    </div>
  );
};

// 5. Payroll
const PayrollManagement = () => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
        <div><h2 className="text-lg font-black">Payroll Overview</h2></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none"><Download className="w-4 h-4 mr-2"/> Export</Button>
          <Button className="bg-[#C37A67] text-white rounded-xl font-bold flex-1 sm:flex-none">Process</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl rounded-[24px] p-6"><p className="text-xs font-black uppercase text-gray-500">Total Payroll</p><p className="text-4xl font-black mt-2">$184,250</p></Card>
        <Card className="border-none shadow-xl rounded-[24px] p-6"><p className="text-xs font-black uppercase text-gray-500">Deductions</p><p className="text-4xl font-black mt-2">$12,450</p></Card>
        <Card className="border-none shadow-xl rounded-[24px] bg-[#2C2625] text-white p-6"><p className="text-xs font-black uppercase text-gray-400">Next Payday</p><p className="text-4xl font-black mt-2 text-[#E4B76D]">Nov 01</p></Card>
      </div>
      <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
        <CardHeader className="bg-[#FDFBF7]"><CardTitle>Recent Payslips</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[400px]">
            <tbody>
              {[{ n: "Sarah Jenkins", amt: "$8,500.00", s: "Paid" }, { n: "Michael Chen", amt: "$6,200.00", s: "Paid" }].map((r,i) => (
                <tr key={i} className="border-b"><td className="p-4 font-bold">{r.n}</td><td className="p-4">{r.amt}</td><td className="p-4">{r.s}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics removed per request


// --- MAIN PAGE WRAPPER ---
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'directory', label: 'Staff Directory', icon: Users },
  { id: 'leave', label: 'Leave & Attendance', icon: Calendar },
  { id: 'payroll', label: 'Payroll', icon: CreditCard },
];

const HRStaffPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const handleEmployeeSelect = (id: string | null) => {
    setSelectedEmployeeId(id);
    if (id) setActiveTab('profile');
    else setActiveTab('directory');
  };

  const renderContent = () => {
    if (selectedEmployeeId && activeTab === 'profile') {
      return <EmployeeProfile id={selectedEmployeeId} onBack={() => handleEmployeeSelect(null)} />;
    }
    switch (activeTab) {
      case 'dashboard': return <HRDashboard onNavigate={setActiveTab} />;
      case 'directory': return <StaffDirectory onSelect={handleEmployeeSelect} />;
      case 'leave': return <LeaveManagement />;
      case 'payroll': return <PayrollManagement />;
      default: return <HRDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (No Card) */}
      <div className="pt-2 pb-4 shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#2C2625] tracking-tight">HR & Staff Management</h1>
            <p className="text-[#8B7E74] font-medium mt-1">Enterprise workforce operations and analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-[#88AC88]/10 text-[#88AC88] rounded-xl font-bold text-sm border border-[#88AC88]/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#88AC88] animate-pulse" /> Live Sync Active
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Tabs - Universal Tab Switcher */}
      <div className="sticky top-4 z-40 px-4 lg:px-6 shrink-0 mb-8 mt-2">
        <TabSwitcher
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(id);
            if (id !== 'profile') setSelectedEmployeeId(null);
          }}
          color="bg-[#C37A67]"
        />
      </div>

      {/* Main Content Area */}
      <div className="pt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default HRStaffPage;
