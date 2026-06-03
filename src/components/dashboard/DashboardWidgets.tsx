import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Users, GraduationCap, TrendingUp, AlertCircle, Wallet, Settings,
  ArrowRight, Bus, MapPin, CheckCircle2, Bell, FileText, Calendar, LayoutGrid
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// Generic Stats Card
export const StatsCard = ({ label, value, color }: any) => {
  const colorMap: Record<string, { bg: string, text: string, label: string }> = {
    'bg-primary': { bg: 'bg-[#DCD2C3]', text: 'text-[#3A2C2B]', label: 'text-[#3A2C2B]/60' },
    'bg-brand-purple': { bg: 'bg-[#EBBDC2]', text: 'text-[#3A2C2B]', label: 'text-[#3A2C2B]/60' },
    'bg-brand-green': { bg: 'bg-[#BFDDD8]', text: 'text-[#3A2C2B]', label: 'text-[#3A2C2B]/60' },
    'bg-brand-orange': { bg: 'bg-[#F0E0AD]', text: 'text-[#3A2C2B]', label: 'text-[#3A2C2B]/60' },
    'bg-brand-blue': { bg: 'bg-[#B1D3EC]', text: 'text-[#3A2C2B]', label: 'text-[#3A2C2B]/60' },
    'bg-oat': { bg: 'bg-[#DDC4BC]', text: 'text-[#3A2C2B]', label: 'text-[#3A2C2B]/60' },
    'bg-destructive': { bg: 'bg-[#EF4444]', text: 'text-white', label: 'text-white/60' }, // For fines fallback
  };

  const theme = colorMap[color] || colorMap['bg-primary'];

  return (
    <div className={cn(
      "hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-none overflow-hidden flex flex-col p-6 rounded-[32px] shadow-sm w-full",
      theme.bg
    )}>
      <div className="space-y-1 text-left flex flex-col justify-center h-full min-h-[80px]">
        <h3 className={cn("text-4xl font-black tracking-tight leading-none mb-1 break-all sm:break-normal", theme.text)}>{value}</h3>
        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-tight", theme.label)}>{label}</p>
      </div>
    </div>
  );
};

// Admin Widgets
export const AdminOverview = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatsCard icon={Users} label="Total Students" value="1,248" color="bg-blue-500" />
    <StatsCard icon={GraduationCap} label="Teachers" value="86" color="bg-primary" />
    <StatsCard icon={TrendingUp} label="Fee Collection" value="$128.4k" color="bg-brand-green" />
    <StatsCard icon={AlertCircle} label="Absence Rate" value="4.2%" color="bg-brand-orange" />
  </div>
);

// Teacher Widgets
export const TeacherSchedule = () => (
  <Card className="border-none shadow-xl bg-white/40 backdrop-blur-md">
    <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
      <div>
        <CardTitle className="text-xl">Today's Schedule</CardTitle>
        <CardDescription>Your classes and meetings for today</CardDescription>
      </div>
      <Badge variant="outline" className="px-4 py-1.5 font-bold">Tuesday, May 5</Badge>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-4">
        {[
          { time: "08:30 - 09:30", subject: "Physics", class: "Class 11-A", status: "Completed" },
          { time: "09:45 - 10:45", subject: "Mathematics", class: "Class 10-C", status: "On-going", active: true },
          { time: "11:00 - 12:00", subject: "Calculus", class: "Class 12-B", status: "Upcoming" },
        ].map((item, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
            item.active ? "bg-primary/5 border-primary shadow-sm" : "bg-white/50 border-border/50"
          )}>
            <div className="flex items-center gap-6">
              <div className="text-sm font-black text-primary w-28 tabular-nums">{item.time}</div>
              <div>
                <p className="font-bold text-base">{item.subject}</p>
                <p className="text-xs font-medium text-muted-foreground">{item.class}</p>
              </div>
            </div>
            <Badge variant={item.active ? 'brand-orange' : item.status === 'Completed' ? 'brand-green' : 'outline'}>
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Parent Widgets
export const ParentChildrenOverview = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-black tracking-tight">Children Overview</h2>
        <div className="hidden sm:flex bg-secondary/50 p-1 rounded-xl border border-border">
          <button className="px-4 py-1.5 bg-white rounded-lg shadow-sm text-xs font-black">All Children</button>
          <button className="px-4 py-1.5 text-muted-foreground text-xs font-bold hover:text-foreground transition-colors">Emily</button>
          <button className="px-4 py-1.5 text-muted-foreground text-xs font-bold hover:text-foreground transition-colors">Lucas</button>
        </div>
      </div>
      <Button className="rounded-full shadow-lg shadow-primary/20">Pay All Fees</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { name: "Emily Davis", grade: "Class 8", att: "98%", perf: "A-", img: "Emily" },
        { name: "Lucas Davis", grade: "Class 4", att: "94%", perf: "B+", img: "Lucas" },
      ].map((child, i) => (
        <Card key={i} className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-none bg-white/60 group">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="w-32 bg-soft-parchment flex items-center justify-center p-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child.img}`} alt={child.name} className="w-20 h-20 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 p-6 relative">
                <div className="absolute top-4 right-4 p-2 bg-primary/5 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black">{child.name}</h3>
                <p className="text-sm font-bold text-muted-foreground">{child.grade}</p>
                <div className="flex gap-6 mt-6">
                  <div>
                    <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Attendance</p>
                    <p className="text-lg font-black">{child.att}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Performance</p>
                    <p className="text-lg font-black text-primary">{child.perf}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Driver Widgets
export const DriverRoute = () => (
  <Card className="border-none shadow-2xl bg-white/40 backdrop-blur-md overflow-hidden">
    <div className="h-48 bg-soft-clay relative flex items-center justify-center border-b border-border/50">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <Bus className="w-16 h-16 text-primary opacity-20" />
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm border border-border/50 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-orange" />
        <span className="text-sm font-bold">Route A-12 • North Campus</span>
      </div>
    </div>
    <CardContent className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black">Morning Trip</h3>
          <p className="text-muted-foreground font-medium">8 stops remaining • 42 students onboard</p>
        </div>
        <Button className="rounded-2xl px-8 h-12 shadow-xl shadow-primary/20">Start Trip</Button>
      </div>
      <div className="space-y-6">
        {[
          { stop: "Oakwood Heights", time: "07:15 AM", status: "Reached", done: true },
          { stop: "Maple Avenue", time: "07:30 AM", status: "On-going", active: true },
          { stop: "Downtown Station", time: "07:45 AM", status: "Upcoming" },
        ].map((stop, i) => (
          <div key={i} className="flex items-center gap-6 group">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-4 h-4 rounded-full border-2",
                stop.done ? "bg-brand-green border-brand-green" : stop.active ? "bg-white border-brand-orange animate-pulse scale-125" : "bg-white border-border"
              )} />
              {i < 2 && <div className="w-0.5 h-12 bg-border group-last:hidden" />}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("font-bold", stop.active && "text-brand-orange")}>{stop.stop}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stop.time}</p>
                </div>
                {stop.done && <CheckCircle2 className="w-5 h-5 text-brand-green" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Empty State Component
export const EmptyModule = ({ moduleName }: { moduleName: string }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/50 border-dashed">
    <div className="w-24 h-24 bg-soft-parchment rounded-full flex items-center justify-center mb-8 shadow-inner">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
        <AlertCircle className="w-8 h-8 text-muted-foreground/30" />
      </div>
    </div>
    <h2 className="text-3xl font-black mb-4 tracking-tight">Under Construction</h2>
    <p className="text-muted-foreground text-center max-w-sm font-medium leading-relaxed">
      The <strong>{moduleName}</strong> module is currently being built for your school. Please check back later.
    </p>
    <Button variant="outline" className="mt-8 rounded-full px-8 hover:bg-white transition-all duration-300">
      Request Feature Access
    </Button>
  </div>
);

// --- PRINCIPAL DASHBOARD COMPONENTS ---

// 1. Top Summary Cards
export const PrincipalSummaryCards = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
    <StatsCard icon={Users} label="Total Students" value="1,248" color="bg-brand-green" />
    <StatsCard icon={GraduationCap} label="Total Staff" value="86" color="bg-brand-purple" />
    <StatsCard icon={CheckCircle2} label="Today Attendance" value="94.2%" sub="1,176 Present" color="bg-brand-green" />
    <StatsCard icon={Wallet} label="Pending Fees" value="$45,200" sub="128 Overdue" color="bg-brand-orange" />
    <StatsCard icon={TrendingUp} label="Active Classes" value="42" sub="Across 12 Sections" color="bg-primary" />
    <StatsCard icon={Bus} label="Active Routes" value="18" sub="All buses on track" color="bg-oat" />
  </div>
);

// 2. Analytics & Charts
export const PrincipalAnalytics = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg">Fee Collection</CardTitle>
        <CardDescription>Collected vs Pending (Monthly)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-green" />
              <span className="font-medium">Collected: $128.4k</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-orange/30" />
              <span className="font-medium">Pending: $45.2k</span>
            </div>
          </div>
          <div className="h-4 w-full bg-brand-orange/10 rounded-full overflow-hidden flex">
            <div className="h-full bg-brand-green" style={{ width: '74%' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-soft-sage/50 border border-brand-green/20">
              <p className="text-xs font-black text-brand-green uppercase">This Month</p>
              <p className="text-xl font-black mt-1">$24.8k</p>
            </div>
            <div className="p-4 rounded-2xl bg-soft-clay/50 border border-brand-orange/20">
              <p className="text-xs font-black text-brand-orange uppercase">Growth</p>
              <p className="text-xl font-black mt-1">+8.2%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg">Academic Snapshot</CardTitle>
        <CardDescription>Assignments & Exams activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "Assignments Created", value: "156", color: "text-primary" },
          { label: "Pending Submissions", value: "842", color: "text-brand-orange" },
          { label: "Ongoing Exams", value: "8", color: "text-brand-purple" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-border/50">
            <span className="text-sm font-bold">{item.label}</span>
            <span className={cn("text-lg font-black", item.color)}>{item.value}</span>
          </div>
        ))}
        <Button variant="ghost" className="w-full mt-2 text-xs font-black text-primary hover:bg-primary/5">
          VIEW FULL ACADEMIC REPORT <ArrowRight className="w-3 h-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  </div>
);

// 3. Operational Overview
export const PrincipalOperational = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activities */}
      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-1">
            {[
              { icon: Users, text: "New student admission: Sarah Jenkins", time: "10m ago", color: "text-primary" },
              { icon: Wallet, text: "Fee payment received: Class 4-B", time: "45m ago", color: "text-brand-green" },
              { icon: CheckCircle2, text: "Attendance marked for all classes", time: "2h ago", color: "text-brand-orange" },
              { icon: TrendingUp, text: "Math T2 results published", time: "3h ago", color: "text-brand-purple" },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/40 transition-colors border-b border-border/30 last:border-0">
                <div className={cn("p-2 rounded-lg bg-white shadow-sm", act.color)}>
                  <act.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{act.text}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card className="border-none shadow-xl bg-brand-orange/5 border-l-4 border-brand-orange">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-orange" /> Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-brand-orange/20 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-black">Low Attendance Warning</p>
                <p className="text-xs text-muted-foreground mt-1">Section 12-C attendance dropped below 75% today.</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-orange/20 shadow-sm">
            <div className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-brand-orange mt-0.5" />
              <div>
                <p className="text-sm font-black">Fee Overdue Alert</p>
                <p className="text-xs text-muted-foreground mt-1">42 students have pending dues for April session.</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-orange/20 shadow-sm">
            <div className="flex items-start gap-3">
              <Bus className="w-5 h-5 text-slate-600 mt-0.5" />
              <div>
                <p className="text-sm font-black">Transport Delay</p>
                <p className="text-xs text-muted-foreground mt-1">Route B-4 delayed by 15 mins due to traffic.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary via-primary to-[#d66b5c] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-orange/20 rounded-full -ml-16 -mb-16 blur-2xl" />
        <CardHeader className="relative z-10 pb-4">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <LayoutGrid className="w-4 h-4" />
            </div>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 relative z-10">
          {[
            { label: "Add Student", icon: Users, color: "bg-white/10", path: "/students" },
            { label: "Announcement", icon: Bell, color: "bg-white/10", path: "/communication" },
            { label: "Create Task", icon: FileText, color: "bg-white/10", path: "/assignments" },
            { label: "Add Staff", icon: GraduationCap, color: "bg-white/10" },
            { label: "Schedule Exam", icon: Calendar, color: "bg-white/10", path: "/exams" },
          ].map((action, i) => (
            <button key={i} onClick={() => action.path && navigate(action.path)} className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all duration-300 group backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase text-center leading-tight tracking-wider opacity-90 group-hover:opacity-100">{action.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// 4. Module Snapshots
export const PrincipalModuleSnapshots = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card className="border-none bg-soft-sky border border-primary/5">
      <CardContent className="p-6">
        <h4 className="text-sm font-black text-primary uppercase mb-4">Students</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Active</span>
            <span>1,150</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">New Admissions</span>
            <span className="text-brand-green">+24</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Transferred</span>
            <span className="text-brand-orange">5</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-none bg-soft-parchment border border-primary/10">
      <CardContent className="p-6">
        <h4 className="text-sm font-black text-primary uppercase mb-4">Staff</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Present Today</span>
            <span className="text-brand-green">82</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">On Leave</span>
            <span className="text-destructive">4</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Total Positions</span>
            <span>90</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-none bg-soft-honey border border-brand-orange/10">
      <CardContent className="p-6">
        <h4 className="text-sm font-black text-brand-orange uppercase mb-4">Exams & Results</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Upcoming</span>
            <span>Class 10 Mock</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Results Pending</span>
            <span className="text-brand-orange">3 Classes</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Next Exam</span>
            <span>May 15</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-none bg-soft-oat border border-primary/5">
      <CardContent className="p-6">
        <h4 className="text-sm font-black text-primary uppercase mb-4">Transport</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Routes Active</span>
            <span>18 / 18</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Delayed Trips</span>
            <span className="text-brand-green">None</span>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Total Students</span>
            <span>420</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// 5. Tables
export const PrincipalTables = () => (
  <div className="space-y-12">
    {/* Recent Admissions */}
    <div>
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h3 className="text-2xl font-black tracking-tight">Recent Admissions</h3>
          <p className="text-sm text-muted-foreground font-medium">Latest students added to the system</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl font-black text-xs px-4 border-primary/20 text-primary hover:bg-primary/5">
          VIEW ALL STUDENTS
        </Button>
      </div>
      <div className="overflow-hidden bg-white/40 backdrop-blur-md rounded-[32px] border border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-primary/5 border-b border-border/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-primary/70">Student Name</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-primary/70">Assigned Class</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-primary/70">Admission Date</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-primary/70 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Sarah Jenkins", class: "Class 4-A", date: "May 5, 2026", status: "Active" },
                { name: "Michael Chen", class: "Class 11-B", date: "May 4, 2026", status: "Pending" },
                { name: "Emily Wilson", class: "Class 8-C", date: "May 4, 2026", status: "Active" },
                { name: "Robert Taylor", class: "Class 6-A", date: "May 3, 2026", status: "Active" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-white/60 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold group-hover:text-primary transition-colors">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-muted-foreground font-medium">{row.class}</td>
                  <td className="px-8 py-5 text-sm text-muted-foreground font-medium">{row.date}</td>
                  <td className="px-8 py-5 text-right">
                    <Badge variant={row.status === 'Active' ? 'brand-green' : 'outline'} className="text-[10px] font-black px-3 py-1 uppercase rounded-lg">
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Pending Fees */}
    <div>
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h3 className="text-2xl font-black tracking-tight">Pending Fees</h3>
          <p className="text-sm text-muted-foreground font-medium">Students with outstanding dues for the current term</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl font-black text-xs px-4 border-destructive/20 text-destructive hover:bg-destructive/5">
          GENERATE RECALLS
        </Button>
      </div>
      <div className="overflow-hidden bg-white/40 backdrop-blur-md rounded-[32px] border border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-destructive/5 border-b border-border/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70">Student Name</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70">Class</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70">Due Amount</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70 text-right">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Jason Miller", class: "Class 10-A", amount: "$1,250", date: "Apr 30, 2026" },
                { name: "Linda Thompson", class: "Class 12-C", amount: "$840", date: "Apr 30, 2026" },
                { name: "Kevin Anderson", class: "Class 5-B", amount: "$1,100", date: "May 1, 2026" },
                { name: "Rachel Adams", class: "Class 7-A", amount: "$950", date: "May 2, 2026" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-white/60 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-black text-destructive">
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold group-hover:text-destructive transition-colors">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-muted-foreground font-medium">{row.class}</td>
                  <td className="px-8 py-5 text-sm font-black text-destructive">{row.amount}</td>
                  <td className="px-8 py-5 text-sm text-muted-foreground font-medium text-right italic">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
// --- PRINCIPAL CHARTS SECTION ---

const CHART_COLORS = {
  primary: '#C37A67',
  success: '#88AC88',
  warning: '#E4B76D',
  info: '#A78BFA',
  error: '#E63946',
  muted: '#8B7E74',
  border: '#E9E1D5',
  foreground: '#3A2C2B'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E9E1D5] p-3 rounded-xl shadow-xl">
        <p className="text-[#3A2C2B] font-black text-xs mb-2 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-[#3A2C2B] font-bold text-xs">
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

export const PrincipalCharts = () => {
  // 1. Attendance Data
  const attendanceData = [
    { name: 'Mon', value: 88 },
    { name: 'Tue', value: 92 },
    { name: 'Wed', value: 95 },
    { name: 'Thu', value: 89 },
    { name: 'Fri', value: 94 },
    { name: 'Sat', value: 91 },
    { name: 'Sun', value: 96 },
  ];

  // 2. Fee Collection Data
  const feeData = [
    { month: 'Jan', collected: 45000, pending: 12000, overdue: 5000 },
    { month: 'Feb', collected: 52000, pending: 8000, overdue: 3000 },
    { month: 'Mar', collected: 48000, pending: 15000, overdue: 4500 },
    { month: 'Apr', collected: 61000, pending: 5000, overdue: 2000 },
  ];

  // 3. Student Distribution
  const studentDist = [
    { name: 'Active', value: 1150 },
    { name: 'Inactive', value: 50 },
    { name: 'Transfers', value: 48 },
  ];

  // 4. Staff Attendance
  const staffAtt = [
    { name: 'Present', value: 82 },
    { name: 'Absent', value: 8 },
  ];

  // 5. Academic Activity
  const academicData = [
    { name: 'Assignments', count: 156 },
    { name: 'Quizzes', count: 84 },
    { name: 'Exams', count: 12 },
    { name: 'Materials', count: 245 },
  ];

  // 6. Transport Status
  const transportData = [
    { name: 'On Time', value: 14 },
    { name: 'Delayed', value: 3 },
    { name: 'Cancelled', value: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Attendance Trend - Full Width */}
      <Card className="border-none shadow-xl bg-white overflow-hidden group w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-[#3A2C2B]">Attendance Trend</CardTitle>
          <CardDescription className="text-[#8B7E74]">Weekly student presence overview</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_COLORS.primary, strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAtt)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Fee Collection - Full Width */}
      <Card className="border-none shadow-xl bg-white overflow-hidden group w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-[#3A2C2B]">Fee Collection</CardTitle>
          <CardDescription className="text-[#8B7E74]">Comparison of payments status</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F1DE', opacity: 0.5 }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
              <Bar dataKey="collected" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} name="Collected" />
              <Bar dataKey="pending" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} name="Pending" />
              <Bar dataKey="overdue" fill={CHART_COLORS.error} radius={[4, 4, 0, 0]} name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Academic Activity - Full Width */}
      <Card className="border-none shadow-xl bg-white overflow-hidden group w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-black text-[#3A2C2B]">Academic Activity</CardTitle>
          <CardDescription className="text-[#8B7E74]">Content creation metrics</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={academicData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_COLORS.border} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: CHART_COLORS.foreground, fontSize: 10, fontWeight: 800 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FDFBF7' }} />
              <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Bottom Row - 3 Donuts side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Distribution */}
        <Card className="border-none shadow-xl bg-white overflow-hidden group">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-lg font-black text-[#3A2C2B]">Student Distribution</CardTitle>
            <CardDescription className="text-[#8B7E74]">Current enrollment status</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill={CHART_COLORS.success} />
                  <Cell fill={CHART_COLORS.muted} />
                  <Cell fill={CHART_COLORS.info} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-18px]">
              <p className="text-[10px] font-black text-[#8B7E74] uppercase">Total</p>
              <p className="text-2xl font-black text-[#3A2C2B]">1,248</p>
            </div>
          </CardContent>
        </Card>

        {/* Staff Attendance */}
        <Card className="border-none shadow-xl bg-white overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black text-[#3A2C2B]">Staff Attendance</CardTitle>
            <CardDescription className="text-[#8B7E74]">Daily presence snapshot</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={staffAtt}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={CHART_COLORS.success} />
                  <Cell fill={CHART_COLORS.warning} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-10px]">
              <p className="text-xl font-black text-[#3A2C2B]">91%</p>
            </div>
          </CardContent>
        </Card>

        {/* Transport Status */}
        <Card className="border-none shadow-xl bg-white overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black text-[#3A2C2B]">Transport Status</CardTitle>
            <CardDescription className="text-[#8B7E74]">Trip performance overview</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transportData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill={CHART_COLORS.success} />
                  <Cell fill={CHART_COLORS.warning} />
                  <Cell fill={CHART_COLORS.error} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Domain-Specific Modular Widgets ---

import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

export const DashboardSection = ({ title, children, filters }: { title: string, children: React.ReactNode, filters?: React.ReactNode }) => (
  <section className="space-y-6 pt-4 mb-12">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
      <h2 className="text-xl font-black uppercase tracking-[0.1em] text-[#3A2C2B]">{title}</h2>
      {filters && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {filters}
        </div>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
      {children}
    </div>
  </section>
);

export const DashboardFilter = ({ label, options }: { label: string, options: string[] }) => (
  <Select
    label={label}
    options={options.map(opt => ({ label: opt, value: opt.toLowerCase() }))}
    value={options[0]}
    className="min-w-[140px]"
  />
);

export const DashboardDateFilter = ({ label }: { label: string }) => (
  <div className="relative group min-w-[170px] w-full sm:w-auto">
    <div className="flex flex-col justify-center w-full h-[54px] bg-white/50 border border-border/50 rounded-2xl px-4 hover:bg-white hover:border-primary/30 transition-all cursor-pointer shadow-sm focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/70 leading-none mb-1">
        {label}
      </span>
      <div className="flex items-center justify-between w-full relative">
        <Input
          type="date"
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full bg-transparent border-none p-0 h-auto text-xs font-bold text-[#3A2C2B] outline-none shadow-none focus-visible:ring-0 pr-8"
        />
        <div className="absolute right-0 flex items-center pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
          <Calendar className="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
);
// 1. Student Domain Components
export const StudentSnapshot = () => (
  <Card className="border-none bg-[#BFDDD8] shadow-xl overflow-hidden h-full">
    <CardContent className="p-6">
      <h4 className="text-sm font-black text-[#3A2C2B] uppercase mb-4 opacity-70">Student Status</h4>
      <div className="space-y-3">
        {[
          { label: "Active", value: "1,150", color: "text-[#3A2C2B]" },
          { label: "New Admissions", value: "+24", color: "text-[#3A2C2B]" },
          { label: "Transferred", value: "5", color: "text-[#3A2C2B]/80" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs font-bold border-b border-[#3A2C2B]/10 pb-2 last:border-0 last:pb-0">
            <span className="text-[#3A2C2B]/70">{item.label}</span>
            <span className={item.color}>{item.value}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const StudentDistributionChart = () => (
  <Card className="border-none shadow-xl bg-white overflow-hidden group h-full">
    <CardHeader className="pb-2 text-center">
      <CardTitle className="text-lg font-black text-[#3A2C2B]">Student Distribution</CardTitle>
      <CardDescription className="text-[#8B7E74]">Current enrollment status</CardDescription>
    </CardHeader>
    <CardContent className="h-[280px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              { name: 'Active', value: 1150 },
              { name: 'Inactive', value: 50 },
              { name: 'Transfers', value: 48 },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={8}
            dataKey="value"
          >
            <Cell fill={CHART_COLORS.success} />
            <Cell fill={CHART_COLORS.muted} />
            <Cell fill={CHART_COLORS.info} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-18px]">
        <p className="text-[10px] font-black text-[#8B7E74] uppercase">Total</p>
        <p className="text-2xl font-black text-[#3A2C2B]">1,248</p>
      </div>
    </CardContent>
  </Card>
);

export const RecentAdmissionsTable = () => (
  <Card className="border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden h-full">
    <CardHeader className="px-8 pt-8">
      <CardTitle className="text-xl font-black text-[#3A2C2B]">Recent Admissions</CardTitle>
    </CardHeader>
    <CardContent className="px-0">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="bg-primary/5 border-b border-border/20">
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-primary/70">Student Name</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-primary/70">Class</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-primary/70 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Sarah Jenkins", grade: "10-A", status: "Active" },
              { name: "Michael Chen", grade: "12-C", status: "Pending" },
              { name: "Emily Davis", grade: "9-B", status: "Active" },
              { name: "James Wilson", grade: "11-A", status: "Active" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-white/60 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                      {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-bold group-hover:text-primary transition-colors whitespace-nowrap">{row.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-muted-foreground font-medium">{row.grade}</td>
                <td className="px-8 py-5 text-right">
                  <Badge variant={row.status === 'Active' ? 'brand-green' : 'outline'} className="rounded-lg font-black text-[10px] uppercase">
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// 2. Academic Domain Components
export const AcademicActivityChart = () => (
  <Card className="border-none shadow-xl bg-white overflow-hidden group h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-black text-[#3A2C2B]">Academic Activity</CardTitle>
      <CardDescription className="text-[#8B7E74]">Content creation metrics</CardDescription>
    </CardHeader>
    <CardContent className="h-[300px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={[
          { name: 'Assignments', count: 156 },
          { name: 'Quizzes', count: 84 },
          { name: 'Exams', count: 12 },
          { name: 'Materials', count: 245 },
        ]} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_COLORS.border} />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.foreground, fontSize: 10, fontWeight: 800 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FDFBF7' }} />
          <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const AcademicSnapshotList = () => (
  <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md h-full">
    <CardHeader>
      <CardTitle className="text-lg">Academic Snapshot</CardTitle>
      <CardDescription>Assignments & Exams activity</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {[
        { label: "Assignments Created", value: "156", color: "text-primary" },
        { label: "Pending Submissions", value: "842", color: "text-brand-orange" },
        { label: "Ongoing Exams", value: "8", color: "text-brand-purple" },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-border/50">
          <span className="text-sm font-bold">{item.label}</span>
          <span className={cn("text-lg font-black", item.color)}>{item.value}</span>
        </div>
      ))}
      <Button variant="ghost" className="w-full mt-2 text-xs font-black text-primary hover:bg-primary/5">
        VIEW FULL ACADEMIC REPORT <ArrowRight className="w-3 h-3 ml-2" />
      </Button>
    </CardContent>
  </Card>
);

export const ExamModuleWidget = () => (
  <Card className="border-none bg-[#F0E0AD] shadow-xl overflow-hidden h-full">
    <CardContent className="p-6">
      <h4 className="text-sm font-black text-[#3A2C2B] uppercase mb-4 opacity-70">Exams & Results</h4>
      <div className="space-y-3">
        {[
          { label: "Upcoming", value: "Class 10 Mock", color: "text-[#3A2C2B]" },
          { label: "Results Pending", value: "3 Classes", color: "text-[#3A2C2B]" },
          { label: "Next Exam", value: "May 15", color: "text-[#3A2C2B]" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs font-bold border-b border-[#3A2C2B]/10 pb-2 last:border-0 last:pb-0">
            <span className="text-[#3A2C2B]/70">{item.label}</span>
            <span className={item.color}>{item.value}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// 3. Finance Domain Components
export const FeeCollectionTrendChart = () => (
  <Card className="border-none shadow-xl bg-white overflow-hidden group h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-black text-[#3A2C2B]">Fee Collection Trends</CardTitle>
      <CardDescription className="text-[#8B7E74]">Monthly comparison</CardDescription>
    </CardHeader>
    <CardContent className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={[
          { month: 'Jan', collected: 45000, pending: 12000, overdue: 5000 },
          { month: 'Feb', collected: 52000, pending: 8000, overdue: 3000 },
          { month: 'Mar', collected: 48000, pending: 15000, overdue: 4500 },
          { month: 'Apr', collected: 61000, pending: 5000, overdue: 2000 },
        ]}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F1DE', opacity: 0.5 }} />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
          <Bar dataKey="collected" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} name="Collected" />
          <Bar dataKey="pending" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} name="Pending" />
          <Bar dataKey="overdue" fill={CHART_COLORS.error} radius={[4, 4, 0, 0]} name="Overdue" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const PendingFeesTableWidget = () => (
  <Card className="border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden h-full">
    <CardHeader className="px-8 pt-8 pb-2">
      <CardTitle className="text-xl font-black text-[#3A2C2B]">Pending Fees</CardTitle>
    </CardHeader>
    <CardContent className="px-0">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-destructive/20">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="bg-destructive/5 border-b border-border/20">
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70">Student Name</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70">Class</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70">Due Amount</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-destructive/70 text-right">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Jason Miller", class: "Class 10-A", amount: "$1,250", date: "Apr 30, 2026" },
              { name: "Linda Thompson", class: "Class 12-C", amount: "$840", date: "Apr 30, 2026" },
              { name: "Kevin Anderson", class: "Class 5-B", amount: "$1,100", date: "May 1, 2026" },
              { name: "Rachel Adams", class: "Class 7-A", amount: "$950", date: "May 2, 2026" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-white/60 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-black text-destructive">
                      {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-bold group-hover:text-destructive transition-colors whitespace-nowrap">{row.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-muted-foreground font-medium whitespace-nowrap">{row.class}</td>
                <td className="px-8 py-5 text-sm font-black text-destructive whitespace-nowrap">{row.amount}</td>
                <td className="px-8 py-5 text-sm text-muted-foreground font-medium text-right italic whitespace-nowrap">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export const FinanceSummaryWidget = () => (
  <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md h-full">
    <CardHeader>
      <CardTitle className="text-lg">Fee Collection Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-green" />
            <span className="font-medium">Collected: $128.4k</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-orange/30" />
            <span className="font-medium">Pending: $45.2k</span>
          </div>
        </div>
        <div className="h-4 w-full bg-brand-orange/10 rounded-full overflow-hidden flex">
          <div className="h-full bg-brand-green" style={{ width: '74%' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-soft-sage/50 border border-brand-green/20">
            <p className="text-xs font-black text-brand-green uppercase">This Month</p>
            <p className="text-xl font-black mt-1">$24.8k</p>
          </div>
          <div className="p-4 rounded-2xl bg-soft-clay/50 border border-brand-orange/20">
            <p className="text-xs font-black text-brand-orange uppercase">Growth</p>
            <p className="text-xl font-black mt-1">+8.2%</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 4. Attendance Domain Components
export const AttendanceTrendAreaChart = () => (
  <Card className="border-none shadow-xl bg-white overflow-hidden group h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-black text-[#3A2C2B]">Attendance Trend</CardTitle>
      <CardDescription className="text-[#8B7E74]">Weekly student presence overview</CardDescription>
    </CardHeader>
    <CardContent className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[
          { name: 'Mon', value: 88 },
          { name: 'Tue', value: 92 },
          { name: 'Wed', value: 95 },
          { name: 'Thu', value: 89 },
          { name: 'Fri', value: 94 },
          { name: 'Sat', value: 91 },
          { name: 'Sun', value: 96 },
        ]}>
          <defs>
            <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_COLORS.primary, strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" stroke={CHART_COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const StaffAttendanceDonutChart = () => (
  <Card className="border-none shadow-xl bg-white overflow-hidden group h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-black text-[#3A2C2B]">Staff Attendance</CardTitle>
      <CardDescription className="text-[#8B7E74]">Daily presence snapshot</CardDescription>
    </CardHeader>
    <CardContent className="h-[280px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              { name: 'Present', value: 82 },
              { name: 'Absent', value: 8 },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            <Cell fill={CHART_COLORS.success} />
            <Cell fill={CHART_COLORS.warning} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-10px]">
        <p className="text-xl font-black text-[#3A2C2B]">91%</p>
      </div>
    </CardContent>
  </Card>
);

// 5. Transport Domain Components
export const TransportStatusDonutChart = () => (
  <Card className="border-none shadow-xl bg-white overflow-hidden group h-full">
    <CardHeader className="pb-2 text-center">
      <CardTitle className="text-lg font-black text-[#3A2C2B]">Transport Status</CardTitle>
      <CardDescription className="text-[#8B7E74]">Trip performance overview</CardDescription>
    </CardHeader>
    <CardContent className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              { name: 'On Time', value: 14 },
              { name: 'Delayed', value: 3 },
              { name: 'Cancelled', value: 1 },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={8}
            dataKey="value"
          >
            <Cell fill={CHART_COLORS.success} />
            <Cell fill={CHART_COLORS.warning} />
            <Cell fill={CHART_COLORS.error} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export const TransportSnapshotWidget = () => (
  <Card className="border-none shadow-xl bg-[#F9F7F5] overflow-hidden group h-full">
    <CardContent className="p-4 h-full flex flex-col">
      <h4 className="text-sm font-black text-[#C37A67] mb-4 uppercase tracking-wider text-[10px] opacity-80">Live Transport</h4>
      <div className="space-y-3 mb-3">
        {[
          { label: "Buses Active", value: "14/15" },
          { label: "Delayed Routes", value: "3", color: "text-[#E4B76D]" },
          { label: "Students in Transit", value: "482" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center text-xs font-bold border-b border-[#C37A67]/10 pb-2 last:border-0 last:pb-0">
            <span className="text-[#8B7E74]">{item.label}</span>
            <span className={cn("text-[#C37A67]", item.color)}>{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-2 flex justify-center items-end">
        <img
          src="/school bus-amico.png"
          alt="Transport Illustration"
          className="w-full max-w-[240px] h-auto object-contain drop-shadow-xl"
        />
      </div>
    </CardContent>
  </Card>
);

// 6. Operations Domain Components
export const RecentActivitiesWidget = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<any>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 1000);
  };

  return (
    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-black text-[#3A2C2B]">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="px-0 flex-1 overflow-hidden">
        <div
          onScroll={handleScroll}
          className={cn(
            "h-[280px] overflow-y-auto overflow-x-hidden scroll-smooth pr-1",
            isScrolling ? "custom-scrollbar-active" : "custom-scrollbar-hidden"
          )}
        >
          <div className="space-y-1 w-full">
            {[
              { icon: Users, text: "New student admission: Sarah Jenkins", time: "10m ago", color: "text-[#C37A67]" },
              { icon: Wallet, text: "Fee payment received: Class 4-B", time: "45m ago", color: "text-[#88AC88]" },
              { icon: CheckCircle2, text: "Attendance marked for all classes", time: "2h ago", color: "text-[#E4B76D]" },
              { icon: TrendingUp, text: "Math T2 results published", time: "3h ago", color: "text-[#B47B7B]" },
              { icon: Users, text: "New staff joined: Dr. Michael Ross", time: "5h ago", color: "text-[#C37A67]" },
              { icon: Wallet, text: "Transport fee updated for Route B", time: "6h ago", color: "text-[#88AC88]" },
              { icon: Bell, text: "Annual day announcement sent", time: "1d ago", color: "text-[#E4B76D]" },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/40 transition-colors border-b border-[#3A2C2B]/5 last:border-0">
                <div className={cn("p-2 rounded-lg bg-white shadow-sm", act.color)}>
                  <act.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#3A2C2B] truncate">{act.text}</p>
                  <p className="text-[10px] font-medium text-[#8B7E74] uppercase">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar-active::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-active::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-active::-webkit-scrollbar-thumb { background: #C37A67; border-radius: 10px; }
        .custom-scrollbar-hidden::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-hidden::-webkit-scrollbar-thumb { background: transparent; }
      `}} />
    </Card>
  );
};

export const AlertsNotificationsWidget = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<any>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 1000);
  };

  return (
    <Card className="border-none shadow-xl bg-[#FFF9E5]/50 border-l-4 border-[#E4B76D] h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 font-black text-[#3A2C2B]">
          <Bell className="w-5 h-5 text-[#E4B76D]" /> Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-4">
        <div
          onScroll={handleScroll}
          className={cn(
            "h-[280px] overflow-y-auto overflow-x-hidden scroll-smooth pr-1",
            isScrolling ? "custom-scrollbar-orange-active" : "custom-scrollbar-hidden"
          )}
        >
          <div className="space-y-4 py-2">
            {[
              { title: "Low Attendance Warning", text: "Section 12-C attendance dropped below 75% today.", icon: AlertCircle, color: "text-destructive" },
              { title: "Fee Overdue Alert", text: "42 students have pending dues for April session.", icon: Wallet, color: "text-[#E4B76D]" },
              { title: "Transport Delay", text: "Route B-4 delayed by 15 mins due to traffic.", icon: Bus, color: "text-[#3A2C2B]/60" },
              { title: "Staff Meeting", text: "Urgent meeting for all department heads at 4 PM.", icon: Bell, color: "text-[#C37A67]" },
              { title: "System Update", text: "Dashboard maintenance scheduled for midnight.", icon: Settings, color: "text-[#88AC88]" },
              { title: "Exam Schedule", text: "Final term exams start from next Monday.", icon: Calendar, color: "text-[#B47B7B]" },
            ].map((alert, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-[#3A2C2B]/5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3">
                  <alert.icon className={cn("w-5 h-5 mt-0.5", alert.color)} />
                  <div>
                    <p className="text-sm font-black text-[#3A2C2B]">{alert.title}</p>
                    <p className="text-xs text-[#8B7E74] mt-1">{alert.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar-orange-active::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-orange-active::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-orange-active::-webkit-scrollbar-thumb { background: #E4B76D; border-radius: 10px; }
        .custom-scrollbar-hidden::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar-hidden::-webkit-scrollbar-thumb { background: transparent; }
      `}} />
    </Card>
  );
};

export const QuickActionsWidget = () => {
  const navigate = useNavigate();
  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-primary via-primary to-[#d66b5c] text-white overflow-hidden relative h-full">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-orange/20 rounded-full -ml-16 -mb-16 blur-2xl" />
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="text-xl font-black flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <LayoutGrid className="w-4 h-4" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 relative z-10">
        {[
          { label: "Add Student", icon: Users, color: "bg-white/10", path: "/students" },
          { label: "Announcement", icon: Bell, color: "bg-white/10", path: "/communication" },
          { label: "Create Task", icon: FileText, color: "bg-white/10", path: "/assignments" },
          { label: "Add Staff", icon: GraduationCap, color: "bg-white/10" },
          { label: "Schedule Exam", icon: Calendar, color: "bg-white/10", path: "/exams" },
        ].map((action, i) => (
          <button key={i} onClick={() => action.path && navigate(action.path)} className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all duration-300 group backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase text-center leading-tight tracking-wider opacity-90 group-hover:opacity-100">{action.label}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
