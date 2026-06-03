import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  School,
  Layers,
  Calendar,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  ArrowRightLeft,
  Home,
  CheckCircle2,
  Archive,
  MoreVertical,
  Upload,
  DoorOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatsCard } from '../components/dashboard/DashboardWidgets';
import { getStorageData, setStorageData } from '../lib/storage';

// --- Types ---
interface Node {
  id: string;
  name: string;
  type: 'school' | 'class' | 'department' | 'section';
  children?: Node[];
  isOpen?: boolean;
}

// --- Mock Data ---
const SCHOOL_STRUCTURE_STORAGE_KEY = 'school_structure_hierarchy';
const initialHierarchy: Node[] = [
  {
    id: 's1',
    name: 'EduSync International',
    type: 'school',
    isOpen: true,
    children: [
      {
        id: 'c1',
        name: 'Class 10',
        type: 'class',
        isOpen: true,
        children: [
          { id: 'sec1', name: 'Section A', type: 'section' },
          { id: 'sec2', name: 'Section B', type: 'section' },
        ]
      },
      {
        id: 'c2',
        name: 'Class 11',
        type: 'class',
        isOpen: true,
        children: [
          {
            id: 'd1',
            name: 'Science Stream',
            type: 'department',
            isOpen: true,
            children: [
              { id: 'sec3', name: 'Section A', type: 'section' }
            ]
          },
          {
            id: 'd2',
            name: 'Commerce Stream',
            type: 'department',
            children: [
              { id: 'sec4', name: 'Section A', type: 'section' },
              { id: 'sec5', name: 'Section B', type: 'section' },
            ]
          }
        ]
      },
      {
        id: 'c3',
        name: 'Class 12',
        type: 'class',
        children: []
      }
    ]
  }
];

const SchoolStructurePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasSchool = location.state?.hasSchool || false;
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'academic_years' | 'houses' | 'promotion'>('hierarchy');

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location.state]);

  const [hierarchy, setHierarchy] = useState<Node[]>(() => getStorageData(SCHOOL_STRUCTURE_STORAGE_KEY, initialHierarchy));

  useEffect(() => {
    setStorageData(SCHOOL_STRUCTURE_STORAGE_KEY, hierarchy);
  }, [hierarchy]);

  // Promotion States
  const [fromClass, setFromClass] = useState('Class 10');
  const [fromSection, setFromSection] = useState('A');
  const [fromDept] = useState('Science');
  const [toClass, setToClass] = useState('Class 11');
  const [toSection, setToSection] = useState('A');
  const [toDept, setToDept] = useState('Science');

  // Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showHouseModal, setShowHouseModal] = useState(false);

  const toggleNode = (nodeId: string) => {
    const updateNode = (nodes: Node[]): Node[] => {
      return nodes.map(node => {
        if (node.id === nodeId) return { ...node, isOpen: !node.isOpen };
        if (node.children) return { ...node, children: updateNode(node.children) };
        return node;
      });
    };
    setHierarchy(updateNode(hierarchy));
  };

  const renderHierarchy = (nodes: Node[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl mb-2 transition-all group gap-3 sm:gap-0",
            node.type === 'school' ? "bg-primary text-white" :
              node.type === 'class' ? "bg-soft-clay/30 border border-primary/10 hover:bg-soft-clay/50" :
                node.type === 'department' ? "bg-white hover:shadow-md border border-border/50" :
                  "bg-white/50 border border-border/30 hover:border-primary/30"
          )}
          style={{ marginLeft: `${level * (window.innerWidth < 640 ? 12 : 24)}px` }}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {node.children && node.children.length > 0 ? (
              <button onClick={() => toggleNode(node.id)} className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0">
                {node.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : <div className="w-6 shrink-0" />}

            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center",
              node.type === 'school' ? "bg-white/20" : "bg-primary/10 text-primary"
            )}>
              {node.type === 'school' && <School className="w-4 h-4" />}
              {node.type === 'class' && <Layers className="w-4 h-4" />}
              {node.type === 'department' && <Building2 className="w-4 h-4" />}
              {node.type === 'section' && <Users className="w-4 h-4" />}
            </div>

            <div>
              <span className="font-bold text-sm tracking-tight">{node.name}</span>
            </div>
          </div>

        </div>
        {node.isOpen && node.children && renderHierarchy(node.children, level + 1)}
      </div>
    ));
  };

  if (!hasSchool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <School className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-[#3A2C2B] tracking-tight mb-2">No School Configured</h2>
        <p className="text-muted-foreground font-medium max-w-md mb-8">
          It looks like your institution hasn't been set up yet. Please create your school profile and define its physical structure to get started.
        </p>
        <Button 
          onClick={() => navigate('/school-structure/create')}
          className="h-14 px-8 rounded-2xl font-black uppercase tracking-wider bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Add School
        </Button>
      </div>
    );
  }

  return (
    <div className="p-0 space-y-10 animate-in fade-in duration-700">
      {/* --- MODALS MOVED TO TOP FOR VISIBILITY --- */}

      {/* 1. School Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="School Profile"
        description="Manage your school's primary identity and contact information"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>Cancel</Button>
            <Button onClick={() => setShowProfileModal(false)}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">School Name</label>
              <Input placeholder="e.g. EduSync International" defaultValue="EduSync International" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Principal Name</label>
              <Input placeholder="e.g. Dr. Sarah Johnson" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Registration No.</label>
              <Input placeholder="e.g. REG-2024-001" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Established Year</label>
              <Input type="number" placeholder="e.g. 1995" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60">Address</label>
            <Input placeholder="Full school address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Contact Number</label>
              <Input placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Official Email</label>
              <Input placeholder="admin@edusync.edu" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60">School Logo URL</label>
            <Input placeholder="https://link-to-logo.png" />
          </div>
        </div>
      </Modal>



      {/* 3. Create New Year Modal */}
      <Modal
        isOpen={showYearModal}
        onClose={() => setShowYearModal(false)}
        title="Setup Academic Session"
        description="Define a new academic year period"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowYearModal(false)}>Cancel</Button>
            <Button onClick={() => setShowYearModal(false)}>Initialize Session</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Session Name</label>
              <Input placeholder="e.g. 2027-2028" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Session Type</label>
              <Input placeholder="Annual / Semester" defaultValue="Annual" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">Start Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">End Date</label>
              <Input type="date" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="active_session" className="rounded border-gray-300" />
            <label htmlFor="active_session" className="text-sm font-bold">Set as Default Active Session</label>
          </div>
        </div>
      </Modal>

      {/* 5. Create New House Modal */}
      <Modal
        isOpen={showHouseModal}
        onClose={() => setShowHouseModal(false)}
        title="Setup School House"
        description="Create a new house for student activities and competitions"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowHouseModal(false)}>Cancel</Button>
            <Button onClick={() => setShowHouseModal(false)}>Create House</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">House Name</label>
              <Input placeholder="e.g. Falcons" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase opacity-60">House Master</label>
              <Input placeholder="Warden / Teacher" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60">House Motto</label>
            <Input placeholder="Aim for Excellence" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60">House Logo (PNG / SVG)</label>
            <div className="relative border-2 border-dashed border-primary/20 rounded-2xl p-4 hover:bg-primary/5 transition-all group text-center cursor-pointer">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              <div className="flex items-center justify-center gap-3">
                <Upload className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black text-muted-foreground group-hover:text-primary uppercase tracking-widest">Select Media File</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase opacity-60">Theme Color</label>
            <div className="flex gap-2">
              {['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'].map(color => (
                <button key={color} className="w-8 h-8 rounded-full border border-black/10" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-[#3A2C2B]">School Structure</h1>
          <p className="text-muted-foreground font-medium italic text-sm">Manage physical blocks, floors, rooms, and organizational hierarchy</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex-1 md:flex-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-black bg-primary text-white shadow-lg shadow-primary/20 hover-lift tap-scale transition-all-custom"
          >
            <Settings className="w-5 h-5 lg:w-4 lg:h-4" />
            <span className="text-[10px] sm:text-xs uppercase tracking-wider">Profile</span>
          </button>
        </div>
      </div>

      {/* 1. Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 px-4 lg:px-6">
        {[
          { label: "Blocks", value: "2", icon: Building2, color: "bg-primary" },
          { label: "Floors", value: "3", icon: Layers, color: "bg-brand-orange" },
          { label: "Rooms", value: "36", icon: DoorOpen, color: "bg-brand-green" },
          { label: "Year", value: "2026-27", icon: Calendar, color: "bg-brand-purple" },
          { label: "Houses", value: "4", icon: Home, color: "bg-oat" },
        ].map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Tabs Navigation - Command Pill Style */}
      <div className="px-4 lg:px-6">
        <TabSwitcher
          tabs={[
            { id: 'hierarchy', label: 'Hierarchy', icon: School },
            { id: 'academic_years', label: 'Years', icon: Calendar },
            { id: 'houses', label: 'Houses', icon: Home },
            { id: 'promotion', label: 'Promotion', icon: ArrowRightLeft },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
          color="bg-primary"
        />
      </div>

      {/* Tab Content */}
      <div className="px-4 lg:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'hierarchy' && (
          <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-xl rounded-[20px] overflow-hidden">
            <CardHeader className="border-b border-border/30 px-4 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-black">Organizational Tree</CardTitle>
                  <CardDescription>Expand or collapse nodes to view the full school structure</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase flex-1 sm:flex-none">Expand All</Button>
                  <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase flex-1 sm:flex-none">Collapse All</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-8 overflow-x-auto">
              <div className="min-w-full lg:min-w-[500px]">
                {renderHierarchy(hierarchy)}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'academic_years' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-xl font-black uppercase text-[#3A2C2B]">Academic Year History</h3>
                <p className="text-muted-foreground font-medium italic text-xs">Historical log of school sessions and cycles</p>
              </div>

              <div className={cn(
                "rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden",
                "h-[350px]"
              )}>
                <div className="overflow-x-auto custom-scrollbar flex-1 flex flex-col">
                  <div className="min-w-[700px] flex-1 flex flex-col relative">
                    <div className="bg-[#3A2C2B] shrink-0">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-white">
                            <th className="w-[30%] px-8 py-4 text-[11px] font-black uppercase text-white/70">Session Name</th>
                            <th className="w-[40%] px-8 py-4 text-[11px] font-black uppercase text-white/70">Duration</th>
                            <th className="w-[15%] px-8 py-4 text-[11px] font-black uppercase text-white/70">Status</th>
                            <th className="w-[15%] px-8 py-4 text-[11px] font-black uppercase text-white/70 text-right">Actions</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(350px - 56px)' }}>
                      <table className="w-full text-left table-fixed">
                        <tbody className="divide-y divide-border/20">
                          {[
                            { name: "2026-2027", start: "Apr 2026", end: "Mar 2027", status: "Active" },
                            { name: "2025-2026", start: "Apr 2025", end: "Mar 2026", status: "Archived" },
                            { name: "2024-2025", start: "Apr 2024", end: "Mar 2025", status: "Archived" },
                          ].map((year, i) => (
                            <tr key={i} className="hover:bg-white transition-colors">
                              <td className="w-[30%] px-8 py-5 text-sm font-black whitespace-nowrap">{year.name}</td>
                              <td className="w-[40%] px-8 py-5 text-sm font-medium text-muted-foreground whitespace-nowrap">{year.start} - {year.end}</td>
                              <td className="w-[15%] px-8 py-5">
                                <Badge variant={year.status === 'Active' ? 'brand-green' : 'outline'} className="rounded-lg text-[10px] font-black uppercase">
                                  {year.status}
                                </Badge>
                              </td>
                              <td className="w-[15%] px-8 py-5 text-right">
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-xl bg-primary text-white rounded-[20px] overflow-hidden relative">
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-black">Configure Session</CardTitle>
                <CardDescription className="text-white/70">Setup new academic session or promotion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowYearModal(true)}
                    className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl font-black uppercase text-xs h-12 shadow-lg"
                  >
                    Create New Year
                  </Button>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-xs h-12 border border-white/20">
                    Promote Students
                  </Button>
                </div>
                <div className="p-6 bg-white/10 rounded-[20px] border border-white/10 backdrop-blur-sm">
                  <h4 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> System Readiness
                  </h4>
                  <ul className="space-y-3 text-xs font-medium text-white/80">
                    <li className="flex items-center gap-2">✓ Fees configurations updated</li>
                    <li className="flex items-center gap-2">✓ Class structures verified</li>
                    <li className="flex items-center gap-2">✓ Teacher assignments cleared</li>
                  </ul>
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
            </Card>
          </div>
        )}



        {activeTab === 'houses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Phoenix", color: "bg-[#EBBDC2]", iconColor: "text-[#B47B7B]", students: 312, points: 1250, image: "/Flying phoenix-pana.svg", master: "Mr. James Smith", motto: "Rise from the Ashes" },
              { name: "Tigers", color: "bg-[#F0E0AD]", iconColor: "text-[#B45309]", students: 305, points: 1320, image: "/tiger.png", master: "Ms. Elena Rodriguez", motto: "Strength & Courage" },
              { name: "Eagles", color: "bg-[#BFDDD8]", iconColor: "text-[#10B981]", students: 332, points: 1290, image: "/eagle.svg", master: "Dr. William Chen", motto: "Soar to Excellence" },
            ].map((house, i) => (
              <Card key={i} className={cn("border-none shadow-xl overflow-hidden group hover:-translate-y-2 transition-all duration-500 rounded-[20px] relative", house.color)}>
                <CardContent className="p-6 relative z-10">
                  {house.image && (
                    <img
                      src={house.image}
                      alt=""
                      className="absolute -right-6 -bottom-6 w-44 h-44 object-contain opacity-20 pointer-events-none group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 z-0"
                    />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm transition-all duration-500 group-hover:scale-110">
                        <Home className={cn("w-6 h-6", house.iconColor)} />
                      </div>
                      <Badge className="font-black text-[10px] uppercase rounded-lg bg-white/30 text-[#3A2C2B] border-none">
                        Active House
                      </Badge>
                    </div>
                    <div className="max-w-[80%]">
                      <h4 className="text-2xl font-black mb-0.5 text-[#3A2C2B] leading-none">{house.name}</h4>
                      <p className="text-[11px] font-medium italic text-[#3A2C2B]/60 mb-2 leading-tight">"{house.motto}"</p>
                      <p className="text-[9px] font-black uppercase text-[#3A2C2B]/40 tracking-widest leading-tight">Established 2012</p>
                      <p className="text-[10px] font-black text-[#3A2C2B] mt-1 mb-4 uppercase tracking-wider opacity-80">Master: {house.master}</p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#3A2C2B]/10">
                        <div>
                          <p className="text-[10px] font-black text-[#3A2C2B]/50 uppercase mb-1">Students</p>
                          <p className="text-lg font-black text-[#3A2C2B]">{house.students}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#3A2C2B]/50 uppercase mb-1">Points</p>
                          <p className="text-lg font-black text-[#3A2C2B]">{house.points}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <button
              onClick={() => setShowHouseModal(true)}
              className="border-2 border-dashed border-border/50 rounded-[20px] flex flex-col items-center justify-center gap-4 min-h-[300px] hover:bg-white hover:border-primary/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-black uppercase tracking-wider text-muted-foreground group-hover:text-primary">Create New House</span>
            </button>
          </div>
        )}

        {activeTab === 'promotion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-none shadow-2xl bg-white/60 backdrop-blur-xl rounded-[20px] overflow-hidden">
              <CardHeader className="bg-[#3A2C2B] text-white p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <ArrowRightLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase">Promotion Panel</CardTitle>
                    <CardDescription className="text-white/60">Bulk promote students to next grade</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Source Configuration</p>
                    <Select
                      label="From Class"
                      options={[
                        { label: 'Class 9', value: 'Class 9' },
                        { label: 'Class 10', value: 'Class 10' },
                        { label: 'Class 11', value: 'Class 11' },
                      ]}
                      value={fromClass}
                      onChange={setFromClass}
                    />
                    {fromClass && (
                      <Select
                        label="Source Section"
                        options={[
                          { label: 'Section A', value: 'A' },
                          { label: 'Section B', value: 'B' },
                          { label: 'Section C', value: 'C' },
                        ]}
                        value={fromSection}
                        onChange={setFromSection}
                      />
                    )}
                  </div>

                  <div className="flex justify-center py-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ChevronDown className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Target Configuration</p>
                    <Select
                      label="To Class"
                      options={[
                        { label: fromClass === 'Class 9' ? 'Class 10' : fromClass === 'Class 10' ? 'Class 11' : 'Class 12', value: fromClass === 'Class 9' ? 'Class 10' : fromClass === 'Class 10' ? 'Class 11' : 'Class 12' }
                      ]}
                      value={toClass}
                      onChange={setToClass}
                    />

                    {/* Conditionally show Department ONLY for classes that support multiple (Senior Secondary) */}
                    {(toClass.includes('Class 11') || toClass.includes('Class 12')) && (
                      <Select
                        label="Target Department"
                        options={[
                          { label: 'Science', value: 'Science' },
                          { label: 'Commerce', value: 'Commerce' },
                          { label: 'Arts', value: 'Arts' },
                        ]}
                        value={toDept}
                        onChange={setToDept}
                      />
                    )}

                    <Select
                      label="Target Section"
                      options={[
                        { label: 'Section A', value: 'A' },
                        { label: 'Section B', value: 'B' },
                        { label: 'Section C', value: 'C' },
                      ]}
                      value={toSection}
                      onChange={setToSection}
                    />
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex gap-3">
                    <Archive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic uppercase">
                      Selected students will be promoted from {fromClass}-{fromSection} ({fromDept}) to {toClass}-{toSection} ({toDept}) for the next session.
                    </p>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-primary/20 bg-[#3A2C2B] text-white hover:bg-[#3A2C2B]/90">
                  PROCESS MASS PROMOTION
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase text-[#3A2C2B]">Students in {fromClass}-{fromSection}</h3>
                  <p className="text-xs font-medium italic text-muted-foreground">Select students to include in the promotion workflow</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none rounded-xl font-black text-[10px] px-4 py-2 uppercase">
                  45 Students Found
                </Badge>
              </div>

              <div className={cn(
                "rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden",
                "h-[500px]"
              )}>
                <div className="overflow-x-auto custom-scrollbar flex-1 flex flex-col">
                  <div className="min-w-[700px] flex-1 flex flex-col relative">
                    <div className="bg-[#3A2C2B] shrink-0">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="text-white">
                            <th className="w-[10%] px-8 py-4 text-left">
                              <input type="checkbox" className="rounded border-white/20 w-4 h-4 bg-transparent" defaultChecked />
                            </th>
                            <th className="w-[40%] px-8 py-4 text-left text-[11px] font-black uppercase text-white/70 tracking-widest">Student Details</th>
                            <th className="w-[25%] px-8 py-4 text-left text-[11px] font-black uppercase text-white/70 tracking-widest">Current Status</th>
                            <th className="w-[25%] px-8 py-4 text-right text-[11px] font-black uppercase text-white/70 tracking-widest">Eligibility</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(500px - 56px)' }}>
                      <table className="w-full text-left table-fixed">
                        <tbody className={cn("divide-y divide-border/20", [
                          { name: "Alex Johnson", id: "STU-1024", roll: "10-A-01", status: "Passed", eligibility: "Eligible" },
                          { name: "Sarah Williams", id: "STU-1085", roll: "10-A-05", status: "Passed", eligibility: "Eligible" },
                          { name: "Michael Chen", id: "STU-1092", roll: "10-A-12", status: "Pending Results", eligibility: "Hold" },
                          { name: "Jessica Brown", id: "STU-1104", roll: "10-A-15", status: "Passed", eligibility: "Eligible" },
                          { name: "David Miller", id: "STU-1115", roll: "10-A-18", status: "Due Fees", eligibility: "Hold" },
                          { name: "Emily Davis", id: "STU-1120", roll: "10-A-20", status: "Passed", eligibility: "Eligible" },
                          { name: "James Wilson", id: "STU-1125", roll: "10-A-22", status: "Passed", eligibility: "Eligible" },
                          { name: "Olivia Taylor", id: "STU-1130", roll: "10-A-25", status: "Passed", eligibility: "Eligible" },
                        ].length === 0 && "h-full")}>
                          {[
                            { name: "Alex Johnson", id: "STU-1024", roll: "10-A-01", status: "Passed", eligibility: "Eligible" },
                            { name: "Sarah Williams", id: "STU-1085", roll: "10-A-05", status: "Passed", eligibility: "Eligible" },
                            { name: "Michael Chen", id: "STU-1092", roll: "10-A-12", status: "Pending Results", eligibility: "Hold" },
                            { name: "Jessica Brown", id: "STU-1104", roll: "10-A-15", status: "Passed", eligibility: "Eligible" },
                            { name: "David Miller", id: "STU-1115", roll: "10-A-18", status: "Due Fees", eligibility: "Hold" },
                            { name: "Emily Davis", id: "STU-1120", roll: "10-A-20", status: "Passed", eligibility: "Eligible" },
                            { name: "James Wilson", id: "STU-1125", roll: "10-A-22", status: "Passed", eligibility: "Eligible" },
                            { name: "Olivia Taylor", id: "STU-1130", roll: "10-A-25", status: "Passed", eligibility: "Eligible" },
                          ].length === 0 ? (
                            <tr className="h-full">
                              <td colSpan={4} className="h-full text-center py-20">
                                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                                    <Users className="w-8 h-8 opacity-20" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-[#3A2C2B]">No Students Found</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Try adjusting your source class or section filters</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            [
                              { name: "Alex Johnson", id: "STU-1024", roll: "10-A-01", status: "Passed", eligibility: "Eligible" },
                              { name: "Sarah Williams", id: "STU-1085", roll: "10-A-05", status: "Passed", eligibility: "Eligible" },
                              { name: "Michael Chen", id: "STU-1092", roll: "10-A-12", status: "Pending Results", eligibility: "Hold" },
                              { name: "Jessica Brown", id: "STU-1104", roll: "10-A-15", status: "Passed", eligibility: "Eligible" },
                              { name: "David Miller", id: "STU-1115", roll: "10-A-18", status: "Due Fees", eligibility: "Hold" },
                              { name: "Emily Davis", id: "STU-1120", roll: "10-A-20", status: "Passed", eligibility: "Eligible" },
                              { name: "James Wilson", id: "STU-1125", roll: "10-A-22", status: "Passed", eligibility: "Eligible" },
                              { name: "Olivia Taylor", id: "STU-1130", roll: "10-A-25", status: "Passed", eligibility: "Eligible" },
                            ].map((student, i) => (
                              <tr key={i} className="hover:bg-white transition-colors group">
                                <td className="w-[10%] px-8 py-6">
                                  <input type="checkbox" className="rounded border-[#3A2C2B]/20 w-4 h-4" defaultChecked={student.eligibility === 'Eligible'} />
                                </td>
                                <td className="w-[40%] px-8 py-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-xs font-black text-primary">
                                      {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-[#3A2C2B]">{student.name}</p>
                                      <p className="text-[10px] font-bold text-muted-foreground">{student.id} | Roll: {student.roll}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="w-[25%] px-8 py-6">
                                  <Badge variant={student.status === 'Passed' ? 'brand-green' : student.status === 'Due Fees' ? 'brand-orange' : 'outline'} className="text-[9px] font-black uppercase px-2.5 py-1">
                                    {student.status}
                                  </Badge>
                                </td>
                                <td className="w-[25%] px-8 py-6 text-right">
                                  <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    student.eligibility === 'Eligible' ? "text-emerald-600" : "text-rose-500"
                                  )}>
                                    {student.eligibility}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-6 border-t border-border/30 bg-soft-clay/5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                      Showing <span className="text-[#3A2C2B] font-black">8</span> of <span className="text-[#3A2C2B] font-black">45</span> students
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {[1, 2, 3, '...', 9].map((page, i) => (
                        <Button
                          key={i}
                          variant={page === 1 ? 'default' : 'ghost'}
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 rounded-lg text-[10px] font-black transition-all",
                            page === 1 ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10 hover:bg-[#3A2C2B]/90" : "text-[#3A2C2B] hover:bg-white border border-transparent hover:border-border/20"
                          )}
                          disabled={page === '...'}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolStructurePage;
