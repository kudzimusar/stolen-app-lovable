import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Clock, 
  Globe, 
  HeadphonesIcon,
  Users,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: 'chat' | 'call' | 'email' | 'whatsapp';
  available: boolean;
  waitTime?: string;
  action: () => void;
}

export const SupportContactWidget = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const supportOptions: SupportOption[] = [
    {
      id: 'live-chat',
      title: 'Live Chat',
      description: 'Chat with our support team instantly',
      icon: MessageCircle,
      type: 'chat',
      available: true,
      waitTime: '< 2 minutes',
      action: () => {
        // Trigger the existing LiveChatWidget
        const chatWidget = document.querySelector('[data-chat-widget]') as HTMLElement;
        if (chatWidget) {
          chatWidget.click();
        } else {
          // Fallback - show chat in context
          window.dispatchEvent(new CustomEvent('openLiveChat', { detail: { context: 'wallet-support' } }));
        }
        setIsOpen(false);
        toast({
          title: 'Live Chat Opened',
          description: 'Our support team will assist you shortly',
          variant: 'default'
        });
      }
    },
    {
      id: 'phone-support',
      title: 'Phone Support',
      description: 'Call our South African support line',
      icon: Phone,
      type: 'call',
      available: true,
      waitTime: '< 5 minutes',
      action: () => {
        // South African support number
        window.open('tel:+27117840000', '_self');
        setIsOpen(false);
        toast({
          title: 'Calling Support',
          description: 'Connecting you to +27 11 784 0000',
          variant: 'default'
        });
      }
    },
    {
      id: 'whatsapp-support',
      title: 'WhatsApp Support',
      description: 'Chat via WhatsApp Business',
      icon: MessageCircle,
      type: 'whatsapp',
      available: true,
      waitTime: '< 10 minutes',
      action: () => {
        // WhatsApp Business number for South Africa
        const whatsappUrl = 'https://wa.me/27117840000?text=Hi%20STOLEN%20Support,%20I%20need%20help%20with%20my%20S-Pay%20wallet';
        window.open(whatsappUrl, '_blank');
        setIsOpen(false);
        toast({
          title: 'WhatsApp Opened',
          description: 'Redirecting to WhatsApp Business chat',
          variant: 'default'
        });
      }
    },
    {
      id: 'email-support',
      title: 'Email Support',
      description: 'Send detailed inquiry via email',
      icon: Mail,
      type: 'email',
      available: true,
      waitTime: '< 4 hours',
      action: () => {
        const emailSubject = 'S-Pay Wallet Support Request';
        const emailBody = 'Hi STOLEN Support Team,\n\nI need assistance with my S-Pay wallet.\n\nIssue Description:\n[Please describe your issue here]\n\nAccount Details:\n- User ID: [Your user ID]\n- Wallet Balance: [Current balance]\n\nThank you for your assistance.';
        const mailtoUrl = `mailto:support@stolen.co.za?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoUrl, '_self');
        setIsOpen(false);
        toast({
          title: 'Email Client Opened',
          description: 'Pre-filled support email ready to send',
          variant: 'default'
        });
      }
    }
  ];

  const getStatusColor = (available: boolean) => {
    return available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (available: boolean) => {
    return available ? 'Available' : 'Offline';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
        >
          <HeadphonesIcon className="w-4 h-4" />
          Contact Support
          <Badge variant="secondary" className="ml-auto">
            24/7
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contact Support Team
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Support Hours */}
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Support Hours:</span>
                <span>24/7 (Chat & WhatsApp)</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1 ml-6">
                <span>Phone: Mon-Fri 8AM-6PM SAST</span>
              </div>
            </CardContent>
          </Card>

          {/* Support Options */}
          <div className="space-y-3">
            {supportOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Card 
                  key={option.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={option.action}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{option.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(option.available)}
                          >
                            {getStatusText(option.available)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {option.description}
                        </p>
                        {option.waitTime && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Zap className="w-3 h-3" />
                            <span>Avg. response: {option.waitTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Emergency Contact */}
          <Card className="border-red-100 bg-red-50">
            <CardContent className="p-3">
              <div className="text-sm">
                <div className="font-medium text-red-800 mb-1">🚨 Emergency Fraud Hotline</div>
                <div className="text-red-700">
                  If you suspect fraudulent activity, call immediately:
                </div>
                <div className="font-mono text-red-800 mt-1">
                  +27 11 784 0000 (24/7)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
