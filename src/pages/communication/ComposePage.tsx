import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  ChevronLeft,
  Users,
  Filter,
  UserPlus2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { RecipientSelector } from '../../components/communication/RecipientSelector';
import { useCommunication } from '../../hooks/useCommunication';
import { Select } from '../../components/ui/Select';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { getUsers } from '../../mock/users';
import { cn } from '../../lib/utils';

const ComposePage: React.FC = () => {
  const navigate = useNavigate();
  const { recipients, broadcastMessage, user: currentUser } = useCommunication();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSending, setIsSending] = useState(false);
  
  // Targeting States
  const [selectionMode, setSelectionMode] = useState<'FILTER' | 'INDIVIDUAL'>('FILTER');
  const [selectedIndividualIds, setSelectedIndividualIds] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetClass, setTargetClass] = useState<string>('ALL');
  const [targetSection, setTargetSection] = useState<string>('ALL');
  const [targetDepartment, setTargetDepartment] = useState<string>('ALL');
  const [showPeopleModal, setShowPeopleModal] = useState(false);

  // Calculate resolved audience
  const resolvedAudienceIds = useMemo(() => {
    if (selectionMode === 'INDIVIDUAL') return selectedIndividualIds;
    
    return getUsers().filter((u: any) => {
      const matchesRole = targetRoles.length === 0 || targetRoles.includes(u.role);
      const userClassId = u.metadata?.classId;
      const userAssignedClasses = u.metadata?.assignedClasses || [];
      const matchesClass = targetClass === 'ALL' || userClassId === targetClass || userAssignedClasses.includes(targetClass);
      const matchesSection = targetSection === 'ALL' || u.metadata?.sectionId === targetSection;
      const matchesDept = targetDepartment === 'ALL' || u.metadata?.departmentId === targetDepartment;
      
      const activeFilters = [targetRoles.length > 0, targetClass !== 'ALL', targetSection !== 'ALL', targetDepartment !== 'ALL'];
      if (activeFilters.filter(Boolean).length === 0) return false;

      return matchesRole && matchesClass && matchesSection && matchesDept;
    }).map(u => u.id);
  }, [selectionMode, selectedIndividualIds, targetRoles, targetClass, targetSection, targetDepartment]);

  const handleSend = async () => {
    if (!title || !content || (selectionMode === 'FILTER' ? resolvedAudienceIds.length === 0 : selectedIndividualIds.length === 0)) return;
    
    setIsSending(true);
    await broadcastMessage({
      title,
      content,
      recipients: selectionMode === 'FILTER' ? resolvedAudienceIds : selectedIndividualIds,
      priority,
      type: 'NOTICE',
      scope: selectionMode === 'FILTER' ? 'GLOBAL' : 'SPECIFIC',
      senderId: currentUser?.id,
      senderName: currentUser?.name
    });
    setIsSending(false);
    navigate('/communication/notices');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-700 pb-16 sm:pb-20">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 sm:gap-4 px-4 sm:px-0 mb-6 sm:mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/communication')}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-sm flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-4xl font-black text-[#3A2C2B] uppercase tracking-tighter leading-none">Create Official Notice</h1>
          <p className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">Broadcast a formal announcement to the school</p>
        </div>
      </div>

      {/* Horizontal Target Audience Bar - Fixed Equal Sizing */}
      <Card className="rounded-none sm:rounded-[28px] border-none shadow-none sm:shadow-xl bg-transparent sm:bg-white text-[#3A2C2B] overflow-visible">
        <CardContent className="p-4 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 sm:gap-6 relative">
          <div className="flex items-center justify-between gap-4">
            {/* Mode Toggle */}
            <div className="flex p-1 bg-secondary/10 rounded-xl w-[180px] flex-shrink-0">
              <button 
                onClick={() => setSelectionMode('FILTER')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2",
                  selectionMode === 'FILTER' ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                )}
              >
                <Filter className="w-3 h-3" /> Filters
              </button>
              <button 
                onClick={() => { setSelectionMode('INDIVIDUAL'); setShowPeopleModal(true); }}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2",
                  selectionMode === 'INDIVIDUAL' ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
                )}
              >
                <UserPlus2 className="w-3 h-3" /> People
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-border/50 hidden lg:block" />

          {/* Filters Row - Uniform Widths */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 items-start gap-3 sm:gap-4">
            <div className="w-full">
              <MultiSelect 
                label="Roles"
                value={targetRoles}
                onChange={setTargetRoles}
                className="bg-secondary/5 border-border/50 text-[#3A2C2B] min-h-[56px] h-auto"
                placeholder="All Roles"
                options={[
                  { label: 'Teachers', value: 'TEACHER' },
                  { label: 'Students', value: 'STUDENT' },
                  { label: 'Parents', value: 'PARENT' },
                  { label: 'Admins', value: 'SCHOOL_ADMIN' },
                  { label: 'Accountants', value: 'ACCOUNTANT' },
                  { label: 'Librarians', value: 'LIBRARIAN' }
                ]}
              />
            </div>
            <div className="w-full">
              <Select 
                label="Class"
                value={targetClass}
                onChange={setTargetClass}
                className="bg-secondary/5 border-border/50 h-14 text-[#3A2C2B]"
                options={[
                  { label: 'All Classes', value: 'ALL' },
                  { label: 'Class 10', value: '10-A' },
                  { label: 'Class 11', value: '11-B' },
                  { label: 'Class 8', value: '8-C' }
                ]}
              />
            </div>
            <div className="w-full">
              <Select 
                label="Section"
                value={targetSection}
                onChange={setTargetSection}
                className="bg-secondary/5 border-border/50 h-14 text-[#3A2C2B]"
                options={[
                  { label: 'All Sections', value: 'ALL' },
                  { label: 'Sec A', value: 'A' },
                  { label: 'Sec B', value: 'B' }
                ]}
              />
            </div>
            <div className="w-full">
              <Select 
                label="Dept"
                value={targetDepartment}
                onChange={setTargetDepartment}
                className="bg-secondary/5 border-border/50 h-14 text-[#3A2C2B]"
                options={[
                  { label: 'All Depts', value: 'ALL' },
                  { label: 'Science', value: 'SCIENCE' },
                  { label: 'Math', value: 'MATH' },
                  { label: 'Arts', value: 'ARTS' }
                ]}
              />
            </div>

            {/* Impact Preview (Mobile Only - Aligned with Section filter as per arrow) */}
            <div className="lg:hidden flex items-center gap-3 pt-2">
              <div className="text-right">
                <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest leading-none">Reach</p>
                <p className="text-base font-black text-brand-orange leading-none mt-1">
                  {selectionMode === 'FILTER' ? resolvedAudienceIds.length : selectedIndividualIds.length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-border/50 hidden lg:block" />

          {/* Impact Preview (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 min-w-fit pr-2">
            <div className="text-right">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Reach</p>
              <p className="text-lg font-black text-brand-orange leading-none mt-1">
                {selectionMode === 'FILTER' ? resolvedAudienceIds.length : selectedIndividualIds.length}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Composer - Reduced Size */}
      <Card className="rounded-none sm:rounded-[32px] border-none shadow-none sm:shadow-2xl bg-transparent sm:bg-white overflow-visible">
        <CardContent className="p-4 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notice Title</label>
              <Input 
                placeholder="Notice Subject..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-14 rounded-2xl border-border bg-secondary/5 font-black text-base px-6"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Content</label>
              <Textarea 
                placeholder="Type the full announcement details here..." 
                className="min-h-[280px] rounded-[24px] border-border bg-secondary/5 p-6 font-medium leading-relaxed text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-40">
                <Select 
                  label="Priority"
                  value={priority}
                  onChange={(val: any) => setPriority(val)}
                  options={[
                    { label: 'Medium', value: 'MEDIUM' },
                    { label: 'High', value: 'HIGH' },
                    { label: 'Urgent', value: 'URGENT' },
                    { label: 'Low', value: 'LOW' }
                  ]}
                />
              </div>
              <Button variant="ghost" className="h-11 px-4 rounded-xl text-primary font-black uppercase text-[9px] tracking-widest gap-2 w-full sm:w-auto">
                <Paperclip className="w-4 h-4" /> Attachments
              </Button>
            </div>

            <Button 
              className="w-full sm:w-56 h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-[10px]"
              onClick={handleSend}
              disabled={isSending || !title || !content || (selectionMode === 'FILTER' ? resolvedAudienceIds.length === 0 : selectedIndividualIds.length === 0)}
            >
              {isSending ? 'Broadcasting...' : 'Broadcast Notice'} <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* People Selection Modal */}
      <Modal
        isOpen={showPeopleModal}
        onClose={() => setShowPeopleModal(false)}
        title="Select Recipients"
      >
        <div className="space-y-4">

          <div className="max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
            <RecipientSelector 
              availableRecipients={recipients}
              selectedRecipients={selectedIndividualIds}
              onToggle={(id) => setSelectedIndividualIds(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
              )}
              onClear={() => setSelectedIndividualIds([])}
            />
          </div>
          <div className="pt-4 border-t border-border/50 flex justify-between items-center">
             <p className="text-[10px] font-black uppercase text-muted-foreground">{selectedIndividualIds.length} People Selected</p>
             <Button onClick={() => setShowPeopleModal(false)} className="rounded-xl h-10 px-6 font-black uppercase text-[10px]">
               Confirm Selection
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComposePage;
