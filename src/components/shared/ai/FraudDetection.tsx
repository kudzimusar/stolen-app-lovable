import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

export interface FraudAnalysisResult {
  isFraudulent: boolean;
  confidence: number;
  riskScore: number; // 0-100
  factors: {
    factor: string;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  recommendations: string[];
  metadata: {
    analysisTime: number;
    modelVersion: string;
    timestamp: Date;
  };
}

export interface DeviceData {
  serialNumber?: string;
  imei?: string;
  model?: string;
  purchaseDate?: Date;
  price?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  userHistory?: {
    previousReports: number;
    accountAge: number;
    verificationStatus: string;
  };
  transactionHistory?: {
    totalTransactions: number;
    averageAmount: number;
    suspiciousPatterns: string[];
  };
}

export interface FraudDetectionProps {
  deviceData: DeviceData;
  onAnalysisComplete: (result: FraudAnalysisResult) => void;
  onAnalysisError?: (error: string) => void;
  confidenceThreshold?: number;
  enableRealTime?: boolean;
  className?: string;
}

export const FraudDetection: React.FC<FraudDetectionProps> = ({
  deviceData,
  onAnalysisComplete,
  onAnalysisError,
  confidenceThreshold = 0.8,
  enableRealTime = false,
  className = ''
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FraudAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();

  const performFraudAnalysis = useCallback(async (data: DeviceData): Promise<FraudAnalysisResult> => {
    // Simulate AI analysis with multiple factors
    const factors = [
      {
        factor: 'Device Age',
        weight: 0.2,
        impact: data.purchaseDate && 
          (Date.now() - new Date(data.purchaseDate).getTime()) < 30 * 24 * 60 * 60 * 1000 
          ? 'negative' : 'positive',
        description: data.purchaseDate ? 
          'Recently purchased device' : 'Device age unknown'
      },
      {
        factor: 'Price Anomaly',
        weight: 0.25,
        impact: data.price && data.price < 100 ? 'negative' : 'positive',
        description: data.price ? 
          `Price: $${data.price}` : 'Price not specified'
      },
      {
        factor: 'Location Risk',
        weight: 0.15,
        impact: 'neutral',
        description: data.location ? 
          'Location provided' : 'No location data'
      },
      {
        factor: 'User History',
        weight: 0.2,
        impact: data.userHistory?.previousReports > 2 ? 'negative' : 'positive',
        description: data.userHistory ? 
          `Previous reports: ${data.userHistory.previousReports}` : 'No user history'
      },
      {
        factor: 'Transaction Patterns',
        weight: 0.2,
        impact: data.transactionHistory?.suspiciousPatterns.length > 0 ? 'negative' : 'positive',
        description: data.transactionHistory ? 
          `Suspicious patterns: ${data.transactionHistory.suspiciousPatterns.length}` : 'No transaction data'
      }
    ];

    // Calculate risk score
    let riskScore = 0;
    factors.forEach(factor => {
      const impact = factor.impact === 'negative' ? 1 : factor.impact === 'positive' ? -0.5 : 0;
      riskScore += impact * factor.weight * 100;
    });

    riskScore = Math.max(0, Math.min(100, riskScore));

    const isFraudulent = riskScore > (confidenceThreshold * 100);
    const confidence = Math.abs(riskScore - 50) / 50; // Higher confidence when further from 50

    const recommendations = [];
    if (riskScore > 70) {
      recommendations.push('Require additional verification');
      recommendations.push('Flag for manual review');
    } else if (riskScore > 40) {
      recommendations.push('Monitor transaction patterns');
      recommendations.push('Request additional documentation');
    } else {
      recommendations.push('Standard verification process');
    }

    return {
      isFraudulent,
      confidence,
      riskScore,
      factors,
      recommendations,
      metadata: {
        analysisTime: Math.random() * 2000 + 1000, // 1-3 seconds
        modelVersion: 'v2.1.0',
        timestamp: new Date()
      }
    };
  }, [confidenceThreshold]);

  const startAnalysis = useCallback(async () => {
    if (!deviceData) {
      onAnalysisError?.('No device data provided');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const result = await performFraudAnalysis(deviceData);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setAnalysisResult(result);
      onAnalysisComplete(result);

      toast({
        title: result.isFraudulent ? "Fraud Detected" : "Analysis Complete",
        description: `Risk Score: ${Math.round(result.riskScore)}%`,
        variant: result.isFraudulent ? "destructive" : "default"
      });

    } catch (error) {
      console.error('Fraud analysis failed:', error);
      onAnalysisError?.('Analysis failed');
      toast({
        title: "Analysis Error",
        description: "Failed to perform fraud analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [deviceData, performFraudAnalysis, onAnalysisComplete, onAnalysisError, toast]);

  // Auto-start analysis if enabled
  useEffect(() => {
    if (enableRealTime && deviceData) {
      startAnalysis();
    }
  }, [enableRealTime, deviceData, startAnalysis]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'secondary';
    return 'default';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Fraud Detection
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Analysis Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startAnalysis}
              disabled={isAnalyzing || !deviceData}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <div className="space-y-4">
              {/* Risk Summary */}
              <Alert className={analysisResult.isFraudulent ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                <div className="flex items-center gap-2">
                  {analysisResult.isFraudulent ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  <div>
                    <h4 className="font-medium">
                      {analysisResult.isFraudulent ? 'Fraud Detected' : 'No Fraud Detected'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {Math.round(analysisResult.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Risk Score */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="font-medium">Risk Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getRiskColor(analysisResult.riskScore)}`}>
                    {Math.round(analysisResult.riskScore)}%
                  </span>
                  <Badge variant={getRiskBadgeVariant(analysisResult.riskScore)}>
                    {analysisResult.riskScore >= 70 ? 'High Risk' : 
                     analysisResult.riskScore >= 40 ? 'Medium Risk' : 'Low Risk'}
                  </Badge>
                </div>
              </div>

              {/* Analysis Factors */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Analysis Factors</h4>
                <div className="space-y-2">
                  {analysisResult.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{factor.factor}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(factor.weight * 100)}% weight
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {factor.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {factor.impact === 'negative' ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : factor.impact === 'positive' ? (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recommendations</h4>
                <div className="space-y-1">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground">
                <p>Analysis Time: {Math.round(analysisResult.metadata.analysisTime)}ms</p>
                <p>Model Version: {analysisResult.metadata.modelVersion}</p>
                <p>Timestamp: {analysisResult.metadata.timestamp.toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

