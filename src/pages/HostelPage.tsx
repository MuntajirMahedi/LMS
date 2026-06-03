import { useState, useEffect } from 'react';
import {
  Home,
  Bed,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building2,
  Building,
  LayoutGrid,
  List,
  MapPin,
  ShieldCheck,
  Send,
  Bell,
  User,
  Plus,
  ChevronLeft,
  Filter,
  Calendar,
  ArrowLeftRight,
  DollarSign,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';

import {
  HOSTEL_KPIS,
  getOccupancyData,
  getRoomsData,
  getPendingRequests,
  getResidentsData,
  getHostelNotices,
  setOccupancyData,
  setPendingRequests,
  setHostelNotices as saveHostelNotices,
} from '../mock/hostelMock';

const HostelPage = () => {
  const { activeRole } = useAuth();

  // Modals
  const [showAddHostel, setShowAddHostel] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddBed, setShowAddBed] = useState(false);
  const [showAllocateBed, setShowAllocateBed] = useState(false);

  // Add Room Logic States
  const [roomHostelId, setRoomHostelId] = useState('BA');
  const [roomFloor, setRoomFloor] = useState('1');
  const [roomsToAdd, setRoomsToAdd] = useState('1');
  const [localOccupancy, setLocalOccupancy] = useState(getOccupancyData());

  // Bed Allocation States
  const [allocHostelFilter, setAllocHostelFilter] = useState('All');
  const [allocFloorFilter, setAllocFloorFilter] = useState('All');
  const [allocView, setAllocView] = useState<'table' | 'card'>('table');

  const [hostelNotices, setHostelNotices] = useState(getHostelNotices());
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [studentApplyHostel, setStudentApplyHostel] = useState('');
  const [selectedBlockForDetails, setSelectedBlockForDetails] = useState<string | null>(null);
  const [detailsFloor, setDetailsFloor] = useState(1);
  const [isResident, setIsResident] = useState(false);
  const [activeWardenTab, setActiveWardenTab] = useState<'overview' | 'residents' | 'requests' | 'notices'>('overview');

  const [requestPage, setRequestPage] = useState(1);
  const [requestHostelFilter, setRequestHostelFilter] = useState('All');
  const [requestFloorFilter, setRequestFloorFilter] = useState('All');
  const [requestTypeFilter, setRequestTypeFilter] = useState('All');

  interface ResidentRequest {
    id: string;
    studentName: string;
    type: 'Leave Request' | 'Room Transfer';
    subject: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
    hostel: string;
    floor: string;
    room: string;
    currentRoom?: string;
    currentBed?: string;
    startDate?: string;
    returnDate?: string;
  }

  const [residentRequests, setResidentRequests] = useState<ResidentRequest[]>([
    { id: '1', studentName: 'John Doe', type: 'Room Transfer', subject: 'Shifting to Block B', reason: 'Medical grounds. Need lower floor room due to leg injury.', status: 'Pending', date: 'May 12, 2026', hostel: 'Block Alpha', floor: '2', room: 'BA-F2-204', currentRoom: 'BA-F2-204', currentBed: '1' },
    { id: '2', studentName: 'Jane Smith', type: 'Leave Request', subject: 'Brother Marriage', reason: 'Family function at home town.', status: 'Approved', date: 'May 10, 2026', hostel: 'Block Beta', floor: '1', room: 'BB-F1-105', startDate: '2026-05-15', returnDate: '2026-05-20' },
    { id: '3', studentName: 'Mike Johnson', type: 'Room Transfer', subject: 'AC Issue', reason: 'AC Repair Needed. Room is too hot.', status: 'Pending', date: 'May 13, 2026', hostel: 'Block Alpha', floor: '3', room: 'BA-F3-302', currentRoom: 'BA-F3-302', currentBed: '2' },
    { id: '4', studentName: 'Emily Davis', type: 'Leave Request', subject: 'Emergency Leave', reason: 'Personal Emergency at home.', status: 'Pending', date: 'May 13, 2026', hostel: 'Girls Block A', floor: '1', room: 'GA-F1-112', startDate: '2026-05-14', returnDate: '2026-05-16' },
    { id: '5', studentName: 'Chris Evans', type: 'Room Transfer', subject: 'Roommate Issue', reason: 'Noisy Neighbors and roommate conflicts.', status: 'Pending', date: 'May 12, 2026', hostel: 'Block Beta', floor: '2', room: 'BB-F2-210', currentRoom: 'BB-F2-210', currentBed: '1' },
    { id: '6', studentName: 'Sarah Connor', type: 'Leave Request', subject: 'Summer Break', reason: 'Family Visit for summer break.', status: 'Approved', date: 'May 11, 2026', hostel: 'Girls Block B', floor: '1', room: 'GB-F1-105', startDate: '2026-05-20', returnDate: '2026-06-10' },
    { id: '7', studentName: 'Alex Mercer', type: 'Room Transfer', subject: 'Ventilation Problem', reason: 'Ventilation Issue in current room.', status: 'Pending', date: 'May 12, 2026', hostel: 'Block Alpha', floor: '2', room: 'BA-F2-204', currentRoom: 'BA-F2-204', currentBed: '2' },
    { id: '8', studentName: 'Bruce Wayne', type: 'Leave Request', subject: 'Business Meeting', reason: 'Urgent business trip.', status: 'Pending', date: 'May 13, 2026', hostel: 'Block Beta', floor: '1', room: 'BB-F1-101', startDate: '2026-05-14', returnDate: '2026-05-15' },
    { id: '9', studentName: 'Diana Prince', type: 'Room Transfer', subject: 'Medical Ground Shift', reason: 'Medical grounds requirement.', status: 'Pending', date: 'May 12, 2026', hostel: 'Girls Block A', floor: '3', room: 'GA-F3-305', currentRoom: 'GA-F3-305', currentBed: '1' },
    { id: '10', studentName: 'Peter Parker', type: 'Leave Request', subject: 'Internship Program', reason: 'Joining internship at Daily Bugle.', status: 'Approved', date: 'May 10, 2026', hostel: 'Block Alpha', floor: '2', room: 'BA-F2-202', startDate: '2026-06-01', returnDate: '2026-08-31' },
  ]);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<any>(null);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);

  // Action States
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showLogDiscipline, setShowLogDiscipline] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<any>(null);
  const [detailsBedPref, setDetailsBedPref] = useState<'Single' | 'Double'>('Single');
  const [selectedBedForApply, setSelectedBedForApply] = useState<{
    hostelId: string; hostelName: string; roomId: string;
    roomNum: string; bedNum: string; bedType: 'Single' | 'Double'; floor: number;
  } | null>(null);

  // Add Bed Logic States
  const [addBedHostelId, setAddBedHostelId] = useState('BA');
  const [addBedFloor, setAddBedFloor] = useState('1');
  const [addBedRoomId, setAddBedRoomId] = useState('');
  const [singleBeds, setSingleBeds] = useState('0');

  // Bed Allocation States
  const [allocHostelId, setAllocHostelId] = useState('');
  const [allocStudentId, setAllocStudentId] = useState('');
  const [allocFloor, setAllocFloor] = useState('1');
  const [allocRoomId, setAllocRoomId] = useState('');
  const [allocBed, setAllocBed] = useState('');
  const [residentPage, setResidentPage] = useState(1);
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [showRoomShiftModal, setShowRoomShiftModal] = useState(false);
  const [resHostelFilter, setResHostelFilter] = useState('All');
  const [resFloorFilter, setResFloorFilter] = useState('All');
  const [resRoomFilter, setResRoomFilter] = useState('All');
  const [noticeThreshold] = useState(3);
  const [suspendThreshold] = useState(5);
  const [resView, setResView] = useState<'table' | 'card'>('table');
  const [reqView, setReqView] = useState<'table' | 'card'>('table');



  const isAdmin = activeRole === 'SCHOOL_ADMIN' || activeRole === 'SUPER_ADMIN';
  const isWarden = activeRole === 'HOSTEL_WARDEN' || isAdmin;
  const isStudentRole = activeRole === 'STUDENT';

  // Student pending requests (includes mock + student-submitted ones)
  const [studentRequests, setStudentRequests] = useState(getPendingRequests());

  // Persist hostel state changes to localStorage
  useEffect(() => { setOccupancyData(localOccupancy); }, [localOccupancy]);
  useEffect(() => { setPendingRequests(studentRequests); }, [studentRequests]);
  useEffect(() => { saveHostelNotices(hostelNotices); }, [hostelNotices]);

  const handleAddRooms = (finish = false) => {
    const num = parseInt(roomsToAdd) || 0;
    if (num <= 0) return;

    setLocalOccupancy(prev => prev.map(h => {
      if (h.id === roomHostelId) {
        const updated = [...h.roomsPerFloor];
        updated[parseInt(roomFloor) - 1] += num;
        return { ...h, roomsPerFloor: updated, total: h.total + num };
      }
      return h;
    }));

    setRoomsToAdd('1');

    if (finish) setShowAddRoom(false);
    else {
      const currentHostel = localOccupancy.find(h => h.id === roomHostelId);
      if (currentHostel && parseInt(roomFloor) < currentHostel.floors) {
        setRoomFloor((parseInt(roomFloor) + 1).toString());
      } else setShowAddRoom(false);
    }
  };

  // --- UI COMPONENTS ---

  const HeaderSection = () => (
    <div className="relative overflow-hidden p-8 md:p-10 rounded-[32px] border-none shadow-none mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mx-4 lg:mx-6 mt-4 transition-all duration-500 min-h-[220px] lg:min-h-[240px] bg-[#EBBDC2]">
      {/* Content wrapper */}
      <div className="relative z-10 max-w-xl flex flex-col justify-center h-full">
        <h1 className="text-4xl font-black text-[#3A2C2B] tracking-tight">Hostel Management</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-white/40 border-white/20 text-[#3A2C2B] font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
            Academic Session 2026-27
          </Badge>
          <span className="text-[10px] font-bold text-[#3A2C2B]/60 uppercase tracking-widest italic hidden md:inline-block">Warden Command Center • Admin Mode</span>
        </div>
        <p className="text-xs font-bold text-[#3A2C2B]/70 mt-3 max-w-md hidden md:block">
          Manage student residency status, track block occupancies, allocate beds, and monitor welfare operations.
        </p>

        {(isAdmin || isWarden) && (
          <div className="grid grid-cols-2 lg:flex lg:flex-row lg:items-center gap-2 sm:gap-3 mt-6">
            <Button variant="outline" className="lg:w-auto rounded-xl bg-white border-border/50 text-[10px] font-black uppercase tracking-widest h-10 shadow-sm hover-lift tap-scale hover:bg-primary/5 hover:text-primary transition-all-custom" onClick={() => setShowAddHostel(true)}>
              <Building className="w-4 h-4 mr-1 sm:mr-2" /> Add Hostel
            </Button>
            <Button variant="outline" className="lg:w-auto rounded-xl bg-white border-border/50 text-[10px] font-black uppercase tracking-widest h-10 shadow-sm hover-lift tap-scale hover:bg-primary/5 hover:text-primary transition-all-custom" onClick={() => setShowAddRoom(true)}>
              <Home className="w-4 h-4 mr-1 sm:mr-2" /> Add Room
            </Button>
            <Button variant="outline" className="lg:w-auto rounded-xl bg-white border-border/50 text-[10px] font-black uppercase tracking-widest h-10 shadow-sm hover-lift tap-scale hover:bg-primary/5 hover:text-primary transition-all-custom" onClick={() => setShowAddBed(true)}>
              <Bed className="w-4 h-4 mr-1 sm:mr-2" /> Add Bed
            </Button>
            <Button variant="outline" className="lg:w-auto rounded-xl bg-white border-border/50 text-[10px] font-black uppercase tracking-widest h-10 shadow-sm hover-lift tap-scale hover:bg-primary/5 hover:text-primary transition-all-custom" onClick={() => setShowAllocateBed(true)}>
              <UserCheck className="w-4 h-4 mr-1 sm:mr-2" /> Allocate
            </Button>
          </div>
        )}
      </div>

      {/* Hostel.png illustration layout */}
      <div className="absolute right-2 bottom-2 lg:bottom-0 lg:top-0 lg:right-8 hidden lg:flex items-end lg:items-center justify-end w-1/2 lg:w-1/3 pointer-events-none select-none z-0">
        <img
          src="/hostel.png"
          alt="Hostel Illustration"
          className="object-contain h-[130%] lg:translate-y-12 lg:translate-x-4 max-h-[140px] lg:max-h-[220px]"
        />
      </div>
    </div>
  );

  const KPISection = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-10">
      {HOSTEL_KPIS.map((kpi, i) => (
        <StatsCard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} sub={kpi.trend} color={kpi.color} />
      ))}
    </div>
  );

  const OccupancyOverview = () => (
    <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden h-full flex flex-col">
      <CardHeader className="p-4 sm:p-8 border-b border-border/30 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-black text-[#3A2C2B]">Hostel Occupancy Overview</CardTitle>
          <CardDescription className="text-xs font-medium">Floor-wise capacity and availability alerts</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-xs font-black text-primary uppercase">View All</Button>
      </CardHeader>
      <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto max-h-[300px] sm:max-h-[500px] scrollbar-hide">
        {localOccupancy.map((hostel, i) => {
          const percent = Math.round((hostel.occupied / hostel.total) * 100);
          return (
            <div key={i} className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-white",
                    hostel.gender === 'Male' ? "bg-primary" : hostel.gender === 'Female' ? "bg-brand-orange" : "bg-muted-foreground"
                  )}>
                    {hostel.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#3A2C2B]">{hostel.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{hostel.gender} • {hostel.total} Beds</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#3A2C2B]">{hostel.occupied}/{hostel.total}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{percent}% Full</p>
                </div>
              </div>
              <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    percent > 90 ? "bg-destructive" : percent > 70 ? "bg-brand-orange" : "bg-brand-green"
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  const ActivityFeed = () => (
    <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden h-full flex flex-col">
      <CardHeader className="p-4 sm:p-8 border-b border-border/30">
        <CardTitle className="text-xl font-black text-[#3A2C2B]">Today's Hostel Activity</CardTitle>
        <CardDescription className="text-xs font-medium">Real-time residency and allocation updates</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Activity</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-3 sm:p-4 rounded-[24px] bg-soft-parchment/50 border border-border/30 relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary font-black flex-shrink-0">
                {i === 0 ? <UserCheck className="w-5 h-5" /> : i === 1 ? <Bed className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-black text-[#3A2C2B] truncate">{i === 0 ? 'Alice Johnson' : i === 1 ? 'New Allocation' : 'Discipline Alert'}</h5>
                  <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap uppercase">{i === 0 ? '12m ago' : i === 1 ? '45m ago' : '2h ago'}</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                  {i === 0 ? 'Assigned to Girls Block A, Room 204' : i === 1 ? 'New room request submitted for Boys Block B' : 'Warden reported a noise complaint in Block A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const RoomAllocationTable = () => {
    // Helper to parse bed counts from type string
    const getBedCounts = (type: string) => {
      if (type === 'Single') return { s: 1, d: 0 };
      if (type === 'Double') return { s: 0, d: 1 };

      const sMatch = type.match(/(\d+)S/);
      const dMatch = type.match(/(\d+)D/);
      return {
        s: sMatch ? parseInt(sMatch[1]) : 0,
        d: dMatch ? parseInt(dMatch[1]) : 0
      };
    };

    const ROOMS_DATA = getRoomsData();

    const filteredRooms = ROOMS_DATA.filter(room => {
      const hostelMatch = allocHostelFilter === 'All' || room.block === allocHostelFilter;
      const floorMatch = allocFloorFilter === 'All' || room.id.includes(`-f${allocFloorFilter}-`);
      return hostelMatch && floorMatch;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-[#3A2C2B]">Room & Bed Allocation</h3>
            <p className="text-xs font-medium text-muted-foreground">Monitor room capacity and bed inventory</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl">
              <button
                onClick={() => setAllocView('card')}
                className={cn("p-2 rounded-lg transition-all", allocView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAllocView('table')}
                className={cn("p-2 rounded-lg transition-all", allocView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="w-40">
              <Select
                placeholder="Hostel"
                value={allocHostelFilter}
                onChange={setAllocHostelFilter}
                options={[
                  { label: 'All Hostels', value: 'All' },
                  { label: 'Boys Block A', value: 'Boys Block A' },
                  { label: 'Boys Block B', value: 'Boys Block B' },
                  { label: 'Girls Block A', value: 'Girls Block A' },
                  { label: 'Girls Block B', value: 'Girls Block B' },
                ]}
                className="h-10 bg-white border border-border/40 text-[10px] font-black rounded-xl shadow-sm"
              />
            </div>
            <div className="w-32">
              <Select
                placeholder="Floor"
                value={allocFloorFilter}
                onChange={setAllocFloorFilter}
                options={[
                  { label: 'All Floors', value: 'All' },
                  { label: 'Floor 1', value: '1' },
                  { label: 'Floor 2', value: '2' },
                  { label: 'Floor 3', value: '3' },
                ]}
                className="h-10 bg-white border border-border/40 text-[10px] font-black rounded-xl shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search room..." className="w-32 h-10 rounded-xl border-border bg-white shadow-sm text-[10px] font-black" />
              <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-white border border-border/50 shadow-sm"><Filter className="w-4 h-4 text-primary" /></Button>
            </div>
          </div>
        </div>

        {allocView === 'table' ? (
          <div className="rounded-[32px] border border-[#3A2C2B]/10 bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[900px] flex flex-col">
                {/* Fixed Header */}
                <div className="bg-[#3A2C2B] shrink-0">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="text-white/70">
                        <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Room Info</th>
                        <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Beds (Single / Double)</th>
                        <th className="w-[55%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Occupancy (Allocated / Available)</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body */}
                <div className="max-h-[350px] sm:max-h-[450px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left table-fixed">
                    <tbody className="divide-y divide-[#3A2C2B]/5">
                      {filteredRooms.map((room, i) => {
                        const beds = getBedCounts(room.type);
                        return (
                          <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                            <td className="w-[20%] px-8 py-6">
                              <p className="text-sm font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{room.id}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">{room.block}</p>
                            </td>
                            <td className="w-[25%] px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-[#3A2C2B] uppercase">Single</span>
                                  <span className={cn("text-lg font-black", beds.s > 0 ? "text-primary" : "text-muted-foreground/30")}>{beds.s}</span>
                                </div>
                                <div className="w-px h-8 bg-border/20" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-[#3A2C2B] uppercase">Double</span>
                                  <span className={cn("text-lg font-black", beds.d > 0 ? "text-brand-orange" : "text-muted-foreground/30")}>{beds.d}</span>
                                </div>
                              </div>
                            </td>
                            <td className="w-[55%] px-8 py-6">
                              <div className="flex items-center justify-between gap-8">
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Inventory Status</span>
                                    <span className="text-sm font-black text-[#3A2C2B] tabular-nums">
                                      {room.occupied} Allocated / {room.capacity - room.occupied} Available
                                    </span>
                                  </div>
                                </div>

                                <div className="flex-1 max-w-[120px]">
                                  <div className="h-1.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        (room.occupied / room.capacity) > 0.9 ? "bg-red-500" : (room.occupied / room.capacity) > 0.5 ? "bg-brand-orange" : "bg-brand-green"
                                      )}
                                      style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                                    />
                                  </div>
                                </div>
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
                Showing <span className="text-[#3A2C2B]">{filteredRooms.length}</span> of {getRoomsData().length} rooms
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 text-[10px] font-black border border-border/10 bg-white hover:bg-primary/5">1</Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 text-[10px] font-black border border-border/10 bg-white hover:bg-primary/5">2</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
            {filteredRooms.map((room, i) => {
              const beds = getBedCounts(room.type);
              const percent = (room.occupied / room.capacity) * 100;
              return (
                <div key={i} className="flex-none w-[320px] rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl flex flex-col relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-black text-white">{room.id}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{room.block}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary border border-white/5">
                      <Bed className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-8 border-y border-white/10 py-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Single</span>
                      <span className={cn("text-lg font-black", beds.s > 0 ? "text-primary" : "text-white/20")}>{beds.s}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Double</span>
                      <span className={cn("text-lg font-black", beds.d > 0 ? "text-brand-orange" : "text-white/20")}>{beds.d}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Inventory</span>
                      <span className="text-xs font-black text-white/90">{room.occupied} Alloc / {room.capacity - room.occupied} Avail</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          percent > 90 ? "bg-red-500" : percent > 50 ? "bg-brand-orange" : "bg-brand-green"
                        )}
                        style={{ width: `${percent}%` }}
                      />
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



  const RequestDetailsModal = () => {
    if (!selectedRequestDetails) return null;
    const req = selectedRequestDetails;
    const isLeave = req.type === 'Leave Request';

    return (
      <Modal
        isOpen={showRequestDetailsModal}
        onClose={() => setShowRequestDetailsModal(false)}
        title={`${req.type} Application Details`}
      >
        <div className="p-2 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Student Identity Header */}
          <div className="flex items-center gap-5 p-6 rounded-[32px] bg-[#3A2C2B]/5 border border-[#3A2C2B]/10 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-xl font-black text-primary shadow-sm border border-border/10">
              {req.studentName[0]}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-[#3A2C2B]">{req.studentName}</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{req.hostel} • Floor {req.floor} • Room {req.room}</p>
            </div>
            <div>
              <Badge variant={req.status === 'Pending' ? 'brand-orange' : 'brand-green'} className="font-black text-[9px] uppercase px-3 py-1 shadow-sm">{req.status}</Badge>
            </div>
          </div>

          {/* Subject & Request Type */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Application Subject</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">ID: #REQ-{req.id}</p>
            </div>
            <h2 className="text-2xl font-black text-[#3A2C2B] tracking-tight leading-tight px-1">{req.subject}</h2>
          </div>

          {/* Type Specific Metadata */}
          {isLeave ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="p-6 rounded-[32px] bg-white border border-border/10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
                <Calendar className="absolute -right-2 -bottom-2 w-12 h-12 text-primary opacity-5 group-hover:opacity-10 transition-all" />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Departure</p>
                <p className="text-xl font-black text-[#3A2C2B]">{req.startDate || 'N/A'}</p>
              </div>
              <div className="p-6 rounded-[32px] bg-white border border-border/10 shadow-sm relative overflow-hidden group hover:border-brand-orange/30 transition-all">
                <ArrowLeftRight className="absolute -right-2 -bottom-2 w-12 h-12 text-brand-orange opacity-5 group-hover:opacity-10 transition-all" />
                <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">Return</p>
                <p className="text-xl font-black text-[#3A2C2B]">{req.returnDate || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Residency Context</p>
              <div className="p-6 rounded-[32px] bg-[#3A2C2B] text-white shadow-xl flex items-center justify-around text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                <div className="relative">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80 mb-1">Room</p>
                  <p className="text-2xl font-black tracking-tight">{req.currentRoom}</p>
                </div>
                <div className="w-px h-10 bg-white/10 relative" />
                <div className="relative">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80 mb-1">Bed Slot</p>
                  <p className="text-2xl font-black tracking-tight">#{req.currentBed}</p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Reason */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Explanation</p>
            <div className="p-6 rounded-[32px] bg-[#F8F5F2] border border-border/20 italic text-sm font-medium text-[#3A2C2B]/70 leading-relaxed shadow-inner">
              "{req.reason}"
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 grid grid-cols-2 gap-4">
            <Button
              className="h-16 rounded-[24px] bg-brand-green text-white font-black uppercase text-xs shadow-lg shadow-brand-green/20 hover:scale-[1.02] transition-all"
              onClick={() => {
                alert("Request Approved Successfully");
                setShowRequestDetailsModal(false);
              }}
            >
              Approve Request
            </Button>
            <Button
              variant="outline"
              className="h-16 rounded-[24px] border-red-200 text-red-500 font-black uppercase text-xs hover:bg-red-50 hover:border-red-300 transition-all"
              onClick={() => {
                alert("Request Rejected");
                setShowRequestDetailsModal(false);
              }}
            >
              Reject Request
            </Button>
          </div>
        </div>
      </Modal>
    );
  };



  const FeeOverviewCard = () => (
    <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden h-full flex flex-col">
      <CardHeader className="p-8 border-b border-border/30">
        <CardTitle className="text-xl font-black text-[#3A2C2B]">Hostel Fee Overview</CardTitle>
        <CardDescription className="text-xs font-medium">Revenue collection and outstanding dues</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Collections</p>
              <h3 className="text-3xl font-black text-[#3A2C2B] tracking-tight">$42,850</h3>
            </div>
            <Badge variant="brand-green" className="mb-1">+12% vs last month</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[24px] bg-secondary/5 border border-border/10">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Pending Dues</p>
              <p className="text-xl font-black text-brand-orange">$8,420</p>
            </div>
            <div className="p-4 rounded-[24px] bg-secondary/5 border border-border/10">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Scholarships</p>
              <p className="text-xl font-black text-primary">$12,000</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-[24px] bg-soft-sage/20 border border-brand-green/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-green">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-green uppercase">Total Collected</p>
                <h4 className="text-xl font-black text-[#3A2C2B]">$124,500</h4>
              </div>
            </div>
            <Badge variant="brand-green" className="h-6">+12%</Badge>
          </div>
          <div className="flex items-center justify-between p-5 rounded-[24px] bg-brand-orange/5 border border-brand-orange/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-orange">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-orange uppercase">Outstanding Dues</p>
                <h4 className="text-xl font-black text-[#3A2C2B]">$18,240</h4>
              </div>
            </div>
            <Badge variant="brand-orange" className="h-6">24 Stds</Badge>
          </div>
        </div>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { name: 'Jan', value: 400 },
              { name: 'Feb', value: 600 },
              { name: 'Mar', value: 800 },
              { name: 'Apr', value: 500 },
              { name: 'May', value: 900 }
            ]}>
              <Line type="monotone" dataKey="value" stroke="#3A2C2B" strokeWidth={4} dot={false} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================
  // BLOCK DETAILS PAGE - Premium booking-style deep-dive view
  // ============================================================
  const BlockDetailsPage = ({ hostelId }: { hostelId: string }) => {
    const block = localOccupancy.find(h => h.id === hostelId) || localOccupancy[0];
    const available = block.total - block.occupied;
    const percent = Math.round((block.occupied / block.total) * 100);
    const blockCode = block.name.split(' ').slice(-1)[0];
    const roomsOnFloor = block.roomsPerFloor[detailsFloor - 1] || 0;

    // Rooms on this floor. Each room has beds: single bed (cap=1) or double bed (cap=2).
    // isDouble means the bed inside is a double bed - NOT the room type.
    const rooms = Array.from({ length: Math.min(roomsOnFloor, 16) }, (_, i) => {
      const roomNum = (i + 1).toString().padStart(2, '0');
      const id = `${blockCode}-F${detailsFloor}-${roomNum}`;

      const beds = [];
      let bedCounter = 1;

      // Demonstrating cumulative flow: Room 1 has Single, Double, Single
      if (i % 4 === 0) {
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Single' as const, isTaken: false });
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Double' as const, isTaken: true }); // Slot 1 of Dbl
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Double' as const, isTaken: false }); // Slot 2 of Dbl
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Single' as const, isTaken: false });
      }
      // Room 2 has 2 Doubles
      else if (i % 4 === 1) {
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Double' as const, isTaken: false });
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Double' as const, isTaken: false });
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Double' as const, isTaken: true });
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Double' as const, isTaken: true });
      }
      // Others have 2 Singles
      else {
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Single' as const, isTaken: i % 5 === 0 });
        beds.push({ bedNum: (bedCounter++).toString(), bedType: 'Single' as const, isTaken: i % 4 === 1 });
      }

      const freeBeds = beds.filter(b => !b.isTaken).length;
      return { id, roomNum, beds, freeBeds, isFull: freeBeds === 0 };
    });
    const floorFree = rooms.reduce((s, r) => s + r.freeBeds, 0);
    const floorOpen = rooms.filter(r => !r.isFull).length;
    const [openRoomId, setOpenRoomId] = useState<string | null>(null);
    const isSelected = (roomId: string, bedNum: string) =>
      selectedBedForApply?.roomId === roomId && selectedBedForApply?.bedNum === bedNum && selectedBedForApply?.hostelId === hostelId;

    return (
      <div className="min-h-screen bg-[#FCF9F6] pb-20">

        {/* ── Top Breadcrumb ── */}
        <div className="sticky top-0 z-20 bg-[#FCF9F6] px-3 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => { setSelectedBlockForDetails(null); setDetailsFloor(1); }}
              className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> All Blocks
            </button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">{block.name}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">

          {/* ══ LEFT / MAIN CONTENT AREA ══ */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Hero Card ── */}
            <div className="mx-3 overflow-hidden rounded-[32px] shadow-xl sm:mx-4 sm:rounded-[48px]">
              <div className="relative bg-gradient-to-br from-[#3A2C2B] via-[#4A3534] to-[#5C4440] overflow-hidden">
                {/* decorative pattern */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)'
                }} />
                <div className="relative px-5 py-8 sm:px-8 sm:py-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    {/* Left: block info */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={cn(
                          'px-3 py-1 rounded-full border-none text-[9px] font-black uppercase text-white',
                          block.gender === 'Male' ? 'bg-primary' : block.gender === 'Female' ? 'bg-brand-orange' : 'bg-white/20'
                        )}>{block.gender} Only</Badge>
                        <Badge className="px-3 py-1 rounded-full bg-white/10 border-none text-[9px] font-black uppercase text-white">{block.floors} Floors</Badge>
                        <Badge className={cn(
                          'px-3 py-1 rounded-full border-none text-[9px] font-black uppercase',
                          available > 0 ? 'bg-brand-green text-white' : 'bg-red-500 text-white'
                        )}>{available > 0 ? `${available} Beds Available` : 'Fully Occupied'}</Badge>
                      </div>
                      <h1 className="text-3xl font-black leading-none tracking-tight text-white sm:text-4xl lg:text-5xl">{block.name}</h1>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/60 sm:gap-6">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Campus North Wing</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {block.occupied}/{block.total} Residents</span>
                        <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> 4.8 / 5 Rating</span>
                      </div>
                    </div>
                    {/* Right: big numbers */}
                    <div className="grid w-full grid-cols-3 gap-3 lg:w-auto lg:flex lg:items-stretch lg:gap-6">
                      <div className="rounded-2xl bg-white/10 px-3 py-4 text-center backdrop-blur-sm sm:px-6">
                        <p className="text-2xl font-black text-white sm:text-4xl">{block.total}</p>
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1">Total Beds</p>
                      </div>
                      <div className="rounded-2xl border border-brand-green/30 bg-brand-green/20 px-3 py-4 text-center sm:px-6">
                        <p className="text-2xl font-black text-brand-green sm:text-4xl">{available}</p>
                        <p className="text-[9px] font-black text-brand-green/70 uppercase tracking-widest mt-1">Available</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-3 py-4 text-center backdrop-blur-sm sm:px-6">
                        <p className="text-2xl font-black text-white sm:text-4xl">{percent}%</p>
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1">Occupied</p>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                      <span>Overall Occupancy</span><span>{percent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-1000', percent > 90 ? 'bg-red-400' : percent > 70 ? 'bg-brand-orange' : 'bg-brand-green')}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* ── Room Selection Card ── */}
            <div className="mx-3 mb-4 mt-4 flex flex-col gap-3 sm:gap-4 lg:mx-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 overflow-hidden rounded-[32px] border border-border/20 bg-white shadow-sm sm:rounded-[48px]">
                {/* Floor Selector Tabs */}
                <div className="border-b border-border/20 px-4 sm:px-6">
                  <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
                    {block.roomsPerFloor.map((count: number, i: number) => {
                      const f = i + 1;
                      const isActive = detailsFloor === f;
                      return (
                        <button
                          key={f}
                          onClick={() => setDetailsFloor(f)}
                          className={cn(
                            'flex-shrink-0 flex flex-col items-center px-5 py-2.5 rounded-xl transition-all duration-200 min-w-[80px]',
                            isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                          )}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">Floor {f}</span>
                          <span className={cn('text-[9px] font-bold mt-0.5', isActive ? 'text-white/60' : 'text-muted-foreground/50')}>{count} rooms</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Floor Summary Strip */}
                <div className="flex flex-wrap gap-4 border-b border-border/10 bg-soft-parchment/60 px-4 py-3 sm:gap-6 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[11px] font-black text-[#3A2C2B]">Floor {detailsFloor} — {roomsOnFloor} Rooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                    <span className="text-[11px] font-bold text-muted-foreground">{floorFree} Available Beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-orange" />
                    <span className="text-[11px] font-bold text-muted-foreground">{floorOpen} Rooms Open</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-[11px] font-bold text-muted-foreground">{roomsOnFloor - floorOpen} Rooms Full</span>
                  </div>
                </div>

                {/* Room + Bed Grid */}
                <div className="px-4 pt-5 pb-2 sm:px-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Room Layout — Floor {detailsFloor}</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-brand-green/15 border border-brand-green/40" /><span className="text-[9px] font-bold text-muted-foreground">Available</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-secondary/30 border border-border/20" /><span className="text-[9px] font-bold text-muted-foreground">Taken</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary border border-primary" /><span className="text-[9px] font-bold text-muted-foreground">Selected</span></div>
                    </div>
                  </div>
                  <div className="pb-6 sm:px-6">
                    <div className="grid grid-cols-1 gap-4 transition-all duration-500 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {rooms.map((room) => {
                        const isOpen = openRoomId === room.id;
                        return (
                          <div
                            key={room.id}
                            onClick={() => !isOpen && setOpenRoomId(room.id)}
                            className={cn(
                              'rounded-[48px] border transition-all duration-500 relative group overflow-hidden flex flex-col',
                              room.isFull ? 'bg-secondary/5 border-border/10 opacity-60' : 'bg-white border-border/20 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5',
                              isOpen ? 'col-span-1 rounded-[32px] bg-primary/[0.01] p-4 ring-2 ring-primary sm:rounded-[48px] sm:p-6 md:col-span-2 xl:col-span-3' : 'h-[180px] cursor-pointer p-5 hover:-translate-y-1'
                            )}
                          >
                            {/* Room Header - Master View */}
                            <div className="flex items-start justify-between">
                              <div className="space-y-1.5">
                                <h4 className="text-xl font-black text-[#3A2C2B] tracking-tight">{room.id}</h4>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-2 h-2 rounded-full", room.isFull ? "bg-red-500" : "bg-brand-green")} />
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    {room.freeBeds} {room.freeBeds === 1 ? 'Space' : 'Spaces'} Remaining
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isOpen && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setOpenRoomId(null); }}
                                    className="w-10 h-10 rounded-full bg-white border border-border/20 flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                  >
                                    <Plus className="w-5 h-5 rotate-45" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Conditional Content - Detailed View */}
                            {isOpen ? (
                              <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="rounded-[24px] border border-border/10 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
                                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select an available bed from the room configuration</p>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-green/40" /><span className="text-[9px] font-bold text-muted-foreground">Free</span></div>
                                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-secondary/40" /><span className="text-[9px] font-bold text-muted-foreground">Taken</span></div>
                                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-[9px] font-bold text-muted-foreground">Selected</span></div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
                                    {(() => {
                                      const roomBeds = room.beds;
                                      const processedBeds = [];
                                      for (let bIdx = 0; bIdx < roomBeds.length; bIdx++) {
                                        const currentBed = roomBeds[bIdx];
                                        if (currentBed.bedType === 'Double' && bIdx + 1 < roomBeds.length && roomBeds[bIdx + 1].bedType === 'Double') {
                                          processedBeds.push({ type: 'Double', slots: [currentBed, roomBeds[bIdx + 1]] });
                                          bIdx++;
                                        } else {
                                          processedBeds.push({ type: 'Single', slots: [currentBed] });
                                        }
                                      }

                                      return processedBeds.map((group, gIdx) => {
                                        const isDouble = group.type === 'Double';
                                        const bedNumbers = group.slots.map(s => s.bedNum).join(', ');
                                        const isAllTaken = group.slots.every(s => s.isTaken);
                                        const isAnyTaken = group.slots.some(s => s.isTaken);
                                        const sel = group.slots.some(s => isSelected(room.id, s.bedNum));

                                        return (
                                          <div
                                            key={gIdx}
                                            className={cn(
                                              'mx-auto flex w-full max-w-none shrink-0 flex-col items-center overflow-hidden rounded-[28px] border-2 border-border/20 bg-[#FCF9F6] p-2.5 transition-all sm:max-w-[120px] sm:rounded-[32px]',
                                              sel ? 'border-primary/40 bg-primary/[0.02]' : ''
                                            )}
                                          >
                                            <div className="relative flex items-center justify-center h-20 w-full">
                                              {isDouble ? (
                                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                                  <img src="/doublebed.png" alt="Double Bed" className={cn('w-14 h-14 object-contain transition-all', isAllTaken ? 'grayscale opacity-30' : '')} />
                                                  {/* Overlay Slots */}
                                                  <div className="absolute inset-0 flex flex-col justify-around items-center py-2">
                                                    {group.slots.map((s) => {
                                                      const isSlotSelected = isSelected(room.id, s.bedNum);
                                                      return (
                                                        <button
                                                          key={s.bedNum}
                                                          disabled={s.isTaken}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedBedForApply({
                                                              hostelId: block.id,
                                                              hostelName: block.name,
                                                              roomId: room.id,
                                                              roomNum: room.roomNum,
                                                              bedNum: s.bedNum,
                                                              bedType: s.bedType,
                                                              floor: detailsFloor,
                                                            });
                                                            setDetailsBedPref(s.bedType);
                                                          }}
                                                          className={cn(
                                                            'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all shadow-md',
                                                            s.isTaken
                                                              ? 'bg-secondary/20 text-muted-foreground/40 cursor-not-allowed'
                                                              : isSlotSelected
                                                                ? 'bg-primary text-white scale-125 ring-2 ring-white z-10'
                                                                : 'bg-[#3A2C2B] text-white hover:bg-primary hover:scale-110'
                                                          )}
                                                        >
                                                          {s.bedNum}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              ) : (
                                                <button
                                                  disabled={isAllTaken}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const s = group.slots[0];
                                                    setSelectedBedForApply({
                                                      hostelId: block.id,
                                                      hostelName: block.name,
                                                      roomId: room.id,
                                                      roomNum: room.roomNum,
                                                      bedNum: s.bedNum,
                                                      bedType: s.bedType,
                                                      floor: detailsFloor,
                                                    });
                                                    setDetailsBedPref(s.bedType);
                                                  }}
                                                  className={cn(
                                                    'relative w-full h-full flex items-center justify-center group/single',
                                                    isAllTaken ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                                                  )}
                                                >
                                                  <div className="relative">
                                                    <img src="/single.png" alt="Single Bed" className={cn('w-12 h-12 object-contain transition-all', isAllTaken ? 'grayscale opacity-30' : '')} />
                                                    <div className={cn(
                                                      "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md transition-all",
                                                      isAllTaken
                                                        ? 'bg-secondary/20 text-muted-foreground/50'
                                                        : sel
                                                          ? 'bg-primary text-white scale-110 ring-2 ring-white z-10'
                                                          : 'bg-white text-[#3A2C2B] border border-border/20 group-hover/single:border-primary/40'
                                                    )}>
                                                      {bedNumbers}
                                                    </div>
                                                  </div>
                                                </button>
                                              )}
                                            </div>
                                            <div className="text-center leading-none px-2 mt-1 pb-1">
                                              <p className={cn('text-[9px] font-black uppercase tracking-tight truncate text-[#3A2C2B]')}>
                                                {isDouble ? `Bunk Bed` : `Single Bed`}
                                              </p>
                                              <p className={cn('text-[8px] font-bold uppercase mt-1.5', isAllTaken ? 'text-muted-foreground/30' : isAnyTaken ? 'text-brand-orange' : 'text-brand-green')}>
                                                {isAllTaken ? 'Taken' : isAnyTaken ? 'Partial' : 'Available'}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-auto flex items-end justify-between">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover:text-primary transition-colors">One tap to more</span>
                                  <div className="w-8 h-1 bg-primary/20 rounded-full group-hover:w-full transition-all duration-700" />
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-soft-parchment flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                  <ArrowRight className="w-5 h-5" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {roomsOnFloor > 16 && (
                      <p className="text-center text-xs text-muted-foreground font-bold mt-6 italic">Showing 16 of {roomsOnFloor} rooms on Floor {detailsFloor}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* ══ RIGHT SIDEBAR — Bed Selection Preview ══ */}
              <div className="order-first w-full lg:order-none lg:w-[320px] lg:flex-shrink-0">
                <div className="space-y-3 px-3 pb-1 sm:px-0 lg:sticky lg:top-[57px] lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto lg:p-4">

                  {/* ── Section Header Card ── */}
                  <div className="rounded-[32px] border border-border/20 bg-white px-5 py-5 shadow-sm sm:rounded-[48px] sm:px-8 sm:py-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Your Selection</p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      {selectedBedForApply && selectedBedForApply.hostelId === hostelId
                        ? 'Bed selected — review and apply below'
                        : 'Tap any green bed to select it'}
                    </p>
                  </div>

                  {selectedBedForApply && selectedBedForApply.hostelId === hostelId ? (
                    <>
                      {/* ── Selected Bed Detail Card ── */}
                      <div className="space-y-5 rounded-[32px] border border-border/20 bg-white p-5 shadow-sm sm:rounded-[48px] sm:p-8">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/10">
                          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                            <Bed className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#3A2C2B]">Bed {selectedBedForApply.bedNum} — {selectedBedForApply.roomId}</p>
                            <p className="text-[10px] font-bold text-primary">{selectedBedForApply.bedType} Bed · Floor {selectedBedForApply.floor}</p>
                          </div>
                        </div>
                        {[
                          { label: 'Hostel', value: selectedBedForApply.hostelName },
                          { label: 'Floor', value: `Floor ${selectedBedForApply.floor}` },
                          { label: 'Room', value: selectedBedForApply.roomId },
                          { label: 'Bed No.', value: `Bed ${selectedBedForApply.bedNum}` },
                          { label: 'Bed Type', value: selectedBedForApply.bedType },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-start justify-between gap-4">
                            <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
                            <span className="text-[11px] font-black text-[#3A2C2B]">{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* ── Available Banner ── */}
                      <div className="space-y-5 rounded-[32px] border border-border/20 bg-white p-5 shadow-sm sm:rounded-[48px] sm:p-8">
                        <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                        <p className="text-[10px] font-bold text-brand-green">Bed is available — ready to apply!</p>
                      </div>

                      {/* ── Bed Preference Card ── */}
                      <div className="space-y-5 rounded-[32px] border border-border/20 bg-white p-5 shadow-sm sm:rounded-[48px] sm:p-8">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Bed Preference</p>
                        <div className="grid grid-cols-2 gap-2">
                          {(['Single', 'Double'] as const).map(type => (
                            <div key={type} className={cn(
                              'py-3 rounded-xl border text-[10px] font-black uppercase flex flex-col items-center gap-1',
                              detailsBedPref === type
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-[#F8F5F2] text-muted-foreground/40 border-border/30'
                            )}>
                              <Bed className="w-4 h-4" />{type}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── Apply Card ── */}
                      <div className="space-y-5 rounded-[32px] border border-border/20 bg-white p-5 shadow-sm sm:rounded-[48px] sm:p-8">
                        <Button
                          className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all"
                          onClick={() => {
                            const req = {
                              id: `SR${Date.now()}`,
                              name: 'Current Student',
                              hostelId: selectedBedForApply.hostelId,
                              gender: block.gender === 'Female' ? 'Female' : 'Male',
                              status: 'Pending',
                              floor: selectedBedForApply.floor.toString(),
                              roomId: selectedBedForApply.roomId,
                              roomNum: selectedBedForApply.roomNum,
                              bedNum: selectedBedForApply.bedNum,
                              bedType: selectedBedForApply.bedType,
                            };
                            setStudentRequests(prev => [...prev, req]);
                            setSelectedBedForApply(null);
                            setSelectedBlockForDetails(null);
                            setDetailsFloor(1);
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" /> Apply for This Bed
                        </Button>
                        <button onClick={() => setSelectedBedForApply(null)}
                          className="w-full text-center text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">
                          Clear selection
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* ── Empty State Card ── */}
                      <div className="flex flex-col items-center justify-center space-y-6 rounded-[32px] border border-border/20 bg-white px-4 py-10 text-center shadow-sm sm:rounded-[48px] sm:py-16">
                        <div className="w-16 h-16 rounded-2xl bg-soft-parchment/60 flex items-center justify-center">
                          <Bed className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#3A2C2B]">No bed selected</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">Tap any available (green)<br />bed to preview it here</p>
                        </div>
                      </div>

                      {/* ── Block Summary Card ── */}
                      <div className="space-y-5 rounded-[32px] border border-border/20 bg-white p-5 shadow-sm sm:rounded-[48px] sm:p-8">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Block Summary</p>
                        {[
                          { label: 'Block', value: block.name },
                          { label: 'Gender', value: block.gender },
                          { label: 'Total Beds', value: block.total.toString() },
                          { label: 'Available', value: `${available} beds` },
                          { label: 'This Floor', value: `${floorFree} free` },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-start justify-between gap-4">
                            <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
                            <span className="text-[11px] font-black text-[#3A2C2B]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Apply Modal (reused from StudentHostelView) */}
        <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Hostel Accommodation">
          <div className="p-2 space-y-6">
            <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Selected Block</p>
              <h3 className="text-xl font-black text-[#3A2C2B] tracking-tight">
                {localOccupancy.find(h => h.id === studentApplyHostel)?.name || 'Not Selected'}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground">
                {localOccupancy.find(h => h.id === studentApplyHostel)?.gender} • {(localOccupancy.find(h => h.id === studentApplyHostel)?.total || 0) - (localOccupancy.find(h => h.id === studentApplyHostel)?.occupied || 0)} beds available
              </p>
            </div>
            <Select label="Preferred Block" value={studentApplyHostel} onChange={setStudentApplyHostel} options={localOccupancy.map(h => ({ label: h.name, value: h.id }))} />
            <Select label="Bed Type" value={detailsBedPref === 'Double' ? '2' : '1'} onChange={() => { }} options={[{ label: 'Single Bed', value: '1' }, { label: 'Double Bed (Shared)', value: '2' }]} />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notes (Optional)</label>
              <Input placeholder="Any special requirements..." className="h-12 rounded-xl" />
            </div>
            <Button
              className="w-full bg-primary text-white font-black uppercase text-xs h-14 rounded-xl shadow-lg shadow-primary/20"
              onClick={() => {
                const newRequest = {
                  id: `SR${Date.now()}`,
                  name: 'Current Student',
                  hostelId: studentApplyHostel,
                  gender: localOccupancy.find(h => h.id === studentApplyHostel)?.gender === 'Female' ? 'Female' : 'Male',
                  status: 'Pending',
                  floor: '1',
                  roomId: '',
                  bedNum: '',
                  bedType: 'Single'
                };
                setStudentRequests(prev => [...prev, newRequest]);
                setShowApplyModal(false);
              }}
            >
              <Send className="w-4 h-4 mr-2" /> Submit Application
            </Button>
          </div>
        </Modal>
      </div>
    );
  };


  // ============================================================
  const StudentHostelView = () => {
    if (selectedBlockForDetails) {
      return <BlockDetailsPage hostelId={selectedBlockForDetails} />;
    }
    return (
      <div className="min-h-screen bg-[#FCF9F6] px-3 py-6 pb-20 space-y-8 animate-in fade-in duration-700 sm:px-4 sm:py-8 sm:space-y-10 lg:px-6 lg:py-12 lg:space-y-12">
        {/* Student Header */}
        <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] border-none bg-[#EBBDC2] p-6 shadow-none transition-all duration-500 sm:rounded-[32px] sm:p-8 md:p-10 lg:min-h-[240px] lg:flex-row lg:items-center">
          {/* Content wrapper */}
          <div className="relative z-10 max-w-xl flex flex-col justify-center h-full">
            <h1 className="text-3xl font-black tracking-tight text-[#3A2C2B] sm:text-4xl">Explore Accommodations</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="bg-white/40 border-white/20 text-[#3A2C2B] font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
                Academic Session 2026-27
              </Badge>
              <span className="text-[10px] font-bold text-[#3A2C2B]/60 uppercase tracking-widest italic">Student Hostel Portal • Applicant Mode</span>
            </div>
            <p className="text-xs font-bold text-[#3A2C2B]/70 mt-3 max-w-md">
              Browse available hostel blocks, review room configurations, and submit your accommodation application.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Button
                onClick={() => setIsResident(true)}
                className="h-10 w-full justify-center rounded-xl bg-[#3A2C2B] px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-none transition-all hover:scale-105 hover:bg-[#3a2c2b]/95 sm:w-auto sm:px-6"
              >
                <UserCheck className="w-4 h-4 mr-2" /> View as Resident Student
              </Button>
            </div>
          </div>

          {/* Hostel.png illustration layout */}
          <div className="absolute right-8 bottom-0 top-0 hidden lg:flex items-center justify-end w-1/3 pointer-events-none select-none">
            <img
              src="/hostel.png"
              alt="Hostel Illustration"
              className="object-contain h-[130%] translate-y-12 translate-x-4 max-h-[220px]"
            />
          </div>
        </div>

        {/* Quick Stats for Student */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <div className="rounded-[24px] border-none bg-white p-4 shadow-xl sm:rounded-[32px] sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Blocks</p>
                <p className="text-xl sm:text-2xl font-black text-[#3A2C2B]">{localOccupancy.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border-none bg-white p-4 shadow-xl sm:rounded-[32px] sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center shrink-0">
                <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Beds</p>
                <p className="text-xl sm:text-2xl font-black text-brand-green">{localOccupancy.reduce((sum, h) => sum + (h.total - h.occupied), 0)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border-none bg-white p-4 shadow-xl sm:rounded-[32px] sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Residents</p>
                <p className="text-xl sm:text-2xl font-black text-brand-orange">{localOccupancy.reduce((sum, h) => sum + h.occupied, 0)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border-none bg-white p-4 shadow-xl sm:rounded-[32px] sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Floors</p>
                <p className="text-xl sm:text-2xl font-black text-[#3A2C2B]">{localOccupancy.reduce((sum, h) => sum + h.floors, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hostel Blocks Grid */}
        <div>
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#3A2C2B] sm:text-2xl">Available Hostel Blocks</h2>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Select a block to apply for accommodation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
            {localOccupancy.map((hostel, i) => {
              const available = hostel.total - hostel.occupied;
              const percent = Math.round((hostel.occupied / hostel.total) * 100);
              const isFull = available <= 0;

              const themeColor = hostel.gender === 'Male' ? 'bg-[#3A2C2B]' : hostel.gender === 'Female' ? 'bg-[#C37A67]' : 'bg-muted-foreground';
              const borderThemeColor = hostel.gender === 'Male' ? 'border-[#3A2C2B]/10' : hostel.gender === 'Female' ? 'border-[#C37A67]/10' : 'border-border/10';

              return (
                <div key={i} className="relative pt-16 group hover:-translate-y-3 transition-transform duration-700 flex flex-col h-full">

                  {/* === Hogwarts Tower Spire — multi-layered === */}
                  <div className="absolute top-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none">
                    {/* Flag pennant */}
                    <div className="relative mb-[-2px]">
                      <div className="w-[2px] h-5 bg-[#8B7D6B] mx-auto" />
                      <div className="absolute top-0 left-[2px] w-4 h-3 bg-amber-400/90 shadow-sm" style={{
                        clipPath: 'polygon(0 0, 100% 25%, 0 50%)',
                      }} />
                    </div>
                    {/* Pointed spire tip */}
                    <div className={cn("w-[30%] h-8", themeColor)} style={{
                      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                    }} />
                    {/* Mid turret band */}
                    <div className={cn("w-[50%] h-3 mt-[-1px] shadow-md relative", themeColor)}>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                    </div>
                    {/* Wider conical slope leading to header */}
                    <div className={cn("w-full h-5 mt-[-1px]", themeColor)} style={{
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                    }} />
                  </div>

                  {/* === Tower Header (hostel info) === */}
                  <div className={cn("relative z-20 w-full px-6 pt-5 pb-5 text-center text-white flex flex-col items-center justify-center shadow-lg", themeColor)}>
                    {/* Subtle stone texture */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 6px)`,
                    }} />
                    <h3 className="text-2xl font-black tracking-tight relative z-10">{hostel.name}</h3>
                    <p className="mt-1 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-80 relative z-10">
                      <MapPin className="w-3 h-3" /> {hostel.floors} Floors • {hostel.total} Capacity
                    </p>
                    {/* Stone cornice ledge */}
                    <div className="absolute -bottom-[5px] left-[-1%] right-[-1%] h-[5px] bg-[#8B7D6B] rounded-[2px] shadow-[0_3px_6px_rgba(0,0,0,0.25)] z-30" />
                  </div>

                  {/* === Castle Stone Wall Body === */}
                  <Card className={cn("relative flex-1 overflow-hidden rounded-b-[12px] rounded-t-none border-x-[3px] border-b-[3px] border-t-0", borderThemeColor, "bg-[#F5F0E8] shadow-xl group-hover:shadow-2xl transition-all duration-700 mt-[-2px] pt-[8px]")}>

                    {/* Stone brick wall pattern */}
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent 0px, transparent 29px, #6B5B4A 29px, #6B5B4A 30px),
                        repeating-linear-gradient(90deg, transparent 0px, transparent 59px, #6B5B4A 59px, #6B5B4A 60px)
                      `,
                      backgroundSize: '60px 30px',
                      backgroundPosition: '0 0, 30px 15px'
                    }} />
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={{
                      backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 59px, #6B5B4A 59px, #6B5B4A 60px)`,
                      backgroundSize: '60px 30px',
                      backgroundPosition: '30px 0'
                    }} />

                    <CardContent className="p-6 sm:p-8 flex flex-col items-center relative z-20 h-full">

                      {/* === Gothic Windows — data shown directly on glass === */}
                      <div className="grid grid-cols-2 gap-4 w-full max-w-[260px] mx-auto mt-4">

                        {/* Window 1: Available */}
                        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#2A1F0E]/60 via-[#3D2E14]/40 to-amber-900/20 shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)] border-[3px] border-[#8B7D6B]/40 relative overflow-hidden" style={{
                          aspectRatio: '2.2 / 3.2',
                          borderRadius: '50% 50% 4px 4px / 35% 35% 4px 4px',
                        }}>
                          {/* Gothic window mullion */}
                          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-[#8B7D6B]/40 -translate-x-1/2" />
                          {/* Gothic window transom */}
                          <div className="absolute inset-x-0 top-[55%] h-[2px] bg-[#8B7D6B]/40" />
                          {/* Candlelight warm glow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-amber-300/20 via-amber-200/10 to-transparent pointer-events-none" />
                          {/* Glass reflection sweep */}
                          <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/30 to-transparent rotate-45 -translate-x-1/2 group-hover:translate-x-full transition-transform duration-1500 pointer-events-none" />

                          {/* Data directly on the glass */}
                          <span className={cn("text-3xl font-black leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10", available > 0 ? "text-emerald-300" : "text-red-400")}>{available}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest mt-1 relative z-10 text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Available</span>
                        </div>

                        {/* Window 2: Occupied */}
                        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#2A1F0E]/60 via-[#3D2E14]/40 to-amber-900/20 shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)] border-[3px] border-[#8B7D6B]/40 relative overflow-hidden" style={{
                          aspectRatio: '2.2 / 3.2',
                          borderRadius: '50% 50% 4px 4px / 35% 35% 4px 4px',
                        }}>
                          {/* Gothic window mullion */}
                          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-[#8B7D6B]/40 -translate-x-1/2" />
                          {/* Gothic window transom */}
                          <div className="absolute inset-x-0 top-[55%] h-[2px] bg-[#8B7D6B]/40" />
                          {/* Candlelight warm glow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-amber-300/20 via-amber-200/10 to-transparent pointer-events-none" />
                          {/* Glass reflection sweep */}
                          <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/30 to-transparent rotate-45 -translate-x-1/2 group-hover:translate-x-full transition-transform duration-1500 pointer-events-none" />

                          {/* Data directly on the glass */}
                          <span className="text-3xl font-black text-amber-100 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10">{hostel.occupied}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest mt-1 relative z-10 text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Occupied</span>
                        </div>
                      </div>

                      {/* Occupancy Scroll — parchment-style bar */}
                      <div className="w-full max-w-[260px] mx-auto mt-5 relative">
                        <div className="h-3 bg-[#E8DCC8] rounded-full overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] border border-[#D4C9A8]">
                          <div
                            className={cn(
                              "absolute top-0 left-0 h-full rounded-full transition-all duration-1000",
                              percent > 90 ? "bg-destructive" : percent > 70 ? "bg-brand-orange" : "bg-brand-green"
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-center text-[8px] font-black text-[#8B7D6B] uppercase tracking-widest mt-1.5">{percent}% Occupied</p>
                      </div>

                      {/* === Castle Door — swings open on hover === */}
                      <div className="w-full mt-auto pt-6 relative cursor-pointer" style={{ perspective: '800px' }} onClick={() => !isFull && setSelectedBlockForDetails(hostel.id)}>

                        {/* Torch sconces */}
                        <div className="absolute -top-1 left-2 flex flex-col items-center z-30 pointer-events-none">
                          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_3px_rgba(251,191,36,0.6),0_0_20px_6px_rgba(251,191,36,0.2)] animate-pulse" />
                          <div className="w-1.5 h-5 bg-[#8B7D6B] rounded-b-sm mt-0.5 shadow-sm" />
                          <div className="w-4 h-1.5 bg-[#8B7D6B] rounded-sm shadow-sm" />
                        </div>
                        <div className="absolute -top-1 right-2 flex flex-col items-center z-30 pointer-events-none">
                          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_3px_rgba(251,191,36,0.6),0_0_20px_6px_rgba(251,191,36,0.2)] animate-pulse" />
                          <div className="w-1.5 h-5 bg-[#8B7D6B] rounded-b-sm mt-0.5 shadow-sm" />
                          <div className="w-4 h-1.5 bg-[#8B7D6B] rounded-sm shadow-sm" />
                        </div>

                        {/* Door Frame — the arch-shaped container */}
                        <div className="relative w-full h-32 overflow-hidden" style={{
                          borderRadius: '50% 50% 6px 6px / 28% 28% 6px 6px',
                        }}>
                          {/* Lit hallway behind the doors (visible when doors open) */}
                          <div className="absolute inset-0 bg-gradient-to-b from-amber-200/80 via-amber-100/60 to-amber-50/40 z-0 flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3A2C2B]/60">Enter</span>
                          </div>

                          {/* Left Door Panel — swings open to the left */}
                          <div className="absolute top-0 left-0 w-1/2 h-full z-10 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:[-webkit-transform:rotateY(-65deg)] group-hover:[transform:rotateY(-65deg)]" style={{
                            transformOrigin: 'left center',
                            backfaceVisibility: 'hidden',
                          }}>
                            <div className={cn("w-full h-full border-r-[2px] border-[#1A0F06]",
                              isFull
                                ? "bg-stone-500"
                                : "bg-gradient-to-b from-[#6B4226] to-[#3E2413]"
                            )}>
                              {/* Wood plank lines */}
                              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                                backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 7px, rgba(0,0,0,0.12) 7px, rgba(0,0,0,0.12) 8px)`,
                              }} />
                              {/* Iron studs left */}
                              <div className="absolute inset-0 pointer-events-none flex flex-col items-end justify-start pr-3 pt-4 gap-5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#A0A0A0] to-[#606060] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#A0A0A0] to-[#606060] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#A0A0A0] to-[#606060] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
                              </div>
                              {/* Iron hinge */}
                              <div className="absolute left-0 top-[20%] w-5 h-2 bg-gradient-to-r from-[#555] to-[#888] rounded-r-full shadow-md" />
                              <div className="absolute left-0 top-[60%] w-5 h-2 bg-gradient-to-r from-[#555] to-[#888] rounded-r-full shadow-md" />
                            </div>
                          </div>

                          {/* Right Door Panel — swings open to the right */}
                          <div className="absolute top-0 right-0 w-1/2 h-full z-10 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:[transform:rotateY(65deg)]" style={{
                            transformOrigin: 'right center',
                            backfaceVisibility: 'hidden',
                          }}>
                            <div className={cn("w-full h-full border-l-[2px] border-[#1A0F06]",
                              isFull
                                ? "bg-stone-500"
                                : "bg-gradient-to-b from-[#6B4226] to-[#3E2413]"
                            )}>
                              {/* Wood plank lines */}
                              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                                backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 7px, rgba(0,0,0,0.12) 7px, rgba(0,0,0,0.12) 8px)`,
                              }} />
                              {/* Iron studs right */}
                              <div className="absolute inset-0 pointer-events-none flex flex-col items-start justify-start pl-3 pt-4 gap-5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#A0A0A0] to-[#606060] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#A0A0A0] to-[#606060] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#A0A0A0] to-[#606060] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
                              </div>
                              {/* Iron hinge */}
                              <div className="absolute right-0 top-[20%] w-5 h-2 bg-gradient-to-l from-[#555] to-[#888] rounded-l-full shadow-md" />
                              <div className="absolute right-0 top-[60%] w-5 h-2 bg-gradient-to-l from-[#555] to-[#888] rounded-l-full shadow-md" />
                            </div>
                          </div>

                          {/* Iron ring handle (center seam) */}
                          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-0">
                            <div className="w-7 h-7 rounded-full border-[2.5px] border-[#808080] shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-transparent" />
                            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#A0A0A0] to-[#505050] shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Apply Modal */}
        <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Hostel Accommodation">
          <div className="p-2 space-y-6">
            <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Selected Block</p>
              <h3 className="text-xl font-black text-[#3A2C2B] tracking-tight">
                {localOccupancy.find(h => h.id === studentApplyHostel)?.name || 'Not Selected'}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground">
                {localOccupancy.find(h => h.id === studentApplyHostel)?.gender} • {(localOccupancy.find(h => h.id === studentApplyHostel)?.total || 0) - (localOccupancy.find(h => h.id === studentApplyHostel)?.occupied || 0)} beds available
              </p>
            </div>

            <Select
              label="Preferred Block"
              value={studentApplyHostel}
              onChange={setStudentApplyHostel}
              options={localOccupancy.map(h => ({ label: h.name, value: h.id }))}
            />
            <Select
              label="Preferred Room Type"
              value="1"
              onChange={() => { }}
              options={[{ label: 'Single Bed', value: '1' }, { label: 'Double Bed (Shared)', value: '2' }]}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reason / Notes (Optional)</label>
              <Input placeholder="Any special requirements..." className="h-12 rounded-xl" />
            </div>

            <Button
              className="w-full bg-primary text-white font-black uppercase text-xs h-14 rounded-xl mt-4 shadow-lg shadow-primary/20"
              onClick={() => {
                // Add this student's request to the pending list so it shows up in warden's Allocate Bed modal
                const newRequest = {
                  id: `SR${Date.now()}`,
                  name: 'Current Student',
                  hostelId: studentApplyHostel,
                  gender: localOccupancy.find(h => h.id === studentApplyHostel)?.gender === 'Female' ? 'Female' : 'Male',
                  status: 'Pending',
                  floor: '1',
                  roomId: '',
                  bedNum: '',
                  bedType: 'Single'
                };
                setStudentRequests(prev => [...prev, newRequest]);
                setShowApplyModal(false);
              }}
            >
              <Send className="w-4 h-4 mr-2" /> Submit Application
            </Button>
          </div>
        </Modal>
      </div>
    );
  };

  // ============================================================
  // RESIDENT STUDENT VIEW - Dashboard for students already in hostel
  // ============================================================
  const ResidentStudentView = () => {
    return (
      <div className="min-h-screen bg-[#FCF9F6] space-y-8 p-3 pb-20 animate-in fade-in duration-700 sm:space-y-10 sm:p-4 lg:space-y-12 lg:p-6">
        {/* Resident Header */}
        <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] border-none bg-[#EBBDC2] p-6 shadow-none transition-all duration-500 sm:rounded-[32px] sm:p-8 md:p-10 lg:min-h-[240px] lg:flex-row lg:items-center">
          {/* Content wrapper */}
          <div className="relative z-10 max-w-xl flex flex-col justify-center h-full">
            <h1 className="text-3xl font-black tracking-tight text-[#3A2C2B] sm:text-4xl">Welcome Home, Alex</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="bg-white/40 border-white/20 text-[#3A2C2B] font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
                Active Resident Portal
              </Badge>
              <span className="text-[10px] font-bold text-[#3A2C2B]/60 uppercase tracking-widest italic">Residency Center • Academic Session 2026-27</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-bold text-[#3A2C2B]/85">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/10 rounded-xl"><MapPin className="w-3.5 h-3.5" /> Block Alpha</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/10 rounded-xl"><Building className="w-3.5 h-3.5" /> Room BA-F2-204</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-white/10 rounded-xl"><Bed className="w-3.5 h-3.5" /> Bed 01</span>
            </div>
          </div>

          {/* Hostel.png illustration layout */}
          <div className="absolute right-8 bottom-0 top-0 hidden lg:flex items-center justify-end w-1/3 pointer-events-none select-none">
            <img
              src="/hostel.png"
              alt="Hostel Illustration"
              className="object-contain h-[130%] translate-y-12 translate-x-4 max-h-[220px]"
            />
          </div>
        </div>

        {/* Hostel Residency Identity Card */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-1">
          <Card className="group relative overflow-hidden rounded-[32px] border-none bg-white shadow-2xl sm:rounded-[48px]">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Building2 className="w-48 h-48 text-primary" />
            </div>
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Left Profile Section */}
                <div className="relative flex flex-col items-center justify-center space-y-6 overflow-hidden bg-primary p-8 text-center sm:p-10 lg:w-[320px] lg:p-12">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  <div className="relative z-10">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] border border-white/30 bg-white/20 shadow-2xl backdrop-blur-xl transition-transform duration-500 group-hover:scale-105 sm:h-32 sm:w-32 sm:rounded-[40px]">
                      <User className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Alex Mercer</h3>
                    <p className="text-white/60 text-xs font-black uppercase tracking-widest mt-1">S-8420 • Computer Science</p>
                    <Badge className="mt-4 bg-white text-primary font-black uppercase text-[9px] px-4 py-1.5 rounded-xl border-none">Active Resident</Badge>
                  </div>
                </div>

                {/* Right Details Section */}
                <div className="relative flex-1 space-y-8 bg-white p-6 sm:p-8 lg:p-12 lg:space-y-10">
                  <div className="flex flex-col gap-4 border-b border-border/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Hostel Allocation Details</h4>
                      <p className="text-xl font-black text-[#3A2C2B]">Academic Session 2026-27</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-soft-parchment flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
                    {[
                      { label: 'Hostel Block', value: 'Block Alpha', icon: MapPin },
                      { label: 'Floor No.', value: 'Floor 02', icon: Building },
                      { label: 'Room Number', value: 'BA-F2-204', icon: Home },
                      { label: 'Bed Position', value: 'Bed 01', icon: Bed },
                    ].map((detail, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <detail.icon className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{detail.label}</span>
                        </div>
                        <p className="text-sm font-black text-[#3A2C2B] uppercase">{detail.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-between gap-6 border-t border-border/5 pt-8 sm:flex-row sm:items-center lg:pt-10">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned Warden</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-xs font-black text-[#3A2C2B]">Mr. James Wilson</span>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-border/10 hidden sm:block" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Allocation Date</span>
                        <span className="text-xs font-black text-[#3A2C2B]">August 14, 2026</span>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-primary/20 text-primary font-black uppercase text-[9px] px-6 h-11 hover:bg-primary hover:text-white transition-all">
                      Download Allotment Letter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social & Admin Row */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          {/* Financial Overview (Fee Tracking) - Now Full Width */}
          <Card className="group relative overflow-hidden rounded-[32px] border-none bg-white shadow-2xl sm:rounded-[48px]">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <DollarSign className="w-48 h-48 text-[#3A2C2B]" />
            </div>
            <CardHeader className="border-b border-border/30 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-[#3A2C2B] sm:text-2xl">Financial Status & Fee Tracking</CardTitle>
                  <CardDescription className="text-sm font-medium italic">Comprehensive hostel fees and outstanding bill monitoring</CardDescription>
                </div>
                <Badge variant="outline" className="w-fit rounded-full border-primary/20 px-4 py-2 text-[10px] font-black uppercase text-primary sm:px-6">Academic Term 2026</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4 space-y-6">
                  <div className="rounded-[28px] border border-border/10 bg-soft-parchment/30 p-6 sm:rounded-[40px] sm:p-8">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Next Payment Due</p>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl font-black text-[#3A2C2B] sm:text-5xl">$1,250</span>
                      <span className="text-xs font-bold text-red-500 italic">Due in 5 days</span>
                    </div>
                    <Button className="w-full h-14 rounded-2xl bg-[#3A2C2B] text-white font-black uppercase text-xs hover:bg-[#3A2C2B]/90 shadow-xl shadow-black/10 mt-8 transition-all hover:scale-[1.02]">
                      Proceed to Payment
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Detailed Bill Breakdown</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Accommodation Fee', status: 'Pending', amount: '$1,100', desc: 'Standard Room Allocation' },
                      { label: 'Utility Surcharge', status: 'Pending', amount: '$150', desc: 'Electricity, Water & Maintenance' },
                      { label: 'Security Deposit', status: 'Paid', amount: '$500', desc: 'Refundable at end of term' },
                    ].map((fee, i) => (
                      <div key={i} className="flex flex-col gap-4 rounded-[24px] border border-border/10 bg-white p-5 transition-all hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:rounded-[28px] sm:p-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-soft-parchment flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#3A2C2B] uppercase">{fee.label}</p>
                            <p className="text-[10px] font-medium text-muted-foreground italic">{fee.desc}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-black text-[#3A2C2B] mb-1">{fee.amount}</p>
                          <Badge variant={fee.status === 'Paid' ? 'brand-green' : 'brand-orange'} className="h-4 text-[7px] uppercase">{fee.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warden's Desk & Discipline History */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
          {/* Warden Contact Card */}
          <Card className="group relative overflow-hidden rounded-[32px] border-none bg-primary text-white shadow-2xl sm:rounded-[48px] lg:col-span-4">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <CardHeader className="relative p-6 sm:p-8 lg:p-10">
              <CardTitle className="text-xl font-black uppercase tracking-tight sm:text-2xl">Warden Contact</CardTitle>
              <CardDescription className="text-white/60 font-medium italic">Block Alpha Support</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6 p-6 pt-0 sm:space-y-8 sm:p-8 sm:pt-0 lg:p-10 lg:pt-0">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Mr. James Wilson</h3>
                  <p className="text-xs text-white/70 font-medium italic">Senior Warden</p>
                </div>
              </div>
              <Button className="w-full h-12 rounded-xl bg-white text-primary font-black uppercase text-[10px] hover:bg-white/90 shadow-xl">
                <MessageSquare className="w-4 h-4 mr-2" /> Message
              </Button>
            </CardContent>
          </Card>


        </div>



        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-[#3A2C2B] sm:text-2xl">Administrative Requests</h2>
            <span className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Apply for Leave', desc: 'Weekend or emergency exit request', icon: Send, color: 'bg-primary', action: () => setShowLeaveRequestModal(true) },
              { title: 'Room Shift', desc: 'Apply for a room change mid-term', icon: ArrowRight, color: 'bg-brand-orange', action: () => setShowRoomShiftModal(true) },
              { title: 'Hostel Rules', desc: 'Download code of conduct & rules', icon: ShieldAlert, color: 'bg-brand-purple', action: () => alert("Downloading Rules...") },
            ].map((action, i) => (
              <button key={i} onClick={action.action} className="group rounded-[28px] border-none bg-white p-6 text-left shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-primary sm:rounded-[40px] sm:p-8">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:bg-white group-hover:text-primary transition-colors", action.color)}>
                  <action.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#3A2C2B] group-hover:text-white transition-colors uppercase tracking-tight leading-none mb-2">{action.title}</h3>
                <p className="text-xs font-medium text-muted-foreground group-hover:text-white/70 transition-colors italic leading-relaxed">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>


        {/* Hostel Announcements for Residents */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-[#3A2C2B] sm:text-2xl">Hostel Announcements</h2>
            <span className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hostelNotices.map((notice) => (
              <div key={notice.id} className="group flex flex-col gap-5 rounded-[32px] border border-border/10 bg-white p-6 shadow-xl transition-all hover:border-primary/20 sm:flex-row sm:items-start sm:gap-8 sm:rounded-[48px] sm:p-10">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-soft-parchment/60 transition-all group-hover:bg-primary group-hover:text-white">
                  <Bell className="w-7 h-7 text-primary group-hover:text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{notice.type}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">{notice.date}</p>
                  </div>
                  <h4 className="text-lg font-black text-[#3A2C2B] uppercase tracking-tight">{notice.title}</h4>
                  <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">{notice.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle back for demo purposes */}
        <div className="pt-10 flex justify-center">
          <Button variant="outline" className="rounded-full px-8 opacity-50 hover:opacity-100" onClick={() => setIsResident(false)}>
            Demo: Switch to Applicant View
          </Button>
        </div>



        {/* Leave Request Modal */}
        <Modal isOpen={showLeaveRequestModal} onClose={() => setShowLeaveRequestModal(false)} title="New Leave Application">
          <div className="p-2 space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Request Subject</label>
              <Input placeholder="e.g. Wedding Ceremony, Summer Break, Sick Leave" className="h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Leave Start Date</label>
                <Input type="date" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Return Date</label>
                <Input type="date" className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Full Explanation</label>
              <Textarea placeholder="Explain your reason for leaving campus..." className="rounded-xl min-h-[100px]" />
            </div>
            <Button
              className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-xs shadow-xl shadow-primary/20"
              onClick={() => {
                const newReq: ResidentRequest = {
                  id: `RQ${Date.now()}`,
                  studentName: 'Alex Mercer',
                  type: 'Leave Request',
                  subject: 'Weekend Visit to Family', // In real app, take from state
                  reason: 'Weekend Visit to Family',
                  status: 'Pending',
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                  hostel: 'Block Alpha',
                  floor: '2',
                  room: 'BA-F2-204'
                };
                setResidentRequests(prev => [newReq, ...prev]);
                setShowLeaveRequestModal(false);
                alert("Your leave application has been submitted to the Warden.");
              }}
            >
              Submit Leave Application
            </Button>
          </div>
        </Modal>

        {/* Room Shift Modal */}
        <Modal isOpen={showRoomShiftModal} onClose={() => setShowRoomShiftModal(false)} title="Room Transfer Application">
          <div className="p-2 space-y-6">
            <div className="p-6 rounded-3xl bg-soft-parchment/40 border border-primary/10">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Current Assignment</p>
              <p className="text-sm font-black text-[#3A2C2B]">Block Alpha • Floor 2 • Room BA-F2-204</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Request Subject</label>
              <Input placeholder="e.g. Health Issues, AC Repair, Roommate conflict" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Desired Room Type</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                {['Single Bed', 'Double Bed (Shared)'].map(t => (
                  <button key={t} className="flex-1 py-3 rounded-xl border border-border/20 text-[10px] font-black uppercase hover:bg-brand-orange/5 transition-all">{t}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Full Explanation</label>
              <Textarea placeholder="Explain why you wish to change your room..." className="rounded-xl min-h-[100px]" />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-orange/5 text-brand-orange border border-brand-orange/10">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <p className="text-[10px] font-bold italic">Room transfers are subject to availability and administrative approval.</p>
            </div>
            <Button
              className="w-full h-14 rounded-2xl bg-brand-orange text-white font-black uppercase text-xs shadow-xl shadow-brand-orange/20"
              onClick={() => {
                const newReq: ResidentRequest = {
                  id: `RQ${Date.now()}`,
                  studentName: 'Alex Mercer',
                  type: 'Room Transfer',
                  subject: 'Requested Single Room for Studies',
                  reason: 'Requested Single Room for Studies',
                  status: 'Pending',
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                  hostel: 'Block Alpha',
                  floor: '2',
                  room: 'BA-F2-204',
                  currentRoom: 'BA-F2-204',
                  currentBed: '1'
                };
                setResidentRequests(prev => [newReq, ...prev]);
                setShowRoomShiftModal(false);
                alert("Your room transfer application has been submitted to the Warden.");
              }}
            >
              Submit Transfer Application
            </Button>
          </div>
        </Modal>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER - Role-based conditional
  // ============================================================
  if (isStudentRole) {
    return isResident ? <ResidentStudentView /> : <StudentHostelView />;
  }


  // WARDEN / ADMIN VIEW
  return (
    <div className="min-h-screen bg-[#FCF9F6] space-y-6 sm:space-y-10 pb-20">
      <HeaderSection />

      {/* Warden Navigation Tabs - Library Style Centered */}
      <div className="px-4 lg:px-6">
        <TabSwitcher
          tabs={[
            { id: 'overview', label: 'Dashboard', icon: Building2 },
            { id: 'residents', label: 'Residents', icon: Users },
            { id: 'requests', label: 'Requests', icon: Send },
            { id: 'notices', label: 'Notices', icon: Bell },
          ]}
          activeTab={activeWardenTab}
          onTabChange={(id) => setActiveWardenTab(id as any)}
          color="bg-primary"
        />
      </div>

      <div className="px-4 lg:px-6 space-y-6 sm:space-y-10">
        {activeWardenTab === 'overview' && (
          <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <KPISection />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <OccupancyOverview />
              </div>
              <div className="lg:col-span-5">
                <ActivityFeed />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <RoomAllocationTable />
            </div>
            <FeeOverviewCard />
          </div>
        )}

        {activeWardenTab === 'residents' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black text-[#3A2C2B] tracking-tight text-center sm:text-left">Active Residents</h2>
                <p className="text-sm text-muted-foreground font-medium italic text-center sm:text-left">Daily management and residency center</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl">
                  <button
                    onClick={() => setResView('card')}
                    className={cn("p-2 rounded-lg transition-all", resView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setResView('table')}
                    className={cn("p-2 rounded-lg transition-all", resView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-full sm:w-40">
                  <Select
                    placeholder="Hostel"
                    value={resHostelFilter}
                    onChange={setResHostelFilter}
                    options={[
                      { label: 'All Hostels', value: 'All' },
                      { label: 'Block Alpha', value: 'BA' },
                      { label: 'Block Beta', value: 'BB' },
                      { label: 'Girls Block A', value: 'GA' },
                      { label: 'Girls Block B', value: 'GB' },
                    ]}
                    className="h-11 bg-white border border-border/40 text-xs font-black rounded-2xl shadow-sm"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <Select
                    placeholder="Floor"
                    value={resFloorFilter}
                    onChange={setResFloorFilter}
                    options={[
                      { label: 'All Floors', value: 'All' },
                      { label: 'Floor 1', value: '1' },
                      { label: 'Floor 2', value: '2' },
                      { label: 'Floor 3', value: '3' },
                    ]}
                    className="h-11 bg-white border border-border/40 text-xs font-black rounded-2xl shadow-sm"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Select
                    placeholder="Room"
                    value={resRoomFilter}
                    onChange={setResRoomFilter}
                    options={[
                      { label: 'All Rooms', value: 'All' },
                      { label: 'A-f1-05', value: 'A-f1-05' },
                      { label: 'A-f2-10', value: 'A-f2-10' },
                      { label: 'B-f1-05', value: 'B-f1-05' },
                    ]}
                    className="h-11 bg-white border border-border/40 text-xs font-black rounded-2xl shadow-sm"
                  />
                </div>
              </div>
            </div>
            {resView === 'table' ? (
              <div className="rounded-[32px] border border-[#3A2C2B]/10 bg-white shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto no-scrollbar">
                  <div className="min-w-[1000px] flex flex-col">
                    {/* Fixed Header */}
                    <div className="bg-[#3A2C2B] shrink-0">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-white/70">
                            <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Resident</th>
                            <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Location</th>
                            <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Conduct Standing</th>
                            <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable Body */}
                    <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-[#3A2C2B]/5">
                          {getResidentsData()
                            .filter((r: any) => resHostelFilter === 'All' || r.hostelId === resHostelFilter)
                            .filter((r: any) => resFloorFilter === 'All' || r.floor === resFloorFilter)
                            .filter((r: any) => resRoomFilter === 'All' || r.room === resRoomFilter)
                            .map((resident: any, i: number) => {
                              const violations = (resident as any).violations || 0;

                              return (
                                <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                                  <td className="w-[30%] px-8 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-soft-parchment flex items-center justify-center font-black text-primary text-sm shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                        {resident.name[0]}
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{resident.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{resident.id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="w-[20%] px-8 py-5">
                                    <p className="text-sm font-black text-[#3A2C2B] tracking-tight">{resident.room}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{localOccupancy.find(h => h.id === resident.hostelId)?.name}</p>
                                  </td>
                                  <td className="w-[25%] px-8 py-5">
                                    <div className="flex flex-col gap-2">
                                      {violations === 0 ? (
                                        <Badge className="w-fit px-3 py-1 rounded-lg bg-brand-green text-white text-[8px] font-black uppercase tracking-widest shadow-md">
                                          Regular
                                        </Badge>
                                      ) : (
                                        <>
                                          <div className="h-2.5 w-32 bg-[#3A2C2B]/10 rounded-full overflow-hidden border border-[#3A2C2B]/5 p-[1px]">
                                            <div
                                              className={cn(
                                                "h-full rounded-full transition-all duration-500 shadow-sm",
                                                violations >= suspendThreshold ? "bg-red-600" : violations >= noticeThreshold ? "bg-red-500" : "bg-brand-orange"
                                              )}
                                              style={{ width: `${Math.min((violations / suspendThreshold) * 100, 100)}%` }}
                                            />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black text-[#3A2C2B] uppercase">
                                              {violations} Violations
                                            </p>
                                            {violations >= noticeThreshold && (
                                              <Badge className="bg-red-100 text-red-600 text-[7px] font-black uppercase border-none px-1.5 h-4">
                                                {violations >= suspendThreshold ? 'Critical' : 'Alert'}
                                              </Badge>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                  <td className="w-[25%] px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2 transition-all">
                                      <Button variant="outline" className="h-9 rounded-lg text-[10px] font-black uppercase border-primary/40 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" onClick={() => { setSelectedStudentForAction(resident); setShowLogDiscipline(true); }}>
                                        Log Discipline
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
                    Showing <span className="text-[#3A2C2B]">{getResidentsData().length}</span> of 842 residents
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={residentPage === 1 ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                        residentPage === 1 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                      )}
                      onClick={() => setResidentPage(1)}
                    >
                      1
                    </Button>
                    <Button
                      variant={residentPage === 2 ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                        residentPage === 2 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                      )}
                      onClick={() => setResidentPage(2)}
                    >
                      2
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5">3</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
                {getResidentsData()
                  .filter((r: any) => resHostelFilter === 'All' || r.hostelId === resHostelFilter)
                  .filter((r: any) => resFloorFilter === 'All' || r.floor === resFloorFilter)
                  .filter((r: any) => resRoomFilter === 'All' || r.room === resRoomFilter)
                  .map((resident: any, i: number) => {
                    const violations = (resident as any).violations || 0;
                    return (
                      <div key={i} className="flex-none w-[320px] rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl flex flex-col relative overflow-hidden group">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-primary shadow-sm border border-white/5">
                              {resident.name[0]}
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-white">{resident.name}</h4>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{resident.id}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-8 border-y border-white/10 py-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Room</span>
                            <span className="text-lg font-black text-white/90">{resident.room}</span>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Hostel</span>
                            <span className="text-sm font-black text-white/90 mt-1">{localOccupancy.find(h => h.id === resident.hostelId)?.name || resident.hostelId}</span>
                          </div>
                        </div>

                        <div className="mt-auto space-y-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Conduct Standing</span>
                            {violations === 0 ? (
                              <Badge className="w-fit px-3 py-1 rounded-lg bg-brand-green border-none text-white text-[8px] font-black uppercase tracking-widest">
                                Regular
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      violations >= suspendThreshold ? "bg-red-500" : violations >= noticeThreshold ? "bg-brand-orange" : "bg-yellow-400"
                                    )}
                                    style={{ width: `${Math.min((violations / suspendThreshold) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-white/80">{violations} Violations</span>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            className="w-full rounded-xl h-11 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white/80 border border-white/5"
                            onClick={() => { setSelectedStudentForAction(resident); setShowLogDiscipline(true); }}
                          >
                            Log Discipline
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeWardenTab === 'requests' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black text-[#3A2C2B] tracking-tight">Administrative Requests</h2>
                <p className="text-sm text-muted-foreground font-medium italic">Approve or reject leave and room shift applications</p>
              </div>
              <div className="grid grid-cols-1 sm:flex sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl">
                  <button
                    onClick={() => setReqView('card')}
                    className={cn("p-2 rounded-lg transition-all", reqView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setReqView('table')}
                    className={cn("p-2 rounded-lg transition-all", reqView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    placeholder="Request Type"
                    value={requestTypeFilter}
                    onChange={setRequestTypeFilter}
                    options={[
                      { label: 'All Requests', value: 'All' },
                      { label: 'Leave Request', value: 'Leave Request' },
                      { label: 'Room Transfer', value: 'Room Transfer' },
                    ]}
                    className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    placeholder="Hostel"
                    value={requestHostelFilter}
                    onChange={setRequestHostelFilter}
                    options={[
                      { label: 'All Hostels', value: 'All' },
                      { label: 'Block Alpha', value: 'Block Alpha' },
                      { label: 'Block Beta', value: 'Block Beta' },
                      { label: 'Girls Block A', value: 'Girls Block A' },
                      { label: 'Girls Block B', value: 'Girls Block B' },
                    ]}
                    className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <Select
                    placeholder="Floor"
                    value={requestFloorFilter}
                    onChange={setRequestFloorFilter}
                    options={[
                      { label: 'All Floors', value: 'All' },
                      { label: '1st Floor', value: '1' },
                      { label: '2nd Floor', value: '2' },
                      { label: '3rd Floor', value: '3' },
                    ]}
                    className="h-11 bg-[#3A2C2B]/5 border-none text-xs font-black rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {reqView === 'table' ? (
              <div className="rounded-[32px] border border-[#3A2C2B]/10 bg-white shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto no-scrollbar">
                  <div className="min-w-[1100px] flex flex-col">
                    {/* Fixed Header */}
                    <div className="bg-[#3A2C2B] shrink-0">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-white/70">
                            <th className="w-[18%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Student & Date</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Request Type</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Hostel / Room</th>
                            <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Reason</th>
                            <th className="w-[12%] px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                            <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable Body */}
                    <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-[#3A2C2B]/5">
                          {residentRequests
                            .filter(req => requestTypeFilter === 'All' || req.type === requestTypeFilter)
                            .filter(req => requestHostelFilter === 'All' || req.hostel === requestHostelFilter)
                            .filter(req => requestFloorFilter === 'All' || req.floor === requestFloorFilter)
                            .map((req: any) => (
                              <tr key={req.id} className="hover:bg-primary/[0.02] transition-colors group">
                                <td className="w-[18%] px-8 py-5">
                                  <p className="text-sm font-black text-[#3A2C2B] group-hover:text-primary transition-colors">{req.studentName}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{req.date}</p>
                                </td>
                                <td className="w-[15%] px-8 py-5">
                                  <Badge variant={req.type === 'Room Transfer' ? 'brand-orange' : 'default'} className="font-black text-[9px] uppercase shadow-sm">
                                    {req.type}
                                  </Badge>
                                </td>
                                <td className="w-[15%] px-8 py-5">
                                  <p className="text-xs font-black text-[#3A2C2B]">{req.hostel}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{req.room}</p>
                                </td>
                                <td className="w-[20%] px-8 py-5">
                                  <button
                                    className="text-[11px] font-black text-primary uppercase tracking-tight hover:underline text-left"
                                    onClick={() => {
                                      setSelectedRequestDetails(req);
                                      setShowRequestDetailsModal(true);
                                    }}
                                  >
                                    {req.subject || 'View Details'}
                                  </button>
                                  <p className="text-[10px] font-medium text-muted-foreground italic line-clamp-1 opacity-60">{req.reason}</p>
                                </td>
                                <td className="w-[12%] px-8 py-5">
                                  <Badge variant={req.status === 'Pending' ? 'brand-orange' : 'brand-green'} className="font-black text-[9px] uppercase shadow-sm">
                                    {req.status}
                                  </Badge>
                                </td>
                                <td className="w-[20%] px-8 py-5 text-right">
                                  <div className="flex justify-end gap-2">
                                    {req.status === 'Pending' ? (
                                      <>
                                        <Button className="h-9 px-4 rounded-xl bg-brand-green text-white font-black uppercase text-[9px] shadow-lg shadow-brand-green/20 hover:scale-105 transition-all">Approve</Button>
                                        <Button variant="outline" className="h-9 px-4 rounded-xl border-red-200 text-red-500 font-black uppercase text-[9px] hover:bg-red-50">Reject</Button>
                                      </>
                                    ) : (
                                      <Button variant="ghost" className="h-9 px-4 rounded-xl text-muted-foreground font-black uppercase text-[9px] border border-border/10 cursor-not-allowed" disabled>Archived</Button>
                                    )}
                                  </div>
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
                    Showing <span className="text-[#3A2C2B]">
                      {residentRequests.filter(req =>
                        (requestTypeFilter === 'All' || req.type === requestTypeFilter) &&
                        (requestHostelFilter === 'All' || req.hostel === requestHostelFilter) &&
                        (requestFloorFilter === 'All' || req.floor === requestFloorFilter)
                      ).length}
                    </span> of {residentRequests.length} applications
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={requestPage === 1 ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-xl p-0 text-[10px] font-black",
                        requestPage === 1 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "border border-border/10 bg-white hover:bg-primary/5"
                      )}
                      onClick={() => setRequestPage(1)}
                    >
                      1
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl p-0 border border-border/10 bg-white hover:bg-primary/5">2</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
                {residentRequests
                  .filter(req => requestTypeFilter === 'All' || req.type === requestTypeFilter)
                  .filter(req => requestHostelFilter === 'All' || req.hostel === requestHostelFilter)
                  .filter(req => requestFloorFilter === 'All' || req.floor === requestFloorFilter)
                  .map((req) => (
                    <div key={req.id} className="flex-none w-[340px] rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl flex flex-col relative overflow-hidden group">
                      <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-white">{req.studentName}</h4>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{req.date}</p>
                        </div>
                        <Badge variant={req.status === 'Pending' ? 'brand-orange' : 'brand-green'} className="font-black text-[9px] uppercase shadow-sm">
                          {req.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 mb-6 border-y border-white/10 py-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Type</span>
                          <span className={cn("text-sm font-black", req.type === 'Room Transfer' ? "text-brand-orange" : "text-brand-green")}>{req.type}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Hostel/Room</span>
                          <span className="text-sm font-black text-white/90">{req.hostel} · {req.room}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <button
                          className="text-[11px] font-black text-primary uppercase tracking-tight hover:underline text-left mb-1"
                          onClick={() => {
                            setSelectedRequestDetails(req);
                            setShowRequestDetailsModal(true);
                          }}
                        >
                          {req.subject || 'View Details'}
                        </button>
                        <p className="text-[10px] font-medium text-white/60 italic line-clamp-2">{req.reason}</p>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3">
                        {req.status === 'Pending' ? (
                          <>
                            <Button className="w-full h-11 rounded-xl bg-brand-green text-white font-black uppercase text-[10px] shadow-lg shadow-brand-green/20 hover:scale-105 transition-all">Approve</Button>
                            <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 text-red-400 font-black uppercase text-[10px] hover:bg-red-500/10">Reject</Button>
                          </>
                        ) : (
                          <Button variant="ghost" className="col-span-2 w-full h-11 rounded-xl text-white/40 font-black uppercase text-[10px] border border-white/5 cursor-not-allowed" disabled>Archived</Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeWardenTab === 'notices' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#3A2C2B] tracking-tight">Hostel Notice Board</h2>
                <p className="text-sm text-muted-foreground font-medium italic">Communicate rules and maintenance alerts to residents</p>
              </div>
              <Button className="bg-primary text-white font-black uppercase text-xs rounded-xl h-12 shadow-lg" onClick={() => setShowAddNotice(true)}>
                <Plus className="w-4 h-4 mr-2" /> Post New Notice
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hostelNotices.map((notice) => (
                <Card key={notice.id} className="rounded-[40px] border-none shadow-2xl bg-white overflow-hidden group">
                  <CardHeader className="p-8 border-b border-border/30 bg-soft-parchment/30">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="rounded-lg text-primary border-primary/20">{notice.type}</Badge>
                      <p className="text-[10px] font-black text-muted-foreground uppercase">{notice.date}</p>
                    </div>
                    <CardTitle className="text-xl font-black text-[#3A2C2B] uppercase tracking-tight">{notice.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-sm font-medium text-muted-foreground italic leading-relaxed mb-6">{notice.content}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="h-10 text-[10px] font-black uppercase rounded-lg border-border/30">Edit</Button>
                      <Button variant="ghost" className="h-10 text-[10px] font-black uppercase rounded-lg text-red-500">Archive</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* MODALS (Shared across tabs) */}
      <Modal isOpen={showAddNotice} onClose={() => setShowAddNotice(false)} title="Create Hostel Announcement">
        <div className="p-2 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Notice Title</label>
            <Input placeholder="e.g. Saturday Meeting" />
          </div>
          <Select label="Type" value="General" onChange={() => { }} options={[{ label: 'General', value: 'General' }, { label: 'Maintenance', value: 'Maintenance' }, { label: 'Rule', value: 'Rule' }]} />
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Content</label>
            <textarea className="w-full rounded-xl border border-border/30 bg-[#F8F5F2] p-4 text-sm font-medium focus:ring-1 focus:ring-primary h-32 outline-none" placeholder="Enter announcement details..." />
          </div>
          <Button className="w-full bg-primary text-white font-black uppercase h-14 rounded-xl mt-4" onClick={() => setShowAddNotice(false)}>Post Notice</Button>
        </div>
      </Modal>




      <Modal isOpen={showLogDiscipline} onClose={() => setShowLogDiscipline(false)} title={`Log Behavior - ${selectedStudentForAction?.name}`}>
        <div className="p-2 space-y-4">
          <Select label="Action Type" value="Warning" onChange={() => { }} options={[{ label: 'Warning', value: 'Warning' }, { label: 'Sent Notice to Parent & Student Both', value: 'Notice' }, { label: 'Suspended', value: 'Suspended' }]} />
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Issue Detail</label>
            <textarea className="w-full rounded-xl border border-border/30 bg-[#F8F5F2] p-4 text-sm font-medium focus:ring-1 focus:ring-primary h-32 outline-none" placeholder="Describe the issue in detail..." />
          </div>
          <Button
            className="w-full bg-primary text-white font-black uppercase h-14 rounded-xl mt-4"
            onClick={() => {
              const newNotice = {
                id: `DISC-${Date.now()}`,
                title: 'Disciplinary Notice Issued',
                content: `A disciplinary action has been logged for your residency. Reason: Behavioral violation. Please contact the Warden's office.`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                type: 'Rule'
              };
              setHostelNotices(prev => [newNotice, ...prev]);
              setShowLogDiscipline(false);
              alert("Disciplinary notice sent to student portal.");
            }}
          >
            Submit & Notify Student
          </Button>
        </div>
      </Modal>

      {/* MODALS */}
      <Modal isOpen={showAddHostel} onClose={() => setShowAddHostel(false)} title="Add New Hostel Block">
        <div className="p-2 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hostel Name</label>
            <Input placeholder="e.g. Boys" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Block Name</label>
            <Input placeholder="e.g. Block A" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Total Floors</label>
            <Input type="number" placeholder="4" />
          </div>
          <Button className="w-full bg-primary text-white font-black uppercase text-xs h-12 rounded-xl mt-4" onClick={() => setShowAddHostel(false)}>Save Hostel</Button>
        </div>
      </Modal>

      <Modal isOpen={showAddRoom} onClose={() => setShowAddRoom(false)} title="Add New Room">
        <div className="p-2 space-y-6">
          <Select
            label="Select Hostel (Block)"
            value={roomHostelId}
            onChange={(val: string) => {
              setRoomHostelId(val);
              setRoomFloor('1');
            }}
            options={localOccupancy.map(h => ({ label: h.name, value: h.id }))}
          />

          {roomHostelId && (() => {
            const selectedHostel = localOccupancy.find(h => h.id === roomHostelId);
            if (!selectedHostel) return null;

            const blockName = selectedHostel.name.split(' ').pop() || 'A';
            let previousRooms = 0;
            for (let i = 0; i < parseInt(roomFloor) - 1; i++) {
              previousRooms += selectedHostel.roomsPerFloor[i] || 0;
            }
            const currentFloorRooms = selectedHostel.roomsPerFloor[parseInt(roomFloor) - 1] || 0;
            const startRoomNumber = previousRooms + currentFloorRooms + 1;
            const numToAdd = parseInt(roomsToAdd) || 1;
            const endRoomNumber = startRoomNumber + numToAdd - 1;

            const formattedRoom = numToAdd > 1
              ? `${blockName}-f${roomFloor}-${startRoomNumber.toString().padStart(2, '0')} ... ${blockName}-f${roomFloor}-${endRoomNumber.toString().padStart(2, '0')}`
              : `${blockName}-f${roomFloor}-${startRoomNumber.toString().padStart(2, '0')}`;

            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Select Floor"
                    value={roomFloor}
                    onChange={setRoomFloor}
                    options={Array.from({ length: selectedHostel.floors }, (_, i) => ({
                      label: `Floor ${i + 1}`,
                      value: (i + 1).toString()
                    }))}
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Number of New Rooms</label>
                    <Input
                      type="number"
                      value={roomsToAdd}
                      onChange={(e: any) => setRoomsToAdd(e.target.value)}
                      className="rounded-xl h-12 bg-white"
                    />
                  </div>
                </div>
                <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">New Sequential Range</p>
                    <Badge variant="brand-green">Appending {numToAdd} Rooms</Badge>
                  </div>
                  <h3 className="text-2xl font-black text-[#3A2C2B] tracking-tight">{formattedRoom}</h3>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button variant="outline" className="h-14 rounded-xl border-primary text-primary font-black uppercase text-xs" onClick={() => handleAddRooms(false)}>Save & Next Floor</Button>
            <Button className="bg-primary text-white font-black uppercase text-xs h-14 rounded-xl shadow-lg shadow-primary/20" onClick={() => handleAddRooms(true)}>Save & Finish</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddBed} onClose={() => setShowAddBed(false)} title="Add Beds to Room">
        <div className="p-2 space-y-6">
          <Select label="Select Hostel" value={addBedHostelId} onChange={setAddBedHostelId} options={localOccupancy.map(h => ({ label: h.name, value: h.id }))} />
          {addBedHostelId && (() => {
            const h = localOccupancy.find(hostel => hostel.id === addBedHostelId);
            return (
              <div className="grid grid-cols-2 gap-4">
                <Select label="Select Floor" value={addBedFloor} onChange={setAddBedFloor} options={Array.from({ length: h?.floors || 5 }, (_, i) => ({ label: `Floor ${i + 1}`, value: (i + 1).toString() }))} />
                <Select label="Select Room" value={addBedRoomId} onChange={setAddBedRoomId} options={[{ label: 'A-f1-01', value: '1' }, { label: 'A-f1-02', value: '2' }]} />
              </div>
            );
          })()}
          <div className="grid grid-cols-1 gap-6">
            <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/20 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Automatic Numbering Flow</p>
                <Badge variant="outline" className="bg-white/50">Cumulative</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 rounded-xl bg-white border border-primary/10 text-center">
                  <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Room Total</p>
                  <p className="text-xl font-black text-[#3A2C2B]">4 Beds</p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary opacity-30" />
                <div className="flex-1 p-4 rounded-xl bg-white border border-primary/20 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 opacity-10"><Plus className="w-8 h-8 text-primary" /></div>
                  <p className="text-[8px] font-black text-primary uppercase mb-1">Next Numbers</p>
                  <p className="text-lg font-black text-primary leading-none tracking-tight">
                    {(() => {
                      const start = 5;
                      const count = (parseInt(singleBeds) || 0) * (detailsBedPref === 'Double' ? 2 : 1);
                      if (count <= 0) return '---';
                      const nums = Array.from({ length: count }, (_, i) => start + i);
                      return `Bed ${nums.join(', ')}`;
                    })()}
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed">
                Adding a <strong>{detailsBedPref} Bed</strong> will automatically reserve <strong>{detailsBedPref === 'Double' ? '2 numbers' : '1 number'}</strong> in the sequence for this room.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Bed Type to Add"
                value={detailsBedPref}
                onChange={(v) => setDetailsBedPref(v as any)}
                options={[{ label: 'Single (1 Cap)', value: 'Single' }, { label: 'Double (2 Cap)', value: 'Double' }]}
              />
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</label>
                <Input type="number" value={singleBeds} onChange={(e: any) => setSingleBeds(e.target.value)} />
              </div>
            </div>
          </div>

          <Button className="w-full bg-primary text-white font-black uppercase h-14 rounded-xl mt-4 shadow-lg shadow-primary/20" onClick={() => setShowAddBed(false)}>
            Add to Room Sequence
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showAllocateBed} onClose={() => setShowAllocateBed(false)} title="Allocate Bed (Process Requests)">
        <div className="p-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Pending Request"
              value={allocStudentId}
              onChange={(val: string) => {
                setAllocStudentId(val);
                const s = studentRequests.find(r => r.id === val);
                if (s) {
                  setAllocHostelId(s.hostelId);
                  setAllocFloor(s.floor || '1');
                  setAllocRoomId(s.roomId || '');
                  setAllocBed(s.bedNum || '');
                }
              }}
              options={studentRequests.map(r => ({ label: `${r.name} (${r.gender})`, value: r.id }))}
            />
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hostel (Auto-filled)</label>
              <div className="h-12 rounded-xl bg-secondary/30 border border-border/30 px-4 flex items-center text-sm font-black text-[#3A2C2B]">
                {localOccupancy.find(h => h.id === allocHostelId)?.name || 'Auto-filled on selection'}
              </div>
            </div>
          </div>

          {allocStudentId && allocHostelId && (() => {
            const h = localOccupancy.find(hostel => hostel.id === allocHostelId);
            const blockName = h?.name.split(' ').pop() || 'A';
            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Floor" value={allocFloor} onChange={setAllocFloor} options={Array.from({ length: h?.floors || 5 }, (_, i) => ({ label: `Floor ${i + 1}`, value: (i + 1).toString() }))} />
                  <Select label="Available Room" value={allocRoomId} onChange={setAllocRoomId} options={[
                    { label: `${blockName}-f${allocFloor}-01 (1 S, 1 D)`, value: 'R1' },
                    { label: `${blockName}-f${allocFloor}-02 (Full)`, value: 'R2' },
                    { label: `${blockName}-f${allocFloor}-03 (2 S)`, value: 'R3' }
                  ]} />
                </div>

                {allocRoomId && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Allocating Selected Bed</label>
                    <div className="grid grid-cols-4 gap-3">
                      {(() => {
                        // For demo purposes, we show 4 slots for any selected room
                        const totalSlots = 4;

                        return Array.from({ length: totalSlots }, (_, i) => {
                          const bedNum = (i + 1).toString();
                          // Is this the EXACT bed the student selected?
                          const isStudentChoice = bedNum === allocBed;

                          return (
                            <div
                              key={bedNum}
                              className={cn(
                                "h-16 rounded-2xl border flex flex-col items-center justify-center transition-all",
                                isStudentChoice
                                  ? "bg-primary border-primary text-white shadow-lg scale-[1.05] z-10"
                                  : "bg-soft-parchment/30 border-border/10 text-muted-foreground/30 opacity-40 grayscale cursor-not-allowed"
                              )}
                            >
                              <div className="flex items-center gap-0.5">
                                <Bed className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-black uppercase mt-1">Bed {bedNum}</span>
                              <span className="text-[7px] font-bold uppercase opacity-60">
                                {isStudentChoice ? 'Requested' : 'Unavailable'}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Final Allocation Check</p>
                    <Badge variant="brand-green">Direct Approval Match</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Resident</p>
                      <p className="text-sm font-black text-[#3A2C2B]">{studentRequests.find(r => r.id === allocStudentId)?.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Target Location</p>
                      <p className="text-sm font-black text-[#3A2C2B]">
                        {allocRoomId ? (
                          <span className="flex flex-col">
                            <span>Room {
                              allocRoomId === 'R1' ? `${blockName}-f${allocFloor}-01` :
                                allocRoomId === 'R2' ? `${blockName}-f${allocFloor}-02` :
                                  allocRoomId === 'R3' ? `${blockName}-f${allocFloor}-03` :
                                    allocRoomId
                            }, Bed {allocBed || '?'}</span>
                            <span className="text-[10px] text-primary/70 italic">
                              Verified Student Choice
                            </span>
                          </span>
                        ) : 'Not Selected'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <Button className="w-full bg-primary text-white font-black uppercase h-14 rounded-xl mt-4 shadow-lg shadow-primary/20" onClick={() => setShowAllocateBed(false)} disabled={!allocBed}>Complete Allocation</Button>
        </div>
      </Modal>
      <RequestDetailsModal />
    </div>
  );
};

export default HostelPage;
