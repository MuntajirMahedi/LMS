import type { Role } from '../config/roles';

export type CommunicationType = 'NOTICE' | 'DIRECT_MESSAGE' | 'ALERT' | 'ASSIGNMENT' | 'FEE_REMINDER' | 'TRANSPORT_ALERT' | 'SYSTEM_ALERT';

export type CommunicationStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export type CommunicationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type CommunicationScope = 
  | 'GLOBAL' 
  | 'SCHOOL' 
  | 'DEPARTMENT' 
  | 'CLASS' 
  | 'SECTION' 
  | 'INDIVIDUAL' 
  | 'ROLE_BASED'
  | 'TRANSPORT_ROUTE'
  | 'HOSTEL_BLOCK';

export interface Recipient {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  metadata?: {
    class?: string;
    section?: string;
    department?: string;
    childId?: string; // For parents
    routeId?: string; // For drivers/transport
  };
}

export interface CommunicationMessage {
  id: string;
  type: CommunicationType;
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  recipients: string[]; // IDs or Role names
  scope: CommunicationScope;
  status: CommunicationStatus;
  createdAt: string;
  scheduledFor?: string;
  expiresAt?: string;
  attachments?: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  approvalRequired: boolean;
  approvedBy?: string;
  auditTrail: {
    action: string;
    user: string;
    timestamp: string;
  }[];
}

export interface CommunicationPermissions {
  canBroadcastGlobal: boolean;
  canBroadcastSchool: boolean;
  canBroadcastClass: boolean;
  canBroadcastDepartment: boolean;
  canMessageRoles: Role[];
  requiresApprovalForBroadcast: boolean;
  canApproveBroadcasts: boolean;
  visibleScopes: CommunicationScope[];
}

// --- Chat Types ---

export type ConversationType = 'DIRECT' | 'GROUP' | 'CLASS' | 'DEPARTMENT';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  status: 'SENT' | 'DELIVERED' | 'READ';
  attachments?: string[];
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  participants: string[]; // User IDs
  lastMessage?: {
    content: string;
    senderName: string;
    timestamp: string;
  };
  metadata?: {
    classId?: string;
    departmentId?: string;
    icon?: string;
  };
  unreadCount: number;
}
