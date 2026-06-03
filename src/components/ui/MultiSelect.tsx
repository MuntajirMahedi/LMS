import * as React from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "./Badge";

export interface MultiSelectProps {
  label?: string;
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  label, 
  options = [], 
  value = [], 
  onChange, 
  className, 
  placeholder = "Select multiple..." 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== val));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex flex-col justify-center w-full min-h-[56px] bg-white border border-border/50 rounded-2xl px-4 py-2 text-[#3A2C2B] cursor-pointer hover:bg-white hover:border-primary/30 transition-all",
          isOpen && "border-primary/50 ring-4 ring-primary/5 bg-white",
          className
        )}
      >
        {label && (
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/70 leading-none mb-1.5">
            {label}
          </span>
        )}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex flex-wrap gap-1 items-center flex-1 min-w-0">
            {value.length > 0 ? (
              value.map(val => {
                const opt = options.find(o => o.value === val);
                return (
                  <Badge 
                    key={val} 
                    variant="secondary" 
                    className="h-6 px-2 text-[10px] font-bold bg-primary/5 text-primary border-none flex items-center gap-1 group/badge"
                  >
                    {opt?.label || val}
                    <X 
                      className="w-2.5 h-2.5 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={(e) => removeValue(val, e)}
                    />
                  </Badge>
                );
              })
            ) : (
              <span className="text-xs font-bold truncate leading-none">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300 flex-shrink-0", isOpen && "rotate-180 text-primary")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-border/50 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
            {options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(opt.value);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors cursor-pointer hover:bg-primary/5",
                    isSelected ? "text-primary bg-primary/5" : "text-[#3A2C2B]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                      isSelected ? "bg-primary border-primary" : "border-border/50"
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {opt.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export { MultiSelect };
