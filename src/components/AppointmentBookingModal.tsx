import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Wrench,
  Plus,
  Save
} from "lucide-react";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentBookingModal = ({ isOpen, onClose }: AppointmentBookingModalProps) => {
  const [appointment, setAppointment] = useState({
    customerName: "",
    phone: "",
    email: "",
    device: "",
    issue: "",
    date: "",
    time: "",
    type: "repair",
    notes: ""
  });

  const { toast } = useToast();

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  const appointmentTypes = [
    { value: "repair", label: "Repair Service", icon: <Wrench className="w-4 h-4" /> },
    { value: "consultation", label: "Consultation", icon: <User className="w-4 h-4" /> },
    { value: "pickup", label: "Device Pickup", icon: <Calendar className="w-4 h-4" /> },
    { value: "estimate", label: "Repair Estimate", icon: <Clock className="w-4 h-4" /> }
  ];

  const handleSubmit = () => {
    if (!appointment.customerName || !appointment.phone || !appointment.date || !appointment.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Appointment Scheduled",
      description: `Appointment scheduled for ${appointment.customerName} on ${appointment.date} at ${appointment.time}`,
      variant: "default"
    });

    // Reset form
    setAppointment({
      customerName: "",
      phone: "",
      email: "",
      device: "",
      issue: "",
      date: "",
      time: "",
      type: "repair",
      notes: ""
    });

    onClose();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Schedule New Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="John Smith"
                  value={appointment.customerName}
                  onChange={(e) => setAppointment(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={appointment.phone}
                  onChange={(e) => setAppointment(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.smith@email.com"
                  value={appointment.email}
                  onChange={(e) => setAppointment(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          {/* Device Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Device & Issue Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="device">Device Model</Label>
                  <Input
                    id="device"
                    placeholder="iPhone 15 Pro, MacBook Air, etc."
                    value={appointment.device}
                    onChange={(e) => setAppointment(prev => ({ ...prev, device: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={appointment.type}
                    onChange={(e) => setAppointment(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {appointmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Description</Label>
                <Textarea
                  id="issue"
                  placeholder="Describe the problem with the device..."
                  value={appointment.issue}
                  onChange={(e) => setAppointment(prev => ({ ...prev, issue: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  min={getTomorrowDate()}
                  value={appointment.date}
                  onChange={(e) => setAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <select
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={appointment.time}
                  onChange={(e) => setAppointment(prev => ({ ...prev, time: e.target.value }))}
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Additional Notes */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Additional Notes</h3>
            <Textarea
              placeholder="Any special instructions or additional information..."
              value={appointment.notes}
              onChange={(e) => setAppointment(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>

          {/* Quick Booking Options */}
          <Card className="p-4 bg-muted/30">
            <h4 className="font-medium mb-3">Quick Booking Options</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setAppointment(prev => ({
                    ...prev,
                    date: tomorrow.toISOString().split('T')[0],
                    time: "10:00 AM"
                  }));
                }}
              >
                Tomorrow 10 AM
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setAppointment(prev => ({
                    ...prev,
                    date: nextWeek.toISOString().split('T')[0],
                    time: "02:00 PM"
                  }));
                }}
              >
                Next Week 2 PM
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};