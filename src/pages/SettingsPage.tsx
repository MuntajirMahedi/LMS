import React, { useState } from 'react';
import { 
  Building2, 
  Settings as SettingsIcon, 
  CalendarDays, 
  BellRing, 
  Save, 
  ShieldAlert,
  UploadCloud,
  Globe,
  Clock,
  Palette
} from 'lucide-react';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { hasAnyPermission } from '../config/permissions';

const SETTINGS_TABS = [
  { id: 'general', label: 'General & Branding', icon: Building2 },
  { id: 'academic', label: 'Academic & Sessions', icon: CalendarDays },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
];

const SettingsPage: React.FC = () => {
  const { activeRole, permissions, checkPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // Check if user has Settings module access
  if (!activeRole || (!checkPermission('SETTINGS', 'view') && !hasAnyPermission(activeRole, 'SETTINGS', permissions))) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/50 backdrop-blur-sm rounded-3xl m-6 border border-border">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-muted-foreground font-medium">You do not have permission to view global school settings.</p>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const GeneralSettingsTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-primary" /> School Details
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Core Information</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">School Name</label>
              <input type="text" defaultValue="EduSync International School" className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration Number</label>
              <input type="text" defaultValue="REG-2024-9981" className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Email</label>
              <input type="email" defaultValue="admin@edusync.edu" className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Phone</label>
              <input type="text" defaultValue="+1 (555) 123-4567" className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Address</label>
              <textarea defaultValue="123 Education Boulevard, Knowledge City, NY 10001" className="w-full h-24 p-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Branding & Logo */}
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-black tracking-tight w-full text-left flex items-center gap-2 mb-1">
              <Palette className="w-5 h-5 text-primary" /> Branding
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest w-full text-left mb-6">Visual Identity</p>
            
            <div className="w-32 h-32 rounded-3xl bg-secondary/80 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 mb-4 cursor-pointer hover:bg-primary/5 hover:border-primary transition-all group">
              <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">Upload Logo</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Recommended size: 512x512px (PNG/SVG)</p>

            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Primary Color</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">#D25B45</span>
                  <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AcademicSettingsTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8">
        
        <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-4 mb-8 flex gap-4 items-start">
          <ShieldAlert className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-black text-brand-orange mb-1">Session Protection Active</h4>
            <p className="text-xs font-medium text-brand-orange/80 leading-relaxed">
              The current academic session is ongoing. Changing core grading rules or term dates mid-session is restricted to prevent data corruption. To make changes, you must explicitly unlock these settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-primary" /> Active Academic Year
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Yearly Cycle</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Academic Year</label>
                <select className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="2025-2026">2025 - 2026</option>
                  <option value="2026-2027" selected>2026 - 2027</option>
                  <option value="2027-2028">2027 - 2028 (Upcoming)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date</label>
                  <input type="date" defaultValue="2026-04-01" disabled className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Date</label>
                  <input type="date" defaultValue="2027-03-31" disabled className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Semesters</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-border/50 shadow-sm">
                    <span className="text-sm font-bold text-foreground">Fall Semester</span>
                    <span className="text-xs font-black text-muted-foreground">04/01/2026 - 09/30/2026</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-border/50 shadow-sm">
                    <span className="text-sm font-bold text-foreground">Spring Semester</span>
                    <span className="text-xs font-black text-muted-foreground">10/01/2026 - 03/31/2027</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2 mb-1">
                <CalendarDays className="w-5 h-5 text-primary" /> Grading & Rules
              </h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Academic Policies</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grading System</label>
                <select disabled className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed">
                  <option value="gpa" selected>GPA (4.0 Scale)</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="cgp">CGPA (10.0 Scale)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Half-Day Attendance Rule</label>
                <select disabled className="w-full h-12 px-4 bg-secondary/50 border border-border/50 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed">
                  <option value="4hrs">Minimum 4 Hours</option>
                  <option value="3periods" selected>Minimum 3 Periods</option>
                  <option value="none">No Half-Days Allowed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const NotificationsTab = () => {
    const channels = [
      { id: 'email', name: 'Email Notifications', desc: 'Send official documents and long-form alerts', status: true },
      { id: 'sms', name: 'SMS Alerts', desc: 'Urgent notices, attendance, and fee reminders', status: true },
      { id: 'push', name: 'Push Notifications', desc: 'In-app and mobile app alerts', status: true },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-8">
          <div className="mb-8">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2 mb-1">
              <BellRing className="w-5 h-5 text-primary" /> Communication Channels
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Preferences</p>
          </div>

          <div className="space-y-4">
            {channels.map((ch) => (
              <div key={ch.id} className="p-5 rounded-[24px] border border-border/50 flex items-center justify-between bg-secondary/30">
                <div>
                  <h4 className="text-sm font-black mb-1 text-foreground">{ch.name}</h4>
                  <p className="text-xs font-medium text-muted-foreground/80">{ch.desc}</p>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${ch.status ? 'bg-brand-green' : 'bg-border'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${ch.status ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FCF9F6] space-y-6 sm:space-y-10 pb-20">
      
      {/* Header Banner */}
      <div className="bg-white rounded-[40px] m-4 sm:m-6 lg:m-8 p-6 sm:p-10 relative overflow-hidden shadow-sm border border-border/50 min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[20px] bg-primary/10 flex items-center justify-center shrink-0">
              <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#3A2C2B] tracking-tight mb-1 sm:mb-2">
                System Settings
              </h1>
              <p className="text-sm sm:text-base font-bold text-muted-foreground">
                Manage global school configurations and preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Graphic for Desktop */}
        <div className="absolute right-8 bottom-0 top-0 hidden lg:flex items-center justify-end w-1/3 pointer-events-none select-none z-0">
          <SettingsIcon className="w-48 h-48 text-primary/5 -rotate-12" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full pb-4 sm:pb-0">
              <TabSwitcher 
                tabs={SETTINGS_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                color="bg-primary"
              />
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto shrink-0 h-14 sm:h-16 px-8 rounded-full bg-primary text-white font-black tracking-widest uppercase hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>

          <div className="min-h-[500px]">
            {activeTab === 'general' && <GeneralSettingsTab />}
            {activeTab === 'academic' && <AcademicSettingsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
