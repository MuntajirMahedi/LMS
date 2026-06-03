import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Search,
  Users,
  AlertCircle,
  ChevronRight,
  Plus,
  BarChart3,
  MoreVertical,
  ExternalLink,
  ArrowRight,
  LayoutGrid,
  List,
  Trash2,
  ClipboardList,
  Eye,
  Edit2,
  Paperclip,
  Upload,
  X,
  File as FileIcon
} from 'lucide-react';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { getStorageData, setStorageData } from '../lib/storage';

// --- MOCK DATA ---

const ASSIGNMENTS_STORAGE_KEY = 'school_assignments_tasks';
const ASSIGNMENTS_AUDIT_LOGS_KEY = 'school_assignments_audit_logs';
const ASSIGNMENTS_TASK_DRAFTS_KEY = 'school_assignments_task_drafts';
const ASSIGNMENTS_SUBMITTED_TASK_IDS_KEY = 'school_assignments_submitted_task_ids';

const EMPTY_TASK_DRAFTS = {
  Homework: null,
  Assignment: null,
  Quiz: null
};

const ASSIGNMENTS_MOCK = [
  {
    id: 'ASG001',
    title: 'The Great Gatsby Analysis',
    type: 'Assignment',
    subject: 'English Literature',
    class: 'Class 12',
    section: 'A',
    dept: 'Science',
    dueDate: '2026-05-20',
    createdDate: '2026-05-10',
    totalPoints: 100,
    submissions: { total: 40, submitted: 32, pending: 8 },
    status: 'Published',
    description: 'Analyze the symbolism of the green light in F. Scott Fitzgerald\'s The Great Gatsby.',
    hasMaterials: true,
    attachments: ['Essay_Guidelines.pdf']
  },
  {
    id: 'HWK001',
    title: 'Organic Chemistry Practice',
    type: 'Homework',
    subject: 'Chemistry',
    class: 'Class 11',
    section: 'B',
    dept: 'Science',
    dueDate: '2026-05-18',
    createdDate: '2026-05-12',
    totalPoints: 50,
    submissions: { total: 35, submitted: 15, pending: 20 },
    status: 'Published',
    description: 'Complete the reaction mechanisms for the provided hydrocarbons.',
    hasMaterials: false,
    attachments: []
  },
  {
    id: 'QZ001',
    title: 'Calculus Fundamentals',
    type: 'Quiz',
    subject: 'Mathematics',
    class: 'Class 12',
    section: 'A',
    dept: 'Science',
    dueDate: '2026-05-15',
    createdDate: '2026-05-08',
    totalPoints: 50,
    submissions: { total: 40, submitted: 38, pending: 2 },
    status: 'Published',
    description: 'Covers limits, continuity, and basic differentiation.',
    quizConfig: { marks: 50, duration: 30, attempts: 1, passingMarks: 20 },
    hasMaterials: false,
    attachments: []
  },
  {
    id: 'ASG002',
    title: 'Newtonian Laws Lab',
    type: 'Assignment',
    subject: 'Physics',
    class: 'Class 11',
    section: 'A',
    dept: 'Science',
    dueDate: '2026-05-22',
    createdDate: '2026-05-14',
    totalPoints: 100,
    submissions: { total: 30, submitted: 10, pending: 20 },
    status: 'Draft',
    description: 'Verify Newton\'s second law using the air track experiment.',
    hasMaterials: true,
    attachments: ['Physics_Lab_Manual.pdf']
  },
  {
    id: 'HWK002',
    title: 'French Vocabulary Set',
    type: 'Homework',
    subject: 'Foreign Language',
    class: 'Class 10',
    section: 'C',
    dept: 'Science',
    dueDate: '2026-05-25',
    createdDate: '2026-05-15',
    totalPoints: 20,
    submissions: { total: 45, submitted: 40, pending: 5 },
    status: 'Published',
    description: 'Practice the new vocabulary related to travel and food.',
    hasMaterials: false,
    attachments: []
  },
  {
    id: 'ASG003',
    title: 'Modern Art History',
    type: 'Assignment',
    subject: 'History',
    class: 'Class 12',
    section: 'B',
    dept: 'Science',
    dueDate: '2026-06-05',
    createdDate: '2026-05-15',
    totalPoints: 100,
    submissions: { total: 32, submitted: 28, pending: 4 },
    status: 'Published',
    description: 'Analysis of impressionism and its impact on modern art.',
    hasMaterials: true,
    attachments: ['Art_History_Rubric.pdf']
  },
  {
    id: 'QZ002',
    title: 'Data Structures Quiz',
    type: 'Quiz',
    subject: 'Computer Science',
    class: 'Class 11',
    section: 'A',
    dept: 'Science',
    dueDate: '2026-05-30',
    createdDate: '2026-05-20',
    totalPoints: 30,
    submissions: { total: 40, submitted: 35, pending: 5 },
    status: 'Published',
    description: 'Assessment on Arrays, Linked Lists and Stacks.',
    quizConfig: { marks: 30, duration: 20, attempts: 1, passingMarks: 12 },
    hasMaterials: false,
    attachments: []
  },
  {
    id: 'HWK003',
    title: 'Linear Equations Set',
    type: 'Homework',
    subject: 'Mathematics',
    class: 'Class 10',
    section: 'B',
    dueDate: '2026-05-28',
    createdDate: '2026-05-18',
    totalPoints: 20,
    submissions: { total: 38, submitted: 30, pending: 8 },
    status: 'Published',
    description: 'Solve the word problems from section 3.4.',
    hasMaterials: false,
    attachments: []
  },
  {
    id: 'ASG004',
    title: 'Global Warming Report',
    type: 'Assignment',
    subject: 'Environmental Science',
    class: 'Class 10',
    section: 'A',
    dueDate: '2026-06-10',
    createdDate: '2026-05-22',
    totalPoints: 100,
    submissions: { total: 40, submitted: 15, pending: 25 },
    status: 'Published',
    description: 'Detailed report on the causes and effects of global warming.',
    hasMaterials: true,
    attachments: ['Report_Template.docx']
  },
  {
    id: 'HWK004',
    title: 'Cell Biology Review',
    type: 'Homework',
    subject: 'Biology',
    class: 'Class 11',
    section: 'C',
    dueDate: '2026-06-02',
    createdDate: '2026-05-21',
    totalPoints: 30,
    submissions: { total: 35, submitted: 25, pending: 10 },
    status: 'Published',
    description: 'Review the structure and functions of cell organelles.',
    hasMaterials: false,
    attachments: []
  },
  {
    id: 'HWK005',
    title: 'Thermodynamics Practice Set',
    type: 'Homework',
    subject: 'Physics',
    class: 'Class 12',
    section: 'A',
    dept: 'Science',
    dueDate: '2026-05-14',
    createdDate: '2026-05-06',
    totalPoints: 30,
    submissions: { total: 40, submitted: 36, pending: 4 },
    status: 'Published',
    description: 'Solve the worksheet on heat transfer and the first law of thermodynamics.',
    hasMaterials: true,
    attachments: ['Thermodynamics_Worksheet.pdf']
  },
  {
    id: 'HWK006',
    title: 'Electrostatics Drill',
    type: 'Homework',
    subject: 'Physics',
    class: 'Class 12',
    section: 'A',
    dept: 'Science',
    dueDate: '2026-05-26',
    createdDate: '2026-05-18',
    totalPoints: 25,
    submissions: { total: 40, submitted: 21, pending: 19 },
    status: 'Published',
    description: 'Practice Coulomb law and electric field numericals from the worksheet.',
    hasMaterials: true,
    attachments: ['Electrostatics_Drill.pdf']
  },
  {
    id: 'QZ003',
    title: 'Ancient Civilizations',
    type: 'Quiz',
    subject: 'History',
    class: 'Class 10',
    section: 'B',
    dueDate: '2026-06-05',
    createdDate: '2026-05-24',
    totalPoints: 40,
    submissions: { total: 38, submitted: 30, pending: 8 },
    status: 'Published',
    description: 'Covers Mesopotamia, Egypt, and the Indus Valley Civilization.',
    quizConfig: { marks: 40, duration: 25, attempts: 1, passingMarks: 16 },
    hasMaterials: false,
    attachments: []
  },
  {
    id: 'QZ004',
    title: 'Probability Checkpoint',
    type: 'Quiz',
    subject: 'Mathematics',
    class: 'Class 12',
    section: 'A',
    dept: 'Science',
    dueDate: '2026-05-27',
    createdDate: '2026-05-19',
    totalPoints: 25,
    submissions: { total: 40, submitted: 26, pending: 14 },
    status: 'Published',
    description: 'Quick quiz on conditional probability and Bayes theorem.',
    quizConfig: { marks: 25, duration: 20, attempts: 1, passingMarks: 10 },
    hasMaterials: false,
    attachments: []
  }
];

const STUDENT_SUBMISSIONS = [
  { id: 'SUB001', studentName: 'Alex Mercer', studentId: 'S-8420', status: 'Graded', score: 92, submittedAt: '2026-05-15 10:30 AM', file: 'Gatsby_Essay_Mercer.docx', feedback: 'Excellent analysis of the thematic elements.', quizScore: 45, quizTotal: 50 },
  { id: 'SUB002', studentName: 'Emma Watson', studentId: 'S-8421', status: 'Pending', score: 0, submittedAt: '2026-05-16 02:15 PM', file: 'Gatsby_Essay_Watson.pdf', feedback: '', quizScore: 48, quizTotal: 50 },
  { id: 'SUB003', studentName: 'John Doe', studentId: 'S-8422', status: 'Late', score: 0, submittedAt: '2026-05-19 09:00 AM', file: 'Gatsby_Essay_Doe.docx', feedback: '', quizScore: 38, quizTotal: 50 },
  { id: 'SUB004', studentName: 'Sarah Connor', studentId: 'S-8423', status: 'Not Submitted', score: 0, submittedAt: '-', file: '', feedback: '', quizScore: 0, quizTotal: 50 },
  { id: 'SUB005', studentName: 'Kyle Reese', studentId: 'S-8424', status: 'Not Submitted', score: 0, submittedAt: '-', file: '', feedback: '', quizScore: 0, quizTotal: 50 },
];

const STUDENT_PERFORMANCE_RECORDS: Record<string, { submittedAt: string; scoreLabel: string; released: boolean }> = {
  ASG001: { submittedAt: '2026-05-19', scoreLabel: '92/100', released: true },
  HWK005: { submittedAt: '2026-05-14', scoreLabel: '28/30', released: true },
  QZ001: { submittedAt: '2026-05-15', scoreLabel: '45/50', released: true },
};

export default function AssignmentsPage() {
  const { activeRole } = useAuth();
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState(() => getStorageData(ASSIGNMENTS_STORAGE_KEY, ASSIGNMENTS_MOCK));
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [activeProcessTab, setActiveProcessTab] = useState<'Assignment' | 'Homework' | 'Quiz'>('Assignment');
  const [subTableFilter, setSubTableFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const [availableDepartments] = useState(['General', 'Science', 'Commerce', 'Arts']);
  const [globalClasses] = useState([
    { id: 1, name: 'Class 10', section: 'A', dept: 'General', subjects: ['Mathematics', 'Physics', 'Chemistry', 'English Literature', 'History'] },
    { id: 2, name: 'Class 11', section: 'B', dept: 'Science', subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] },
    { id: 3, name: 'Class 11', section: 'C', dept: 'Commerce', subjects: ['Accountancy', 'Economics', 'Business Studies'] },
    { id: 4, name: 'Class 12', section: 'A', dept: 'Science', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
  ]);

  const handleTabChange = (tab: 'Assignment' | 'Homework' | 'Quiz') => {
    setActiveProcessTab(tab);
    setSelectedHomework(null);
  };

  // Management Hub States
  const [homeworkView, setHomeworkView] = useState<'card' | 'table'>('table');
  const [submittedView, setSubmittedView] = useState<'card' | 'table'>('table');
  const [performanceView, setPerformanceView] = useState<'card' | 'table'>('table');
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [homeworkFilters, setHomeworkFilters] = useState({ type: 'all', class: 'all', section: 'all', sub: 'all', status: 'all', dept: 'all' });

  const isTeacher = activeRole === 'TEACHER' || activeRole === 'SCHOOL_ADMIN' || activeRole === 'SUPER_ADMIN';

  // Action Handlers
  const handleDelete = (id: string) => {
    setTaskToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleEdit = (task: any) => {
    if (task.type === 'Quiz') {
      navigate('/academics/quiz-builder');
      return;
    }
    setIsEditingTask(true);
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskInstructions(task.instructions || '');
    setTaskDueDate(task.dueDate);
    setTaskClassification(task.type);
    setTaskClass(task.class);
    setTaskDept(task.dept || 'General');
    setTaskSections(task.section ? task.section.split(', ') : []);
    setTaskSubject(task.sub || task.subject || '');
    setTaskPublishStatus(task.status);
    setShowHomeworkModal(true);
  };

  const handleTogglePublish = (task: any) => {
    if (task.status === 'Published') {
      setTaskToUnpublish(task.id);
      setShowUnpublishConfirm(true);
    } else {
      setHomeworks(homeworks.map(t => t.id === task.id ? { ...t, status: 'Published' } : t));
      addAuditLog('Task Published', task.title);
    }
  };

  const [taskClassification, setTaskClassification] = useState('Assignment');
  const [isEditingTask, setIsEditingTask] = useState(false);
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
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<number[]>([]);
  const [questionResults, setQuestionResults] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTaskIds, setSubmittedTaskIds] = useState<string[]>(() => getStorageData(ASSIGNMENTS_SUBMITTED_TASK_IDS_KEY, ['ASG001', 'HWK005', 'QZ001']));

  const [taskLinks, setTaskLinks] = useState<{ label: string, url: string }[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [taskMaterials, setTaskMaterials] = useState<{ name: string, size: string }[]>([]);

  const [taskDrafts, setTaskDrafts] = useState<Record<string, any>>(() => getStorageData(ASSIGNMENTS_TASK_DRAFTS_KEY, EMPTY_TASK_DRAFTS));

  useEffect(() => {
    setStorageData(ASSIGNMENTS_STORAGE_KEY, homeworks);
  }, [homeworks]);

  useEffect(() => {
    setStorageData(ASSIGNMENTS_TASK_DRAFTS_KEY, taskDrafts);
  }, [taskDrafts]);

  useEffect(() => {
    setStorageData(ASSIGNMENTS_SUBMITTED_TASK_IDS_KEY, submittedTaskIds);
  }, [submittedTaskIds]);

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
      setShowHomeworkModal(false);
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
    setTaskDrafts(EMPTY_TASK_DRAFTS);
    setIsEditingTask(false);
    setEditingTaskId(null);
  };

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [taskToUnpublish, setTaskToUnpublish] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskForView] = useState<any>(null);

  useEffect(() => {
    setStorageData(ASSIGNMENTS_AUDIT_LOGS_KEY, auditLogs);
  }, [auditLogs]);

  const addAuditLog = (action: string, taskRef: string) => {
    setAuditLogs(prev => [{ action, taskRef, timestamp: new Date().toLocaleString() }, ...prev]);
  };

  const handleCreateTask = () => {
    const newTask = {
      id: 'TASK-' + Date.now(),
      title: taskTitle,
      type: taskClassification,
      subject: taskSubject,
      dept: taskDept,
      class: taskClass,
      section: taskSections.join(', '),
      dueDate: taskDueDate,
      status: taskPublishStatus,
      createdDate: new Date().toLocaleDateString(),
      description: taskDescription,
      instructions: taskInstructions,
      totalPoints: taskClassification === 'Quiz' ? parseInt(quizMarks) : 100,
      submissions: { total: 40, submitted: 0, pending: 40 },
      hasMaterials: taskMaterials.length > 0,
      hasLinks: taskLinks.length > 0,
      attachments: taskMaterials.map(m => m.name),
      quizConfig: taskClassification === 'Quiz' ? {
        marks: parseInt(quizMarks),
        duration: parseInt(quizDuration),
        attempts: parseInt(quizAttempts),
        passingMarks: parseInt(quizPassingMarks)
      } : undefined
    };

    // @ts-ignore
    setHomeworks([newTask, ...homeworks]);
    addAuditLog('Task Created', taskTitle);
    if (taskPublishStatus === 'Published') addAuditLog('Task Published', taskTitle);
    setShowHomeworkModal(false);
    resetTaskForm();
  };

  const handleEditTask = () => {
    // @ts-ignore
    setHomeworks(homeworks.map(t => t.id === editingTaskId ? {
      ...t,
      title: taskTitle,
      type: taskClassification,
      subject: taskSubject,
      dept: taskDept,
      class: taskClass,
      section: taskSections.join(', '),
      dueDate: taskDueDate,
      status: taskPublishStatus,
      description: taskDescription,
      instructions: taskInstructions,
      totalPoints: taskClassification === 'Quiz' ? parseInt(quizMarks) : 100,
      attachments: taskMaterials.map(m => m.name),
      quizConfig: taskClassification === 'Quiz' ? {
        marks: parseInt(quizMarks),
        duration: parseInt(quizDuration),
        attempts: parseInt(quizAttempts),
        passingMarks: parseInt(quizPassingMarks)
      } : undefined
    } : t));
    addAuditLog('Task Updated', taskTitle);
    setShowHomeworkModal(false);
    resetTaskForm();
  };

  const handleDeleteTask = () => {
    setHomeworks(homeworks.filter(t => t.id !== taskToDelete));
    addAuditLog('Task Deleted', 'Task ID: ' + taskToDelete);
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const confirmUnpublish = () => {
    setHomeworks(homeworks.map(t => t.id === taskToUnpublish ? { ...t, status: 'Draft' } : t));
    addAuditLog('Task Unpublished', 'Task ID: ' + taskToUnpublish);
    setShowUnpublishConfirm(false);
    setTaskToUnpublish(null);
  };

  const StatsCard = ({ label, value, color }: any) => {
    const colorMap: Record<string, string> = {
      'bg-primary': 'bg-[#DCD2C3]',
      'bg-brand-purple': 'bg-[#EBBDC2]',
      'bg-brand-green': 'bg-[#BFDDD8]',
      'bg-brand-orange': 'bg-[#F0E0AD]',
      'bg-brand-blue': 'bg-[#B1D3EC]',
      'bg-oat': 'bg-[#DDC4BC]',
    };
    const cardBg = colorMap[color] || 'bg-[#DCD2C3]';

    return (
      <Card className={cn(
        "rounded-[32px] border-none shadow-none overflow-hidden flex flex-col p-4 sm:p-6 transition-all duration-300",
        cardBg
      )}>
        <div className="space-y-1">
          <h3 className="text-3xl sm:text-4xl font-black text-[#3A2C2B] tracking-tight">{value}</h3>
          <p className="text-[8px] sm:text-[10px] font-black text-[#3A2C2B]/40 uppercase tracking-widest sm:tracking-[0.2em] leading-tight pr-2">{label}</p>
        </div>
      </Card>
    );
  };

  // --- SUB-COMPONENTS ---

  const FilterBar = () => (
    <div className="bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-border/10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <Input
            placeholder="Search within Hub..."
            className="pl-12 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none font-bold text-xs w-full focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
            value={homeworkSearch}
            onChange={(e) => setHomeworkSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-[120px]">
            <Select
              value={homeworkFilters.class}
              options={[
                { label: 'All Classes', value: 'all' },
                { label: 'Class 10', value: 'Class 10' },
                { label: 'Class 11', value: 'Class 11' },
                { label: 'Class 12', value: 'Class 12' }
              ]}
              onChange={(val) => setHomeworkFilters({ ...homeworkFilters, class: val })}
              className="bg-[#3A2C2B]/5 border-none h-11 rounded-2xl text-[10px] font-black w-full"
            />
          </div>
          <div className="w-full md:w-[120px]">
            <Select
              value={homeworkFilters.section}
              options={[
                { label: 'All Sections', value: 'all' },
                { label: 'Section A', value: 'A' },
                { label: 'Section B', value: 'B' },
                { label: 'Section C', value: 'C' }
              ]}
              onChange={(val) => setHomeworkFilters({ ...homeworkFilters, section: val })}
              className="bg-[#3A2C2B]/5 border-none h-11 rounded-2xl text-[10px] font-black w-full"
            />
          </div>
          <div className="w-full md:w-[120px]">
            <Select
              value={homeworkFilters.dept}
              options={[
                { label: 'All Depts', value: 'all' },
                { label: 'Science', value: 'Science' },
                { label: 'Commerce', value: 'Commerce' },
                { label: 'Arts', value: 'Arts' }
              ]}
              onChange={(val) => setHomeworkFilters({ ...homeworkFilters, dept: val })}
              className="bg-[#3A2C2B]/5 border-none h-11 rounded-2xl text-[10px] font-black w-full"
            />
          </div>
          <Button
            variant="outline"
            className="w-full md:w-auto h-11 rounded-2xl border-primary/10 px-6 font-black uppercase text-[10px] text-primary hover:bg-primary/5 transition-all whitespace-nowrap"
            onClick={() => setHomeworkFilters({ type: 'all', class: 'all', section: 'all', sub: 'all', status: 'all', dept: 'all' })}
          >
            RESET
          </Button>
        </div>
      </div>
    </div>
  );

  const HomeworkCard = ({ asg, i }: { asg: any, i: number }) => {
    const colorMap: Record<string, string> = {
      'primary': 'bg-[#DCD2C3]',
      'brand-purple': 'bg-[#EBBDC2]',
      'brand-green': 'bg-[#BFDDD8]',
      'brand-orange': 'bg-[#F0E0AD]',
      'brand-blue': 'bg-[#B1D3EC]',
      'oat': 'bg-[#DDC4BC]',
    };
    const colors = ['primary', 'brand-green', 'brand-orange', 'brand-blue', 'brand-purple'];
    const themeKey = colors[i % 5];
    const bgColor = colorMap[themeKey];
    const themeColor = themeKey === 'primary' ? '#C37A67' : themeKey === 'brand-green' ? '#10B981' : themeKey === 'brand-orange' ? '#F59E0B' : themeKey === 'brand-blue' ? '#0369A1' : '#6366F1';

    return (
      <Card className={cn(
        "rounded-[32px] border-none shadow-none overflow-hidden group transition-all h-full w-full flex flex-col relative hover:-translate-y-1 duration-300",
        bgColor
      )}>
        {/* Decorative background image similar to SchoolStructurePage houses */}
        <img
          src="/Work.png"
          alt=""
          className="absolute -right-12 -bottom-12 w-64 h-64 object-contain opacity-20 pointer-events-none z-0"
        />

        <div className="p-8 border-b border-black/5 relative z-10 flex justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex gap-2">
                  <Badge className="bg-[#3A2C2B] text-white border-none rounded-lg font-black text-[8px] uppercase tracking-widest px-3 py-1">
                    {asg.type}
                  </Badge>
                  <Badge variant="outline" className="bg-white/50 text-[#3A2C2B] border-border/20 rounded-lg font-black text-[8px] uppercase tracking-widest px-3 py-1">
                    {asg.subject}
                  </Badge>
                </div>
                {isTeacher && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/50 relative z-20">
                    <MoreVertical className="w-4 h-4 text-[#3A2C2B]/40" />
                  </Button>
                )}
              </div>

              <h3 className="text-xl font-black text-[#3A2C2B] leading-tight mb-4 tracking-tight group-hover:text-primary transition-colors line-clamp-2">{asg.title}</h3>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Due {asg.dueDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{asg.class}-{asg.section}</span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-6 flex-1 flex flex-col relative z-10">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-muted-foreground">{asg.type === 'Quiz' ? 'Attempts' : 'Submissions'}</span>
              <span className="text-[#3A2C2B]">{asg.submissions.submitted} / {asg.submissions.total}</span>
            </div>
            <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${(asg.submissions.submitted / asg.submissions.total) * 100}%`,
                  backgroundColor: themeColor
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-black/5 mt-auto gap-3">
            {isTeacher ? (
              <>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/50" onClick={() => setSelectedHomework(asg)}>
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/50" onClick={() => handleEdit(asg)}>
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/50" onClick={() => handleTogglePublish(asg)}>
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                      asg.status === 'Published' ? "bg-brand-green text-white" : "bg-[#3A2C2B]/10 text-muted-foreground"
                    )}>
                      {asg.status === 'Published' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/50" onClick={() => handleDelete(asg.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
                <Button
                  onClick={() => setSelectedHomework(asg)}
                  variant="outline"
                  className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/50 hover:bg-white"
                >
                  Manage <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </>
            ) : (
              <Button
                className={cn(
                  "w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest tap-scale transition-all-custom",
                  asg.type === 'Quiz' ? "bg-brand-orange text-white" : "bg-primary text-white"
                )}
                onClick={() => setSelectedHomework(asg)}
              >
                {asg.type === 'Quiz' ? 'START QUIZ' : 'SUBMIT WORK'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const HomeworkTable = ({ homeworks, type }: { homeworks: any[], type: 'Assignment' | 'Homework' | 'Quiz' }) => {
    if (homeworks.length === 0) {
      return (
        <Card className="p-6 md:p-12 flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 rounded-[24px] md:rounded-[40px] border-2 border-dashed border-[#3A2C2B]/20 bg-white/50 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#3A2C2B] uppercase tracking-tight">No {type}s Found</h3>
            <p className="text-[10px] font-medium text-muted-foreground italic">Try adjusting your filters or create a new homework to get started.</p>
          </div>
          <Button className="h-9 rounded-xl bg-[#3A2C2B] text-white font-black uppercase text-[9px] px-6 shadow-none">
            <Plus className="w-3 h-3 mr-2" /> CREATE {type.toUpperCase()}
          </Button>
        </Card>
      );
    }

    return (
      <div className="rounded-[32px] border-2 border-[#3A2C2B]/20 shadow-none flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left table-fixed min-w-[1200px]">
            <thead className="bg-[#3A2C2B]">
              <tr className="text-white">
                <th className="w-[30%] px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70">Title & Task Details</th>
                <th className="w-[12%] px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70">Target Group</th>
                <th className="w-[10%] px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70 text-center">Materials</th>
                <th className="w-[12%] px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70 text-center">Due Date</th>
                <th className="w-[10%] px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70 text-center">Status</th>
                <th className="w-[12%] px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70">Progress</th>
                <th className="w-[14%] px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {homeworks.map((task) => (
                <tr key={task.id} className="hover:bg-[#3A2C2B]/[0.02] transition-all group cursor-default">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-sm text-[#3A2C2B] group-hover:text-primary transition-colors">{task.title}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge className={cn(
                          "text-[7px] font-black uppercase border-none px-2 py-0.5 rounded-md",
                          task.type === 'Quiz' ? "bg-[#F0E0AD] text-[#B45309]" : task.type === 'Assignment' ? "bg-[#B1D3EC] text-[#0369A1]" : "bg-[#D1C4E9] text-[#5B21B6]"
                        )}>
                          {task.type}
                        </Badge>
                        {task.hasMaterials && <Paperclip className="w-3 h-3 text-[#3A2C2B] opacity-30" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#3A2C2B]/90 tracking-tight">{task.subject}</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">{task.class} • Section {task.section}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center">
                      {task.hasMaterials ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                          <Paperclip className="w-3 h-3" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                        </div>
                      ) : (
                        <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-[#3A2C2B]">{task.dueDate}</span>
                      <span className="text-[7px] font-bold text-muted-foreground uppercase opacity-60">Pub: {task.createdDate}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", task.status === 'Published' ? "bg-green-500" : "bg-gray-400")} />
                      <span className={cn("text-[8px] font-black uppercase tracking-widest", task.status === 'Published' ? "text-green-600" : "text-gray-500")}>
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5 max-w-[120px]">
                      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tighter">
                        <span className="text-[#3A2C2B]">{task.submissions.submitted}/{task.submissions.total}</span>
                        <span className="text-primary font-black">{Math.round((task.submissions.submitted / task.submissions.total) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-[#3A2C2B]/5 rounded-full overflow-hidden p-[1px]">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 bg-primary"
                          )}
                          style={{ width: `${(task.submissions.submitted / task.submissions.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isTeacher && (
                        <>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all" onClick={() => setSelectedHomework(task)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all" onClick={() => handleEdit(task)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all" onClick={() => handleTogglePublish(task)}>
                            <div className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                              task.status === 'Published' ? "bg-brand-green text-white" : "bg-[#3A2C2B]/10 text-muted-foreground"
                            )}>
                              {task.status === 'Published' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            </div>
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all" onClick={() => handleDelete(task.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-black text-[8px] uppercase tracking-widest px-3 h-8 rounded-xl border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all ml-2"
                        onClick={() => setSelectedHomework(task)}
                      >
                        Manage
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const StudentCompletedState = ({ type }: { type: 'Assignment' | 'Homework' | 'Quiz' }) => {
    const stateConfig = {
      Assignment: {
        title: 'All assignments are finished',
        description: 'There is no pending assignment for you right now.',
      },
      Homework: {
        title: 'All homework is finished',
        description: 'There is no pending homework for you right now.',
      },
      Quiz: {
        title: 'All quizzes are finished',
        description: 'There is no pending quiz for you right now.',
      },
    } as const;

    const { title, description } = stateConfig[type];

    return (
      <div className="px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative overflow-hidden rounded-[40px] border border-[#3A2C2B]/10 px-6 py-12 md:px-10 bg-primary">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <img
              src="/studentdash.png"
              alt="Student Illustration"
              className="w-72 h-auto object-contain"
            />
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              {title}
            </h3>
            <p className="max-w-xl text-sm font-medium text-white/70">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  };


  // --- TEACHER VIEW COMPONENTS ---

  const TeacherOverview = () => (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-transparent shadow-none">
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-end gap-6 px-4">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-end w-full">
              <div className="flex bg-[#3A2C2B]/5 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setHomeworkView('card')}
                  className={cn("p-1.5 rounded-md transition-all", homeworkView === 'card' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setHomeworkView('table')}
                  className={cn("p-1.5 rounded-md transition-all", homeworkView === 'table' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {(() => {
            const filteredHomeworks = homeworks.filter(h => {
              const matchesType = h.type === activeProcessTab;
              const matchesSearch = h.title.toLowerCase().includes(homeworkSearch.toLowerCase()) || h.subject.toLowerCase().includes(homeworkSearch.toLowerCase());
              const matchesClass = homeworkFilters.class === 'all' || h.class === homeworkFilters.class;
              const matchesSection = homeworkFilters.section === 'all' || h.section === homeworkFilters.section;
              const matchesDept = homeworkFilters.dept === 'all' || h.dept === homeworkFilters.dept;

              return matchesType && matchesSearch && matchesClass && matchesSection && matchesDept;
            });

            return homeworkView === 'table' ? (
              <HomeworkTable
                homeworks={filteredHomeworks}
                type={activeProcessTab}
              />
            ) : (
              <div className="flex overflow-x-auto no-scrollbar gap-8 px-4 pb-10 -mx-4 scroll-smooth snap-x snap-mandatory">
                {filteredHomeworks.map((asg, i) => (
                  <div key={asg.id} className="w-[320px] flex-none snap-center flex flex-col">
                    <HomeworkCard asg={asg} i={i} />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Selected Homework Detail / Standalone Sticky Table */}
      {selectedHomework && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500 mt-16 px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-4">
                <Button variant="ghost" className="h-10 w-10 rounded-xl p-0 hover:bg-primary/5 transition-all" onClick={() => setSelectedHomework(null)}>
                  <ChevronRight className="w-6 h-6 rotate-180 text-primary" />
                </Button>
                <div>
                  <h2 className="text-2xl font-black text-[#3A2C2B] tracking-tight">{selectedHomework.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-2 py-0.5 uppercase tracking-widest">{selectedHomework.subject}</Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedHomework.class} • SECTION {selectedHomework.section}</span>
                  </div>
                </div>
              </div>

              {/* Local Submission Table Filters */}
              <div className="flex items-center gap-2">
                {[
                  { label: 'All', value: 'all', count: selectedHomework.submissions.total },
                  { label: 'Submitted', value: 'completed', count: selectedHomework.submissions.submitted },
                  { label: 'Pending', value: 'pending', count: selectedHomework.submissions.pending },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setSubTableFilter(f.value as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border",
                      subTableFilter === f.value
                        ? "bg-[#3A2C2B] text-white border-[#3A2C2B]"
                        : "bg-white text-[#3A2C2B]/60 border-border/10 hover:border-[#3A2C2B]/30"
                    )}
                  >
                    {f.label}
                    <Badge className={cn(
                      "h-4 min-w-[18px] px-1.5 rounded-md font-black text-[8px] border-none",
                      subTableFilter === f.value ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}>
                      {f.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" className="h-11 rounded-xl border-border/50 font-black uppercase text-[10px] tracking-widest px-6 hover:bg-primary/5 transition-all">
                <Download className="w-4 h-4 mr-2" /> EXPORT REPORT
              </Button>
            </div>
          </div>

          <div className="rounded-[32px] border-2 border-[#3A2C2B]/20 shadow-none overflow-hidden flex flex-col">
            {/* Sticky Header Layer */}
            <div className="bg-[#3A2C2B] shrink-0">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr>
                    <th className="w-[28%] px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Student Directory</th>
                    <th className="w-[18%] px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 text-center">{selectedHomework.type === 'Quiz' ? 'Session Date' : 'Delivery Date'}</th>
                    <th className="w-[18%] px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 text-center">{selectedHomework.type === 'Quiz' ? 'Auto-Score' : 'File Asset'}</th>
                    <th className={cn(selectedHomework.type === 'Quiz' ? "w-[36%]" : "w-[16%]", "px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 text-center")}>Lifecycle Status</th>
                    {selectedHomework.type !== 'Quiz' && <th className="w-[20%] px-10 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-white/70 text-right">Administrative Action</th>}
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body Layer */}
            <div className="max-h-[450px] overflow-y-auto no-scrollbar">
              <table className="w-full text-left table-fixed">
                <tbody className="divide-y divide-border/10">
                  {STUDENT_SUBMISSIONS
                    .filter(sub => {
                      if (subTableFilter === 'completed') return sub.status !== 'Not Submitted';
                      if (subTableFilter === 'pending') return sub.status === 'Not Submitted';
                      return true;
                    })
                    .map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#3A2C2B]/[0.02] transition-colors group">
                        <td className="w-[28%] px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[#3A2C2B]/5 flex items-center justify-center font-black text-[#3A2C2B] group-hover:bg-primary group-hover:text-white transition-all text-xs">
                              {sub.studentName[0]}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-[#3A2C2B] tracking-tight">{sub.studentName}</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{sub.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="w-[18%] px-10 py-6 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-[#3A2C2B]">{sub.submittedAt.split(' ')[0]}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">{sub.submittedAt.split(' ').slice(1).join(' ')}</span>
                          </div>
                        </td>
                        <td className="w-[18%] px-10 py-6 text-center">
                          {selectedHomework.type === 'Quiz' ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-black text-primary">{sub.quizScore}/{sub.quizTotal}</span>
                              <Badge className="bg-primary/5 text-primary border-primary/20 text-[7px] font-black uppercase px-2 py-0.5">Verified</Badge>
                            </div>
                          ) : (
                            <button className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-soft-parchment hover:bg-primary/5 transition-all border border-border/10 group/file">
                              <FileText className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#3A2C2B] group-hover/file:text-primary">{sub.file.split('.').pop()} Asset</span>
                            </button>
                          )}
                        </td>
                        <td className={cn(selectedHomework.type === 'Quiz' ? "w-[36%]" : "w-[16%]", "px-10 py-6 text-center")}>
                          <Badge className={cn(
                            "font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg border-none",
                            (sub.status === 'Graded' || (selectedHomework.type === 'Quiz' && sub.status !== 'Not Submitted'))
                              ? "bg-brand-green text-white"
                              : sub.status === 'Not Submitted'
                                ? "bg-[#3A2C2B]/5 text-[#3A2C2B]"
                                : "bg-destructive text-white"
                          )}>
                            {selectedHomework.type === 'Quiz'
                              ? (sub.status === 'Not Submitted' ? 'Not Submitted' : `Graded: ${sub.quizScore}/${sub.quizTotal}`)
                              : (sub.status === 'Graded' ? `Graded: ${sub.score}/${selectedHomework.totalPoints}` : sub.status === 'Not Submitted' ? 'Not Submitted' : 'Pending Grade')}
                          </Badge>
                        </td>
                        {selectedHomework.type !== 'Quiz' && (
                          <td className="w-[20%] px-10 py-6">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 font-black text-[9px] uppercase tracking-widest rounded-xl text-primary hover:bg-primary/5 transition-all px-6"
                                onClick={() => setShowGradingModal(true)}
                              >
                                {sub.status === 'Graded' ? 'UPDATE' : 'GIVE GRADES'}
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );



  // --- STUDENT VIEW COMPONENTS ---


  const StudentOverview = () => {
    const studentContext = { class: 'Class 12', section: 'A', dept: 'Science' };

    const pendingTasks = homeworks.filter(h => {
      const matchesType = h.type === activeProcessTab;
      const matchesSearch = h.title.toLowerCase().includes(homeworkSearch.toLowerCase());
      const isPublished = h.status === 'Published';
      const matchesTarget = h.class === studentContext.class && h.section.includes(studentContext.section) && (h.dept === studentContext.dept || h.dept === 'General');
      const isNotSubmitted = !submittedTaskIds.includes(h.id);
      return matchesType && matchesSearch && isPublished && matchesTarget && isNotSubmitted;
    });

    const submittedTasks = homeworks.filter(h => {
      return h.type === activeProcessTab && submittedTaskIds.includes(h.id);
    });

    const handleFinalSubmit = (taskId: string) => {
      setSubmittedTaskIds(prev => [...prev, taskId]);
      setSelectedHomework(null);
      setIsSubmitted(false);
      setQuizAnswers({});
      setSubmittedQuestions([]);
      setQuestionResults({});
      alert("Task submitted successfully!");
    };

    if (selectedHomework) {
      if (selectedHomework.type === 'Quiz') {
        const quizQuestions = [
          { q: "What is the primary theme of the assigned chapter?", options: ["Isolation", "Ambition", "Betrayal", "Redemption"], correct: "Isolation" },
          { q: "Which character best represents the 'Old Money' aristocracy?", options: ["Jay Gatsby", "Tom Buchanan", "Nick Carraway", "George Wilson"], correct: "Tom Buchanan" },
          { q: "What does the 'Green Light' symbolize in the context of the story?", options: ["Wealth", "Nature", "Future Hope", "Danger"], correct: "Future Hope" }
        ];

        const answeredCount = submittedQuestions.length;
        const correctCount = Object.values(questionResults).filter(Boolean).length;
        const remainingCount = quizQuestions.length - answeredCount;

        const handleQuestionSubmit = (qIdx: number) => {
          if (!quizAnswers[qIdx]) return;
          const isCorrect = quizAnswers[qIdx] === quizQuestions[qIdx].correct;
          setSubmittedQuestions([...submittedQuestions, qIdx]);
          setQuestionResults({ ...questionResults, [qIdx]: isCorrect });
        };

        return (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
            <div className="rounded-[40px] border border-border/10 bg-gradient-to-br from-white to-[#FFF8F3] p-6 lg:p-8">
              <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <Button
                    variant="ghost"
                    className="h-14 w-14 shrink-0 rounded-2xl bg-brand-orange/10 hover:bg-brand-orange/20"
                    onClick={() => { setSelectedHomework(null); setQuizAnswers({}); setSubmittedQuestions([]); setQuestionResults({}); setIsSubmitted(false); }}
                  >
                    <ChevronRight className="w-8 h-8 rotate-180 text-brand-orange" />
                  </Button>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange/70">Quiz Workspace</p>
                      <h2 className="text-3xl lg:text-4xl font-black text-[#3A2C2B] tracking-tight">{selectedHomework.title}</h2>
                    </div>
                    <p className="max-w-3xl text-sm font-medium leading-relaxed text-[#3A2C2B]/65">
                      Answer each question carefully, confirm it, and use the navigator on the right to track progress before final submission.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-white text-[#3A2C2B] border border-[#3A2C2B]/10 font-black text-[9px] px-3 py-1 uppercase tracking-widest rounded-lg flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Duration: {selectedHomework.quizConfig?.duration || '30'} Mins
                      </Badge>
                      <Badge className="bg-white text-[#3A2C2B] border border-[#3A2C2B]/10 font-black text-[9px] px-3 py-1 uppercase tracking-widest rounded-lg flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Window: {selectedHomework.quizConfig?.startTime || '09:00 AM'} - {selectedHomework.quizConfig?.endTime || '05:00 PM'}
                      </Badge>
                      <Badge className="bg-white text-[#3A2C2B] border border-[#3A2C2B]/10 font-black text-[9px] px-3 py-1 uppercase tracking-widest rounded-lg">
                        Marks: {selectedHomework.quizConfig?.marks || '100'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {!isSubmitted && (
                  <div className="min-w-[220px] rounded-[28px] border border-brand-orange/20 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-orange/60">Live Timer</p>
                        <p className="text-3xl font-black text-brand-orange tabular-nums">24:59</p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-brand-orange animate-pulse" />
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-brand-orange/10 overflow-hidden">
                      <div className="h-full w-1/2 rounded-full bg-brand-orange" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="rounded-[28px] bg-white border border-[#3A2C2B]/10 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3A2C2B]/45">Questions Confirmed</p>
                  <p className="mt-2 text-3xl font-black text-[#3A2C2B]">{answeredCount}</p>
                </div>
                <div className="rounded-[28px] bg-white border border-[#3A2C2B]/10 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3A2C2B]/45">Correct So Far</p>
                  <p className="mt-2 text-3xl font-black text-green-600">{correctCount}</p>
                </div>
                <div className="rounded-[28px] bg-white border border-[#3A2C2B]/10 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3A2C2B]/45">Remaining</p>
                  <p className="mt-2 text-3xl font-black text-brand-orange">{remainingCount}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-5">
                {quizQuestions.map((item, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      "p-6 lg:p-8 rounded-[32px] border border-border/10 shadow-none bg-white space-y-6 transition-all",
                      submittedQuestions.includes(idx) && (questionResults[idx] ? "ring-2 ring-green-500/20 bg-green-50/20" : "ring-2 ring-red-500/20 bg-red-50/20")
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center font-black shrink-0 transition-colors",
                          submittedQuestions.includes(idx)
                            ? (questionResults[idx] ? "bg-green-500 text-white" : "bg-red-500 text-white")
                            : "bg-[#3A2C2B] text-white"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3A2C2B]/40">Question {idx + 1}</p>
                          <p className="text-lg font-black text-[#3A2C2B] leading-tight">{item.q}</p>
                        </div>
                      </div>
                      {submittedQuestions.includes(idx) && (
                        <Badge className={cn("border-none text-[9px] font-black uppercase px-3 py-1 rounded-lg self-start", questionResults[idx] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          {questionResults[idx] ? "Correct" : "Incorrect"}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:pl-[60px]">
                      {item.options.map((opt) => {
                        const isAnswered = submittedQuestions.includes(idx);
                        const isSelected = quizAnswers[idx] === opt;
                        const isCorrectOption = item.correct === opt;

                        return (
                          <button
                            key={opt}
                            disabled={isAnswered || isSubmitted}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: opt })}
                            className={cn(
                              "p-5 rounded-2xl text-left text-xs font-bold transition-all border-2",
                              isAnswered
                                ? isCorrectOption
                                  ? "bg-green-500 text-white border-green-500"
                                  : isSelected
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-white border-border/10 text-muted-foreground"
                                : isSelected
                                  ? "bg-brand-orange/10 border-brand-orange text-brand-orange shadow-lg shadow-brand-orange/10"
                                  : "bg-white border-border/10 text-muted-foreground hover:border-brand-orange/30"
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {!submittedQuestions.includes(idx) && (
                      <div className="md:pl-[60px] flex justify-end">
                        <Button
                          disabled={!quizAnswers[idx]}
                          onClick={() => handleQuestionSubmit(idx)}
                          className="h-11 rounded-xl bg-[#3A2C2B] text-white font-black uppercase text-[10px] px-6"
                        >
                          Confirm Answer
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <Card className="p-6 rounded-[32px] border-none shadow-none bg-[#3A2C2B] text-white space-y-6 sticky top-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Quiz Navigator</h3>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 mt-1">Track each question before final submit</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xs">
                      {answeredCount}/{quizQuestions.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {quizQuestions.map((_, n) => (
                      <div
                        key={n}
                        className={cn(
                          "h-11 rounded-xl border flex items-center justify-center font-black text-[10px] transition-all",
                          submittedQuestions.includes(n)
                            ? (questionResults[n] ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white")
                            : (quizAnswers[n] ? "bg-white/20 border-white/40 text-white" : "border-white/10 text-white/25")
                        )}
                      >
                        {n + 1}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[24px] bg-white/5 p-4 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase opacity-60">
                      <span>Total Questions</span>
                      <span>{quizQuestions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase opacity-60">
                      <span>Answered</span>
                      <span>{answeredCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase">
                      <span>Estimated Score</span>
                      <span className="text-brand-orange text-lg">{Math.round((correctCount / quizQuestions.length) * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/25" />
                      <span>Not started</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white" />
                      <span>Selected, not confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span>Confirmed correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Confirmed incorrect</span>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <div className="text-center space-y-4 pt-2 animate-in zoom-in duration-300">
                      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-none">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-green-400">Quiz Finalized</p>
                        <p className="text-[10px] font-medium text-white/40 italic">Results updated in Hub.</p>
                      </div>
                      <Button className="w-full h-14 rounded-2xl bg-white text-[#3A2C2B] font-black uppercase text-xs" onClick={() => handleFinalSubmit(selectedHomework.id)}>Back To Hub</Button>
                    </div>
                  ) : (
                    <Button
                      disabled={submittedQuestions.length < quizQuestions.length}
                      onClick={() => setIsSubmitted(true)}
                      className="w-full h-14 rounded-2xl bg-brand-orange text-white font-black uppercase tracking-widest text-xs shadow-none"
                    >
                      Submit Final Quiz
                    </Button>
                  )}
                </Card>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-none border border-border/10">
            <div className="flex items-center gap-6">
              <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-primary/10 hover:bg-primary/20" onClick={() => setSelectedHomework(null)}>
                <ChevronRight className="w-8 h-8 rotate-180 text-primary" />
              </Button>
              <div>
                <h2 className="text-3xl font-black text-[#3A2C2B] tracking-tight">{selectedHomework.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest rounded-lg">{selectedHomework.subject}</Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due: {selectedHomework.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-8">
              <Card className="p-10 rounded-[48px] border-none shadow-none bg-white space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-[#3A2C2B] uppercase tracking-tight flex items-center gap-3">
                    <div className="w-2 h-6 bg-[#D1C4E9] rounded-full" /> Task Description
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-[#3A2C2B]/70 italic">{selectedHomework.description}</p>
                </div>
                <div className="space-y-4 pt-8 border-t border-border/10">
                  <h3 className="text-xl font-black text-[#3A2C2B] uppercase tracking-tight flex items-center gap-3">
                    <div className="w-2 h-6 bg-[#E5B6A3] rounded-full" /> Reference Materials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedHomework.attachments?.map((file: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#3A2C2B]/5 border border-border/10 hover:bg-white hover:shadow-none transition-all group">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#E5B6A3]" />
                          <span className="text-[10px] font-black uppercase text-[#3A2C2B]">{file}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-[#E5B6A3] group-hover:text-white transition-all">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-8">
              <Card className="p-10 rounded-[48px] border-none shadow-none bg-[#BFDDD8]/20 space-y-8 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Upload className="w-40 h-40 text-[#BFDDD8]" />
                </div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-black text-[#3A2C2B] uppercase tracking-tight">Your Submission</h3>
                  <div className="space-y-4">
                    <div className="h-48 border-4 border-dashed border-[#3A2C2B]/10 rounded-[40px] flex flex-col items-center justify-center text-center space-y-4 hover:border-[#BFDDD8]/60 hover:bg-white transition-all cursor-pointer group/upload">
                      <div className="w-16 h-16 rounded-3xl bg-[#BFDDD8]/10 flex items-center justify-center group-hover/upload:bg-[#BFDDD8] group-hover/upload:text-[#3A2C2B] transition-all">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/60">Click to upload your work</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">PDF, DOCX up to 10MB</p>
                      </div>
                    </div>
                    <Button
                      className="w-full h-16 rounded-[28px] bg-[#3A2C2B] text-white font-black uppercase tracking-[0.2em] text-xs shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={() => handleFinalSubmit(selectedHomework.id)}
                    >
                      Submit Assignment <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-8 rounded-[40px] border-none shadow-none bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Review</p>
                    <p className="text-xs font-medium text-muted-foreground italic">Evaluation will begin after submission.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-4">
          <h2 className="text-2xl font-black text-[#3A2C2B] tracking-tight uppercase flex items-center gap-3">
            <div className={cn(
              "w-2 h-8 rounded-full",
              activeProcessTab === 'Quiz' ? "bg-[#F0E0AD]" : activeProcessTab === 'Homework' ? "bg-[#BFDDD8]" : "bg-[#D1C4E9]"
            )} />
            {activeProcessTab === 'Assignment' ? 'Pending Assignments' : activeProcessTab === 'Homework' ? 'Pending Homework' : 'Pending Quizzes'}
          </h2>
          {pendingTasks.length > 0 && (
            <div className="flex bg-[#3A2C2B]/5 p-1 rounded-lg shrink-0">
              <button
                onClick={() => setHomeworkView('card')}
                className={cn("p-1.5 rounded-md transition-all", homeworkView === 'card' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setHomeworkView('table')}
                className={cn("p-1.5 rounded-md transition-all", homeworkView === 'table' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 px-4">
              <Badge className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Require Action</Badge>
            </div>
            {pendingTasks.length === 0 ? (
              <StudentCompletedState type={activeProcessTab} />
            ) : (
              <>
                {homeworkView === 'table' && (
                  <div className="block">
                    <HomeworkTable homeworks={pendingTasks} type={activeProcessTab} />
                  </div>
                )}
                <div className={cn(
                  "flex overflow-x-auto no-scrollbar gap-8 px-4 pb-10 -mx-4 scroll-smooth snap-x snap-mandatory",
                  homeworkView === 'table' ? "hidden" : ""
                )}>
                  {pendingTasks.map((asg, i) => (
                    <div key={asg.id} className="w-[320px] flex-none snap-center flex flex-col">
                      <HomeworkCard asg={asg} i={i} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-2 px-4">
              <Badge className="bg-green-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Submitted Work</Badge>
              {submittedTasks.length > 0 && (
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-lg shrink-0">
                  <button onClick={() => setSubmittedView('card')} className={cn("p-1.5 rounded-md transition-all", submittedView === 'card' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}><LayoutGrid className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setSubmittedView('table')} className={cn("p-1.5 rounded-md transition-all", submittedView === 'table' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}><List className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
            {submittedView === 'table' && (
              <div className="flex rounded-[32px] border-2 border-[#3A2C2B]/20 bg-white overflow-hidden mx-4 flex-col">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left table-fixed min-w-[600px]">
                  <thead className="bg-[#3A2C2B]">
                    <tr>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70">Task Title</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A2C2B]/5">
                    {submittedTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-white/50 transition-all">
                        <td className="px-8 py-5 text-[11px] font-black text-[#3A2C2B] uppercase tracking-tight">{task.title}</td>
                        <td className="px-8 py-5 text-right">
                          <Badge className="bg-green-100 text-green-700 border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase tracking-widest">
                            {activeProcessTab === 'Quiz' ? 'Quiz Submitted' : 'Work Uploaded'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {submittedTasks.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-8 py-10 text-center italic text-[10px] text-muted-foreground uppercase font-bold opacity-40">No work submitted yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            )}
            
            <div className={cn(
              "flex overflow-x-auto no-scrollbar gap-8 px-4 pb-10 -mx-4 scroll-smooth snap-x snap-mandatory",
              submittedView === 'table' ? "hidden" : ""
            )}>
              {submittedTasks.map((task) => {
                const cardBg = task.type === 'Quiz' ? "bg-[#F0E0AD]" : task.type === 'Assignment' ? "bg-[#B1D3EC]" : "bg-[#D1C4E9]";
                return (
                  <div key={task.id} className="w-[320px] flex-none snap-center flex flex-col">
                    <Card className={cn("p-6 md:p-8 flex flex-col justify-between rounded-[32px] md:rounded-[48px] border-none shadow-none h-[280px] md:h-[320px] transition-all hover:scale-[1.02] cursor-pointer group relative overflow-hidden", cardBg)}>
                      <img src="/Work.png" alt="" className="absolute -right-12 -bottom-12 w-48 h-48 md:w-64 md:h-64 object-contain opacity-20 pointer-events-none z-0" />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex gap-2 mb-4">
                            <Badge className="bg-[#3A2C2B] text-white border-none rounded-lg font-black text-[8px] uppercase tracking-widest px-3 py-1">
                              {task.type}
                            </Badge>
                          </div>
                          <span className="text-xl md:text-2xl font-black text-[#3A2C2B] uppercase tracking-tight line-clamp-2">{task.title}</span>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Badge className="bg-white/50 text-[#3A2C2B] border-none font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-widest">
                            {activeProcessTab === 'Quiz' ? 'Quiz Submitted' : 'Work Uploaded'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
              {submittedTasks.length === 0 && (
                <div className="p-8 text-center italic text-[10px] text-muted-foreground uppercase font-bold opacity-40 border-2 border-[#3A2C2B]/10 rounded-[24px]">No work submitted yet</div>
              )}
            </div>
          </div>

          <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black text-[#3A2C2B] tracking-tight uppercase flex items-center gap-3">
                <div className="w-2 h-8 rounded-full bg-[#E5B6A3]" /> Performance Results
              </h2>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden sm:inline-flex font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-xl border-[#3A2C2B]/10">View Detailed Reports</Badge>
                {submittedTasks.length > 0 && (
                  <div className="flex bg-[#3A2C2B]/5 p-1 rounded-lg shrink-0">
                    <button onClick={() => setPerformanceView('card')} className={cn("p-1.5 rounded-md transition-all", performanceView === 'card' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}><LayoutGrid className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setPerformanceView('table')} className={cn("p-1.5 rounded-md transition-all", performanceView === 'table' ? "bg-white text-[#3A2C2B]" : "text-[#3A2C2B]/40 hover:text-[#3A2C2B]")}><List className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            </div>

            {performanceView === 'table' && (
              <div className="flex rounded-[32px] border-2 border-[#3A2C2B]/20 shadow-none bg-white overflow-hidden mx-4 flex-col">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left table-fixed min-w-[700px]">
                  <thead className="bg-[#3A2C2B]">
                    <tr>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70">Topic/Task Name</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70">Submission Date</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70 text-center">Score / Grade</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-white/70 text-right">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A2C2B]/5">
                    {submittedTasks.map((task) => {
                      const performanceRecord = STUDENT_PERFORMANCE_RECORDS[task.id];
                      const isGraded = performanceRecord?.released ?? false;

                      return (
                        <tr key={task.id} className="hover:bg-[#3A2C2B]/[0.02] transition-all group">
                          <td className="px-8 py-6">
                            <div>
                              <p className="text-[11px] font-black text-[#3A2C2B]">{task.title}</p>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">
                                {task.type === 'Quiz' ? 'Automated Evaluation' : 'Educator Review'}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[10px] font-bold text-[#3A2C2B]/60">{performanceRecord?.submittedAt || task.dueDate}</td>
                          <td className="px-8 py-6 text-center">
                            {isGraded ? (
                              <div className="inline-flex flex-col items-center">
                                <span className={cn(
                                  "text-sm font-black",
                                  task.type === 'Quiz' ? "text-brand-orange" : task.type === 'Assignment' ? "text-blue-600" : "text-brand-green"
                                )}>
                                  {performanceRecord?.scoreLabel || '--'}
                                </span>
                                <span className="text-[8px] font-black opacity-40 uppercase">Declared</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-amber-600 uppercase tracking-tight">Result Yet to Declare</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Badge className={cn(
                              "border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase tracking-widest",
                              isGraded ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {isGraded ? "Released" : "Pending Review"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {submittedTasks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-10 text-center italic text-[10px] text-muted-foreground uppercase font-bold opacity-40">No evaluated work available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            <div className={cn(
              "flex overflow-x-auto no-scrollbar gap-8 px-4 pb-10 -mx-4 scroll-smooth snap-x snap-mandatory",
              performanceView === 'table' ? "hidden" : ""
            )}>
              {submittedTasks.map((task) => {
                const performanceRecord = STUDENT_PERFORMANCE_RECORDS[task.id];
                const isGraded = performanceRecord?.released ?? false;
                const cardBg = task.type === 'Quiz' ? "bg-[#F0E0AD]" : task.type === 'Assignment' ? "bg-[#B1D3EC]" : "bg-[#D1C4E9]";
                return (
                  <div key={task.id} className="w-[320px] flex-none snap-center flex flex-col">
                    <Card className={cn("p-6 md:p-8 flex flex-col justify-between rounded-[32px] md:rounded-[48px] border-none shadow-none h-[280px] md:h-[320px] transition-all hover:scale-[1.02] cursor-pointer group relative overflow-hidden", cardBg)}>
                      <img src="/Work.png" alt="" className="absolute -right-12 -bottom-12 w-48 h-48 md:w-64 md:h-64 object-contain opacity-20 pointer-events-none z-0" />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex gap-2 mb-4">
                            <Badge className="bg-[#3A2C2B] text-white border-none rounded-lg font-black text-[8px] uppercase tracking-widest px-3 py-1">
                              {task.type}
                            </Badge>
                          </div>
                          <p className="text-xl md:text-2xl font-black text-[#3A2C2B] uppercase tracking-tight line-clamp-2">{task.title}</p>
                          <p className="text-[10px] font-bold text-[#3A2C2B]/60 uppercase mt-2">
                            {task.type === 'Quiz' ? 'Automated Evaluation' : 'Educator Review'}
                          </p>
                        </div>
                        <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#3A2C2B]/10">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#3A2C2B]/60 uppercase">{performanceRecord?.submittedAt || task.dueDate}</span>
                            <Badge className={cn(
                              "border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase tracking-widest mt-2 w-fit",
                              isGraded ? "bg-white/60 text-green-700" : "bg-white/40 text-[#3A2C2B]"
                            )}>
                              {isGraded ? "Released" : "Pending"}
                            </Badge>
                          </div>
                          {isGraded ? (
                            <span className="text-3xl font-black text-[#3A2C2B]">
                              {performanceRecord?.scoreLabel || '--'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-[#3A2C2B]/60 uppercase tracking-tight max-w-[80px] text-right">Result Yet to Declare</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
              {submittedTasks.length === 0 && (
                <div className="p-8 text-center italic text-[10px] text-muted-foreground uppercase font-bold opacity-40 border-2 border-[#3A2C2B]/10 rounded-[24px]">No evaluated work available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TeacherHeader = () => {
    const bannerBg = activeProcessTab === 'Quiz'
      ? "bg-[#F0E0AD]"
      : activeProcessTab === 'Homework'
        ? "bg-[#BFDDD8]"
        : "bg-[#EBBDC2]";

    return (
      <div className={cn(
        "relative overflow-hidden p-8 md:p-10 rounded-[32px] border-none shadow-none mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mx-4 lg:mx-6 mt-4 transition-all duration-500 min-h-[220px] lg:min-h-[240px]",
        bannerBg
      )}>
        {/* Content wrapper */}
        <div className="relative z-10 max-w-xl flex flex-col justify-center h-full">
          <h1 className="text-3xl sm:text-4xl font-black text-[#3A2C2B] tracking-tight">Academic Homework Hub</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-white/40 border-white/20 text-[#3A2C2B] font-black px-3 py-1 rounded-lg text-[8px] sm:text-[9px] uppercase tracking-widest whitespace-nowrap">
              Term 2 • Session 2026-27
            </Badge>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#3A2C2B]/60 uppercase tracking-widest italic sm:whitespace-nowrap hidden md:inline-block">Command Center • Educator Mode</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6">
            <Button className="rounded-xl bg-[#3A2C2B] text-white h-9 px-5 font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-none w-fit sm:w-auto relative z-20" onClick={() => setShowHomeworkModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          </div>
        </div>

        {/* Assign.png illustration layout */}
        <div className="absolute right-0 bottom-2 md:bottom-0 md:top-0 flex items-end md:items-center justify-end w-1/2 md:w-1/3 pointer-events-none select-none z-0">
          <img
            src="/Assign.png"
            alt="Assignments Illustration"
            className="object-contain h-[130%] translate-y-2 md:translate-y-6 translate-x-4 max-h-[150px] md:max-h-[220px]"
          />
        </div>
      </div>
    );
  };

  const StudentHeader = () => {
    const bannerBg = activeProcessTab === 'Quiz'
      ? "bg-[#F0E0AD]"
      : activeProcessTab === 'Homework'
        ? "bg-[#BFDDD8]"
        : "bg-[#EBBDC2]";

    return (
      <div className={cn(
        "relative overflow-hidden p-8 md:p-10 rounded-[32px] border-none shadow-none mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mx-4 lg:mx-6 mt-4 transition-all duration-500 min-h-[220px] lg:min-h-[240px]",
        bannerBg
      )}>
        <div className="relative z-10 max-w-xl flex flex-col justify-center h-full">
          <h1 className="text-4xl font-black text-[#3A2C2B] tracking-tight">Assignments Hub</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="bg-white/40 border-white/20 text-[#3A2C2B] font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
              Academic Session 2026-27
            </Badge>
            <span className="hidden md:inline-block text-[10px] font-bold text-[#3A2C2B]/60 uppercase tracking-widest italic">Personal Command Center • Student Mode</span>
          </div>
          <p className="hidden md:block text-xs font-bold text-[#3A2C2B]/70 mt-3 max-w-md">
            Review your coursework, homework tasks, and quiz evaluations. Ensure your assignments are submitted before the deadline to keep your progress on track.
          </p>
          <div className="hidden md:flex items-center gap-3 mt-4">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Stay on track • Submit tasks early</span>
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-2 md:bottom-0 md:top-0 flex items-end md:items-center justify-end w-1/2 md:w-1/3 pointer-events-none select-none z-0">
          <img
            src="/Assign.png"
            alt="Assignments Illustration"
            className="object-contain h-[130%] translate-y-2 md:translate-y-6 translate-x-4 max-h-[150px] md:max-h-[220px]"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden pb-20">


      {/* 1. Header Section */}
      {isTeacher ? <TeacherHeader /> : <StudentHeader />}

      {isTeacher ? (
        <div className="space-y-10 bg-transparent shadow-none">
          {/* 1. Standardized KPI Cards Section (Top) */}
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatsCard label="Active Homework" value={homeworks.length.toString()} icon={FileText} color="bg-primary" sub="+2 this week" />
              <StatsCard label="Pending Evaluation" value="45" icon={Clock} color="bg-brand-orange" sub="12 urgent" />
              <StatsCard label="Avg. Submission" value="88%" icon={Users} color="bg-brand-green" sub="Above target" />
              <StatsCard label="Overdue Work" value="08" icon={AlertCircle} color="bg-brand-purple" sub="Requires attention" />
            </div>
          </div>

          {/* 2. Universal Tab Switcher */}
          <div className="px-4 lg:px-6 mb-12">
            <TabSwitcher
              tabs={[
                { id: 'Assignment', label: 'ASSIGNMENTS', icon: ClipboardList },
                { id: 'Homework', label: 'HOMEWORK', icon: BookOpen },
                { id: 'Quiz', label: 'QUIZZES', icon: BarChart3 },
              ]}
              activeTab={activeProcessTab}
              onTabChange={(id) => handleTabChange(id as any)}
              color="bg-primary"
            />
          </div>

          {/* 3. Filter Section */}
          <div className="px-4 lg:px-6">
            <FilterBar />
          </div>

          {/* 4. Content Area */}
          <div className="px-4 lg:px-6">
            <TeacherOverview />
          </div>
        </div>
      ) : (
        <div className="px-4 lg:px-6 space-y-10 bg-transparent shadow-none">
          {/* 2. Universal Tab Switcher */}
          <div className="flex items-center justify-center mb-12">
            <TabSwitcher
              tabs={[
                { id: 'Assignment', label: 'ASSIGNMENTS', icon: ClipboardList },
                { id: 'Homework', label: 'HOMEWORK', icon: BookOpen },
                { id: 'Quiz', label: 'QUIZZES', icon: BarChart3 },
              ]}
              activeTab={activeProcessTab}
              onTabChange={(id) => handleTabChange(id as any)}
              color="bg-primary"
            />
          </div>
          <StudentOverview />
        </div>
      )}

      {/* 4. Create/Edit Task Modal */}
      <Modal
        isOpen={showHomeworkModal}
        onClose={() => { setShowHomeworkModal(false); resetTaskForm(); }}
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
                      ? "bg-[#3A2C2B] text-white border-[#3A2C2B]"
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
                  options={availableDepartments.map(d => ({ label: d, value: d }))}
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
                        ? "bg-[#3A2C2B] text-white border-[#3A2C2B]"
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
                      <div key={file.name + i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/10">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-4 h-4 text-primary" />
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
            className="w-full h-14 bg-[#3A2C2B] text-white font-black uppercase text-xs rounded-[32px] mt-4 shadow-none disabled:opacity-20"
          >
            {taskClassification === 'Quiz' ? 'OPEN QUIZ BUILDER' : (isEditingTask ? 'UPDATE TASK' : 'CREATE & SAVE TASK')}
          </Button>
        </div>
      </Modal>

      {/* Grading Modal (Teacher) */}
      <Modal
        isOpen={showGradingModal}
        onClose={() => setShowGradingModal(false)}
        title="Submission Evaluation"
        className="max-w-4xl"
      >
        <div className="p-6 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Submission Preview (Mock) */}
            <div className="space-y-6">
              <div className="p-10 rounded-[32px] bg-soft-parchment/50 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <FileText className="w-20 h-20 text-primary opacity-20" />
                <div>
                  <h4 className="text-lg font-black text-[#3A2C2B] uppercase tracking-tight">Submission File Preview</h4>
                  <p className="text-xs font-medium text-muted-foreground italic">Document processing... Click to download full file</p>
                </div>
                <Button variant="outline" className="h-12 rounded-xl border-primary/20 text-primary font-black uppercase text-[9px] px-8">
                  <Download className="w-4 h-4 mr-2" /> Download Original
                </Button>
              </div>
            </div>

            {/* Right: Grading Form */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#3A2C2B] uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Performance Assessment
                </h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Grade / Score (Max 100)</label>
                  <Input
                    type="number"
                    placeholder="Enter score..."
                    value={gradingScore}
                    onChange={(e: any) => setGradingScore(e.target.value)}
                    className="h-14 rounded-2xl bg-soft-parchment/30 border-none text-lg font-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Evaluator Feedback</label>
                  <textarea
                    placeholder="Write detailed feedback for the student..."
                    value={gradingFeedback}
                    onChange={(e: any) => setGradingFeedback(e.target.value)}
                    className="w-full min-h-[150px] p-6 rounded-3xl bg-soft-parchment/30 border-none text-sm font-medium italic focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-none">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ready to Finalize</p>
                  <p className="text-xs font-medium text-emerald-800 italic">Grade will be immediately visible to student.</p>
                </div>
              </div>

              <Button
                onClick={() => { setShowGradingModal(false); alert("Evaluation recorded and student notified."); }}
                className="w-full h-16 rounded-[28px] bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                PUBLISH GRADE <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Audit Log Modal */}
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
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#3A2C2B]">{log.action}: {log.taskRef}</p>
                      <p className="text-[9px] font-bold opacity-40 uppercase">User: Teacher</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black opacity-40 uppercase whitespace-nowrap">{log.timestamp}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center opacity-20">
              <ClipboardList className="w-12 h-12 mx-auto mb-3" />
              <p className="text-xs font-black uppercase">No activity recorded yet</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this task? This action cannot be undone."
      >
        <div className="space-y-6 p-2 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setShowDeleteConfirm(false)}>CANCEL</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 font-black uppercase text-[10px]" onClick={handleDeleteTask}>DELETE TASK</Button>
          </div>
        </div>
      </Modal>

      {/* Unpublish Confirmation Modal */}
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
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setShowUnpublishConfirm(false)}>CANCEL</Button>
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl h-12 font-black uppercase text-[10px]" onClick={confirmUnpublish}>UNPUBLISH</Button>
          </div>
        </div>
      </Modal>

      {/* View Task Details Modal */}
      <Modal
        isOpen={showTaskDetailsModal}
        onClose={() => setShowTaskDetailsModal(false)}
        title="Task Overview"
        description="Detailed information about the assigned academic task"
      >
        <div className="space-y-6 p-2">
          <div className="p-6 bg-[#3A2C2B] rounded-[32px] text-white relative overflow-hidden">
            <h4 className="text-xl font-black uppercase tracking-tight">{selectedTaskForView?.title}</h4>
            <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-widest">{selectedTaskForView?.sub || selectedTaskForView?.subject}</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40">Instructions</label>
            <div className="p-5 rounded-[32px] bg-white border border-border/20 shadow-none">
              <p className="text-xs font-medium leading-relaxed text-[#3A2C2B]/80 whitespace-pre-wrap">
                {selectedTaskForView?.instructions || selectedTaskForView?.description || "No specific instructions provided."}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowTaskDetailsModal(false)} className="w-full h-14 bg-[#3A2C2B] text-white font-black uppercase text-xs rounded-2xl">DISMISS</Button>
        </div>
      </Modal>
    </div>
  );
}
