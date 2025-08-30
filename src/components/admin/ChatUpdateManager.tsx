import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aiChatUpdateService } from "@/lib/services/ai-chat-update-service";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Zap, 
  Shield, 
  Smartphone, 
  ShoppingCart, 
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface ChatUpdateForm {
  id: string;
  type: 'feature' | 'policy' | 'security' | 'ui' | 'integration';
  title: string;
  description: string;
  keywords: string;
  responses: string;
  actions: string;
  followUpQuestions: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}

export const ChatUpdateManager = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChatUpdateForm>({
    id: '',
    type: 'feature',
    title: '',
    description: '',
    keywords: '',
    responses: '',
    actions: '',
    followUpQuestions: '',
    priority: 'medium',
    isActive: true
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = () => {
    const activeUpdates = aiChatUpdateService.getActiveUpdates();
    setUpdates(activeUpdates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const update = {
      ...form,
      keywords: form.keywords.split(',').map(k => k.trim()),
      responses: form.responses.split('\n').filter(r => r.trim()),
      actions: form.actions.split(',').map(a => a.trim()),
      followUpQuestions: form.followUpQuestions.split('\n').filter(q => q.trim()),
      effectiveDate: new Date(),
      expiresDate: undefined
    };

    if (editingId) {
      // Update existing
      await aiChatUpdateService.addChatUpdate(update);
    } else {
      // Add new
      await aiChatUpdateService.addChatUpdate(update);
    }

    resetForm();
    loadUpdates();
  };

  const handleEdit = (update: any) => {
    setEditingId(update.id);
    setForm({
      id: update.id,
      type: update.type,
      title: update.title,
      description: update.description,
      keywords: update.keywords.join(', '),
      responses: update.responses.join('\n'),
      actions: update.actions.join(', '),
      followUpQuestions: update.followUpQuestions.join('\n'),
      priority: update.priority,
      isActive: update.isActive
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setForm({
      id: '',
      type: 'feature',
      title: '',
      description: '',
      keywords: '',
      responses: '',
      actions: '',
      followUpQuestions: '',
      priority: 'medium',
      isActive: true
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Smartphone className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'policy': return <Settings className="w-4 h-4" />;
      case 'ui': return <Activity className="w-4 h-4" />;
      case 'integration': return <TrendingUp className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = aiChatUpdateService.getUpdateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat Update Manager</h1>
          <p className="text-muted-foreground">Manage AI chat responses and platform updates</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Update
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Updates</p>
              <p className="text-2xl font-bold">{stats.totalUpdates}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Updates</p>
              <p className="text-2xl font-bold">{stats.activeUpdates}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold">{stats.byPriority.high || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{stats.byPriority.critical || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Form */}
      {isEditing && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Update' : 'Add New Update'}
            </h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Update ID</label>
                <Input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="unique-update-id"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={(value: any) => setForm({ ...form, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Update title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the update"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Keywords (comma-separated)</label>
              <Input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Responses (one per line)</label>
              <Textarea
                value={form.responses}
                onChange={(e) => setForm({ ...form, responses: e.target.value })}
                placeholder="Response 1&#10;Response 2&#10;Response 3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Actions (comma-separated)</label>
                <Input
                  value={form.actions}
                  onChange={(e) => setForm({ ...form, actions: e.target.value })}
                  placeholder="Action 1, Action 2, Action 3"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={form.priority} onValueChange={(value: any) => setForm({ ...form, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Follow-up Questions (one per line)</label>
              <Textarea
                value={form.followUpQuestions}
                onChange={(e) => setForm({ ...form, followUpQuestions: e.target.value })}
                placeholder="Question 1&#10;Question 2&#10;Question 3"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Active</label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Updates</h2>
        {updates.map((update) => (
          <Card key={update.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(update.type)}
                  <h3 className="font-semibold">{update.title}</h3>
                  <Badge className={getPriorityColor(update.priority)}>
                    {update.priority}
                  </Badge>
                  {update.isActive ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {update.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Effective: {update.effectiveDate.toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(update)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
