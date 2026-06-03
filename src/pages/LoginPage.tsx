import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadStoredRolePermissions, hasAnyPermission } from '../config/permissions';
import type { Module } from '../config/roles';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Loader2, ShieldCheck, User, Users, BookOpen,
  Bus, Wallet, Library, ShieldAlert, Search, X,
  Lock, Mail, Eye, EyeOff, ChevronRight, ChevronLeft, Check
} from 'lucide-react';
import { cn } from '../lib/utils';

type RoleCategory = 'All' | 'Administration' | 'Academic' | 'Finance' | 'Operations' | 'Parents & Students';

const MODULE_PATHS: Record<Module, string> = {
  DASHBOARD: '/',
  SCHOOL_STRUCTURE: '/school-structure',
  ADMISSIONS: '/admissions',
  STUDENT_MANAGEMENT: '/students',
  ACADEMIC_CONTENT: '/academics',
  TIMETABLE: '/timetable',
  ATTENDANCE: '/attendance',
  ASSIGNMENTS: '/assignments',
  EXAMS: '/exams',
  FINANCE: '/finance',
  COMMUNICATION: '/communication',
  TRANSPORT: '/transport',
  HR_STAFF: '/hr-staff',
  LEAVE_APPLICATION: '/leave-application',
  LIBRARY: '/library',
  HOSTEL: '/hostel',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  ROLE_PERMISSION_ADMIN: '/role-admin',
  AUDIT_LOGS: '/audit-logs'
};

const ORDERED_MODULES: Module[] = [
  'DASHBOARD', 'SCHOOL_STRUCTURE', 'ADMISSIONS', 'STUDENT_MANAGEMENT', 
  'ACADEMIC_CONTENT', 'TIMETABLE', 'ATTENDANCE', 'ASSIGNMENTS', 
  'EXAMS', 'FINANCE', 'COMMUNICATION', 'TRANSPORT', 'HR_STAFF', 
  'LEAVE_APPLICATION', 'LIBRARY', 'HOSTEL', 'REPORTS',
  'SETTINGS', 'ROLE_PERMISSION_ADMIN', 'AUDIT_LOGS'
];

interface RoleOption {
  email: string;
  role: string;
  subtitle: string;
  icon: any;
  color: string;
  bg: string;
  category: RoleCategory;
}

const ROLES: RoleOption[] = [
  { email: 'super@school.com', role: 'Super Admin', subtitle: 'Full system access', icon: ShieldCheck, color: 'text-brand-purple', bg: 'bg-brand-purple/10', category: 'Administration' },
  { email: 'admin@school.com', role: 'School Admin', subtitle: 'Manage school operations', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10', category: 'Administration' },
  { email: 'teacher@school.com', role: 'Teacher', subtitle: 'Manage classes & students', icon: BookOpen, color: 'text-brand-green', bg: 'bg-brand-green/10', category: 'Academic' },
  { email: 'student@school.com', role: 'Student', subtitle: 'Access learning portal', icon: User, color: 'text-brand-orange', bg: 'bg-brand-orange/10', category: 'Parents & Students' },
  { email: 'parent@school.com', role: 'Parent / Guardian', subtitle: 'View child information', icon: Users, color: 'text-brand-purple', bg: 'bg-brand-purple/10', category: 'Parents & Students' },
  { email: 'accountant@school.com', role: 'Accountant / Finance', subtitle: 'Manage finance & billing', icon: Wallet, color: 'text-brand-green', bg: 'bg-brand-green/10', category: 'Finance' },
  { email: 'hr@school.com', role: 'HR Manager', subtitle: 'Manage staff & payroll', icon: Users, color: 'text-primary', bg: 'bg-primary/10', category: 'Operations' },
  { email: 'hod@school.com', role: 'HOD', subtitle: 'Department head', icon: BookOpen, color: 'text-brand-orange', bg: 'bg-brand-orange/10', category: 'Academic' },
  { email: 'exams@school.com', role: 'Exams', subtitle: 'Manage examinations', icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', category: 'Academic' },
  { email: 'admission@school.com', role: 'Admissions', subtitle: 'Manage enrollments', icon: User, color: 'text-brand-green', bg: 'bg-brand-green/10', category: 'Administration' },
  { email: 'transport@school.com', role: 'Transport', subtitle: 'Manage fleet & routes', icon: Bus, color: 'text-brand-orange', bg: 'bg-brand-orange/10', category: 'Operations' },
  { email: 'librarian@school.com', role: 'Librarian', subtitle: 'Manage library', icon: Library, color: 'text-brand-purple', bg: 'bg-brand-purple/10', category: 'Academic' },
  { email: 'it@school.com', role: 'IT Admin', subtitle: 'System technical support', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10', category: 'Administration' },
  { email: 'warden@school.com', role: 'Warden', subtitle: 'Manage hostel', icon: ShieldAlert, color: 'text-brand-orange', bg: 'bg-brand-orange/10', category: 'Operations' },
  { email: 'driver@school.com', role: 'Driver', subtitle: 'View routes & schedules', icon: Bus, color: 'text-brand-orange', bg: 'bg-brand-orange/10', category: 'Operations' },
  { email: 'principal@school.com', role: 'Vice Principal', subtitle: 'Academic administration', icon: ShieldCheck, color: 'text-brand-purple', bg: 'bg-brand-purple/10', category: 'Administration' },
  { email: 'coordinator@school.com', role: 'Coordinator', subtitle: 'Academic coordination', icon: BookOpen, color: 'text-brand-green', bg: 'bg-brand-green/10', category: 'Academic' },
  { email: 'lab@school.com', role: 'Lab Instructor', subtitle: 'Manage laboratories', icon: BookOpen, color: 'text-brand-purple', bg: 'bg-brand-purple/10', category: 'Academic' },
  { email: 'classteacher@school.com', role: 'Class Teacher', subtitle: 'Manage assigned class', icon: BookOpen, color: 'text-brand-orange', bg: 'bg-brand-orange/10', category: 'Academic' },
  { email: 'office@school.com', role: 'Office Admin', subtitle: 'General administration', icon: Users, color: 'text-primary', bg: 'bg-primary/10', category: 'Administration' },
];

const CATEGORIES: RoleCategory[] = ['All', 'Administration', 'Academic', 'Finance', 'Operations', 'Parents & Students'];

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'roles' | 'login'>('welcome');
  const [showRoleSheet, setShowRoleSheet] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<RoleCategory>('All');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [recentRoles, setRecentRoles] = useState<RoleOption[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('edusync_recent_roles');
    if (saved) {
      try {
        const parsedEmails = JSON.parse(saved);
        const roles = parsedEmails.map((e: string) => ROLES.find(r => r.email === e)).filter(Boolean);
        setRecentRoles(roles.slice(0, 2));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setEmail(role.email);
    setStep('login');
    setShowRoleSheet(false);

    const newRecent = [role.email, ...recentRoles.map(r => r.email).filter(e => e !== role.email)].slice(0, 2);
    localStorage.setItem('edusync_recent_roles', JSON.stringify(newRecent));
    setRecentRoles(newRecent.map(e => ROLES.find(r => r.email === e)!).filter(Boolean));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setIsSubmitting(true);
    try {
      const activeRole = await login(email);
      const perms = loadStoredRolePermissions();
      
      let targetRoute = '/';
      
      for (const mod of ORDERED_MODULES) {
        if (hasAnyPermission(activeRole, mod, perms)) {
          targetRoute = MODULE_PATHS[mod];
          break;
        }
      }
      
      navigate(targetRoute);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRoles = ROLES.filter(r => {
    const matchesSearch = r.role.toLowerCase().includes(searchQuery.toLowerCase()) || r.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-primary md:bg-primary flex items-center justify-center p-0 md:p-8 text-foreground overflow-hidden" style={{ fontFamily: "'DM Serif Display', serif" }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-brand-green/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] bg-[#C37A67]/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1300px] mx-auto flex flex-col-reverse md:flex-row-reverse items-end md:items-center justify-end md:justify-between gap-0 md:gap-12 min-h-screen md:min-h-0 px-0 md:px-4 lg:px-8 py-0 md:py-0">

        {/* Mobile App View Container / Desktop Login Card */}
        <div className="w-full max-w-none md:max-w-md mx-auto md:mx-0 bg-white overflow-y-auto md:!overflow-hidden scrollbar-hide flex flex-col relative h-auto md:h-fit min-h-[55vh] md:!min-h-0 max-h-[80vh] md:!max-h-none md:w-[420px] shrink-0 px-6 pt-8 pb-10 md:p-8 md:pb-6 rounded-t-[2.5rem] md:rounded-[2.5rem] rounded-b-none shadow-[0_-10px_40px_rgba(0,0,0,0.12)] md:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] md:border md:border-black/5 animate-in fade-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-700 mt-auto md:mt-0 z-20">

          <div className="p-5 md:p-2 pb-2 flex flex-col">
            {/* Mobile Drag Handle (Visual Only) */}
            <div className="md:hidden w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6 shrink-0" />

            <div className="flex items-center justify-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
              <h2 className="text-xl md:text-2xl tracking-[0.15em] uppercase text-foreground/90 drop-shadow-sm" style={{ fontWeight: 400 }}>
                Login
              </h2>
            </div>

            {step === 'welcome' && (
              <div className="animate-in fade-in slide-in-from-left-8 duration-500 flex-1 flex flex-col">
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
                  <h1 className="text-4xl md:text-5xl mb-3 text-foreground leading-tight" style={{ fontWeight: 400 }}>Welcome Back!</h1>
                  <p className="text-foreground/70 text-sm leading-relaxed mb-6 max-w-[280px] font-medium">
                    The next generation of School Operating Systems. Unified, Secure, Scalable.
                  </p>
                </div>

                {/* School Illustration */}
                <div className="hidden md:flex w-full h-[120px] mb-4 items-center justify-center">
                  <img src="/loginhero3.png" alt="Welcome Illustration" className="max-w-full max-h-full object-contain drop-shadow-md" />
                </div>

                <div className="mt-auto flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                  <Button
                    onClick={() => setStep('roles')}
                    className="group w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center"
                  >
                    Continue as <ChevronRight className="w-5 h-5 ml-2 opacity-80 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lock className="w-3.5 h-3.5 text-foreground/40" />
                    <p className="text-xs font-medium text-foreground/50">Secure login - Your data is protected</p>
                  </div>
                </div>
              </div>
            )}

            {step === 'roles' && (
              <div className="flex animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setStep('welcome')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 text-foreground transition-colors -ml-2">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-foreground">Select Role</h3>
                </div>
                <div className="overflow-y-auto scrollbar-hide max-h-[300px] -mx-2 px-2 pb-4">
                  <div className="space-y-2">
                    {filteredRoles.map((role, index) => (
                      <button
                        key={role.email}
                        onClick={() => handleRoleSelect(role)}
                        className="group w-full flex items-center justify-between p-4 rounded-2xl transition-all border border-black/5 hover:border-primary/20 hover:shadow-lg bg-white hover:-translate-y-0.5 active:scale-[0.98] animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-backwards"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-300", role.bg, role.color)}>
                            <role.icon className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-[15px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{role.role}</p>
                            <p className="text-xs font-medium text-foreground/60 mt-0.5">{role.subtitle}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'login' && selectedRole && (
              <div className="animate-in slide-in-from-right-8 duration-300">
                <div className="bg-[#F8F9FA] rounded-2xl p-3 flex items-center justify-between mb-6 border border-[#E9E1D5]">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm", selectedRole.color)}>
                      <selectedRole.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-foreground/70 tracking-wider">Logging in as</p>
                      <p className="text-sm font-bold text-foreground">{selectedRole.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setStep('roles')} className="h-8 text-xs rounded-lg text-foreground border-foreground/20 hover:bg-black/5 bg-transparent">
                      Change
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl mb-1 text-foreground" style={{ fontWeight: 400 }}>Welcome Back!</h1>
                <p className="text-foreground/80 text-xs mb-6 font-sans">Please enter your details to sign in.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Work Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 text-foreground/50" />
                      </div>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10 rounded-xl bg-[#F8F9FA] border border-[#E9E1D5] focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-sm text-foreground placeholder:text-foreground/50"
                        placeholder="youremail@school.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-foreground/50" />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pl-10 pr-10 rounded-xl bg-[#F8F9FA] border border-[#E9E1D5] focus:border-primary focus:ring-1 focus:ring-primary shadow-sm tracking-wider text-foreground placeholder:text-foreground/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-foreground/60 hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Link to="/forgot-password" className="text-xs font-bold text-foreground/80 hover:text-foreground hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 pb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={cn("w-4 h-4 rounded flex items-center justify-center border transition-colors", rememberMe ? "bg-primary border-primary text-white" : "border-foreground/30 bg-white/40")}>
                        {rememberMe && <Check className="w-3 h-3" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                      <span className="text-xs font-semibold text-foreground">Remember me</span>
                    </label>
                  </div>

                  {error && (
                    <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-medium shadow-md shadow-primary/20">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="pt-6 pb-2 flex justify-center text-center">
            <p className="flex items-center gap-1.5 text-[10px] text-foreground/70 font-medium">
              <Lock className="w-3 h-3" /> Secure login - Your data is protected
            </p>
          </div>
        </div>

        {/* Hero Left Side Panel (Responsive) */}
        <div className="flex flex-1 w-full flex-col justify-center items-center md:items-start text-center md:text-left max-w-[800px] pt-4 md:pt-0 pb-0 md:-ml-4 animate-in fade-in slide-in-from-top-8 md:slide-in-from-left-8 duration-700">
          <h2 className="hidden md:block text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem] text-white mb-4 leading-tight md:leading-tight px-4 md:px-0 drop-shadow-sm max-w-[95%]" style={{ fontWeight: 400 }}>
            Elevate your <span className="text-[#2C2625]">school's potential.</span>
          </h2>
          
          <div className="flex justify-center md:justify-start mb-0 md:-ml-4 px-8 md:px-0 mt-auto md:mt-0">
            <img src="/loginhero3.png" alt="EduSync Mobile" className="md:hidden w-full max-w-[320px] h-auto object-contain drop-shadow-xl transition-transform duration-700" />
            <img src="/loginhero2.png" alt="EduSync Desktop" className="hidden md:block w-full max-w-[550px] md:w-[110%] h-auto object-contain drop-shadow-xl md:hover:-translate-y-2 transition-transform duration-700" />
          </div>

          <p className="hidden md:block text-white/90 text-sm md:text-xl font-medium leading-relaxed w-full max-w-full md:-mt-4 px-4 md:px-0 mb-4 md:mb-0">
            EduSync Pro provides the enterprise-grade tools you need to manage your institution efficiently, securely, and seamlessly.
          </p>
        </div>

        {/* Role Selection Bottom Sheet overlay (Mobile Only) */}
        {showRoleSheet && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRoleSheet(false)}>
            <div
              className="w-full bg-white rounded-t-[2.5rem] flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-8 duration-300"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 pb-2 flex justify-center">
                <div className="w-12 h-1.5 bg-border rounded-full" />
              </div>

              <div className="px-6 py-4 flex items-center justify-between border-b border-border/50">
                <h3 className="text-xl font-bold">Continue as</h3>
                <button onClick={() => setShowRoleSheet(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto scrollbar-hide">
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-muted-foreground/60" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-border/80 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium shadow-sm"
                  />
                </div>

                {!searchQuery && recentRoles.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-foreground mb-3 tracking-wide">Recently Used</h4>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                      {recentRoles.map(role => (
                        <button
                          key={`recent-${role.email}`}
                          onClick={() => handleRoleSelect(role)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/60 hover:bg-secondary/30 transition-colors shrink-0 bg-[#F9F8F6]"
                        >
                          <div className={cn("w-6 h-6 rounded flex items-center justify-center bg-white border border-border/50", role.color)}>
                            <role.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-semibold whitespace-nowrap">{role.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-xs font-bold text-foreground mb-3 tracking-wide">All Roles</h4>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                          activeCategory === cat ? "bg-[#FDF2F0] text-primary border border-primary/20" : "bg-white border border-border text-muted-foreground hover:bg-secondary/50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pb-4">
                  {filteredRoles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No roles found</div>
                  ) : (
                    filteredRoles.map(role => {
                      const isSelected = selectedRole?.email === role.email;
                      return (
                        <button
                          key={role.email}
                          onClick={() => handleRoleSelect(role)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl transition-all border",
                            isSelected ? "border-[#88AC88] bg-[#88AC88]/5" : "border-transparent hover:bg-secondary/40"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", role.bg, role.color)}>
                              <role.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-foreground">{role.role}</p>
                              <p className="text-xs font-medium text-muted-foreground">{role.subtitle}</p>
                            </div>
                          </div>
                          {isSelected ? (
                            <Check className="w-5 h-5 text-[#88AC88]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
