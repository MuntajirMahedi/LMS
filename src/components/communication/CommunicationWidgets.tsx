
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CommunicationMessage } from '../../types/communication';

export const NoticeCard = ({ message }: { message: CommunicationMessage }) => {
  const priorityColors = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-primary/10 text-primary',
    HIGH: 'bg-brand-orange/10 text-brand-orange',
    URGENT: 'bg-destructive/10 text-destructive'
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-none bg-white/60 backdrop-blur-md overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge className={cn("rounded-lg font-black text-[10px] uppercase tracking-wider", priorityColors[message.priority])}>
            {message.type} • {message.priority}
          </Badge>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(message.createdAt).toLocaleDateString()}</span>
        </div>
        <h3 className="text-lg font-black mb-2 group-hover:text-primary transition-colors">{message.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 font-medium mb-4 leading-relaxed">
          {message.content}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
              {message.senderName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-xs font-black">{message.senderName}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{message.senderRole.replace('_', ' ')}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 rounded-xl font-bold text-xs">
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const MessagePreview = ({ message }: { message: CommunicationMessage }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-white/40 transition-all cursor-pointer rounded-2xl group">
    <div className="relative">
      <div className="w-12 h-12 rounded-2xl bg-soft-parchment flex items-center justify-center font-black text-primary shadow-sm group-hover:scale-105 transition-transform">
        {message.senderName.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-green border-2 border-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-black text-sm truncate">{message.senderName}</h4>
        <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p className="text-xs text-muted-foreground font-medium truncate">{message.content}</p>
    </div>
  </div>
);

export const CommunicationStats = ({ stats }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: 'Unread', value: stats.unread || 0, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/5' },
      { label: 'Notices', value: stats.notices || 0, icon: Bell, color: 'text-brand-orange', bg: 'bg-brand-orange/5' },
      { label: 'Active Alerts', value: stats.alerts || 0, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/5' },
      { label: 'Sent', value: stats.sent || 0, icon: Send, color: 'text-brand-green', bg: 'bg-brand-green/5' },
    ].map((stat, i) => (
      <div key={i} className={cn("p-4 rounded-3xl border border-border/50 flex flex-col items-center text-center", stat.bg)}>
        <div className={cn("w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2", stat.color)}>
          <stat.icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-black">{stat.value}</p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
      </div>
    ))}
  </div>
);

export const QuickBroadcast = ({ onCompose }: { onCompose: () => void }) => (
  <Card className="border-none bg-gradient-to-br from-primary to-[#d66b5c] text-white overflow-hidden relative shadow-2xl shadow-primary/20">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
    <CardContent className="p-8 relative z-10">
      <h3 className="text-2xl font-black mb-2">Global Broadcast</h3>
      <p className="text-white/80 font-medium text-sm mb-6 max-w-xs">Instantly notify students, parents, and staff about important updates.</p>
      <Button 
        onClick={onCompose}
        className="bg-white text-primary hover:bg-white/90 rounded-2xl px-8 h-12 font-black shadow-xl shadow-black/10 group"
      >
        <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
        Start Broadcast
      </Button>
    </CardContent>
  </Card>
);
