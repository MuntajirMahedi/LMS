import React, { useState } from "react";
import {
  Bus,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Download,
  Navigation,
  ShieldAlert,
  Bell,
  ChevronRight,
  X,
  ArrowLeft,
  Users,
  Wrench,
  Fuel,
  Pencil,
  Eye,
  LayoutGrid,
  List
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { StatsCard } from "../components/dashboard/DashboardWidgets";
import { TRANSPORT_KPIS, getActiveRoutes, getVehicles, setVehicles, setActiveRoutes } from "../mock/transportMock";
import { cn } from "../lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { Select } from "../components/ui/Select";

const TransportPage: React.FC = () => {
  const { activeRole, user } = useAuth();
  const [ACTIVE_ROUTES, _SET_ACTIVE_ROUTES] = useState<any[]>(getActiveRoutes());
  const [VEHICLES, _SET_VEHICLES] = useState<any[]>(getVehicles());
  const [view, setView] = useState<
    "DASHBOARD" | "ROUTE_DETAILS" | "VEHICLE_MGMT"
  >("DASHBOARD");
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [assignmentMode, setAssignmentMode] = useState<"EDIT" | "ADD">("EDIT");
  const [routeView, setRouteView] = useState<'card' | 'table'>('table');
  const [vehicleRegistryView, setVehicleRegistryView] = useState<'card' | 'table'>('table');
  const [vrDriverFilter, setVrDriverFilter] = useState('All');
  const [vrVehicleFilter, setVrVehicleFilter] = useState('All');

  // Modals
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleModalMode, setVehicleModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editVehicleData, setEditVehicleData] = useState<any>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showAssignEditModal, setShowAssignEditModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Assignment States
  const [assignType, setAssignType] = useState<"NOW" | "NEXT_SHIFT">("NOW");
  const [targetClass, setTargetClass] = useState("ALL");
  const [targetSection, setTargetSection] = useState("ALL");
  const [targetDept, setTargetDept] = useState("ALL");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignToVehicle, setAssignToVehicle] = useState("");

  // Assign Driver States
  const [assignDriver, setAssignDriver] = useState("");
  const [assignVehicle, setAssignVehicle] = useState("");
  const [assignRoute, setAssignRoute] = useState("");

  // New Route State
  const [newRoute, setNewRoute] = useState({
    name: "",
    vehicle: "",
    driver: "",
    stops: [{ address: "", time: "" }],
  });

  const isAdmin =
    activeRole === "SCHOOL_ADMIN" ||
    activeRole === "TRANSPORT_MANAGER" ||
    activeRole === "SUPER_ADMIN";
  const isDriver = activeRole === "BUS_DRIVER";

  const addStop = () => {
    setNewRoute((prev) => ({
      ...prev,
      stops: [...prev.stops, { address: "", time: "" }],
    }));
  };

  const removeStop = (index: number) => {
    setNewRoute((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  };

  // Mock data for the driver (North Campus Express)
  const driverRoute =
    ACTIVE_ROUTES.find((r) => r.driver === "Robert Wilson") || ACTIVE_ROUTES[0];

  // --- ADMIN COMPONENTS ---

  const AdminDashboard = () => {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* KPI Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRANSPORT_KPIS.map((kpi, i) => (
            <StatsCard
              key={i}
              icon={kpi.icon}
              label={kpi.label}
              value={kpi.value}
              sub={kpi.trend}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Core Operations: Fleet & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Fleet Management Table */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex flex-row items-center justify-between mb-6 px-2">
              <div>
                <h3 className="text-xl font-black text-[#3A2C2B]">
                  Fleet Management
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  Manage vehicles, maintenance and driver switches
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-black text-[10px] tracking-widest"
                onClick={() => setView("VEHICLE_MGMT")}
              >
                VIEW ALL VEHICLES
              </Button>
            </div>
            <div className="rounded-[40px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden h-[500px]">
              <div className="overflow-x-auto no-scrollbar h-full flex flex-col">
                <div className="min-w-[700px] flex flex-col h-full">
                  {/* Fixed Header */}
                  <div className="bg-[#C37A67] border-b border-border/20 shrink-0">
                    <table className="w-full text-left table-fixed">
                  <thead>
                    <tr>
                      <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Vehicle Number
                      </th>
                      <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Assigned Driver
                      </th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Maintenance
                      </th>
                      <th className="w-[25%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody>
                    {VEHICLES.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-20 text-muted-foreground"
                        >
                          No vehicles found.
                        </td>
                      </tr>
                    ) : (
                      VEHICLES.map((v) => (
                        <tr
                          key={v.id}
                          className="border-b border-border/10 last:border-0 hover:bg-secondary/5 transition-colors group"
                        >
                          <td className="w-[30%] px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                                <Bus className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black truncate">
                                  {v.number}
                                </p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">
                                  {v.model}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="w-[30%] px-8 py-5">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm font-bold text-[#3A2C2B]/80">
                                {v.driver}
                              </span>
                            </div>
                          </td>
                          <td className="w-[15%] px-8 py-5">
                            <Badge
                              variant={
                                v.maintenance === "Healthy"
                                  ? "brand-green"
                                  : v.maintenance === "Critical"
                                    ? "destructive"
                                    : "brand-orange"
                              }
                              className="text-[9px] px-2 py-0.5"
                            >
                              {v.maintenance}
                            </Badge>
                          </td>
                          <td className="w-[25%] px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-primary hover:bg-primary/5"
                                onClick={() => {
                                  setView("VEHICLE_MGMT");
                                }}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-primary hover:bg-primary/5"
                                onClick={() => {
                                  setSelectedRoute(
                                    ACTIVE_ROUTES.find(
                                      (r) => r.vehicle === v.number,
                                    ) || ACTIVE_ROUTES[0],
                                  );
                                  setView("ROUTE_DETAILS");
                                }}
                                title="Details"
                              >
                                <Eye className="w-4 h-4" />
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

          {/* Route Performance */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden h-full">
              <CardHeader className="p-6 md:p-8 border-b border-border/30">
                <CardTitle className="text-xl font-black text-[#3A2C2B]">
                  Route Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ACTIVE_ROUTES.map((r) => ({
                        name: r.id,
                        progress: r.progress,
                      }))}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E9E1D5"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 900 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="progress"
                        fill="#C37A67"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-soft-sage/50 border border-brand-green/20">
                    <div>
                      <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">
                        On-Time Trips
                      </p>
                      <p className="text-2xl font-black mt-1">15/18</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-brand-green opacity-40" />
                  </div>
                  <div
                    className="flex items-center justify-between p-4 rounded-2xl bg-soft-clay/50 border border-destructive/20"
                    onClick={() => setShowDelayModal(true)}
                  >
                    <div>
                      <p className="text-[10px] font-black text-destructive uppercase tracking-widest">
                        Active Delays
                      </p>
                      <p className="text-2xl font-black mt-1">3 Routes</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-destructive opacity-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Data Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-12 rounded-[24px] md:rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="p-6 md:p-8 border-b border-border/30">
              <CardTitle className="text-xl font-black text-[#3A2C2B]">
                Active Route Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ACTIVE_ROUTES.map((route, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-5 rounded-[24px] border border-border/20 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group",
                    i === 0
                      ? "bg-soft-sky/30"
                      : i === 1
                        ? "bg-soft-clay/30"
                        : "bg-soft-sage/30",
                  )}
                  onClick={() => {
                    setSelectedRoute(route);
                    setView("ROUTE_DETAILS");
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-base font-black leading-tight">
                          {route.name}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          {route.id} • {route.stops.length} Stops
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[7px] bg-white/80 border-border/50 uppercase tracking-widest px-2 py-0.5"
                    >
                      Details
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/5">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm overflow-hidden bg-secondary"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${j + i * 4}`}
                            alt=""
                          />
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[7px] font-black shadow-sm">
                        +24
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        Next Stop
                      </p>
                      <p className="text-xs font-bold text-primary">
                        {route.nextStop}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Routes Table (Full Width) */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div>
              <h3 className="text-2xl font-black text-[#3A2C2B]">
                Master Route Registry
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Manage and monitor all active transit lines
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl">
                <button
                  onClick={() => setRouteView('card')}
                  className={cn("p-2 rounded-lg transition-all", routeView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRouteView('table')}
                  className={cn("p-2 rounded-lg transition-all", routeView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search routes..."
                  className="pl-10 h-11 w-full md:w-[300px] rounded-2xl border-border bg-white"
                />
              </div>
              <Button
                variant="outline"
                className="rounded-2xl h-11 px-4 md:px-6 font-black uppercase text-[10px] tracking-widest gap-2 flex-1 md:flex-none"
                onClick={() => setShowRosterModal(true)}
              >
                <Clock className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">Weekly Roster</span>
                <span className="sm:hidden">Roster</span>
              </Button>
              <Button
                className="rounded-2xl h-11 px-4 md:px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/10 flex-1 md:flex-none"
                onClick={() => setShowRouteModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />{" "}
                <span className="hidden sm:inline">New Route</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {routeView === 'table' ? (
            <div className="rounded-[24px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <div className="min-w-[900px] flex flex-col">
                  {/* Fixed Header */}
                  <div className="bg-[#3A2C2B] shrink-0">
                    <table className="w-full text-left table-fixed">
                      <thead>
                        <tr className="text-white">
                          <th className="w-[20%] px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Route Info
                          </th>
                          <th className="w-[15%] px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Assigned Fleet
                          </th>
                          <th className="w-[15%] px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Stops
                          </th>
                          <th className="w-[15%] px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Capacity
                          </th>
                          <th className="w-[15%] px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/70">
                            Status
                          </th>
                          <th className="w-[20%] px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/70 text-right">
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
                        {ACTIVE_ROUTES.map((route) => (
                          <tr
                            key={route.id}
                            className="hover:bg-white transition-all cursor-pointer group"
                            onClick={() => {
                              setSelectedRoute(route);
                              setView("ROUTE_DETAILS");
                            }}
                          >
                            <td className="w-[20%] px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#3A2C2B]/5 flex items-center justify-center text-primary font-black text-xs">
                                  {route.id.split("-")[1]}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-base font-black group-hover:text-primary transition-colors">
                                    {route.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                    {route.eta} Delivery
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="w-[15%] px-8 py-6">
                              <div className="flex -space-x-2">
                                {(route.fleet || [{ vehicle: route.vehicle }]).map(
                                  (unit: any, j: number) => (
                                    <div
                                      key={j}
                                      className="w-9 h-9 rounded-xl bg-white border-2 border-border/20 flex items-center justify-center text-primary font-black text-[9px] shadow-sm"
                                      title={unit.vehicle}
                                    >
                                      {unit.vehicle.split("-")[1]}
                                    </div>
                                  ),
                                )}
                                <div
                                  className="w-9 h-9 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center text-primary/40 hover:bg-primary/5 ml-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRoute(route);
                                    setShowAssignEditModal(true);
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </div>
                              </div>
                            </td>
                            <td className="w-[15%] px-8 py-6">
                              <span className="text-sm font-bold text-muted-foreground">
                                {route.stops.length} Managed Stops
                              </span>
                            </td>
                            <td className="w-[15%] px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase opacity-60">
                                  84% Utilized
                                </span>
                                <div className="w-24 h-1.5 bg-[#3A2C2B]/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand-green"
                                    style={{ width: "84%" }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="w-[15%] px-8 py-6">
                              <Badge
                                variant={
                                  route.status === "COMPLETED"
                                    ? "brand-green"
                                    : route.status === "DELAYED"
                                      ? "destructive"
                                      : "brand-orange"
                                }
                                className="text-[9px] px-3 py-1 font-black uppercase border-none"
                              >
                                {route.status}
                              </Badge>
                            </td>
                            <td className="w-[20%] px-8 py-6 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-[#3A2C2B]/5"
                              >
                                Manage
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
                  Showing{" "}
                  <span className="text-[#3A2C2B] font-black">
                    {ACTIVE_ROUTES.length}
                  </span>{" "}
                  entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-[10px] font-black bg-[#3A2C2B] text-white"
                  >
                    1
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-primary border border-border/10 bg-white hover:bg-primary/5"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto no-scrollbar pt-6 pb-6 px-4 scroll-smooth">
              {ACTIVE_ROUTES.map((route) => (
                <div
                  key={route.id}
                  className="flex-none w-[320px] group rounded-[32px] bg-[#3A2C2B] p-7 shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative border border-white/5"
                  onClick={() => {
                    setSelectedRoute(route);
                    setView("ROUTE_DETAILS");
                  }}
                >
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary shadow-inner ring-4 ring-white/5">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <Badge variant={
                        route.status === "COMPLETED" ? "brand-green" :
                          route.status === "DELAYED" ? "destructive" : "brand-orange"
                      } className="text-[9px] px-3 py-1 font-black uppercase border-none shadow-sm">
                        {route.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">{route.name}</h3>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{route.id} • {route.eta} Delivery</p>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {(route.fleet || [{ vehicle: route.vehicle }]).map((unit: any, j: number) => (
                            <div key={j} className="w-9 h-9 rounded-xl bg-white/10 border-2 border-white/5 flex items-center justify-center text-primary font-black text-[9px] shadow-sm">
                              {unit.vehicle.split("-")[1]}
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Fleet Units</p>
                          <p className="text-xs font-black text-white/80">{(route.fleet || [1]).length} Vehicles</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Route Coverage</p>
                          <p className="text-xs font-black text-white/80">{route.stops.length} Stops</p>
                        </div>
                        <Navigation className="w-4 h-4 text-primary opacity-40" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-white/40">
                          <span>Capacity Utilization</span>
                          <span>84%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-green transition-all" style={{ width: "84%" }} />
                        </div>
                      </div>

                      <Button variant="ghost" className="w-full rounded-xl h-11 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white/80">
                        MANAGE ROUTE
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- DRIVER DASHBOARD ---

  const DriverDashboard = () => {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Active Trip Banner */}
        <div className="p-8 rounded-[40px] bg-gradient-to-br from-primary via-primary to-[#d66b5c] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Bus className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-black tracking-tight">
                    {driverRoute.name}
                  </h1>
                  <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
                    Active Shift • {driverRoute.vehicle}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 pt-2">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60">
                    On-Board
                  </p>
                  <p className="text-2xl font-black">
                    42{" "}
                    <span className="text-xs font-bold opacity-80">Students</span>
                  </p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60">
                    Status
                  </p>
                  <p className="text-2xl font-black">On Route</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="h-14 rounded-2xl bg-white text-primary font-black uppercase tracking-widest text-xs px-10 shadow-xl hover:scale-105 transition-transform">
                START TRIP
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl bg-white/10 border-white/20 text-white font-black uppercase tracking-widest text-[10px]"
                onClick={() => setShowDelayModal(true)}
              >
                REPORT DELAY
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {["MON", "TUE", "WED", "THU", "FRI"].map((day, idx) => (
            <Card
              key={day}
              className={cn(
                "rounded-[24px] border transition-all relative overflow-hidden group",
                idx === 1
                  ? "bg-primary text-white border-primary shadow-xl ring-4 ring-primary/10"
                  : "bg-white border-border/20 hover:border-primary/30",
                idx >= 2 ? "hidden sm:block" : "", // Show at least 2 on mobile
                idx >= 3 ? "hidden md:block" : "", // Show all on md+
              )}
            >
              <CardContent className="p-4 sm:p-5 pt-6">
                {idx === 1 && (
                  <div className="absolute top-2 right-4 text-[7px] font-black tracking-widest opacity-60">
                    TODAY
                  </div>
                )}
                <p
                  className={cn(
                    "text-[10px] font-black tracking-[0.2em] mb-4",
                    idx === 1 ? "text-white/60" : "text-muted-foreground",
                  )}
                >
                  {day}
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-black leading-tight">
                    {idx === 4
                      ? "Maintenance"
                      : idx % 2 === 0
                        ? "North Campus"
                        : "South Side"}
                  </p>
                  <p
                    className={cn(
                      "text-[9px] font-bold uppercase",
                      idx === 1 ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {idx === 4 ? "Garage" : "Route R-01"}
                  </p>
                </div>
                <div
                  className={cn(
                    "mt-4 pt-4 border-t",
                    idx === 1 ? "border-white/10" : "border-border/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 opacity-60" />
                    <span className="text-[9px] font-black uppercase">
                      07:30 AM
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Live Timeline */}
          <Card className="lg:col-span-7 rounded-[24px] md:rounded-[40px] border-none shadow-xl bg-white">
            <CardHeader className="p-6 md:p-8 border-b border-border/30">
              <CardTitle className="text-xl font-black text-[#3A2C2B]">
                Trip Timeline
              </CardTitle>
              <CardDescription>
                Follow the assigned stops and times
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <div className="space-y-0 relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/40" />
                {driverRoute.stops.map((stop: any, i: number) => (
                  <div
                    key={i}
                    className="flex gap-6 md:gap-10 items-start pb-10 md:pb-12 last:pb-0 relative group"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-500",
                        stop.status === "Reached"
                          ? "bg-brand-green text-white shadow-lg shadow-brand-green/20"
                          : stop.status === "On-going"
                            ? "bg-white border-4 border-brand-orange text-brand-orange animate-pulse scale-110 md:scale-125 shadow-xl"
                            : "bg-white border-2 border-border/40 text-muted-foreground",
                      )}
                    >
                      {stop.status === "Reached" ? (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={cn(
                            "text-lg font-black",
                            stop.status === "On-going" && "text-brand-orange",
                          )}
                        >
                          {stop.name}
                        </h4>
                        <Badge
                          variant={
                            stop.status === "Reached"
                              ? "brand-green"
                              : stop.status === "On-going"
                                ? "brand-orange"
                                : "outline"
                          }
                          className="text-[10px] px-2 py-0.5"
                        >
                          {stop.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-bold">
                        {stop.address}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          Sch: {stop.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          {stop.students} Pickups
                        </div>
                      </div>
                      {stop.status === "On-going" && (
                        <div className="mt-6 flex gap-2">
                          <Button className="h-9 rounded-xl bg-brand-green text-white text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-brand-green/20">
                            Mark Reached
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest px-6"
                          >
                            Nav
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card className="lg:col-span-5 rounded-[40px] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-border/30 bg-soft-parchment/30">
              <CardTitle className="text-xl font-black text-[#3A2C2B]">
                Manifest: Route R-01
              </CardTitle>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Student attendance for this trip
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 space-y-3">
                {driverRoute.students?.map((student: any) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-2xl bg-white border border-border/40 hover:bg-secondary/5 transition-all flex flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-xs shrink-0">
                        {student.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate">
                          {student.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">
                          {student.grade} • {student.stop}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        student.status === "Boarded"
                          ? "brand-green"
                          : student.status === "Absent"
                            ? "destructive"
                            : "outline"
                      }
                      className="text-[8px] font-black px-2 py-0.5 cursor-pointer shrink-0"
                    >
                      {student.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="p-8 border-t border-border/30">
                <Button className="w-full h-12 rounded-2xl bg-secondary text-primary font-black uppercase tracking-widest text-[10px] hover:bg-secondary/80">
                  SYNC ATTENDANCE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="rounded-[32px] border-none shadow-xl bg-soft-clay border-l-8 border-destructive">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-white rounded-2xl text-destructive shadow-sm shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-destructive">
                  Emergency SOS
                </h4>
                <p className="text-sm font-medium text-destructive/70 italic">
                  Notify transport manager immediately.
                </p>
              </div>
            </div>
            <Button className="w-full md:w-auto h-12 px-8 rounded-xl bg-destructive text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-destructive/20 animate-pulse">
              TRIGGER SOS
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- VEHICLE MANAGEMENT VIEW ---

  const VehicleMgmtView = () => {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            className="w-10 h-10 p-0 rounded-xl hover:bg-white"
            onClick={() => setView("DASHBOARD")}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <h1 className="text-3xl font-black text-[#3A2C2B]">Fleet Management</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            icon={Bus}
            label="Total Fleet"
            value={VEHICLES.length}
            color="bg-primary"
          />
          <StatsCard
            icon={CheckCircle2}
            label="Ready to Use"
            value={VEHICLES.filter((v) => v.status === "Active").length}
            color="bg-brand-green"
          />
          <StatsCard
            icon={Wrench}
            label="In Maintenance"
            value={VEHICLES.filter((v) => v.status === "Maintenance").length}
            color="bg-brand-orange"
          />
          <StatsCard
            icon={Fuel}
            label="Avg Fuel Level"
            value="68%"
            color="bg-brand-purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
              <h3 className="text-xl font-black">Vehicle Registry</h3>
              <div className="flex items-center gap-3 flex-wrap md:flex-nowrap w-full md:w-auto mt-4 md:mt-0">
                <div className="flex bg-[#3A2C2B]/5 p-1 rounded-xl shrink-0">
                  <button onClick={() => setVehicleRegistryView('card')} className={cn("p-2 rounded-lg transition-all", vehicleRegistryView === 'card' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}><LayoutGrid className="w-4 h-4" /></button>
                  <button onClick={() => setVehicleRegistryView('table')} className={cn("p-2 rounded-lg transition-all", vehicleRegistryView === 'table' ? "bg-white text-[#3A2C2B] shadow-sm" : "text-[#3A2C2B]/60 hover:text-[#3A2C2B]")}><List className="w-4 h-4" /></button>
                </div>
                <div className="w-full md:w-40 flex-1 md:flex-none">
                  <Select
                    value={vrDriverFilter}
                    onChange={setVrDriverFilter}
                    options={[{ label: 'All Drivers', value: 'All' }, ...Array.from(new Set(VEHICLES.map(v => v.driver))).map(d => ({ label: d, value: d }))]}
                    className="h-10 bg-white border border-[#3A2C2B]/10 rounded-xl text-[10px] font-black w-full"
                  />
                </div>
                <div className="w-full md:w-40 flex-1 md:flex-none">
                  <Select
                    value={vrVehicleFilter}
                    onChange={setVrVehicleFilter}
                    options={[{ label: 'All Vehicles', value: 'All' }, ...VEHICLES.map(v => ({ label: v.number, value: v.number }))]}
                    className="h-10 bg-white border border-[#3A2C2B]/10 rounded-xl text-[10px] font-black w-full"
                  />
                </div>
                <Button
                  className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 w-full md:w-auto shrink-0 mt-2 md:mt-0"
                  onClick={() => {
                    setVehicleModalMode("ADD");
                    setEditVehicleData(null);
                    setShowVehicleModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                </Button>
              </div>
            </div>
            {(() => {
              const filteredVehicles = VEHICLES.filter(v => (vrDriverFilter === 'All' || v.driver === vrDriverFilter) && (vrVehicleFilter === 'All' || v.number === vrVehicleFilter));
              return vehicleRegistryView === 'table' ? (
            <div className="rounded-[40px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden max-h-[600px]">
              <div className="overflow-x-auto no-scrollbar h-full flex flex-col">
                <div className="min-w-[900px] flex flex-col h-full">
                  {/* Fixed Header */}
                  <div className="bg-[#C37A67] border-b border-border/20 shrink-0">
                    <table className="w-full text-left table-fixed">
                  <thead>
                    <tr>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Vehicle Number
                      </th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Model
                      </th>
                      <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Assigned Driver
                      </th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Capacity
                      </th>
                      <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Fuel
                      </th>
                      <th className="w-[10%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Status
                      </th>
                      <th className="w-[10%] px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody>
                    {filteredVehicles.length === 0 ? <tr><td colSpan={7} className="text-center py-20 text-muted-foreground">No vehicles match filters</td></tr> : filteredVehicles.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-border/10 last:border-0 hover:bg-secondary/5 transition-colors group"
                      >
                        <td className="w-[15%] px-8 py-5 font-black text-sm text-primary">
                          {v.number}
                        </td>
                        <td className="w-[15%] px-8 py-5 text-sm font-bold text-muted-foreground">
                          {v.model}
                        </td>
                        <td className="w-[20%] px-8 py-5">
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setShowDriverModal(true)}
                          >
                            <User className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{v.driver}</span>
                          </div>
                        </td>
                        <td className="w-[15%] px-8 py-5 text-sm font-bold text-muted-foreground">
                          {v.capacity} Seater
                        </td>
                        <td className="w-[15%] px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full",
                                  parseInt(v.fuel) < 30
                                    ? "bg-destructive"
                                    : "bg-brand-green",
                                )}
                                style={{ width: v.fuel }}
                              />
                            </div>
                            <span className="text-[10px] font-black uppercase">
                              {v.fuel}
                            </span>
                          </div>
                        </td>
                        <td className="w-[10%] px-8 py-5">
                          <Badge
                            variant={
                              v.maintenance === "Healthy"
                                ? "brand-green"
                                : v.maintenance === "Critical"
                                  ? "destructive"
                                  : "brand-orange"
                            }
                            className="text-[9px] px-2 py-0.5 font-black uppercase"
                          >
                            {v.maintenance}
                          </Badge>
                        </td>
                        <td className="w-[10%] px-8 py-5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0 rounded-lg text-primary hover:bg-primary/5"
                              onClick={() => {
                                setVehicleModalMode("EDIT");
                                setEditVehicleData(v);
                                setShowVehicleModal(true);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-3.5 h-3.5" />
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
            </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 overflow-x-auto snap-x no-scrollbar pb-4">
                  {filteredVehicles.length === 0 ? (
                    <div className="py-12 text-center w-full bg-white/40 rounded-[24px] border border-dashed border-border min-w-[280px]">
                      <p className="text-sm font-black text-[#3A2C2B]">No Vehicles Found</p>
                    </div>
                  ) : filteredVehicles.map((v) => (
                    <div key={v.id} className={cn("p-4 rounded-3xl shadow-sm relative overflow-hidden min-w-[280px] snap-center shrink-0 border border-black/5", 
                      v.maintenance === 'Healthy' ? "bg-[#88AC88] text-white" : 
                      v.maintenance === 'Critical' ? "bg-[#3A2C2B] text-white" : 
                      "bg-[#F0E0AD] text-[#3A2C2B]"
                    )}>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md", v.maintenance === 'Due Soon' ? "bg-black/10" : "bg-white/20")}><Bus className="w-5 h-5" /></div>
                          <Badge className={cn("border-none rounded-lg text-[10px] font-black uppercase px-2 py-1", v.maintenance === 'Due Soon' ? "bg-black/10 text-current" : "bg-white/20 text-white")}>{v.number}</Badge>
                        </div>
                        <Badge className={cn("border-none rounded-lg text-[9px] font-black uppercase", v.maintenance === 'Due Soon' ? "bg-black/10 text-current" : "bg-white/20 text-white")}>{v.maintenance}</Badge>
                      </div>
                      <div className="relative z-10 space-y-1 mb-4">
                        <p className="text-lg font-black truncate">{v.model}</p>
                        <p className="text-xs font-bold uppercase opacity-80">{v.capacity} Seater</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-current/20 relative z-10 grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Driver</span>
                          <span className="text-sm font-black truncate mt-0.5">{v.driver}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-black uppercase opacity-70 tracking-widest">Fuel</span>
                          <span className="text-sm font-black tabular-nums mt-0.5">{v.fuel}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Showing <span className="text-[#3A2C2B]">{filteredVehicles.length}</span> of <span className="text-[#3A2C2B]">{VEHICLES.length}</span>
                  </span>
                </div>
              </div>
            );
            })()}
          </div>
        </div>
      </div>
    );
  };

  // --- ROUTE DETAILS VIEW (ADMIN) ---

  const RouteDetailsView = () => {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <Button
            variant="ghost"
            className="w-9 h-9 md:w-10 md:h-10 p-0 rounded-xl hover:bg-white shrink-0"
            onClick={() => setView("DASHBOARD")}
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Button>
          <h1 className="text-xl md:text-3xl font-black text-[#3A2C2B] leading-tight">
            {selectedRoute?.name}{" "}
            <span className="text-muted-foreground font-bold text-sm md:text-2xl">
              ({selectedRoute?.id})
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Route Snapshot */}
          <Card className="lg:col-span-8 rounded-[40px] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="p-6 md:p-8 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-soft-parchment/30">
              <div>
                <CardTitle className="text-lg md:text-xl font-black">
                  Live Timeline
                </CardTitle>
                <p className="text-[10px] md:text-xs text-muted-foreground font-bold mt-1">
                  Current trip adherence and stop-by-stop metrics
                </p>
              </div>
              {selectedRoute?.status === "DELAYED" && (
                <div className="flex items-center gap-2 md:gap-3 bg-destructive/10 text-destructive px-3 md:px-4 py-2 rounded-xl border border-destructive/20 w-fit">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                    Delayed {selectedRoute.delay}m
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <div className="space-y-0 relative">
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-border/20 rounded-full" />
                {selectedRoute?.stops.map((stop: any, i: number) => (
                  <div
                    key={i}
                    className="flex gap-6 md:gap-12 items-start pb-10 md:pb-12 last:pb-0 relative group"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-500",
                        stop.status === "Reached"
                          ? "bg-brand-green text-white shadow-lg"
                          : stop.status === "On-going"
                            ? "bg-white border-4 border-brand-orange text-brand-orange scale-110 md:scale-125 shadow-xl"
                            : "bg-white border-2 border-border/40 text-muted-foreground",
                      )}
                    >
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xl font-black">{stop.name}</h4>
                        <p className="text-[10px] font-black uppercase text-muted-foreground">
                          {stop.time}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mb-3">
                        {stop.address}
                      </p>
                      <div className="flex gap-3">
                        <Badge
                          variant="outline"
                          className="text-[8px] border-border/40 font-bold uppercase"
                        >
                          {stop.students} Students
                        </Badge>
                        <Badge
                          variant={
                            stop.status === "Reached" ? "brand-green" : "outline"
                          }
                          className="text-[8px] font-bold uppercase"
                        >
                          {stop.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar: Driver & Vehicle */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[40px] border-none shadow-xl bg-white overflow-hidden border-t-8 border-primary">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black">
                    Fleet Units
                  </CardTitle>
                  <Badge variant="brand-green" className="text-[8px] uppercase">
                    {selectedRoute?.status || "Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                {/* Multiple Vehicles Support */}
                {(
                  selectedRoute?.fleet || [
                    {
                      driver: selectedRoute?.driver,
                      vehicle: selectedRoute?.vehicle,
                      status: "Active",
                    },
                  ]
                ).map((unit: any, idx: number) => (
                  <div
                    key={idx}
                    className="space-y-4 pt-4 first:pt-0 border-t border-border/20 first:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className="text-[7px] font-black uppercase tracking-widest px-2 py-0"
                      >
                        Unit {idx + 1}
                      </Badge>
                      <Badge
                        variant="brand-green"
                        className="text-[7px] uppercase tracking-widest"
                      >
                        {unit.status}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/10 flex items-center gap-4 relative group">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] font-black uppercase text-muted-foreground">
                          Driver
                        </p>
                        <p className="text-sm font-black">{unit.driver}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/10 flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <Bus className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] font-black uppercase text-muted-foreground">
                          Vehicle
                        </p>
                        <p className="text-sm font-black">{unit.vehicle}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  className="w-full h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-4"
                  onClick={() => {
                    setAssignDriver(selectedRoute?.driver);
                    setAssignVehicle(selectedRoute?.vehicle);
                    setShowAssignEditModal(true);
                  }}
                >
                  MANAGE FLEET UNITS
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Student List (Full Width) */}
          <div className="lg:col-span-12 space-y-6">
            <div className="flex flex-row items-center justify-between px-2">
              <div>
                <h3 className="text-xl font-black">Passenger Manifest</h3>
                <p className="text-xs text-muted-foreground font-bold mt-1">
                  List of students assigned to {selectedRoute?.name}
                </p>
              </div>
              <Badge
                variant="outline"
                className="rounded-xl px-4 py-1.5 font-black uppercase text-[10px] tracking-widest"
              >
                Total: {selectedRoute?.students?.length || 0} Students
              </Badge>
            </div>
            <div className="rounded-[40px] border border-[#3A2C2B]/20 bg-white/80 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden max-h-[400px]">
              <div className="overflow-x-auto no-scrollbar h-full flex flex-col">
                <div className="min-w-[700px] flex flex-col h-full">
                  {/* Fixed Header */}
                  <div className="bg-[#C37A67] border-b border-border/20 shrink-0">
                    <table className="w-full text-left table-fixed">
                  <thead>
                    <tr>
                      <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Student Name
                      </th>
                      <th className="w-[20%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Class
                      </th>
                      <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white">
                        Pickup Point
                      </th>
                      <th className="w-[20%] px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left table-fixed">
                  <tbody>
                    {selectedRoute?.students?.map((student: any) => (
                      <tr
                        key={student.id}
                        className="border-b border-border/10 last:border-0 hover:bg-secondary/5 transition-colors group"
                      >
                        <td className="w-[30%] px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary">
                              {student.name[0]}
                            </div>
                            <span className="text-sm font-black group-hover:text-primary transition-colors">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="w-[20%] px-8 py-5 text-sm font-bold text-muted-foreground">
                          {student.grade}
                        </td>
                        <td className="w-[30%] px-8 py-5 text-sm font-bold text-muted-foreground">
                          {student.stop}
                        </td>
                        <td className="w-[20%] px-8 py-5 text-right">
                          <Badge
                            variant={
                              student.status === "Boarded"
                                ? "brand-green"
                                : student.status === "Absent"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="text-[9px] px-3 py-1 font-black uppercase"
                          >
                            {student.status}
                          </Badge>
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
        </div>
      </div>
    );
  };

  // --- MAIN RENDER LOGIC ---

  const renderContent = () => {
    if (isDriver) return <DriverDashboard />;

    switch (view) {
      case "ROUTE_DETAILS":
        return <RouteDetailsView />;
      case "VEHICLE_MGMT":
        return <VehicleMgmtView />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
            <span>Operations</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Transport Management</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#3A2C2B] mb-1 md:mb-2">
            {isDriver ? "My Transit Dashboard" : "Transport Command Center"}
          </h1>
          <p className="text-muted-foreground font-medium italic">
            {isDriver
              ? `Logged in as ${user?.name || "Driver Wilson"}`
              : "Monitor real-time school transit, fleet health and route efficiency."}
          </p>
        </div>

        {isAdmin && view === "DASHBOARD" && (
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              className="rounded-xl border-border/50 bg-white shadow-sm font-bold text-xs gap-2"
              onClick={() => setShowRouteModal(true)}
            >
              <Plus className="w-4 h-4" /> Add Route
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border/50 bg-white shadow-sm font-bold text-xs gap-2"
              onClick={() => setShowDriverModal(true)}
            >
              <User className="w-4 h-4" /> Assign Driver
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border/50 bg-white shadow-sm font-bold text-xs gap-2"
              onClick={() => setShowStudentModal(true)}
            >
              <Users className="w-4 h-4" /> Assign Student
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border/50 bg-white shadow-sm font-bold text-xs gap-2"
              onClick={() => {
                setVehicleModalMode("ADD");
                setEditVehicleData(null);
                setShowVehicleModal(true);
              }}
            >
              <Bus className="w-4 h-4" /> Add Vehicle
            </Button>
            <Button className="rounded-xl bg-primary text-white shadow-lg shadow-primary/20 font-bold text-xs gap-2 px-6">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        )}
      </div>

      {renderContent()}

      {/* MODALS */}

      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title={vehicleModalMode === "ADD" ? "Add New Vehicle" : "Edit Vehicle Details"}
      >
        <div key={editVehicleData?.id || 'new'} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Vehicle Number
              </label>
              <Input defaultValue={editVehicleData?.number || ""} placeholder="e.g. BUS-105" className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                License Plate
              </label>
              <Input defaultValue={editVehicleData?.id ? "ABC-1234" : ""} placeholder="e.g. ABC-1234" className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Vehicle Type
              </label>
              <Input defaultValue={editVehicleData?.model || ""} placeholder="e.g. 40-Seater Bus" className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Capacity
              </label>
              <Input type="number" defaultValue={editVehicleData?.capacity || ""} placeholder="40" className="rounded-xl" />
            </div>
          </div>
          <Button
            className="w-full rounded-xl h-12 font-black uppercase text-xs"
            onClick={() => {
              if (vehicleModalMode === "ADD") {
                const newVeh = {
                  id: `v-${Date.now()}`,
                  number: "NEW-BUS",
                  name: "New Bus",
                  status: "Active",
                  model: "40-Seater",
                  capacity: 40,
                  driver: "TBD",
                  lastMaintenance: new Date().toISOString().split('T')[0]
                };
                const updatedVehicles = [...VEHICLES, newVeh];
                _SET_VEHICLES(updatedVehicles);
                setVehicles(updatedVehicles); // save to localStorage
              }
              setShowVehicleModal(false);
            }}
          >
            {vehicleModalMode === "ADD" ? "Register Vehicle" : "Save Changes"}
          </Button>
        </div>
      </Modal>

      {/* Assign Driver Modal */}
      <Modal
        isOpen={showDriverModal}
        onClose={() => setShowDriverModal(false)}
        title="Assign Driver to Vehicle & Route"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Select
              label="Select Driver"
              value={assignDriver}
              onChange={setAssignDriver}
              options={[
                { label: "Robert Wilson", value: "Robert Wilson" },
                { label: "Maria Garcia", value: "Maria Garcia" },
                { label: "John Smith", value: "John Smith" },
                { label: "Alice Johnson", value: "Alice Johnson" },
              ]}
              className="bg-secondary/5 h-12"
            />
            <Select
              label="Select Vehicle"
              value={assignVehicle}
              onChange={setAssignVehicle}
              options={VEHICLES.map((v) => ({
                label: `${v.number} (${v.model})`,
                value: v.number,
              }))}
              className="bg-secondary/5 h-12"
            />
            <Select
              label="Select Route"
              value={assignRoute}
              onChange={setAssignRoute}
              options={ACTIVE_ROUTES.map((r) => ({
                label: r.name,
                value: r.id,
              }))}
              className="bg-secondary/5 h-12"
            />
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <p className="text-[10px] font-bold text-primary uppercase leading-tight">
                This will override any existing assignments for the selected
                vehicle.
              </p>
            </div>
          </div>
          <Button
            className="w-full rounded-xl h-12 font-black uppercase text-xs"
            onClick={() => setShowDriverModal(false)}
          >
            Confirm Assignment
          </Button>
        </div>
      </Modal>

      {/* Assign Student Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title="Assign Students to Bus"
      >
        <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide">
          {/* Filters Bar */}
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Class"
              value={targetClass}
              onChange={setTargetClass}
              options={[
                { label: "All", value: "ALL" },
                { label: "Class 10", value: "10" },
                { label: "Class 11", value: "11" },
                { label: "Class 8", value: "8" },
              ]}
              className="bg-secondary/5"
            />
            <Select
              label="Section"
              value={targetSection}
              onChange={setTargetSection}
              options={[
                { label: "All", value: "ALL" },
                { label: "Sec A", value: "A" },
                { label: "Sec B", value: "B" },
              ]}
              className="bg-secondary/5"
            />
            <Select
              label="Dept"
              value={targetDept}
              onChange={setTargetDept}
              options={[
                { label: "All", value: "ALL" },
                { label: "Science", value: "SCI" },
                { label: "Commerce", value: "COM" },
              ]}
              className="bg-secondary/5"
            />
          </div>

          <div className="h-px bg-border/40" />

          {/* Student List */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-muted-foreground ml-1">
              Students in{" "}
              {targetClass === "ALL" ? "Selected" : `Class ${targetClass}`} List
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                    selectedStudentIds.includes(`S${i}`)
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-secondary/5 border-border/40 hover:bg-secondary/10",
                  )}
                  onClick={() =>
                    setSelectedStudentIds((prev) =>
                      prev.includes(`S${i}`)
                        ? prev.filter((id) => id !== `S${i}`)
                        : [...prev, `S${i}`],
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-[10px]">
                      {i}
                    </div>
                    <div>
                      <p className="text-xs font-black">Student Name {i}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">
                        Roll No: #102{i} • Sec A
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center",
                      selectedStudentIds.includes(`S${i}`)
                        ? "bg-primary border-primary text-white"
                        : "border-border/60 bg-white",
                    )}
                  >
                    {selectedStudentIds.includes(`S${i}`) && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bus Selection & Capacity */}
          <div className="p-5 rounded-[24px] bg-secondary/10 space-y-4">
            <Select
              label="Assign to Vehicle"
              value={assignToVehicle}
              onChange={setAssignToVehicle}
              options={VEHICLES.map((v) => ({
                label: `${v.number} - ${v.route}`,
                value: v.number,
              }))}
              className="bg-white border-none"
            />
            {assignToVehicle && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Current Capacity
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-primary">
                    32 / 40 Seats
                  </span>
                  <div className="w-32 h-1.5 bg-white rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "80%" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            className="w-full rounded-2xl h-12 font-black uppercase text-xs tracking-widest"
            disabled={selectedStudentIds.length === 0 || !assignToVehicle}
            onClick={() => setShowStudentModal(false)}
          >
            Assign {selectedStudentIds.length} Students to Bus
          </Button>
        </div>
      </Modal>

      {/* Create Route Modal */}
      <Modal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        title="Create New Transport Route"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Route Name
              </label>
              <Input
                placeholder="e.g. North Campus Express"
                className="rounded-xl h-12"
              />
            </div>
            <div className="p-4 rounded-2xl bg-secondary/10 space-y-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Route Stops & Schedule
                </h4>
              </div>
              {newRoute.stops.map((_, index) => (
                <div key={index} className="flex gap-3 items-end group">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">
                      {index === 0
                        ? "Pickup Location"
                        : index === newRoute.stops.length - 1
                          ? "Drop Location"
                          : `Stop ${index + 1}`}
                    </label>
                    <Input
                      placeholder="Enter address..."
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">
                      Time
                    </label>
                    <Input type="time" className="rounded-xl h-10 text-xs" />
                  </div>
                  {newRoute.stops.length > 1 && (
                    <button
                      onClick={() => removeStop(index)}
                      className="h-10 w-10 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full border-2 border-dashed border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest h-10 hover:bg-primary/5"
                onClick={addStop}
              >
                <Plus className="w-3 h-3 mr-2" /> Add Intermediate Stop
              </Button>
            </div>
          </div>
          <Button
            className="w-full rounded-xl h-12 font-black uppercase text-xs"
            onClick={() => {
              const updatedRoutes = [...ACTIVE_ROUTES, { id: `r-${Date.now()}`, ...newRoute }];
              _SET_ACTIVE_ROUTES(updatedRoutes);
              setActiveRoutes(updatedRoutes);
              setShowRouteModal(false);
            }}
          >
            Save Route Configuration
          </Button>
        </div>
      </Modal>

      {/* Delay Modal */}
      <Modal
        isOpen={showDelayModal}
        onClose={() => setShowDelayModal(false)}
        title="Report Route Delay"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
              Estimated Delay (Minutes)
            </label>
            <Input type="number" placeholder="15" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
              Reason for Delay
            </label>
            <Input
              placeholder="e.g. Traffic, Weather, Engine Check"
              className="rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 p-3 bg-brand-orange/10 rounded-xl border border-brand-orange/20">
            <Bell className="w-4 h-4 text-brand-orange" />
            <p className="text-[10px] font-bold text-brand-orange">
              Sending notification to 42 parents on this route.
            </p>
          </div>
          <Button
            className="w-full rounded-xl h-12 bg-brand-orange text-white font-black uppercase text-xs"
            onClick={() => setShowDelayModal(false)}
          >
            Broadcast Delay Notification
          </Button>
        </div>
      </Modal>

      {/* Modify Assignment Modal */}
      <Modal
        isOpen={showAssignEditModal}
        onClose={() => setShowAssignEditModal(false)}
        title={`Edit Assignments: ${selectedRoute?.name}`}
      >
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-secondary/10 rounded-2xl">
            <button
              onClick={() => setAssignmentMode("EDIT")}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                assignmentMode === "EDIT"
                  ? "bg-white shadow-md text-primary"
                  : "text-muted-foreground hover:bg-white/50",
              )}
            >
              Update Primary
            </button>
            <button
              onClick={() => setAssignmentMode("ADD")}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                assignmentMode === "ADD"
                  ? "bg-white shadow-md text-primary"
                  : "text-muted-foreground hover:bg-white/50",
              )}
            >
              Add New Unit
            </button>
          </div>

          <div className="space-y-4">
            <Select
              label={
                assignmentMode === "ADD"
                  ? "Select Driver for Unit 2"
                  : "Update Primary Driver"
              }
              value={assignDriver}
              onChange={setAssignDriver}
              options={[
                { label: "Robert Wilson (On Route)", value: "Robert Wilson" },
                { label: "Maria Garcia (Available)", value: "Maria Garcia" },
                { label: "John Smith (On Maintenance)", value: "John Smith" },
                { label: "Alice Johnson (Available)", value: "Alice Johnson" },
              ]}
              className="bg-secondary/5"
            />
            <Select
              label={
                assignmentMode === "ADD"
                  ? "Select Vehicle for Unit 2"
                  : "Update Primary Vehicle"
              }
              value={assignVehicle}
              onChange={setAssignVehicle}
              options={VEHICLES.map((v) => ({
                label: `${v.number} - ${v.status === "Active" ? "On Route" : "Ready"}`,
                value: v.number,
              }))}
              className="bg-secondary/5"
            />
          </div>

          <div className="bg-soft-parchment p-5 rounded-2xl border border-border/40 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Execution Strategy
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAssignType("NOW")}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all",
                  assignType === "NOW"
                    ? "bg-primary text-white border-primary shadow-lg"
                    : "bg-white border-border/50 hover:bg-secondary/5",
                )}
              >
                <p className="text-xs font-black">Deploy Now</p>
                <p className="text-[8px] uppercase opacity-70 mt-1">
                  Immediate
                </p>
              </button>
              <button
                onClick={() => setAssignType("NEXT_SHIFT")}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all",
                  assignType === "NEXT_SHIFT"
                    ? "bg-primary text-white border-primary shadow-lg"
                    : "bg-white border-border/50 hover:bg-secondary/5",
                )}
              >
                <p className="text-xs font-black">Next Trip</p>
                <p className="text-[8px] uppercase opacity-70 mt-1">
                  Scheduled
                </p>
              </button>
            </div>
          </div>

          {assignVehicle &&
            VEHICLES.find((v) => v.number === assignVehicle) && (
              <div className="space-y-3">
                {VEHICLES.find((v) => v.number === assignVehicle)?.status ===
                  "Active" ? (
                  <div className="p-4 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex gap-3 animate-in slide-in-from-top-2">
                    <Clock className="w-5 h-5 text-brand-orange shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-brand-orange uppercase leading-tight">
                        Fleet Conflict
                      </p>
                      <p className="text-[9px] font-bold text-brand-orange/80 mt-1">
                        This vehicle is currently assigned to{" "}
                        <span className="font-black underline">
                          {
                            VEHICLES.find((v) => v.number === assignVehicle)
                              ?.route
                          }
                        </span>
                        .
                        {assignmentMode === "ADD"
                          ? " Adding it here will pull it from its current route."
                          : " Reassigning it will leave that route empty."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-brand-green/10 border border-brand-green/20 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0" />
                    <p className="text-[10px] font-bold text-brand-green uppercase leading-tight">
                      Fleet Unit Ready for Deployment
                    </p>
                  </div>
                )}
              </div>
            )}

          <Button
            className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
            onClick={() => setShowAssignEditModal(false)}
          >
            {assignmentMode === "ADD"
              ? `Deploy Additional Unit to ${selectedRoute?.id}`
              : "Update Primary Fleet Unit"}
          </Button>
        </div>
      </Modal>
      {/* Driver Weekly Scheduling Modal */}
      <Modal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        title="Schedule Driver Weekdays"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
              Select Driver to Schedule
            </label>
            <Select
              value=""
              onChange={() => { }}
              options={VEHICLES.map((v) => ({
                label: v.driver,
                value: v.driver,
              }))}
              className="bg-secondary/10 h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
              (day) => (
                <div
                  key={day}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/5 border border-border/20"
                >
                  <div className="w-24 shrink-0">
                    <span className="text-xs font-black uppercase tracking-wider">
                      {day}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={selectedRoute?.id}
                      onChange={() => { }}
                      options={ACTIVE_ROUTES.map((r) => ({
                        label: r.name,
                        value: r.id,
                      }))}
                      className="bg-white text-xs h-10"
                    />
                  </div>
                </div>
              ),
            )}
          </div>
          <Button
            className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
            onClick={() => setShowRosterModal(false)}
          >
            Save Driver Schedule
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TransportPage;
