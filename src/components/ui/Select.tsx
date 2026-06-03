import * as React from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectProps {
  label?: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({ label, options = [], value, onChange, className, placeholder = "Select...", searchable = false, searchPlaceholder = "Search...", disabled = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options?.find(opt => opt.value === value) || options?.find(opt => opt.label === value);
  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()) || opt.value.toLowerCase().includes(query.toLowerCase()))
    : options;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex flex-col justify-center w-full h-12 bg-white border border-border/50 rounded-2xl px-4 text-[#3A2C2B] transition-all",
          !disabled && "cursor-pointer hover:bg-white hover:border-primary/30",
          isOpen && !disabled && "border-primary/50 ring-4 ring-primary/5 bg-white",
          disabled && "opacity-60 cursor-not-allowed bg-secondary/20",
          className
        )}
      >
        {label && (
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/70 leading-none mb-1">
            {label}
          </span>
        )}
        <div className="flex items-center justify-between w-full gap-2">
          <span className="text-xs font-bold truncate leading-none text-left flex-1">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn("w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] w-full min-w-max z-[100] bg-[#FDFBF7] border border-[#E9E1D5] rounded-[24px] shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[300px]"
        >
          {searchable && (
            <div className="px-2 pb-2">
              <div className="flex items-center gap-2 rounded-xl border border-[#E9E1D5] bg-white px-3 h-10">
                <Search className="w-4 h-4 text-[#3A2C2B]/40 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent outline-none text-xs font-bold text-[#3A2C2B] placeholder:text-[#3A2C2B]/35"
                />
              </div>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 p-1.5">
            {filteredOptions.length ? filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-2.5 py-2.5 text-xs font-bold transition-colors rounded-xl cursor-pointer hover:bg-primary/8 text-left whitespace-nowrap",
                  (opt.value === value || opt.label === value) ? "text-primary bg-primary/10" : "text-[#3A2C2B]"
                )}
              >
                {opt.label}
                {(opt.value === value || opt.label === value) && <Check className="w-3 h-3" />}
              </button>
            )) : (
              <div className="px-3.5 py-3 text-xs font-bold text-[#3A2C2B]/50">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { Select };
