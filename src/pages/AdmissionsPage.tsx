import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Plus,
  ArrowRight,
  FileText,
  ShieldCheck,
  ChevronRight,
  Users
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import { getStorageData, setStorageData } from '../lib/storage';

interface Application {
  id: number;
  name: string;
  parent: string;
  class: string;
  docs: any[];
  status: string;
  date: string;
  [key: string]: any;
}

const AdmissionsPage: React.FC = () => {
  // 1. Workflow States
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  
  // Admission Form State
  const [admissionForm, setAdmissionForm] = useState({
    name: '',
    guardians: [{ name: '', relation: 'Father', phone: '', email: '', job: '', isPrimary: true }],
    grade: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    nationality: 'United States',
    religion: '',
    languages: '',
  });
  const [formDocs, setFormDocs] = useState([{ id: Date.now(), title: '', file: null as any }]);

  const [applications, setApplications] = useState<Application[]>(() => getStorageData('lms_admissions_applications', [
    { id: 101, name: "John Doe", parent: "James Doe", class: "Class 10", docs: ["Previous Marksheet", "Birth Certificate"], status: "Pending Verification", date: "2024-05-15" },
  ]));

  const [checklistQueue, setChecklistQueue] = useState(() => getStorageData('lms_admissions_checklist', [
    { id: 201, name: "Marcus Aurelius", parent: "Antoninus P.", class: "Class 9", docs: ["Birth Certificate", "Transfer Cert"], status: "In Review" },
  ]));

  const [admittedStudentsList, setAdmittedStudentsList] = useState<any[]>(() => getStorageData('lms_admissions_admitted', []));

  React.useEffect(() => { setStorageData('lms_admissions_applications', applications); }, [applications]);
  React.useEffect(() => { setStorageData('lms_admissions_checklist', checklistQueue); }, [checklistQueue]);
  React.useEffect(() => { setStorageData('lms_admissions_admitted', admittedStudentsList); }, [admittedStudentsList]);

  const funnelData = [
    { value: 1284, name: 'Applied', fill: '#8EBADB' }, // Darker Blue
    { value: 856, name: 'Applications', fill: '#D99EA5' }, // Darker Rose
    { value: 620, name: 'Verified', fill: '#94C2BA' }, // Darker Mint
    { value: 412, name: 'Approved', fill: '#C9B79C' }, // Darker Gold
  ];

  const handleAddDocField = () => {
    setFormDocs([...formDocs, { id: Date.now(), title: '', file: null }]);
  };

  const handleRemoveDocField = (id: number) => {
    setFormDocs(formDocs.filter(d => d.id !== id));
  };

  const handleSubmitAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry = {
      id: Date.now(),
      ...admissionForm,
      parent: admissionForm.guardians[0]?.name || 'N/A', // For legacy display
      class: admissionForm.grade, // Map grade to class for table display
      docs: formDocs.filter(d => d.title).map(d => ({
        title: d.title,
        size: '1.5 MB',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        type: d.title.toLowerCase().includes('pdf') ? 'PDF' : 'DOC'
      })),
      status: "Pending Verification",
      date: new Date().toISOString().split('T')[0]
    };

    setApplications([newEntry, ...applications]);
    setShowAdmissionForm(false);
    setAdmissionForm({
      name: '',
      guardians: [{ name: '', relation: 'Father', phone: '', email: '', job: '', isPrimary: true }],
      grade: '',
      phone: '',
      email: '',
      dob: '',
      gender: 'Male',
      bloodGroup: '',
      nationality: 'United States',
      religion: '',
      languages: '',
    });
    setFormDocs([{ id: Date.now(), title: '', file: null }]);
  };

  const handleVerify = (id: number) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    const newChecklist = {
      id: app.id,
      name: app.name,
      parent: app.parent,
      class: app.class,
      docs: app.docs, // Pass actual doc titles
      status: "In Review"
    };

    setChecklistQueue([newChecklist, ...checklistQueue]);
    setApplications(applications.filter(a => a.id !== id));
  };

  const handleApprove = (id: number) => {
    const student = checklistQueue.find(s => s.id === id);
    if (student) {
      const enrolledStudent = {
        ...student,
        enrollmentId: `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
        admissionDate: new Date().toISOString().split('T')[0]
      };
      setAdmittedStudentsList([enrolledStudent, ...admittedStudentsList]);
      setChecklistQueue(checklistQueue.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#3A2C2B] mb-2 uppercase">Admissions Command Center</h1>
          <p className="text-muted-foreground font-medium italic">Monitor enrollment funnel, verify documents, and manage student onboarding</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAdmissionForm(true)}
            className="h-14 rounded-2xl px-8 bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90 font-black uppercase tracking-widest text-xs shadow-xl"
          >
            <Plus className="w-5 h-5 mr-3" /> NEW ADMISSION
          </Button>
        </div>
      </div>

      {/* TOP SECTION: GLOBAL KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          { label: 'Applied Admissions', value: applications.length + 1281, icon: Search, color: 'bg-brand-blue', sub: '+12% vs last month' },
          { label: 'Total Applications', value: applications.length + 853, icon: FileText, color: 'bg-brand-orange', sub: '+8% vs last month' },
          { label: 'In Review', value: checklistQueue.length, icon: ShieldCheck, color: 'bg-brand-green', sub: 'Current workload' },
          { label: 'Rejected', value: '94', icon: XCircle, color: 'bg-oat', sub: '11% of total' },
          { label: 'Pending', value: '350', icon: Clock, color: 'bg-brand-purple', sub: 'Action required' },
        ].map((kpi, i) => (
          <StatsCard key={i} {...kpi} />
        ))}
      </div>

      <div className="space-y-8">
        {/* Admission Form Modal */}
        {showAdmissionForm && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl rounded-[40px] bg-white">
              <CardHeader className="p-6 sm:p-10 border-b border-border/50 sticky top-0 bg-white z-10 relative">
                <div className="pr-10">
                  <CardTitle className="text-xl sm:text-2xl font-black uppercase text-[#3A2C2B]">Student Admission Form</CardTitle>
                  <CardDescription className="font-medium italic text-xs sm:text-sm">Complete the details below to apply</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setShowAdmissionForm(false)} className="absolute top-6 right-6 sm:top-10 sm:right-10 rounded-full w-10 h-10 p-0 text-[#3A2C2B]">
                  <XCircle className="w-6 h-6" />
                </Button>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSubmitAdmission} className="space-y-8">
                  {/* Basic Info */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Student Full Name</label>
                      <Input 
                        value={admissionForm.name}
                        onChange={(e) => setAdmissionForm({...admissionForm, name: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="e.g. John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Class Applying For</label>
                      <Input 
                        value={admissionForm.grade}
                        onChange={(e) => setAdmissionForm({...admissionForm, grade: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="e.g. Class 11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Date of Birth</label>
                      <Input 
                        type="date"
                        value={admissionForm.dob}
                        onChange={(e) => setAdmissionForm({...admissionForm, dob: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Gender</label>
                      <select 
                        value={admissionForm.gender}
                        onChange={(e) => setAdmissionForm({...admissionForm, gender: e.target.value})}
                        className="w-full rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold px-4 appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Blood Group (Optional)</label>
                      <Input 
                        value={admissionForm.bloodGroup}
                        onChange={(e) => setAdmissionForm({...admissionForm, bloodGroup: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="e.g. O+"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Nationality</label>
                      <Input 
                        value={admissionForm.nationality}
                        onChange={(e) => setAdmissionForm({...admissionForm, nationality: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="e.g. United States"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Religion</label>
                      <Input 
                        value={admissionForm.religion}
                        onChange={(e) => setAdmissionForm({...admissionForm, religion: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="e.g. Christianity"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Languages</label>
                      <Input 
                        value={admissionForm.languages}
                        onChange={(e) => setAdmissionForm({...admissionForm, languages: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="e.g. English, Spanish"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Contact Phone</label>
                      <Input 
                        value={admissionForm.phone}
                        onChange={(e) => setAdmissionForm({...admissionForm, phone: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="+1..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Email Address</label>
                      <Input 
                        type="email"
                        value={admissionForm.email}
                        onChange={(e) => setAdmissionForm({...admissionForm, email: e.target.value})}
                        className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Guardians Section */}
                  <div className="space-y-6 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]">Guardians Information</h4>
                      <Button 
                        type="button" 
                        onClick={() => setAdmissionForm({...admissionForm, guardians: [...admissionForm.guardians, { name: '', relation: 'Mother', phone: '', email: '', job: '', isPrimary: false }]})} 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary font-black text-[9px] uppercase hover:bg-primary/5"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add More Guardian
                      </Button>
                    </div>
                    <div className="space-y-6">
                      {admissionForm.guardians.map((guardian, index) => (
                        <div key={index} className="p-6 rounded-[24px] bg-gray-50/50 border border-black/5 space-y-4 relative">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase opacity-40 text-[#3A2C2B]">Guardian Name</label>
                              <Input 
                                value={guardian.name}
                                onChange={(e) => {
                                  const newGuardians = [...admissionForm.guardians];
                                  newGuardians[index].name = e.target.value;
                                  setAdmissionForm({...admissionForm, guardians: newGuardians});
                                }}
                                className="rounded-xl h-10 bg-white border-none text-xs font-bold" 
                                placeholder="Name"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase opacity-40 text-[#3A2C2B]">Relationship</label>
                              <Input 
                                value={guardian.relation}
                                onChange={(e) => {
                                  const newGuardians = [...admissionForm.guardians];
                                  newGuardians[index].relation = e.target.value;
                                  setAdmissionForm({...admissionForm, guardians: newGuardians});
                                }}
                                className="rounded-xl h-10 bg-white border-none text-xs font-bold" 
                                placeholder="e.g. Father, Mother"
                                required
                              />
                            </div>
                          </div>
                          {admissionForm.guardians.length > 1 && (
                            <Button 
                              type="button"
                              onClick={() => {
                                const newGuardians = admissionForm.guardians.filter((_, i) => i !== index);
                                setAdmissionForm({...admissionForm, guardians: newGuardians});
                              }}
                              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white p-0 hover:bg-rose-600"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="space-y-6 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]">Upload Documents</h4>
                      <Button type="button" onClick={handleAddDocField} variant="ghost" size="sm" className="text-primary font-black text-[9px] uppercase hover:bg-primary/5">
                        <Plus className="w-3 h-3 mr-1" /> Add Another Document
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {formDocs.map((doc, index) => (
                        <div key={doc.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase opacity-40 text-[#3A2C2B]">Document Name</label>
                            <Input 
                              value={doc.title}
                              onChange={(e) => {
                                const newDocs = [...formDocs];
                                newDocs[index].title = e.target.value;
                                setFormDocs(newDocs);
                              }}
                              className="rounded-xl h-10 bg-[#3A2C2B]/5 border-none text-xs font-bold" 
                              placeholder="e.g. Marksheet, Birth Cert"
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] font-black uppercase opacity-40 text-[#3A2C2B]">Attach File</label>
                              <div className="relative">
                                <Input 
                                  type="file"
                                  className="rounded-xl h-10 bg-[#3A2C2B]/5 border-none text-[10px] pt-2"
                                  accept=".pdf,.doc,.docx,image/*"
                                />
                              </div>
                            </div>
                            {formDocs.length > 1 && (
                              <Button 
                                type="button" 
                                onClick={() => handleRemoveDocField(doc.id)}
                                variant="ghost" 
                                size="sm" 
                                className="h-10 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[9px] uppercase"
                              >
                                <XCircle className="w-4 h-4 mr-1" /> REMOVE
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-16 rounded-[24px] bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90 font-black uppercase tracking-widest text-sm shadow-xl"
                  >
                    SUBMIT APPLICATION
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>,
          document.body
        )}
      </div>

      <div className="space-y-6">
        <div className="px-4">
          <h2 className="text-2xl font-black uppercase text-[#3A2C2B]">Active Applications</h2>
          <p className="text-muted-foreground font-medium italic text-xs">Applications awaiting document verification</p>
        </div>
        
        <div className={cn(
          "rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden",
          applications.length === 0 ? "h-[400px]" : "max-h-[400px]"
        )}>
          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar flex-1 flex flex-col">
            <div className="min-w-[900px] h-full flex flex-col relative">
              <div className="bg-[#3A2C2B] shrink-0">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="text-white">
                      <th className="w-[25%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-left">Applicant</th>
                      <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-left">Class</th>
                      <th className="w-[40%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-left">Documents</th>
                      <th className="w-[20%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody className={cn("divide-y divide-border/10", applications.length === 0 && "h-full")}>
                    {applications.length === 0 ? (
                      <tr className="h-full">
                        <td colSpan={4} className="h-full text-center py-20">
                          <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                              <Search className="w-8 h-8 opacity-20" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#3A2C2B]">No Applications Found</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Active applications awaiting verification will appear here</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr key={app.id} className="hover:bg-[#3A2C2B]/2 transition-colors group">
                          <td className="w-[25%] px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-[#3A2C2B] whitespace-nowrap">{app.name}</span>
                              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap uppercase">Parent: {app.parent}</span>
                            </div>
                          </td>
                          <td className="w-[15%] px-8 py-6">
                            <Badge variant="secondary" className="rounded-lg font-black text-[10px] uppercase bg-[#3A2C2B]/5 text-primary border-none whitespace-nowrap">{app.class}</Badge>
                          </td>
                          <td className="w-[40%] px-8 py-6">
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(app.docs) ? app.docs.map((doc: any, i: number) => (
                                <Badge 
                                  key={i} 
                                  onClick={() => alert(`Opening ${doc.title || doc} for ${app.name}`)}
                                  variant="outline" 
                                  className="bg-primary/5 text-primary border-primary/10 rounded-lg font-black text-[9px] uppercase px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors whitespace-nowrap"
                                >
                                  {doc.title || doc}
                                </Badge>
                              )) : (
                                <span className="text-[10px] font-bold text-muted-foreground italic">No docs</span>
                              )}
                            </div>
                          </td>
                          <td className="w-[20%] px-8 py-6 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleVerify(app.id)}
                              className="rounded-xl font-black text-[10px] uppercase text-primary hover:bg-[#3A2C2B]/5 whitespace-nowrap"
                            >
                              VERIFY DOCUMENTS <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
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
      </div>

      <div className="space-y-6">
        <div className="px-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase text-[#3A2C2B]">Document Checklist</h2>
            <p className="text-muted-foreground font-medium italic text-xs">Verified applications ready for final decision</p>
          </div>
          <Badge className="rounded-xl font-black text-[10px] uppercase bg-rose-50 text-rose-600 border border-rose-100 px-4 h-8 flex items-center">{checklistQueue.length} Ready</Badge>
        </div>

        <div className={cn(
          "rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden",
          checklistQueue.length === 0 ? "h-[350px]" : "max-h-[350px]"
        )}>
          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar flex-1 flex flex-col">
            <div className="min-w-[800px] h-full flex flex-col relative">
              <div className="bg-[#3A2C2B] shrink-0">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="text-white">
                      <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-left">Applicant</th>
                      <th className="w-[50%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-left">Documents</th>
                      <th className="w-[20%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody className={cn("divide-y divide-border/10", checklistQueue.length === 0 && "h-full")}>
                    {checklistQueue.length === 0 ? (
                      <tr className="h-full">
                        <td colSpan={3} className="h-full text-center py-20">
                          <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                              <ShieldCheck className="w-8 h-8 opacity-20" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#3A2C2B]">Queue Is Empty</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verified applications will appear here for final approval</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      checklistQueue.map((item) => (
                        <tr key={item.id} className="hover:bg-[#3A2C2B]/2 transition-colors">
                          <td className="w-[30%] px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-[#3A2C2B]">{item.name}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.parent}</span>
                            </div>
                          </td>
                          <td className="w-[50%] px-8 py-6">
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(item.docs) ? item.docs.map((doc: any, i: number) => (
                                <Badge 
                                  key={i} 
                                  onClick={() => alert(`Opening ${doc.title || doc} for ${item.name}`)}
                                  variant="outline" 
                                  className="bg-emerald-50/50 text-emerald-700 border-emerald-100 rounded-lg font-black text-[9px] uppercase px-3 py-1 cursor-pointer hover:bg-emerald-100 transition-colors"
                                >
                                  {doc.title || doc}
                                </Badge>
                              )) : (
                                <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg font-black text-[9px] uppercase px-3 py-1">
                                  Legacy Data
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="w-[20%] px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="rounded-xl font-black text-[10px] uppercase text-rose-600 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(item.id)}
                                className="rounded-xl bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90 font-black text-[10px] uppercase h-10 px-6 shadow-lg shadow-black/10"
                              >
                                Approve
                              </Button>
                            </div>
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
      </div>

      {/* SECTION 5: ANALYTICS & ADMITTED STUDENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Funnel - Left Column */}
        <div className="lg:col-span-5 min-h-[400px]">
          <div className="border border-border/10 shadow-sm rounded-[20px] overflow-hidden bg-white p-4 sm:p-6 h-full flex flex-col">
            <div className="px-2 pb-4 sm:pb-6">
              <h3 className="text-lg sm:text-xl font-black uppercase text-[#3A2C2B]">Admission Funnel</h3>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Real-time Conversion Velocity</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ right: 60, left: 0, top: 10, bottom: 10 }}>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                  />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#3A2C2B" stroke="none" dataKey="name" style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Admitted Students Table - Right Column */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-xl font-black uppercase text-[#3A2C2B]">Recently Admitted Students</h3>
            <p className="text-muted-foreground font-medium italic text-xs">Confirmed enrollments for the upcoming term</p>
          </div>
          
          <div className={cn(
            "rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden",
            admittedStudentsList.length === 0 ? "h-[400px]" : "max-h-[400px]"
          )}>
            <div className="overflow-x-auto overflow-y-hidden custom-scrollbar flex-1 flex flex-col">
              <div className="min-w-[500px] h-full flex flex-col relative">
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white">
                        <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase text-white/70">Enrollment ID</th>
                        <th className="w-[40%] px-8 py-4 text-[10px] font-black uppercase text-white/70">Student</th>
                        <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase text-white/70">Admission Date</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left table-fixed">
                    <tbody className={cn("divide-y divide-border/10", admittedStudentsList.length === 0 && "h-full")}>
                      {admittedStudentsList.length === 0 ? (
                        <tr className="h-full">
                          <td colSpan={3} className="h-full text-center py-20">
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                                <Users className="w-8 h-8 opacity-20" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#3A2C2B]">No Students Admitted</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Confirmed enrollments will appear here</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        admittedStudentsList.map((student, i) => (
                          <tr key={i} className="hover:bg-[#3A2C2B]/2 transition-colors">
                            <td className="w-[30%] px-8 py-5">
                              <Badge variant="secondary" className="text-[10px] font-black uppercase bg-[#3A2C2B]/5 text-primary border-none">
                                {student.enrollmentId || student.id}
                              </Badge>
                            </td>
                            <td className="w-[40%] px-8 py-5 text-sm font-black text-[#3A2C2B]">{student.name}</td>
                            <td className="w-[30%] px-8 py-5 text-sm font-bold text-muted-foreground italic">{student.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: RECENT ACTIVITY / AUDIT */}
      <div className="border border-border/10 shadow-sm rounded-[20px] overflow-hidden bg-white">
        <div className="p-6 sm:p-8 pb-0 sm:pb-0 border-b border-border/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-[#3A2C2B]">Recent Activity</h3>
            <p className="text-muted-foreground font-medium italic text-[10px] sm:text-xs">Admissions workflow audit trail</p>
          </div>
          <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase border-[#3A2C2B]/10 hover:bg-[#3A2C2B]/5 w-fit">VIEW ALL LOGS</Button>
        </div>
        <div className="p-6 sm:p-8 pt-0 sm:pt-0">
          <div className="space-y-6 sm:space-y-8 relative">
            <div className="absolute left-[19px] sm:left-[23px] top-2 bottom-2 w-0.5 bg-[#3A2C2B]/10" />
            
            {[
              { time: "10:24 AM", user: "Admin", action: "Approved Admission", student: "Sophia Loren", icon: <CheckCircle2 className="w-4 h-4 text-emerald-950" />, color: "bg-[#94C2BA]" },
              { time: "09:45 AM", user: "Warden", action: "Verified Documents", student: "Marcus Aurelius", icon: <ShieldCheck className="w-4 h-4 text-blue-950" />, color: "bg-[#8EBADB]" },
              { time: "Yesterday", user: "System", action: "New Inquiry Received", student: "Sarah Miller", icon: <Search className="w-4 h-4 text-amber-950" />, color: "bg-[#C9B79C]" },
              { time: "Yesterday", user: "Admin", action: "Rejected Application", student: "Liam O'Brien", icon: <XCircle className="w-4 h-4 text-rose-950" />, color: "bg-[#D99EA5]" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-6 relative group">
                <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 relative z-10 transition-transform group-hover:scale-110", activity.color)}>
                  {React.cloneElement(activity.icon as React.ReactElement<any>, { className: "w-3.5 h-3.5 sm:w-4 h-4" })}
                </div>
                <div className="flex flex-col gap-0.5 sm:gap-1 pt-0.5 sm:pt-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-black text-[#3A2C2B] uppercase tracking-tight">{activity.action}</span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[#3A2C2B]/70 line-clamp-2">
                    <span className="font-black text-[#3A2C2B]">{activity.student}</span>'s application was processed by <span className="font-black text-[#3A2C2B]">{activity.user}</span>.
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="ml-2 sm:ml-auto rounded-xl hover:bg-[#3A2C2B]/5 shrink-0">
                  <ChevronRight className="w-4 h-4 sm:w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdmissionsPage;
