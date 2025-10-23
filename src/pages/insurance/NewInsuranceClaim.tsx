import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";
import { notificationService } from "@/lib/services/notification-service";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NewInsuranceClaim = () => {
  const [deviceType, setDeviceType] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit a claim.",
          variant: "destructive"
        });
        return;
      }

      // Generate claim ID
      const claimId = `INS-${Date.now()}`;
      
      // Send insurance claim notification
      await notificationService.notifyClaimSubmitted(
        user.id,
        claimId,
        incidentType || 'device_claim',
        {
          device_type: deviceType,
          incident_date: incidentDate,
          incident_type: incidentType,
          description: description,
          submission_date: new Date().toISOString()
        }
      );

      toast({
        title: "Claim Submitted Successfully!",
        description: `Your insurance claim ${claimId} has been submitted and is under review.`,
      });

      // Reset form
      setDeviceType("");
      setIncidentDate("");
      setIncidentType("");
      setDescription("");
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Error Submitting Claim",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🛡️ New Insurance Claim
            </CardTitle>
            <p className="text-center text-gray-600">
              File a new insurance claim for your device
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Input
                id="deviceType"
                placeholder="e.g., iPhone 14 Pro, MacBook Air"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input
                id="incidentDate"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="incidentType">Incident Type</Label>
              <select
                id="incidentType"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select incident type</option>
                <option value="theft">Theft</option>
                <option value="damage">Damage</option>
                <option value="loss">Loss</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Incident Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed description of the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Insurance Claim"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewInsuranceClaim;