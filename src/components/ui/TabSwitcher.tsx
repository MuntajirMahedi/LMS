import React from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface TabOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface TabSwitcherProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
  color?: string; // Tailwind bg color class, e.g., 'bg-primary', 'bg-[#C37A67]'
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeTab,
  onTabChange,
  color = 'bg-primary'
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-[48px] p-1.5 sm:p-2 border border-[#E9E1D5]/50 flex flex-nowrap overflow-x-auto items-center justify-start sm:justify-center gap-1 sm:gap-2 w-max max-w-full mx-auto h-auto min-h-[48px] sm:min-h-[72px] hide-scrollbar">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex flex-col sm:flex-row items-center justify-center transition-all duration-300 tap-scale shrink-0 min-h-[48px]",
              isActive
                ? `${color} text-white rounded-[20px] z-10 px-3 py-2 sm:px-8 sm:py-4`
                : "text-[#8B7E74] hover:bg-black/5 hover:text-black rounded-full sm:rounded-[20px] px-3 py-3 sm:px-8 sm:py-4"
            )}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <tab.icon className={cn("w-5 h-5 sm:w-4 sm:h-4", isActive ? "animate-pulse" : "")} />
              <span className={cn(
                "text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none text-center whitespace-normal sm:whitespace-nowrap max-w-[70px] sm:max-w-none",
                isActive ? "block mt-1 sm:mt-0" : "hidden sm:block"
              )}>
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
