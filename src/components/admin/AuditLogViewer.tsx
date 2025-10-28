import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  target_table: string;
  old_values?: any;
  new_values?: any;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
  actor_user?: {
    email: string;
    display_name: string;
  };
}

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState({
    actor: '',
    action: '',
    target_type: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      let query = supabase
        .from('admin_audit_log')
        .select(`
          *,
          actor_user:actor_id (
            email,
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.actor) {
        query = query.eq('actor_id', filters.actor);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.target_type) {
        query = query.eq('target_type', filters.target_type);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to load audit logs');
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Actor', 'Action', 'Target Type', 'Target ID', 'Reason', 'IP Address'].join(','),
        ...logs.map(log => [
          new Date(log.created_at).toISOString(),
          log.actor_user?.display_name || log.actor_user?.email || 'Unknown',
          log.action,
          log.target_type,
          log.target_id,
          log.reason || '',
          log.ip_address || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit log exported successfully');
    } catch (error) {
      console.error('Error exporting audit log:', error);
      toast.error('Failed to export audit log');
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'approve': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'escalate': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      return log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
             log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
             log.actor_user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            System Audit Log ({filteredLogs.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-sm font-medium">Actor</label>
              <Input
                value={filters.actor}
                onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
                placeholder="Actor ID"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="INSERT">Insert</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="escalate">Escalate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Target Type</label>
              <Select value={filters.target_type} onValueChange={(value) => setFilters({ ...filters, target_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="marketplace_listings">Listings</SelectItem>
                  <SelectItem value="insurance_claims">Claims</SelectItem>
                  <SelectItem value="repair_orders">Repairs</SelectItem>
                  <SelectItem value="lost_found_reports">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Logs */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="font-medium">{log.target_type}</span>
                      <span className="text-sm text-muted-foreground">
                        {log.actor_user?.display_name || log.actor_user?.email || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Actor</label>
                                <p className="text-sm text-muted-foreground">
                                  {log.actor_user?.display_name || log.actor_user?.email || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Action</label>
                                <Badge className={getActionColor(log.action)}>
                                  {log.action}
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Target Type</label>
                                <p className="text-sm text-muted-foreground">{log.target_type}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Target ID</label>
                                <p className="text-sm text-muted-foreground">{log.target_id}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Timestamp</label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(log.created_at).toLocaleString()}
                                </p>
                              </div>
                              {log.ip_address && (
                                <div>
                                  <label className="text-sm font-medium">IP Address</label>
                                  <p className="text-sm text-muted-foreground">{log.ip_address}</p>
                                </div>
                              )}
                            </div>
                            
                            {log.reason && (
                              <div>
                                <label className="text-sm font-medium">Reason</label>
                                <p className="text-sm text-muted-foreground">{log.reason}</p>
                              </div>
                            )}
                            
                            {log.old_values && (
                              <div>
                                <label className="text-sm font-medium">Previous Values</label>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {log.new_values && (
                              <div>
                                <label className="text-sm font-medium">New Values</label>
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {log.reason && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Reason:</strong> {log.reason}
                    </p>
                  )}
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs found
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
