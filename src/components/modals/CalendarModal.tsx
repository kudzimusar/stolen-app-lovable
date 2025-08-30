import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Wrench
} from "lucide-react";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Appointment {
  id: number;
  customer: string;
  device: string;
  issue: string;
  time: string;
  date: string;
  phone: string;
  status: "confirmed" | "pending" | "completed";
  type: "repair" | "consultation" | "pickup";
}

export const CalendarModal = ({ isOpen, onClose }: CalendarModalProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");

  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: 1,
      customer: "Emma Davis",
      device: "iPad Pro",
      issue: "Screen not responding",
      time: "10:00 AM",
      date: "2025-01-21",
      phone: "+1 (555) 123-4567",
      status: "confirmed",
      type: "repair"
    },
    {
      id: 2,
      customer: "Robert Chen",
      device: "iPhone 14",
      issue: "Camera malfunction",
      time: "2:30 PM", 
      date: "2025-01-21",
      phone: "+1 (555) 987-6543",
      status: "confirmed",
      type: "repair"
    },
    {
      id: 3,
      customer: "Lisa Anderson",
      device: "MacBook Air",
      issue: "Keyboard issues",
      time: "4:00 PM",
      date: "2025-01-21",
      phone: "+1 (555) 456-7890",
      status: "pending",
      type: "consultation"
    },
    {
      id: 4,
      customer: "John Smith",
      device: "Samsung Galaxy S24",
      issue: "Water damage repair completed",
      time: "11:00 AM",
      date: "2025-01-22",
      phone: "+1 (555) 111-2222",
      status: "completed",
      type: "pickup"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "repair": return <Wrench className="w-3 h-3" />;
      case "consultation": return <User className="w-3 h-3" />;
      case "pickup": return <MapPin className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const todayAppointments = appointments.filter(apt => 
    apt.date === selectedDate.toISOString().split('T')[0]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Repair Shop Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Month
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="space-y-4">
            <h3 className="text-md font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule for {selectedDate.toLocaleDateString()}
            </h3>

            {todayAppointments.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-muted-foreground">No appointments scheduled</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Your schedule is clear for this date.
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getTypeIcon(appointment.type)}
                            <span className="ml-1 capitalize">{appointment.type}</span>
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{appointment.customer}</h4>
                          <p className="text-sm text-muted-foreground">
                            {appointment.device} - {appointment.issue}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {appointment.phone}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {appointments.filter(a => a.status === "confirmed").length}
              </div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {appointments.filter(a => a.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {appointments.filter(a => a.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};