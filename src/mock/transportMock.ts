import { Bus, User, MapPin, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

import { getStorageData, setStorageData } from '../lib/storage';

export const TRANSPORT_KPIS = [
  { label: 'Total Vehicles', value: '24', trend: '+2', icon: Bus, color: 'bg-primary' },
  { label: 'Active Routes', value: '18', trend: 'Stable', icon: MapPin, color: 'bg-brand-orange' },
  { label: 'Assigned Drivers', value: '22', trend: '+1', icon: User, color: 'bg-brand-purple' },
  { label: 'Students Using Transport', value: '840', trend: '+12', icon: User, color: 'bg-brand-green' },
  { label: 'Delayed Trips Today', value: '3', trend: 'Critical', icon: Clock, color: 'bg-brand-orange' },
  { label: 'Vehicles Under Maintenance', value: '2', trend: '-1', icon: AlertTriangle, color: 'bg-oat' },
  { label: 'Route Completion Rate', value: '94%', trend: '+2.4%', icon: CheckCircle2, color: 'bg-brand-green' },
  { label: 'Emergency Alerts', value: '1', trend: 'Recent', icon: AlertTriangle, color: 'bg-primary' },
];

const DEFAULT_ROUTE_STOPS = [
  { id: 'S1', name: 'Oakwood Heights', address: '123 Oak St, Sector 4', time: '07:15 AM', students: 8, status: 'Reached' },
  { id: 'S2', name: 'Maple Avenue', address: '456 Maple Rd, Sector 7', time: '07:30 AM', students: 12, status: 'On-going' },
  { id: 'S3', name: 'Downtown Station', address: 'Central Plaza, Main St', time: '07:45 AM', students: 15, status: 'Upcoming' },
  { id: 'S4', name: 'Pine Avenue', address: '789 Pine Dr, West End', time: '08:00 AM', students: 10, status: 'Upcoming' },
  { id: 'S5', name: 'School Main Gate', address: 'Campus Main Road', time: '08:15 AM', students: 0, status: 'Upcoming' },
];

const DEFAULT_STUDENTS_BY_ROUTE = {
  'R-01': [
    { id: 'ST001', name: 'Sarah Jenkins', grade: 'Class 4-A', stop: 'Oakwood Heights', status: 'Boarded' },
    { id: 'ST002', name: 'Michael Chen', grade: 'Class 11-B', stop: 'Maple Avenue', status: 'Pending' },
    { id: 'ST003', name: 'Emily Wilson', grade: 'Class 8-C', stop: 'Downtown Station', status: 'Absent' },
    { id: 'ST004', name: 'Robert Taylor', grade: 'Class 6-A', stop: 'Oakwood Heights', status: 'Boarded' },
    { id: 'ST005', name: 'Linda Adams', grade: 'Class 5-B', stop: 'Maple Avenue', status: 'Pending' },
  ]
};

const DEFAULT_ACTIVE_ROUTES = [
  {
    id: 'R-01',
    name: 'North Campus Express',
    vehicle: 'BUS-102',
    driver: 'Robert Wilson',
    fleet: [
      { vehicle: 'BUS-102', driver: 'Robert Wilson', status: 'Active' },
      { vehicle: 'BUS-085', driver: 'Maria Garcia', status: 'Active' }
    ],
    progress: 75,
    status: 'ON_ROUTE',
    delay: 5,
    delayReason: 'Traffic at Sector 4 intersection',
    nextStop: 'Oak Street',
    eta: '08:15 AM',
    stops: DEFAULT_ROUTE_STOPS,
    students: DEFAULT_STUDENTS_BY_ROUTE['R-01']
  },
  {
    id: 'R-02',
    name: 'South Side Shuttle',
    vehicle: 'BUS-085',
    driver: 'Maria Garcia',
    progress: 40,
    status: 'DELAYED',
    delay: 15,
    delayReason: 'Engine check required',
    nextStop: 'Pine Avenue',
    eta: '08:30 AM',
    stops: DEFAULT_ROUTE_STOPS,
    students: []
  },
  {
    id: 'R-03',
    name: 'East Wing Primary',
    vehicle: 'BUS-114',
    driver: 'John Smith',
    progress: 100,
    status: 'COMPLETED',
    delay: 0,
    nextStop: 'School Main Gate',
    eta: '07:55 AM',
    stops: DEFAULT_ROUTE_STOPS,
    students: []
  }
];

const DEFAULT_VEHICLES = [
  { id: 'V-101', number: 'BUS-101', model: 'Volvo 40S', driver: 'Alice Johnson', route: 'Downtown A', capacity: 40, status: 'Active', maintenance: 'Healthy', fuel: '85%' },
  { id: 'V-102', number: 'BUS-102', model: 'Tata Marcopolo', driver: 'Robert Wilson', route: 'North Campus', capacity: 35, status: 'Active', maintenance: 'Due Soon', fuel: '40%' },
  { id: 'V-103', number: 'VAN-05', model: 'Force Traveller', driver: 'Michael Chen', route: 'Special Needs B', capacity: 12, status: 'Maintenance', maintenance: 'Critical', fuel: '12%' },
  { id: 'V-104', number: 'BUS-085', model: 'Ashok Leyland', driver: 'Maria Garcia', route: 'South Side', capacity: 40, status: 'Active', maintenance: 'Healthy', fuel: '70%' },
  { id: 'V-105', number: 'BUS-114', model: 'Mercedes-Benz Tourismo', driver: 'John Smith', route: 'East Wing Primary', capacity: 55, status: 'Active', maintenance: 'Healthy', fuel: '92%' },
  { id: 'V-106', number: 'VAN-08', model: 'Toyota Hiace', driver: 'Sarah Khan', route: 'West Gate Shuttle', capacity: 15, status: 'Active', maintenance: 'Due Soon', fuel: '35%' },
  { id: 'V-107', number: 'BUS-092', model: 'Scania Interlink', driver: 'David Miller', route: 'Outer Ring Road', capacity: 50, status: 'Active', maintenance: 'Healthy', fuel: '65%' },
  { id: 'V-108', number: 'BUS-121', model: 'BYD Electric K9', driver: 'Emma Davis', route: 'Green Campus Loop', capacity: 45, status: 'Active', maintenance: 'Healthy', fuel: '88%' },
  { id: 'V-109', number: 'VAN-12', model: 'Ford Transit', driver: 'Chris P. Bacon', route: 'Staff Shuttle 1', capacity: 12, status: 'Maintenance', maintenance: 'Critical', fuel: '05%' },
  { id: 'V-110', number: 'BUS-077', model: 'Man Lion City', driver: 'Sam Sung', route: 'City Center Hub', capacity: 60, status: 'Active', maintenance: 'Healthy', fuel: '50%' },
  { id: 'V-111', number: 'BUS-130', model: 'Irizar i6', driver: 'Peter Parker', route: 'Queens Blvd', capacity: 48, status: 'Active', maintenance: 'Healthy', fuel: '72%' },
  { id: 'V-112', number: 'VAN-15', model: 'Mercedes Sprinter', driver: 'Bruce Wayne', route: 'Gotham Heights', capacity: 14, status: 'Active', maintenance: 'Healthy', fuel: '95%' },
  { id: 'V-113', number: 'BUS-045', model: 'King Long XMQ', driver: 'Clark Kent', route: 'Metropolis Core', capacity: 52, status: 'Active', maintenance: 'Healthy', fuel: '68%' },
  { id: 'V-114', number: 'BUS-152', model: 'Alexander Dennis', driver: 'Diana Prince', route: 'Themyscira Lane', capacity: 40, status: 'Active', maintenance: 'Healthy', fuel: '81%' },
  { id: 'V-115', number: 'VAN-22', model: 'Volkswagen Crafter', driver: 'Barry Allen', route: 'Central City Dash', capacity: 12, status: 'Active', maintenance: 'Due Soon', fuel: '20%' },
  { id: 'V-116', number: 'BUS-033', model: 'Solaris Urbino', driver: 'Arthur Curry', route: 'Bay Area Loop', capacity: 45, status: 'Active', maintenance: 'Healthy', fuel: '77%' },
  { id: 'V-117', number: 'BUS-108', model: 'Higer KLQ', driver: 'Hal Jordan', route: 'Sector 2814', capacity: 50, status: 'Maintenance', maintenance: 'Critical', fuel: '02%' },
  { id: 'V-118', number: 'VAN-09', model: 'Nissan NV350', driver: 'Tony Stark', route: 'Malibu Coast', capacity: 10, status: 'Active', maintenance: 'Healthy', fuel: '100%' },
  { id: 'V-119', number: 'BUS-205', model: 'Setra S 515', driver: 'Steve Rogers', route: 'Brooklyn Express', capacity: 54, status: 'Active', maintenance: 'Healthy', fuel: '60%' },
  { id: 'V-120', number: 'BUS-119', model: 'Temsa HD', driver: 'Natasha Romanoff', route: 'Red Room Way', capacity: 35, status: 'Active', maintenance: 'Healthy', fuel: '89%' },
];

const DEFAULT_TRANSPORT_LOGS = [
  { id: 'LOG-4421', route: 'North Express', vehicle: 'BUS-102', driver: 'R. Wilson', studentCount: 32, pickup: 'Completed', drop: 'Pending', delay: '5m', time: '08:10 AM' },
  { id: 'LOG-4420', route: 'East Wing', vehicle: 'BUS-114', driver: 'J. Smith', studentCount: 28, pickup: 'Completed', drop: 'Completed', delay: 'None', time: '07:55 AM' },
  { id: 'LOG-4419', route: 'South Side', vehicle: 'BUS-085', driver: 'M. Garcia', studentCount: 35, pickup: 'Delayed', drop: 'Pending', delay: '15m', time: '08:25 AM' },
  { id: 'LOG-4418', route: 'West Gate', vehicle: 'VAN-08', driver: 'S. Khan', studentCount: 10, pickup: 'Completed', drop: 'Completed', delay: 'None', time: '07:45 AM' },
];

const DEFAULT_ALERTS = [
  { id: 'A-1', type: 'BREAKDOWN', route: 'West Gate', msg: 'Engine overheating near Sector 4', severity: 'HIGH', time: '10 mins ago' },
  { id: 'A-2', type: 'DELAY', route: 'South Side', msg: 'Traffic congestion on Highway 9', severity: 'MEDIUM', time: '25 mins ago' },
  { id: 'A-3', type: 'MISSING', student: 'Sarah Jenkins', route: 'North Express', msg: 'Did not board at assigned stop', severity: 'URGENT', time: '5 mins ago' },
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'N-1', target: 'Parents (Route R-01)', msg: 'Bus is 5 mins away from Stop 3', status: 'Sent', read: 85 },
  { id: 'N-2', target: 'Parents (Route R-02)', msg: 'Route delayed by 15 mins due to rain', status: 'Delivered', read: 92 },
  { id: 'N-3', target: 'All Transport Users', msg: 'Monthly maintenance schedule updated', status: 'Pending', read: 0 },
];

export const getRouteStops = () => getStorageData('school_route_stops', DEFAULT_ROUTE_STOPS);
export const setRouteStops = (data: any) => setStorageData('school_route_stops', data);

export const getStudentsByRoute = () => getStorageData('school_students_by_route', DEFAULT_STUDENTS_BY_ROUTE);
export const setStudentsByRoute = (data: any) => setStorageData('school_students_by_route', data);

export const getActiveRoutes = () => getStorageData('school_active_routes', DEFAULT_ACTIVE_ROUTES);
export const setActiveRoutes = (data: any) => setStorageData('school_active_routes', data);

export const getVehicles = () => getStorageData('school_vehicles', DEFAULT_VEHICLES);
export const setVehicles = (data: any) => setStorageData('school_vehicles', data);

export const getTransportLogs = () => getStorageData('school_transport_logs', DEFAULT_TRANSPORT_LOGS);
export const setTransportLogs = (data: any) => setStorageData('school_transport_logs', data);

export const getAlerts = () => getStorageData('school_transport_alerts', DEFAULT_ALERTS);
export const setAlerts = (data: any) => setStorageData('school_transport_alerts', data);

export const getNotifications = () => getStorageData('school_transport_notifications', DEFAULT_NOTIFICATIONS);
export const setNotifications = (data: any) => setStorageData('school_transport_notifications', data);
