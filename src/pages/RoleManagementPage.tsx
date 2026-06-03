import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Copy, 
  Trash2, 
  Save, 
  ChevronRight, 
  Search,
  Lock,
  Eye,
  Edit3,
  Trash,
  CheckSquare,
  FileDown,
  Upload,
  UserPlus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { ROLE_PERMISSIONS, saveStoredRolePermissions } from '../config/permissions';
import type { Role, Module, Action } from '../config/roles';
import { useAuth } from '../context/AuthContext';

const ALL_MODULES: Module[] = [
  'DASHBOARD', 'SCHOOL_STRUCTURE', 'ADMISSIONS', 'STUDENT_MANAGEMENT', 
  'ACADEMIC_CONTENT', 'TIMETABLE', 'ATTENDANCE', 'ASSIGNMENTS', 
  'EXAMS', 'FINANCE', 'COMMUNICATION', 
  'TRANSPORT', 'HR_STAFF', 'LIBRARY', 'HOSTEL', 
  'REPORTS', 'SETTINGS', 'ROLE_PERMISSION_ADMIN', 'AUDIT_LOGS'
];

const ALL_ACTIONS: { key: Action; icon: any; label: string }[] = [
  { key: 'view', icon: Eye, label: 'View' },
  { key: 'create', icon: Plus, label: 'Create' },
  { key: 'edit', icon: Edit3, label: 'Edit' },
  { key: 'delete', icon: Trash, label: 'Delete' },
  { key: 'approve', icon: CheckSquare, label: 'Approve' },
  { key: 'export', icon: FileDown, label: 'Export' },
  { key: 'publish', icon: Upload, label: 'Publish' },
  { key: 'assign', icon: UserPlus, label: 'Assign' },
];

const RoleManagementPage: React.FC = () => {
  const { permissions: livePermissions, updatePermissions, switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('SCHOOL_ADMIN');
  const [selectedModule, setSelectedModule] = useState<Module>(ALL_MODULES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [permissions, setPermissions] = useState(ROLE_PERMISSIONS);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    setPermissions(livePermissions);
  }, [livePermissions]);

  const roles = Object.keys(permissions) as Role[];
  const filteredRoles = roles.filter(role => 
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePermission = (role: Role, module: Module, action: Action) => {
    const currentActions = permissions[role][module] || [];
    let newActions: Action[];
    
    if (currentActions.includes(action)) {
      newActions = currentActions.filter(a => a !== action);
    } else {
      newActions = [...currentActions, action];
    }

    const nextPermissions = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [module]: newActions
      }
    };
    setPermissions(nextPermissions);
    updatePermissions(nextPermissions);
  };

  const toggleAllPermissionsForModule = (role: Role, module: Module) => {
    const currentActions = permissions[role][module] || [];
    const allActionKeys = ALL_ACTIONS.map(a => a.key);
    const newActions = currentActions.length === allActionKeys.length ? [] : allActionKeys;
    const nextPermissions = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [module]: newActions
      }
    };
    setPermissions(nextPermissions);
    updatePermissions(nextPermissions);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      saveStoredRolePermissions(permissions);
      updatePermissions(permissions);
      setIsSaving(false);
      alert('Permissions saved successfully!');
    }, 1000);
  };

  const handleCreateRole = () => {
    if (!newRoleName) return;
    const formattedName = newRoleName.toUpperCase().replace(/\s+/g, '_') as Role;
    
    if (permissions[formattedName]) {
      alert('Role already exists!');
      return;
    }

    const nextPermissions = {
      ...permissions,
      [formattedName]: {
        DASHBOARD: ['view']
      }
    };
    setPermissions(nextPermissions);
    updatePermissions(nextPermissions);
    setSelectedRole(formattedName);
    setNewRoleName('');
    setShowAddModal(false);
  };

  const handleClone = (role: Role) => {
    const cloneName = `${role}_CLONE_${Math.floor(Math.random() * 1000)}` as Role;
    const nextPermissions = {
      ...permissions,
      [cloneName]: { ...permissions[role] }
    };
    setPermissions(nextPermissions);
    updatePermissions(nextPermissions);
    setSelectedRole(cloneName);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Create New Role</CardTitle>
              <CardDescription>Enter a unique name for the new role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Role Name</label>
                <Input 
                  placeholder="e.g. Campus Manager" 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="h-12 rounded-xl"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 h-12 rounded-xl font-black" onClick={handleCreateRole}>
                  Create Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Role Management
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-0.5">
              Configure granular module permissions and custom role access.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 lg:flex-none h-12 rounded-2xl font-black shadow-xl shadow-primary/20">
            {isSaving ? <Save className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Roles Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search roles..." 
              className="pl-10 h-12 rounded-2xl bg-white border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Card className="rounded-[32px] overflow-hidden border-border shadow-lg bg-white">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">System Roles</CardTitle>
            </CardHeader>
            <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
              {filteredRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 transition-all text-left group",
                    selectedRole === role 
                      ? "bg-primary text-white" 
                      : "hover:bg-secondary text-foreground font-bold"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black truncate max-w-[150px]">
                      {role.replace(/_/g, ' ')}
                    </span>
                    <span className={cn(
                      "text-[10px] uppercase tracking-tighter opacity-70",
                      selectedRole === role ? "text-white" : "text-primary"
                    )}>
                      {Object.values(permissions[role]).filter(actions => actions && actions.length > 0).length} Modules
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform group-hover:translate-x-1",
                    selectedRole === role ? "text-white" : "text-muted-foreground"
                  )} />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-9">
          <Card className="rounded-[40px] border-border shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-primary p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
                <Lock className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Selected Role</div>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight mb-2">
                    {selectedRole.replace(/_/g, ' ')}
                  </CardTitle>
                  <CardDescription className="text-white/70 font-medium">
                    Configure permissions across {ALL_MODULES.length} modules.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 sm:flex-none rounded-xl font-bold bg-white/20 hover:bg-white/30 text-white border-0 h-10"
                    onClick={() => {
                      switchRole(selectedRole);
                      alert(`Session switched to ${selectedRole}.`);
                      window.location.href = '/';
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 sm:flex-none rounded-xl font-bold bg-white/20 hover:bg-white/30 text-white border-0 h-10"
                    onClick={() => handleClone(selectedRole)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Clone
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-xl font-bold h-10 w-10 sm:w-auto flex items-center justify-center p-0 sm:px-4"
                    onClick={() => {
                      if(confirm('Are you sure?')) {
                        const newPerms = { ...permissions };
                        delete newPerms[selectedRole as Role];
                        setPermissions(newPerms);
                        updatePermissions(newPerms);
                        setSelectedRole(Object.keys(newPerms)[0] as Role);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop View: Horizontal Matrix */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                      <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground w-1/4 sticky left-0 bg-secondary/80 backdrop-blur-md z-30 border-r border-border">Module Name</th>
                      {ALL_ACTIONS.map(action => (
                        <th key={action.key} className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1 min-w-[70px]">
                            <action.icon className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                              {action.label}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {ALL_MODULES.map((module) => (
                      <tr key={module} className="hover:bg-secondary/30 transition-colors group">
                        <td className="p-6 sticky left-0 bg-white/95 backdrop-blur-sm z-20 border-r border-border group-hover:bg-primary/5">
                          <div className="flex flex-col items-start">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                              {module.replace(/_/g, ' ')}
                            </span>
                            <label className="mt-2 flex items-center gap-2 cursor-pointer group/btn w-fit">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 cursor-pointer accent-primary rounded border-border"
                                checked={permissions[selectedRole][module]?.length === ALL_ACTIONS.length}
                                onChange={() => toggleAllPermissionsForModule(selectedRole, module)}
                              />
                              <span className="text-[11px] font-bold text-primary/80 group-hover/btn:text-primary transition-colors uppercase tracking-wider">
                                {permissions[selectedRole][module]?.length === ALL_ACTIONS.length ? 'Deselect All' : 'Select All'}
                              </span>
                            </label>
                          </div>
                        </td>
                        {ALL_ACTIONS.map(action => {
                          const isActive = permissions[selectedRole][module]?.includes(action.key);
                          return (
                            <td key={action.key} className="p-4 text-center">
                              <button
                                onClick={() => togglePermission(selectedRole, module, action.key)}
                                className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all border-2",
                                  isActive 
                                    ? "bg-primary/10 border-primary text-primary shadow-sm" 
                                    : "bg-transparent border-border/50 text-muted-foreground hover:border-primary/50"
                                )}
                              >
                                {isActive ? (
                                  <CheckSquare className="w-5 h-5 fill-primary/20 animate-in zoom-in duration-200" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-border group-hover:bg-primary/30 transition-colors" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: User-Friendly Seamless Accordion */}
              <div className="sm:hidden space-y-2 p-3 bg-secondary/5">
                {ALL_MODULES.map((module) => {
                  const isExpanded = (selectedModule === module);
                  const activeCount = permissions[selectedRole][module]?.length || 0;
                  
                  return (
                    <div 
                      key={module} 
                      className={cn(
                        "transition-all duration-300 rounded-[24px] overflow-hidden border",
                        isExpanded 
                          ? "bg-white border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/20" 
                          : "bg-white border-border/50 shadow-sm"
                      )}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => setSelectedModule(isExpanded ? null as any : module)}
                        className="w-full p-4 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            isExpanded ? "bg-primary text-white" : "bg-secondary/50 text-muted-foreground"
                          )}>
                            <ShieldCheck className={cn("w-5 h-5", isExpanded ? "animate-pulse" : "")} />
                          </div>
                          <div className="text-left">
                            <span className={cn(
                              "text-sm font-black uppercase tracking-tight block",
                              isExpanded ? "text-primary" : "text-foreground"
                            )}>
                              {module.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-medium">
                              {activeCount} Permissions Configured
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeCount > 0 && !isExpanded && (
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                              {activeCount}
                            </div>
                          )}
                          <ChevronRight className={cn(
                            "w-5 h-5 transition-transform duration-300",
                            isExpanded ? "rotate-90 text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                      </button>

                      {/* Accordion Body */}
                      <div className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      )}>
                        <div className="overflow-hidden">
                          <div className="p-4 pt-0 border-t border-border/10">
                            <div className="flex justify-between items-center mt-4 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Permissions</span>
                              <label
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 cursor-pointer group/btn active:scale-95 transition-all"
                              >
                                <span className="text-[11px] font-bold text-primary/80 group-hover/btn:text-primary transition-colors uppercase tracking-wider">
                                  {permissions[selectedRole][module]?.length === ALL_ACTIONS.length ? 'Deselect All' : 'Select All'}
                                </span>
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 cursor-pointer accent-primary rounded border-border"
                                  checked={permissions[selectedRole][module]?.length === ALL_ACTIONS.length}
                                  onChange={() => toggleAllPermissionsForModule(selectedRole, module)}
                                />
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              {ALL_ACTIONS.map(action => {
                                const isActive = permissions[selectedRole][module]?.includes(action.key);
                                return (
                                  <button
                                    key={action.key}
                                    onClick={() => togglePermission(selectedRole, module, action.key)}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-[18px] border-2 transition-all tap-scale",
                                      isActive 
                                        ? "bg-primary/5 border-primary text-primary" 
                                        : "bg-secondary/30 border-transparent text-muted-foreground"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                      isActive ? "bg-primary text-white" : "bg-white text-muted-foreground"
                                    )}>
                                      <action.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">
                                      {action.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/10 flex justify-center">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                Tap icons to toggle access
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;
