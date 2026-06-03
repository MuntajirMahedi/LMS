import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, type User } from '../mock/users';
import type { Role, Action, Module } from '../config/roles';
import type { RolePermissions } from '../config/permissions';
import { getDefaultRolePermissions, hasPermission, loadStoredRolePermissions, saveStoredRolePermissions } from '../config/permissions';

const ROLE_PERMISSIONS_CHANGED_EVENT = 'school-role-permissions-changed';

interface AuthContextType {
  user: User | null;
  activeRole: Role | null;
  login: (email: string) => Promise<Role>;
  logout: () => void;
  switchRole: (role: Role) => void;
  checkPermission: (module: Module, action?: Action) => boolean;
  permissions: RolePermissions;
  updatePermissions: (permissions: RolePermissions) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions>(() => loadStoredRolePermissions());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('school_user');
    const savedRole = localStorage.getItem('school_active_role');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure roles exists for legacy data
      if (!parsedUser.roles) {
        parsedUser.roles = [parsedUser.role];
      }
      setUser(parsedUser);
      setActiveRole((savedRole as Role) || parsedUser.role);
      setPermissions(loadStoredRolePermissions());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('lms-permissions-sync');

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'school_role_permissions') {
        setPermissions(loadStoredRolePermissions());
      }
    };

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data === ROLE_PERMISSIONS_CHANGED_EVENT) {
        setPermissions(loadStoredRolePermissions());
      }
    };

    const handlePermissionsChanged = () => {
      setPermissions(loadStoredRolePermissions());
      channel.postMessage(ROLE_PERMISSIONS_CHANGED_EVENT);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(ROLE_PERMISSIONS_CHANGED_EVENT, handlePermissionsChanged);
    channel.addEventListener('message', handleBroadcast);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(ROLE_PERMISSIONS_CHANGED_EVENT, handlePermissionsChanged);
      channel.removeEventListener('message', handleBroadcast);
      channel.close();
    };
  }, []);

  const login = async (email: string): Promise<Role> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const foundUser = getUsers().find((u) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setActiveRole(foundUser.role);
      localStorage.setItem('school_user', JSON.stringify(foundUser));
      localStorage.setItem('school_active_role', foundUser.role);
      setIsLoading(false);
      return foundUser.role;
    } else {
      setIsLoading(false);
      throw new Error('User not found');
    }
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('school_user');
    localStorage.removeItem('school_active_role');
  };

  const switchRole = (role: Role) => {
    if (user && (user.roles.includes(role) || user.roles.includes('SUPER_ADMIN') || user.roles.includes('SCHOOL_ADMIN'))) {
      setActiveRole(role);
      localStorage.setItem('school_active_role', role);
    }
  };

  const checkPermission = (module: Module, action: Action = 'view') => {
    if (!activeRole) return false;
    return hasPermission(activeRole, module, action, permissions);
  };

  const updatePermissions = (nextPermissions: RolePermissions) => {
    const safePermissions = nextPermissions ?? getDefaultRolePermissions();
    setPermissions(safePermissions);
    saveStoredRolePermissions(safePermissions);
    window.dispatchEvent(new Event(ROLE_PERMISSIONS_CHANGED_EVENT));
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, login, logout, switchRole, checkPermission, permissions, updatePermissions, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
