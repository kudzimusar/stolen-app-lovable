import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";

const FeedbackRating = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    console.log("Submitting feedback:", { rating, feedback });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" />
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              ⭐ Rate Your Experience
            </CardTitle>
            <p className="text-center text-gray-600">
              Help us improve by sharing your feedback
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating Stars */}
            <div className="text-center">
              <p className="text-lg font-medium mb-4">How would you rate your experience?</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {rating === 0 && "Select a rating"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tell us more about your experience
              </label>
              <Textarea
                placeholder="Share your thoughts, suggestions, or any issues you encountered..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackRating;

