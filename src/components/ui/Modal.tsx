import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "./Button"
import { cn } from "../../lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  hideHeader?: boolean
  bodyClassName?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  hideHeader = false,
  bodyClassName
}) => {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-2xl bg-black/10 animate-in fade-in duration-300" 
      onClick={onClose}
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        className={cn(
          "bg-white w-full max-w-lg h-[540px] rounded-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.25)] border border-border/10 overflow-hidden my-auto animate-in zoom-in-95 duration-500 flex flex-col",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="relative px-5 pt-6 pb-4 shrink-0 sm:px-10 sm:pt-8">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                {title && (
                  <h2 className="text-[22px] sm:text-[24px] font-black text-[#3A2C2B] leading-tight tracking-tight uppercase">
                    {title}
                  </h2>
                )}
                {description && (
                    <p className="text-[12px] sm:text-[13px] font-bold text-[#3A2C2B]/50 leading-relaxed max-w-[90%]">
                    {description}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="w-10 h-10 rounded-xl bg-[#3A2C2B]/5 hover:bg-[#3A2C2B]/10 hover:rotate-90 transition-all duration-500"
              >
                <X className="w-5 h-5 text-[#3A2C2B]" />
              </Button>
            </div>
            
            {/* Decorative bar */}
            <div className="absolute bottom-0 left-5 right-5 h-[1.5px] bg-gradient-to-r from-primary/30 via-primary/5 to-transparent sm:left-10 sm:right-10" />
          </div>
        )}
        
        {/* Body Container */}
        <div className={cn("px-5 py-5 flex-1 overflow-hidden flex flex-col sm:px-10 sm:py-6", bodyClassName)}>
          <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
            {children}
          </div>
        </div>

        {/* Footer Container */}
        {footer && (
          <div className="px-5 pb-6 flex items-center justify-end gap-3 bg-white shrink-0 sm:px-10 sm:pb-8">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
