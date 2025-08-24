import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Upload,
  FileText,
  Camera,
  Phone,
  Video,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Scale,
  Send,
  Paperclip
} from "lucide-react";

interface Dispute {
  id: string;
  repairId: string;
  customerName: string;
  customerAvatar?: string;
  deviceModel: string;
  issueType: 'quality' | 'cost' | 'timeline' | 'damage' | 'warranty';
  status: 'open' | 'in_review' | 'mediation' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdDate: string;
  lastActivity: string;
  description: string;
  requestedResolution: string;
  evidence: string[];
  messages: Message[];
  insuranceInvolved: boolean;
  lawEnforcementInvolved: boolean;
}

interface Message {
  id: string;
  sender: 'customer' | 'repairer' | 'mediator' | 'insurance' | 'law_enforcement';
  content: string;
  timestamp: string;
  attachments?: string[];
}

const DisputeMediationCenter = () => {
  const { toast } = useToast();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [filter, setFilter] = useState("all");

  // Mock dispute data
  const disputes: Dispute[] = [
    {
      id: "DISP-2024-001",
      repairId: "REP-2024-001",
      customerName: "John Smith",
      deviceModel: "iPhone 15 Pro",
      issueType: "quality",
      status: "open",
      priority: "high",
      createdDate: "2024-01-20",
      lastActivity: "2024-01-20",
      description: "Screen replacement was completed but device now has issues with touch sensitivity in certain areas.",
      requestedResolution: "Re-repair or full refund",
      evidence: ["photo1.jpg", "video1.mp4"],
      insuranceInvolved: false,
      lawEnforcementInvolved: false,
      messages: [
        {
          id: "1",
          sender: "customer",
          content: "The screen repair you did yesterday has problems. The top right corner doesn't respond to touch properly.",
          timestamp: "2024-01-20 14:30",
          attachments: ["photo1.jpg"]
        },
        {
          id: "2",
          sender: "repairer",
          content: "I understand your concern. Can you bring the device back so I can inspect the issue? I want to make sure you're completely satisfied.",
          timestamp: "2024-01-20 15:45"
        }
      ]
    },
    {
      id: "DISP-2024-002",
      repairId: "REP-2024-002",
      customerName: "Sarah Johnson",
      deviceModel: "Samsung Galaxy S24",
      issueType: "cost",
      status: "mediation",
      priority: "medium",
      createdDate: "2024-01-18",
      lastActivity: "2024-01-19",
      description: "Final repair cost was significantly higher than initial estimate without proper communication.",
      requestedResolution: "Reduce cost to original estimate",
      evidence: ["receipt.pdf", "estimate.pdf"],
      insuranceInvolved: true,
      lawEnforcementInvolved: false,
      messages: [
        {
          id: "1",
          sender: "customer",
          content: "The original estimate was $150 but I was charged $280. This was not communicated to me beforehand.",
          timestamp: "2024-01-18 10:15"
        },
        {
          id: "2",
          sender: "repairer",
          content: "Additional damage was discovered during repair that required extra parts. I tried calling but couldn't reach you.",
          timestamp: "2024-01-18 11:30"
        },
        {
          id: "3",
          sender: "mediator",
          content: "I'm reviewing both parties' evidence. Let's schedule a call to resolve this matter.",
          timestamp: "2024-01-19 09:00"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning/10 text-warning border-warning';
      case 'in_review': return 'bg-primary/10 text-primary border-primary';
      case 'mediation': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'resolved': return 'bg-success/10 text-success border-success';
      case 'escalated': return 'bg-destructive/10 text-destructive border-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'customer': return <Users className="w-4 h-4" />;
      case 'repairer': return <Shield className="w-4 h-4" />;
      case 'mediator': return <Scale className="w-4 h-4" />;
      case 'insurance': return <FileText className="w-4 h-4" />;
      case 'law_enforcement': return <Shield className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedDispute) return;

    toast({
      title: "Message Sent",
      description: "Your response has been sent to the customer",
    });
    setNewMessage("");
  };

  const handleResolveDispute = (disputeId: string) => {
    toast({
      title: "Dispute Resolved",
      description: "Resolution recorded on blockchain and all parties notified",
    });
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === "all") return true;
    return dispute.status === filter;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Dispute & Mediation Center" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/repair-shop-dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Scale className="w-8 h-8 text-primary" />
              Dispute & Mediation Center
            </h1>
            <p className="text-muted-foreground">Resolve customer complaints and issues</p>
          </div>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{disputes.filter(d => d.status === 'open').length}</div>
            <div className="text-sm text-muted-foreground">Open</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{disputes.filter(d => d.status === 'in_review').length}</div>
            <div className="text-sm text-muted-foreground">In Review</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{disputes.filter(d => d.status === 'mediation').length}</div>
            <div className="text-sm text-muted-foreground">Mediation</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{disputes.filter(d => d.status === 'resolved').length}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{disputes.filter(d => d.status === 'escalated').length}</div>
            <div className="text-sm text-muted-foreground">Escalated</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'open', 'in_review', 'mediation', 'resolved'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Button>
          ))}
        </div>

        {/* Disputes List */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Disputes ({filteredDisputes.length})</h2>
            {filteredDisputes.map((dispute) => (
              <Card 
                key={dispute.id} 
                className={`p-4 cursor-pointer transition-colors hover:bg-accent ${selectedDispute?.id === dispute.id ? 'bg-accent' : ''}`}
                onClick={() => setSelectedDispute(dispute)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={dispute.customerAvatar} />
                        <AvatarFallback>{dispute.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{dispute.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{dispute.deviceModel}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getPriorityColor(dispute.priority)}>
                        {dispute.priority}
                      </Badge>
                      <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dispute.issueType}
                      </Badge>
                      {dispute.insuranceInvolved && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Insurance
                        </Badge>
                      )}
                      {dispute.lawEnforcementInvolved && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                          Law Enforcement
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2">{dispute.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created: {dispute.createdDate}</span>
                      <span>Last activity: {dispute.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Dispute Detail & Chat */}
          <div className="space-y-4">
            {selectedDispute ? (
              <>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Dispute Details</h2>
                      <Badge className={getStatusColor(selectedDispute.status)}>
                        {selectedDispute.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Dispute ID:</strong> {selectedDispute.id}<br/>
                        <strong>Repair ID:</strong> {selectedDispute.repairId}<br/>
                        <strong>Issue Type:</strong> {selectedDispute.issueType}
                      </div>
                      <div>
                        <strong>Priority:</strong> {selectedDispute.priority}<br/>
                        <strong>Created:</strong> {selectedDispute.createdDate}<br/>
                        <strong>Evidence:</strong> {selectedDispute.evidence.length} files
                      </div>
                    </div>

                    <div>
                      <strong>Requested Resolution:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedDispute.requestedResolution}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4 mr-2" />
                        Video Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        View Evidence
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleResolveDispute(selectedDispute.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Chat Messages */}
                <Card className="p-0">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Communication Thread</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                    {selectedDispute.messages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.sender === 'repairer' ? 'flex-row-reverse' : ''}`}>
                        <div className="p-2 bg-muted rounded-full">
                          {getSenderIcon(message.sender)}
                        </div>
                        <div className={`flex-1 space-y-1 ${message.sender === 'repairer' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">{message.sender.replace('_', ' ')}</span>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                          <div className={`p-3 rounded-lg text-sm ${
                            message.sender === 'repairer' 
                              ? 'bg-primary text-primary-foreground ml-8' 
                              : 'bg-muted mr-8'
                          }`}>
                            {message.content}
                          </div>
                          {message.attachments && (
                            <div className="flex gap-2 text-xs">
                              {message.attachments.map((file, index) => (
                                <Button key={index} variant="ghost" size="sm">
                                  <Paperclip className="w-3 h-3 mr-1" />
                                  {file}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your response..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Camera className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={handleSendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Select a Dispute</h3>
                <p className="text-muted-foreground">Choose a dispute from the list to view details and respond</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeMediationCenter;