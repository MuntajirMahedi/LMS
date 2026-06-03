import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Book,
  FileText,
  CheckCircle2,
  BarChart3,
  Plus,
  Search,
  ClipboardList,
  Download,
  Eye,
  Edit2,
  Trash2,
  Users,
  Layers,
  LayoutGrid,
  List,
  X,
  ExternalLink,
  File,
  Paperclip,
  Upload,
  Video,
  AlertCircle,
  Clock,
  History as HistoryIcon,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { cn } from '../lib/utils';
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import { getStorageData, setStorageData } from '../lib/storage';

const ACADEMIC_GLOBAL_SUBJECTS_KEY = 'school_academic_global_subjects';
const ACADEMIC_SUBJECTS_LIST_KEY = 'school_academic_subjects_list';
const ACADEMIC_TASKS_KEY = 'school_academic_tasks';
const ACADEMIC_AUDIT_LOGS_KEY = 'school_academic_audit_logs';
const ACADEMIC_TASK_DRAFTS_KEY = 'school_academic_task_drafts';

const EMPTY_TASK_DRAFTS = {
  Homework: null,
  Assignment: null,
  Quiz: null
};

const AcademicContentPage: React.FC = () => {
  const navigate = useNavigate();
  // Modal States
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Class Management States (Migrated from School Structure)
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [selectedPhysicalClassId, setSelectedPhysicalClassId] = useState<string>('');

  const mockPhysicalClasses = [
    { id: 'pc1', name: 'Class 10', section: 'A', department: 'General', room: 'M-1-01' },
    { id: 'pc2', name: 'Class 10', section: 'B', department: 'General', room: 'M-1-02' },
    { id: 'pc3', name: 'Class 11', section: 'A', department: 'Science', room: 'M-2-01' },
    { id: 'pc4', name: 'Class 11', section: 'B', department: 'Commerce', room: 'M-2-02' },
  ];

  // Global Subjects Master (Master List)
  const [globalSubjects, setGlobalSubjects] = useState(() => getStorageData(ACADEMIC_GLOBAL_SUBJECTS_KEY, [
    { name: 'Mathematics', code: 'MATH-101', dept: 'Science', classLevel: 'Class 10' },
    { name: 'Physics', code: 'PHYS-202', dept: 'Science', classLevel: 'Class 11' },
    { name: 'Chemistry', code: 'CHEM-303', dept: 'Science', classLevel: 'Class 12' },
    { name: 'Biology', code: 'BIO-404', dept: 'Science', classLevel: 'Class 11' },
    { name: 'English Literature', code: 'ENG-505', dept: 'Arts', classLevel: 'Class 10' },
    { name: 'History', code: 'HIST-606', dept: 'Arts', classLevel: 'Class 10' },
  ]));

  const [subjectInput, setSubjectInput] = useState('');
  const [subjectCodeInput, setSubjectCodeInput] = useState('');
  const [subjectsList, setSubjectsList] = useState<{ name: string, code?: string, teachers: string[] }[]>(() => getStorageData(ACADEMIC_SUBJECTS_LIST_KEY, []));

  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDept, setNewSubDept] = useState('Science');
  const [newSubClass, setNewSubClass] = useState('All Classes');

  const [assigningTeacherTo, setAssigningTeacherTo] = useState<number | null>(null);
  const [showSubjectsViewModal, setShowSubjectsViewModal] = useState(false);
  const [selectedClassForSubjects, setSelectedClassForSubjects] = useState<any>(null);
  
  // Global Class Registry
  const [globalClasses] = useState([
    { id: 1, name: 'Class 10', section: 'A', dept: 'General', teacher: 'Mr. Robert Fox', subjects: ['Mathematics', 'Physics', 'Chemistry', 'English Literature', 'History'] },
    { id: 2, name: 'Class 11', section: 'B', dept: 'Science', teacher: 'Ms. Jane Cooper', subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
    { id: 3, name: 'Class 11', section: 'C', dept: 'Commerce', teacher: 'Dr. Albert Flores', subjects: ['Accountancy', 'Economics', 'Business Studies'] },
    { id: 4, name: 'Class 12', section: 'A', dept: 'Science', teacher: 'Mrs. Sarah Jenkins', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  ]);

  // Course Modal States
  const [courseClass, setCourseClass] = useState('');
  const [courseDept, setCourseDept] = useState('General');
  const [courseSubject, setCourseSubject] = useState('');

  // Lesson Plan States
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedLessonMaterials, setSelectedLessonMaterials] = useState<any>(null);

  // --- Task System States ---
  const [tasks, setTasks] = useState<any[]>(() => getStorageData(ACADEMIC_TASKS_KEY, [
    { id: 1, title: 'Calc Integration Basics', type: 'Assignment', sub: 'Mathematics', class: 'Class 10', section: 'A', dueDate: '24 May 2026', status: 'Published', createdDate: '2026-05-01', submissions: { total: 45, submitted: 38, pending: 7 }, hasMaterials: true, hasLinks: true, description: 'Basic integration exercises.', instructions: 'Follow Chapter 4 rubric.' },
    { id: 2, title: 'Physics Mid-Term Quiz', type: 'Quiz', sub: 'Physics', class: 'Class 11', section: 'B', dueDate: '24 May 2026', status: 'Published', createdDate: '2026-05-05', submissions: { total: 45, submitted: 45, pending: 0 }, hasMaterials: false, hasLinks: true, quizConfig: { marks: 50, duration: 45 } },
    { id: 3, title: 'Historical Map Drawing', type: 'Homework', sub: 'History', class: 'Class 10', section: 'C', dueDate: '24 May 2026', status: 'Draft', createdDate: '2026-05-07', submissions: { total: 40, submitted: 12, pending: 28 }, hasMaterials: true, hasLinks: false }
  ]));

  const [auditLogs, setAuditLogs] = useState<any[]>(() => getStorageData(ACADEMIC_AUDIT_LOGS_KEY, []));
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilters, setTaskFilters] = useState({ type: 'all', class: 'all', section: 'all', sub: 'all', status: 'all', dept: 'all' });
   const [searchClass, setSearchClass] = useState('');
  const [searchCurriculum, setSearchCurriculum] = useState('');
  const [searchLesson, setSearchLesson] = useState('');
  const [classView, setClassView] = useState<'card' | 'table'>('table');
  const [subjectView, setSubjectView] = useState<'card' | 'table'>('table');
  const [lessonView, setLessonView] = useState<'card' | 'table'>('card');
  const [taskView, setTaskView] = useState<'card' | 'table'>('table');

  // Create/Edit Modal States
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [taskClassification, setTaskClassification] = useState('Assignment');
  const [taskYear, setTaskYear] = useState('2025-26');
  const [taskClass, setTaskClass] = useState('');
  const [taskDept, setTaskDept] = useState('General');
  const [taskSections, setTaskSections] = useState<string[]>([]);
  const [taskSubject, setTaskSubject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskInstructions, setTaskInstructions] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPublishStatus, setTaskPublishStatus] = useState('Draft');

  // Quiz specific
  const [quizMarks, setQuizMarks] = useState('100');
  const [quizDuration, setQuizDuration] = useState('30');
  const [quizStartTime, setQuizStartTime] = useState('');
  const [quizEndTime, setQuizEndTime] = useState('');
  const [quizAttempts, setQuizAttempts] = useState('1');
  const [quizAutoPublish, setQuizAutoPublish] = useState(false);
  const [quizPassingMarks, setQuizPassingMarks] = useState('40');

  const [taskLinks, setTaskLinks] = useState<{ label: string, url: string }[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [taskMaterials, setTaskMaterials] = useState<{ name: string, size: string }[]>([]);

  // Confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [taskToUnpublish, setTaskToUnpublish] = useState<number | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState<any>(null);
  const [taskViewMode, setTaskViewMode] = useState<'details' | 'answers'>('details');

  // --- Multi-Type State Management ---
  const [taskDrafts, setTaskDrafts] = useState<Record<string, any>>(() => getStorageData(ACADEMIC_TASK_DRAFTS_KEY, EMPTY_TASK_DRAFTS));

  useEffect(() => {
    setStorageData(ACADEMIC_GLOBAL_SUBJECTS_KEY, globalSubjects);
  }, [globalSubjects]);

  useEffect(() => {
    setStorageData(ACADEMIC_SUBJECTS_LIST_KEY, subjectsList);
  }, [subjectsList]);

  useEffect(() => {
    setStorageData(ACADEMIC_TASKS_KEY, tasks);
  }, [tasks]);

  useEffect(() => {
    setStorageData(ACADEMIC_AUDIT_LOGS_KEY, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    setStorageData(ACADEMIC_TASK_DRAFTS_KEY, taskDrafts);
  }, [taskDrafts]);

  const handleClassificationChange = (newType: string) => {
    if (newType === taskClassification) return;

    // 1. Save current state to drafts (if not editing an existing task)
    if (!isEditingTask) {
      const currentDraft = {
        taskClass, taskDept, taskSections, taskSubject, taskTitle, taskDescription, taskInstructions, taskDueDate, taskPublishStatus,
        quizMarks, quizDuration, quizStartTime, quizEndTime, quizAttempts, quizAutoPublish, quizPassingMarks,
        taskLinks, taskMaterials
      };
      setTaskDrafts(prev => ({ ...prev, [taskClassification]: currentDraft }));
    }

    // 2. Navigation override for Quiz
    if (newType === 'Quiz') {
      setShowTaskModal(false);
      navigate('/academics/quiz-builder');
      return;
    }

    setTaskClassification(newType);

    // 3. Load new draft or reset (if not editing)
    if (!isEditingTask) {
      const newDraft = taskDrafts[newType];
      if (newDraft) {
        setTaskClass(newDraft.taskClass);
        setTaskDept(newDraft.taskDept);
        setTaskSections(newDraft.taskSections);
        setTaskSubject(newDraft.taskSubject);
        setTaskTitle(newDraft.taskTitle);
        setTaskDescription(newDraft.taskDescription);
        setTaskInstructions(newDraft.taskInstructions);
        setTaskDueDate(newDraft.taskDueDate);
        setTaskPublishStatus(newDraft.taskPublishStatus);
        setQuizMarks(newDraft.quizMarks);
        setQuizDuration(newDraft.quizDuration);
        setQuizStartTime(newDraft.quizStartTime);
        setQuizEndTime(newDraft.quizEndTime);
        setQuizAttempts(newDraft.quizAttempts);
        setQuizAutoPublish(newDraft.quizAutoPublish);
        setQuizPassingMarks(newDraft.quizPassingMarks);
        setTaskLinks(newDraft.taskLinks);
        setTaskMaterials(newDraft.taskMaterials);
      } else {
        // Reset to defaults for this specific type
        setTaskClass('');
        setTaskDept('General');
        setTaskSections([]);
        setTaskSubject('');
        setTaskTitle('');
        setTaskDescription('');
        setTaskInstructions('');
        setTaskDueDate('');
        setTaskPublishStatus('Draft');
        setQuizMarks('100');
        setQuizDuration('30');
        setQuizStartTime('');
        setQuizEndTime('');
        setQuizAttempts('1');
        setQuizAutoPublish(false);
        setQuizPassingMarks('40');
        setTaskLinks([]);
        setTaskMaterials([]);
      }
    }
  };

  const addAuditLog = (action: string, taskRef: string) => {
    const newLog = {
      action,
      taskRef,
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const mockTeachers = [
    "Mr. Robert Fox",
    "Ms. Jane Cooper",
    "Dr. Albert Flores",
    "Mrs. Sarah Jenkins",
    "Mr. Guy Hawkins",
    "Ms. Eleanor Pena"
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesType = taskFilters.type === 'all' || task.type === taskFilters.type;
    const matchesClass = taskFilters.class === 'all' || task.class === taskFilters.class;
    const matchesSection = taskFilters.section === 'all' || task.section.includes(taskFilters.section);
    const matchesSub = taskFilters.sub === 'all' || task.sub === taskFilters.sub;
    const matchesStatus = taskFilters.status === 'all' || task.status === taskFilters.status;
    const matchesDept = taskFilters.dept === 'all' || task.dept === taskFilters.dept;
    return matchesSearch && matchesType && matchesClass && matchesSection && matchesSub && matchesStatus && matchesDept;
  });

  const filteredClasses = globalClasses.filter(cls => 
    cls.name.toLowerCase().includes(searchClass.toLowerCase()) ||
    cls.dept.toLowerCase().includes(searchClass.toLowerCase())
  );

  const curriculumData = [
    { name: 'Advanced Mathematics', code: 'MATH-101', course: 'Calculus II', teachers: ['Mr. Robert Fox', 'Ms. Jane Cooper'], class: 'Class 10-A', progress: 85, status: 'Active' },
    { name: 'Physics', code: 'PHY-201', course: 'Quantum Mechanics', teachers: ['Dr. Albert Flores'], class: 'Class 11-B', progress: 45, status: 'Active' },
    { name: 'Quantum Chemistry', code: 'CHEM-301', course: 'Atomic Theory', teachers: ['Mrs. Sarah Jenkins'], class: 'Class 12-A', progress: 62, status: 'Pending' },
    { name: 'World History', code: 'HIST-105', course: 'Modern Revolutions', teachers: ['Mr. Guy Hawkins'], class: 'Class 10-C', progress: 100, status: 'Completed' },
  ];

  const filteredCurriculum = curriculumData.filter(item => 
    item.name.toLowerCase().includes(searchCurriculum.toLowerCase()) ||
    item.course.toLowerCase().includes(searchCurriculum.toLowerCase()) ||
    item.code.toLowerCase().includes(searchCurriculum.toLowerCase())
  );

  const lessonData = [
    { title: 'Trigonometry Basics', subject: 'Math', teacher: 'Mr. Fox', status: 'Published', materials: 4, progress: 100, color: 'bg-[#B1D3EC]' },
    { title: 'Organic Evolution', subject: 'Biology', teacher: 'Ms. Cooper', status: 'Draft', materials: 2, progress: 30, color: 'bg-[#EBBDC2]' },
    { title: 'The French Revolution', subject: 'History', teacher: 'Mr. Hawkins', status: 'Published', materials: 6, progress: 85, color: 'bg-[#BFDDD8]' },
  ];

  const filteredLessons = lessonData.filter(lesson => 
    lesson.title.toLowerCase().includes(searchLesson.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchLesson.toLowerCase()) ||
    lesson.teacher.toLowerCase().includes(searchLesson.toLowerCase())
  );

  const handleCreateTask = () => {
    const newTask = {
      id: Date.now(),
      title: taskTitle,
      type: taskClassification,
      sub: taskSubject,
      dept: taskDept,
      class: taskClass,
      section: taskSections.join(', '),
      dueDate: taskDueDate,
      status: taskPublishStatus,
      createdDate: new Date().toLocaleDateString(),
      description: taskDescription,
      instructions: taskInstructions,
      submissions: { total: 40, submitted: 0, pending: 40 },
      hasMaterials: taskMaterials.length > 0,
      hasLinks: taskLinks.length > 0,
      quizConfig: taskClassification === 'Quiz' ? {
        marks: quizMarks,
        duration: quizDuration,
        startTime: quizStartTime,
        endTime: quizEndTime,
        attempts: quizAttempts,
        autoPublish: quizAutoPublish,
        passingMarks: quizPassingMarks
      } : null
    };
    setTasks([newTask, ...tasks]);
    addAuditLog('Task Created', taskTitle);
    if (taskPublishStatus === 'Published') addAuditLog('Task Published', taskTitle);
    setShowTaskModal(false);
    resetTaskForm();
  };

  const handleEditTask = () => {
    setTasks(tasks.map(t => t.id === editingTaskId ? {
      ...t,
      title: taskTitle,
      type: taskClassification,
      sub: taskSubject,
      dept: taskDept,
      class: taskClass,
      section: taskSections.join(', '),
      dueDate: taskDueDate,
      status: taskPublishStatus,
      description: taskDescription,
      instructions: taskInstructions,
      quizConfig: taskClassification === 'Quiz' ? {
        marks: quizMarks,
        duration: quizDuration,
        startTime: quizStartTime,
        endTime: quizEndTime,
        attempts: quizAttempts,
        autoPublish: quizAutoPublish,
        passingMarks: quizPassingMarks
      } : null
    } : t));
    addAuditLog('Task Updated', taskTitle);
    setShowTaskModal(false);
    resetTaskForm();
  };

  const handleDeleteTask = () => {
    const task = tasks.find(t => t.id === taskToDelete);
    setTasks(tasks.filter(t => t.id !== taskToDelete));
    if (task) addAuditLog('Task Deleted', task.title);
    setShowDeleteConfirm(false);
  };

  const togglePublishStatus = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.status === 'Published') {
      setTaskToUnpublish(id);
      setShowUnpublishConfirm(true);
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Published' } : t));
      addAuditLog('Task Published', task.title);
    }
  };

  const confirmUnpublish = () => {
    const task = tasks.find(t => t.id === taskToUnpublish);
    setTasks(tasks.map(t => t.id === taskToUnpublish ? { ...t, status: 'Draft' } : t));
    if (task) addAuditLog('Task Unpublished', task.title);
    setShowUnpublishConfirm(false);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskInstructions('');
    setTaskDueDate('');
    setTaskClassification('Assignment');
    setTaskClass('');
    setTaskDept('General');
    setTaskSections([]);
    setTaskSubject('');
    setTaskPublishStatus('Draft');
    setQuizMarks('100');
    setQuizDuration('30');
    setQuizStartTime('');
    setQuizEndTime('');
    setQuizAttempts('1');
    setQuizAutoPublish(false);
    setQuizPassingMarks('40');
    setTaskLinks([]);
    setTaskMaterials([]);
    setTaskDrafts({
      Homework: null,
      Assignment: null,
      Quiz: null
    });
    setIsEditingTask(false);
    setEditingTaskId(null);
  };

  const openEditModal = (task: any) => {
    if (task.type === 'Quiz') {
      navigate('/academics/quiz-builder');
      return;
    }
    setIsEditingTask(true);
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskInstructions(task.instructions || '');
    setTaskDueDate(task.dueDate);
    setTaskClassification(task.type);
    setTaskClass(task.class);
    setTaskDept(task.dept || 'General');
    setTaskSections(task.section ? task.section.split(', ') : []);
    setTaskSubject(task.sub);
    setTaskPublishStatus(task.status);
    if (task.quizConfig) {
      setQuizMarks(task.quizConfig.marks);
      setQuizDuration(task.quizConfig.duration);
      setQuizStartTime(task.quizConfig.startTime || '');
      setQuizEndTime(task.quizConfig.endTime || '');
      setQuizAttempts(task.quizConfig.attempts || '1');
      setQuizAutoPublish(task.quizConfig.autoPublish || false);
      setQuizPassingMarks(task.quizConfig.passingMarks || '40');
    }
    setShowTaskModal(true);
  };

  // KPI Data
  const kpis = [
    { label: "Total Subjects", value: "48", icon: Book, color: "bg-primary" },
    { label: "Total Courses", value: "124", icon: BookOpen, color: "bg-brand-orange" },
    { label: "Total Assignments", value: "850+", icon: ClipboardList, color: "bg-brand-green" },
    { label: "Pending Evaluations", value: "32", icon: CheckCircle2, color: "bg-brand-purple" },
    { label: "Average Attendance", value: "94%", icon: Users, color: "bg-oat" },
    { label: "Syllabus Completion", value: "78%", icon: BarChart3, color: "bg-brand-blue" },
  ];

  return (
    <div className="p-0 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Academic Command Center</h1>
          <p className="text-muted-foreground font-medium italic">Manage curriculum, subjects, lesson plans, and academic progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-12 rounded-2xl px-6 bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90 font-black uppercase tracking-widest text-[10px] shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> Create Content
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl px-4 border-[#3A2C2B]/10 hover:bg-[#3A2C2B]/5 font-black uppercase tracking-widest text-[10px]">
            <Download className="w-4 h-4 mr-2" /> Syllabus Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {kpis.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="sticky top-0 z-30 space-y-4 pt-4 pb-6 bg-transparent -mx-4 px-4">
        {/* Academic Modules Horizontal Bar */}
        <div className="rounded-[20px] bg-[#3A2C2B] text-white overflow-hidden shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 w-full p-1">
            {[
              { id: 'class-management', label: 'Classes', fullLabel: 'Class Management', icon: Layers },
              { id: 'subjects', label: 'Subjects', fullLabel: 'Subjects & Courses', icon: Book },
              { id: 'lessons', label: 'Lessons', fullLabel: 'Lesson Plans', icon: FileText },
              { id: 'assignments', label: 'Tasks', fullLabel: 'Assignments', icon: ClipboardList },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-[16px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 group text-white/60 hover:text-white hover:bg-white/10 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
              >
                <item.icon className="w-3.5 h-3.5 sm:w-4 h-4 text-white/40 group-hover:text-white group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline lg:hidden">{item.label}</span>
                <span className="hidden lg:inline">{item.fullLabel}</span>
                <span className="sm:hidden">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-20 pb-20">

        {/* 1. CLASS & SECTION MANAGEMENT */}
        <div id="classes" className="scroll-mt-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-[#3A2C2B]">Class Management</h2>
              <p className="text-muted-foreground font-medium italic text-xs">Define institutional hierarchy and assigned educators</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setClassView('card')}
                    className={cn("p-2 rounded-lg transition-all", classView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setClassView('table')}
                    className={cn("p-2 rounded-lg transition-all", classView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A2C2B]/30" />
                  <Input
                    placeholder="Search classes..."
                    className="pl-12 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none font-bold text-xs text-[#3A2C2B] w-full"
                    value={searchClass}
                    onChange={(e) => setSearchClass(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  setEditingClass(null);
                  setSelectedPhysicalClassId('');
                  setSubjectsList([]);
                  setShowClassModal(true);
                }} 
                className="w-full sm:w-auto rounded-xl font-black h-11 px-8 shadow-xl bg-primary text-white hover:bg-primary/90 text-xs whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" /> FILL CLASS DETAILS
              </Button>
            </div>
          </div>

          {classView === 'table' ? (
            <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[700px] flex flex-col">
                {/* Fixed Header */}
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white">
                        <th className="w-[45%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Class Info
                        </th>
                        <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Class Teacher
                        </th>
                        <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body */}
                <div
                  className="max-h-[250px] overflow-y-auto custom-scrollbar"
                >
                  <table className="w-full text-left table-fixed">
                    <tbody className="divide-y divide-[#3A2C2B]/5">
                      {filteredClasses.map((cls) => (
                        <tr key={cls.id} className="hover:bg-white transition-colors group">
                          <td className="w-[45%] px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-2xl bg-[#3A2C2B]/5 flex items-center justify-center font-black text-base text-primary shadow-inner">
                                {cls.name.match(/\d+/)?.[0] || '?' }
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-sm text-[#3A2C2B]">{cls.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="secondary" className="bg-[#3A2C2B]/5 text-primary border-none text-[9px] px-2 py-0">{cls.section} Section</Badge>
                                  <span className="text-[10px] font-bold text-muted-foreground">• 45 Students</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="w-[30%] px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                {cls.teacher.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs font-bold text-[#3A2C2B]/80">{cls.teacher}</span>
                            </div>
                          </td>
                          <td className="w-[25%] px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg font-black text-[9px] uppercase text-primary hover:bg-[#3A2C2B]/5"
                                onClick={() => {
                                  setEditingClass(cls);
                                  setSelectedPhysicalClassId('pc1'); // Mock pre-select for edit
                                  setSubjectsList([
                                    { name: 'Mathematics', teachers: ['Mr. Robert Fox'] },
                                    { name: 'Physics', teachers: ['Ms. Jane Cooper'] }
                                  ]);
                                  setShowClassModal(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg font-black text-[9px] uppercase text-primary hover:bg-[#3A2C2B]/5"
                                onClick={() => {
                                  setSelectedClassForSubjects(cls);
                                  setShowSubjectsViewModal(true);
                                }}
                              >
                                Subjects
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/40 hover:text-destructive hover:bg-destructive/5">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Standard Pagination Footer */}
            <div className="px-8 py-4 border-t border-[#3A2C2B]/10 flex items-center justify-between bg-white/50">
              <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                Showing <span className="text-[#3A2C2B] font-black">{filteredClasses.length}</span> entries
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
          ) : (
            <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
              {filteredClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex-none w-[280px] group rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border border-white/5"
                >
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl text-primary shadow-inner ring-4 ring-white/5">
                        {cls.name.match(/\d+/)?.[0] || '?'}
                      </div>
                      <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg">
                        {cls.dept}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">{cls.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Section {cls.section}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">45 Students</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-primary border border-white/5">
                          {cls.teacher.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Class Teacher</p>
                          <p className="text-xs font-black text-white/80">{cls.teacher}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-white/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingClass(cls);
                            setShowClassModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-white/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClassForSubjects(cls);
                            setShowSubjectsViewModal(true);
                          }}
                        >
                          Subjects
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. SUBJECT & COURSE SECTION */}
        <div id="subjects" className="scroll-mt-8 space-y-6">
          <div className="space-y-6 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#3A2C2B]">Subject & Course Directory</h2>
                <p className="text-muted-foreground font-medium italic text-xs">Assign teachers and track syllabus status</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowSubjectModal(true)} className="rounded-xl font-black h-11 px-6 shadow-xl bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90 text-[10px] whitespace-nowrap uppercase">NEW SUBJECT</Button>
                <Button onClick={() => setShowCourseModal(true)} variant="outline" className="rounded-xl font-black h-11 px-6 border-[#3A2C2B]/20 text-[#3A2C2B] hover:bg-[#3A2C2B]/5 text-[10px] whitespace-nowrap uppercase">NEW COURSE</Button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:flex-nowrap gap-3">
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl">
                  <button
                    onClick={() => setSubjectView('card')}
                    className={cn("p-2 rounded-lg transition-all", subjectView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSubjectView('table')}
                    className={cn("p-2 rounded-lg transition-all", subjectView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A2C2B]/30" />
                  <Input 
                    placeholder="Search curriculum..." 
                    className="pl-12 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none font-bold text-xs text-[#3A2C2B] w-full" 
                    value={searchCurriculum}
                    onChange={(e) => setSearchCurriculum(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
                <div className="w-full md:w-32">
                  <Select
                    options={[
                      { label: 'All Classes', value: 'all' },
                      { label: 'Class 9', value: '9' },
                      { label: 'Class 10', value: '10' },
                      { label: 'Class 11', value: '11' },
                      { label: 'Class 12', value: '12' },
                    ]}
                    placeholder="Class"
                    className="h-11 bg-[#3A2C2B]/5 border-none text-[#3A2C2B] font-black text-xs rounded-2xl"
                  />
                </div>
                <div className="w-full md:w-40">
                  <Select
                    options={[
                      { label: 'All Depts', value: 'all' },
                      { label: 'General', value: 'General' },
                      { label: 'Science', value: 'Science' },
                      { label: 'Commerce', value: 'Commerce' },
                      { label: 'Arts', value: 'Arts' },
                    ]}
                    placeholder="Department"
                    className="h-11 bg-[#3A2C2B]/5 border-none text-[#3A2C2B] font-black text-xs rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {subjectView === 'table' ? (
            <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[900px] flex flex-col">
                {/* Fixed Header */}
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white">
                        <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Subject
                        </th>
                        <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Course Name
                        </th>
                        <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Assigned Teacher(s)
                        </th>
                        <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Class & Sec
                        </th>
                        <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                          Syllabus Progress
                        </th>
                        <th className="w-[10%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body */}
                <div
                  className="max-h-[250px] overflow-y-auto custom-scrollbar"
                >
                  <table className="w-full text-left table-fixed">
                    <tbody className="divide-y divide-[#3A2C2B]/5">
                      {filteredCurriculum.map((row, i) => (
                        <tr key={i} className="hover:bg-white transition-colors group">
                          <td className="w-[15%] px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-black text-xs text-[#3A2C2B]">{row.name}</span>
                              <span className="text-[9px] font-black uppercase opacity-40">{row.code}</span>
                            </div>
                          </td>
                          <td className="w-[15%] px-8 py-5 text-[11px] font-black text-[#3A2C2B]/80">{row.course}</td>
                          <td className="w-[25%] px-8 py-5">
                            <div className="flex flex-wrap gap-1">
                              {row.teachers.map((t, ti) => (
                                <Badge key={ti} variant="secondary" className="bg-[#3A2C2B]/5 text-[#3A2C2B] border-none text-[8px] py-0 px-2 rounded-md font-bold">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="w-[15%] px-8 py-5 text-[11px] font-black text-muted-foreground">{row.class}</td>
                          <td className="w-[20%] px-8 py-5">
                            <div className="w-full max-w-[100px] space-y-1.5">
                              <div className="flex justify-between text-[8px] font-black uppercase">
                                <span>Progress</span>
                                <span>{row.progress}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-[#3A2C2B]/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${row.progress}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="w-[10%] px-8 py-5 text-right">
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg transition-opacity">
                              <Edit2 className="w-4 h-4 opacity-40 hover:opacity-100" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Standard Pagination Footer */}
            <div className="px-8 py-4 border-t border-[#3A2C2B]/10 flex items-center justify-between bg-white/50">
              <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                Showing <span className="text-[#3A2C2B] font-black">{filteredCurriculum.length}</span> entries
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
          ) : (
            <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
              {filteredCurriculum.map((row, i) => (
                <div
                  key={i}
                  className="flex-none w-[320px] group rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border border-white/5"
                >
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white uppercase leading-tight tracking-tighter">{row.name}</h3>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{row.code}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/10 text-white">
                        <Book className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Active Course</p>
                      <p className="text-xs font-black text-white/80">{row.course}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Class & Sec</p>
                        <p className="text-xs font-black text-white/90">{row.class}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Instructors</p>
                        <div className="flex flex-wrap justify-end gap-1">
                          {row.teachers.map((t, ti) => (
                            <Badge key={ti} className="bg-white/10 text-white border-none text-[8px] font-black px-2 py-0.5 rounded-md">
                              {t.split(' ').pop()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase text-white/40">
                        <span>Syllabus Progress</span>
                        <span>{row.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${row.progress}%` }} />
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-white/80">
                      MANAGE CURRICULUM
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. LESSON PLAN & STUDY MATERIAL */}
        <div id="lessons" className="scroll-mt-8 space-y-6">
          <div className="space-y-6 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#3A2C2B]">Lesson Plan Master</h2>
                <p className="text-muted-foreground font-medium italic text-xs">Structure and distribute curriculum content</p>
              </div>
              <Button onClick={() => setShowLessonModal(true)} className="rounded-xl font-black h-11 px-8 bg-primary text-white hover:bg-primary/90 text-xs shadow-xl whitespace-nowrap uppercase">CREATE LESSON</Button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:flex-nowrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setLessonView('card')}
                    className={cn("p-2 rounded-lg transition-all", lessonView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLessonView('table')}
                    className={cn("p-2 rounded-lg transition-all", lessonView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A2C2B]/30" />
                  <Input 
                    placeholder="Search lessons..." 
                    className="pl-12 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none font-bold text-xs text-[#3A2C2B] w-full" 
                    value={searchLesson}
                    onChange={(e) => setSearchLesson(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
                <div className="w-full md:w-32">
                  <Select options={[{ label: 'All Classes', value: 'all' }, { label: 'Class 10', value: '10' }]} placeholder="Class" className="bg-[#3A2C2B]/5 border-none h-11 text-[10px] rounded-2xl font-black w-full" />
                </div>
                <div className="w-full md:w-40">
                  <Select options={[{ label: 'All Depts', value: 'all' }, { label: 'Science', value: 'Science' }]} placeholder="Department" className="bg-[#3A2C2B]/5 border-none h-11 text-[10px] rounded-2xl font-black w-full" />
                </div>
              </div>
            </div>
          </div>          <div className="p-0">
            {lessonView === 'card' ? (
              <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
                {filteredLessons.map((lesson, i) => (
                  <div key={i} className="flex-none w-[300px] group rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border border-white/5">
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-white/10 text-primary shadow-inner">
                          <FileText className="w-6 h-6" />
                        </div>
                        <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase">{lesson.status}</Badge>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{lesson.title}</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{lesson.subject}</span>
                           <span className="w-1 h-1 rounded-full bg-white/20" />
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{lesson.teacher}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-white/40">Study Resources</span>
                         <span className="font-black text-sm text-white">{lesson.materials} Files</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase text-white/40">
                          <span>Chapter Progress</span>
                          <span>{lesson.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${lesson.progress}%` }} />
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        className="w-full rounded-xl h-12 text-[10px] font-black uppercase bg-white/5 hover:bg-white/10 text-white/80"
                        onClick={() => {
                          setSelectedLessonMaterials(lesson);
                          setShowMaterialsModal(true);
                        }}
                      >
                        ACCESS MATERIALS
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <div className="min-w-[800px] flex flex-col">
                    {/* Fixed Header */}
                    <div className="bg-[#3A2C2B] shrink-0">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-white">
                            <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                              Lesson Title
                            </th>
                            <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                              Subject
                            </th>
                            <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                              Teacher
                            </th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-center">
                              Status
                            </th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">
                              Materials
                            </th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable Body */}
                    <div
                      className="max-h-[250px] overflow-y-auto custom-scrollbar"
                    >
                      <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-[#3A2C2B]/5">
                          {filteredLessons.map((lesson, i) => (
                            <tr key={i} className="hover:bg-white transition-colors group">
                              <td className="w-[30%] px-8 py-6 font-black text-xs text-[#3A2C2B]">{lesson.title}</td>
                              <td className="w-[20%] px-8 py-6 text-[10px] font-bold opacity-60 uppercase text-[#3A2C2B]">{lesson.subject}</td>
                              <td className="w-[20%] px-8 py-6 text-[10px] font-bold opacity-60 uppercase text-[#3A2C2B]">{lesson.teacher}</td>
                              <td className="w-[15%] px-8 py-6">
                                <div className="flex justify-center">
                                  <Badge className="bg-[#3A2C2B]/5 text-primary border-none text-[8px] px-3 font-black uppercase">{lesson.status}</Badge>
                                </div>
                              </td>
                              <td className="w-[15%] px-8 py-6 text-right">
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase opacity-60 hover:opacity-100 text-primary" onClick={() => { setSelectedLessonMaterials(lesson); setShowMaterialsModal(true); }}>VIEW FILES</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Standard Pagination Footer */}
                <div className="px-8 py-4 border-t border-[#3A2C2B]/10 flex items-center justify-between bg-white/50">
                  <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                    Showing <span className="text-[#3A2C2B] font-black">{filteredLessons.length}</span> entries
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
            )}
          </div>
        </div>

        {/* 5. ASSIGNMENT / HOMEWORK / QUIZ SECTION */}
        <div id="assignments" className="scroll-mt-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-[#3A2C2B]">Active Academic Tasks</h2>
              <p className="text-muted-foreground font-medium italic text-xs">Manage submissions and deadlines</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => setShowAuditModal(true)} className="rounded-xl font-black h-11 px-6 border-[#3A2C2B]/10 text-[#3A2C2B] hover:bg-[#3A2C2B]/5 text-[10px] whitespace-nowrap">
                <HistoryIcon className="w-3.5 h-3.5 mr-2" />
                AUDIT TRAIL
              </Button>
              <Button onClick={() => setShowTaskModal(true)} className="rounded-xl font-black h-11 px-8 bg-primary text-white hover:bg-primary/90 text-xs shadow-xl whitespace-nowrap">CREATE TASK</Button>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:flex-nowrap gap-4 px-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl">
                  <button
                    onClick={() => setTaskView('card')}
                    className={cn("p-2 rounded-lg transition-all", taskView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTaskView('table')}
                    className={cn("p-2 rounded-lg transition-all", taskView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3A2C2B]/30" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-12 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none font-bold text-xs w-full"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
                <div className="w-full md:w-32">
                  <Select
                    value={taskFilters.type}
                    options={[
                      { label: 'All Types', value: 'all' },
                      { label: 'Homework', value: 'Homework' },
                      { label: 'Assignment', value: 'Assignment' },
                      { label: 'Quiz', value: 'Quiz' }
                    ]}
                    onChange={(val) => setTaskFilters({ ...taskFilters, type: val })}
                    className="bg-[#3A2C2B]/5 border-none h-11 rounded-2xl text-[10px] font-black w-full"
                  />
                </div>
                <div className="w-full md:w-32">
                  <Select
                    value={taskFilters.class}
                    options={[
                      { label: 'All Classes', value: 'all' },
                      ...Array.from(new Set(globalClasses.map(c => c.name))).map(c => ({ label: c, value: c }))
                    ]}
                    onChange={(val) => setTaskFilters({ ...taskFilters, class: val })}
                    className="bg-[#3A2C2B]/5 border-none h-11 rounded-2xl text-[10px] font-black w-full"
                  />
                </div>
                <div className="w-full md:w-32">
                  <Select
                    value={taskFilters.status}
                    options={[
                      { label: 'All Status', value: 'all' },
                      { label: 'Draft', value: 'Draft' },
                      { label: 'Published', value: 'Published' }
                    ]}
                    onChange={(val) => setTaskFilters({ ...taskFilters, status: val })}
                    className="bg-[#3A2C2B]/5 border-none h-11 rounded-2xl text-[10px] font-black w-full"
                  />
                </div>
                <Button variant="outline" className="h-11 rounded-2xl border-[#3A2C2B]/10 px-4 font-black uppercase text-[10px] text-[#3A2C2B] hover:bg-[#3A2C2B]/5 w-full md:w-auto" onClick={() => setTaskFilters({ type: 'all', class: 'all', section: 'all', sub: 'all', status: 'all', dept: 'all' })}>
                  RESET
                </Button>
              </div>
            </div>

            {taskView === 'table' ? (
              <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <div className="min-w-[1000px] flex flex-col">
                  {/* Fixed Header */}
                  <div className="bg-[#3A2C2B] shrink-0">
                    <table className="w-full text-left table-fixed">
                      <thead>
                        <tr className="text-white">
                          <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Title
                          </th>
                          <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Target
                          </th>
                          <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Due Date
                          </th>
                          <th className="w-[10%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Status
                          </th>
                          <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Submissions
                          </th>
                          <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  {/* Scrollable Body */}
                  <div
                    className="max-h-[250px] overflow-y-auto custom-scrollbar"
                  >
                    <table className="w-full text-left table-fixed">
                      <tbody className="divide-y divide-[#3A2C2B]/5">
                        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-white transition-colors group">
                            <td className="w-[20%] px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-black text-sm text-[#3A2C2B]">{task.title}</span>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <Badge variant="outline" className={cn(
                                    "text-[8px] font-black uppercase rounded-lg border-none px-2 py-0.5",
                                    task.type === 'Assignment' ? "bg-blue-100 text-blue-700" :
                                      task.type === 'Quiz' ? "bg-amber-100 text-amber-700" :
                                        "bg-purple-100 text-purple-700"
                                  )}>
                                    {task.type}
                                  </Badge>
                                  {task.hasMaterials && <Paperclip className="w-3 h-3 opacity-20" />}
                                  {task.hasLinks && <ExternalLink className="w-3 h-3 opacity-20" />}
                                </div>
                              </div>
                            </td>
                            <td className="w-[15%] px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-[#3A2C2B]/80">{task.sub}</span>
                                <span className="text-[9px] font-bold opacity-40 uppercase">{task.class} • Section {task.section}</span>
                              </div>
                            </td>
                            <td className="w-[15%] px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[#3A2C2B]">{task.dueDate}</span>
                                <span className="text-[8px] font-bold opacity-40 uppercase">Created: {task.createdDate}</span>
                              </div>
                            </td>
                            <td className="w-[10%] px-8 py-5">
                              <Badge className={cn(
                                "text-[8px] font-black uppercase border-none px-3",
                                task.status === 'Published' ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-500"
                              )}>
                                {task.status}
                              </Badge>
                            </td>
                            <td className="w-[25%] px-8 py-5">
                              <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                                <div className="flex items-center justify-between text-[9px] font-black uppercase">
                                  <span>{task.submissions.submitted}/{task.submissions.total}</span>
                                  <span className="opacity-40">{Math.round((task.submissions.submitted / task.submissions.total) * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-[#3A2C2B]/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${(task.submissions.submitted / task.submissions.total) * 100}%` }}
                                  />
                                </div>
                                <div className="flex gap-2 text-[7px] font-black uppercase opacity-40">
                                  <span>Pending: {task.submissions.pending}</span>
                                </div>
                              </div>
                            </td>
                            <td className="w-[15%] px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => { 
                                  setSelectedTaskForView(task); 
                                  setTaskViewMode('details');
                                  setShowTaskDetailsModal(true); 
                                }}>
                                  <Eye className="w-4 h-4 opacity-40 hover:opacity-100" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => openEditModal(task)}>
                                  <Edit2 className="w-4 h-4 opacity-40 hover:opacity-100" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => togglePublishStatus(task.id)}>
                                  {task.status === 'Published' ? <X className="w-4 h-4 opacity-40 hover:opacity-100 text-red-500" /> : <CheckCircle2 className="w-4 h-4 opacity-40 hover:opacity-100 text-green-500" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => { setTaskToDelete(task.id); setShowDeleteConfirm(true); }}>
                                  <Trash2 className="w-4 h-4 opacity-40 hover:opacity-100 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-3 opacity-20">
                                <ClipboardList className="w-12 h-12" />
                                <p className="text-sm font-black uppercase">No tasks found matching filters</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Standard Pagination Footer */}
              <div className="px-8 py-4 border-t border-[#3A2C2B]/10 flex items-center justify-between bg-white/50">
                <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                  Showing <span className="text-[#3A2C2B] font-black">{filteredTasks.length}</span> entries
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
            ) : (
              <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
                {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex-none w-[300px] group rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border border-white/5"
                    onClick={() => {
                      setSelectedTaskForView(task);
                      setTaskViewMode('details');
                      setShowTaskDetailsModal(true);
                    }}
                  >
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary shadow-inner ring-4 ring-white/5">
                          {task.type === 'Quiz' ? <BarChart3 className="w-6 h-6" /> : task.type === 'Assignment' ? <ClipboardList className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                        </div>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase border-none px-3 py-1 rounded-lg shadow-sm",
                          task.status === 'Published' ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                        )}>
                          {task.status}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white leading-tight line-clamp-2 uppercase tracking-tighter">{task.title}</h3>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{task.sub} • {task.class}</p>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Due Date</p>
                          <p className="text-[11px] font-black text-white">{task.dueDate}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Section</p>
                          <p className="text-[11px] font-black text-white">{task.section}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-white/40">
                          <span>Submissions</span>
                          <span>{Math.round((task.submissions.submitted / task.submissions.total) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${(task.submissions.submitted / task.submissions.total) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[7px] font-black uppercase text-white/20">
                          <span>Target: {task.submissions.total}</span>
                          <span>Pending: {task.submissions.pending}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-10 flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-white/80"
                           onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                         >
                           Edit
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-10 flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-white/80"
                           onClick={(e) => { e.stopPropagation(); setSelectedTaskForView(task); setShowTaskDetailsModal(true); }}
                         >
                           View
                         </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="w-full py-20 text-center opacity-20">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-white" />
                    <p className="text-xs font-black uppercase text-white">No tasks found matching filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* MODALS */}

      {/* 1. Create Subject Modal */}
      <Modal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        title="Create New Subject"
        description="Add a primary subject to the school curriculum"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Subject Name</label>
              <Input placeholder="e.g. Advanced Calculus" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Subject Code</label>
              <Input placeholder="e.g. MATH-102" value={newSubCode} onChange={(e) => setNewSubCode(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Target Class</label>
              <Select
                options={[
                  { label: 'All Classes', value: 'All Classes' },
                  { label: 'Class 9', value: 'Class 9' },
                  { label: 'Class 10', value: 'Class 10' },
                  { label: 'Class 11', value: 'Class 11' },
                  { label: 'Class 12', value: 'Class 12' },
                ]}
                value={newSubClass}
                onChange={(val) => setNewSubClass(val)}
                placeholder="Select Class"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Department</label>
              <Select
                options={[
                  { label: 'Science', value: 'Science' },
                  { label: 'Commerce', value: 'Commerce' },
                  { label: 'Arts', value: 'Arts' },
                  { label: 'General', value: 'General' },
                ]}
                value={newSubDept}
                onChange={(val) => setNewSubDept(val)}
                placeholder="Select Dept"
              />
            </div>
          </div>

          <Button
            onClick={() => {
              if (newSubName && newSubCode) {
      setGlobalSubjects([...globalSubjects, { name: newSubName, code: newSubCode, dept: newSubDept, classLevel: newSubClass }]);
                setNewSubName('');
                setNewSubCode('');
                setShowSubjectModal(false);
              }
            }}
            className="w-full h-14 bg-[#3A2C2B] text-white font-black uppercase text-xs rounded-2xl mt-4 shadow-xl shadow-[#3A2C2B]/10"
          >
            CREATE & LINK SUBJECT
          </Button>
        </div>
      </Modal>

      {/* 2. Create Course Modal */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title="Establish New Course"
        description="Define a specific course under a subject"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60">Course Name</label>
            <Input placeholder="e.g. Integration & Derivatives" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Target Class</label>
              <Select
                options={[
                  { label: 'Class 9', value: 'Class 9' },
                  { label: 'Class 10', value: 'Class 10' },
                  { label: 'Class 11', value: 'Class 11' },
                  { label: 'Class 12', value: 'Class 12' },
                ]}
                onChange={(val) => {
                  setCourseClass(val);
                  if (!val.includes('11') && !val.includes('12')) {
                    setCourseDept('General');
                  }
                }}
                placeholder="Select Class"
              />
            </div>
            {(courseClass.includes('11') || courseClass.includes('12')) && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                <label className="text-[10px] font-black uppercase opacity-60">Department</label>
                <Select
                  options={[
                    { label: 'Science', value: 'Science' },
                    { label: 'Commerce', value: 'Commerce' },
                    { label: 'Arts', value: 'Arts' },
                  ]}
                  onChange={(val) => setCourseDept(val)}
                  placeholder="Select Dept"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60">Select Subject (Fetched from Curriculum)</label>
            <Select
              value={courseSubject}
              options={
                globalClasses
                  .filter(c => c.name === courseClass && (courseClass.includes('11') || courseClass.includes('12') ? c.dept === courseDept : true))
                  .flatMap(c => c.subjects)
                  .map(s => ({ label: s, value: s }))
              }
              placeholder={courseClass ? "Select Subject" : "Please select a class first"}
              onChange={(val) => setCourseSubject(val)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Duration</label>
              <Input placeholder="e.g. 6 Months" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Level</label>
              <Select options={[{ label: 'Beginner', value: 'beg' }, { label: 'Intermediate', value: 'int' }, { label: 'Advanced', value: 'adv' }]} />
            </div>
          </div>

          <Button onClick={() => setShowCourseModal(false)} className="w-full h-14 bg-[#3A2C2B] text-white font-black uppercase text-xs rounded-2xl mt-4 shadow-xl shadow-[#3A2C2B]/10">
            INITIALIZE COURSE
          </Button>
        </div>
      </Modal>


      {/* 4. Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); resetTaskForm(); }}
        title={isEditingTask ? "Edit Academic Task" : "Assign Academic Task"}
        description={isEditingTask ? "Update existing task details and settings" : "Create an assignment, homework, or quiz with materials and external links"}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Task Type</label>
              <Select
                value={taskClassification}
                options={[
                  { label: 'Assignment', value: 'Assignment' },
                  { label: 'Quiz', value: 'Quiz' },
                  { label: 'Class Project', value: 'Project' },
                  { label: 'Exam Paper', value: 'Exam' },
                ]}
                onChange={handleClassificationChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Subject</label>
              <Select
                options={globalSubjects.map(s => ({ label: s.name, value: s.name }))}
                placeholder="Select Subject"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60">Title / Topic Name</label>
            <Input placeholder="e.g. Introduction to Organic Chemistry" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Due Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Total Marks</label>
              <Input type="number" placeholder="100" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60">Task Description & Instructions</label>
            <textarea
              className="w-full h-32 rounded-2xl bg-[#3A2C2B]/5 border-none p-4 text-xs font-medium focus:ring-2 ring-primary/20 transition-all outline-none resize-none"
              placeholder="Provide detailed instructions for the students..."
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60">Resource Material (Optional)</label>
            <Button variant="outline" className="w-full h-14 border-dashed border-2 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-[#3A2C2B]/5">
              <Upload className="w-5 h-5 text-[#3A2C2B]/40" />
              <span className="text-[10px] font-black uppercase">Attach Question Paper / Docs</span>
            </Button>
          </div>

          <Button onClick={() => setShowTaskModal(false)} className="w-full h-14 bg-[#3A2C2B] text-white font-black uppercase text-xs rounded-2xl mt-4 shadow-xl shadow-[#3A2C2B]/10">
            {isEditingTask ? 'UPDATE TASK' : 'PUBLISH TASK'}
          </Button>
        </div>
      </Modal>

      {/* 5. Create Lesson Modal */}
      <Modal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        title="Create New Lesson"
        description="Structure a new lesson plan and associate it with a course"
      >
        <div className="space-y-4 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60">Lesson Title</label>
            <Input placeholder="e.g. Introduction to Trigonometry" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Select Course</label>
              <Select options={[{ label: 'Mathematics II', value: 'm2' }]} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Sequence Order</label>
              <Input type="number" placeholder="1" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-60">Lesson Objectives</label>
            <Textarea placeholder="What will students learn in this session?" />
          </div>
          <Button onClick={() => setShowLessonModal(false)} className="w-full h-12 bg-[#3A2C2B] text-white font-black uppercase text-[10px] rounded-2xl mt-4">PUBLISH LESSON PLAN</Button>
        </div>
      </Modal>

      {/* 5. Materials View Modal */}
      <Modal
        isOpen={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        title="Lesson Materials"
        description="Access and read study resources for this lesson"
      >
        <div className="space-y-4 p-2">
          <div className="p-4 bg-[#3A2C2B] rounded-[32px] text-white">
            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Active Lesson</p>
            <h4 className="text-lg font-black uppercase tracking-tight">{selectedLessonMaterials?.title || 'Selected Lesson'}</h4>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Introduction_to_Trig.pdf', type: 'PDF', size: '2.4 MB' },
              { name: 'Lecture_Slides_V1.pptx', type: 'PPT', size: '5.1 MB' },
              { name: 'Advanced_Problems.pdf', type: 'PDF', size: '1.2 MB' },
            ].map((file, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border/10 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#3A2C2B]">{file.name}</p>
                    <p className="text-[9px] font-bold opacity-40 uppercase">{file.type} • {file.size}</p>
                  </div>
                </div>
                <Button size="sm" className="rounded-xl h-8 text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all">READ</Button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-[32px] bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase">Video Lecture</span>
            </div>
            <p className="text-[11px] font-medium text-[#3A2C2B]/80 mb-3">Watch the recorded session for this chapter on our streaming platform.</p>
            <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/10 text-[10px] font-black uppercase">WATCH VIDEO</Button>
          </div>
        </div>
      </Modal>

      {/* 5. Create/Edit Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); resetTaskForm(); }}
        title={isEditingTask ? "Edit Academic Task" : "Assign Academic Task"}
        description={isEditingTask ? "Update existing task details and settings" : "Create an assignment, homework, or quiz with materials and external links"}
      >
        <div className="space-y-6 p-1 pr-2">
          {/* Step 1: Classification */}
          <div className="p-4 bg-[#3A2C2B]/5 rounded-2xl border border-[#3A2C2B]/10">
            <label className="text-[10px] font-black uppercase opacity-60 block mb-3">Step 1 — Task Classification</label>
            <div className="grid grid-cols-3 gap-3">
              {['Homework', 'Assignment', 'Quiz'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleClassificationChange(type)}
                  disabled={isEditingTask}
                  className={cn(
                    "h-12 rounded-xl text-[10px] font-black uppercase transition-all border",
                    taskClassification === type
                      ? "bg-[#3A2C2B] text-white border-[#3A2C2B] shadow-lg shadow-[#3A2C2B]/20"
                      : "bg-white text-[#3A2C2B] border-border/50 hover:bg-[#3A2C2B]/5",
                    isEditingTask && taskClassification !== type && "opacity-20 cursor-not-allowed"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Academic Target Selection */}
          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black uppercase opacity-60 block">Step 2 — Academic Target Selection</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40">Academic Year</label>
                <Select
                  value={taskYear}
                  options={[{ label: '2024-25', value: '2024-25' }, { label: '2025-26', value: '2025-26' }]}
                  onChange={(val) => setTaskYear(val)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40">Department</label>
                <Select
                  value={taskDept}
                  options={['General', 'Science', 'Commerce', 'Arts'].map((d: string) => ({ label: d, value: d }))}
                  onChange={(val) => setTaskDept(val)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40">Class</label>
                <Select
                  value={taskClass}
                  options={Array.from(new Set(globalClasses.map(c => c.name))).map(c => ({ label: c, value: c }))}
                  onChange={(val) => { setTaskClass(val); setTaskSections([]); setTaskSubject(''); }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40">Subject</label>
                <Select
                  value={taskSubject}
                  options={taskClass ? (globalClasses.find(c => c.name === taskClass)?.subjects || []).map((s: string) => ({ label: s, value: s })) : []}
                  onChange={(val) => setTaskSubject(val)}
                  placeholder={taskClass ? "Select Subject" : "Select Class first"}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[9px] font-black uppercase opacity-40">Assign Sections (Select Multiple)</label>
              <div className="flex flex-wrap gap-2">
                {['A', 'B', 'C', 'D'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (taskSections.includes(s)) {
                        setTaskSections(taskSections.filter(x => x !== s));
                      } else {
                        setTaskSections([...taskSections, s]);
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border",
                      taskSections.includes(s)
                        ? "bg-[#3A2C2B] text-white border-[#3A2C2B] shadow-lg shadow-[#3A2C2B]/10"
                        : "bg-white text-[#3A2C2B] border-border/50 hover:bg-[#3A2C2B]/5 opacity-40"
                    )}
                  >
                    Section {s}
                  </button>
                ))}
              </div>
              {!taskClass && <p className="text-[8px] font-bold text-amber-600 uppercase">Select a class to enable sections</p>}
            </div>
          </div>

          {/* Step 3: Task Details */}
          {taskClassification !== 'Quiz' && (
            <div className="space-y-4 pt-2 border-t border-border/10">
              <label className="text-[10px] font-black uppercase opacity-60 block">Step 3 — Task Details</label>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40">Task Title</label>
                <Input
                  placeholder="e.g. Weekly Calculus Problem Set"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40">Description</label>
                <Textarea
                  placeholder="Brief summary of the task..."
                  className="min-h-[80px]"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40">Instructions</label>
                <Textarea
                  placeholder="Detailed step-by-step instructions for students..."
                  className="min-h-[120px]"
                  value={taskInstructions}
                  onChange={(e) => setTaskInstructions(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40">Due Date</label>
                  <Input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40">Publish Status</label>
                  <Select
                    value={taskPublishStatus}
                    options={[{ label: 'Draft', value: 'Draft' }, { label: 'Published', value: 'Published' }]}
                    onChange={(val) => setTaskPublishStatus(val)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quiz CTA removed - direct navigation implemented above */}

          {/* Step 4: Attachments (Hidden for Quiz) */}
          {taskClassification !== 'Quiz' && (
            <div className="space-y-4 pt-2 border-t border-border/10">
              <label className="text-[10px] font-black uppercase opacity-60 block">Step 4 — Attachments & Resources</label>

              <div className="space-y-4">
                {/* Link Adder */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-10">
                    <Input
                      placeholder="Reference Link (URL)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      onClick={() => {
                        if (newLinkUrl) {
                          setTaskLinks([...taskLinks, { label: 'Resource', url: newLinkUrl }]);
                          setNewLinkUrl('');
                        }
                      }}
                      className="w-full h-10 rounded-xl"
                      variant="secondary"
                    >
                      ADD
                    </Button>
                  </div>
                </div>

                {/* Upload Simulation */}
                <div className="relative group">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setTaskMaterials([...taskMaterials, { name: e.target.files[0].name, size: (e.target.files[0].size / 1024 / 1024).toFixed(1) + ' MB' }]);
                    }
                  }} />
                  <div className="h-24 border-2 border-dashed border-border/30 rounded-[32px] flex flex-col items-center justify-center gap-1 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                    <Upload className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
                    <span className="text-[10px] font-black uppercase opacity-40">Drop task materials here</span>
                  </div>
                </div>

                {/* Display Materials */}
                {taskMaterials.length > 0 && (
                  <div className="space-y-2">
                    {taskMaterials.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/10">
                        <div className="flex items-center gap-3">
                          <File className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-[10px] font-black">{file.name}</p>
                            <p className="text-[8px] font-bold opacity-40">{file.size}</p>
                          </div>
                        </div>
                        <button onClick={() => setTaskMaterials(taskMaterials.filter((_, idx) => idx !== i))}>
                          <X className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={taskClassification === 'Quiz' ? () => navigate('/academics/quiz-builder') : (isEditingTask ? handleEditTask : handleCreateTask)}
            disabled={taskClassification !== 'Quiz' && (!taskTitle || !taskClass || !taskSubject)}
            className="w-full h-14 bg-[#3A2C2B] text-white font-black uppercase text-xs rounded-[32px] mt-4 shadow-xl shadow-[#3A2C2B]/10 disabled:opacity-20"
          >
            {taskClassification === 'Quiz' ? 'OPEN QUIZ BUILDER' : (isEditingTask ? 'UPDATE TASK' : 'CREATE & SAVE TASK')}
          </Button>
        </div>
      </Modal>


      {/* 6. Add/Edit Class Modal */}
      <Modal
        isOpen={showClassModal}
        onClose={() => {
          setShowClassModal(false);
          setEditingClass(null);
          setSelectedPhysicalClassId('');
        }}
        title={editingClass ? `Edit Class - ${editingClass.name}` : "Fill Class Details"}
        description="Configure class details, departments, and subject-teacher mapping"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => {
              setShowClassModal(false);
              setEditingClass(null);
              setSelectedPhysicalClassId('');
            }} className="rounded-xl font-black text-[10px] uppercase">Cancel</Button>
            <Button onClick={() => {
              setShowClassModal(false);
              setEditingClass(null);
              setSelectedPhysicalClassId('');
            }} className="rounded-xl font-black text-[10px] uppercase bg-[#3A2C2B] text-white h-10 px-6">
              {editingClass ? "Save Changes" : "Save Class"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Select Base Class (From Physical Structure)</label>
              <Select 
                options={mockPhysicalClasses.map(c => ({ label: `${c.name} - Section ${c.section} (${c.department}) - Room ${c.room}`, value: c.id }))}
                value={selectedPhysicalClassId}
                onChange={setSelectedPhysicalClassId}
                placeholder="Select a class defined in school structure..."
                className="h-12 border-border"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/30">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Curriculum Subjects</label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  {(() => {
                    const selectedClass = mockPhysicalClasses.find(c => c.id === selectedPhysicalClassId);
                    const filteredSubjects = globalSubjects.filter(s => {
                      if (!selectedClass) return true;
                      const matchesClass = s.classLevel === 'All Classes' || s.classLevel === selectedClass.name || s.classLevel === `Class ${selectedClass.name}`;
                      const matchesDept = s.dept === 'General' || s.dept === selectedClass.department;
                      return matchesClass && matchesDept;
                    });
                    
                    return (
                      <Select
                        options={filteredSubjects.map(s => ({ label: s.name, value: s.name }))}
                        placeholder="Select Subject"
                        className="h-12 border-border"
                        onChange={(val) => {
                          setSubjectInput(val);
                          const matchingSub = globalSubjects.find(s => s.name === val);
                          if (matchingSub) setSubjectCodeInput(matchingSub.code);
                        }}
                      />
                    );
                  })()}
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Sub. Code"
                    value={subjectCodeInput}
                    readOnly
                    className="rounded-xl h-12 bg-muted/20 opacity-70"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    onClick={() => {
                      if (subjectInput.trim()) {
                        // Prevent duplicates
                        if (subjectsList.find(s => s.name === subjectInput)) return;
                        setSubjectsList([...subjectsList, { name: subjectInput.trim(), code: subjectCodeInput.trim(), teachers: [] }]);
                        setSubjectInput('');
                        setSubjectCodeInput('');
                      }
                    }}
                    className="rounded-xl w-full h-12 font-black text-[10px]"
                  >
                    ADD
                  </Button>
                </div>
              </div>
            </div>

            {subjectsList.length > 0 && (
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase opacity-40 italic">Click a subject to assign multiple teachers</p>
                <div className="flex flex-wrap gap-2">
                  {subjectsList.map((sub, idx) => (
                    <div key={idx} className="relative group">
                      <button
                        onClick={() => setAssigningTeacherTo(assigningTeacherTo === idx ? null : idx)}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-[11px] font-black transition-all border-2 flex items-center gap-2",
                          sub.teachers.length > 0
                            ? "bg-[#C37A67]/5 border-[#C37A67]/30 text-[#C37A67]"
                            : "bg-white border-border/50 text-muted-foreground hover:border-[#C37A67]/30"
                        )}
                      >
                        {sub.name} {sub.code && <span className="opacity-40 font-bold ml-1">({sub.code})</span>}
                        {sub.teachers.length > 0 && (
                          <span className="opacity-60 ml-1 font-bold">| {sub.teachers.join(', ')}</span>
                        )}
                      </button>
                      <button
                        onClick={() => setSubjectsList(subjectsList.filter((_, i) => i !== idx))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] shadow-lg"
                      >
                        ×
                      </button>

                      {assigningTeacherTo === idx && (
                        <div className="absolute top-full mt-3 left-0 z-[100] w-72 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border p-5 animate-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/30">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Assign Instructors</span>
                            <Badge className="bg-[#3A2C2B]/5 text-[#3A2C2B] border-none text-[9px]">{sub.name}</Badge>
                          </div>
                          <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {mockTeachers.map((teacher) => {
                              const isSelected = sub.teachers.includes(teacher);
                              return (
                                <button
                                  key={teacher}
                                  onClick={() => {
                                    const newList = [...subjectsList];
                                    if (isSelected) {
                                      newList[idx].teachers = newList[idx].teachers.filter(t => t !== teacher);
                                    } else {
                                      newList[idx].teachers = [...newList[idx].teachers, teacher];
                                    }
                                    setSubjectsList(newList);
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-2.5 text-[11px] font-black rounded-xl transition-all flex items-center justify-between group/item",
                                    isSelected ? "bg-[#3A2C2B] text-white" : "hover:bg-[#3A2C2B]/5 text-muted-foreground"
                                  )}
                                >
                                  {teacher}
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full mt-4 h-10 rounded-xl text-[9px] font-black uppercase border-[#3A2C2B]/10 hover:bg-[#3A2C2B] hover:text-white"
                            onClick={() => setAssigningTeacherTo(null)}
                          >
                            CONFIRM ASSIGNMENT
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(() => {
            const selectedClass = mockPhysicalClasses.find(c => c.id === selectedPhysicalClassId);
            if (!selectedClass) return null;
            return (
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/30 bg-[#3A2C2B]/5 px-6 py-4 rounded-[24px]">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Auto-Fetched Section</label>
                  <p className="text-xs font-black text-[#3A2C2B] uppercase">Section {selectedClass.section}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Auto-Fetched Department</label>
                  <p className="text-xs font-black text-[#3A2C2B] uppercase">{selectedClass.department}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Allocated Room</label>
                  <p className="text-xs font-black text-[#3A2C2B] uppercase">{selectedClass.room}</p>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Head Class Teacher</label>
              <Select value="Fox" options={mockTeachers.map(t => ({ label: t, value: t.split(' ').pop()! }))} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">Max Class Capacity</label>
              <Input type="number" placeholder="40" defaultValue={40} className="rounded-xl h-12" />
            </div>
          </div>
        </div>
      </Modal>

      {/* 7. View Class Subjects Modal */}
      <Modal
        isOpen={showSubjectsViewModal}
        onClose={() => setShowSubjectsViewModal(false)}
        title={`Class Curriculum - ${selectedClassForSubjects?.name}`}
        description="Comprehensive list of subjects and assigned instructors for this grade"
        footer={<Button onClick={() => setShowSubjectsViewModal(false)} className="rounded-xl font-black text-[10px] uppercase h-12 px-8">Dismiss</Button>}
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/50 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-[#C37A67]">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">Subject Name</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">Assigned Teacher(s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {(selectedClassForSubjects?.subjects || [
                  { name: 'Mathematics', teachers: ['Mr. Robert Fox', 'Ms. Eleanor Pena'] },
                  { name: 'Physics', teachers: ['Ms. Jane Cooper'] },
                  { name: 'Quantum Chemistry', teachers: ['Mrs. Sarah Jenkins'] },
                ]).map((sub: any, i: number) => {
                  const subName = typeof sub === 'string' ? sub : sub.name;
                  const teachers = typeof sub === 'string' ? [] : (sub.teachers || []);
                  return (
                    <tr key={i} className="hover:bg-[#3A2C2B]/2 transition-colors">
                      <td className="px-8 py-5 font-black text-xs text-[#3A2C2B]">{subName}</td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {teachers.map((t: string, ti: number) => (
                            <Badge key={ti} className="bg-[#3A2C2B]/5 text-[#3A2C2B] border-none text-[9px] font-black px-3 py-1 rounded-lg">
                              {t}
                            </Badge>
                          ))}
                          {teachers.length === 0 && (
                            <span className="text-[9px] font-bold opacity-30 uppercase italic">No Instructor Assigned</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 8. View Task Details Modal */}
      <Modal
        isOpen={showTaskDetailsModal}
        onClose={() => setShowTaskDetailsModal(false)}
        title={taskViewMode === 'details' ? "Task Overview" : "Answer Key & Questions"}
        description={taskViewMode === 'details' ? "Detailed information about the assigned academic task" : "Correct solutions and grading benchmarks for this assessment"}
      >
        <div className="space-y-6 p-2">
          {/* View Toggle */}
          {selectedTaskForView?.type === 'Quiz' && (
            <div className="flex bg-[#3A2C2B]/5 p-1 rounded-2xl mb-4">
              <button 
                onClick={() => setTaskViewMode('details')}
                className={cn(
                  "flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all",
                  taskViewMode === 'details' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]"
                )}
              >
                Task Details
              </button>
              <button 
                onClick={() => setTaskViewMode('answers')}
                className={cn(
                  "flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all",
                  taskViewMode === 'answers' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]"
                )}
              >
                Question with Answer Key
              </button>
            </div>
          )}

          {taskViewMode === 'details' ? (
            <>
              {/* Header Info */}
              <div className="p-6 bg-[#3A2C2B] rounded-[32px] text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase rounded-lg border-none px-3 py-1",
                      selectedTaskForView?.type === 'Assignment' ? "bg-blue-500 text-white" :
                        selectedTaskForView?.type === 'Quiz' ? "bg-amber-500 text-white" :
                          "bg-purple-500 text-white"
                    )}>
                      {selectedTaskForView?.type}
                    </Badge>
                    <span className="text-[10px] font-black uppercase opacity-60">Due: {selectedTaskForView?.dueDate}</span>
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight">{selectedTaskForView?.title}</h4>
                  <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-widest">{selectedTaskForView?.sub} Curriculum</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-[#f9f9f9] border border-border/10">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Class & Sec</p>
                  <p className="text-xs font-black text-[#3A2C2B]">{selectedTaskForView?.class} - {selectedTaskForView?.section}</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#f9f9f9] border border-border/10">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Department</p>
                  <p className="text-xs font-black text-[#3A2C2B]">{selectedTaskForView?.dept || 'General'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#f9f9f9] border border-border/10">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Total Marks</p>
                  <p className="text-xs font-black text-primary">{selectedTaskForView?.quizConfig?.marks || 100} PTS</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#f9f9f9] border border-border/10">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Duration</p>
                  <p className="text-xs font-black text-[#3A2C2B]">{selectedTaskForView?.quizConfig?.duration || 30} MINS</p>
                </div>
              </div>

              {/* Timing Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#3A2C2B]/5 border border-[#3A2C2B]/10">
                   <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-primary" />
                      <p className="text-[8px] font-black uppercase opacity-40">Start Window</p>
                   </div>
                   <p className="text-xs font-black text-[#3A2C2B]">{selectedTaskForView?.quizConfig?.startTime || '24 May 2026, 10:00 AM'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#3A2C2B]/5 border border-[#3A2C2B]/10">
                   <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <p className="text-[8px] font-black uppercase opacity-40">Auto-End Time</p>
                   </div>
                   <p className="text-xs font-black text-[#3A2C2B]">{selectedTaskForView?.quizConfig?.endTime || '24 May 2026, 10:45 AM'}</p>
                </div>
              </div>

              {/* Description / Instructions */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-40">Task Instructions</label>
                <div className="p-5 rounded-[32px] bg-white border border-border/20 shadow-sm">
                  <p className="text-xs font-medium leading-relaxed text-[#3A2C2B]/80 whitespace-pre-wrap">
                    {selectedTaskForView?.instructions || selectedTaskForView?.description || "No specific instructions provided for this task."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {[
                 { q: "1. What is the fundamental theorem of calculus?", a: "It establishes the connection between differentiation and integration." },
                 { q: "2. Solve for x: 2x + 5 = 15", a: "x = 5" },
                 { q: "3. Define a vector space.", a: "A vector space is a collection of objects called vectors, which may be added together and multiplied by scalars." },
                 { q: "4. What is the capital of France?", a: "Paris" },
               ].map((item, idx) => (
                 <div key={idx} className="p-4 rounded-2xl bg-white border border-border/10 space-y-2">
                    <p className="text-xs font-black text-[#3A2C2B]">{item.q}</p>
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                       <p className="text-[10px] font-black text-green-700 uppercase mb-1">Correct Answer</p>
                       <p className="text-[11px] font-medium text-green-800">{item.a}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}

          <Button
            onClick={() => setShowTaskDetailsModal(false)}
            className="w-full h-14 bg-[#3A2C2B] text-white font-black uppercase text-xs rounded-2xl mt-4 shadow-xl shadow-[#3A2C2B]/10"
          >
            DISMISS VIEW
          </Button>
        </div>
      </Modal>

      {/* 9. Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this task? This action cannot be undone and will remove all student submission references."
      >
        <div className="space-y-6 p-2 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm font-medium text-[#3A2C2B]/60">
            Deleting this task will permanently remove it from the system.
            Historical submission summaries will be preserved in audit logs.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setShowDeleteConfirm(false)}>CANCEL</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 font-black uppercase text-[10px]" onClick={handleDeleteTask}>DELETE TASK</Button>
          </div>
        </div>
      </Modal>

      {/* 10. Unpublish Confirmation Modal */}
      <Modal
        isOpen={showUnpublishConfirm}
        onClose={() => setShowUnpublishConfirm(false)}
        title="Confirm Unpublish"
        description="Moving this task back to Draft status"
      >
        <div className="space-y-6 p-2 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-sm font-medium text-[#3A2C2B]/60">
            Unpublishing this task will hide it from students immediately.
            Any active submissions will be paused.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setShowUnpublishConfirm(false)}>CANCEL</Button>
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl h-12 font-black uppercase text-[10px]" onClick={confirmUnpublish}>UNPUBLISH</Button>
          </div>
        </div>
      </Modal>

      {/* 11. Audit Log Modal */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Task Audit Trail"
        description="Historical log of all academic task lifecycle events"
      >
        <div className="space-y-4">
          {auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#3A2C2B]/5 border border-[#3A2C2B]/10 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      log.action.includes('Created') ? "bg-green-100 text-green-600" :
                        log.action.includes('Deleted') ? "bg-red-100 text-red-600" :
                          log.action.includes('Published') ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                    )}>
                      <HistoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#3A2C2B]">{log.action}: {log.taskRef}</p>
                      <p className="text-[9px] font-bold opacity-40 uppercase">User: System Admin</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black opacity-40 uppercase whitespace-nowrap">{log.timestamp}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center opacity-20">
              <HistoryIcon className="w-12 h-12 mx-auto mb-3" />
              <p className="text-xs font-black uppercase">No activity recorded yet</p>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default AcademicContentPage;
