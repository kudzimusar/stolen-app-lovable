// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Link,
  Copy,
  ExternalLink,
  Clock,
  Hash
} from 'lucide-react';

export interface BlockchainRecord {
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  deviceId: string;
  owner: string;
  status: 'verified' | 'pending' | 'failed';
  network: 'ethereum' | 'polygon' | 'bsc';
  gasUsed?: number;
  gasPrice?: string;
}

export interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  blockchainRecord?: BlockchainRecord;
  verificationSteps: {
    step: string;
    status: 'completed' | 'pending' | 'failed';
    details: string;
  }[];
  recommendations: string[];
  metadata: {
    verificationTime: number;
    network: string;
    timestamp: Date;
  };
}

export interface BlockchainVerificationProps {
  deviceId: string;
  onVerificationComplete: (result: VerificationResult) => void;
  onVerificationError?: (error: string) => void;
  networks?: ('ethereum' | 'polygon' | 'bsc')[];
  enableMultiNetwork?: boolean;
  className?: string;
}

export const BlockchainVerification: React.FC<BlockchainVerificationProps> = ({
  deviceId,
  onVerificationComplete,
  onVerificationError,
  networks = ['ethereum', 'polygon'],
  enableMultiNetwork = true,
  className = ''
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();

  const performBlockchainVerification = useCallback(async (
    deviceId: string, 
    networks: string[]
  ): Promise<VerificationResult> => {
    const verificationSteps = [
      {
        step: 'Connect to blockchain networks',
        status: 'pending' as const,
        details: 'Establishing connection to blockchain networks'
      },
      {
        step: 'Query device registry',
        status: 'pending' as const,
        details: 'Searching for device in blockchain registry'
      },
      {
        step: 'Verify ownership',
        status: 'pending' as const,
        details: 'Confirming current device ownership'
      },
      {
        step: 'Check transaction history',
        status: 'pending' as const,
        details: 'Analyzing device transaction history'
      },
      {
        step: 'Validate authenticity',
        status: 'pending' as const,
        details: 'Verifying device authenticity and integrity'
      }
    ];

    // Simulate verification process
    for (let i = 0; i < verificationSteps.length; i++) {
      setCurrentStep(verificationSteps[i].step);
      setVerificationProgress((i + 1) * 20);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      verificationSteps[i].status = 'completed';
    }

    // Simulate finding a blockchain record
    const mockRecord: BlockchainRecord = {
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      deviceId,
      owner: `0x${Math.random().toString(16).substr(2, 40)}`,
      status: 'verified',
      network: networks[0] as any,
      gasUsed: Math.floor(Math.random() * 100000) + 50000,
      gasPrice: `${Math.random() * 50 + 10} Gwei`
    };

    const isVerified = Math.random() > 0.2; // 80% success rate
    const confidence = isVerified ? Math.random() * 0.3 + 0.7 : Math.random() * 0.4 + 0.1;

    const recommendations = [];
    if (isVerified) {
      recommendations.push('Device ownership verified on blockchain');
      recommendations.push('Proceed with transaction');
    } else {
      recommendations.push('Device not found in blockchain registry');
      recommendations.push('Register device on blockchain');
      recommendations.push('Verify device authenticity');
    }

    return {
      isVerified,
      confidence,
      blockchainRecord: isVerified ? mockRecord : undefined,
      verificationSteps,
      recommendations,
      metadata: {
        verificationTime: 5000 + Math.random() * 3000,
        network: networks.join(', '),
        timestamp: new Date()
      }
    };
  }, []);

  const startVerification = useCallback(async () => {
    if (!deviceId) {
      onVerificationError?.('No device ID provided');
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);
    setCurrentStep('');

    try {
      const result = await performBlockchainVerification(deviceId, networks);
      
      setVerificationResult(result);
      onVerificationComplete(result);

      toast({
        title: result.isVerified ? "Verification Successful" : "Verification Failed",
        description: result.isVerified ? 
          "Device ownership verified on blockchain" : 
          "Device not found in blockchain registry",
        variant: result.isVerified ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Blockchain verification failed:', error);
      onVerificationError?.('Verification failed');
      toast({
        title: "Verification Error",
        description: "Failed to verify device on blockchain",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  }, [deviceId, networks, performBlockchainVerification, onVerificationComplete, onVerificationError, toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const getNetworkColor = (network: string) => {
    const colors = {
      ethereum: 'bg-blue-100 text-blue-800',
      polygon: 'bg-purple-100 text-purple-800',
      bsc: 'bg-yellow-100 text-yellow-800'
    };
    return colors[network] || 'bg-gray-100 text-gray-800';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blockchain Verification
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Device Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Device ID:</span>
              <code className="text-sm bg-background px-2 py-1 rounded">
                {deviceId}
              </code>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Networks:</span>
              <div className="flex gap-1">
                {networks.map(network => (
                  <Badge key={network} className={getNetworkColor(network)}>
                    {network.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startVerification}
              disabled={isVerifying || !deviceId}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Verification
                </>
              )}
            </Button>
          </div>

          {/* Verification Progress */}
          {isVerifying && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Verification Progress</span>
                <span>{Math.round(verificationProgress)}%</span>
              </div>
              <Progress value={verificationProgress} className="w-full" />
              {currentStep && (
                <p className="text-sm text-muted-foreground">
                  {currentStep}...
                </p>
              )}
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="space-y-4">
              {/* Result Summary */}
              <Alert className={verificationResult.isVerified ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {verificationResult.isVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <div>
                    <h4 className="font-medium">
                      {verificationResult.isVerified ? 'Verification Successful' : 'Verification Failed'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {Math.round(verificationResult.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Blockchain Record */}
              {verificationResult.blockchainRecord && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Blockchain Record</h4>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Transaction Hash:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1 rounded">
                          {verificationResult.blockchainRecord.transactionHash.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(verificationResult.blockchainRecord!.transactionHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://etherscan.io/tx/${verificationResult.blockchainRecord!.transactionHash}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Block Number:</span>
                        <p className="font-medium">{verificationResult.blockchainRecord.blockNumber.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <p className="font-medium">{verificationResult.blockchainRecord.network.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gas Used:</span>
                        <p className="font-medium">{verificationResult.blockchainRecord.gasUsed?.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gas Price:</span>
                        <p className="font-medium">{verificationResult.blockchainRecord.gasPrice}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Timestamp:</span>
                      <p className="text-sm">{verificationResult.blockchainRecord.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Steps */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Verification Steps</h4>
                <div className="space-y-2">
                  {verificationResult.verificationSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.step}</p>
                        <p className="text-xs text-muted-foreground">{step.details}</p>
                      </div>
                      <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                        {step.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recommendations</h4>
                <div className="space-y-1">
                  {verificationResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground">
                <p>Verification Time: {Math.round(verificationResult.metadata.verificationTime)}ms</p>
                <p>Networks: {verificationResult.metadata.network}</p>
                <p>Timestamp: {verificationResult.metadata.timestamp.toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



