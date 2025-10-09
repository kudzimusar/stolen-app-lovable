import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Copy,
  Hash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lostFoundBlockchainService } from '@/lib/services/lost-found-blockchain-service';

interface BlockchainVerificationBadgeProps {
  reportId: string;
  deviceId: string;
  showDetails?: boolean;
  className?: string;
}

export const BlockchainVerificationBadge: React.FC<BlockchainVerificationBadgeProps> = ({
  reportId,
  deviceId,
  showDetails = false,
  className = ''
}) => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'unverified' | 'error'>('loading');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkVerificationStatus();
  }, [reportId, deviceId]);

  const checkVerificationStatus = async () => {
    try {
      setIsVerifying(true);
      const result = await lostFoundBlockchainService.verifyDeviceOnBlockchain(deviceId, reportId);
      
      setVerificationResult(result);
      setVerificationStatus(result.isVerified ? 'verified' : 'unverified');
    } catch (error) {
      console.error('Verification check failed:', error);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Transaction hash copied to clipboard"
    });
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unverified':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unverified':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Blockchain Verified';
      case 'unverified':
        return 'Not on Blockchain';
      case 'error':
        return 'Verification Error';
      default:
        return 'Checking...';
    }
  };

  if (!showDetails) {
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${getStatusColor()} ${className}`}
      >
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          Blockchain Verification
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${getStatusColor()}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkVerificationStatus}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>

        {/* Verification Details */}
        {verificationResult && (
          <div className="space-y-3">
            {verificationResult.isVerified && verificationResult.blockchainRecord && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Blockchain Record</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction Hash:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-1 rounded">
                        {verificationResult.blockchainRecord.transactionHash.substring(0, 16)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(verificationResult.blockchainRecord.transactionHash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://polygonscan.com/tx/${verificationResult.blockchainRecord.transactionHash}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Block Number:</span>
                    <span className="font-medium">
                      {verificationResult.blockchainRecord.blockNumber.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium uppercase">
                      {verificationResult.blockchainRecord.network}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium">
                      {Math.round(verificationResult.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Steps */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Verification Steps</h4>
              <div className="space-y-1">
                {verificationResult.verificationSteps?.map((step: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : step.status === 'failed' ? (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    ) : (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                    )}
                    <span className={step.status === 'failed' ? 'text-red-600' : ''}>
                      {step.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {verificationStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Verification Failed
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Unable to verify device on blockchain. Please try again later.
            </p>
          </div>
        )}

        {/* Unverified State */}
        {verificationStatus === 'unverified' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Not on Blockchain
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              This device report is not anchored to the blockchain yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

