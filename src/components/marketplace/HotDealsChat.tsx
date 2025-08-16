import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  ShieldCheck,
  Clock,
  AlertTriangle,
  Heart,
  Package,
  Zap
} from "lucide-react";

interface HotDealsChatProps {
  dealId: number;
  onClose: () => void;
}

const HotDealsChat = ({ dealId, onClose }: HotDealsChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock initial messages - in real app would load from API
    setMessages([
      {
        id: 1,
        sender: "seller",
        content: "Hi! Thanks for your interest in my iPhone 15 Pro Max. It's in excellent condition!",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: "text"
      },
      {
        id: 2,
        sender: "buyer",
        content: "Great! Is the original box and accessories included?",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        type: "text"
      },
      {
        id: 3,
        sender: "seller",
        content: "Yes, everything is included - box, charger, cable, and unused EarPods. Also have the receipt.",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        type: "text"
      },
      {
        id: 4,
        sender: "system",
        content: "🔒 This conversation is protected by STOLEN's anti-fraud AI scanning.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        type: "system"
      },
      {
        id: 5,
        sender: "ai-assistant",
        content: "💡 AI Suggestion: Based on similar deals, R15,500 would be a competitive price for this condition.",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        type: "ai-suggestion"
      }
    ]);
  }, [dealId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "buyer",
      content: message,
      timestamp: new Date(),
      type: "text"
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Mock seller response after a delay
    setTimeout(() => {
      const sellerResponse = {
        id: messages.length + 2,
        sender: "seller",
        content: "Let me know if you have any other questions! I'm available for a quick call if needed.",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, sellerResponse]);
    }, 2000);
  };

  const dealInfo = {
    title: "iPhone 15 Pro Max 256GB",
    price: 16999,
    seller: "TechPro_ZA",
    timeLeft: "5 hours",
    verified: true
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              ←
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://placehold.co/40x40?text=TP" />
              <AvatarFallback>TP</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{dealInfo.seller}</span>
                {dealInfo.verified && (
                  <ShieldCheck className="w-4 h-4 text-verified" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{dealInfo.timeLeft} left</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Deal Summary */}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-4">
          <img 
            src="https://placehold.co/60x60?text=iPhone" 
            alt={dealInfo.title}
            className="w-15 h-15 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold">{dealInfo.title}</h4>
            <p className="text-lg font-bold text-primary">R{dealInfo.price.toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm">
              <Package className="w-4 h-4 mr-2" />
              Make Offer
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'system' ? (
              <div className="text-center w-full">
                <Badge variant="secondary" className="bg-muted">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {msg.content}
                </Badge>
              </div>
            ) : (
              <div className={`max-w-[75%] ${msg.sender === 'buyer' ? 'order-2' : 'order-1'}`}>
                <Card className={`p-3 ${
                  msg.sender === 'buyer' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </Card>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-3 h-3" />
          <span>Protected by AI fraud detection & real-time scanning</span>
        </div>
      </div>
    </div>
  );
};

export default HotDealsChat;