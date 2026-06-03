import { getStorageData, setStorageData } from '../lib/storage';

export interface FeeStudent {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  parent: string;
  parentPhone: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
}

export type FeeFrequency = 'Monthly' | 'Quarterly' | 'Annually' | 'One-time';

export interface FeeStructure {
  id: string;
  name: string;
  type: string;
  amount: number;
  frequency: FeeFrequency;
  dueDate: string;
  applicableClasses: string[];
  isActive: boolean;
  createdDate: string;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Partial' | 'Overdue' | 'Cancelled';

export interface InvoiceItem {
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  class: string;
  total: number;
  paid: number;
  balance: number;
  dueDate: string;
  generatedDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
}

export type PaymentStatus = 'Success' | 'Failed' | 'Pending';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

export interface Payment {
  id: string;
  receiptNo: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
  transactionRef: string;
}

export type RefundStatus = 'Requested' | 'Approved' | 'Rejected' | 'Processed';

export interface Refund {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  amount: number;
  reason: string;
  requestDate: string;
  processedDate?: string;
  status: RefundStatus;
  approvedBy?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  type: string;
  discountType: 'Percentage' | 'Flat';
  value: number;
  studentsLinked: number;
  eligibility: string;
  expiry: string;
  status: 'Active' | 'Expired' | 'Draft';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  studentName: string;
  amount: number;
  type: 'Credit' | 'Debit' | 'Refund' | 'Discount' | 'Failed';
  reference: string;
  balanceAfter: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  module: string;
  device: string;
  ip: string;
  severity: 'Info' | 'Warning' | 'Critical';
  before: string;
  after: string;
}

// -----------------------------------------------------------------------------
// MOCK DATA
// -----------------------------------------------------------------------------

export const DEFAULT_STUDENTS: FeeStudent[] = [
  { id: 'STU001', name: 'Alice Smith', class: 'Class 10', section: 'A', rollNo: '12', parent: 'John Smith', parentPhone: '+1 234 567 8900', totalDue: 15000, totalPaid: 15000, balance: 0 },
  { id: 'STU002', name: 'Bob Johnson', class: 'Class 10', section: 'B', rollNo: '15', parent: 'Mary Johnson', parentPhone: '+1 234 567 8901', totalDue: 15000, totalPaid: 5000, balance: 10000 },
  { id: 'STU003', name: 'Charlie Davis', class: 'Class 9', section: 'A', rollNo: '08', parent: 'Robert Davis', parentPhone: '+1 234 567 8902', totalDue: 12000, totalPaid: 12000, balance: 0 },
  { id: 'STU004', name: 'Diana Evans', class: 'Class 11', section: 'Science', rollNo: '22', parent: 'Susan Evans', parentPhone: '+1 234 567 8903', totalDue: 18000, totalPaid: 0, balance: 18000 },
  { id: 'STU005', name: 'George Adams', class: 'Class 11', section: 'A', rollNo: '05', parent: 'William Adams', parentPhone: '+1 234 567 8904', totalDue: 16000, totalPaid: 0, balance: 16000 },
];

export const DEFAULT_FEE_STRUCTURES: FeeStructure[] = [
  { id: 'FS001', name: 'Tuition Fee', type: 'Academic', amount: 5000, frequency: 'Monthly', dueDate: '2026-05-01', applicableClasses: ['Class 1', 'Class 2', 'Class 3'], isActive: true, createdDate: '2025-04-01' },
  { id: 'FS002', name: 'Transport Fee', type: 'Transport', amount: 1500, frequency: 'Monthly', dueDate: '2026-05-05', applicableClasses: ['All'], isActive: true, createdDate: '2025-04-01' },
  { id: 'FS003', name: 'Annual Charges', type: 'Academic', amount: 12000, frequency: 'Annually', dueDate: '2026-04-15', applicableClasses: ['Class 9', 'Class 10'], isActive: true, createdDate: '2025-04-01' },
  { id: 'FS004', name: 'Lab Fee', type: 'Academic', amount: 3000, frequency: 'Quarterly', dueDate: '2026-06-10', applicableClasses: ['Class 11', 'Class 12'], isActive: false, createdDate: '2025-04-01' },
];

export const DEFAULT_INVOICES: Invoice[] = [
  { id: 'INV001', invoiceNo: 'INV-2026-001', studentId: 'STU002', studentName: 'Bob Johnson', class: 'Class 10-B', total: 5000, paid: 5000, balance: 0, dueDate: '2026-05-01', generatedDate: '2026-04-25', status: 'Paid', items: [{ name: 'Tuition Fee', amount: 5000 }] },
  { id: 'INV002', invoiceNo: 'INV-2026-002', studentId: 'STU004', studentName: 'Diana Evans', class: 'Class 11-Science', total: 6500, paid: 0, balance: 6500, dueDate: '2026-05-05', generatedDate: '2026-04-28', status: 'Pending', items: [{ name: 'Tuition Fee', amount: 5000 }, { name: 'Transport Fee', amount: 1500 }] },
  { id: 'INV003', invoiceNo: 'INV-2026-003', studentId: 'STU005', studentName: 'George Adams', class: 'Class 11-A', total: 16000, paid: 0, balance: 16000, dueDate: '2026-04-10', generatedDate: '2026-04-01', status: 'Overdue', items: [{ name: 'Tuition Fee', amount: 5000 }, { name: 'Annual Charges', amount: 11000 }] },
];

export const DEFAULT_PAYMENTS: Payment[] = [
  { id: 'PAY001', receiptNo: 'RCT-2026-001', invoiceNo: 'INV-2026-001', studentId: 'STU002', studentName: 'Bob Johnson', amount: 5000, method: 'Card', date: '2026-04-28', status: 'Success', transactionRef: 'TRX9876543210' },
  { id: 'PAY002', receiptNo: 'RCT-2026-002', invoiceNo: 'INV-2026-004', studentId: 'STU001', studentName: 'Alice Smith', amount: 15000, method: 'Bank Transfer', date: '2026-04-20', status: 'Success', transactionRef: 'TRX1234567890' },
  { id: 'PAY003', receiptNo: 'RCT-2026-003', invoiceNo: 'INV-2026-005', studentId: 'STU003', studentName: 'Charlie Davis', amount: 12000, method: 'UPI', date: '2026-05-10', status: 'Failed', transactionRef: 'TRX4567890123' },
];

export const DEFAULT_REFUNDS: Refund[] = [
  { id: 'REF001', studentId: 'STU006', studentName: 'Eve Carter', class: 'Class 8', amount: 1500, reason: 'Transport route cancelled', requestDate: '2026-05-15', status: 'Requested' },
  { id: 'REF002', studentId: 'STU007', studentName: 'Frank Wright', class: 'Class 12', amount: 5000, reason: 'Duplicate payment', requestDate: '2026-05-10', processedDate: '2026-05-12', status: 'Processed', approvedBy: 'Admin' },
];

export const DEFAULT_SCHOLARSHIPS: Scholarship[] = [
  { id: 'SCH001', name: 'Merit Excellence', type: 'Merit', discountType: 'Percentage', value: 100, studentsLinked: 5, eligibility: 'Top 1% in Academics', expiry: '2026-12-31', status: 'Active' },
  { id: 'SCH002', name: 'Sibling Discount', type: 'Sibling', discountType: 'Flat', value: 2000, studentsLinked: 45, eligibility: 'Second child onwards', expiry: '2027-03-31', status: 'Active' },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'TXN001', date: '2026-05-22 10:30 AM', description: 'Tuition Fee Payment', studentName: 'Bob Johnson', amount: 5000, type: 'Credit', reference: 'TRX9876543210', balanceAfter: 150000 },
  { id: 'TXN002', date: '2026-05-22 11:15 AM', description: 'Transport Refund', studentName: 'Frank Wright', amount: 1500, type: 'Debit', reference: 'REF002-TRX', balanceAfter: 148500 },
  { id: 'TXN003', date: '2026-05-22 14:00 PM', description: 'Failed UPI Transaction', studentName: 'Charlie Davis', amount: 12000, type: 'Failed', reference: 'TRX4567890123', balanceAfter: 148500 },
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'AUD001', timestamp: '2026-05-22T10:30:00Z', user: 'Admin User', userRole: 'Admin', action: 'Created Fee Structure', module: 'Finance', device: 'Chrome — Windows', ip: '192.168.1.1', severity: 'Info', before: 'None', after: 'Added FS005 (Lab Fee)' },
  { id: 'AUD002', timestamp: '2026-05-22T11:45:00Z', user: 'Finance Manager', userRole: 'Staff', action: 'Approved Refund', module: 'Finance', device: 'Safari — Mac', ip: '192.168.1.5', severity: 'Warning', before: 'Status: Requested', after: 'Status: Approved' },
];

// Chart Data
export const MONTHLY_COLLECTION_DATA = [
  { month: 'Jan', collected: 50000, pending: 15000, overdue: 5000 },
  { month: 'Feb', collected: 65000, pending: 10000, overdue: 8000 },
  { month: 'Mar', collected: 80000, pending: 5000, overdue: 2000 },
  { month: 'Apr', collected: 120000, pending: 45000, overdue: 15000 },
  { month: 'May', collected: 90000, pending: 25000, overdue: 12000 },
];

export const PAYMENT_METHOD_DATA = [
  { name: 'Card', value: 45, fill: '#C37A67' },
  { name: 'Bank Transfer', value: 30, fill: '#88AC88' },
  { name: 'UPI', value: 15, fill: '#E4B76D' },
  { name: 'Cash', value: 10, fill: '#A78BFA' },
];

export const CLASS_WISE_COLLECTION = [
  { name: 'Class 9', collected: 45000, pending: 12000 },
  { name: 'Class 10', collected: 55000, pending: 8000 },
  { name: 'Class 11', collected: 60000, pending: 15000 },
  { name: 'Class 12', collected: 70000, pending: 10000 },
];

export const DAILY_COLLECTION_DATA = [
  { day: 'Mon', amount: 15000 },
  { day: 'Tue', amount: 22000 },
  { day: 'Wed', amount: 18000 },
  { day: 'Thu', amount: 28400 },
  { day: 'Fri', amount: 12000 },
];

export const DEFAULT_FINANCE_SETTINGS = {
  lateFee: {
    enabled: true,
    penaltyPercent: 5,
    gracePeriodDays: 7,
  },
  invoicePrefix: 'INV-2026-',
  receiptPrefix: 'RCT-2026-',
  schoolName: 'Acme International School',
  paymentMethods: {
    cash: true,
    upi: true,
    card: true,
    bankTransfer: true,
  },
  notifications: {
    sms: true,
    email: true,
    whatsapp: false,
  },
  currency: 'USD',
};

// Storage Getters/Setters

export const getFeeStudents = () => getStorageData('lms_finance_students', DEFAULT_STUDENTS);
export const saveFeeStudents = (data: FeeStudent[]) => setStorageData('lms_finance_students', data);

export const getFeeStructures = () => getStorageData('lms_finance_structures', DEFAULT_FEE_STRUCTURES);
export const saveFeeStructures = (data: FeeStructure[]) => setStorageData('lms_finance_structures', data);

export const getInvoices = () => getStorageData('lms_finance_invoices', DEFAULT_INVOICES);
export const saveInvoices = (data: Invoice[]) => setStorageData('lms_finance_invoices', data);

export const getPayments = () => getStorageData('lms_finance_payments', DEFAULT_PAYMENTS);
export const savePayments = (data: Payment[]) => setStorageData('lms_finance_payments', data);

export const getRefunds = () => getStorageData('lms_finance_refunds', DEFAULT_REFUNDS);
export const saveRefunds = (data: Refund[]) => setStorageData('lms_finance_refunds', data);

export const getScholarships = () => getStorageData('lms_finance_scholarships', DEFAULT_SCHOLARSHIPS);
export const saveScholarships = (data: Scholarship[]) => setStorageData('lms_finance_scholarships', data);

export const getTransactions = () => getStorageData('lms_finance_transactions', DEFAULT_TRANSACTIONS);
export const saveTransactions = (data: Transaction[]) => setStorageData('lms_finance_transactions', data);

export const getAuditLogs = () => getStorageData('lms_finance_audit_logs', DEFAULT_AUDIT_LOGS);
export const saveAuditLogs = (data: AuditLog[]) => setStorageData('lms_finance_audit_logs', data);

// Backward Compatibility
export const MOCK_STUDENTS = DEFAULT_STUDENTS;
export const MOCK_FEE_STRUCTURES = DEFAULT_FEE_STRUCTURES;
export const MOCK_INVOICES = DEFAULT_INVOICES;
export const MOCK_PAYMENTS = DEFAULT_PAYMENTS;
export const MOCK_REFUNDS = DEFAULT_REFUNDS;
export const MOCK_SCHOLARSHIPS = DEFAULT_SCHOLARSHIPS;
export const MOCK_TRANSACTIONS = DEFAULT_TRANSACTIONS;
export const MOCK_AUDIT_LOGS = DEFAULT_AUDIT_LOGS;
