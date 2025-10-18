# TrustVisualization.tsx Update Guide

## Changes Required

### 1. Update Props Interface (Lines 83-87)

**BEFORE:**
```typescript
interface TrustVisualizationProps {
  deviceId: string;
  showFullDetails?: boolean;
  size?: 'compact' | 'full';
}
```

**AFTER:**
```typescript
interface TrustVisualizationProps {
  deviceId: string;
  serialNumber?: string;
  trustScore: number;
  verificationLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  serialStatus: 'clean' | 'reported_lost' | 'reported_stolen' | 'blacklisted';
  blockchainHash?: string;
  blockchainVerified: boolean;
  lastVerified?: string;
  verifications: Array<{
    method: string;
    verifierName: string;
    confidenceScore: number;
    timestamp: string;
    status: string;
    details: any;
    blockchainTxId?: string;
  }>;
  riskAssessment: {
    riskScore: number;
    riskStatus: string;
    riskFactors: any[];
    assessmentDate: string;
  } | null;
  ownershipHistory: Array<{
    ownerId: string;
    previousOwnerId?: string;
    transferFrom: string;
    transferDate: string;
    transferMethod: string;
    blockchainTxId?: string;
    verificationStatus: string;
  }>;
  certificates: Array<{
    type: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    certificateUrl?: string;
    verificationStatus: string;
  }>;
  repairs?: Array<{
    type: string;
    serviceProvider?: string;
    date: string;
    cost?: number;
    description?: string;
    verificationStatus: string;
  }>;
  showFullDetails?: boolean;
  size?: 'compact' | 'full';
}
```

### 2. Update Component Function (Lines 89-101)

**BEFORE:**
```typescript
export const TrustVisualization: React.FC<TrustVisualizationProps> = ({
  deviceId,
  showFullDetails = false,
  size = 'full'
}) => {
  const [verification, setVerification] = useState<DeviceVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false);

  useEffect(() => {
    loadVerificationData();
  }, [deviceId]);

  const loadVerificationData = async () => {
    // ... mock data generation ...
  };
```

**AFTER:**
```typescript
export const TrustVisualization: React.FC<TrustVisualizationProps> = ({
  deviceId,
  serialNumber,
  trustScore,
  verificationLevel,
  serialStatus,
  blockchainHash,
  blockchainVerified,
  lastVerified,
  verifications,
  riskAssessment,
  ownershipHistory,
  certificates,
  repairs = [],
  showFullDetails = false,
  size = 'full'
}) => {
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false);
  
  // Remove useState for verification and isLoading
  // Remove useEffect
  // Remove loadVerificationData function
  
  // Data is now passed as props, ready to use!
```

### 3. Update All References to `verification.` (Throughout Component)

**Find and Replace:**
- `verification.trustScore` → `trustScore`
- `verification.verificationLevel` → `verificationLevel`
- `verification.status` → `serialStatus`
- `verification.blockchainHash` → `blockchainHash`
- `verification.serialNumber` → `serialNumber`
- `verification.lastVerified` → `lastVerified ? new Date(lastVerified) : new Date()`
- `verification.ownershipChain` → `ownershipHistory`
- `verification.verificationHistory` → `verifications`
- `verification.riskFactors` → `riskAssessment?.riskFactors || []`
- `verification.certifications` → `certificates`

### 4. Update Conditional Rendering (Line 248-265)

**BEFORE:**
```typescript
if (isLoading) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification data...</p>
        </div>
      </div>
    </Card>
  );
}

if (!verification) {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Verification data unavailable</p>
      </div>
    </Card>
  );
}
```

**AFTER:**
```typescript
// Remove loading state - data is passed as props
// Optionally add null check if needed:
if (!deviceId) {
  return (
    <Card className="p-6">
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Device information unavailable</p>
      </div>
    </Card>
  );
}
```

### 5. Update Status Determination Logic

**Add helper functions at the top of component:**
```typescript
// Determine status from serialStatus prop
const status = serialStatus === 'clean' ? 'clean' : 
               serialStatus === 'reported_stolen' ? 'stolen' :
               serialStatus === 'reported_lost' ? 'lost' : 'flagged';

// Calculate status color
const statusColor = status === 'clean' ? 'text-green-600' :
                   status === 'stolen' || status === 'flagged' ? 'text-red-600' :
                   'text-yellow-600';

// Determine verification icon
const VerificationIcon = verificationLevel === 'premium' || verificationLevel === 'enterprise' ? Shield :
                        verificationLevel === 'standard' ? CheckCircle :
                        AlertTriangle;
```

### 6. Update Ownership History Mapping

**BEFORE:**
```typescript
verification.ownershipChain.map((record) => (
  <div key={record.id}>
    <div className="flex items-center justify-between">
      <span className="font-medium">{record.currentOwner}</span>
      <span className="text-sm text-muted-foreground">
        from {record.previousOwner}
      </span>
    </div>
  </div>
))
```

**AFTER:**
```typescript
ownershipHistory.map((record, index) => (
  <div key={index}>
    <div className="flex items-center justify-between">
      <span className="font-medium">{record.transferFrom || 'Unknown'}</span>
      <span className="text-sm text-muted-foreground">
        {new Date(record.transferDate).toLocaleDateString()}
      </span>
    </div>
  </div>
))
```

### 7. Update Verification History Mapping

**BEFORE:**
```typescript
verification.verificationHistory.map((record) => (
  <div key={record.id}>
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{record.verifiedBy}</p>
        <p className="text-sm text-muted-foreground">
          {record.method.replace('_', ' ').toUpperCase()}
        </p>
      </div>
      <Badge variant="outline">
        {record.confidence}% Confidence
      </Badge>
    </div>
  </div>
))
```

**AFTER:**
```typescript
verifications.map((record, index) => (
  <div key={index}>
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{record.verifierName}</p>
        <p className="text-sm text-muted-foreground">
          {record.method.replace(/_/g, ' ')}
        </p>
      </div>
      <Badge variant="outline">
        {record.confidenceScore}% Confidence
      </Badge>
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      {new Date(record.timestamp).toLocaleString()}
    </p>
  </div>
))
```

### 8. Update Certificates Mapping

**BEFORE:**
```typescript
verification.certifications.map((cert) => (
  <div key={cert.id}>
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{cert.issuer}</p>
        <p className="text-sm text-muted-foreground capitalize">{cert.type}</p>
      </div>
      {cert.verified && (
        <CheckCircle className="h-5 w-5 text-green-600" />
      )}
    </div>
  </div>
))
```

**AFTER:**
```typescript
certificates.map((cert, index) => (
  <div key={index}>
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{cert.issuer}</p>
        <p className="text-sm text-muted-foreground capitalize">{cert.type}</p>
      </div>
      {cert.verificationStatus === 'verified' && (
        <CheckCircle className="h-5 w-5 text-green-600" />
      )}
    </div>
    {cert.expiryDate && (
      <p className="text-xs text-muted-foreground mt-1">
        Expires: {new Date(cert.expiryDate).toLocaleDateString()}
      </p>
    )}
  </div>
))
```

### 9. Add Repairs Tab (New)

**Add after Certificates tab:**
```typescript
<TabsContent value="repairs" className="space-y-4">
  {repairs && repairs.length > 0 ? (
    repairs.map((repair, index) => (
      <Card key={index} className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{repair.type}</p>
            {repair.serviceProvider && (
              <p className="text-sm text-muted-foreground">{repair.serviceProvider}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(repair.date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            {repair.cost && (
              <p className="font-semibold">R {repair.cost.toLocaleString()}</p>
            )}
            <Badge variant={repair.verificationStatus === 'verified' ? 'default' : 'outline'}>
              {repair.verificationStatus}
            </Badge>
          </div>
        </div>
        {repair.description && (
          <p className="text-sm text-muted-foreground mt-2">{repair.description}</p>
        )}
      </Card>
    ))
  ) : (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No repair history available</p>
    </div>
  )}
</TabsContent>
```

## Summary of Changes

1. ✅ Props interface updated to accept real data
2. ✅ Removed mock data generation
3. ✅ Removed loading state and useEffect
4. ✅ Updated all `verification.` references to use props
5. ✅ Added proper data transformations
6. ✅ Added repairs tab
7. ✅ Improved date formatting
8. ✅ Better null/undefined handling

## Lines to Delete

- Lines 94-95: `useState` for verification and isLoading
- Lines 98-100: `useEffect`
- Lines 102-178: Entire `loadVerificationData` function (mock data)
- Lines 248-265: Loading and error state rendering

## Result

- **~180 lines of mock data removed**
- Component now accepts all data as props
- Pure/controlled component
- Easy to test
- No API calls inside component
- Real data flows from ProductDetail → TrustVisualization
