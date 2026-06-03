import React, { useState } from 'react';
import { Check, Search, X, Users, User, GraduationCap, Bus, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Recipient } from '../../types/communication';
import { Badge } from '../ui/Badge';

interface RecipientSelectorProps {
  availableRecipients: Recipient[];
  selectedRecipients: string[];
  onToggle: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onClear?: () => void;
  showFilters?: boolean;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  availableRecipients,
  selectedRecipients,
  onToggle,
  onSelectAll,
  onClear,
  showFilters = true
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Extract unique classes and roles for filtering

  const roles = Array.from(new Set(availableRecipients.map(r => r.role))).sort();

  const filtered = availableRecipients.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                         r.role.toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory === 'ALL') return matchesSearch;
    if (roles.includes(activeCategory as any)) return matchesSearch && r.role === activeCategory;

    
    return matchesSearch;
  });

  const getRoleIcon = (role: string) => {
    if (role.includes('TEACHER')) return GraduationCap;
    if (role.includes('STUDENT')) return User;
    if (role.includes('PARENT')) return Users;
    if (role.includes('DRIVER')) return Bus;
    if (role.includes('WARDEN')) return Building2;
    return User;
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by name, role or class..." 
          className="w-full pl-12 pr-4 h-14 rounded-2xl border border-border bg-white/50 focus:bg-white transition-all outline-none font-medium shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap",
              activeCategory === 'ALL' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            All
          </button>
          
          <div className="h-8 w-px bg-border mx-2 self-center" />
          
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setActiveCategory(role)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                activeCategory === role ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20" : "bg-white text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {role.replace('_', ' ')}s
            </button>
          ))}


        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedRecipients.length > 0 && (
          <Badge variant="brand-orange" className="h-8 px-4 rounded-full font-black text-xs cursor-pointer hover:opacity-80" onClick={onClear}>
            Clear All ({selectedRecipients.length}) <X className="w-3 h-3 ml-2" />
          </Badge>
        )}
        {onSelectAll && search.length === 0 && (
          <button 
            onClick={() => onSelectAll(availableRecipients.map(r => r.id))}
            className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
          >
            Select All Available
          </button>
        )}
        <div className="space-y-2 mt-4">
          {filtered.map(recipient => {
            const isSelected = selectedRecipients.includes(recipient.id);
            return (
              <div 
                key={recipient.id}
                onClick={() => onToggle(recipient.id)}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border",
                  isSelected 
                    ? "bg-primary/5 border-primary shadow-sm" 
                    : "hover:bg-secondary/10 border-transparent bg-white/40"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner overflow-hidden",
                  isSelected ? "bg-primary text-white" : "bg-soft-parchment text-primary"
                )}>
                  {recipient.avatar ? (
                    <img src={recipient.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (() => {
                    const Icon = getRoleIcon(recipient.role);
                    return <Icon className="w-5 h-5 opacity-40" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-black truncate", isSelected ? "text-primary" : "text-[#3A2C2B]")}>
                    {recipient.name}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
                    {recipient.role} {recipient.metadata?.class && `• ${recipient.metadata.class}`}
                  </p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected ? "bg-primary border-primary" : "border-border/50"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
