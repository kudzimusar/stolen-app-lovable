import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface AdminTask {
  id: string;
  title: string;
  description?: string;
  task_type: string;
  assigned_to: string;
  assigned_by: string;
  delegated_to?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'delegated' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date?: string;
  sla_hours: number;
  started_at?: string;
  completed_at?: string;
  completion_notes?: string;
  escalation_count: number;
  created_at: string;
  assigned_to_user?: {
    email: string;
    display_name: string;
  };
  assigned_by_user?: {
    email: string;
    display_name: string;
  };
}

export const TaskManagement = () => {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all');
  const { user } = useAuth();

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    task_type: '',
    assigned_to: '',
    priority: 'normal' as const,
    due_date: '',
    related_entity_id: '',
    related_entity_table: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      let query = supabase
        .from('admin_tasks')
        .select(`
          *,
          assigned_to_user:assigned_to (
            email,
            display_name
          ),
          assigned_by_user:assigned_by (
            email,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const response = await fetch('/api/v1/admin/task/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      toast.success('Task created successfully');
      setShowAssignModal(false);
      setNewTask({
        title: '',
        description: '',
        task_type: '',
        assigned_to: '',
        priority: 'normal',
        due_date: '',
        related_entity_id: '',
        related_entity_table: ''
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (task: AdminTask, action: 'start' | 'complete' | 'escalate') => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      let updateData: any = {};
      
      switch (action) {
        case 'start':
          updateData = {
            status: 'in_progress',
            started_at: new Date().toISOString()
          };
          break;
        case 'complete':
          updateData = {
            status: 'completed',
            completed_at: new Date().toISOString()
          };
          break;
        case 'escalate':
          updateData = {
            status: 'escalated',
            escalation_count: task.escalation_count + 1
          };
          break;
      }

      const { error } = await supabase
        .from('admin_tasks')
        .update(updateData)
        .eq('id', task.id);

      if (error) {
        throw error;
      }

      toast.success(`Task ${action}d successfully`);
      fetchTasks();
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
      toast.error(`Failed to ${action} task`);
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
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delegated': return 'bg-purple-100 text-purple-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (dueDate: string, slaHours: number) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return 'Overdue';
    if (hours < slaHours / 4) return 'Due soon';
    return `${hours}h remaining`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Task Management
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Assign New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Task title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Task description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Task Type</label>
                        <Input
                          value={newTask.task_type}
                          onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                          placeholder="e.g., review, investigation"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Assigned To (User ID)</label>
                        <Input
                          value={newTask.assigned_to}
                          onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                          placeholder="User UUID"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="datetime-local"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTask} disabled={loading}>
                        Create Task
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <span className="font-medium">{task.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {task.task_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.due_date && (
                        <span className="text-sm text-muted-foreground">
                          {getTimeRemaining(task.due_date, task.sla_hours)}
                        </span>
                      )}
                      {task.status === 'assigned' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskAction(task, 'start')}
                          disabled={loading}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskAction(task, 'complete')}
                          disabled={loading}
                        >
                          Complete
                        </Button>
                      )}
                      {task.status !== 'completed' && task.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskAction(task, 'escalate')}
                          disabled={loading}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Escalate
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {task.assigned_to_user?.display_name || task.assigned_to_user?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>By: {task.assigned_by_user?.display_name || task.assigned_by_user?.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  
                  {task.escalation_count > 0 && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <strong>Escalated {task.escalation_count} time(s)</strong>
                    </div>
                  )}
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
