import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { getStorageData, setStorageData } from '@/lib/storage';

const INITIAL_ENROLLMENT_STUDENTS = [
  { id: 'ADM-101', name: 'Alexander Knight', appliedClass: 'Class 10', appliedDept: 'General', assignedSection: '-', assignedDept: 'General', roll: '-' },
  { id: 'ADM-102', name: 'Bella Swan', appliedClass: 'Class 10', appliedDept: 'General', assignedSection: '-', assignedDept: 'General', roll: '-' },
  { id: 'ADM-103', name: 'Caleb Rivers', appliedClass: 'Class 11', appliedDept: 'Science', assignedSection: '-', assignedDept: 'Science', roll: '-' },
  { id: 'ADM-104', name: 'Daisy Miller', appliedClass: 'Class 11', appliedDept: 'Commerce', assignedSection: '-', assignedDept: 'Commerce', roll: '-' },
  { id: 'ADM-105', name: 'Ethan Hunt', appliedClass: 'Class 10', appliedDept: 'General', assignedSection: '-', assignedDept: 'General', roll: '-' },
];

const EnrollmentPage = () => {
  const navigate = useNavigate();

  // State for Filters
  const [classFilter, setClassFilter] = useState('Class 10');
  const [deptFilter, setDeptFilter] = useState('All');

  // State for Global Actions
  const [targetSection, setTargetSection] = useState('A');
  const [targetDept, setTargetDept] = useState('General');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [showSuccess, setShowSuccess] = useState(false);

  const academicYearOptions = [
    { label: '2026-2027 (Active)', value: '2026-2027' },
    { label: '2025-2026', value: '2025-2026' },
    { label: '2024-2025', value: '2024-2025' },
  ];

  // 1. FINALIZATION LOGIC
  const handleFinalize = () => {
    // Get all students who have been assigned
    const assignedStudents = students.filter(s => s.assignedSection !== '-' && s.assignedDept !== '-');
    
    if (assignedStudents.length === 0) {
      alert("Please assign sections and departments to at least one student before finalizing.");
      return;
    }

    // Prepare data for Student Directory (Mapping Enrollment schema to Directory schema)
    const finalizedData = assignedStudents.map(s => ({
      id: s.id.replace('ADM', '2024'), // Simulate conversion to a real Student ID
      name: s.name,
      class: s.appliedClass,
      section: s.assignedSection,
      department: s.assignedDept,
      roll: s.roll || `${s.appliedClass.split(' ')[1]}-${s.assignedSection}-NEW`, 
      parent: 'Thomas Knight', // Mock parent
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
      academicYear: academicYear // New field
    }));

    // Save to localStorage to simulate shared database
    const existingFinalized = getStorageData('lms_finalized_students', []);
    setStorageData('lms_finalized_students', [...existingFinalized, ...finalizedData]);

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/students');
    }, 2000);
  };

  // Selection & Data
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [students, setStudents] = useState(() => getStorageData('lms_enrollment_students', INITIAL_ENROLLMENT_STUDENTS));

  useEffect(() => {
    setStorageData('lms_enrollment_students', students);
  }, [students]);

  const filteredStudents = students.filter(s =>
    s.appliedClass === classFilter &&
    (deptFilter === 'All' || s.appliedDept === deptFilter)
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const bulkAssign = () => {
    setStudents(prev => {
      // Helper for dept codes
      const getDeptCode = (dept: string) => {
        if (dept === 'Science') return 'SCI';
        if (dept === 'Commerce') return 'COM';
        if (dept === 'Arts') return 'ART';
        return '';
      };

      const currentNextNums: Record<string, number> = {};

      return prev.map(s => {
        if (selectedIds.includes(s.id)) {
          const classNum = s.appliedClass.split(' ')[1];
          const deptCode = getDeptCode(targetDept);
          const baseKey = `${classNum}-${targetSection}${deptCode ? '-' + deptCode : ''}`;
          
          if (currentNextNums[baseKey] === undefined) {
            let max = 0;
            prev.forEach(other => {
              if (
                other.assignedSection === targetSection &&
                other.assignedDept === targetDept &&
                other.appliedClass === s.appliedClass &&
                other.roll && other.roll !== '-'
              ) {
                const parts = other.roll.split('-');
                const num = parseInt(parts[parts.length - 1]);
                if (!isNaN(num) && num > max) max = num;
              }
            });
            currentNextNums[baseKey] = max + 1;
          } else {
            currentNextNums[baseKey]++;
          }

          const rollNum = String(currentNextNums[baseKey]).padStart(2, '0');
          const deptPart = deptCode ? `-${deptCode}` : '';
          const finalRoll = `${classNum}-${targetSection}${deptPart}-${rollNum}`;

          return { ...s, assignedSection: targetSection, assignedDept: targetDept, roll: finalRoll };
        }
        return s;
      });
    });
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      {/* 1. COMPACT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[20px] border border-border/10 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button onClick={() => navigate(-1)} variant="ghost" className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#3A2C2B] p-0 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black uppercase text-[#3A2C2B] leading-tight truncate">Enrollment Center</h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Section Distribution Pipeline</p>
          </div>
        </div>

        <div className="flex items-end gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[8px] font-black uppercase text-muted-foreground ml-1">Admission Year</span>
            <Select
              options={academicYearOptions}
              value={academicYear}
              onChange={setAcademicYear}
              className="h-10 w-full md:w-40 text-[9px] bg-[#3A2C2B]/5 border-none rounded-xl font-black shadow-inner"
            />
          </div>
          <div className="hidden md:block h-8 w-px bg-[#3A2C2B]/10 mx-2 mb-1" />
          <Button 
            onClick={handleFinalize}
            className="h-10 sm:h-10 px-4 sm:px-6 rounded-xl bg-[#3A2C2B] text-white font-black uppercase text-[9px] sm:text-[10px] shadow-lg shadow-black/10 hover:scale-105 transition-all flex-1 md:flex-none"
          >
            {showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Enrollment Finalized!
              </>
            ) : (
              'Finalize Enrollment'
            )}
          </Button>
        </div>
      </div>

      {/* 2. COMPACT HORIZONTAL FILTERS */}
      <div className="bg-white p-4 sm:p-6 rounded-[20px] border border-border/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8">
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto overflow-hidden">
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-primary tracking-widest shrink-0">Pipeline</p>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {['Class 10', 'Class 11', 'Class 12'].map((cls) => (
              <button
                key={cls}
                onClick={() => { setClassFilter(cls); setSelectedIds([]); }}
                className={cn(
                  "py-2 px-4 sm:px-6 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all border-2 whitespace-nowrap",
                  classFilter === cls
                    ? "bg-[#3A2C2B] text-white border-[#3A2C2B] shadow-md"
                    : "bg-gray-50 border-transparent text-muted-foreground hover:bg-white hover:border-[#3A2C2B]/20"
                )}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {(classFilter.includes('11') || classFilter.includes('12')) && (
          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-border/10 pt-4 md:pt-0 md:pl-8 overflow-hidden animate-in fade-in slide-in-from-left-4">
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest shrink-0">Department</p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {['Science', 'Commerce', 'Arts', 'All'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => { setDeptFilter(dept); setSelectedIds([]); }}
                  className={cn(
                    "py-2 px-4 rounded-xl text-[8px] sm:text-[9px] font-black uppercase border-2 transition-all whitespace-nowrap",
                    deptFilter === dept
                      ? "bg-amber-500 text-white border-amber-500 shadow-md"
                      : "bg-white border-black/5 text-muted-foreground hover:border-amber-500/20"
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN CONTENT (Table & Bulk Actions) */}
      <div className="flex flex-col gap-8">
          {/* BULK ACTION BAR - Visible when students are selected */}
          <div className={cn(
            "p-6 sm:p-8 bg-white rounded-[20px] border-2 transition-all flex flex-col lg:flex-row gap-6 sm:gap-8 shadow-sm relative overflow-visible",
            selectedIds.length > 0 ? "border-[#3A2C2B] bg-[#3A2C2B]/[0.02]" : "border-border/10"
          )}>
            <div className="flex items-start gap-4 sm:gap-5 shrink-0">
              <div className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-500 shadow-md",
                selectedIds.length > 0 
                  ? "bg-[#3A2C2B] text-white scale-105 sm:scale-110" 
                  : "bg-gray-100 text-[#3A2C2B]/20"
              )}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="pt-0.5 sm:pt-1">
                <p className="text-xs sm:text-[12px] font-black uppercase text-[#3A2C2B] tracking-[0.1em]">Selection Workflow</p>
                <p className={cn(
                  "text-[9px] sm:text-[10px] font-bold uppercase mt-1 transition-colors duration-500",
                  selectedIds.length > 0 ? "text-emerald-600" : "text-[#3A2C2B]/40"
                )}>
                  {selectedIds.length > 0 ? `${selectedIds.length} Candidates Selected` : "Select students to begin distribution"}
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row md:items-end gap-4 sm:gap-6">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-4 w-full">
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase text-[#3A2C2B]/60 ml-1">Assigned Section</span>
                  <Select
                    options={[{ label: 'Section A', value: 'A' }, { label: 'Section B', value: 'B' }, { label: 'Section C', value: 'C' }]}
                    value={targetSection}
                    onChange={setTargetSection}
                    className="h-10 sm:h-11 w-full text-[10px] bg-white border-black/10 rounded-xl sm:rounded-2xl font-black shadow-sm focus:border-[#3A2C2B]"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase text-[#3A2C2B]/60 ml-1">Target Department</span>
                  <Select
                    options={[{ label: 'Science', value: 'Science' }, { label: 'Commerce', value: 'Commerce' }, { label: 'Arts', value: 'Arts' }, { label: 'General', value: 'General' }]}
                    value={targetDept}
                    onChange={setTargetDept}
                    className="h-10 sm:h-11 w-full text-[10px] bg-white border-black/10 rounded-xl sm:rounded-2xl font-black shadow-sm focus:border-[#3A2C2B]"
                  />
                </div>
              </div>
              <Button
                disabled={selectedIds.length === 0}
                onClick={bulkAssign}
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-[#3A2C2B] text-white font-black uppercase text-[9px] sm:text-[10px] shadow-2xl shadow-black/20 disabled:opacity-20 transition-all hover:bg-black active:scale-95 whitespace-nowrap w-full md:w-auto md:min-w-[180px]"
              >
                Assign Selection
              </Button>
            </div>
          </div>

          {/* CANDIDATE TABLE */}
          <div className="bg-white rounded-[20px] border border-border/10 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#3A2C2B] text-white">
                  <th className="px-4 sm:px-8 py-5 w-12 text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-2 border-white/20 accent-primary cursor-pointer bg-transparent"
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-left">Candidate Detail</th>
                  <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-left">Applied Record</th>
                  <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-center">Assigned Section</th>
                  <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-center">Assigned Dept</th>
                  <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-center">Generated Roll</th>
                  <th className="px-4 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredStudents.map((stu, i) => (
                  <tr key={i} className={cn(
                    "group transition-all duration-300",
                    selectedIds.includes(stu.id) ? "bg-[#3A2C2B]/[0.05]" : "hover:bg-gray-50/50"
                  )}>
                    <td className="px-4 sm:px-8 py-6 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-black/10 accent-[#3A2C2B] cursor-pointer"
                        checked={selectedIds.includes(stu.id)}
                        onChange={() => toggleSelect(stu.id)}
                      />
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E8C4C4] flex items-center justify-center font-black text-[#3A2C2B] text-[10px] shadow-sm group-hover:bg-[#3A2C2B] group-hover:text-white transition-all duration-500">
                          {stu.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#3A2C2B] tracking-tight">{stu.name}</span>
                          <span className="text-[9px] font-bold text-[#3A2C2B]/30 mt-0.5 uppercase tracking-widest">{stu.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black text-[#3A2C2B] uppercase tracking-widest">{stu.appliedClass}</span>
                        <Badge className="bg-[#F3E5AB] text-[#B8860B] rounded-lg text-[8px] font-black border-none px-2.5 py-0.5 w-fit uppercase shadow-sm">Stream: {stu.appliedDept}</Badge>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-4 py-1.5 font-black text-[9px] uppercase transition-all duration-500",
                        stu.assignedSection !== '-'
                          ? "bg-[#B2D8D8] text-[#004D4D] shadow-md border border-[#B2D8D8]"
                          : "bg-gray-100 text-[#3A2C2B]/20 border border-black/5"
                      )}>
                        {stu.assignedSection !== '-' && <CheckCircle2 className="w-3 h-3" />}
                        {stu.assignedSection !== '-' ? `Section ${stu.assignedSection}` : "Unassigned"}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-center">
                      <Badge className={cn(
                        "rounded-xl px-4 py-1.5 font-black text-[9px] border-none uppercase transition-all duration-500 shadow-sm",
                        stu.assignedDept !== '-' ? "bg-[#FFDAB9] text-[#8B4513]" : "bg-gray-100 text-[#3A2C2B]/20"
                      )}>
                        {stu.assignedDept}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-center">
                      <div className={cn(
                        "font-black text-[11px] uppercase tracking-widest",
                        stu.roll !== '-' ? "text-primary" : "text-muted-foreground/20"
                      )}>
                        {stu.roll}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-right">
                      <Button variant="ghost" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase text-[#3A2C2B] hover:bg-[#3A2C2B] hover:text-white transition-all shadow-sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 bg-gray-50/20">
                <div className="w-20 h-20 rounded-[30px] bg-white border border-black/5 flex items-center justify-center mb-6 shadow-xl">
                  <Users className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <p className="text-[12px] font-black uppercase text-[#3A2C2B]/30 tracking-[0.3em]">No candidates available for distribution</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;
