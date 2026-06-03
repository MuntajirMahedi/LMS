import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  User, 
  Clock, 
  Database
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { cn } from '../lib/utils';

const AuditLogsPage: React.FC = () => {
  const logs = [
    { id: 1, user: 'Admin Sarah', action: 'Modified Permissions', target: 'Teacher Role', time: '2 mins ago', ip: '192.168.1.1', severity: 'High' },
    { id: 2, user: 'Super Admin', action: 'Exported Financial Data', target: 'Finance Module', time: '15 mins ago', ip: '10.0.0.45', severity: 'Medium' },
    { id: 3, user: 'Principal John', action: 'Approved Admission', target: 'Student #1293', time: '1 hour ago', ip: '172.16.0.5', severity: 'Low' },
    { id: 4, user: 'HR Manager', action: 'Deleted Staff Record', target: 'Staff #402', time: '3 hours ago', ip: '192.168.1.12', severity: 'High' },
    { id: 5, user: 'IT Admin', action: 'System Backup', target: 'Database', time: '5 hours ago', ip: 'localhost', severity: 'Low' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <History className="w-10 h-10 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Real-time security monitoring and activity tracking.
          </p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-2xl font-bold bg-white">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button className="flex-1 lg:flex-none h-12 rounded-2xl font-black shadow-xl shadow-primary/20">
            Live Stream
          </Button>
        </div>
      </div>

      <Card className="rounded-[40px] border-border shadow-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 md:p-8 border-b border-border/50 bg-secondary/20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search logs by user, action or target..." className="pl-10 h-12 rounded-2xl border-border bg-white" />
            </div>
            <div className="flex w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto rounded-xl font-bold bg-white h-12 px-6">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full md:min-w-[700px]">
              <thead className="hidden md:table-header-group">
                <tr className="bg-secondary/50">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">User</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Action</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Target</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-muted-foreground">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 block md:table-row-group">
                {logs.map((log) => (
                  <tr key={log.id} className="block md:table-row hover:bg-secondary/30 transition-colors p-4 md:p-0 border-b md:border-b-0 last:border-b-0">
                    <td className="p-3 md:p-6 flex justify-between items-center md:table-cell border-b md:border-b-0 border-border/10">
                      <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-sm">{log.user}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-6 flex justify-between items-center md:table-cell border-b md:border-b-0 border-border/10">
                      <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</span>
                      <span className="font-medium text-sm text-foreground">{log.action}</span>
                    </td>
                    <td className="p-3 md:p-6 flex justify-between items-center md:table-cell border-b md:border-b-0 border-border/10">
                      <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target</span>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs bg-secondary px-2 py-1 rounded-md">{log.target}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-6 flex justify-between items-center md:table-cell border-b md:border-b-0 border-border/10">
                      <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">{log.time}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-6 flex justify-between items-center md:table-cell">
                      <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground">Severity</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        log.severity === 'High' ? "bg-destructive/10 text-destructive border-destructive/20" :
                        log.severity === 'Medium' ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20" :
                        "bg-brand-green/10 text-brand-green border-brand-green/20"
                      )}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
