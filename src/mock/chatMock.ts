import type { Conversation, ChatMessage } from '../types/communication';
import { getStorageData, setStorageData } from '../lib/storage';

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    type: 'CLASS',
    title: 'Grade 10-A (Mathematics)',
    participants: ['1', '2', '4', '5', '6'],
    lastMessage: {
      content: 'Dont forget to submit the geometry assignment by tomorrow.',
      senderName: 'David Miller',
      timestamp: '2026-05-08T10:30:00Z'
    },
    metadata: {
      classId: '10-A',
      icon: '📐'
    },
    unreadCount: 3
  },
  {
    id: 'conv-2',
    type: 'DIRECT',
    title: 'Dr. Arthur Pendragon',
    participants: ['1', '8'],
    lastMessage: {
      content: 'Please review the monthly performance reports.',
      senderName: 'Dr. Arthur Pendragon',
      timestamp: '2026-05-08T09:15:00Z'
    },
    unreadCount: 0
  },
  {
    id: 'conv-3',
    type: 'DEPARTMENT',
    title: 'Science Faculty',
    participants: ['2', '12', '15'],
    lastMessage: {
      content: 'The new lab equipment has arrived.',
      senderName: 'Robert Stark',
      timestamp: '2026-05-07T16:45:00Z'
    },
    metadata: {
      departmentId: 'SCIENCE',
      icon: '🧪'
    },
    unreadCount: 5
  },
  {
    id: 'conv-4',
    type: 'CLASS',
    title: 'Grade 8-C (Official)',
    participants: ['4', '1', '2'],
    lastMessage: {
      content: 'Weekly schedule has been updated.',
      senderName: 'System',
      timestamp: '2026-05-08T11:00:00Z'
    },
    metadata: {
      classId: '8-C',
      icon: '🏫'
    },
    unreadCount: 0
  }
];

const DEFAULT_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm1',
      conversationId: 'conv-1',
      senderId: '2',
      senderName: 'David Miller',
      senderRole: 'TEACHER',
      content: 'Good morning class. Today we will focus on Trigonometry.',
      timestamp: '2026-05-08T08:00:00Z',
      type: 'TEXT',
      status: 'READ'
    },
    {
      id: 'm2',
      conversationId: 'conv-1',
      senderId: '4',
      senderName: 'Emily Davis',
      senderRole: 'STUDENT',
      content: 'Sir, do we need the advanced calculator for today?',
      timestamp: '2026-05-08T08:05:00Z',
      type: 'TEXT',
      status: 'READ'
    },
    {
      id: 'm3',
      conversationId: 'conv-1',
      senderId: '2',
      senderName: 'David Miller',
      senderRole: 'TEACHER',
      content: 'Yes Emily, please bring it.',
      timestamp: '2026-05-08T08:10:00Z',
      type: 'TEXT',
      status: 'READ'
    },
    {
      id: 'm4',
      conversationId: 'conv-1',
      senderId: '2',
      senderName: 'David Miller',
      senderRole: 'TEACHER',
      content: 'Dont forget to submit the geometry assignment by tomorrow.',
      timestamp: '2026-05-08T10:30:00Z',
      type: 'TEXT',
      status: 'SENT'
    }
  ]
};

// --- Storage Getters & Setters ---

export const getConversations = (): Conversation[] => {
  return getStorageData<Conversation[]>('school_conversations', DEFAULT_CONVERSATIONS);
};

export const setConversations = (data: Conversation[]) => {
  setStorageData('school_conversations', data);
};

export const getChatMessages = (): Record<string, ChatMessage[]> => {
  return getStorageData<Record<string, ChatMessage[]>>('school_chat_messages', DEFAULT_CHAT_MESSAGES);
};

export const setChatMessages = (data: Record<string, ChatMessage[]>) => {
  setStorageData('school_chat_messages', data);
};
