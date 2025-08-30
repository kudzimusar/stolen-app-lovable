import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";

const NewInsuranceClaim = () => {
  const [deviceType, setDeviceType] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    console.log("Submitting insurance claim:", { deviceType, incidentDate, incidentType, description });
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

            <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
              Submit Insurance Claim
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewInsuranceClaim;