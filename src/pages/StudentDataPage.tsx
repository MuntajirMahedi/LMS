import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ChevronRight,
  ArrowLeft,
  Upload,
  GraduationCap,
  Briefcase,
  History,
  FileText,
  ShieldCheck,
  Phone,
  Mail,
  Download,
  UserPlus,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';

// Mock Data finding helper
const mockStudents = [
  { id: '2024001', name: 'Alexander Knight', class: 'Class 10', section: 'A', roll: '10-A-01', parent: 'Thomas Knight', date: '2021-06-15', status: 'Active', academicYear: '2026-2027', department: 'General' },
  { id: '2024002', name: 'Bella Swan', class: 'Class 10', section: 'A', roll: '10-A-02', parent: 'Charlie Swan', date: '2021-06-15', status: 'Active', academicYear: '2026-2027', department: 'General' },
  { id: '2024003', name: 'Caleb Rivers', class: 'Class 9', section: 'B', roll: '09-B-05', parent: 'Ashley Rivers', date: '2022-06-10', status: 'Suspended', academicYear: '2025-2026', department: 'Science' },
  { id: '2024004', name: 'Daisy Miller', class: 'Class 8', section: 'C', roll: '08-C-12', parent: 'David Miller', date: '2023-06-20', status: 'Active', academicYear: '2024-2025', department: 'General' },
  { id: '2024005', name: 'Ethan Hunt', class: 'Class 10', section: 'B', roll: '10-B-08', parent: 'Rebecca Hunt', date: '2021-06-15', status: 'Active', academicYear: '2026-2027', department: 'Commerce' },
];

const StudentDataPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');

  // Find student from mock data or use default for demo
  const student = mockStudents.find(s => s.id === id) || mockStudents[0];

  // Edit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
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

  const handleEditProfile = () => {
    setEditForm({
      name: student.name,
      guardians: [
        { name: student.parent || '', relation: 'Father', phone: '+1 555-0101', email: 't.knight@gmail.com', job: 'Senior Architect', isPrimary: true },
        { name: 'Rebecca Knight', relation: 'Mother', phone: '+1 555-0102', email: 'r.knight@gmail.com', job: 'Internal Medicine MD', isPrimary: false }
      ],
      grade: student.class,
      phone: '+1 555-0123',
      email: 'knight.a@school.edu',
      dob: '2008-05-12',
      gender: 'Male',
      bloodGroup: 'O+',
      nationality: 'United States',
      religion: 'Christianity',
      languages: 'English, Spanish',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save logic
    alert("Profile updated successfully!");
    setShowEditModal(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* 1. COMPACT HEADER / BREADCRUMBS */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <Button onClick={() => navigate('/students')} variant="ghost" className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm border border-black/5 text-[#3A2C2B] p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/students')}>Student Management</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-[#3A2C2B]">Student Data Profile</span>
          </div>
        </div>
      </div>

      {/* 2. PROFILE HERO SECTION (REDESIGNED) */}
      <div className="relative rounded-[32px] md:rounded-[48px] bg-white p-6 md:p-10 shadow-2xl shadow-black/5 border border-black/5 overflow-hidden">
        {/* Abstract Banner */}
        <div className="absolute top-0 left-0 right-0 h-40 md:h-48 bg-gradient-to-r from-primary/10 via-[#8EBADB]/20 to-primary/5 border-b border-black/5" />
        
        <div className="relative pt-20 md:pt-24 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end text-center md:text-left">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-[#8EBADB] flex items-center justify-center text-white font-black text-4xl md:text-5xl shadow-xl border-4 md:border-8 border-white relative overflow-hidden transition-transform duration-500 hover:scale-105">
              {student.name.split(' ').map((n: string) => n[0]).join('')}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                <Upload className="w-8 h-8 text-white mb-1" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-5 pb-2 w-full">
            <div className="space-y-3 md:space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{student.name}</h2>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-lg text-xs uppercase tracking-widest font-black">Active Student</Badge>
              </div>
              <div className="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-muted-foreground">
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold bg-secondary/50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-foreground">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>{student.class} • Section {student.section}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold bg-secondary/50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-foreground">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>Roll No: {student.roll}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <Button 
                onClick={handleEditProfile}
                className="w-full md:w-auto h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full md:w-auto h-11 rounded-xl font-bold px-8 border-border hover:bg-secondary">
                View ID Card
              </Button>
            </div>
          </div>
        </div>
      </div>

        {/* Modern Pill Navigation Tabs */}
        <div className="flex gap-2 mt-8 md:mt-10 overflow-x-auto no-scrollbar p-1.5 bg-secondary/50 rounded-2xl w-fit mx-auto md:mx-0 border border-border/50">
          {[
            { id: 'personal', label: 'Personal Details', icon: Users },
            { id: 'academic', label: 'Academic History', icon: History },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'guardians', label: 'Guardians', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all relative whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground/70")} />
              {tab.label}
            </button>
          ))}
        </div>

      {/* 3. TAB CONTENT AREA (NOW INTEGRATED) */}
      <div className="pt-4">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-[32px] p-6 md:p-8 border border-black/5 shadow-sm">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-border/50">
                  <h4 className="text-lg font-black text-foreground">Basic Information</h4>
                  <Button onClick={handleEditProfile} variant="ghost" size="sm" className="text-primary font-bold">Edit Details</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {[
                    { label: 'Full Name', value: student.name },
                    { label: 'Date of Birth', value: '12 May 2008' },
                    { label: 'Gender', value: 'Male' },
                    { label: 'Blood Group', value: 'O+' },
                    { label: 'Nationality', value: 'United States' },
                    { label: 'Religion', value: 'Christianity' },
                    { label: 'Language', value: 'English, Spanish' },
                    { label: 'Address', value: '123 Academic Way, Education City, CA 90210' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[32px] p-6 md:p-8 border border-black/5 shadow-sm">
                <h4 className="text-lg font-black text-foreground pb-6 mb-6 border-b border-border/50">Quick Contacts</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Emergency</p>
                      <p className="text-sm font-semibold text-foreground">+1 555-0123</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold text-foreground">knight.a@school.edu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <h4 className="text-[14px] font-black uppercase tracking-widest text-[#3A2C2B] pb-4 border-b border-black/5">Semester Performance</h4>
              
              <div className={cn(
                "rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden w-full",
                [
                  { subject: 'Mathematics', grade: 'A', marks: '94/100', remarks: 'Excellent' },
                  { subject: 'Physics', grade: 'A-', marks: '88/100', remarks: 'Strong Performance' },
                  { subject: 'World History', grade: 'B+', marks: '82/100', remarks: 'Improved' },
                  { subject: 'English Lit', grade: 'A', marks: '96/100', remarks: 'Outstanding' },
                ].length === 0 ? "h-[320px]" : "h-auto"
              )}>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="min-w-[700px] flex flex-col">
                    {/* Fixed Header */}
                    <div className="bg-[#3A2C2B] shrink-0">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-white">
                            <th className="w-[35%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/70">Subject</th>
                            <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/70">Grade</th>
                            <th className="w-[25%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/70">Marks</th>
                            <th className="w-[25%] px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-white/70">Remarks</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable Body - SCROLLBAR STARTS HERE */}
                    <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '200px' }}>
                      <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-[#3A2C2B]/5">
                          {[
                            { subject: 'Mathematics', grade: 'A', marks: '94/100', remarks: 'Excellent' },
                            { subject: 'Physics', grade: 'A-', marks: '88/100', remarks: 'Strong Performance' },
                            { subject: 'World History', grade: 'B+', marks: '82/100', remarks: 'Improved' },
                            { subject: 'English Lit', grade: 'A', marks: '96/100', remarks: 'Outstanding' },
                          ].length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-20 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                                    <GraduationCap className="w-8 h-8 opacity-20" />
                                  </div>
                                  <p className="text-sm font-black text-[#3A2C2B]">No Performance Data Available</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            [
                              { subject: 'Mathematics', grade: 'A', marks: '94/100', remarks: 'Excellent' },
                              { subject: 'Physics', grade: 'A-', marks: '88/100', remarks: 'Strong Performance' },
                              { subject: 'World History', grade: 'B+', marks: '82/100', remarks: 'Improved' },
                              { subject: 'English Lit', grade: 'A', marks: '96/100', remarks: 'Outstanding' },
                            ].map((row, i) => (
                              <tr key={i} className="hover:bg-white transition-colors group">
                                <td className="w-[35%] px-8 py-5 text-sm font-black text-[#3A2C2B]">{row.subject}</td>
                                <td className="w-[15%] px-8 py-5">
                                  <Badge className="bg-emerald-100 text-emerald-700 font-black rounded-lg px-3 py-1 border-none shadow-sm text-[10px] uppercase">
                                    {row.grade}
                                  </Badge>
                                </td>
                                <td className="w-[25%] px-8 py-5 text-sm font-bold text-muted-foreground">{row.marks}</td>
                                <td className="w-[25%] px-8 py-5 text-right text-xs font-medium italic text-muted-foreground">{row.remarks}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Standard Pagination Footer */}
                <div className="px-8 py-4 border-t border-[#3A2C2B]/10 flex items-center justify-between bg-white/50 shrink-0">
                  <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                    Showing <span className="text-[#3A2C2B] font-black">4</span> entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5">
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </Button>
                    <Button variant="default" size="sm" className="h-8 w-8 p-0 rounded-lg text-[10px] font-black bg-[#3A2C2B] text-white">1</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {[
              { title: 'Birth Certificate', size: '1.2 MB', date: '15 June 2021', type: 'PDF' },
              { title: 'Previous Marksheet', size: '2.4 MB', date: '15 June 2021', type: 'PDF' },
              { title: 'Transfer Certificate', size: '0.8 MB', date: '20 June 2021', type: 'DOC' },
              { title: 'Medical Fitness', size: '1.5 MB', date: '10 May 2024', type: 'JPG' },
            ].map((doc, i) => (
              <div key={i} className="p-6 rounded-[32px] bg-white border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all group relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-foreground">{doc.title}</h5>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span>{doc.size}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{doc.date}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                   <Badge variant="outline" className="rounded-full font-bold text-[10px] uppercase bg-secondary/50 border-none px-3 py-1">{doc.type}</Badge>
                   <Button variant="ghost" size="sm" className="text-[11px] font-bold text-primary hover:bg-primary/5 rounded-full">View Details</Button>
                </div>
              </div>
            ))}
            <button className="h-full min-h-[200px] rounded-[32px] border-2 border-dashed border-border bg-secondary/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-muted-foreground group-hover:text-primary">Upload Document</span>
            </button>
          </div>
        )}

        {activeTab === 'guardians' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {[
              { name: 'Thomas Knight', rel: 'Father', phone: '+1 555-0101', email: 't.knight@gmail.com', job: 'Senior Architect', primary: true },
              { name: 'Rebecca Knight', rel: 'Mother', phone: '+1 555-0102', email: 'r.knight@gmail.com', job: 'Internal Medicine MD', primary: false },
            ].map((parent, i) => (
              <div key={i} className={cn("rounded-[32px] p-6 md:p-8 transition-all border border-black/5 relative overflow-hidden", parent.primary ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" : "bg-white text-foreground shadow-sm")}>
                {parent.primary && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />}
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-inner", parent.primary ? "bg-white/20" : "bg-secondary")}>
                    {parent.name[0]}
                  </div>
                  {parent.primary && <Badge className="bg-white/20 text-white border-none rounded-full font-bold text-[10px] uppercase px-3 py-1 backdrop-blur-sm shadow-sm">Primary Guardian</Badge>}
                </div>
                <div className="space-y-6 relative z-10">
                   <div className="space-y-1">
                      <h5 className="text-xl font-black">{parent.name}</h5>
                      <p className={cn("text-xs font-semibold uppercase tracking-wider", parent.primary ? "text-primary-foreground/70" : "text-muted-foreground")}>{parent.rel} • {parent.job}</p>
                   </div>
                   <div className={cn("grid grid-cols-1 gap-4 pt-5 border-t", parent.primary ? "border-primary-foreground/20" : "border-border/50")}>
                      <div className="flex items-center gap-3">
                        <Phone className={cn("w-4 h-4", parent.primary ? "text-primary-foreground/50" : "text-muted-foreground/50")} />
                        <span className="text-sm font-semibold">{parent.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className={cn("w-4 h-4", parent.primary ? "text-primary-foreground/50" : "text-muted-foreground/50")} />
                        <span className="text-sm font-semibold">{parent.email}</span>
                      </div>
                   </div>
                </div>
                <div className={cn("mt-6 pt-4 border-t flex justify-end relative z-10", parent.primary ? "border-primary-foreground/20" : "border-border/50")}>
                   <Button onClick={handleEditProfile} variant="ghost" size="sm" className={cn("font-bold text-xs rounded-full", parent.primary ? "text-white hover:bg-white/20" : "text-primary hover:bg-primary/5")}>Edit Details</Button>
                </div>
              </div>
            ))}
            <button className="h-full min-h-[300px] rounded-[32px] border-2 border-dashed border-border bg-secondary/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-muted-foreground group-hover:text-primary">Add New Guardian</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Student Profile"
        description="Update the information below"
      >
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Student Full Name</label>
              <Input 
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                placeholder="e.g. John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Class / Grade</label>
              <Input 
                value={editForm.grade}
                onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                placeholder="e.g. Class 11"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Date of Birth</label>
              <Input 
                type="date"
                value={editForm.dob}
                onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Gender</label>
              <select 
                value={editForm.gender}
                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                className="w-full rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold px-4 appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Blood Group</label>
              <Input 
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                placeholder="e.g. O+"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Nationality</label>
              <Input 
                value={editForm.nationality}
                onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                placeholder="e.g. United States"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Religion</label>
              <Input 
                value={editForm.religion}
                onChange={(e) => setEditForm({...editForm, religion: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                placeholder="e.g. Christianity"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Languages</label>
              <Input 
                value={editForm.languages}
                onChange={(e) => setEditForm({...editForm, languages: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                placeholder="e.g. English, Spanish"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Contact Phone</label>
              <Input 
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="rounded-2xl h-12 bg-[#3A2C2B]/5 border-none font-bold" 
                placeholder="+1..."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60 text-[#3A2C2B]">Email Address</label>
              <Input 
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
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
                onClick={() => setEditForm({...editForm, guardians: [...editForm.guardians, { name: '', relation: 'Mother', phone: '', email: '', job: '', isPrimary: false }]})} 
                variant="ghost" 
                size="sm" 
                className="text-primary font-black text-[9px] uppercase hover:bg-primary/5"
              >
                <Plus className="w-3 h-3 mr-1" /> Add More Guardian
              </Button>
            </div>
            <div className="space-y-6">
              {editForm.guardians.map((guardian, index) => (
                <div key={index} className="p-6 rounded-[24px] bg-gray-50/50 border border-black/5 space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase opacity-40 text-[#3A2C2B]">Guardian Name</label>
                      <Input 
                        value={guardian.name}
                        onChange={(e) => {
                          const newGuardians = [...editForm.guardians];
                          newGuardians[index].name = e.target.value;
                          setEditForm({...editForm, guardians: newGuardians});
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
                          const newGuardians = [...editForm.guardians];
                          newGuardians[index].relation = e.target.value;
                          setEditForm({...editForm, guardians: newGuardians});
                        }}
                        className="rounded-xl h-10 bg-white border-none text-xs font-bold" 
                        placeholder="e.g. Father, Mother"
                        required
                      />
                    </div>
                  </div>
                  {editForm.guardians.length > 1 && (
                    <Button 
                      type="button"
                      onClick={() => {
                        const newGuardians = editForm.guardians.filter((_, i) => i !== index);
                        setEditForm({...editForm, guardians: newGuardians});
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

          <Button 
            type="submit"
            className="w-full h-16 rounded-[24px] bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90 font-black uppercase tracking-widest text-sm shadow-xl"
          >
            SAVE CHANGES
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDataPage;
