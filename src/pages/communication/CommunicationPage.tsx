import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  Megaphone,
  User,
  BadgeCheck
} from 'lucide-react';
import { useCommunication } from '../../hooks/useCommunication';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const CommunicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages } = useCommunication();
  
  const recentNotices = messages.filter(m => m.type === 'NOTICE').slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-10 sm:pb-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-1 sm:mb-2 text-[#3A2C2B] uppercase">Communication Center</h1>
          <p className="text-[10px] sm:text-base text-muted-foreground font-medium italic">Broadcast announcements and manage real-time messaging</p>
        </div>
      </div>

      {/* Top Row: Action Bars */}
      <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-0">
        {/* Messenger Card */}
        <Card 
          className="rounded-2xl sm:rounded-[20px] border-none shadow-xl sm:shadow-xl bg-primary overflow-hidden group cursor-pointer min-h-[80px] sm:h-24"
          onClick={() => navigate('chat')}
        >
          <CardContent className="p-0 h-full relative">
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 rounded-full -mr-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex flex-col sm:flex-row sm:items-center h-full px-4 sm:px-10 py-4 sm:py-0 gap-4 sm:gap-8 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Open Messenger</h2>
                <p className="text-white/70 text-[10px] sm:text-xs font-medium line-clamp-1 sm:line-clamp-none">Chat with teachers, students and parents in real-time</p>
              </div>
              <div className="flex items-center gap-2 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] group-hover:translate-x-2 transition-transform self-end sm:self-auto">
                ENTER MESSENGER <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Broadcast Card */}
        <Card 
          className="rounded-2xl sm:rounded-[20px] border-none shadow-xl sm:shadow-xl bg-brand-orange overflow-hidden group cursor-pointer min-h-[80px] sm:h-24"
          onClick={() => navigate('compose')}
        >
          <CardContent className="p-0 h-full relative">
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 rounded-full -mr-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex flex-col sm:flex-row sm:items-center h-full px-4 sm:px-10 py-4 sm:py-0 gap-4 sm:gap-8 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">Global Broadcast</h2>
                <p className="text-white/70 text-[10px] sm:text-xs font-medium line-clamp-1 sm:line-clamp-none">Send official notices and announcements to the school</p>
              </div>
              <div className="flex items-center gap-2 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] group-hover:translate-x-2 transition-transform self-end sm:self-auto">
                CREATE BROADCAST <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notices Section */}
      <div className="px-4 sm:px-0">
        <div className="rounded-2xl sm:rounded-[20px] border border-border/50 sm:border border-border/10 shadow-lg sm:shadow-sm bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50 sm:hidden">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#3A2C2B]">Recent Notices</h3>
          </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#3A2C2B] text-white">
                <th className="px-4 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest border-none">Notice Details</th>
                <th className="px-4 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest border-none">Sender</th>
                <th className="px-4 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest border-none">Priority</th>
                <th className="px-4 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest border-none">Date</th>
                <th className="px-4 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest border-none text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentNotices.length > 0 ? (
                recentNotices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-4 sm:px-8 py-6">
                      <div>
                        <p className="text-sm font-black text-[#3A2C2B] mb-1 group-hover:text-primary transition-colors">{notice.title}</p>
                        <p className="text-xs font-medium text-muted-foreground line-clamp-1">{notice.content}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-soft-parchment flex items-center justify-center text-primary">
                          <User className="w-4 h-4" />
                        </div>
                        <span>{notice.senderName}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <Badge 
                        variant={
                          notice.priority === 'URGENT' ? 'destructive' : 
                          notice.priority === 'HIGH' ? 'brand-orange' : 'secondary'
                        }
                        className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg"
                      >
                        {notice.priority}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-sm font-bold text-muted-foreground">
                      {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 sm:px-8 py-6 text-right">
                      <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <BadgeCheck className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No recent notices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPage;
