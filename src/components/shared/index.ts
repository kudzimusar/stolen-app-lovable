// STOLEN Platform - Shared Components Library
// Reusable components extracted from the ecosystem for consistency and maintainability

// Import components first
import { PhotoUpload } from './upload/PhotoUpload';
import { DocumentUpload } from './upload/DocumentUpload';
import { InteractiveMap } from './maps/InteractiveMap';
import { QRScanner } from './scanning/QRScanner';
import { FraudDetection } from './ai/FraudDetection';
import { BlockchainVerification } from './blockchain/BlockchainVerification';
import { WalletBalance } from './payment/WalletBalance';
import { NotificationCenter } from './notifications/NotificationCenter';
import { MultiFactorAuth } from './security/MultiFactorAuth';

// Re-export components
export { PhotoUpload } from './upload/PhotoUpload';
export { DocumentUpload } from './upload/DocumentUpload';
export type { UploadedFile, PhotoUploadProps } from './upload/PhotoUpload';
export type { UploadedDocument, DocumentUploadProps } from './upload/DocumentUpload';

export { InteractiveMap } from './maps/InteractiveMap';
export type { MapMarker, MapLocation, InteractiveMapProps } from './maps/InteractiveMap';

export { QRScanner } from './scanning/QRScanner';
export type { QRScanResult, QRScannerProps } from './scanning/QRScanner';

export { FraudDetection } from './ai/FraudDetection';
export type { FraudAnalysisResult, DeviceData, FraudDetectionProps } from './ai/FraudDetection';

export { BlockchainVerification } from './blockchain/BlockchainVerification';
export type { BlockchainRecord, VerificationResult, BlockchainVerificationProps } from './blockchain/BlockchainVerification';

export { WalletBalance } from './payment/WalletBalance';
export type { WalletBalanceData, TransactionSummary, WalletBalanceProps } from './payment/WalletBalance';

export { NotificationCenter } from './notifications/NotificationCenter';
export type { Notification, NotificationCenterProps } from './notifications/NotificationCenter';

export { MultiFactorAuth } from './security/MultiFactorAuth';
export type { MFAMethod, MFASetup, MultiFactorAuthProps } from './security/MultiFactorAuth';

// Component Categories for Easy Import
export const UploadComponents = {
  PhotoUpload,
  DocumentUpload
};

export const MapComponents = {
  InteractiveMap
};

export const ScanningComponents = {
  QRScanner
};

export const AIComponents = {
  FraudDetection
};

export const BlockchainComponents = {
  BlockchainVerification
};

export const PaymentComponents = {
  WalletBalance
};

export const NotificationComponents = {
  NotificationCenter
};

export const SecurityComponents = {
  MultiFactorAuth
};

// All Components
export const SharedComponents = {
  ...UploadComponents,
  ...MapComponents,
  ...ScanningComponents,
  ...AIComponents,
  ...BlockchainComponents,
  ...PaymentComponents,
  ...NotificationComponents,
  ...SecurityComponents
};
