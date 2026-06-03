import React, { useState } from 'react';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  Shield,
  UserCircle,
  ArrowLeftRight,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import type { Role } from '../config/roles';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user, activeRole, switchRole, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-secondary rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center bg-secondary/50 rounded-xl px-3 py-1.5 border border-border/50 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search students, staff, records..."
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-64 placeholder:text-muted-foreground/60 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2.5 hover:bg-secondary rounded-xl relative group transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full border-2 border-white" />
        </button>

        <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 hover:bg-secondary rounded-2xl transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border group-hover:border-primary/30 transition-colors shadow-sm">
              <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-sm font-black leading-none">{user?.name}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {activeRole?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isProfileOpen && "rotate-180")} />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-[24px] shadow-2xl border border-border p-3 z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 bg-soft-parchment rounded-2xl mb-2">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                      <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-black text-base">{user?.name}</p>
                      <p className="text-xs font-medium text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-xl border border-border/50">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      {activeRole?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all">
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  {user && (user.roles?.length ?? 0) > 1 && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRoleSwitcherOpen(!isRoleSwitcherOpen);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <ArrowLeftRight className="w-4 h-4" />
                          Switch Role
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isRoleSwitcherOpen && "-rotate-90")} />
                      </button>

                      {isRoleSwitcherOpen && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-primary/20 pl-2">
                          {user.roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                switchRole(role as Role);
                                setIsProfileOpen(false);
                                setIsRoleSwitcherOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all",
                                activeRole === role
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                              )}
                            >
                              {role.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="h-px bg-border my-2" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
