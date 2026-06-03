import React, { useState, useRef } from 'react';
import {
  Book,
  BookOpen,
  Clock,
  Users,
  AlertTriangle,
  Search,
  Edit,
  Trash2,
  ArrowLeftRight,
  History,
  BarChart3,
  CheckCircle2,
  XCircle,
  FileText,
  Save,
  ClipboardList,
  Bell,
  Wallet,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

import { StatsCard } from '../components/dashboard/DashboardWidgets';

// ══ MOCK DATA ══
const BOOKS_DATA = [
  {
    id: 'B001',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    isbn: '978-0743273565',
    total: 5,
    available: 3,
    issued: 2,
    reserved: 1,
    price: 12.99,
    status: 'Available',
    copies: [
      { unitId: 'GTS-001', status: 'Available' },
      { unitId: 'GTS-002', status: 'Issued' },
      { unitId: 'GTS-D-003', status: 'Damaged' },
      { unitId: 'GTS-004', status: 'Available' },
      { unitId: 'GTS-M-005', status: 'Missing' },
    ]
  },
  {
    id: 'B002',
    title: 'Advanced Physics',
    author: 'Dr. Michael Kent',
    category: 'Science',
    isbn: '978-0199142273',
    total: 10,
    available: 0,
    issued: 10,
    reserved: 0,
    price: 45.50,
    status: 'Out of Stock',
    copies: Array.from({ length: 10 }, (_, i) => ({
      unitId: i === 9 ? 'PHY-D-010' : `PHY-${String(i + 1).padStart(3, '0')}`,
      status: i === 9 ? 'Damaged' : 'Issued'
    }))
  },
  {
    id: 'B003',
    title: 'World History',
    author: 'Philip Parker',
    category: 'History',
    isbn: '978-0241336021',
    total: 8,
    available: 5,
    issued: 3,
    reserved: 2,
    price: 29.99,
    status: 'Available',
    copies: Array.from({ length: 8 }, (_, i) => ({
      unitId: i > 5 ? `HIS-M-00${i + 1}` : `HIS-00${i + 1}`,
      status: i > 5 ? 'Missing' : (i < 3 ? 'Available' : 'Issued')
    }))
  },
  { id: 'B004', title: 'Calculus Vol 1', author: 'James Stewart', category: 'Mathematics', isbn: '978-1285740621', total: 6, available: 2, issued: 4, reserved: 0, price: 55.00, status: 'Available', copies: Array.from({ length: 6 }, (_, i) => ({ unitId: `MAT-${String(i + 1).padStart(3, '0')}`, status: i < 2 ? 'Available' : 'Issued' })) },
  { id: 'B005', title: 'Digital Design', author: 'M. Mano', category: 'Engineering', isbn: '978-0132774208', total: 4, available: 4, issued: 0, reserved: 0, price: 38.50, status: 'Available', copies: Array.from({ length: 4 }, (_, i) => ({ unitId: `ENG-${String(i + 1).padStart(3, '0')}`, status: 'Available' })) },
  { id: 'B006', title: 'Biology: Life', author: 'David Sadava', category: 'Science', isbn: '978-1319010164', total: 7, available: 1, issued: 6, reserved: 1, price: 62.00, status: 'Available', copies: Array.from({ length: 7 }, (_, i) => ({ unitId: `BIO-${String(i + 1).padStart(3, '0')}`, status: i === 0 ? 'Available' : 'Issued' })) },
  { id: 'B007', title: 'Pride & Prejudice', author: 'Jane Austen', category: 'Fiction', isbn: '978-0141439518', total: 12, available: 8, issued: 4, reserved: 2, price: 9.99, status: 'Available', copies: Array.from({ length: 12 }, (_, i) => ({ unitId: `PRD-${String(i + 1).padStart(3, '0')}`, status: i < 8 ? 'Available' : 'Issued' })) },
  { id: 'B008', title: 'Organic Chemistry', author: 'Paula Bruice', category: 'Science', isbn: '978-0321803221', total: 5, available: 0, issued: 5, reserved: 0, price: 49.99, status: 'Out of Stock', copies: Array.from({ length: 5 }, (_, i) => ({ unitId: `CHM-${String(i + 1).padStart(3, '0')}`, status: 'Issued' })) },
  { id: 'B009', title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fiction', isbn: '978-0547928226', total: 10, available: 6, issued: 4, reserved: 2, price: 15.00, status: 'Available', copies: Array.from({ length: 10 }, (_, i) => ({ unitId: `HOB-${String(i + 1).padStart(3, '0')}`, status: i < 6 ? 'Available' : 'Issued' })) },
  { id: 'B010', title: 'Modern Physics', author: 'Arthur Beiser', category: 'Science', isbn: '978-0072315608', total: 4, available: 1, issued: 3, reserved: 0, price: 52.00, status: 'Available', copies: Array.from({ length: 4 }, (_, i) => ({ unitId: `MPY-${String(i + 1).padStart(3, '0')}`, status: i === 0 ? 'Available' : 'Issued' })) },
  { id: 'B011', title: 'Data Structures', author: 'Mark Weiss', category: 'Engineering', isbn: '978-0132847377', total: 6, available: 3, issued: 3, reserved: 1, price: 42.50, status: 'Available', copies: Array.from({ length: 6 }, (_, i) => ({ unitId: `DSA-${String(i + 1).padStart(3, '0')}`, status: i < 3 ? 'Available' : 'Issued' })) },
  { id: 'B012', title: 'Linear Algebra', author: 'Gilbert Strang', category: 'Mathematics', isbn: '978-0980232776', total: 5, available: 2, issued: 3, reserved: 0, price: 35.00, status: 'Available', copies: Array.from({ length: 5 }, (_, i) => ({ unitId: `LAL-${String(i + 1).padStart(3, '0')}`, status: i < 2 ? 'Available' : 'Issued' })) },
  { id: 'B013', title: 'General Biology', author: 'Neil Campbell', category: 'Science', isbn: '978-0321558145', total: 8, available: 4, issued: 4, reserved: 2, price: 65.00, status: 'Available', copies: Array.from({ length: 8 }, (_, i) => ({ unitId: `GBI-${String(i + 1).padStart(3, '0')}`, status: i < 4 ? 'Available' : 'Issued' })) },
  { id: 'B014', title: 'A Tale of Two Cities', author: 'Charles Dickens', category: 'Fiction', isbn: '978-0141439600', total: 12, available: 10, issued: 2, reserved: 3, price: 8.50, status: 'Available', copies: Array.from({ length: 12 }, (_, i) => ({ unitId: `TTC-${String(i + 1).padStart(3, '0')}`, status: i < 10 ? 'Available' : 'Issued' })) },
  { id: 'B015', title: 'Industrial Engineering', author: 'Eliyahu Goldratt', category: 'Engineering', isbn: '978-0884271956', total: 3, available: 0, issued: 3, reserved: 0, price: 28.00, status: 'Out of Stock', copies: Array.from({ length: 3 }, (_, i) => ({ unitId: `IEN-${String(i + 1).padStart(3, '0')}`, status: 'Issued' })) },
];

const ISSUE_RECORDS = [
  { id: 'I001', borrower: 'Alice Johnson', role: 'Student', book: 'The Great Gatsby', date: '2026-05-01', due: '2026-05-15', status: 'Issued' },
  { id: 'I002', borrower: 'Robert Wilson', role: 'Staff', book: 'Advanced Physics', date: '2026-04-20', due: '2026-05-04', status: 'Overdue' },
  { id: 'I003', borrower: 'Emma Watson', role: 'Student', book: 'Calculus Vol 1', date: '2026-05-05', due: '2026-05-19', status: 'Issued' },
  { id: 'I004', borrower: 'James Smith', role: 'Student', book: 'Digital Design', date: '2026-05-02', due: '2026-05-16', status: 'Issued' },
  { id: 'I005', borrower: 'Maria Garcia', role: 'Student', book: 'Biology: Life', date: '2026-04-25', due: '2026-05-09', status: 'Overdue' },
  { id: 'I006', borrower: 'David Brown', role: 'Staff', book: 'Organic Chemistry', date: '2026-05-07', due: '2026-05-21', status: 'Issued' },
  { id: 'I007', borrower: 'Linda Davis', role: 'Student', book: 'Pride & Prejudice', date: '2026-05-03', due: '2026-05-17', status: 'Issued' },
  { id: 'I008', borrower: 'Kevin Wilson', role: 'Student', book: 'World History', date: '2026-05-06', due: '2026-05-20', status: 'Issued' },
  { id: 'I009', borrower: 'Sarah Miller', role: 'Student', book: 'Calculus Vol 1', date: '2026-04-15', due: '2026-04-29', status: 'Overdue' },
  { id: 'I010', borrower: 'Paul Anderson', role: 'Staff', book: 'The Great Gatsby', date: '2026-05-08', due: '2026-05-22', status: 'Issued' },
  { id: 'I011', borrower: 'Karen Thomas', role: 'Student', book: 'Advanced Physics', date: '2026-05-04', due: '2026-05-18', status: 'Issued' },
  { id: 'I012', borrower: 'Mark Taylor', role: 'Student', book: 'Digital Design', date: '2026-05-09', due: '2026-05-23', status: 'Issued' },
  { id: 'I013', borrower: 'Susan Moore', role: 'Staff', book: 'World History', date: '2026-04-22', due: '2026-05-06', status: 'Overdue' },
  { id: 'I014', borrower: 'Brian Jackson', role: 'Student', book: 'Biology: Life', date: '2026-05-10', due: '2026-05-24', status: 'Issued' },
  { id: 'I015', borrower: 'Betty White', role: 'Student', book: 'Pride & Prejudice', date: '2026-05-05', due: '2026-05-19', status: 'Issued' },
];

const RETURN_HISTORY = [
  { id: 'R001', borrower: 'Bob Miller', book: 'Digital Design', returned: '2026-05-08', due: '2026-05-05', late: 3, fine: 15, status: 'Returned' },
  { id: 'R002', borrower: 'Diana Prince', book: 'World History', returned: '2026-05-09', due: '2026-05-10', late: 0, fine: 0, status: 'Returned' },
];

const BOOK_REQUESTS = [
  { id: 'REQ001', student: 'Sarah Jenkins', book: 'The Great Gatsby', date: '2026-05-11', status: 'Approved', expiry: '2026-05-12 14:00' },
  { id: 'REQ002', student: 'Michael Chen', book: 'Calculus Vol 1', date: '2026-05-10', status: 'Pending', expiry: null },
  { id: 'REQ003', student: 'Sarah Jenkins', book: 'Digital Design', date: '2026-05-11', status: 'Pending', expiry: null },
];

const CATEGORIES = ['All', 'Fiction', 'Science', 'History', 'Mathematics', 'Engineering', 'Literature'];

const CATEGORY_ICONS: Record<string, { img: string; color: string; activeBg: string; hue: string }> = {
  'All': { img: '/all-book.png', color: 'text-blue-500', activeBg: 'bg-blue-50', hue: 'hue-rotate(0deg)' },
  'Fiction': { img: '/fiction.png', color: 'text-purple-500', activeBg: 'bg-purple-50', hue: 'hue-rotate(280deg)' },
  'Science': { img: '/science.png', color: 'text-green-500', activeBg: 'bg-green-50', hue: 'hue-rotate(140deg)' },
  'History': { img: '/history.png', color: 'text-amber-500', activeBg: 'bg-amber-50', hue: 'hue-rotate(40deg)' },
  'Mathematics': { img: '/maths.png', color: 'text-red-500', activeBg: 'bg-red-50', hue: 'hue-rotate(330deg)' },
  'Engineering': { img: '/engineering.png', color: 'text-indigo-500', activeBg: 'bg-indigo-50', hue: 'hue-rotate(210deg)' },
  'Literature': { img: '/leatrature.png', color: 'text-rose-500', activeBg: 'bg-rose-50', hue: 'hue-rotate(300deg)' }
};

const LibraryPage: React.FC = () => {
  const { activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'issue' | 'return' | 'inventory' | 'requests'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showCopyRegistry, setShowCopyRegistry] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [selectedBookForRequest, setSelectedBookForRequest] = useState<any>(null);
  const [selectedRequestForIssue, setSelectedRequestForIssue] = useState<any>(null);
  const [selectedRecordForReturn, setSelectedRecordForReturn] = useState<any>(null);
  const [selectedBookForStock, setSelectedBookForStock] = useState<any>(null);
  const [selectedBookForRegistry, setSelectedBookForRegistry] = useState<any>(null);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [stockAdjAction, setStockAdjAction] = useState('damage');

  const [issuePage, setIssuePage] = useState(1);
  const [catalogPage, setCatalogPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [registryPage, setRegistryPage] = useState(1);

  const [catalogView, setCatalogView] = useState<'card' | 'table'>('table');
  const [requestView, setRequestView] = useState<'card' | 'table'>('table');
  const [issueView, setIssueView] = useState<'card' | 'table'>('table');
  const [returnView, setReturnView] = useState<'card' | 'table'>('table');
  const [inventoryView, setInventoryView] = useState<'card' | 'table'>('table');
  const tableRef = useRef<HTMLDivElement>(null);

  // Permission Checks
  const isLibrarian = activeRole === 'LIBRARIAN' || activeRole === 'SCHOOL_ADMIN' || activeRole === 'SUPER_ADMIN';
  const isStudent = activeRole === 'STUDENT';

  // ══ ACTIONS ══
  const handleApproveHold = (request: any) => {
    alert(`Success: Hold approved for ${request.student}. The student now has 24 hours to collect "${request.book}".`);
  };

  const handleApproveAndIssue = (request: any) => {
    setSelectedRequestForIssue(request);
    setShowIssueModal(true);
  };

  const handleOpenReturnModal = (record: any) => {
    setSelectedRecordForReturn(record);
    setShowReturnModal(true);
  };

  const handleOpenStockModal = (book: any) => {
    setSelectedBookForStock(book);
    setShowStockModal(true);
  };

  const handleOpenCopyRegistry = (book: any) => {
    setSelectedBookForRegistry(book);
    setShowCopyRegistry(true);
  };

  const handleIssueSuccess = () => {
    setShowIssueModal(false);
    setSelectedRequestForIssue(null);
  };

  const handleReturnSuccess = () => {
    alert(`Success: "${selectedRecordForReturn?.book}" has been returned and added back to inventory.`);
    setShowReturnModal(false);
    setSelectedRecordForReturn(null);
  };

  const handleStockUpdate = () => {
    alert(`Success: Identity state updated for unit "${selectedUnitId}".`);
    setShowStockModal(false);
    setSelectedBookForStock(null);
    setSelectedUnitId('');
  };

  // ══ COMPONENTS ══

  const LibraryKPIs = () => {
    if (isStudent) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard label="My Active Books" value="3" icon={BookOpen} color="bg-primary" sub="Borrowed by me" />
          <StatsCard label="Pending Requests" value="2" icon={Bell} color="bg-brand-orange" sub="Awaiting approval" />
          <StatsCard label="Hold Queue" value="1" icon={Clock} color="bg-brand-purple" sub="Ready for pickup" />
          <StatsCard label="My Total Fines" value="$15.00" icon={Wallet} color="bg-destructive" sub="Unpaid balance" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {[
          { label: "Total", value: "1,248", icon: Book, color: "bg-primary", sub: "+12 new" },
          { label: "Issued", value: "342", icon: BookOpen, color: "bg-brand-blue", sub: "28 today" },
          { label: "Returned", value: "156", icon: CheckCircle2, color: "bg-brand-green", sub: "14 today" },
          { label: "Overdue", value: "24", icon: Clock, color: "bg-brand-orange", sub: "Action req" },
          { label: "Requests", value: "12", icon: Bell, color: "bg-brand-purple", sub: "12 pending" },
          { label: "Active", value: "412", icon: Users, color: "bg-oat", sub: "Active users" }
        ].map((kpi, i) => (
          <StatsCard key={i} label={kpi.label} value={kpi.value} icon={kpi.icon} color={kpi.color} sub={kpi.sub} />
        ))}
      </div>
    );
  };

  const BookCatalog = () => {
    return (
      <div className="space-y-12">
        <div className="relative">
          <div className="flex gap-8 overflow-x-auto pb-4 custom-scrollbar no-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => {
              const catData = CATEGORY_ICONS[cat] || { img: '/all-book.png', color: 'text-primary', activeBg: 'bg-primary/10' };
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); }}
                  className="flex flex-col items-center gap-4 min-w-[80px] group transition-all duration-200 hover:-translate-y-1"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-200",
                    isActive
                      ? cn(catData.activeBg, "shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-2 border-white ring-4 ring-primary/5")
                      : "bg-white/40 border border-border/20 group-hover:bg-white group-hover:shadow-md"
                  )}>
                    <img
                      src={catData.img}
                      alt={cat}
                      className="w-10 h-10 object-contain transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    isActive ? "text-[#3A2C2B]" : "text-muted-foreground/40 group-hover:text-muted-foreground/80"
                  )}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={tableRef} className="space-y-4 sm:space-y-6 pt-4 scroll-mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-[#3A2C2B]">Full Catalog List</h3>
              <p className="text-xs font-medium text-muted-foreground">Searchable database view of all library assets</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setCatalogView('card')}
                  className={cn("p-2 rounded-lg transition-all", catalogView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCatalogView('table')}
                  className={cn("p-2 rounded-lg transition-all", catalogView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-border/50 w-full sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground ml-2" />
                <input
                  type="text"
                  placeholder="Search table..."
                  className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {catalogView === 'table' ? (
            <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden w-full">
              <CardContent className="p-0">
                <div className="overflow-x-auto no-scrollbar">
                  <div className="min-w-[900px] flex flex-col">
                    {/* Fixed Header */}
                    <div className="bg-[#3A2C2B] shrink-0">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-white/70">
                            <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Book Info</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Category</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Price</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Availability</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable Body */}
                    <div className="max-h-[300px] sm:max-h-[450px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-[#3A2C2B]/5">
                          {BOOKS_DATA.filter(b => (selectedCategory === 'All' || b.category === selectedCategory) && (b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()))).map((book) => {
                            const effectivelyAvailable = book.available - book.reserved;
                            return (
                              <tr key={book.id} className="hover:bg-primary/[0.02] transition-colors group">
                                <td className="w-[25%] px-8 py-6">
                                  <p className="text-sm font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{book.title}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{book.author}</p>
                                </td>
                                <td className="w-[15%] px-8 py-6 text-center">
                                  <Badge variant="outline" className="text-[10px] font-bold uppercase">{book.category}</Badge>
                                </td>
                                <td className="w-[15%] px-8 py-6 text-center text-sm font-black text-primary tabular-nums">${book.price.toFixed(2)}</td>
                                <td className="w-[15%] px-8 py-6 text-center text-sm font-bold text-muted-foreground">{book.available} / {book.total}</td>
                                <td className="w-[15%] px-8 py-6 text-center">
                                  <Badge variant={effectivelyAvailable > 0 ? 'brand-green' : (book.reserved > 0 ? 'brand-orange' : 'destructive')} className="font-black text-[9px] uppercase">
                                    {effectivelyAvailable > 0 ? 'Available' : (book.reserved > 0 ? 'In Queue' : 'Out of Stock')}
                                  </Badge>
                                </td>
                                <td className="w-[15%] px-8 py-6 text-right">
                                  <div className="flex justify-end gap-2">
                                    {isLibrarian ? (
                                      <>
                                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg text-primary hover:bg-primary/5"><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg text-destructive hover:bg-destructive/5"><Trash2 className="w-4 h-4" /></Button>
                                      </>
                                    ) : (
                                      <Button
                                        onClick={() => { setSelectedBookForRequest(book); setShowRequestModal(true); }}
                                        disabled={effectivelyAvailable <= 0}
                                        size="sm"
                                        className="rounded-lg h-9 px-4 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/10"
                                      >
                                        Request
                                      </Button>
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
                </div>

                {/* Pagination Footer */}
                <div className="px-8 py-5 border-t border-[#3A2C2B]/5 flex items-center justify-between bg-secondary/5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Showing <span className="text-[#3A2C2B]">{BOOKS_DATA.length}</span> of 156 assets
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={catalogPage === 1 ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                        catalogPage === 1 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                      )}
                      onClick={() => setCatalogPage(1)}
                    >
                      1
                    </Button>
                    <Button
                      variant={catalogPage === 2 ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                        catalogPage === 2 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                      )}
                      onClick={() => setCatalogPage(2)}
                    >
                      2
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5"
                    >
                      3
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
              {BOOKS_DATA.filter(b => (selectedCategory === 'All' || b.category === selectedCategory) && (b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()))).map((book, index) => {
                const effectivelyAvailable = book.available - book.reserved;
                const colors = ['bg-[#DCD2C3]', 'bg-[#BFDDD8]', 'bg-[#F0E0AD]', 'bg-[#B1D3EC]', 'bg-[#EBBDC2]'];
                const cardColor = colors[index % colors.length];
                
                return (
                  <div key={book.id} className={cn("flex-none w-[300px] group rounded-[32px] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border-none", cardColor)}>
                    <img
                      src="/books.png"
                      alt=""
                      className="absolute -right-12 -bottom-12 w-64 h-64 object-contain opacity-20 pointer-events-none z-0"
                    />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-[#3A2C2B] shadow-sm ring-4 ring-white/20">
                          <Book className="w-6 h-6" />
                        </div>
                        <Badge variant={effectivelyAvailable > 0 ? 'brand-green' : (book.reserved > 0 ? 'brand-orange' : 'destructive')} className="font-black text-[9px] uppercase border-none px-3 py-1 rounded-lg shadow-sm">
                          {effectivelyAvailable > 0 ? 'Available' : (book.reserved > 0 ? 'In Queue' : 'Out of Stock')}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-[#3A2C2B] leading-tight uppercase tracking-tighter line-clamp-2">{book.title}</h3>
                        <p className="text-[10px] font-black text-[#3A2C2B]/60 uppercase tracking-widest">{book.author} • {book.category}</p>
                      </div>

                      <div className="pt-6 border-t border-[#3A2C2B]/10 space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/20">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest">Asset Price</p>
                            <p className="text-sm font-black text-primary">${book.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right space-y-0.5">
                            <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest">Stock</p>
                            <p className="text-sm font-black text-[#3A2C2B]/90">{book.available} / {book.total}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          {isLibrarian ? (
                            <>
                              <Button variant="ghost" size="sm" className="flex-1 h-10 rounded-xl bg-white/50 hover:bg-white text-[#3A2C2B] text-[10px] font-black uppercase shadow-sm"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                              <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => { setSelectedBookForRequest(book); setShowRequestModal(true); }}
                              disabled={effectivelyAvailable <= 0}
                              className="w-full h-11 rounded-xl bg-[#3A2C2B] text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10"
                            >
                              Request Hold
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const PendingRequests = () => {
    const requests = isStudent ? BOOK_REQUESTS.filter(r => r.student === 'Sarah Jenkins') : BOOK_REQUESTS;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-[#3A2C2B]">{isStudent ? 'My Library Holds' : 'Pending Requests'}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {isStudent ? 'Manage your reserved books and pickup deadlines' : 'Review and approve first-come-first-served book requests'}
            </p>
          </div>
          <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setRequestView('card')}
              className={cn("p-2 rounded-lg transition-all", requestView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRequestView('table')}
              className={cn("p-2 rounded-lg transition-all", requestView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {requestView === 'table' ? (
          <div className="rounded-[32px] border border-[#3A2C2B]/10 bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[800px] flex flex-col">
                {/* Fixed Header */}
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white/70">
                        {!isStudent && <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Student</th>}
                        <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Book Name</th>
                        <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                        <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Hold Expiry</th>
                        {isLibrarian && <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>}
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left table-fixed">
                    <tbody className="divide-y divide-[#3A2C2B]/5">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-primary/[0.02] transition-colors group">
                          {!isStudent && (
                            <td className="w-[25%] px-8 py-5">
                              <p className="text-sm font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{req.student}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">ID: ST-2024-042</p>
                            </td>
                          )}
                          <td className="w-[25%] px-8 py-5 text-sm font-bold text-[#3A2C2B]">{req.book}</td>
                          <td className="w-[15%] px-8 py-5">
                            <Badge variant={req.status === 'Approved' ? 'brand-green' : 'brand-orange'} className="rounded-lg font-black text-[9px] uppercase">
                              {req.status}
                            </Badge>
                          </td>
                          <td className="w-[20%] px-8 py-5">
                            {req.expiry ? (
                              <div className="flex items-center gap-2 text-destructive">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase">{req.expiry}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-tight">Awaiting Approval</span>
                            )}
                          </td>
                          {isLibrarian && (
                            <td className="w-[15%] px-8 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                {req.status === 'Pending' ? (
                                  <Button
                                    onClick={() => handleApproveHold(req)}
                                    className="h-8 px-4 rounded-lg bg-brand-purple text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-brand-purple/20"
                                  >
                                    Approve
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleApproveAndIssue(req)}
                                    className="h-8 px-4 rounded-lg bg-brand-green text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-brand-green/20"
                                  >
                                    Issue
                                  </Button>
                                )}
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

            {/* Pagination Footer */}
            <div className="px-8 py-5 border-t border-[#3A2C2B]/5 flex items-center justify-between bg-secondary/5">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Showing <span className="text-[#3A2C2B]">{requests.length}</span> of 24 records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant={pendingPage === 1 ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                    pendingPage === 1 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                  )}
                  onClick={() => setPendingPage(1)}
                >
                  1
                </Button>
                <Button
                  variant={pendingPage === 2 ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                    pendingPage === 2 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                  )}
                  onClick={() => setPendingPage(2)}
                >
                  2
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
            {requests.map((req, index) => {
              const colors = ['bg-[#DCD2C3]', 'bg-[#BFDDD8]', 'bg-[#F0E0AD]', 'bg-[#B1D3EC]', 'bg-[#EBBDC2]'];
              const cardColor = colors[index % colors.length];
              return (
              <div key={req.id} className={cn("flex-none w-[280px] group rounded-[32px] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border-none", cardColor)}>
                <img
                  src="/books.png"
                  alt=""
                  className="absolute -right-12 -bottom-12 w-64 h-64 object-contain opacity-20 pointer-events-none z-0"
                />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-[#3A2C2B] shadow-sm">
                      <Bell className="w-5 h-5" />
                    </div>
                    <Badge variant={req.status === 'Approved' ? 'brand-green' : 'brand-orange'} className="rounded-lg font-black text-[9px] uppercase border-none px-3 py-1 shadow-sm">
                      {req.status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black text-[#3A2C2B] leading-tight uppercase tracking-tighter line-clamp-2">{req.book}</h3>
                    {!isStudent && <p className="text-[10px] font-black text-[#3A2C2B]/60 uppercase tracking-widest">{req.student}</p>}
                  </div>

                  <div className="pt-4 border-t border-[#3A2C2B]/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-[#3A2C2B]/50">Hold Expiry</span>
                      {req.expiry ? (
                        <div className="flex items-center gap-2 text-destructive">
                          <Clock className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase">{req.expiry}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-[#3A2C2B]/40 italic">Awaiting Approval</span>
                      )}
                    </div>

                    {isLibrarian && (
                      <div className="pt-2">
                        {req.status === 'Pending' ? (
                          <Button
                            onClick={() => handleApproveHold(req)}
                            className="w-full h-10 rounded-xl bg-brand-purple text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-purple/20"
                          >
                            Approve Hold
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleApproveAndIssue(req)}
                            className="w-full h-10 rounded-xl bg-brand-green text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-green/20"
                          >
                            Proceed to Issue
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    );
  };

  const IssueManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-[#3A2C2B]">Active Issues</h3>
          <p className="text-xs font-medium text-muted-foreground">Track and manage current book borrowings</p>
        </div>
        <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setIssueView('card')}
            className={cn("p-2 rounded-lg transition-all", issueView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIssueView('table')}
            className={cn("p-2 rounded-lg transition-all", issueView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {issueView === 'table' ? (
        <div className="rounded-[32px] border border-[#3A2C2B]/10 bg-white shadow-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[900px] flex flex-col">
              {/* Fixed Header */}
              <div className="bg-[#3A2C2B] shrink-0">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="text-white">
                      <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Issued To</th>
                      <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Book Name</th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Issue Date</th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Due Date</th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/70">Status</th>
                      <th className="w-[10%] px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white/70">Actions</th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable Body */}
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody className="divide-y divide-[#3A2C2B]/5">
                    {ISSUE_RECORDS.map((rec) => (
                      <tr key={rec.id} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="w-[20%] px-8 py-5">
                          <p className="text-sm font-black text-[#3A2C2B]">{rec.borrower}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{rec.role}</p>
                        </td>
                        <td className="w-[25%] px-8 py-5 text-sm font-bold text-[#3A2C2B]">{rec.book}</td>
                        <td className="w-[15%] px-8 py-5 text-sm font-bold text-muted-foreground">{rec.date}</td>
                        <td className="w-[15%] px-8 py-5 text-sm font-bold text-muted-foreground">{rec.due}</td>
                        <td className="w-[15%] px-8 py-5">
                          <Badge variant={rec.status === 'Overdue' ? 'destructive' : 'brand-purple'} className="rounded-lg font-black text-[9px] uppercase">
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="w-[10%] px-8 py-5 text-right">
                          {isLibrarian && (
                            <Button
                              onClick={() => handleOpenReturnModal(rec)}
                              variant="ghost"
                              size="sm"
                              className="text-primary font-black uppercase text-[10px] hover:bg-primary/5 rounded-lg px-3"
                            >
                              Return
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-5 border-t border-[#3A2C2B]/5 flex items-center justify-between bg-secondary/5">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Showing <span className="text-[#3A2C2B]">{ISSUE_RECORDS.length}</span> of 48 records
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5"
                onClick={() => setIssuePage(Math.max(1, issuePage - 1))}
              >
                1
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-9 w-9 rounded-xl p-0 text-[10px] font-black bg-[#3A2C2B] text-white shadow-lg shadow-black/10"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5"
              >
                3
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
          {ISSUE_RECORDS.map((rec, index) => {
            const colors = ['bg-[#DCD2C3]', 'bg-[#BFDDD8]', 'bg-[#F0E0AD]', 'bg-[#B1D3EC]', 'bg-[#EBBDC2]'];
            const cardColor = colors[index % colors.length];
            return (
            <div key={rec.id} className={cn("flex-none w-[300px] group rounded-[32px] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border-none", cardColor)}>
              <img
                src="/books.png"
                alt=""
                className="absolute -right-12 -bottom-12 w-64 h-64 object-contain opacity-20 pointer-events-none z-0"
              />
              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-[#3A2C2B] shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <Badge variant={rec.status === 'Overdue' ? 'destructive' : 'brand-purple'} className="rounded-lg font-black text-[9px] uppercase border-none px-3 py-1 shadow-sm">
                    {rec.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#3A2C2B] leading-tight uppercase tracking-tighter line-clamp-2">{rec.book}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-[#3A2C2B]/60 uppercase tracking-widest">{rec.borrower}</p>
                    <span className="w-1 h-1 rounded-full bg-[#3A2C2B]/20" />
                    <p className="text-[10px] font-black text-[#3A2C2B]/40 uppercase tracking-widest">{rec.role}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/40 border border-white/20 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Issue Date</p>
                    <p className="text-xs font-black text-[#3A2C2B]/80">{rec.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Due Date</p>
                    <p className="text-xs font-black text-destructive/80 font-bold">{rec.due}</p>
                  </div>
                </div>

                {isLibrarian && (
                  <Button
                    onClick={() => handleOpenReturnModal(rec)}
                    className="w-full h-11 rounded-xl bg-white/50 hover:bg-white text-[#3A2C2B] font-black uppercase text-[10px] tracking-widest border-none shadow-sm"
                  >
                    PROCESS RETURN
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );

  const ReturnManagement = () => {
    const returnHistory = isStudent ? RETURN_HISTORY.filter(r => r.borrower === 'Sarah Jenkins') : RETURN_HISTORY;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-[#3A2C2B]">{isStudent ? 'My Return History' : 'Return History'}</h3>
            <p className="text-xs font-medium text-muted-foreground">Logs of returned books and late fee records</p>
          </div>
          <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setReturnView('card')}
              className={cn("p-2 rounded-lg transition-all", returnView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReturnView('table')}
              className={cn("p-2 rounded-lg transition-all", returnView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {returnView === 'table' ? (
        <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden w-full">
          <CardContent className="p-0">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[850px] flex flex-col">
                {/* Fixed Header */}
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white/70">
                        {!isStudent && <th className="w-[20%] px-8 py-4 text-[10px] font-black uppercase tracking-widest">Issued To</th>}
                        <th className="w-[25%] px-8 py-4 text-[10px] font-black uppercase tracking-widest">Book</th>
                        <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase tracking-widest">Returned On</th>
                        <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase tracking-widest">Late Days</th>
                        <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase tracking-widest">Fine Paid</th>
                        <th className="w-[10%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left table-fixed">
                    <tbody className="divide-y divide-[#3A2C2B]/5">
                      {returnHistory.map((rec) => (
                        <tr key={rec.id} className="hover:bg-primary/[0.02] transition-colors group">
                          {!isStudent && <td className="w-[20%] px-8 py-5 text-sm font-black text-[#3A2C2B]">{rec.borrower}</td>}
                          <td className="w-[25%] px-8 py-5 text-sm font-bold text-muted-foreground">{rec.book}</td>
                          <td className="w-[15%] px-8 py-5 text-sm font-bold text-muted-foreground">{rec.returned}</td>
                          <td className="w-[15%] px-8 py-5 text-sm font-bold text-muted-foreground">{rec.late} Days</td>
                          <td className="w-[15%] px-8 py-5">
                            <p className={cn("text-sm font-black", rec.fine > 0 ? "text-destructive" : "text-brand-green")}>
                              ${rec.fine.toFixed(2)}
                            </p>
                          </td>
                          <td className="w-[10%] px-8 py-5 text-right">
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg text-primary hover:bg-primary/5"><FileText className="w-4 h-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        ) : (
          <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
            {returnHistory.map((rec, index) => {
              const colors = ['bg-[#DCD2C3]', 'bg-[#BFDDD8]', 'bg-[#F0E0AD]', 'bg-[#B1D3EC]', 'bg-[#EBBDC2]'];
              const cardColor = colors[index % colors.length];

              return (
                <div key={rec.id} className={cn("flex-none w-[300px] group rounded-[32px] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border-none", cardColor)}>
                  <img
                    src="/books.png"
                    alt=""
                    className="absolute -right-12 -bottom-12 w-64 h-64 object-contain opacity-20 pointer-events-none z-0"
                  />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center text-[#3A2C2B] shadow-sm">
                        <History className="w-5 h-5" />
                      </div>
                      <Badge variant={rec.fine > 0 ? 'destructive' : 'brand-green'} className="rounded-lg font-black text-[9px] uppercase border-none px-3 py-1 shadow-sm">
                        {rec.fine > 0 ? 'Fine Paid' : 'On Time'}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#3A2C2B] leading-tight uppercase tracking-tighter line-clamp-2">{rec.book}</h3>
                      {!isStudent && <p className="text-[10px] font-black text-[#3A2C2B]/60 uppercase tracking-widest">{rec.borrower}</p>}
                    </div>

                    <div className="p-4 rounded-2xl bg-white/40 border border-white/20 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Returned</p>
                        <p className="text-xs font-black text-[#3A2C2B]/80">{rec.returned}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Late Days</p>
                        <p className="text-xs font-black text-destructive/80 font-bold">{rec.late} Days</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-black text-[#3A2C2B]/50 uppercase tracking-widest">Fine</span>
                      <span className={cn("text-lg font-black", rec.fine > 0 ? "text-destructive" : "text-brand-green")}>${rec.fine.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const InventoryManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Units</p>
            <p className="text-xl font-black text-[#3A2C2B]">1,248 Copies</p>
          </div>
        </Card>
        <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Damaged (-D-)</p>
            <p className="text-xl font-black text-[#3A2C2B]">14 Units</p>
          </div>
        </Card>
        <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Missing (-M-)</p>
            <p className="text-xl font-black text-[#3A2C2B]">5 Units</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-[#3A2C2B]">Asset Identification Registry</h3>
          <p className="text-xs font-medium text-muted-foreground">Tracking unique IDs and lifecycle prefixes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setInventoryView('card')}
              className={cn("p-2 rounded-lg transition-all", inventoryView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setInventoryView('table')}
              className={cn("p-2 rounded-lg transition-all", inventoryView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={() => setShowAddBookModal(true)}
            className="rounded-xl bg-primary text-white font-black uppercase text-[10px] px-6 h-11 shadow-lg shadow-primary/20"
          >
            Register New Assets
          </Button>
        </div>
      </div>

      {inventoryView === 'table' ? (
        <div className="rounded-[24px] border border-[#3A2C2B]/10 bg-white shadow-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[900px] flex flex-col">
              {/* Fixed Header */}
              <div className="bg-[#3A2C2B] shrink-0">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="text-white/70">
                      <th className="w-[30%] px-8 py-4 text-[10px] font-black uppercase tracking-widest">Book</th>
                      <th className="w-[10%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Total</th>
                      <th className="w-[10%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Normal</th>
                      <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center text-brand-orange">Damaged</th>
                      <th className="w-[15%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center text-destructive">Missing</th>
                      <th className="w-[20%] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable Body */}
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody className="divide-y divide-[#3A2C2B]/5">
                    {BOOKS_DATA.map(book => {
                      const damaged = book.copies.filter(c => c.unitId.includes('-D-')).length;
                      const missing = book.copies.filter(c => c.unitId.includes('-M-')).length;
                      const normal = book.total - damaged - missing;

                      return (
                        <tr key={book.id} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="w-[30%] px-8 py-5">
                            <p className="text-sm font-black text-[#3A2C2B]">{book.title}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{book.id}</p>
                          </td>
                          <td className="w-[10%] px-8 py-5 text-center text-sm font-black">{book.total}</td>
                          <td className="w-[10%] px-8 py-5 text-center text-sm font-bold text-muted-foreground">{normal}</td>
                          <td className="w-[15%] px-8 py-5 text-center text-sm font-bold text-brand-orange">{damaged}</td>
                          <td className="w-[15%] px-8 py-5 text-center text-sm font-bold text-destructive">{missing}</td>
                          <td className="w-[20%] px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleOpenCopyRegistry(book)}
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                              >
                                IDs
                              </Button>
                              <Button
                                onClick={() => handleOpenStockModal(book)}
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg text-primary font-black uppercase text-[9px] hover:bg-primary/5 px-2"
                              >
                                Update
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-5 border-t border-[#3A2C2B]/5 flex items-center justify-between bg-secondary/5">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Showing <span className="text-[#3A2C2B]">{BOOKS_DATA.length}</span> of 842 records
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant={registryPage === 1 ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                  registryPage === 1 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                )}
                onClick={() => setRegistryPage(1)}
              >
                1
              </Button>
              <Button
                variant={registryPage === 2 ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                  registryPage === 2 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                )}
                onClick={() => setRegistryPage(2)}
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5"
              >
                3
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
          {BOOKS_DATA.map((book, index) => {
            const damaged = book.copies.filter(c => c.unitId.includes('-D-')).length;
            const missing = book.copies.filter(c => c.unitId.includes('-M-')).length;
            const normal = book.total - damaged - missing;
            const colors = ['bg-[#DCD2C3]', 'bg-[#BFDDD8]', 'bg-[#F0E0AD]', 'bg-[#B1D3EC]', 'bg-[#EBBDC2]'];
            const cardColor = colors[index % colors.length];

            return (
              <div key={book.id} className={cn("flex-none w-[320px] group rounded-[32px] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border-none", cardColor)}>
                <img
                  src="/books.png"
                  alt=""
                  className="absolute -right-12 -bottom-12 w-64 h-64 object-contain opacity-20 pointer-events-none z-0"
                />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center shadow-sm ring-4 ring-white/20">
                      <ClipboardList className="w-6 h-6 text-[#3A2C2B]" />
                    </div>
                    <Badge className="bg-white/40 text-[#3A2C2B] border-none font-black text-[9px] px-3 py-1 rounded-lg uppercase shadow-sm">{book.id}</Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#3A2C2B] leading-tight uppercase tracking-tighter line-clamp-2">{book.title}</h3>
                    <p className="text-[10px] font-black text-[#3A2C2B]/60 uppercase tracking-widest">Total Assets: {book.total}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-white/40 border border-white/20 text-center">
                      <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Healthy</p>
                      <p className="text-sm font-black text-brand-green">{normal}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/40 border border-white/20 text-center">
                      <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Damage</p>
                      <p className="text-sm font-black text-brand-orange">{damaged}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/40 border border-white/20 text-center">
                      <p className="text-[8px] font-black text-[#3A2C2B]/50 uppercase tracking-widest mb-1">Missing</p>
                      <p className="text-sm font-black text-destructive">{missing}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      onClick={() => handleOpenCopyRegistry(book)}
                      variant="ghost"
                      className="flex-1 h-11 rounded-xl bg-white/50 hover:bg-white text-[#3A2C2B] font-black uppercase text-[10px] tracking-widest shadow-sm"
                    >
                      MANAGE IDs
                    </Button>
                    <Button
                      onClick={() => handleOpenStockModal(book)}
                      variant="ghost"
                      className="w-11 h-11 rounded-xl bg-white/50 hover:bg-white text-[#3A2C2B] shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const LibraryHeader = () => {
    return (
      <div className="relative overflow-hidden p-8 md:p-10 rounded-[32px] border-none shadow-none mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mx-4 lg:mx-6 mt-4 transition-all duration-500 min-h-[220px] lg:min-h-[240px] bg-[#BFDDD8]">
        {/* Content wrapper */}
        <div className="relative z-10 max-w-[65%] md:max-w-xl flex flex-col justify-center h-full">
          <h1 className="text-3xl sm:text-4xl font-black text-[#3A2C2B] tracking-tight">Library Management</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-white/40 border-white/20 text-[#3A2C2B] font-black px-3 py-1 rounded-lg text-[8px] sm:text-[9px] uppercase tracking-widest whitespace-nowrap">
              Term 2 • Session 2026-27
            </Badge>
            <span className="text-[8px] sm:text-[10px] font-bold text-[#3A2C2B]/60 uppercase tracking-widest italic sm:whitespace-nowrap leading-tight">
              {isLibrarian ? 'Librarian Mode • Admin Center' : 'Student Mode • Knowledge Center'}
            </span>
          </div>
          <p className="hidden md:block text-xs font-bold text-[#3A2C2B]/70 mt-3 max-w-md">
            {isLibrarian
              ? 'Monitor inventory status, track active borrowings, approve hold requests, and maintain the catalog records.'
              : 'Browse our extensive catalog of books, request holds, track your active reading history, and check due dates.'
            }
          </p>
          <div className="hidden md:flex flex-col md:flex-row items-start md:items-center gap-3 mt-4">
            <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#3A2C2B] w-fit">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Read • Learn • Grow • Return books on time</span>
            </div>
          </div>
        </div>

        {/* Library.png illustration layout */}
        <div className="absolute right-0 bottom-0 top-0 flex items-end md:items-center justify-end w-[65%] md:w-1/3 pointer-events-none select-none z-0 pb-0">
          <img
            src="/library.png"
            alt="Library Illustration"
            className="object-contain w-full h-[100%] md:h-[130%] translate-y-3 md:translate-y-6 max-h-[180px] md:max-h-[220px] object-right-bottom md:object-contain"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 sm:space-y-10 pb-20">
      <LibraryHeader />

      {/* Warden Navigation Tabs - Library Style Centered */}
      <div className="px-4 lg:px-6">
        {/* Desktop & Student View */}
        <div className={cn(isLibrarian ? "hidden md:block" : "block")}>
          <TabSwitcher
            tabs={[
              { id: 'dashboard', icon: BarChart3, label: 'Dash' },
              { id: 'catalog', icon: Book, label: 'Books' },
              { id: 'requests', icon: Bell, label: 'Requests' },
              { id: 'issue', icon: ArrowLeftRight, label: 'Issue', librarianOnly: true },
              { id: 'return', icon: History, label: 'History' },
              { id: 'inventory', icon: ClipboardList, label: 'Stock', librarianOnly: true },
            ].filter(tab => !tab.librarianOnly || isLibrarian)}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as any)}
            color="bg-[#C5735B]"
          />
        </div>

        {/* Mobile Librarian Grid View */}
        {isLibrarian && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-[40px] py-5 px-5 shadow-xl border border-[#E9E1D5]/50 max-w-[320px] mx-auto mt-2">
            <div className="grid grid-cols-3 gap-y-6 gap-x-2 place-items-center">
              {[
                { id: 'dashboard', icon: BarChart3, label: 'Dash' },
                { id: 'catalog', icon: Book, label: 'Books' },
                { id: 'requests', icon: Bell, label: 'Requests' },
                { id: 'issue', icon: ArrowLeftRight, label: 'Issue' },
                { id: 'return', icon: History, label: 'History' },
                { id: 'inventory', icon: ClipboardList, label: 'Stock' },
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center transition-all duration-300 w-full",
                      isActive
                        ? "bg-[#C5735B] text-white rounded-[24px] h-[52px] shadow-md -my-1"
                        : "text-[#8B7E74] hover:bg-black/5 hover:text-black rounded-full h-[40px]"
                    )}
                  >
                    <tab.icon className={cn(isActive ? "w-4 h-4 mb-1 animate-pulse" : "w-5 h-5")} />
                    {isActive && (
                      <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-0.5 text-white/90">
                        {tab.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 lg:px-6 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full">
              <img
                src="/book-dashboard.png"
                alt="Library Dashboard"
                className="w-full h-[150px] sm:h-[280px] object-contain"
              />
            </div>

            <LibraryKPIs />

            <div className="space-y-6 sm:space-y-10">
              {isStudent ? (
                <PendingRequests />
              ) : (
                <IssueManagement />
              )}

              <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="p-4 sm:p-8 border-b border-border/30 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black text-[#3A2C2B]">
                      {isStudent ? 'My Issuance Stats' : 'Quick Issuance Snapshot'}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium">Recent status distribution</CardDescription>
                  </div>
                  <BarChart3 className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  {['Currently Issued', 'Available Books', 'Overdue Returns', 'Lost/Damaged'].map((label, i) => {
                    const counts = isStudent ? [3, 874, 1, 0] : [342, 874, 24, 8];
                    const colors = ['bg-brand-purple', 'bg-brand-green', 'bg-brand-orange', 'bg-destructive'];
                    const count = counts[i];
                    const color = colors[i];
                    const total = isStudent ? 10 : 1248; // Mock limit for student
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-[#3A2C2B]">{count} ({Math.round(count / total * 100)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", color)} style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && <BookCatalog />}
        {activeTab === 'requests' && <PendingRequests />}
        {activeTab === 'issue' && <IssueManagement />}
        {activeTab === 'return' && <ReturnManagement />}
        {activeTab === 'inventory' && <InventoryManagement />}
      </div>

      {/* ══ MODALS ══ */}

      {/* Add Book Modal */}
      <Modal
        isOpen={showAddBookModal}
        onClose={() => setShowAddBookModal(false)}
        title="Add New Book to Library"
      >
        <div className="space-y-6 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Book Title</label>
              <Input placeholder="Enter book title" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Author</label>
              <Input placeholder="Enter author name" />
            </div>
            <Select label="Category" options={CATEGORIES.slice(1).map(c => ({ label: c, value: c }))} />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">ISBN Number</label>
              <Input placeholder="978-0000000000" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Total Copies</label>
              <Input type="number" placeholder="5" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Price Per Copy</label>
              <Input type="number" placeholder="45.00" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest" onClick={() => setShowAddBookModal(false)}>
              <Save className="w-4 h-4 mr-2" /> Save Book
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowAddBookModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Unit ID Registry Modal */}
      <Modal
        isOpen={showCopyRegistry}
        onClose={() => setShowCopyRegistry(false)}
        title={`ID Registry: ${selectedBookForRegistry?.title}`}
      >
        <div className="space-y-6 p-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-primary/5 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase text-muted-foreground">Normal</p>
              <p className="text-sm font-black text-[#3A2C2B]">{selectedBookForRegistry?.copies.filter((c: any) => !c.unitId.includes('-D-') && !c.unitId.includes('-M-')).length}</p>
            </div>
            <div className="p-3 bg-brand-orange/5 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase text-brand-orange">Damaged</p>
              <p className="text-sm font-black text-brand-orange">{selectedBookForRegistry?.copies.filter((c: any) => c.unitId.includes('-D-')).length}</p>
            </div>
            <div className="p-3 bg-destructive/5 rounded-xl text-center">
              <p className="text-[8px] font-black uppercase text-destructive">Missing</p>
              <p className="text-sm font-black text-destructive">{selectedBookForRegistry?.copies.filter((c: any) => c.unitId.includes('-M-')).length}</p>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-3 gap-3">
              {selectedBookForRegistry?.copies.map((copy: any) => (
                <div key={copy.unitId} className="p-3 rounded-xl border border-border/30 text-center">
                  <p className={cn(
                    "text-[10px] font-black",
                    copy.unitId.includes('-D-') ? 'text-brand-orange' :
                      copy.unitId.includes('-M-') ? 'text-destructive' : 'text-primary'
                  )}>
                    {copy.unitId}
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">{copy.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Stock State Update Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={`Update Asset State: ${selectedBookForStock?.title}`}
      >
        <div className="space-y-6 p-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Select Physical Unit (ID)</label>
              <Select
                value={selectedUnitId}
                onChange={setSelectedUnitId}
                options={selectedBookForStock?.copies.map((c: any) => ({
                  label: c.unitId,
                  value: c.unitId
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Change State To</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Mark Damaged (-D-)', val: 'damage' },
                  { label: 'Mark Missing (-M-)', val: 'missing' },
                  { label: 'Repair (➔ Normal)', val: 'repair' },
                  { label: 'Found (➔ Normal)', val: 'found' },
                  { label: 'Decommission (Remove)', val: 'remove' }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setStockAdjAction(opt.val)}
                    className={cn(
                      "p-3 rounded-xl border text-[10px] font-black uppercase transition-all",
                      stockAdjAction === opt.val ? "bg-primary/10 border-primary text-primary" : "border-border/30 hover:border-primary/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/20 text-center">
              <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">New Identity Outcome</p>
              <p className="text-lg font-black text-primary">
                {selectedUnitId ? (
                  stockAdjAction === 'repair' || stockAdjAction === 'found' ?
                    selectedUnitId.replace('-D-', '').replace('-M-', '') :
                    stockAdjAction === 'damage' ?
                      selectedUnitId.includes('-D-') ? selectedUnitId : `${selectedUnitId.split('-')[0]}-D-${selectedUnitId.split('-').pop()}` :
                      stockAdjAction === 'missing' ?
                        selectedUnitId.includes('-M-') ? selectedUnitId : `${selectedUnitId.split('-')[0]}-M-${selectedUnitId.split('-').pop()}` :
                        stockAdjAction === 'remove' ? 'DELETED' : selectedUnitId
                ) : 'Select a Unit'}
              </p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest" onClick={handleStockUpdate}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Commit Identity Change
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowStockModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Request Hold Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Confirm Hold Request">
        <div className="space-y-6 p-2">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Book Selection</p>
            <p className="text-lg font-black text-primary">{selectedBookForRequest?.title}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase">{selectedBookForRequest?.author}</p>
          </div>
          <div className="space-y-4 text-xs font-medium text-muted-foreground leading-relaxed">
            <p>• You are requesting a 24-hour hold on this book.</p>
            <p>• Once approved, the book will be reserved specifically for you.</p>
            <p>• Failure to collect within the expiry window will release the hold to the next student.</p>
          </div>
          <div className="pt-4 flex gap-3">
            <Button className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest" onClick={() => setShowRequestModal(false)}>
              Confirm Request
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowRequestModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Issue Book Modal */}
      <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue Book to Student">
        <div className="space-y-6 p-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Student</p>
              <input value={selectedRequestForIssue?.student} readOnly className="w-full bg-muted/30 p-2 rounded-lg" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Book</p>
              <input value={selectedRequestForIssue?.book} readOnly className="w-full bg-muted/30 p-2 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Issue Date</p>
                <input value="2026-05-11" readOnly className="w-full bg-muted/30 p-2 rounded-lg" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">Due Date</p>
                <input type="date" defaultValue="2026-05-25" className="w-full bg-white border border-border/30 p-2 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button className="flex-1 h-12 rounded-xl bg-brand-green text-white font-black uppercase text-xs tracking-widest" onClick={handleIssueSuccess}>
              Confirm Issuance
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowIssueModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Return Book Modal */}
      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Process Book Return">
        <div className="space-y-6 p-2">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Original Due Date</p>
              <p className="text-sm font-black">{selectedRecordForReturn?.due}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Return Date (Today)</p>
              <p className="text-sm font-black text-primary">2026-05-11</p>
            </div>
            {selectedRecordForReturn?.status === 'Overdue' && (
              <div className="pt-2 border-t border-primary/10 flex justify-between items-center">
                <p className="text-[10px] font-black uppercase text-destructive">Late Fine Calculated</p>
                <p className="text-lg font-black text-destructive">$12.50</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Book Condition</label>
            <Select
              options={[
                { label: 'Perfect Condition', value: 'perfect' },
                { label: 'Minor Wear & Tear', value: 'wear' },
                { label: 'Damaged (Needs Repair)', value: 'damaged' }
              ]}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest" onClick={handleReturnSuccess}>
              Confirm Return
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setShowReturnModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LibraryPage;