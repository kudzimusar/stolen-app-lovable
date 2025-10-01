// STOLEN Platform - Shared Components Library
// Reusable components extracted from the ecosystem for consistency and maintainability

// Import components first
import { PhotoUpload } from './upload/PhotoUpload';
import { DocumentUpload } from './upload/DocumentUpload';
import { InteractiveMap } from './maps/InteractiveMap';
import { OpenStreetMap } from './maps/OpenStreetMap';
import { QRScanner } from './scanning/QRScanner';
import { FraudDetection } from './ai/FraudDetection';
import { AIWalletInsights } from './ai/AIWalletInsights';
import { BlockchainVerification } from './blockchain/BlockchainVerification';
import { WalletBalance } from './payment/WalletBalance';
import { NotificationCenter } from './notifications/NotificationCenter';
import { MultiFactorAuth } from './security/MultiFactorAuth';
import { EnhancedSelect } from './forms/EnhancedSelect';
import { RealTimeUpdates } from './communication/RealTimeUpdates';

// Re-export components
export { PhotoUpload } from './upload/PhotoUpload';
export { DocumentUpload } from './upload/DocumentUpload';
export type { UploadedFile, PhotoUploadProps } from './upload/PhotoUpload';
export type { UploadedDocument, DocumentUploadProps } from './upload/DocumentUpload';

export { InteractiveMap } from './maps/InteractiveMap';
export { OpenStreetMap } from './maps/OpenStreetMap';
export type { MapMarker, MapLocation, InteractiveMapProps } from './maps/InteractiveMap';
export type { OpenStreetMapMarker, OpenStreetMapLocation, OpenStreetMapProps } from './maps/OpenStreetMap';

export { QRScanner } from './scanning/QRScanner';
export type { QRScanResult, QRScannerProps } from './scanning/QRScanner';

export { FraudDetection } from './ai/FraudDetection';
export { AIWalletInsights } from './ai/AIWalletInsights';
export type { FraudAnalysisResult, DeviceData, FraudDetectionProps } from './ai/FraudDetection';
export type { AIInsight, WalletData, TransactionData, AIWalletInsightsProps } from './ai/AIWalletInsights';

export { BlockchainVerification } from './blockchain/BlockchainVerification';
export type { BlockchainRecord, VerificationResult, BlockchainVerificationProps } from './blockchain/BlockchainVerification';

export { WalletBalance } from './payment/WalletBalance';
export type { WalletBalanceData, TransactionSummary, WalletBalanceProps } from './payment/WalletBalance';

export { NotificationCenter } from './notifications/NotificationCenter';
export type { Notification, NotificationCenterProps } from './notifications/NotificationCenter';

export { MultiFactorAuth } from './security/MultiFactorAuth';
export type { MFAMethod, MFASetup, MultiFactorAuthProps } from './security/MultiFactorAuth';

// Form Components
export { EnhancedSelect } from './forms/EnhancedSelect';
export type { Option, EnhancedSelectProps } from './forms/EnhancedSelect';

// Communication Components
export { RealTimeUpdates } from './communication/RealTimeUpdates';
export type { RealTimeUpdate, ConnectionStatus, RealTimeUpdatesProps } from './communication/RealTimeUpdates';

// Component Categories for Easy Import
export const UploadComponents = {
  PhotoUpload,
  DocumentUpload
};

export const MapComponents = {
  InteractiveMap,
  OpenStreetMap
};

export const ScanningComponents = {
  QRScanner
};

export const AIComponents = {
  FraudDetection,
  AIWalletInsights
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

export const FormComponents = {
  EnhancedSelect
};

export const CommunicationComponents = {
  RealTimeUpdates
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
  ...SecurityComponents,
  ...FormComponents,
  ...CommunicationComponents
};
