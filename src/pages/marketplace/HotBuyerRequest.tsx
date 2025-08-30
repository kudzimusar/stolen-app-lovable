import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";

const HotBuyerRequest = () => {
  const [deviceType, setDeviceType] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    console.log("Submitting hot buyer request:", { deviceType, budget, urgency, description });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔥 Hot Buyer Request
            </CardTitle>
            <p className="text-center text-gray-600">
              Submit an urgent device purchase request
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
              <Label htmlFor="budget">Budget Range</Label>
              <Input
                id="budget"
                placeholder="e.g., $500-800"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select urgency</option>
                <option value="low">Low - Within a week</option>
                <option value="medium">Medium - Within 3 days</option>
                <option value="high">High - Within 24 hours</option>
                <option value="urgent">Urgent - Same day</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                placeholder="Any specific requirements, conditions, or preferences..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700">
              Submit Hot Buyer Request
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotBuyerRequest;