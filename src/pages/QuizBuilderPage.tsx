import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Type, 
  List, 
  Clock, 
  ArrowRight,
  FileText,
  Target,
  ClipboardList
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';

interface Question {
  id: string;
  type: 'MCQ' | 'TEXT';
  question: string;
  marks: string;
  options: string[];
  correctAnswer: string;
}

const QuizBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Quiz Header/Config States
  const [title, setTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [dept, setDept] = useState('');
  const [instructions, setInstructions] = useState('');
  
  // Scheduling & Grading
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durHrs, setDurHrs] = useState('0');
  const [durMins, setDurMins] = useState('30');
  const [durSecs, setDurSecs] = useState('0');
  const [totalMarks, setTotalMarks] = useState('100');
  const [passingMarks, setPassingMarks] = useState('40');
  const [autoPublish, setAutoPublish] = useState(false);

  // Question States
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', type: 'MCQ', question: '', marks: '5', options: ['', '', '', ''], correctAnswer: '' }
  ]);

  // Auto-calculate End Time
  useEffect(() => {
    if (startTime) {
      const start = new Date(startTime);
      const totalSeconds = (parseInt(durHrs) * 3600) + (parseInt(durMins) * 60) + parseInt(durSecs);
      const end = new Date(start.getTime() + totalSeconds * 1000);
      
      // Format to YYYY-MM-DDTHH:mm for datetime-local input
      const year = end.getFullYear();
      const month = String(end.getMonth() + 1).padStart(2, '0');
      const day = String(end.getDate()).padStart(2, '0');
      const hours = String(end.getHours()).padStart(2, '0');
      const minutes = String(end.getMinutes()).padStart(2, '0');
      
      setEndTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [startTime, durHrs, durMins, durSecs]);

  const addQuestion = (type: 'MCQ' | 'TEXT') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      marks: '5',
      options: type === 'MCQ' ? ['', '', '', ''] : [],
      correctAnswer: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (qId: string, optIdx: number, val: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[optIdx] = val;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = () => {
    const quizData = { title, selectedClass, dept, subject, selectedSections, startTime, endTime, duration: { hrs: durHrs, mins: durMins, secs: durSecs }, passingMarks, totalMarks, instructions, questions };
    console.log('Saving Draft:', quizData);
    alert('Draft Saved Successfully!');
  };

  const handlePublish = () => {
    const quizData = { title, selectedClass, dept, subject, selectedSections, startTime, endTime, duration: { hrs: durHrs, mins: durMins, secs: durSecs }, passingMarks, totalMarks, instructions, questions };
    console.log('Publishing Quiz:', quizData);
    alert('Quiz Published Successfully!');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans overflow-x-hidden p-0">
      <div className="max-w-[1200px] mx-auto p-3 sm:p-5 md:p-8 space-y-4 md:space-y-8">
        
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="flex items-start md:items-center gap-4 md:gap-6">
            <button 
              onClick={() => navigate('/academics')}
              className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-white border border-border/50 flex items-center justify-center hover:bg-primary/5 transition-all shadow-sm mt-1 md:mt-0"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#3A2C2B]" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#3A2C2B] tracking-tight uppercase leading-none md:leading-tight">Quiz Master</h1>
              <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-80 mt-2 md:mt-1">Building Assessment</p>
            </div>
          </div>
          <div className="flex flex-row w-full md:w-auto gap-3">
            <Button onClick={handleSave} variant="outline" className="flex-1 md:flex-none h-14 md:h-12 rounded-2xl border-[#3A2C2B]/10 text-[#3A2C2B] uppercase font-black text-[11px] md:text-[10px] tracking-widest hover:bg-white shadow-sm whitespace-nowrap">SAVE DRAFT</Button>
            <Button onClick={handlePublish} className="flex-1 md:flex-none h-14 md:h-12 rounded-2xl bg-[#3A2C2B] hover:bg-[#2A1C1B] text-white uppercase font-black text-[11px] md:text-[10px] tracking-widest flex items-center justify-center gap-2 md:gap-3 shadow-xl whitespace-nowrap">
              PUBLISH NOW <ArrowRight className="w-4 h-4 hidden md:block" />
            </Button>
          </div>
        </div>

        {/* 1. Targeting Module */}
        <Card className="rounded-[20px] md:rounded-[24px] shadow-sm border border-border/30 bg-white">
          <div className="p-3 sm:p-4 md:p-5 space-y-3 md:space-y-5">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-[10px] md:rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <h2 className="text-sm md:text-xs font-black text-[#3A2C2B] uppercase tracking-tight leading-tight">Assessment<br className="sm:hidden" /> Targeting</h2>
                </div>
                <div className="flex gap-2 sm:gap-1 flex-wrap">
                  {['A', 'B', 'C', 'D'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      className={cn(
                        "w-9 h-9 sm:w-7 sm:h-7 rounded-xl sm:rounded-lg text-[11px] sm:text-[9px] font-black transition-all border flex items-center justify-center",
                        selectedSections.includes(s) 
                          ? "bg-primary text-white border-primary shadow-sm" 
                          : "bg-[#f9f9f9] border-border/30 text-[#3A2C2B]/30"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">Quiz Title</label>
                  <Input 
                    placeholder="Quiz Title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#f9f9f9] border-border/40 rounded-xl h-10 md:h-12 text-[11px] font-bold text-[#3A2C2B]"
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">Class</label>
                  <Select 
                    value={selectedClass} 
                    options={[
                      {label: 'Class 9', value: '9'}, 
                      {label: 'Class 10', value: '10'}, 
                      {label: 'Class 11', value: '11'}, 
                      {label: 'Class 12', value: '12'}
                    ]} 
                    onChange={setSelectedClass} 
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">Department</label>
                  <Select 
                    value={dept} 
                    options={[
                      { label: 'Science', value: 'Science' },
                      { label: 'Commerce', value: 'Commerce' },
                      { label: 'Arts', value: 'Arts' },
                      { label: 'General', value: 'General' },
                    ]} 
                    onChange={setDept}
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">Subject</label>
                  <Select 
                    value={subject} 
                    options={[
                      {label: 'Mathematics', value: 'Mathematics'}, 
                      {label: 'Physics', value: 'Physics'}, 
                      {label: 'Chemistry', value: 'Chemistry'}, 
                      {label: 'History', value: 'History'},
                      {label: 'English', value: 'English'}
                    ]} 
                    onChange={setSubject} 
                  />
                </div>
             </div>
          </div>
        </Card>

        {/* 2. Timeline Module */}
        <Card className="rounded-[20px] md:rounded-[24px] shadow-sm border border-border/30 bg-white">
          <div className="p-3 sm:p-4 md:p-5 space-y-3 md:space-y-5">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 rounded-[10px] md:rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                  </div>
                  <h2 className="text-sm md:text-xs font-black text-[#3A2C2B] uppercase tracking-tight leading-tight">Timeline &<br className="sm:hidden" /> Evaluation</h2>
                </div>
                <div className="flex items-center gap-3 sm:gap-2 bg-[#f9f9f9] px-3 py-2 sm:px-2 sm:py-1 rounded-xl border border-border/20 self-start sm:self-auto">
                    <span className="text-[9px] sm:text-[7px] font-black uppercase text-[#3A2C2B]/30">Auto-Publish</span>
                    <button 
                      onClick={() => setAutoPublish(!autoPublish)}
                      className={cn("w-9 h-5 sm:w-7 sm:h-3.5 rounded-full relative transition-all", autoPublish ? "bg-primary" : "bg-muted-foreground/20")}
                    >
                      <div className={cn("w-4 h-4 sm:w-2.5 sm:h-2.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm", autoPublish ? "right-0.5" : "left-0.5")} />
                    </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">Start Time</label>
                  <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-[#f9f9f9] border-border/40 rounded-xl h-10 text-[10px] font-bold text-[#3A2C2B]" />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">End Time (Auto)</label>
                  <Input type="datetime-local" value={endTime} readOnly className="bg-[#f2f2f2] border-border/40 rounded-xl h-10 text-[10px] font-bold text-[#3A2C2B] cursor-not-allowed opacity-70" />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">Duration (HH:MM:SS)</label>
                  <div className="flex items-center gap-1 bg-[#f9f9f9] border border-border/40 rounded-xl px-2 h-10">
                    <Input type="number" min="0" value={durHrs} onChange={e => setDurHrs(e.target.value)} className="w-10 border-none bg-transparent text-center font-black text-xs text-[#3A2C2B] p-0" />
                    <span className="text-[8px] opacity-20 font-bold">:</span>
                    <Input type="number" min="0" max="59" value={durMins} onChange={e => setDurMins(e.target.value)} className="w-10 border-none bg-transparent text-center font-black text-xs text-[#3A2C2B] p-0" />
                    <span className="text-[8px] opacity-20 font-bold">:</span>
                    <Input type="number" min="0" max="59" value={durSecs} onChange={e => setDurSecs(e.target.value)} className="w-10 border-none bg-transparent text-center font-black text-xs text-[#3A2C2B] p-0" />
                  </div>
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">Pass / Total Marks</label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={passingMarks} onChange={e => setPassingMarks(e.target.value)} className="bg-[#f9f9f9] border-border/40 rounded-xl h-10 text-center font-black text-xs text-green-600 flex-1 px-1" />
                    <span className="text-sm opacity-10 font-bold">/</span>
                    <Input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="bg-[#f9f9f9] border-border/40 rounded-xl h-10 text-center font-black text-xs text-red-600 flex-1 px-1" />
                  </div>
                </div>
             </div>
          </div>
        </Card>

        {/* 3. Instructions Module */}
        <Card className="rounded-[20px] md:rounded-[24px] shadow-sm border border-border/30 bg-white">
          <div className="p-3 sm:p-4 md:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-[10px] md:rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4 md:w-4.5 md:h-4.5 text-primary" />
              </div>
              <h2 className="text-sm md:text-xs font-black text-[#3A2C2B] uppercase tracking-tight">Quiz Instructions</h2>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-[#3A2C2B]/40 tracking-widest">General Guidelines for Students</label>
              <Textarea 
                placeholder="Enter quiz instructions, rules, and guidelines..." 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="bg-[#f9f9f9] border-border/40 rounded-2xl min-h-[120px] text-[11px] font-medium text-[#3A2C2B] p-4 resize-none focus:bg-white transition-all"
              />
            </div>
          </div>
        </Card>

        {/* 4. Question Workspace (Medium Size) */}
        <div className="max-w-[1000px] mx-auto space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 md:py-4 border-b border-[#3A2C2B]/10">
             <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#3A2C2B] rounded-[10px] md:rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-lg md:text-base font-black text-[#3A2C2B] tracking-tight uppercase leading-tight">Question<br className="sm:hidden" /> Inventory</h2>
             </div>
             <div className="flex gap-2">
                <Button onClick={() => addQuestion('MCQ')} variant="outline" className="flex-1 sm:flex-none h-10 sm:h-8 px-4 rounded-xl border-[#3A2C2B]/20 text-[10px] sm:text-[8px] font-black uppercase text-[#3A2C2B] flex items-center justify-center gap-2 hover:bg-primary/5">
                  <List className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> MCQ
                </Button>
                <Button onClick={() => addQuestion('TEXT')} variant="outline" className="flex-1 sm:flex-none h-10 sm:h-8 px-4 rounded-xl border-[#3A2C2B]/20 text-[10px] sm:text-[8px] font-black uppercase text-[#3A2C2B] flex items-center justify-center gap-2 hover:bg-primary/5">
                  <Type className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> TEXT
                </Button>
             </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            {questions.map((q, idx) => (
              <Card key={q.id} className="rounded-[16px] md:rounded-[20px] shadow-sm border border-border/20 overflow-hidden bg-white hover:border-primary/20 transition-all group">
                <div className="px-3 py-2 md:px-5 md:py-3 border-b border-border/10 bg-[#fbfbfb] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-border/30 flex items-center justify-center font-black text-sm text-primary">
                      {idx + 1}
                    </div>
                    <span className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                      q.type === 'MCQ' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {q.type === 'MCQ' ? 'MCQ' : 'TEXT'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-[8px] font-black uppercase text-[#3A2C2B]/30 tracking-widest">Marks</label>
                      <Input 
                        type="number" 
                        value={q.marks} 
                        onChange={e => updateQuestion(q.id, { marks: e.target.value })}
                        className="w-10 h-7 bg-white border-border/40 rounded-lg text-center font-black text-primary p-0 text-[10px]"
                      />
                    </div>
                    <button 
                      onClick={() => removeQuestion(q.id)} 
                      className="w-8 h-8 rounded-lg bg-destructive/5 text-destructive/30 hover:bg-destructive hover:text-white transition-all flex items-center justify-center shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4 md:p-5 space-y-3 md:space-y-5">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] font-black uppercase text-[#3A2C2B]/40 tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Question
                    </label>
                    <Textarea 
                      placeholder="Type question statement..." 
                      value={q.question}
                      onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      className="bg-[#f9f9f9] border-border/20 rounded-2xl min-h-[60px] text-[13px] font-bold text-[#3A2C2B] p-4 focus:bg-white"
                    />
                  </div>

                  {q.type === 'MCQ' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="relative group/opt">
                          <Input 
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={e => updateOption(q.id, optIdx, e.target.value)}
                            className={cn(
                              "pl-12 h-11 bg-[#f9f9f9] border rounded-xl transition-all font-bold text-[12px] text-[#3A2C2B]",
                              q.correctAnswer === optIdx.toString() ? "border-primary bg-primary/5" : "border-border/20"
                            )}
                          />
                          <button 
                            onClick={() => updateQuestion(q.id, { correctAnswer: optIdx.toString() })}
                            className={cn(
                              "absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] transition-all shadow-sm z-10",
                              q.correctAnswer === optIdx.toString() ? "bg-primary text-white" : "bg-white text-[#3A2C2B]/30 border border-border/50"
                            )}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-[#3A2C2B]/30 tracking-widest">Correct Answer</label>
                      <Input 
                        placeholder="Model answer..." 
                        value={q.correctAnswer}
                        onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        className="bg-[#f9f9f9] border-border/20 rounded-xl h-11 px-4 font-bold text-[12px] text-[#3A2C2B]"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <button 
              onClick={() => addQuestion('MCQ')}
              className="w-full py-10 border-2 border-dashed border-border/30 rounded-[30px] flex flex-col items-center justify-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase text-[#3A2C2B]/40 group-hover:text-primary tracking-widest">New Question Item</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizBuilderPage;
