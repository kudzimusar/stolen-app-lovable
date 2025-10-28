import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, X, AlertTriangle, Clock, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface ApprovalWorkflow {
  id: string;
  workflow_type: string;
  entity_id: string;
  entity_table: string;
  submitted_by: string;
  assigned_to: string;
  current_status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  value_amount?: number;
  submission_date: string;
  sla_deadline?: string;
  admin_notes?: string;
  escalation_reason?: string;
  submitted_by_user?: {
    email: string;
    display_name: string;
  };
}

interface ApprovalQueueProps {
  roleFilter?: string;
}

export const ApprovalQueue = ({ roleFilter }: ApprovalQueueProps) => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'escalated'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchWorkflows();
  }, [filter, roleFilter]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      let query = supabase
        .from('approval_workflows')
        .select(`
          *,
          submitted_by_user:submitted_by (
            email,
            display_name
          )
        `)
        .order('submission_date', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('current_status', filter);
      }

      if (roleFilter) {
        query = query.eq('workflow_type', roleFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching workflows:', error);
        toast.error('Failed to load approval queue');
      } else {
        setWorkflows(data || []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (workflow: ApprovalWorkflow, action: 'approve' | 'reject' | 'escalate') => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const response = await fetch('/api/v1/admin/workflow/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          workflow_id: workflow.id,
          action,
          admin_notes: adminNotes,
          reason: action === 'escalate' ? 'Manual escalation by admin' : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process workflow');
      }

      toast.success(`Workflow ${action}d successfully`);
      setAdminNotes('');
      setSelectedWorkflow(null);
      fetchWorkflows();
    } catch (error) {
      console.error('Error processing workflow:', error);
      toast.error(`Failed to ${action} workflow`);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (slaDeadline: string) => {
    const deadline = new Date(slaDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return 'Overdue';
    if (hours < 1) return 'Due soon';
    return `${hours}h remaining`;
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (searchTerm) {
      return workflow.workflow_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
             workflow.submitted_by_user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals ({filteredWorkflows.length})
          </CardTitle>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(workflow.priority)}>
                      {workflow.priority}
                    </Badge>
                    <Badge className={getStatusColor(workflow.current_status)}>
                      {workflow.current_status}
                    </Badge>
                    <span className="font-medium capitalize">
                      {workflow.workflow_type.replace('_', ' ')}
                    </span>
                    {workflow.value_amount && (
                      <span className="text-sm text-muted-foreground">
                        ${workflow.value_amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {workflow.sla_deadline && (
                      <span className="text-sm text-muted-foreground">
                        {getTimeRemaining(workflow.sla_deadline)}
                      </span>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Review {workflow.workflow_type.replace('_', ' ')}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Submitted By</label>
                              <p className="text-sm text-muted-foreground">
                                {workflow.submitted_by_user?.display_name || workflow.submitted_by_user?.email}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Priority</label>
                              <Badge className={getPriorityColor(workflow.priority)}>
                                {workflow.priority}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Submission Date</label>
                              <p className="text-sm text-muted-foreground">
                                {new Date(workflow.submission_date).toLocaleString()}
                              </p>
                            </div>
                            {workflow.sla_deadline && (
                              <div>
                                <label className="text-sm font-medium">SLA Deadline</label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(workflow.sla_deadline).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Admin Notes</label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes about this review..."
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => handleAction(workflow, 'reject')}
                              disabled={loading}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleAction(workflow, 'escalate')}
                              disabled={loading}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Escalate
                            </Button>
                            <Button
                              onClick={() => handleAction(workflow, 'approve')}
                              disabled={loading}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {workflow.escalation_reason && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    <strong>Escalation Reason:</strong> {workflow.escalation_reason}
                  </div>
                )}
              </div>
            ))}
            
            {filteredWorkflows.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No workflows found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
