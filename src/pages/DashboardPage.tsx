import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStaffAttendance } from '../hooks/useStaffAttendance';
import {
  AdminOverview,
  TeacherSchedule,
  ParentChildrenOverview,
  DriverRoute,
  StatsCard,
  EmptyModule,
  PrincipalSummaryCards,
  DashboardSection,
  DashboardFilter,
  DashboardDateFilter,
  StudentSnapshot,
  StudentDistributionChart,
  RecentAdmissionsTable,
  AcademicActivityChart,
  AcademicSnapshotList,
  ExamModuleWidget,
  FeeCollectionTrendChart,
  PendingFeesTableWidget,
  AttendanceTrendAreaChart,
  StaffAttendanceDonutChart,
  TransportStatusDonutChart,
  TransportSnapshotWidget,
  RecentActivitiesWidget,
  QuickActionsWidget
} from '../components/dashboard/DashboardWidgets';
import {
  MessagePreview,
  QuickBroadcast
} from '../components/communication/CommunicationWidgets';
import { useCommunication } from '../hooks/useCommunication';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Users,
  TrendingUp,
  AlertCircle,
  ClipboardList,
  Calendar,
  Wallet,
  Bell,
  Bus,
  MapPin,
  Plus,
  User,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole, user } = useAuth();
  const { messages, canBroadcast } = useCommunication();
  const { isStaffPresent, markPresent } = useStaffAttendance();

  const notices = messages.filter(m => m.type === 'NOTICE').slice(0, 2);
  const dms = messages.filter(m => m.type === 'DIRECT_MESSAGE').slice(0, 3);

  const isStaffRole = activeRole && !['STUDENT', 'PARENT', 'SUPER_ADMIN'].includes(activeRole);
  const present = user && isStaffPresent(user.id);

  const AttendanceAction = () => {
    if (!isStaffRole || !user) return null;
    if (present) {
      return (
        <div className="flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-xl border border-brand-green/20">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-black uppercase tracking-widest">Marked Present</span>
        </div>
      );
    }
    return (
      <Button
        onClick={() => markPresent(user.id)}
        className="bg-brand-green hover:bg-brand-green/90 text-white rounded-xl h-10 px-6 font-black uppercase text-xs tracking-widest shadow-xl shadow-brand-green/20"
      >
        Mark as Present
      </Button>
    );
  };

  const renderDashboard = () => {
    switch (activeRole) {
      case 'SCHOOL_ADMIN':
        return (
          <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2 text-[#3A2C2B]">Principal Command Center</h1>
                <p className="text-muted-foreground font-medium italic">Real-time insights and school-wide operations</p>
              </div>
              <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-border/50">
                <AttendanceAction />
              </div>
            </div>

            {/* KPI Row (Unchanged) */}
            <PrincipalSummaryCards />

            {/* Student Section */}
            <DashboardSection
              title="Student"
              filters={
                <>
                  <DashboardDateFilter label="Date" />
                  <DashboardFilter label="Class" options={["All Classes", "Class 10", "Class 11", "Class 12"]} />
                </>
              }
            >
              <div className="lg:col-span-3 h-full"><StudentSnapshot /></div>
              <div className="lg:col-span-3 h-full"><StudentDistributionChart /></div>
              <div className="lg:col-span-6 h-full"><RecentAdmissionsTable /></div>
            </DashboardSection>

            {/* Academic Section */}
            <DashboardSection
              title="Academic"
              filters={
                <>
                  <DashboardDateFilter label="Date" />
                  <DashboardFilter label="Subject" options={["All Subjects", "Math", "Science", "English"]} />
                </>
              }
            >
              <div className="lg:col-span-6 h-full"><AcademicActivityChart /></div>
              <div className="lg:col-span-3 h-full"><AcademicSnapshotList /></div>
              <div className="lg:col-span-3 h-full"><ExamModuleWidget /></div>
            </DashboardSection>

            {/* Finance Section */}
            <DashboardSection
              title="Finance"
              filters={
                <>
                  <DashboardDateFilter label="Date" />
                  <DashboardFilter label="Class" options={["All Classes", "Primary", "Secondary"]} />
                </>
              }
            >
              <div className="lg:col-span-7 h-full"><FeeCollectionTrendChart /></div>
              <div className="lg:col-span-5 h-full"><PendingFeesTableWidget /></div>
            </DashboardSection>

            {/* Attendance Section */}
            <DashboardSection
              title="Attendance"
              filters={
                <>
                  <DashboardDateFilter label="Date" />
                  <DashboardFilter label="Class" options={["All Classes", "Staff", "Students"]} />
                </>
              }
            >
              <div className="lg:col-span-8 h-full"><AttendanceTrendAreaChart /></div>
              <div className="lg:col-span-4 h-full"><StaffAttendanceDonutChart /></div>
            </DashboardSection>

            {/* Transport Section */}
            <DashboardSection
              title="Transport"
              filters={
                <DashboardDateFilter label="Date" />
              }
            >
              <div className="lg:col-span-4 h-full"><TransportStatusDonutChart /></div>
              <div className="lg:col-span-8 h-full"><TransportSnapshotWidget /></div>
            </DashboardSection>

            {/* Operations Section */}
            <DashboardSection title="Operations">
              <div className="lg:col-span-4 h-full"><RecentActivitiesWidget /></div>
              <div className="lg:col-span-4 h-full">
                <Card className="h-full rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="p-6 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Recent Notices</CardTitle>
                    <Bell className="w-5 h-5 text-primary" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {notices.map(n => (
                      <div key={n.id} className="p-3 rounded-2xl bg-secondary/30 border border-border/50">
                        <p className="text-sm font-black truncate">{n.title}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {notices.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No recent notices</p>}
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-4 h-full"><QuickActionsWidget /></div>
            </DashboardSection>
          </div>
        );

      case 'SUPER_ADMIN':
      case 'IT_ADMIN':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">School Analytics</h1>
                <p className="text-muted-foreground font-medium italic">Real-time overview of your educational network</p>
              </div>
              <AttendanceAction />
            </div>
            <AdminOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TeacherSchedule />
              <div className="space-y-6">
                <StatsCard icon={TrendingUp} label="Academic Growth" value="+24%" sub="Since last term" color="bg-primary" />
                <StatsCard icon={AlertCircle} label="Pending Tasks" value="12" sub="Requires attention" color="bg-brand-orange" />
              </div>
            </div>
          </div>
        );

      case 'TEACHER':
      case 'CLASS_TEACHER':
        return (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Hello, {user?.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground font-medium">You have 4 classes and 2 faculty meetings today.</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-black text-primary uppercase tracking-widest">Attendance Goal</p>
                  <p className="text-xl font-black">98.4%</p>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <AttendanceAction />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard icon={Users} label="My Students" value="156" color="bg-primary" />
              <StatsCard icon={ClipboardList} label="To Class" value="28" sub="Assignments pending" color="bg-brand-purple" />
              <StatsCard icon={Calendar} label="Days Left" value="14" sub="Until mid-term" color="bg-brand-green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TeacherSchedule />
              </div>
              <div className="space-y-6">
                <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="p-6 border-b border-border/50">
                    <CardTitle className="text-lg">Parent Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {dms.map(msg => <MessagePreview key={msg.id} message={msg} />)}
                    {dms.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No unread messages</p>}
                  </CardContent>
                </Card>
                {canBroadcast && <QuickBroadcast onCompose={() => navigate('/communication/compose')} />}
              </div>
            </div>
          </div>
        );

      case 'PARENT':
        return (
          <div className="space-y-10">
            <div className="p-8 rounded-[40px] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150" />
              <div className="relative z-10">
                <h1 className="text-3xl font-black mb-2">Guardian Dashboard</h1>
                <p className="opacity-80 font-medium">Managing 2 children across Class 4 and Class 8</p>
                <div className="flex gap-4 mt-8">
                  <button className="bg-white text-primary px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-transform">
                    Message Principal
                  </button>
                  <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-white/20 transition-colors">
                    View Academic Calendar
                  </button>
                </div>
              </div>
            </div>
            <ParentChildrenOverview />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-black mb-6">Recent Activities</h2>
                <div className="space-y-4">
                  {[
                    { icon: Wallet, title: "Fee Payment Received", desc: "$1,200 for Emily Davis", time: "2 hours ago", color: "bg-brand-green" },
                    { icon: Bell, title: "Parent-Teacher Meeting", desc: "Scheduled for Friday at 3:00 PM", time: "Yesterday", color: "bg-primary" },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-border/50">
                      <div className={cn("p-2 rounded-xl text-white", act.color)}>
                        <act.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{act.title}</p>
                        <p className="text-xs text-muted-foreground font-medium">{act.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-soft-clay rounded-[40px] p-8 border border-primary/10">
                <h3 className="text-xl font-black mb-6">Important Notice</h3>
                <div className="aspect-square bg-white/60 rounded-3xl mb-6 flex items-center justify-center p-8 text-center">
                  <p className="text-sm font-bold leading-relaxed">
                    Summer vacation starts from June 15th. Please ensure all library books are returned.
                  </p>
                </div>
                <button className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20">
                  Read Full Circular
                </button>
              </div>
            </div>
          </div>
        );

      case 'TRANSPORT_MANAGER':
        return (
          <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2 text-[#3A2C2B]">Transport Operations</h1>
                <p className="text-muted-foreground font-medium italic">Monitor fleet, routes and student transit safety</p>
              </div>
              <div className="flex items-center gap-4">
                <AttendanceAction />
                <Button onClick={() => navigate('/transport')} className="rounded-xl h-12 px-6 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">
                  OPEN COMMAND CENTER
                </Button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard icon={Bus} label="Active Fleet" value="18" sub="All buses running" color="bg-primary" />
              <StatsCard icon={MapPin} label="Total Routes" value="12" sub="Covering 45 areas" color="bg-brand-orange" />
              <StatsCard icon={Users} label="Total Students" value="420" sub="Morning shift active" color="bg-brand-green" />
              <StatsCard icon={AlertCircle} label="Active Delays" value="2" sub="Avg delay: 12m" color="bg-brand-purple" />
            </div>

            {/* Visual Snapshots */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 h-full"><TransportStatusDonutChart /></div>
              <div className="lg:col-span-8 h-full"><TransportSnapshotWidget /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions for Transport */}
              <Card className="rounded-[32px] border-none shadow-xl bg-gradient-to-br from-[#3A2C2B] to-[#5A4C4B] text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl font-black">Transport Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => navigate('/transport')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-20 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <Plus className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Add Vehicle</span>
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/transport')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-20 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <MapPin className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">New Route</span>
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/transport')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-20 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <User className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Assign Driver</span>
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/transport')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-20 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <Bell className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Send Alert</span>
                    </Button>
                  </div>
                  <Button onClick={() => navigate('/transport')} className="w-full h-14 rounded-2xl bg-white text-[#3A2C2B] font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5" /> Weekly Driver Roster
                  </Button>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 h-full">
                <RecentActivitiesWidget />
              </div>
            </div>
          </div>
        );

      case 'BUS_DRIVER':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Driver Greeting Banner */}
            <div className="p-10 rounded-[40px] bg-gradient-to-br from-primary via-primary to-[#d66b5c] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                      <Bus className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black tracking-tight leading-none">Drive Safely, {user?.name.split(' ')[0]}!</h1>
                      <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Active Shift • Bus #B-105</p>
                    </div>
                  </div>
                  <div className="flex gap-8 pt-4">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">Assigned Route</p>
                      <p className="text-xl font-black">North Campus Express</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">Today's Students</p>
                      <p className="text-xl font-black">42 Pickups</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <AttendanceAction />
                  <Button onClick={() => navigate('/transport')} className="h-14 rounded-2xl bg-white text-primary font-black uppercase tracking-widest text-xs px-12 shadow-xl hover:scale-105 transition-transform">
                    GO TO TRIP TOOLS
                  </Button>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">System Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DriverRoute />
              </div>
              <div className="space-y-6">
                <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="p-8 border-b border-border/30 bg-soft-parchment/30">
                    <CardTitle className="text-lg font-black">Trip Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Morning Shift</p>
                        <p className="text-sm font-bold">07:00 AM - 09:30 AM</p>
                      </div>
                      <Badge variant="brand-green">Completed</Badge>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary">Evening Shift</p>
                        <p className="text-sm font-bold">02:30 PM - 04:45 PM</p>
                      </div>
                      <Badge variant="brand-orange" className="animate-pulse">Next Up</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] border-none shadow-xl bg-soft-clay border-l-8 border-destructive overflow-hidden">
                  <CardContent className="p-8">
                    <h4 className="text-sm font-black text-destructive uppercase mb-2">Emergency SOS</h4>
                    <p className="text-xs font-bold text-destructive/70 mb-6">Immediate alert to Command Center</p>
                    <Button variant="destructive" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20">
                      TRIGGER ALERT
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'VICE_PRINCIPAL':
      case 'ACADEMIC_COORDINATOR':
      case 'HOD':
      case 'EXAM_CONTROLLER':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Academic Leadership</h1>
                <p className="text-muted-foreground font-medium">Departmental performance and academic progress</p>
              </div>
              <div className="flex items-center gap-4">
                <AttendanceAction />
              </div>
            </div>
            <AdminOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TeacherSchedule />
              <div className="bg-soft-parchment rounded-[40px] p-8 border border-border">
                <h3 className="text-xl font-black mb-6">Departmental Alerts</h3>
                <div className="space-y-4">
                  {[
                    { title: "Syllabus Update", desc: "Class 11 Physics is 2 weeks behind", status: "Critical" },
                    { title: "Exam Moderation", desc: "Math T1 results ready for review", status: "Pending" },
                    { title: "Lesson Plans", desc: "8 teachers haven't submitted weekly plans", status: "Action Required" },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-border/50">
                      <div>
                        <p className="font-bold text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.desc}</p>
                      </div>
                      <Badge variant="outline">{alert.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'ACCOUNTANT':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-black tracking-tight mb-2">Financial Operations</h1>
              <AttendanceAction />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard icon={Wallet} label="Today's Collection" value="$12,450" trend="+15%" color="bg-brand-green" />
              <StatsCard icon={TrendingUp} label="Outstanding Dues" value="$45,200" sub="128 students" color="bg-brand-orange" />
              <StatsCard icon={ClipboardList} label="Pending Invoices" value="34" sub="Awaiting generation" color="bg-brand-purple" />
            </div>
            <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 border border-border">
              <h3 className="text-xl font-black mb-6">Recent Transactions</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold"># {i}</div>
                      <div>
                        <p className="font-bold text-sm">Fee Payment - Student #12{i}</p>
                        <p className="text-xs text-muted-foreground font-medium">May 5, 2026 • Cash</p>
                      </div>
                    </div>
                    <p className="font-black text-brand-green">$450.00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <div className="p-12 bg-primary rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h1 className="text-4xl font-black mb-2">{activeRole?.replace('_', ' ')} Portal</h1>
                  <p className="text-white/70 font-medium">Welcome to your role-specific dashboard. Your modules are listed in the sidebar.</p>
                </div>
                <div className="text-white">
                  <AttendanceAction />
                </div>
              </div>
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-white/40 backdrop-blur-md rounded-[40px] border border-border text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-black mb-2">Announcements</h3>
                <p className="text-sm text-muted-foreground">Stay updated with the latest school circulars.</p>
              </div>
              <div className="p-8 bg-white/40 backdrop-blur-md rounded-[40px] border border-border text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-brand-orange" />
                <h3 className="text-xl font-black mb-2">My Calendar</h3>
                <p className="text-sm text-muted-foreground">View your upcoming events and deadlines.</p>
              </div>
              <div className="p-8 bg-white/40 backdrop-blur-md rounded-[40px] border border-border text-center">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-brand-purple" />
                <h3 className="text-xl font-black mb-2">My Tasks</h3>
                <p className="text-sm text-muted-foreground">Track your pending administrative tasks.</p>
              </div>
            </div>
            <EmptyModule moduleName={activeRole?.replace('_', ' ') || 'Module'} />
          </div>
        );
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
