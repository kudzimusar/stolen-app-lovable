import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  MessageSquare,
  User,
  Clock,
  Send,
  Paperclip,
  Image,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    name: string;
    phone: string;
    email: string;
    device: string;
    issue: string;
  };
  type: "call" | "email" | "message";
}

export const CommunicationModal = ({ isOpen, onClose, customer, type }: CommunicationModalProps) => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const { toast } = useToast();

  // Mock message history
  const messageHistory = [
    {
      id: 1,
      sender: "shop",
      content: "Hi! Your device repair has been completed. The screen replacement was successful and we've tested all functionality.",
      timestamp: "2025-01-20 14:30",
      type: "message"
    },
    {
      id: 2,
      sender: "customer",
      content: "That's great! How much will it cost and when can I pick it up?",
      timestamp: "2025-01-20 14:45",
      type: "message"
    },
    {
      id: 3,
      sender: "shop",
      content: "Total cost is $299 as quoted. You can pick it up anytime after 3 PM today. We provide a 90-day warranty on the repair.",
      timestamp: "2025-01-20 15:00",
      type: "message"
    }
  ];

  const handleSend = () => {
    if (type === "call") {
      // Simulate making a phone call
      window.open(`tel:${customer.phone}`);
      toast({
        title: "Call Initiated",
        description: `Dialing ${customer.name} at ${customer.phone}`,
        variant: "default"
      });
    } else if (type === "email") {
      // Simulate sending email
      const emailBody = encodeURIComponent(message);
      const emailSubject = encodeURIComponent(subject || `Regarding your ${customer.device} repair`);
      window.open(`mailto:${customer.email}?subject=${emailSubject}&body=${emailBody}`);
      toast({
        title: "Email Opened",
        description: `Opening email client to send to ${customer.name}`,
        variant: "default"
      });
    } else {
      // Send in-app message
      toast({
        title: "Message Sent",
        description: `Message sent to ${customer.name}`,
        variant: "default"
      });
      setMessage("");
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case "call": return "Call Customer";
      case "email": return "Email Customer";
      case "message": return "Message Customer";
      default: return "Contact Customer";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "call": return <Phone className="w-5 h-5" />;
      case "email": return <Mail className="w-5 h-5" />;
      case "message": return <MessageSquare className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <User className="w-8 h-8 text-muted-foreground mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">{customer.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {customer.email}
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline">{customer.device}</Badge>
                    <span className="ml-2 text-xs">{customer.issue}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Call Interface */}
          {type === "call" && (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                <Phone className="w-12 h-12 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready to call</p>
                <p className="font-semibold text-lg">{customer.phone}</p>
              </div>
              <Button size="lg" onClick={handleSend} className="w-32">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          )}

          {/* Email Interface */}
          {type === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder={`Regarding your ${customer.device} repair`}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your email message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach File
                </Button>
                <Button variant="outline" size="sm">
                  <Image className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </div>
              <Button onClick={handleSend} disabled={!message.trim()} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          )}

          {/* Message Interface */}
          {type === "message" && (
            <div className="space-y-4">
              {/* Message History */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Messages</h4>
                {messageHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "shop" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === "shop"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {msg.timestamp}
                        {msg.sender === "shop" && <CheckCircle className="w-3 h-3" />}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">New Message</label>
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach
                </Button>
                <Button variant="outline" size="sm">
                  <Image className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={!message.trim()} 
                  className="ml-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {type !== "call" && (
            <Card className="p-4 bg-muted/30">
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const statusUpdate = `Hi ${customer.name}, your ${customer.device} repair is progressing well. We'll update you once complete.`;
                  setMessage(statusUpdate);
                }}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Status Update
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const completionMsg = `Great news! Your ${customer.device} repair is complete and ready for pickup. Please bring your ID and payment.`;
                  setMessage(completionMsg);
                }}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Repair Complete
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};