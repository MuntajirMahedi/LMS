import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { COMMUNICATION_RULES } from '../config/communicationConfig';
import { getCommunications, setCommunications as persistCommunications } from '../mock/communicationMock';
import { getUsers } from '../mock/users';
import type { Recipient } from '../types/communication';

export const useCommunication = () => {
  const { activeRole, user } = useAuth();
  const [communications, setCommunications] = useState(() => getCommunications());

  const permissions = useMemo(() => {
    if (!activeRole) return null;
    return COMMUNICATION_RULES[activeRole];
  }, [activeRole]);

  // Filter messages based on role visibility and user ID
  const filteredMessages = useMemo(() => {
    if (!activeRole || !user) return [];

    return communications.filter(msg => {
      // Admin roles see everything in their scope
      if (activeRole === 'SUPER_ADMIN') return true;
      if (activeRole === 'SCHOOL_ADMIN' && msg.scope !== 'GLOBAL') return true;

      // Users see messages sent TO them or their role
      const isRecipient = msg.recipients.includes(user.id) ||
        msg.recipients.includes(activeRole) ||
        msg.recipients.includes('ALL');

      // Users see messages sent BY them
      const isSender = msg.senderId === user.id;

      // Special visibility rules
      if (activeRole === 'PARENT') {
        // Parents see messages for their children's classes (simplified)
        if (msg.scope === 'CLASS' || msg.scope === 'SCHOOL') return true;
      }

      if (activeRole === 'STUDENT') {
        if (msg.scope === 'CLASS' || msg.scope === 'SCHOOL') return true;
      }

      return isRecipient || isSender;
    });
  }, [activeRole, user]);

  // Get available recipients based on role permissions
  const availableRecipients = useMemo(() => {
    if (!permissions || !user) return [];

    return getUsers()
      .filter(u => u.id !== user.id) // Exclude self
      .filter(u => {
        // Global permission check
        if (!permissions.canMessageRoles.includes(u.role)) return false;

        // Specific association logic
        const userMeta = user.metadata;
        const targetMeta = u.metadata;

        if (activeRole === 'TEACHER') {
          // Teachers can see students in their assigned classes
          if (u.role === 'STUDENT' && targetMeta?.classId) {
            return userMeta?.assignedClasses?.includes(targetMeta.classId);
          }
          // Teachers can see parents of their students
          if (u.role === 'PARENT' && targetMeta?.childrenIds) {
            const children = getUsers().filter(student => targetMeta.childrenIds?.includes(student.id));
            return children.some(child => userMeta?.assignedClasses?.includes(child.metadata?.classId || ''));
          }
          // Teachers see colleagues in same department
          if (u.role === 'TEACHER' || u.role === 'HOD') {
            return targetMeta?.departmentId === userMeta?.departmentId;
          }
        }

        if (activeRole === 'PARENT') {
          // Parents see teachers of their children
          if (u.role === 'TEACHER' || u.role === 'CLASS_TEACHER') {
            const children = getUsers().filter(student => userMeta?.childrenIds?.includes(student.id));
            return children.some(child => targetMeta?.assignedClasses?.includes(child.metadata?.classId || ''));
          }
        }

        if (activeRole === 'STUDENT') {
          // Students see their teachers
          if (u.role === 'TEACHER' || u.role === 'CLASS_TEACHER') {
            return targetMeta?.assignedClasses?.includes(userMeta?.classId || '');
          }
        }

        // Admins can see everyone they are permitted to message
        if (activeRole === 'SCHOOL_ADMIN' || activeRole === 'SUPER_ADMIN' || activeRole === 'IT_ADMIN') {
          return true;
        }

        return false;
      })
      .map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        metadata: u.metadata
      } as Recipient));
  }, [permissions, user, activeRole]);

  const canBroadcast = useMemo(() => {
    if (!permissions) return false;
    return permissions.canBroadcastSchool || permissions.canBroadcastGlobal || permissions.canBroadcastClass;
  }, [permissions]);

  const broadcastMessage = async (data: any) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'sys',
      senderName: user?.name || 'System',
      senderRole: activeRole || 'SYSTEM',
      ...data,
      createdAt: new Date().toISOString()
    };

    const allComms = getCommunications();
    const updatedComms = [newMessage, ...allComms];
    setCommunications(updatedComms);
    persistCommunications(updatedComms);

    return new Promise(resolve => setTimeout(resolve, 500));
  };

  return {
    messages: filteredMessages,
    recipients: availableRecipients,
    permissions,
    canBroadcast,
    broadcastMessage,
    user
  };
};
