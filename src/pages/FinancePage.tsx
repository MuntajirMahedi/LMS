import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CreditCard, Banknote,
  ArrowUpRight, ArrowDownRight, Clock, Users, RefreshCw, Search, Download,
  Eye, FileText, Plus, CheckSquare, Square, Edit, ToggleLeft, ToggleRight,
  Calendar, X, User, Phone, Award, ChevronRight,
  CheckCircle2, XCircle,
  BookOpen, Tag, Smartphone, Building,
  DollarSign, BarChart3, Layers,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import { cn } from '../lib/utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  getFeeStudents, getFeeStructures, getInvoices, getPayments,
  getRefunds, getScholarships, getTransactions,
  saveFeeStructures,
  MONTHLY_COLLECTION_DATA, PAYMENT_METHOD_DATA, CLASS_WISE_COLLECTION,
  DEFAULT_FINANCE_SETTINGS
} from '../mock/financeMock';
import type {
  FeeStructure, FeeFrequency, Invoice, InvoiceStatus, Payment, Refund
} from '../mock/financeMock';

// ══════════════════════════════════════════════════════════════
// CHART CONFIG
// ══════════════════════════════════════════════════════════════

const CHART_COLORS = {
  primary: '#C37A67', success: '#88AC88', warning: '#E4B76D',
  info: '#A78BFA', error: '#E63946', muted: '#8B7E74',
  border: '#E9E1D5', foreground: '#3A2C2B', blue: '#8EBADB',
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
                {entry.name}: <span className="font-black">${typeof entry.value === 'number' ? (entry.value >= 1000 ? `${(entry.value / 1000).toFixed(1)}k` : entry.value) : entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    'Paid': 'bg-emerald-100 text-emerald-700', 'Pending': 'bg-amber-100 text-amber-700',
    'Partial': 'bg-blue-100 text-blue-700', 'Overdue': 'bg-red-100 text-red-700',
    'Cancelled': 'bg-gray-100 text-gray-500', 'Success': 'bg-emerald-100 text-emerald-700',
    'Failed': 'bg-red-100 text-red-700', 'Requested': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-emerald-100 text-emerald-700', 'Rejected': 'bg-red-100 text-red-700',
    'Processed': 'bg-blue-100 text-blue-700', 'Active': 'bg-emerald-100 text-emerald-700',
    'Expired': 'bg-gray-100 text-gray-500', 'Draft': 'bg-amber-100 text-amber-700',
  };
  return map[status] || 'bg-gray-100 text-gray-500';
};

const frequencyColors: Record<string, string> = {
  'Monthly': 'bg-[#B1D3EC] text-[#3A2C2B]', 'Quarterly': 'bg-[#BFDDD8] text-[#3A2C2B]',
  'Annually': 'bg-[#F0E0AD] text-[#3A2C2B]', 'One-time': 'bg-[#EBBDC2] text-[#3A2C2B]',
};



const useAnimatedCounter = (target: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-[32px] p-6 bg-[#E9E1D5]/30 space-y-3">
    <div className="h-8 bg-[#E9E1D5]/50 rounded-xl w-24" />
    <div className="h-4 bg-[#E9E1D5]/40 rounded-lg w-32" />
  </div>
);

// ══════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ══════════════════════════════════════════════════════════════

const FINANCE_TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'fee-structures', label: 'Fee Structures', icon: Layers },
  { id: 'student-fees', label: 'Student Fees', icon: Users },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'refunds-discounts', label: 'Refunds & Discounts', icon: RefreshCw },
  { id: 'ledger-reports', label: 'Ledger & Reports', icon: BookOpen },
];

// ══════════════════════════════════════════════════════════════
// MAIN FINANCE PAGE
// ══════════════════════════════════════════════════════════════

const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // ── OVERVIEW STATE ──
  const [overviewLoading] = useState(false);
  const totalCollected = useAnimatedCounter(overviewLoading ? 0 : 672000);
  const pendingDues = useAnimatedCounter(overviewLoading ? 0 : 205000);
  const overdueAmt = useAnimatedCounter(overviewLoading ? 0 : 62500);

  const [tableViewModes, setTableViewModes] = useState<Record<string, 'table' | 'card'>>({
    recent: 'table', dues: 'card', structures: 'table', invoices: 'table', students: 'table'
  });



  // ── FEE STRUCTURES STATE ──
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => getFeeStructures());
  const [feeSearch, setFeeSearch] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('All');
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [editDrawer, setEditDrawer] = useState<FeeStructure | null>(null);
  const [newFee, setNewFee] = useState({ name: '', type: 'Academic', amount: '', frequency: 'Monthly' as FeeFrequency, dueDate: '', applicableClasses: '' });

  // ── STUDENT FEES STATE ──
  const [studentSearch, setStudentSearch] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState('All');
  const [studentClassFilter, setStudentClassFilter] = useState('All');
  const [studentSectionFilter, setStudentSectionFilter] = useState('All');
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [_students] = useState(() => getFeeStudents());
  const [selectedStudent, setSelectedStudent] = useState(() => getFeeStudents()[0]);
  const [_invoices] = useState(() => getInvoices());
  const [_payments] = useState(() => getPayments());
  const [_refunds] = useState(() => getRefunds());
  const [_scholarships] = useState(() => getScholarships());
  const [_transactions] = useState(() => getTransactions());

  // Computed data from state
  const MOCK_STUDENTS = _students;
  const MOCK_INVOICES = _invoices;
  const MOCK_PAYMENTS = _payments;
  const MOCK_REFUNDS = _refunds;
  const MOCK_SCHOLARSHIPS = _scholarships;
  const MOCK_TRANSACTIONS = _transactions;

  // Persist feeStructures changes to localStorage
  useEffect(() => { saveFeeStructures(feeStructures); }, [feeStructures]);

  // ── INVOICES STATE ──
  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [selectedInvRows, setSelectedInvRows] = useState<Set<string>>(new Set());
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [showGenInvoice, setShowGenInvoice] = useState(false);

  // ── PAYMENTS STATE ──
  const [paySearch, setPaySearch] = useState('');
  const [showCollectPayment, setShowCollectPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [_showReceipt, _setShowReceipt] = useState<Payment | null>(null);

  // ── REFUNDS STATE ──
  const [refSearch, setRefSearch] = useState('');
  const [refStatusFilter, setRefStatusFilter] = useState('All');
  const [refundDetail, setRefundDetail] = useState<Refund | null>(null);

  // ── SCHOLARSHIPS STATE ──
  const [schSearch, setSchSearch] = useState('');
  const [showAddScholarship, setShowAddScholarship] = useState(false);

  // ── REPORTS STATE ──
  const [reportType, setReportType] = useState('collection');

  // ── LEDGER STATE ──
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);

  // ── AUDIT STATE ──
  const [_auditSearch, _setAuditSearch] = useState('');
  const [_auditSeverityFilter, _setAuditSeverityFilter] = useState('All');

  // ── SETTINGS STATE ──
  const [_settings, _setSettings] = useState(DEFAULT_FINANCE_SETTINGS);

  // ══ HANDLERS ══

  const toggleFeeActive = (id: string) => setFeeStructures(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

  const handleAddFee = () => {
    const newId = `FS${String(feeStructures.length + 1).padStart(3, '0')}`;
    setFeeStructures(prev => [...prev, { id: newId, name: newFee.name, type: newFee.type, amount: Number(newFee.amount), frequency: newFee.frequency, dueDate: newFee.dueDate, applicableClasses: newFee.applicableClasses.split(',').map(c => c.trim()), isActive: true, createdDate: new Date().toISOString().split('T')[0] }]);
    setShowAddFeeModal(false);
    setNewFee({ name: '', type: 'Academic', amount: '', frequency: 'Monthly', dueDate: '', applicableClasses: '' });
  };

  const toggleInvRow = (id: string) => setSelectedInvRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });



  // ══ FILTERED DATA ══

  const filteredFees = feeStructures.filter(s => {
    const m1 = s.name.toLowerCase().includes(feeSearch.toLowerCase()) || s.type.toLowerCase().includes(feeSearch.toLowerCase());
    const m2 = feeTypeFilter === 'All' || s.type === feeTypeFilter;
    return m1 && m2;
  });

  const filteredStudents = MOCK_STUDENTS.filter(s => {
    const searchMatch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.id.toLowerCase().includes(studentSearch.toLowerCase());
    const classMatch = studentClassFilter === 'All' || s.class.includes(studentClassFilter);
    const secMatch = studentSectionFilter === 'All' || s.section === studentSectionFilter;
    // mock students don't have year or dept, so we'll just pretend those match if not 'All' for UI demonstration
    return searchMatch && classMatch && secMatch;
  });
  const studentInvoices = MOCK_INVOICES.filter(i => i.studentId === selectedStudent.id);
  const studentPayments = MOCK_PAYMENTS.filter(p => p.studentId === selectedStudent.id);
  const studentRefunds = MOCK_REFUNDS.filter(r => r.studentId === selectedStudent.id);

  const filteredInvoices = MOCK_INVOICES.filter(inv => {
    const m1 = inv.studentName.toLowerCase().includes(invSearch.toLowerCase()) || inv.invoiceNo.toLowerCase().includes(invSearch.toLowerCase());
    const m2 = invStatusFilter === 'All' || inv.status === invStatusFilter;
    return m1 && m2;
  });

  const filteredPayments = MOCK_PAYMENTS.filter(p => p.studentName.toLowerCase().includes(paySearch.toLowerCase()) || p.receiptNo.toLowerCase().includes(paySearch.toLowerCase()));
  const filteredRefunds = MOCK_REFUNDS.filter(r => {
    const m1 = r.studentName.toLowerCase().includes(refSearch.toLowerCase());
    const m2 = refStatusFilter === 'All' || r.status === refStatusFilter;
    return m1 && m2;
  });
  const filteredScholarships = MOCK_SCHOLARSHIPS.filter(s => s.name.toLowerCase().includes(schSearch.toLowerCase()));
  const filteredLedger = MOCK_TRANSACTIONS.filter(t => t.studentName.toLowerCase().includes(ledgerSearch.toLowerCase()) || t.description.toLowerCase().includes(ledgerSearch.toLowerCase()));


  const paidPercent = selectedStudent.totalDue > 0 ? Math.round((selectedStudent.totalPaid / selectedStudent.totalDue) * 100) : 0;

  const highestDueStudents = [
    { name: 'George Adams', class: 'Class 11-A', due: 16000 },
    { name: 'Ethan Hunt', class: 'Class 10-B', due: 14500 },
    { name: 'Caleb Rivers', class: 'Class 9-B', due: 11000 },
    { name: 'Hannah Blake', class: 'Class 6-B', due: 8250 },
    { name: 'Julia Roberts', class: 'Class 5-C', due: 7500 },
  ];

  const pendingRefundsList = MOCK_REFUNDS.filter(r => r.status === 'Requested' || r.status === 'Approved');
  const recentTransactions = MOCK_TRANSACTIONS.slice(0, 6);

  // ══════════════════════════════════════════════════════════════
  // RENDER — OVERVIEW TAB
  // ══════════════════════════════════════════════════════════════

  const renderOverview = () => (
    <div className="space-y-10">
      {overviewLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Collection" value={`$${(totalCollected / 1000).toFixed(0)}k`} color="bg-brand-green" />
          <StatsCard label="Pending Dues" value={`$${(pendingDues / 1000).toFixed(0)}k`} color="bg-brand-orange" />
          <StatsCard label="Overdue" value={`$${(overdueAmt / 1000).toFixed(1)}k`} color="bg-primary" />
          <StatsCard label="Refunds" value="$14.2k" color="bg-brand-purple" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-8">
        <div className="flex flex-col space-y-4">
          {/* Extracted Chart Filter */}
          <div className="flex items-center gap-3 self-end">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#3A2C2B]/10 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#3A2C2B]/70" />
              <input 
                type="date" 
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-[#3A2C2B] outline-none cursor-pointer w-[110px]"
              />
            </div>
            <Badge variant="outline" className="bg-white border-[#3A2C2B]/10 font-black text-[9px] uppercase px-3 py-1.5 rounded-lg shadow-sm">2025-26</Badge>
          </div>
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[20px]">
            <CardHeader className="p-8 border-b border-border/50">
              <div>
                <CardTitle className="text-xl font-black uppercase text-[#3A2C2B]">Collection Trend</CardTitle>
                <CardDescription className="font-medium italic">Monthly collected vs pending vs overdue</CardDescription>
              </div>
            </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_COLLECTION_DATA}>
                  <defs>
                    <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} /><stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorPen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.3} /><stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                  <Area type="monotone" dataKey="collected" stroke={CHART_COLORS.success} strokeWidth={2.5} fillOpacity={1} fill="url(#colorCol)" name="Collected" />
                  <Area type="monotone" dataKey="pending" stroke={CHART_COLORS.warning} strokeWidth={2.5} fillOpacity={1} fill="url(#colorPen)" name="Pending" />
                  <Area type="monotone" dataKey="overdue" stroke={CHART_COLORS.error} strokeWidth={2} fillOpacity={0} name="Overdue" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise Collection */}
      <div className="flex flex-col space-y-4">
        {/* Extracted Chart Filter */}
        <div className="flex items-center gap-2 self-end bg-white px-3 py-1.5 rounded-xl border border-[#3A2C2B]/10 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-[#3A2C2B]/70" />
          <input 
            type="date" 
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-[#3A2C2B] outline-none cursor-pointer w-[110px]"
          />
        </div>
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[20px]">
          <CardHeader className="p-8 border-b border-border/50 flex flex-col">
            <div>
              <CardTitle className="text-xl font-black uppercase text-[#3A2C2B]">Class-wise Collection</CardTitle>
              <CardDescription className="font-medium italic">Collected vs pending by class group</CardDescription>
            </div>
          </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CLASS_WISE_COLLECTION}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F1DE', opacity: 0.5 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                <Bar dataKey="collected" fill={CHART_COLORS.success} radius={[6, 6, 0, 0]} name="Collected" />
                <Bar dataKey="pending" fill={CHART_COLORS.warning} radius={[6, 6, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      </div>
      </div>

      {/* Bottom: Recent Transactions + Highest Dues + Pending Refunds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-12 space-y-4">
          <div className="px-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black uppercase text-[#3A2C2B]">Recent Transactions</h3>
              <p className="text-xs font-medium text-muted-foreground italic">Latest financial activities</p>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                options={[
                  { label: 'All Types', value: 'All' },
                  { label: 'Credit', value: 'Credit' },
                  { label: 'Refund', value: 'Refund' },
                  { label: 'Failed', value: 'Failed' },
                  { label: 'Discount', value: 'Discount' }
                ]} 
                value={'All'} 
                onChange={() => {}} 
                className="h-10 bg-white border border-[#3A2C2B]/10 rounded-xl text-xs font-black min-w-[140px]" 
              />
              <div className="flex items-center bg-[#3A2C2B]/5 rounded-xl p-1 border border-[#3A2C2B]/10">
                <button onClick={() => setTableViewModes(p => ({ ...p, recent: 'table' }))} className={cn("p-1.5 rounded-lg transition-colors", tableViewModes.recent === 'table' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutList className="w-4 h-4" /></button>
                <button onClick={() => setTableViewModes(p => ({ ...p, recent: 'card' }))} className={cn("p-1.5 rounded-lg transition-colors", tableViewModes.recent === 'card' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {tableViewModes.recent === 'table' && (
            <div className="rounded-[20px] border border-[#3A2C2B]/10 bg-white shadow-sm overflow-hidden overflow-x-auto">
            <div className="bg-[#3A2C2B]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/70">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Student / Desc</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-right">Date</th>
                  </tr>
                </thead>
              </table>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-[#3A2C2B]/5">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-primary/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", txn.type === 'Credit' ? "bg-[#BFDDD8]" : txn.type === 'Refund' ? "bg-[#EBBDC2]" : txn.type === 'Failed' ? "bg-red-100" : txn.type === 'Discount' ? "bg-[#B1D3EC]" : "bg-[#F0E0AD]")}>
                          {txn.type === 'Credit' ? <ArrowDownRight className="w-3.5 h-3.5 text-[#3A2C2B]" /> : txn.type === 'Refund' ? <RefreshCw className="w-3.5 h-3.5 text-[#3A2C2B]" /> : txn.type === 'Failed' ? <AlertCircle className="w-3.5 h-3.5 text-red-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-[#3A2C2B]" />}
                        </div>
                        <Badge className={cn("rounded-md font-black text-[8px] uppercase px-2 py-0.5 border-none", txn.type === 'Credit' ? "bg-emerald-100 text-emerald-700" : txn.type === 'Failed' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700")}>{txn.type}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-[#3A2C2B] truncate">{txn.studentName}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">{txn.description.slice(0, 40)}...</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={cn("text-sm font-black tabular-nums", txn.type === 'Credit' ? "text-[#88AC88]" : txn.type === 'Failed' ? "text-red-500" : "text-[#3A2C2B]")}>{txn.type === 'Credit' ? '+' : ''}${txn.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{txn.date}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Card View */}
          {tableViewModes.recent === 'card' && (
          <div className="flex gap-3 overflow-x-auto snap-x no-scrollbar pb-4">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className={cn("p-4 rounded-2xl shadow-sm text-white relative overflow-hidden min-w-[280px] snap-center shrink-0", 
                txn.type === 'Credit' ? "bg-[#88AC88]" : 
                txn.type === 'Refund' ? "bg-[#EBBDC2] text-[#3A2C2B]" : 
                txn.type === 'Failed' ? "bg-[#3A2C2B]" : 
                txn.type === 'Discount' ? "bg-[#B1D3EC] text-[#3A2C2B]" : 
                "bg-[#F0E0AD] text-[#3A2C2B]"
              )}>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      {txn.type === 'Credit' ? <ArrowDownRight className="w-4 h-4" /> : 
                       txn.type === 'Refund' ? <RefreshCw className="w-4 h-4" /> : 
                       txn.type === 'Failed' ? <AlertCircle className="w-4 h-4" /> : 
                       <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <Badge className="bg-white/20 border-none rounded-lg text-[9px] font-black uppercase">{txn.type}</Badge>
                  </div>
                  <span className="text-[10px] font-black uppercase opacity-70">{txn.date}</span>
                </div>
                <div className="relative z-10 space-y-1">
                  <p className="text-sm font-black truncate">{txn.studentName}</p>
                  <p className="text-[10px] font-bold uppercase opacity-80 truncate">{txn.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 relative z-10 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Amount</span>
                  <span className="text-xl font-black tabular-nums">{txn.type === 'Credit' ? '+' : ''}${txn.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="px-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black uppercase text-[#3A2C2B]">Highest Dues</h3>
              <p className="text-xs font-medium text-muted-foreground italic">Students requiring follow-up</p>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                options={[
                  { label: 'Highest First', value: 'Highest' },
                  { label: 'Oldest First', value: 'Oldest' }
                ]} 
                value={'Highest'} 
                onChange={() => {}} 
                className="h-10 bg-white border border-[#3A2C2B]/10 rounded-xl text-xs font-black min-w-[140px]" 
              />
              <div className="flex items-center bg-[#3A2C2B]/5 rounded-xl p-1 border border-[#3A2C2B]/10">
                <button onClick={() => setTableViewModes(p => ({ ...p, dues: 'table' }))} className={cn("p-1.5 rounded-lg transition-colors", tableViewModes.dues === 'table' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutList className="w-4 h-4" /></button>
                <button onClick={() => setTableViewModes(p => ({ ...p, dues: 'card' }))} className={cn("p-1.5 rounded-lg transition-colors", tableViewModes.dues === 'card' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          {tableViewModes.dues === 'table' && (
          <div className="rounded-[20px] border border-[#3A2C2B]/10 bg-white shadow-sm overflow-hidden overflow-x-auto">
            <div className="bg-[#3A2C2B]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/70">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Class</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-right">Amount Due</th>
                  </tr>
                </thead>
              </table>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-[#3A2C2B]/5">
                {highestDueStudents.map((stu, i) => (
                  <tr key={i} className="hover:bg-primary/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3A2C2B]/5 flex items-center justify-center text-[10px] font-black text-[#3A2C2B]">{stu.name.split(' ').map(n => n[0]).join('')}</div>
                        <p className="text-xs font-black text-[#3A2C2B] truncate">{stu.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[9px] font-bold text-muted-foreground uppercase">{stu.class}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-[#E63946] tabular-nums">${stu.due.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Card View */}
          {tableViewModes.dues === 'card' && (
          <div className="flex gap-3 overflow-x-auto snap-x no-scrollbar pb-4">
            {highestDueStudents.map((stu, i) => (
              <div key={i} className="p-4 rounded-2xl shadow-sm text-white relative overflow-hidden bg-[#3A2C2B] min-w-[260px] snap-center shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <AlertCircle className="w-16 h-16" />
                </div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black backdrop-blur-md">
                      {stu.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-black truncate">{stu.name}</p>
                      <p className="text-[10px] font-bold uppercase opacity-80">{stu.class}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 relative z-10 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Amount Due</span>
                  <span className="text-xl font-black tabular-nums">${stu.due.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="px-2"><h3 className="text-xl font-black uppercase text-[#3A2C2B]">Pending Refunds</h3><p className="text-xs font-medium text-muted-foreground italic">Awaiting processing</p></div>
          <div className="space-y-3">
            {pendingRefundsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white/40 rounded-[24px] border border-dashed border-border"><RefreshCw className="w-8 h-8 text-muted-foreground/20 mb-3" /><p className="text-xs font-black text-[#3A2C2B]/40">No Pending Refunds</p></div>
            ) : pendingRefundsList.map((ref) => (
              <div key={ref.id} className="p-4 rounded-2xl bg-white border border-[#3A2C2B]/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2"><p className="text-xs font-black text-[#3A2C2B]">{ref.studentName}</p><Badge variant={ref.status === 'Approved' ? 'brand-green' : 'brand-orange'} className="rounded-lg font-black text-[8px] uppercase">{ref.status}</Badge></div>
                <p className="text-[9px] font-bold text-muted-foreground mb-2 truncate">{ref.reason}</p>
                <div className="flex items-center justify-between"><span className="text-sm font-black text-[#A78BFA]">${ref.amount.toLocaleString()}</span><span className="text-[8px] font-bold text-muted-foreground uppercase">{ref.requestDate}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — FEE STRUCTURES TAB
  // ══════════════════════════════════════════════════════════════

  const renderFeeStructures = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-black uppercase text-[#3A2C2B]">Fee Structures</h3><p className="text-xs font-medium text-muted-foreground italic">Manage recurring and one-time fee categories</p></div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search..." className="pl-10 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-full" value={feeSearch} onChange={(e) => setFeeSearch(e.target.value)} /></div>
          <div className="w-36"><Select placeholder="Type" options={[{ label: 'All Types', value: 'All' }, { label: 'Academic', value: 'Academic' }, { label: 'Transport', value: 'Transport' }, { label: 'Hostel', value: 'Hostel' }, { label: 'Admission', value: 'Admission' }, { label: 'Examination', value: 'Examination' }, { label: 'Co-curricular', value: 'Co-curricular' }]} value={feeTypeFilter} onChange={setFeeTypeFilter} className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl" /></div>
          <div className="flex items-center bg-[#3A2C2B]/5 rounded-xl p-1 border border-[#3A2C2B]/10 h-11">
            <button onClick={() => setTableViewModes(p => ({ ...p, structures: 'table' }))} className={cn("p-1.5 rounded-lg transition-colors h-full", tableViewModes.structures === 'table' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutList className="w-4 h-4" /></button>
            <button onClick={() => setTableViewModes(p => ({ ...p, structures: 'card' }))} className={cn("p-1.5 rounded-lg transition-colors h-full", tableViewModes.structures === 'card' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <Button onClick={() => setShowAddFeeModal(true)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Add Structure</Button>
        </div>
      </div>

      {/* Table View */}
      {tableViewModes.structures === 'table' && (
      <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex-col overflow-hidden">
        <div className="overflow-x-auto no-scrollbar"><div className="min-w-[900px] flex flex-col">
          <div className="bg-[#3A2C2B] shrink-0"><table className="w-full text-left table-fixed"><thead><tr className="text-white">
            <th className="w-[22%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Fee Name</th>
            <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Type</th>
            <th className="w-[10%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">Amount</th>
            <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-center">Frequency</th>
            <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Due Date</th>
            <th className="w-[18%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Classes</th>
            <th className="w-[14%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">Actions</th>
          </tr></thead></table></div>
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '450px' }}><table className="w-full text-left table-fixed"><tbody className="divide-y divide-[#3A2C2B]/5">
            {filteredFees.length === 0 ? (
              <tr><td colSpan={7} className="py-20 text-center"><div className="flex flex-col items-center gap-3"><Search className="w-8 h-8 text-muted-foreground/20" /><p className="text-sm font-black text-[#3A2C2B]">No Fee Structures Found</p></div></td></tr>
            ) : filteredFees.map((fee) => (
              <tr key={fee.id} className={cn("hover:bg-white/60 transition-colors group", !fee.isActive && "opacity-50")}>
                <td className="w-[22%] px-8 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-primary" /></div><div><p className="text-sm font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{fee.name}</p><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{fee.id}</p></div></div></td>
                <td className="w-[12%] px-6 py-5"><Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase">{fee.type}</Badge></td>
                <td className="w-[10%] px-6 py-5 text-right text-sm font-black text-primary tabular-nums">${fee.amount.toLocaleString()}</td>
                <td className="w-[12%] px-6 py-5 text-center"><span className={cn("inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase", frequencyColors[fee.frequency])}>{fee.frequency}</span></td>
                <td className="w-[12%] px-6 py-5"><div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground"><Calendar className="w-3 h-3" />{fee.dueDate}</div></td>
                <td className="w-[18%] px-6 py-5"><div className="flex flex-wrap gap-1">{fee.applicableClasses.slice(0, 2).map((c, i) => <span key={i} className="px-2 py-0.5 bg-[#3A2C2B]/5 rounded-md text-[8px] font-black uppercase text-[#3A2C2B]/70">{c}</span>)}{fee.applicableClasses.length > 2 && <span className="px-2 py-0.5 bg-primary/10 rounded-md text-[8px] font-black text-primary">+{fee.applicableClasses.length - 2}</span>}</div></td>
                <td className="w-[14%] px-6 py-5 text-right"><div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditDrawer(fee)} className="w-8 h-8 rounded-lg bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 flex items-center justify-center transition-colors"><Edit className="w-3.5 h-3.5 text-[#3A2C2B]" /></button>
                  <button onClick={() => toggleFeeActive(fee.id)} className="w-8 h-8 rounded-lg hover:bg-[#3A2C2B]/5 flex items-center justify-center transition-colors">{fee.isActive ? <ToggleRight className="w-5 h-5 text-[#88AC88]" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}</button>
                </div></td>
              </tr>
            ))}
          </tbody></table></div>
        </div></div>
        <div className="px-8 py-5 border-t border-[#3A2C2B]/5 flex items-center justify-between bg-secondary/5"><span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Showing <span className="text-[#3A2C2B]">{filteredFees.length}</span> of <span className="text-[#3A2C2B]">{feeStructures.length}</span></span></div>
      </div>
      )}

      {/* Card View */}
      {tableViewModes.structures === 'card' && (
      <>
      <div className="flex gap-3 overflow-x-auto snap-x no-scrollbar pb-4">
        {filteredFees.length === 0 ? (
          <div className="py-12 text-center bg-white/40 rounded-[24px] border border-dashed border-border min-w-[280px]">
            <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-black text-[#3A2C2B]">No Fee Structures Found</p>
          </div>
        ) : filteredFees.map((fee) => (
          <div key={fee.id} className={cn("p-4 rounded-2xl shadow-sm text-white relative overflow-hidden min-w-[280px] snap-center shrink-0",
            fee.type === 'Academic' ? "bg-[#88AC88]" :
            fee.type === 'Transport' ? "bg-[#F0E0AD] text-[#3A2C2B]" :
            fee.type === 'Hostel' ? "bg-[#3A2C2B]" :
            fee.type === 'Examination' ? "bg-[#B1D3EC] text-[#3A2C2B]" :
            "bg-[#EBBDC2] text-[#3A2C2B]",
            !fee.isActive && "opacity-50"
          )}>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <Badge className="bg-white/20 border-none rounded-lg text-[9px] font-black uppercase">{fee.type}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditDrawer(fee)} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleFeeActive(fee.id)} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors">{fee.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="relative z-10 space-y-1 mb-3">
              <p className="text-sm font-black truncate">{fee.name}</p>
              <p className="text-[10px] font-bold uppercase opacity-80">{fee.id}</p>
            </div>
            <div className="relative z-10 mb-3 flex flex-wrap gap-1">
              {fee.applicableClasses.map((c, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/20 rounded-md text-[8px] font-black uppercase backdrop-blur-md">{c}</span>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 relative z-10 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Amount</span>
                <span className="text-xl font-black tabular-nums">${fee.amount.toLocaleString()}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black uppercase opacity-70 tracking-widest">{fee.frequency}</span>
                <span className="text-[10px] font-bold uppercase opacity-90">Due: {fee.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-4"><span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Showing <span className="text-[#3A2C2B]">{filteredFees.length}</span> of <span className="text-[#3A2C2B]">{feeStructures.length}</span></span></div>
      </>
      )}

      {/* Add Fee Modal */}
      <Modal isOpen={showAddFeeModal} onClose={() => setShowAddFeeModal(false)} title="Add Fee Structure" description="Create a new fee category">
        <div className="space-y-5">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Fee Name</label><Input value={newFee.name} onChange={(e) => setNewFee(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Tuition Fee" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Type</label><Select options={[{ label: 'Academic', value: 'Academic' }, { label: 'Transport', value: 'Transport' }, { label: 'Hostel', value: 'Hostel' }, { label: 'Examination', value: 'Examination' }]} value={newFee.type} onChange={(v) => setNewFee(p => ({ ...p, type: v }))} className="h-12 bg-[#3A2C2B]/5 border-none rounded-2xl" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Amount ($)</label><Input type="number" value={newFee.amount} onChange={(e) => setNewFee(p => ({ ...p, amount: e.target.value }))} placeholder="5000" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Frequency</label><Select options={[{ label: 'Monthly', value: 'Monthly' }, { label: 'Quarterly', value: 'Quarterly' }, { label: 'Annually', value: 'Annually' }, { label: 'One-time', value: 'One-time' }]} value={newFee.frequency} onChange={(v) => setNewFee(p => ({ ...p, frequency: v as FeeFrequency }))} className="h-12 bg-[#3A2C2B]/5 border-none rounded-2xl" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Due Date</label><Input type="date" value={newFee.dueDate} onChange={(e) => setNewFee(p => ({ ...p, dueDate: e.target.value }))} className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          </div>
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Classes (comma-separated)</label><Input value={newFee.applicableClasses} onChange={(e) => setNewFee(p => ({ ...p, applicableClasses: e.target.value }))} placeholder="Class 1-5, Class 6-8" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => setShowAddFeeModal(false)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px]">Cancel</Button><Button onClick={handleAddFee} disabled={!newFee.name || !newFee.amount} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Create</Button></div>
      </Modal>

      {/* Edit Drawer */}
      {editDrawer && (
        <div className="fixed inset-0 z-[9999] flex justify-end backdrop-blur-2xl bg-black/10 animate-in fade-in duration-300" onClick={() => setEditDrawer(null)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-border/50 flex items-center justify-between sticky top-0 bg-white z-10"><div><h2 className="text-xl font-black text-[#3A2C2B] uppercase">Edit Fee</h2><p className="text-xs font-bold text-muted-foreground">{editDrawer.id}</p></div><button onClick={() => setEditDrawer(null)} className="w-10 h-10 rounded-xl bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 flex items-center justify-center transition-all hover:rotate-90 duration-500"><X className="w-5 h-5 text-[#3A2C2B]" /></button></div>
            <div className="p-8 space-y-6">
              <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Fee Name</label><Input defaultValue={editDrawer.name} className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Amount ($)</label><Input type="number" defaultValue={editDrawer.amount} className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Frequency</label><Select options={[{ label: 'Monthly', value: 'Monthly' }, { label: 'Quarterly', value: 'Quarterly' }, { label: 'Annually', value: 'Annually' }, { label: 'One-time', value: 'One-time' }]} value={editDrawer.frequency} className="h-12 bg-[#3A2C2B]/5 border-none rounded-2xl" /></div>
              <div className="flex gap-3 pt-4"><Button variant="outline" onClick={() => setEditDrawer(null)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px]">Cancel</Button><Button onClick={() => setEditDrawer(null)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Save</Button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — STUDENT FEES TAB
  // ══════════════════════════════════════════════════════════════

  const renderStudentFees = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Student Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[150px]"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search student..." className="pl-10 h-10 rounded-xl bg-white border border-border/50 text-xs font-bold shadow-sm" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} /></div>
            <div className="flex items-center bg-white rounded-xl p-1 border border-border/50 h-10 shrink-0">
              <button onClick={() => setTableViewModes(p => ({ ...p, students: 'table' }))} className={cn("p-1.5 rounded-lg transition-colors h-full", tableViewModes.students !== 'card' ? "bg-primary/10 shadow-sm text-primary" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutList className="w-4 h-4" /></button>
              <button onClick={() => setTableViewModes(p => ({ ...p, students: 'card' }))} className={cn("p-1.5 rounded-lg transition-colors h-full", tableViewModes.students === 'card' ? "bg-primary/10 shadow-sm text-primary" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutGrid className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select options={[{ label: 'All Years', value: 'All' }, { label: '2024-25', value: '2024-25' }, { label: '2025-26', value: '2025-26' }]} value={studentYearFilter} onChange={setStudentYearFilter} className="h-10 bg-white border border-border/50 rounded-xl text-[10px]" placeholder="Academic Year" />
            <Select options={[{ label: 'All Classes', value: 'All' }, { label: 'Class 9', value: 'Class 9' }, { label: 'Class 10', value: 'Class 10' }, { label: 'Class 11', value: 'Class 11' }]} value={studentClassFilter} onChange={setStudentClassFilter} className="h-10 bg-white border border-border/50 rounded-xl text-[10px]" placeholder="Class" />
            <Select options={[{ label: 'All Sections', value: 'All' }, { label: 'Sec A', value: 'A' }, { label: 'Sec B', value: 'B' }, { label: 'Sec C', value: 'C' }]} value={studentSectionFilter} onChange={setStudentSectionFilter} className="h-10 bg-white border border-border/50 rounded-xl text-[10px]" placeholder="Section" />
            <Select options={[{ label: 'All Depts', value: 'All' }, { label: 'Science', value: 'Science' }, { label: 'Arts', value: 'Arts' }, { label: 'Commerce', value: 'Commerce' }]} value={studentDeptFilter} onChange={setStudentDeptFilter} className="h-10 bg-white border border-border/50 rounded-xl text-[10px]" placeholder="Department" />
          </div>

          {tableViewModes.students === 'card' ? (
            <div className="flex gap-3 overflow-x-auto snap-x no-scrollbar pb-4">
              {filteredStudents.length === 0 ? (
                <div className="w-full py-8 text-center bg-white rounded-2xl border border-dashed border-[#3A2C2B]/20"><p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No Students Found</p></div>
              ) : filteredStudents.map((stu) => (
                <button key={stu.id} onClick={() => setSelectedStudent(stu)} className={cn("p-4 rounded-2xl shadow-sm relative overflow-hidden min-w-[220px] snap-center shrink-0 border transition-all text-left", selectedStudent.id === stu.id ? "bg-[#3A2C2B] text-white border-[#3A2C2B]" : "bg-white border-[#3A2C2B]/10 hover:border-primary/50 text-[#3A2C2B]")}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0", selectedStudent.id === stu.id ? "bg-white/10" : "bg-primary/5 text-primary")}>{stu.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-black truncate", selectedStudent.id === stu.id ? "text-white" : "text-[#3A2C2B]")}>{stu.name}</p>
                      <p className={cn("text-[9px] font-bold uppercase tracking-wider", selectedStudent.id === stu.id ? "text-white/70" : "text-muted-foreground")}>{stu.class} · {stu.section}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-current/10 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Balance</span>
                    {stu.balance > 0 ? <span className={cn("text-sm font-black tabular-nums", selectedStudent.id === stu.id ? "text-[#EBBDC2]" : "text-[#3A2C2B]")}>${stu.balance.toLocaleString()}</span> : <Badge className="bg-[#88AC88]/20 text-[#88AC88] rounded-md text-[8px] font-black uppercase border-none">Clear</Badge>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-[#3A2C2B]/10 bg-white shadow-sm overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredStudents.length === 0 ? (
                <div className="py-8 text-center"><p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No Students Found</p></div>
              ) : filteredStudents.map((stu) => (
                <button key={stu.id} onClick={() => setSelectedStudent(stu)} className={cn("w-full flex items-center gap-4 px-5 py-4 border-b border-[#3A2C2B]/5 last:border-0 transition-all text-left hover:bg-primary/[0.03]", selectedStudent.id === stu.id && "bg-primary/5 border-l-4 border-l-primary")}>
                  <div className="w-10 h-10 rounded-xl bg-[#3A2C2B]/5 flex items-center justify-center text-xs font-black text-primary shrink-0">{stu.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-black text-[#3A2C2B] truncate">{stu.name}</p><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stu.class} · {stu.section}</p></div>
                  <div className="text-right shrink-0">{stu.balance > 0 ? <span className="text-xs font-black text-[#3A2C2B] tabular-nums">${stu.balance.toLocaleString()}</span> : <Badge className="bg-[#88AC88]/20 text-[#88AC88] rounded-md text-[8px] font-black uppercase border-none">Clear</Badge>}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Student Profile */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-xl rounded-[24px] bg-gradient-to-br from-[#3A2C2B] to-[#5A4C4B] text-white overflow-hidden relative">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black shadow-inner ring-4 ring-white/10 shrink-0">{selectedStudent.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-3 mt-1 mb-4 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{selectedStudent.id}</span><span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{selectedStudent.class} · Sec {selectedStudent.section}</span><span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Roll: {selectedStudent.rollNo}</span>
                  </div>
                  <div className="flex items-center gap-6 text-white/80"><div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /><span className="text-xs font-bold">{selectedStudent.parent}</span></div><div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /><span className="text-xs font-bold">{selectedStudent.parentPhone}</span></div></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"><p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Total Due</p><p className="text-xl font-black tabular-nums">${selectedStudent.totalDue.toLocaleString()}</p></div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"><p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Total Paid</p><p className="text-xl font-black tabular-nums text-[#88AC88]">${selectedStudent.totalPaid.toLocaleString()}</p></div>
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"><p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Balance</p><p className={cn("text-xl font-black tabular-nums", selectedStudent.balance > 0 ? "text-[#E63946]" : "text-[#88AC88]")}>${selectedStudent.balance.toLocaleString()}</p></div>
              </div>
              <div className="mt-4"><div className="flex items-center justify-between mb-2"><span className="text-[9px] font-black uppercase tracking-widest text-white/50">Payment Progress</span><span className="text-xs font-black">{paidPercent}%</span></div><div className="h-2 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#88AC88] rounded-full transition-all duration-1000" style={{ width: `${paidPercent}%` }} /></div></div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2"><h4 className="text-lg font-black uppercase text-[#3A2C2B]">Invoice History</h4><Button variant="outline" className="h-9 rounded-xl px-4 font-black text-[9px] uppercase border-[#3A2C2B]/10"><Download className="w-3 h-3 mr-2" /> Export</Button></div>
            <div className="rounded-[20px] border border-[#3A2C2B]/10 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto no-scrollbar"><div className="min-w-[600px]">
                <div className="bg-[#3A2C2B]"><table className="w-full text-left table-fixed"><thead><tr className="text-white/70"><th className="w-[25%] px-6 py-4 text-[9px] font-black uppercase tracking-widest">Invoice</th><th className="w-[25%] px-6 py-4 text-[9px] font-black uppercase tracking-widest">Amount</th><th className="w-[25%] px-6 py-4 text-[9px] font-black uppercase tracking-widest">Due Date</th><th className="w-[25%] px-6 py-4 text-[9px] font-black uppercase tracking-widest text-right">Status</th></tr></thead></table></div>
                <table className="w-full text-left table-fixed"><tbody className="divide-y divide-[#3A2C2B]/5">
                  {studentInvoices.length === 0 ? <tr><td colSpan={4} className="py-12 text-center"><p className="text-xs font-black text-[#3A2C2B]/30">No invoices found</p></td></tr> : studentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-primary/[0.02] transition-colors">
                      <td className="w-[25%] px-6 py-4"><p className="text-xs font-black text-[#3A2C2B]">{inv.invoiceNo}</p><p className="text-[8px] font-bold text-muted-foreground uppercase">{inv.generatedDate}</p></td>
                      <td className="w-[25%] px-6 py-4"><p className="text-xs font-black text-[#3A2C2B] tabular-nums">${inv.total.toLocaleString()}</p>{inv.paid > 0 && inv.paid < inv.total && <p className="text-[8px] font-bold text-[#88AC88]">Paid: ${inv.paid.toLocaleString()}</p>}</td>
                      <td className="w-[25%] px-6 py-4 text-xs font-bold text-muted-foreground">{inv.dueDate}</td>
                      <td className="w-[25%] px-6 py-4 text-right"><Badge className={cn("rounded-md font-black text-[8px] uppercase px-2 py-0.5 border-none", statusColor(inv.status))}>{inv.status}</Badge></td>
                    </tr>
                  ))}
                </tbody></table>
              </div></div>
            </div>
          </div>

          {/* Payment Timeline */}
          <div className="space-y-3">
            <h4 className="text-lg font-black uppercase text-[#3A2C2B] px-2">Payment History</h4>
            {studentPayments.length === 0 ? <div className="py-12 text-center bg-white/40 rounded-[20px] border border-dashed border-border"><CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/20" /><p className="text-xs font-black text-[#3A2C2B]/30">No payments recorded</p></div> : (
              <div className="space-y-3">{studentPayments.map((pay, i) => (
                <div key={pay.id} className="flex gap-4">
                  <div className="flex flex-col items-center"><div className={cn("w-3 h-3 rounded-full shrink-0 mt-1.5", pay.status === 'Success' ? "bg-[#88AC88]" : pay.status === 'Failed' ? "bg-red-400" : "bg-amber-400")} />{i < studentPayments.length - 1 && <div className="w-px flex-1 bg-[#3A2C2B]/10 my-1" />}</div>
                  <div className="flex-1 pb-4 flex items-start justify-between p-4 rounded-2xl bg-white border border-[#3A2C2B]/5 shadow-sm">
                    <div><p className="text-xs font-black text-[#3A2C2B]">${pay.amount.toLocaleString()} via {pay.method}</p><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{pay.receiptNo} · {pay.date}</p></div>
                    <div className="flex items-center gap-2"><Badge className={cn("rounded-md font-black text-[8px] uppercase px-2 py-0.5 border-none", statusColor(pay.status))}>{pay.status}</Badge>{pay.status === 'Success' && <button className="w-7 h-7 rounded-lg bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 flex items-center justify-center"><Download className="w-3 h-3 text-[#3A2C2B]" /></button>}</div>
                  </div>
                </div>
              ))}</div>
            )}
          </div>

          {/* Refunds */}
          {studentRefunds.length > 0 && (
            <div className="space-y-3"><h4 className="text-lg font-black uppercase text-[#3A2C2B] px-2">Refunds</h4><div className="space-y-3">{studentRefunds.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-[#EBBDC2]/20 border border-[#EBBDC2]/30"><div className="flex items-center justify-between mb-2"><p className="text-xs font-black text-[#3A2C2B]">${r.amount.toLocaleString()}</p><Badge className={cn("rounded-md font-black text-[8px] uppercase px-2 py-0.5 border-none", statusColor(r.status))}>{r.status}</Badge></div><p className="text-[9px] font-bold text-muted-foreground">{r.reason}</p></div>
            ))}</div></div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — INVOICES TAB
  // ══════════════════════════════════════════════════════════════

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-black uppercase text-[#3A2C2B]">Invoices</h3><p className="text-xs font-medium text-muted-foreground italic">Manage and track all student invoices</p></div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search invoices..." className="pl-10 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-full" value={invSearch} onChange={(e) => setInvSearch(e.target.value)} /></div>
          <Button variant="outline" className="h-11 rounded-2xl px-4 font-black uppercase text-[10px] border-[#3A2C2B]/10"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <div className="flex items-center bg-[#3A2C2B]/5 rounded-xl p-1 border border-[#3A2C2B]/10 h-11">
            <button onClick={() => setTableViewModes(p => ({ ...p, invoices: 'table' }))} className={cn("p-1.5 rounded-lg transition-colors h-full", tableViewModes.invoices === 'table' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutList className="w-4 h-4" /></button>
            <button onClick={() => setTableViewModes(p => ({ ...p, invoices: 'card' }))} className={cn("p-1.5 rounded-lg transition-colors h-full", tableViewModes.invoices === 'card' ? "bg-white shadow-sm text-[#3A2C2B]" : "text-muted-foreground hover:text-[#3A2C2B]")}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <Button onClick={() => setShowGenInvoice(true)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Generate</Button>
        </div>
      </div>

      {/* Status Filter Dropdown */}
      <div className="flex items-center gap-2 flex-wrap bg-white/40 backdrop-blur-sm p-2 rounded-2xl border border-border/50 max-w-sm">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Filter by Status</span>
        <Select 
          options={[
            { label: 'All Statuses', value: 'All' },
            { label: 'Paid', value: 'Paid' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Partial', value: 'Partial' },
            { label: 'Overdue', value: 'Overdue' },
            { label: 'Cancelled', value: 'Cancelled' }
          ]} 
          value={invStatusFilter} 
          onChange={(val) => setInvStatusFilter(val as 'All' | InvoiceStatus)} 
          className="h-10 bg-white border border-[#3A2C2B]/10 rounded-xl text-xs font-black min-w-[150px]" 
        />
      </div>

      {selectedInvRows.size > 0 && (
        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/20"><span className="text-xs font-black text-primary">{selectedInvRows.size} selected</span><Button variant="outline" size="sm" className="rounded-xl h-8 px-4 font-black text-[9px] uppercase border-primary/20 text-primary"><Download className="w-3 h-3 mr-1.5" /> Download All</Button><button onClick={() => setSelectedInvRows(new Set())} className="text-[10px] font-black uppercase text-muted-foreground ml-auto">Clear</button></div>
      )}

      {/* Table View */}
      {tableViewModes.invoices === 'table' && (
      <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex-col overflow-hidden">
        <div className="overflow-x-auto no-scrollbar"><div className="min-w-[1000px] flex flex-col">
          <div className="bg-[#3A2C2B] shrink-0"><table className="w-full text-left table-fixed"><thead><tr className="text-white">
            <th className="w-[5%] px-4 py-5"><button onClick={() => { selectedInvRows.size === filteredInvoices.length ? setSelectedInvRows(new Set()) : setSelectedInvRows(new Set(filteredInvoices.map(i => i.id))); }} className="text-white/70 hover:text-white">{selectedInvRows.size === filteredInvoices.length && filteredInvoices.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button></th>
            <th className="w-[15%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Invoice No</th>
            <th className="w-[20%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Student</th>
            <th className="w-[12%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">Total</th>
            <th className="w-[12%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">Balance</th>
            <th className="w-[12%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Due Date</th>
            <th className="w-[10%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-center">Status</th>
            <th className="w-[14%] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">Actions</th>
          </tr></thead></table></div>
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '450px' }}><table className="w-full text-left table-fixed"><tbody className="divide-y divide-[#3A2C2B]/5">
            {filteredInvoices.length === 0 ? <tr><td colSpan={8} className="py-20 text-center"><FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" /><p className="text-sm font-black text-[#3A2C2B]">No Invoices Found</p></td></tr> : filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/60 transition-colors group">
                <td className="w-[5%] px-4 py-5"><button onClick={() => toggleInvRow(inv.id)}>{selectedInvRows.has(inv.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-[#3A2C2B]/20" />}</button></td>
                <td className="w-[15%] px-4 py-5"><code className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-tight">{inv.invoiceNo}</code></td>
                <td className="w-[20%] px-4 py-5"><p className="text-xs font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{inv.studentName}</p><p className="text-[9px] font-bold text-muted-foreground uppercase">{inv.class}</p></td>
                <td className="w-[12%] px-4 py-5 text-right text-sm font-black text-[#3A2C2B] tabular-nums">${inv.total.toLocaleString()}</td>
                <td className="w-[12%] px-4 py-5 text-right"><span className={cn("text-sm font-black tabular-nums", inv.balance > 0 ? "text-red-500" : "text-[#88AC88]")}>${inv.balance.toLocaleString()}</span></td>
                <td className="w-[12%] px-4 py-5 text-xs font-bold text-muted-foreground">{inv.dueDate}</td>
                <td className="w-[10%] px-4 py-5 text-center"><Badge className={cn("rounded-md font-black text-[8px] uppercase px-2 py-0.5 border-none", statusColor(inv.status))}>{inv.status}</Badge></td>
                <td className="w-[14%] px-4 py-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => setPreviewInvoice(inv)} title="View Invoice" className="w-8 h-8 rounded-lg bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 flex items-center justify-center"><Eye className="w-3.5 h-3.5 text-[#3A2C2B]" /></button><button title="Apply Discount" className="w-8 h-8 rounded-lg bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 flex items-center justify-center"><Tag className="w-3.5 h-3.5 text-[#3A2C2B]" /></button><button title="Download Invoice" className="w-8 h-8 rounded-lg bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 flex items-center justify-center"><Download className="w-3.5 h-3.5 text-[#3A2C2B]" /></button></div></td>
              </tr>
            ))}
          </tbody></table></div>
        </div></div>
        <div className="px-8 py-5 border-t border-[#3A2C2B]/5 flex items-center justify-between bg-secondary/5"><span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Showing <span className="text-[#3A2C2B]">{filteredInvoices.length}</span> of <span className="text-[#3A2C2B]">{MOCK_INVOICES.length}</span></span></div>
      </div>
      )}

      {/* Card View */}
      {tableViewModes.invoices === 'card' && (
      <>
      <div className="flex gap-3 overflow-x-auto snap-x no-scrollbar pb-4">
        {filteredInvoices.length === 0 ? (
          <div className="py-12 text-center bg-white/40 rounded-[24px] border border-dashed border-border min-w-[280px]">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm font-black text-[#3A2C2B]">No Invoices Found</p>
          </div>
        ) : filteredInvoices.map((inv) => (
          <div key={inv.id} className={cn("p-4 rounded-2xl shadow-sm text-white relative overflow-hidden min-w-[300px] snap-center shrink-0",
            inv.status === 'Paid' ? "bg-[#88AC88]" :
            inv.status === 'Overdue' ? "bg-[#3A2C2B]" :
            inv.status === 'Pending' ? "bg-[#F0E0AD] text-[#3A2C2B]" :
            inv.status === 'Partial' ? "bg-[#B1D3EC] text-[#3A2C2B]" :
            "bg-[#3A2C2B]"
          )}>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <button onClick={() => toggleInvRow(inv.id)} className="w-6 h-6 flex items-center justify-center">
                  {selectedInvRows.has(inv.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-50" />}
                </button>
                <code className="text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg uppercase tracking-tight">{inv.invoiceNo}</code>
              </div>
              <Badge className="bg-white/20 border-none rounded-lg text-[9px] font-black uppercase">{inv.status}</Badge>
            </div>
            <div className="relative z-10 space-y-1 mb-3">
              <p className="text-sm font-black truncate">{inv.studentName}</p>
              <p className="text-[10px] font-bold uppercase opacity-80">{inv.class}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 relative z-10 grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Total</span>
                <span className="text-sm font-black tabular-nums">${inv.total.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Balance</span>
                <span className="text-sm font-black tabular-nums">${inv.balance.toLocaleString()}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Due Date</span>
                <span className="text-[10px] font-bold uppercase opacity-90">{inv.dueDate}</span>
              </div>
            </div>
            <div className="relative z-10 mt-3 flex items-center justify-end gap-2">
              <button onClick={() => setPreviewInvoice(inv)} title="View Invoice" className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors"><Eye className="w-3.5 h-3.5" /></button>
              <button title="Apply Discount" className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors"><Tag className="w-3.5 h-3.5" /></button>
              <button title="Download Invoice" className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors"><Download className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-4"><span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Showing <span className="text-[#3A2C2B]">{filteredInvoices.length}</span> of <span className="text-[#3A2C2B]">{MOCK_INVOICES.length}</span></span></div>
      </>
      )}

      {/* Invoice Preview Modal */}
      {previewInvoice && <Modal isOpen={!!previewInvoice} onClose={() => setPreviewInvoice(null)} title="Invoice Preview" description={previewInvoice.invoiceNo} className="max-w-xl h-auto max-h-[90vh]">
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#3A2C2B]/5"><div className="flex items-center justify-between mb-4"><div><p className="text-lg font-black text-[#3A2C2B]">{previewInvoice.studentName}</p><p className="text-xs font-bold text-muted-foreground">{previewInvoice.class}</p></div><Badge className={cn("rounded-lg font-black text-[9px] uppercase px-3 py-1 border-none", statusColor(previewInvoice.status))}>{previewInvoice.status}</Badge></div><div className="grid grid-cols-2 gap-4 text-xs"><div><span className="text-[9px] font-black uppercase text-muted-foreground block">Generated</span><span className="font-bold">{previewInvoice.generatedDate}</span></div><div><span className="text-[9px] font-black uppercase text-muted-foreground block">Due Date</span><span className="font-bold">{previewInvoice.dueDate}</span></div></div></div>
          <div><h4 className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-3">Line Items</h4><div className="space-y-2">{previewInvoice.items.map((item, i) => <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#3A2C2B]/5"><span className="text-xs font-bold text-[#3A2C2B]">{item.name}</span><span className="text-sm font-black text-[#3A2C2B] tabular-nums">${item.amount.toLocaleString()}</span></div>)}</div></div>
          <div className="p-4 rounded-2xl bg-[#3A2C2B] text-white"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-black uppercase tracking-widest text-white/60">Total</span><span className="text-lg font-black tabular-nums">${previewInvoice.total.toLocaleString()}</span></div><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-black uppercase tracking-widest text-white/60">Paid</span><span className="text-sm font-black text-[#88AC88] tabular-nums">${previewInvoice.paid.toLocaleString()}</span></div><div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-white/60">Balance</span><span className="text-lg font-black text-[#E63946] tabular-nums">${previewInvoice.balance.toLocaleString()}</span></div></div>
        </div>
      </Modal>}

      {/* Generate Modal */}
      <Modal isOpen={showGenInvoice} onClose={() => setShowGenInvoice(false)} title="Generate Invoice" description="Create a new invoice for a student">
        <div className="space-y-5">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Student</label><Input placeholder="Search student name..." className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Fee Items</label><div className="space-y-2">{['Tuition Fee', 'Transport Fee', 'Lab Fee'].map((item) => <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-[#3A2C2B]/5"><div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /><span className="text-xs font-bold">{item}</span></div><Input placeholder="Amount" className="w-28 h-8 rounded-lg bg-white border-none text-xs font-bold text-right" /></div>)}</div></div>
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Due Date</label><Input type="date" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => setShowGenInvoice(false)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px]">Cancel</Button><Button onClick={() => setShowGenInvoice(false)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Generate</Button></div>
      </Modal>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — PAYMENTS TAB
  // ══════════════════════════════════════════════════════════════

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-black uppercase text-[#3A2C2B]">Payments</h3><p className="text-xs font-medium text-muted-foreground italic">Collect and track all fee payments</p></div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search payments..." className="pl-10 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-full" value={paySearch} onChange={(e) => setPaySearch(e.target.value)} /></div>
          <Button onClick={() => setShowCollectPayment(true)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"><DollarSign className="w-4 h-4 mr-2" /> Collect Payment</Button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Today's Collection" value="$28.4k" color="bg-brand-green" />
        <StatsCard label="Transactions" value="14" color="bg-brand-blue" />
        <StatsCard label="Successful" value="12" color="bg-brand-green" />
        <StatsCard label="Failed" value="2" color="bg-primary" />
      </div>

      {/* Payment Success/Fail Animation */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-2xl bg-black/20 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-12 shadow-2xl text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-[#88AC88] mx-auto mb-6 flex items-center justify-center animate-bounce"><CheckCircle2 className="w-10 h-10 text-white" /></div>
            <h3 className="text-2xl font-black text-[#3A2C2B] mb-2">Payment Successful!</h3>
            <p className="text-sm font-bold text-muted-foreground">Receipt has been generated</p>
          </div>
        </div>
      )}
      {paymentFailed && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-2xl bg-black/20 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-12 shadow-2xl text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-[#E63946] mx-auto mb-6 flex items-center justify-center"><XCircle className="w-10 h-10 text-white" /></div>
            <h3 className="text-2xl font-black text-[#3A2C2B] mb-2">Payment Failed</h3>
            <p className="text-sm font-bold text-muted-foreground">Please try again or use a different method</p>
          </div>
        </div>
      )}

      {/* Payment Table */}
      <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto no-scrollbar"><div className="min-w-[900px] flex flex-col">
          <div className="bg-[#3A2C2B] shrink-0"><table className="w-full text-left table-fixed"><thead><tr className="text-white">
            <th className="w-[15%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Receipt</th>
            <th className="w-[20%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Student</th>
            <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">Amount</th>
            <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-center">Method</th>
            <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Date</th>
            <th className="w-[12%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-center">Status</th>
            <th className="w-[17%] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">Ref</th>
          </tr></thead></table></div>
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '400px' }}><table className="w-full text-left table-fixed"><tbody className="divide-y divide-[#3A2C2B]/5">
            {filteredPayments.map((pay) => (
              <tr key={pay.id} className="hover:bg-white/60 transition-colors group">
                <td className="w-[15%] px-6 py-5"><code className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase">{pay.receiptNo}</code></td>
                <td className="w-[20%] px-6 py-5"><p className="text-xs font-black text-[#3A2C2B]">{pay.studentName}</p><p className="text-[9px] font-bold text-muted-foreground uppercase">{pay.invoiceNo}</p></td>
                <td className="w-[12%] px-6 py-5 text-right text-sm font-black text-[#3A2C2B] tabular-nums">${pay.amount.toLocaleString()}</td>
                <td className="w-[12%] px-6 py-5 text-center"><div className="flex items-center justify-center gap-1.5">{pay.method === 'UPI' ? <Smartphone className="w-3 h-3" /> : pay.method === 'Card' ? <CreditCard className="w-3 h-3" /> : pay.method === 'Bank Transfer' ? <Building className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}<span className="text-[9px] font-black uppercase">{pay.method}</span></div></td>
                <td className="w-[12%] px-6 py-5 text-xs font-bold text-muted-foreground">{pay.date}</td>
                <td className="w-[12%] px-6 py-5 text-center"><Badge className={cn("rounded-md font-black text-[8px] uppercase px-2 py-0.5 border-none", statusColor(pay.status))}>{pay.status}</Badge></td>
                <td className="w-[17%] px-6 py-5 text-right"><span className="text-[9px] font-bold text-muted-foreground font-mono">{pay.transactionRef.slice(0, 16)}</span></td>
              </tr>
            ))}
          </tbody></table></div>
        </div></div>
      </div>

      {/* Collect Payment Modal */}
      <Modal isOpen={showCollectPayment} onClose={() => setShowCollectPayment(false)} title="Collect Payment" description="Record a fee payment">
        <div className="space-y-5">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Student(s) / Invoice(s)</label><Input placeholder="Search student names or invoice numbers..." className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Amount ($)</label><Input type="number" placeholder="Enter partial or full amount" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Payment Method</label><Select options={[{ label: 'Cash', value: 'Cash' }, { label: 'UPI', value: 'UPI' }, { label: 'Card', value: 'Card' }, { label: 'Bank Transfer', value: 'Bank Transfer' }]} value="Cash" className="h-12 bg-[#3A2C2B]/5 border-none rounded-2xl" /></div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200"><AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /><p className="text-[10px] font-bold text-amber-700">Partial payments are allowed. Remaining balance will be updated automatically.</p></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="multiChild" className="w-4 h-4 rounded text-[#3A2C2B] focus:ring-[#3A2C2B] border-[#3A2C2B]/20" /><label htmlFor="multiChild" className="text-xs font-bold text-[#3A2C2B]">This payment covers multiple children (Siblings)</label></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="simFail" className="w-4 h-4 rounded text-red-500 focus:ring-red-500 border-red-200" /><label htmlFor="simFail" className="text-xs font-bold text-red-600">Force Gateway Failure (Testing)</label></div>
        </div>
        <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => setShowCollectPayment(false)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px]">Cancel</Button><Button onClick={() => { const willFail = (document.getElementById('simFail') as HTMLInputElement)?.checked; setShowCollectPayment(false); if (willFail) { setPaymentFailed(true); setTimeout(() => setPaymentFailed(false), 3000); } else { setPaymentSuccess(true); setTimeout(() => setPaymentSuccess(false), 3000); } }} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Process Payment</Button></div>
      </Modal>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — REFUNDS TAB
  // ══════════════════════════════════════════════════════════════

  const renderRefunds = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-black uppercase text-[#3A2C2B]">Refunds</h3><p className="text-xs font-medium text-muted-foreground italic">Process and track fee refund requests</p></div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search refunds..." className="pl-10 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-full" value={refSearch} onChange={(e) => setRefSearch(e.target.value)} /></div>
          <div className="flex items-center gap-2">{['All', 'Requested', 'Approved', 'Rejected', 'Processed'].map(s => <button key={s} onClick={() => setRefStatusFilter(s)} className={cn("px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", refStatusFilter === s ? "bg-[#3A2C2B] text-white" : "bg-[#3A2C2B]/5 text-[#3A2C2B]")}>{s}</button>)}</div>
          <Button className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 bg-[#3A2C2B] hover:bg-[#3A2C2B]/90 text-white"><RefreshCw className="w-3.5 h-3.5 mr-2" /> Request Refund</Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRefunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/40 rounded-[24px] border border-dashed border-border"><RefreshCw className="w-10 h-10 text-muted-foreground/20 mb-3" /><p className="text-sm font-black text-[#3A2C2B]">No Refunds Found</p></div>
        ) : filteredRefunds.map((ref, i) => {
          const colors = ['bg-[#EBBDC2]/15', 'bg-[#B1D3EC]/15', 'bg-[#BFDDD8]/15', 'bg-[#F0E0AD]/15', 'bg-[#DCD2C3]/15'];
          return (
            <div key={ref.id} className={cn("p-6 rounded-[24px] border border-[#3A2C2B]/5 hover:shadow-lg transition-all cursor-pointer", colors[i % colors.length])} onClick={() => setRefundDetail(ref)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center text-sm font-black text-[#3A2C2B] shadow-inner">{ref.studentName.split(' ').map(n => n[0]).join('')}</div>
                  <div><p className="text-sm font-black text-[#3A2C2B]">{ref.studentName}</p><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{ref.class} · {ref.id}</p></div>
                </div>
                <div className="flex items-center gap-3"><span className="text-lg font-black text-[#A78BFA] tabular-nums">${ref.amount.toLocaleString()}</span><Badge className={cn("rounded-lg font-black text-[8px] uppercase px-3 py-1 border-none", statusColor(ref.status))}>{ref.status}</Badge></div>
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-3">{ref.reason}</p>
              <div className="flex items-center gap-6 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Requested: {ref.requestDate}</span>
                {ref.processedDate && <span>Processed: {ref.processedDate}</span>}
                {ref.approvedBy && <span>By: {ref.approvedBy}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {refundDetail && <Modal isOpen={!!refundDetail} onClose={() => setRefundDetail(null)} title="Refund Details" description={refundDetail.id} className="max-w-lg h-auto max-h-[80vh]">
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#3A2C2B]/5"><div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-lg font-black text-[#3A2C2B]">{refundDetail.studentName.split(' ').map(n => n[0]).join('')}</div><div><p className="text-lg font-black text-[#3A2C2B]">{refundDetail.studentName}</p><p className="text-xs font-bold text-muted-foreground">{refundDetail.class}</p></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="p-4 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20"><p className="text-[9px] font-black uppercase text-[#A78BFA] mb-1">Amount</p><p className="text-xl font-black text-[#3A2C2B]">${refundDetail.amount.toLocaleString()}</p></div><div className="p-4 rounded-xl bg-white border border-[#3A2C2B]/5"><p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Status</p><Badge className={cn("rounded-lg font-black text-[9px] uppercase px-3 py-1 border-none mt-1", statusColor(refundDetail.status))}>{refundDetail.status}</Badge></div></div>
          <div className="p-4 rounded-xl bg-white border border-[#3A2C2B]/5"><p className="text-[9px] font-black uppercase text-muted-foreground mb-2">Reason</p><p className="text-sm font-bold text-[#3A2C2B]">{refundDetail.reason}</p></div>
          {/* Timeline */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50">Timeline</p>
            {[{ label: 'Requested', date: refundDetail.requestDate, done: true }, { label: refundDetail.status === 'Rejected' ? 'Rejected' : 'Approved', date: refundDetail.approvedBy ? refundDetail.processedDate || '' : '', done: !!refundDetail.approvedBy || refundDetail.status === 'Rejected' }, { label: 'Processed', date: refundDetail.processedDate || '', done: refundDetail.status === 'Processed' }].map((step, i) => (
              <div key={i} className="flex items-center gap-3"><div className={cn("w-3 h-3 rounded-full", step.done ? "bg-[#88AC88]" : "bg-[#3A2C2B]/10")} /><span className="text-xs font-bold text-[#3A2C2B]">{step.label}</span>{step.date && <span className="text-[9px] font-bold text-muted-foreground ml-auto">{step.date}</span>}</div>
            ))}
          </div>
        </div>
      </Modal>}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — SCHOLARSHIPS TAB
  // ══════════════════════════════════════════════════════════════

  const renderScholarships = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-black uppercase text-[#3A2C2B]">Scholarships & Discounts</h3><p className="text-xs font-medium text-muted-foreground italic">Manage merit-based and policy-based fee waivers</p></div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search..." className="pl-10 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-full" value={schSearch} onChange={(e) => setSchSearch(e.target.value)} /></div>
          <Button onClick={() => setShowAddScholarship(true)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Create</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScholarships.map((sch, i) => {
          const colors = ['bg-[#BFDDD8]', 'bg-[#B1D3EC]', 'bg-[#F0E0AD]', 'bg-[#EBBDC2]', 'bg-[#DCD2C3]', 'bg-[#D1C4E9]'];
          return (
            <div key={sch.id} className={cn("p-7 rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative group", colors[i % colors.length])}>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center shadow-sm"><Award className="w-5 h-5 text-[#3A2C2B]" /></div>
                  <Badge className={cn("rounded-lg font-black text-[8px] uppercase px-3 py-1 border-none", statusColor(sch.status))}>{sch.status}</Badge>
                </div>
                <div><h4 className="text-lg font-black text-[#3A2C2B] leading-tight uppercase tracking-tight">{sch.name}</h4><p className="text-[10px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mt-1">{sch.type}</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white/30 border border-white/20"><p className="text-[7px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Discount</p><p className="text-sm font-black text-[#3A2C2B]">{sch.discountType === 'Percentage' ? `${sch.value}%` : `$${sch.value.toLocaleString()}`}</p></div>
                  <div className="p-3 rounded-2xl bg-white/30 border border-white/20"><p className="text-[7px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Students</p><p className="text-sm font-black text-[#3A2C2B]">{sch.studentsLinked}</p></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#3A2C2B]/10">
                  <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-[#3A2C2B]/40" /><span className="text-[9px] font-bold text-[#3A2C2B]/50">Expires: {sch.expiry}</span></div>
                  <p className="text-[8px] font-black text-[#3A2C2B]/40 uppercase">{sch.eligibility.slice(0, 20)}...</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showAddScholarship} onClose={() => setShowAddScholarship(false)} title="Create Scholarship" description="Define a new scholarship or discount">
        <div className="space-y-5">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Name</label><Input placeholder="e.g. Merit Scholarship" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Type</label><Select options={[{ label: 'Merit', value: 'Merit' }, { label: 'Staff Child', value: 'Staff Child' }, { label: 'Sibling', value: 'Sibling' }, { label: 'Flat Discount', value: 'Flat Discount' }, { label: 'Percentage Discount', value: 'Percentage Discount' }]} value="Merit" className="h-12 bg-[#3A2C2B]/5 border-none rounded-2xl" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Value</label><Input type="number" placeholder="25" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          </div>
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Eligibility</label><Input placeholder="Top 5% GPA students" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
          <div><label className="text-[10px] font-black uppercase tracking-widest text-[#3A2C2B]/50 mb-2 block">Expiry Date</label><Input type="date" className="h-12 rounded-2xl bg-[#3A2C2B]/5 border-none text-sm font-bold" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => setShowAddScholarship(false)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px]">Cancel</Button><Button onClick={() => setShowAddScholarship(false)} className="h-11 rounded-2xl px-6 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Create</Button></div>
      </Modal>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — REPORTS TAB
  // ══════════════════════════════════════════════════════════════

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-black uppercase text-[#3A2C2B]">Finance Reports</h3><p className="text-xs font-medium text-muted-foreground italic">Analytics and exportable reports</p></div>
        <div className="flex items-center gap-3"><Input type="date" className="h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-40" /><span className="text-xs font-bold text-muted-foreground">to</span><Input type="date" className="h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-40" /><Button variant="outline" className="h-11 rounded-2xl px-4 font-black uppercase text-[10px] border-[#3A2C2B]/10"><Download className="w-4 h-4 mr-2" /> Export CSV</Button></div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {[{ id: 'collection', label: 'Collection' }, { id: 'dues', label: 'Dues' }, { id: 'classwise', label: 'Class-wise' }, { id: 'refunds', label: 'Refunds' }, { id: 'methods', label: 'Methods' }].map(r => (
          <button key={r.id} onClick={() => setReportType(r.id)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", reportType === r.id ? "bg-[#3A2C2B] text-white shadow-lg" : "bg-[#3A2C2B]/5 text-[#3A2C2B]")}>{r.label}</button>
        ))}
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[20px]">
        <CardHeader className="p-8 border-b border-border/50"><CardTitle className="text-xl font-black uppercase text-[#3A2C2B]">{reportType === 'collection' ? 'Collection Report' : reportType === 'dues' ? 'Due Report' : reportType === 'classwise' ? 'Class-wise Report' : reportType === 'refunds' ? 'Refund Report' : 'Payment Methods'}</CardTitle></CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {reportType === 'methods' ? (
                <PieChart><Pie data={PAYMENT_METHOD_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">{PAYMENT_METHOD_DATA.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} /></PieChart>
              ) : (
                <BarChart data={(reportType === 'classwise' ? CLASS_WISE_COLLECTION : MONTHLY_COLLECTION_DATA) as any[]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.border} />
                  <XAxis dataKey={reportType === 'classwise' ? 'name' : 'month'} axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted, fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F1DE', opacity: 0.5 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                  <Bar dataKey="collected" fill={CHART_COLORS.success} radius={[6, 6, 0, 0]} name="Collected" />
                  <Bar dataKey={reportType === 'refunds' ? 'overdue' : 'pending'} fill={reportType === 'refunds' ? CHART_COLORS.info : CHART_COLORS.warning} radius={[6, 6, 0, 0]} name={reportType === 'refunds' ? 'Refunded' : 'Pending'} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <div className="rounded-[20px] border border-[#3A2C2B]/10 bg-white shadow-sm overflow-hidden">
        <div className="bg-[#3A2C2B]"><table className="w-full text-left"><thead><tr className="text-white/70"><th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Period</th><th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Collected</th><th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Pending</th><th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Overdue</th></tr></thead></table></div>
        <table className="w-full text-left"><tbody className="divide-y divide-[#3A2C2B]/5">{MONTHLY_COLLECTION_DATA.map((d) => (
          <tr key={d.month} className="hover:bg-primary/[0.02]"><td className="px-8 py-4 text-xs font-black text-[#3A2C2B]">{d.month} 2026</td><td className="px-8 py-4 text-right text-sm font-black text-[#88AC88] tabular-nums">${(d.collected / 1000).toFixed(1)}k</td><td className="px-8 py-4 text-right text-sm font-black text-[#E4B76D] tabular-nums">${(d.pending / 1000).toFixed(1)}k</td><td className="px-8 py-4 text-right text-sm font-black text-red-500 tabular-nums">${(d.overdue / 1000).toFixed(1)}k</td></tr>
        ))}</tbody></table>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER — LEDGER TAB
  // ══════════════════════════════════════════════════════════════

  const renderLedger = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-black uppercase text-[#3A2C2B]">Transaction Ledger</h3><p className="text-xs font-medium text-muted-foreground italic">Accounting-style transaction timeline</p></div>
        <div className="relative w-full md:w-72"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search transactions..." className="pl-10 h-11 rounded-2xl bg-[#3A2C2B]/5 border-none text-xs font-bold w-full" value={ledgerSearch} onChange={(e) => setLedgerSearch(e.target.value)} /></div>
      </div>

      <div className="space-y-4">
        {filteredLedger.map((txn, i) => {
          const typeConfig: Record<string, { bg: string; icon: React.ReactNode; sign: string; color: string }> = {
            'Credit': { bg: 'bg-[#BFDDD8]', icon: <ArrowDownRight className="w-4 h-4" />, sign: '+', color: 'text-[#88AC88]' },
            'Debit': { bg: 'bg-[#F0E0AD]', icon: <ArrowUpRight className="w-4 h-4" />, sign: '-', color: 'text-[#E4B76D]' },
            'Refund': { bg: 'bg-[#EBBDC2]', icon: <RefreshCw className="w-4 h-4" />, sign: '-', color: 'text-[#A78BFA]' },
            'Discount': { bg: 'bg-[#B1D3EC]', icon: <Tag className="w-4 h-4" />, sign: '', color: 'text-[#8EBADB]' },
            'Failed': { bg: 'bg-red-100', icon: <XCircle className="w-4 h-4 text-red-600" />, sign: '', color: 'text-red-500' },
          };
          const cfg = typeConfig[txn.type] || typeConfig['Credit'];
          const isExpanded = expandedTxn === txn.id;

          return (
            <div key={txn.id}>
              <div className="flex gap-4 cursor-pointer" onClick={() => setExpandedTxn(isExpanded ? null : txn.id)}>
                <div className="flex flex-col items-center">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#3A2C2B]", cfg.bg)}>{cfg.icon}</div>
                  {i < filteredLedger.length - 1 && <div className="w-px flex-1 bg-[#3A2C2B]/10 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="p-4 rounded-2xl bg-white border border-[#3A2C2B]/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div><p className="text-xs font-black text-[#3A2C2B]">{txn.studentName}</p><p className="text-[9px] font-bold text-muted-foreground mt-0.5">{txn.description}</p></div>
                      <div className="text-right"><p className={cn("text-sm font-black tabular-nums", cfg.color)}>{cfg.sign}${txn.amount.toLocaleString()}</p><Badge className={cn("rounded-md font-black text-[7px] uppercase px-2 py-0.5 border-none mt-1", cfg.bg, "text-[#3A2C2B]")}>{txn.type}</Badge></div>
                    </div>
                    <div className="flex items-center gap-4 text-[8px] font-bold text-muted-foreground uppercase tracking-wider"><span>{txn.date}</span><span>Ref: {txn.reference}</span><span>Balance: ${txn.balanceAfter.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="ml-14 mb-4 p-4 rounded-2xl bg-[#3A2C2B]/5 border border-[#3A2C2B]/10 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Type</span><span className="font-bold">{txn.type}</span></div>
                    <div><span className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Reference</span><span className="font-bold font-mono">{txn.reference}</span></div>
                    <div><span className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Running Balance</span><span className="font-bold">${txn.balanceAfter.toLocaleString()}</span></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRefundsAndDiscounts = () => (
    <div className="space-y-16">
      {renderRefunds()}
      <div className="w-full h-px bg-[#3A2C2B]/10" />
      {renderScholarships()}
    </div>
  );

  const renderLedgerAndReports = () => (
    <div className="space-y-16">
      {renderReports()}
      <div className="w-full h-px bg-[#3A2C2B]/10" />
      {renderLedger()}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER TAB CONTENT
  // ══════════════════════════════════════════════════════════════

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'fee-structures': return renderFeeStructures();
      case 'student-fees': return renderStudentFees();
      case 'invoices': return renderInvoices();
      case 'payments': return renderPayments();
      case 'refunds-discounts': return renderRefundsAndDiscounts();
      case 'ledger-reports': return renderLedgerAndReports();
      default: return renderOverview();
    }
  };

  // ══════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
            <span>ERP</span><ChevronRight className="w-3 h-3" /><span>Finance & Fees</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#3A2C2B] uppercase">Finance & Fees</h1>
          <p className="text-muted-foreground font-medium italic">Enterprise fee management, billing, and financial analytics</p>
        </div>
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-border/50">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Academic Year</p>
            <p className="text-sm font-bold leading-none">2025-26</p>
          </div>
          <div className="bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-xl border border-brand-orange/20">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Term</p>
            <p className="text-sm font-bold leading-none">T2 (Ongoing)</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabSwitcher tabs={FINANCE_TABS} activeTab={activeTab} onTabChange={setActiveTab} color="bg-[#3A2C2B]" />

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500" key={activeTab}>
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default FinancePage;
