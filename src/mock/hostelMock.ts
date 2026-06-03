import { getStorageData, setStorageData } from '../lib/storage';
import { Home, Bed, Users, CheckCircle2, Clock, ShieldAlert, Building } from 'lucide-react';

export const HOSTEL_KPIS = [
  { label: 'Total Hostels', value: '06', trend: '+1 new block', icon: Building, color: 'bg-primary' },
  { label: 'Total Rooms', value: '240', trend: '85% capacity', icon: Home, color: 'bg-brand-blue' },
  { label: 'Occupied Beds', value: '842', trend: '92% occupancy', icon: Bed, color: 'bg-brand-green' },
  { label: 'Available Beds', value: '118', trend: 'Critical: 12', icon: CheckCircle2, color: 'bg-brand-orange' },
  { label: 'Residents', value: '842', trend: 'Students + Staff', icon: Users, color: 'bg-brand-purple' },
  { label: 'Pending Allocations', value: '14', trend: 'Priority: High', icon: Clock, color: 'bg-oat' },
  { label: 'Discipline Alerts', value: '03', trend: 'Last 24 hours', icon: ShieldAlert, color: 'bg-brand-orange' },
];

const DEFAULT_OCCUPANCY_DATA = [
  { id: 'BA', name: 'Boys Block A', occupied: 128, total: 150, gender: 'Male', floors: 4, roomsPerFloor: [12, 10, 8, 8] },
  { id: 'BB', name: 'Boys Block B', occupied: 185, total: 200, gender: 'Male', floors: 5, roomsPerFloor: [15, 12, 10, 10, 8] },
  { id: 'GA', name: 'Girls Block A', occupied: 142, total: 150, gender: 'Female', floors: 3, roomsPerFloor: [12, 10, 12] },
  { id: 'GB', name: 'Girls Block B', occupied: 160, total: 200, gender: 'Female', floors: 4, roomsPerFloor: [15, 15, 10, 10] },
  { id: 'FB', name: 'Faculty Block', occupied: 45, total: 60, gender: 'Mixed', floors: 2, roomsPerFloor: [10, 10] },
  { id: 'GUB', name: 'Guest Block', occupied: 12, total: 30, gender: 'Mixed', floors: 1, roomsPerFloor: [10] }
];

const DEFAULT_ROOMS_DATA = [
  { id: 'A-f1-01', block: 'Boys Block A', type: 'Shared (1S, 1D)', capacity: 3, occupied: 2, warden: 'John Smith', status: 'Available' },
  { id: 'A-f1-02', block: 'Boys Block A', type: 'Single', capacity: 1, occupied: 1, warden: 'John Smith', status: 'Full' },
  { id: 'B-f2-10', block: 'Boys Block B', type: 'Double', capacity: 2, occupied: 0, warden: 'Mike Ross', status: 'Empty' },
  { id: 'G-f1-05', block: 'Girls Block A', type: 'Shared (2D)', capacity: 4, occupied: 3, warden: 'Sarah Jane', status: 'Available' },
  { id: 'A-f1-03', block: 'Boys Block A', type: 'Single', capacity: 1, occupied: 0, warden: 'John Smith', status: 'Empty' },
  { id: 'A-f1-04', block: 'Boys Block A', type: 'Double', capacity: 2, occupied: 2, warden: 'John Smith', status: 'Full' },
  { id: 'B-f2-11', block: 'Boys Block B', type: 'Shared (2S)', capacity: 2, occupied: 1, warden: 'Mike Ross', status: 'Available' },
  { id: 'G-f1-06', block: 'Girls Block A', type: 'Single', capacity: 1, occupied: 1, warden: 'Sarah Jane', status: 'Full' },
  { id: 'A-f1-05', block: 'Boys Block A', type: 'Double', capacity: 2, occupied: 1, warden: 'John Smith', status: 'Available' },
  { id: 'B-f2-12', block: 'Boys Block B', type: 'Single', capacity: 1, occupied: 0, warden: 'Mike Ross', status: 'Empty' },
  { id: 'G-f1-07', block: 'Girls Block A', type: 'Double', capacity: 2, occupied: 2, warden: 'Sarah Jane', status: 'Full' },
  { id: 'A-f1-06', block: 'Boys Block A', type: 'Shared (3S)', capacity: 3, occupied: 2, warden: 'John Smith', status: 'Available' },
  { id: 'B-f2-13', block: 'Boys Block B', type: 'Double', capacity: 2, occupied: 0, warden: 'Mike Ross', status: 'Empty' },
  { id: 'G-f1-08', block: 'Girls Block A', type: 'Single', capacity: 1, occupied: 1, warden: 'Sarah Jane', status: 'Full' },
  { id: 'A-f1-07', block: 'Boys Block A', type: 'Single', capacity: 1, occupied: 0, warden: 'John Smith', status: 'Empty' },
];

const DEFAULT_PENDING_REQUESTS = [
  { id: 'S1', name: 'Alice Johnson', hostelId: 'GA', gender: 'Female', status: 'Pending', floor: '1', roomId: 'R2', bedNum: '1', bedType: 'Single' },
  { id: 'S2', name: 'Diana Prince', hostelId: 'GB', gender: 'Female', status: 'Pending', floor: '2', roomId: 'R1', bedNum: '3', bedType: 'Double' },
  { id: 'S3', name: 'Bob Miller', hostelId: 'BA', gender: 'Male', status: 'Pending', floor: '1', roomId: 'R3', bedNum: '2', bedType: 'Single' }
];

const DEFAULT_RESIDENTS_DATA = [
  { id: 'ST001', name: 'Alice Johnson', hostelId: 'GA', room: 'A-f2-04', floor: '2', bed: '1', joinDate: '2024-01-15', violations: 0 },
  { id: 'ST002', name: 'Bob Miller', hostelId: 'BA', room: 'A-f1-05', floor: '1', bed: '1', joinDate: '2024-02-10', violations: 1 },
  { id: 'ST003', name: 'Charlie Davis', hostelId: 'BA', room: 'A-f3-02', floor: '3', bed: '1', joinDate: '2023-11-05', violations: 2 },
  { id: 'ST004', name: 'Diana Prince', hostelId: 'GB', room: 'B-f1-05', floor: '1', bed: '2', joinDate: '2024-03-20', violations: 0 },
  { id: 'ST005', name: 'Emma Watson', hostelId: 'GA', room: 'A-f2-04', floor: '2', bed: '2', joinDate: '2024-01-20', violations: 1 },
  { id: 'ST006', name: 'Frank Castle', hostelId: 'BA', room: 'A-f1-05', floor: '1', bed: '2', joinDate: '2024-02-15', violations: 0 },
  { id: 'ST007', name: 'George Brown', hostelId: 'BA', room: 'A-f2-10', floor: '2', bed: '1', joinDate: '2024-01-10', violations: 2 },
  { id: 'ST008', name: 'Hannah Lee', hostelId: 'GA', room: 'A-f1-02', floor: '1', bed: '1', joinDate: '2023-12-05', violations: 0 },
  { id: 'ST009', name: 'Ian Wright', hostelId: 'BA', room: 'A-f3-05', floor: '3', bed: '1', joinDate: '2024-03-01', violations: 1 },
  { id: 'ST010', name: 'Julia Roberts', hostelId: 'GB', room: 'B-f2-02', floor: '2', bed: '1', joinDate: '2024-02-20', violations: 0 },
  { id: 'ST011', name: 'Kevin Hart', hostelId: 'BA', room: 'A-f1-12', floor: '1', bed: '1', joinDate: '2024-01-25', violations: 1 },
  { id: 'ST012', name: 'Linda Gray', hostelId: 'GA', room: 'A-f3-01', floor: '3', bed: '1', joinDate: '2023-11-15', violations: 0 },
  { id: 'ST013', name: 'Mike Ross', hostelId: 'BA', room: 'A-f2-01', floor: '2', bed: '1', joinDate: '2024-04-05', violations: 0 },
  { id: 'ST014', name: 'Nina Simone', hostelId: 'GB', room: 'B-f1-08', floor: '1', bed: '1', joinDate: '2024-03-10', violations: 2 },
  { id: 'ST015', name: 'Oscar Wilde', hostelId: 'BA', room: 'A-f3-03', floor: '3', bed: '1', joinDate: '2024-02-05', violations: 1 },
];

const DEFAULT_HOSTEL_NOTICES = [
  { id: '1', title: 'Water Tank Cleaning', content: 'Water supply will be suspended on Saturday from 10 AM to 2 PM.', date: 'May 12, 2026', type: 'Maintenance' },
  { id: '2', title: 'Night Roll Call Timing', content: 'Please ensure you are in your rooms by 9:00 PM for the roll call.', date: 'May 11, 2026', type: 'Rule' },
];

export const getOccupancyData = (): any[] => getStorageData('school_hostel_occupancy', DEFAULT_OCCUPANCY_DATA);
export const setOccupancyData = (data: any) => setStorageData('school_hostel_occupancy', data);

export const getRoomsData = (): any[] => getStorageData('school_hostel_rooms', DEFAULT_ROOMS_DATA);
export const setRoomsData = (data: any) => setStorageData('school_hostel_rooms', data);

export const getPendingRequests = (): any[] => getStorageData('school_hostel_pending_requests', DEFAULT_PENDING_REQUESTS);
export const setPendingRequests = (data: any) => setStorageData('school_hostel_pending_requests', data);

export const getResidentsData = (): any[] => getStorageData('school_hostel_residents', DEFAULT_RESIDENTS_DATA);
export const setResidentsData = (data: any) => setStorageData('school_hostel_residents', data);

export const getHostelNotices = (): any[] => getStorageData('school_hostel_notices', DEFAULT_HOSTEL_NOTICES);
export const setHostelNotices = (data: any) => setStorageData('school_hostel_notices', data);
