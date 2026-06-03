import { useEffect, useState } from 'react';
import { getUsers } from '../mock/users';
import { getStorageData, setStorageData } from '../lib/storage';

export type LeaveStatus = 'Approved' | 'Pending' | 'Rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'Casual' | 'Sick Leave' | 'Earned Leave';
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

const LEAVES_STORAGE_KEY = 'school_leave_requests';

// Initial mock data
const INITIAL_LEAVES: LeaveRequest[] = [
  { id: '1', userId: '12', type: 'Sick Leave', startDate: '2026-10-12', endDate: '2026-10-14', reason: 'Fever', status: 'Approved', appliedOn: '2026-10-10' },
  { id: '2', userId: '5', type: 'Casual', startDate: '2026-11-01', endDate: '2026-11-02', reason: 'Personal work', status: 'Pending', appliedOn: '2026-10-25' },
];

export const useLeaveManagement = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => getStorageData(LEAVES_STORAGE_KEY, INITIAL_LEAVES));

  useEffect(() => {
    setStorageData(LEAVES_STORAGE_KEY, leaves);
  }, [leaves]);

  const applyLeave = (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const newLeave: LeaveRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    setLeaves(prev => [newLeave, ...prev]);
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const getLeavesForUser = (userId: string) => {
    return leaves.filter(l => l.userId === userId);
  };

  const getAllLeaves = () => {
    return leaves.map(leave => {
      const user = getUsers().find(u => u.id === leave.userId);
      return {
        ...leave,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'Unknown',
        userDept: user?.metadata?.departmentId || 'Unassigned',
      };
    });
  };

  return {
    leaves,
    applyLeave,
    updateLeaveStatus,
    getLeavesForUser,
    getAllLeaves
  };
};
