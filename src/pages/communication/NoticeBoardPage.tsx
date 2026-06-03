import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ArrowLeft, 
  Search, 
  LayoutGrid, 
  List,
  Calendar,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCommunication } from '../../hooks/useCommunication';
import { NoticeCard } from '../../components/communication/CommunicationWidgets';
import { cn } from '../../lib/utils';

const NoticeBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages } = useCommunication();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('ALL');

  const notices = messages.filter(m => m.type === 'NOTICE');
  
  const filteredNotices = notices.filter(n => {
    if (filter === 'ALL') return true;
    return n.priority === filter;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 sm:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 sm:px-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/communication')}
            className="rounded-xl bg-primary/5 hover:bg-primary/10 p-2 shrink-0 h-10 w-10 sm:h-12 sm:w-12"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#3A2C2B]" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2 sm:gap-3 text-[#3A2C2B]">
              <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-brand-orange" />
              Notice Board
            </h1>
            <p className="text-xs sm:text-base text-muted-foreground font-medium mt-1 truncate sm:whitespace-normal">
              Official school announcements and academic updates.
            </p>
          </div>
        </div>
        <div className="flex gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-border/50">
          <Button 
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="rounded-xl px-4 font-black text-xs"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="rounded-xl px-4 font-black text-xs"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-transparent sm:bg-white p-4 sm:p-6 rounded-none sm:rounded-[20px] border-none sm:border border-border/10 shadow-none sm:shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search notices by title, content or sender..." className="pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-none bg-[#3A2C2B]/5 font-medium text-xs sm:text-sm" />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto scrollbar-hide py-1">
          <div className="flex gap-2 min-w-max">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-10 px-6 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all",
                  filter === f ? "bg-[#3A2C2B] text-white shadow-lg shadow-black/10" : "bg-white border-[#3A2C2B]/10 text-[#3A2C2B]"
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-black bg-white text-[#3A2C2B] border-[#3A2C2B]/10 uppercase text-[10px] tracking-widest w-full lg:w-auto">
          <Calendar className="w-4 h-4 mr-2" />
          Academic Session
        </Button>
      </div>

      {/* Notices Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredNotices.map(notice => (
            <NoticeCard key={notice.id} message={notice} />
          ))}
        </div>
      ) : (
        <div className="space-y-0 sm:space-y-4">
          {filteredNotices.map(notice => (
            <div key={notice.id} className="bg-transparent sm:bg-white p-4 sm:p-6 rounded-none sm:rounded-[20px] border-b sm:border border-border/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:hover:shadow-xl transition-all group cursor-pointer">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black shrink-0">
                  {notice.senderName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-[#3A2C2B] group-hover:text-primary transition-colors leading-tight">{notice.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-white bg-primary px-2 py-0.5 rounded-md">{notice.priority}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">by {notice.senderName} • {new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="hidden sm:block w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              <Button variant="ghost" className="sm:hidden w-full h-10 rounded-xl text-[10px] font-black uppercase text-primary bg-primary/5">
                View Details <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {filteredNotices.length === 0 && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-12 bg-white/20 rounded-[40px] border border-dashed border-border">
          <div className="w-20 h-20 bg-soft-parchment rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Bell className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-black mb-2">No Notices Found</h2>
          <p className="text-muted-foreground font-medium max-w-sm">
            We couldn't find any notices matching your current filters or role visibility.
          </p>
        </div>
      )}
    </div>
  );
};

export default NoticeBoardPage;
