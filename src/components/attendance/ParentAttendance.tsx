import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Download,
  UserMinus,
  BarChart3,
  GraduationCap
} from "lucide-react";
import {
  Card,
  CardContent,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { StatsCard } from '../dashboard/DashboardWidgets';
import { cn } from "../../lib/utils";

const CHILDREN = [
  { id: '1', name: 'Sarah Jenkins', class: 'Class 10-A' },
  { id: '2', name: 'Michael Jenkins', class: 'Class 8-B' },
];

const STUDENT_DAY_LOG = [
  { period: "1st Period", subject: "Mathematics", time: "08:15 AM - 09:00 AM", status: "Present" },
  { period: "2nd Period", subject: "Science", time: "09:00 AM - 09:45 AM", status: "Present" },
  { period: "3rd Period", subject: "English", time: "10:00 AM - 10:45 AM", status: "Half Day (Exit)" },
  { period: "4th Period", subject: "Lunch Break", time: "10:45 AM - 11:30 AM", status: "Absent" },
  { period: "5th Period", subject: "History", time: "11:30 AM - 12:15 PM", status: "Absent" },
  { period: "6th Period", subject: "Physics", time: "12:15 PM - 01:00 PM", status: "Absent" },
];

const SUBJECT_PERFORMANCE = [
  { name: "Mathematics", percentage: 94.5, status: "Excellent", attended: 85, total: 90 },
  { name: "Science", percentage: 88.2, status: "Good", attended: 75, total: 85 },
  { name: "English", percentage: 91.0, status: "Very Good", attended: 82, total: 90 },
  { name: "Physics", percentage: 96.8, status: "Excellent", attended: 30, total: 31 },
  { name: "History", percentage: 82.4, status: "Average", attended: 14, total: 17 }
];

export default function ParentAttendance() {
  const [studentViewDate, setStudentViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0].id);

  const totalAttended = SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + curr.attended, 0);
  const totalHeld = SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + curr.total, 0);
  const overallAttendance = ((totalAttended / totalHeld) * 100).toFixed(1);
  const totalAbsences = SUBJECT_PERFORMANCE.reduce((acc, curr) => acc + (curr.total - curr.attended), 0);

  const studentSummary = [
    { label: "Overall Attendance %", value: `${overallAttendance}%`, icon: BarChart3, color: "bg-primary" },
    { label: "Total Subject Periods", value: totalHeld.toString(), icon: Calendar, color: "bg-oat" },
    { label: "Periods Attended", value: totalAttended.toString(), icon: CheckCircle2, color: "bg-brand-green" },
    { label: "Periods Missed", value: totalAbsences.toString(), icon: XCircle, color: "bg-brand-orange" },
    { label: "Late Arrivals", value: "04", icon: Clock, color: "bg-brand-purple" },
    { label: "Half Days", value: "01", icon: UserMinus, color: "bg-brand-blue" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 1. Parent Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 lg:px-6">
        <div>
          <h1 className="text-4xl font-black text-[#3A2C2B] tracking-tight">Children's Attendance</h1>
          <p className="text-sm text-muted-foreground font-medium mt-2">Monitor your children's daily presence and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 h-11 px-6 font-black uppercase text-[10px] tracking-widest gap-2 bg-white">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* 2. Cumulative Summary Cards - 2-Column on Mobile */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2 mb-4 ml-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          <h3 className="text-lg font-black text-[#3A2C2B]">Overview:</h3>
          {CHILDREN.length > 1 ? (
            <div className="w-64">
              <Select
                options={CHILDREN.map(c => ({ label: `${c.name} (${c.class})`, value: c.id }))}
                value={selectedChild}
                onChange={setSelectedChild}
                className="h-10 border-primary/20 bg-white shadow-sm"
              />
            </div>
          ) : (
            <h3 className="text-lg font-black text-[#3A2C2B]">{CHILDREN[0].name} ({CHILDREN[0].class})</h3>
          )}
        </div>
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
                <p className="text-sm text-muted-foreground font-medium">Track presence across every subject period</p>
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
}
