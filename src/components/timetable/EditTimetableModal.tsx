import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type TimetableItem = {
  id: number;
  type: 'period' | 'break' | 'lab';
  startTime: string;
  endTime: string;
  subject?: string;
  teacher?: string;
  breakName?: string;
};

const SUBJECT_TEACHER_MAP: Record<string, string> = {
  'Mathematics': 'Sarah Jenkins',
  'Physics': 'Dr. Alan Grant',
  'Chemistry': 'Marie Curie',
  'English': 'Emma Watson',
  'History': 'John Doe',
  'Biology Lab': 'Dr. Alan Grant',
  'Chemistry Lab': 'Marie Curie',
};

interface EditTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClass: string;
  section: string;
  department: string;
}

export function EditTimetableModal({ isOpen, onClose, targetClass, section, department }: EditTimetableModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [periods, setPeriods] = useState<TimetableItem[]>([]);

  // When date changes, mock loading the prefilled data
  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (dateStr) {
      setPeriods([
        { id: Date.now() + 1, type: 'period', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', teacher: 'Sarah Jenkins' },
        { id: Date.now() + 2, type: 'period', startTime: '09:45', endTime: '10:30', subject: 'Physics', teacher: 'Dr. Alan Grant' },
        { id: Date.now() + 3, type: 'break', startTime: '10:30', endTime: '10:45', breakName: 'Morning Break' },
      ]);
    } else {
      setPeriods([]);
    }
  };

  const handleAddPeriod = () => setPeriods(prev => [...prev, { id: Date.now(), type: 'period', startTime: '', endTime: '', subject: '', teacher: '' }]);
  const handleAddBreak = () => setPeriods(prev => [...prev, { id: Date.now(), type: 'break', startTime: '', endTime: '', breakName: '' }]);
  const handleRemovePeriod = (id: number) => setPeriods(prev => prev.filter(p => p.id !== id));

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPeriods(prev => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === periods.length - 1) return;
    setPeriods(prev => {
      const copy = [...prev];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };

  const updatePeriod = (index: number, key: string, value: string) => {
    setPeriods(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      if (key === 'subject' && SUBJECT_TEACHER_MAP[value]) {
        copy[index].teacher = SUBJECT_TEACHER_MAP[value];
      }
      return copy;
    });
  };

  const handleSave = () => {
    // Save logic here
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Timetable"
    >
      <div className="space-y-6">
        <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E9E1D5] flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#2C2625]/50 mb-1">Target Class</p>
            <p className="text-sm font-bold text-[#2C2625]">{targetClass} • {section} {department ? `• ${department}` : ''}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#2C2625]/50 mb-1">Select Date to Edit</p>
            <Input 
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="h-10 rounded-xl bg-white text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {selectedDate && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {periods.length === 0 ? (
              <p className="text-center text-sm font-bold text-[#2C2625]/50 py-8">No periods scheduled for this date.</p>
            ) : (
              periods.map((p, index) => (
                <div key={p.id} className={cn(
                  "group flex gap-4 items-start p-4 rounded-2xl border shadow-sm relative",
                  p.type === 'break' ? "bg-[#FFF8EC] border-[#F3D8A0]" : "bg-white border-[#E9E1D5]"
                )}>
                  {/* Shuffle Controls */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-3 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-sm border border-[#E9E1D5]">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1 hover:bg-[#FDFBF7] rounded-t-lg text-[#2C2625]/60 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveDown(index)} disabled={index === periods.length - 1} className="p-1 hover:bg-[#FDFBF7] rounded-b-lg text-[#2C2625]/60 disabled:opacity-30 border-t border-[#E9E1D5]"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>

                  {/* Row Content */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#2C2625]/60 mb-1.5 block">Start</label>
                      <Input type="time" value={p.startTime} onChange={(e) => updatePeriod(index, 'startTime', e.target.value)} className="h-10 text-sm rounded-xl" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[#2C2625]/60 mb-1.5 block">End</label>
                      <Input type="time" value={p.endTime} onChange={(e) => updatePeriod(index, 'endTime', e.target.value)} className="h-10 text-sm rounded-xl" />
                    </div>

                    {p.type === 'period' || p.type === 'lab' ? (
                      <>
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[#2C2625]/60 mb-1.5 block">Subject</label>
                          <Select 
                            value={p.subject || ''}
                            onChange={(v) => updatePeriod(index, 'subject', v)}
                            options={Object.keys(SUBJECT_TEACHER_MAP).map(sub => ({label: sub, value: sub}))}
                            className="h-10"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-[10px] font-black uppercase tracking-wider text-[#2C2625]/60 mb-1.5 block">Teacher</label>
                          <Input readOnly value={p.teacher || ''} placeholder="Auto" className="h-10 text-sm rounded-xl bg-[#FDFBF7] border-none font-bold" />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-8">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#2C2625]/60 mb-1.5 block">Break Name</label>
                        <Input value={p.breakName || ''} onChange={(e) => updatePeriod(index, 'breakName', e.target.value)} className="h-10 text-sm rounded-xl font-bold bg-[#E4B76D]/10 text-[#C37A67] border-none" />
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleRemovePeriod(p.id)} className="p-2 text-[#E63946] hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
            
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAddPeriod} variant="outline" className="flex-1 border-dashed border-[#88AC88] text-[#88AC88] hover:bg-[#88AC88]/10 text-[10px] font-black uppercase tracking-widest h-10 rounded-xl">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Period
              </Button>
              <Button onClick={handleAddBreak} variant="outline" className="flex-1 border-dashed border-[#E4B76D] text-[#E4B76D] hover:bg-[#E4B76D]/10 text-[10px] font-black uppercase tracking-widest h-10 rounded-xl">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Break
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E9E1D5]">
          <Button variant="outline" onClick={onClose} className="border-[#E9E1D5] font-bold h-10 px-6 rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedDate} className="bg-[#C37A67] hover:bg-[#C37A67]/90 text-white font-bold h-10 px-6 rounded-xl">Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}
