import type { CommunicationMessage } from '../types/communication';
import { getStorageData, setStorageData } from '../lib/storage';

const DEFAULT_COMMUNICATIONS: CommunicationMessage[] = [
  {
    id: '1',
    type: 'NOTICE',
    title: 'School Reopening & Safety Protocols',
    content: 'We are excited to welcome students back. Please follow all safety protocols including wearing masks and regular sanitization.',
    senderId: '8',
    senderName: 'Dr. Arthur Pendragon',
    senderRole: 'SCHOOL_ADMIN',
    recipients: ['STUDENT', 'PARENT', 'TEACHER'],
    scope: 'SCHOOL',
    status: 'PUBLISHED',
    createdAt: '2026-05-01T09:00:00Z',
    priority: 'HIGH',
    approvalRequired: false,
    auditTrail: [{ action: 'Created', user: 'Dr. Arthur Pendragon', timestamp: '2026-05-01T08:30:00Z' }]
  },
  {
    id: '2',
    type: 'ASSIGNMENT',
    title: 'Physics Lab Report Submission',
    content: 'Please submit your lab reports for the Optics session by Friday.',
    senderId: '2',
    senderName: 'David Miller',
    senderRole: 'TEACHER',
    recipients: ['STUDENT'],
    scope: 'CLASS',
    status: 'PUBLISHED',
    createdAt: '2026-05-05T14:20:00Z',
    priority: 'MEDIUM',
    approvalRequired: true,
    approvedBy: '12', // HOD Robert Stark
    auditTrail: [
      { action: 'Created', user: 'David Miller', timestamp: '2026-05-05T14:00:00Z' },
      { action: 'Approved', user: 'Robert Stark', timestamp: '2026-05-05T14:15:00Z' }
    ]
  },
  {
    id: '3',
    type: 'FEE_REMINDER',
    title: 'Term 2 Fee Payment Due',
    content: 'The second term fees are due by May 15th. Please ensure payment to avoid late charges.',
    senderId: '5',
    senderName: 'Michael Brown',
    senderRole: 'ACCOUNTANT',
    recipients: ['PARENT'],
    scope: 'ROLE_BASED',
    status: 'PUBLISHED',
    createdAt: '2026-05-04T10:00:00Z',
    priority: 'HIGH',
    approvalRequired: false,
    auditTrail: [{ action: 'Created', user: 'Michael Brown', timestamp: '2026-05-04T09:45:00Z' }]
  },
  {
    id: '4',
    type: 'TRANSPORT_ALERT',
    title: 'Route A-12 Delay',
    content: 'Bus A-12 is running 20 minutes late due to traffic at North Square.',
    senderId: '14',
    senderName: 'Bruce Wayne',
    senderRole: 'TRANSPORT_MANAGER',
    recipients: ['PARENT'],
    scope: 'TRANSPORT_ROUTE',
    status: 'PUBLISHED',
    createdAt: '2026-05-08T07:45:00Z',
    priority: 'URGENT',
    approvalRequired: false,
    auditTrail: [{ action: 'Created', user: 'Bruce Wayne', timestamp: '2026-05-08T07:44:00Z' }]
  },
  {
    id: '5',
    type: 'DIRECT_MESSAGE',
    title: 'Student Performance Update',
    content: 'Hi Robert, I wanted to discuss Emily progress in Mathematics. She is doing exceptionally well in Calculus.',
    senderId: '2',
    senderName: 'David Miller',
    senderRole: 'TEACHER',
    recipients: ['3'], // Robert Wilson (Parent)
    scope: 'INDIVIDUAL',
    status: 'PUBLISHED',
    createdAt: '2026-05-07T16:00:00Z',
    priority: 'MEDIUM',
    approvalRequired: false,
    auditTrail: [{ action: 'Sent', user: 'David Miller', timestamp: '2026-05-07T16:00:00Z' }]
  },
  {
    id: '6',
    type: 'SYSTEM_ALERT',
    title: 'System Maintenance',
    content: 'The portal will be down for maintenance on Sunday from 2 AM to 4 AM.',
    senderId: '10',
    senderName: 'Thomas Anderson',
    senderRole: 'IT_ADMIN',
    recipients: ['ALL'],
    scope: 'GLOBAL',
    status: 'SCHEDULED',
    createdAt: '2026-05-08T12:00:00Z',
    scheduledFor: '2026-05-10T02:00:00Z',
    priority: 'LOW',
    approvalRequired: false,
    auditTrail: [{ action: 'Scheduled', user: 'Thomas Anderson', timestamp: '2026-05-08T12:00:00Z' }]
  }
];


const DEFAULT_COMMUNICATION_LOGS = [
  { id: 'L1', action: 'Broadcast Sent', user: 'Dr. Arthur Pendragon', details: 'School Safety Protocols to All', timestamp: '2026-05-01T09:00:00Z' },
  { id: 'L2', action: 'Approval Granted', user: 'Robert Stark', details: 'Approved Assignment for David Miller', timestamp: '2026-05-05T14:15:00Z' },
  { id: 'L3', action: 'Direct Message', user: 'David Miller', details: 'Message to Robert Wilson (Parent)', timestamp: '2026-05-07T16:00:00Z' },
  { id: 'L4', action: 'Transport Alert', user: 'Bruce Wayne', details: 'Route A-12 Delay notice', timestamp: '2026-05-08T07:45:00Z' },
];

export const getCommunications = () => getStorageData('school_communications', DEFAULT_COMMUNICATIONS);
export const setCommunications = (data: any) => setStorageData('school_communications', data);

export const getCommunicationLogs = () => getStorageData('school_communication_logs', DEFAULT_COMMUNICATION_LOGS);
export const setCommunicationLogs = (data: any) => setStorageData('school_communication_logs', data);
