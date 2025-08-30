// Stripe Configuration for STOLEN Platform
// Test API Keys - Safe for development

export const stripeConfig = {
  // Test Publishable Key (Safe to expose in frontend)
  publishableKey: 'pk_test_51OqX8X2KjLmNpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz',
  
  // Test Secret Key (Keep secure, use in backend only)
  secretKey: 'sk_test_51OqX8X2KjLmNpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz',
  
  // South African Currency
  currency: 'zar',
  
  // Test Mode
  testMode: true,
  
  // Webhook Endpoint (for development)
  webhookEndpoint: '/api/stripe/webhook',
  
  // Payment Methods for South Africa
  paymentMethods: {
    card: true,
    bankTransfer: true,
    sepaDebit: false, // Not available in SA
    ideal: false, // Not available in SA
    sofort: false, // Not available in SA
    bancontact: false, // Not available in SA
    eps: false, // Not available in SA
    giropay: false, // Not available in SA
    p24: false, // Not available in SA
  },
  
  // South African Payment Intent Configuration
  paymentIntentConfig: {
    capture_method: 'automatic',
    confirmation_method: 'automatic',
    setup_future_usage: 'off_session',
    metadata: {
      platform: 'STOLEN',
      country: 'ZA',
      currency: 'ZAR'
    }
  }
};

// Stripe Elements Configuration
export const stripeElementsConfig = {
  mode: 'payment',
  amount: 1000, // Amount in cents
  currency: 'zar',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#007bff',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px'
    }
  },
  loader: 'auto'
};

// Test Card Numbers for Development
export const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
  incorrectCvc: '4000000000000127',
  processingError: '4000000000000119',
  stolen: '4000000000009979',
  lost: '4000000000009987'
};

// South African Bank Account Test Data
export const testBankAccounts = {
  absa: {
    accountNumber: '1234567890',
    routingNumber: '632005',
    accountType: 'checking'
  },
  fnb: {
    accountNumber: '0987654321',
    routingNumber: '250655',
    accountType: 'checking'
  },
  nedbank: {
    accountNumber: '1122334455',
    routingNumber: '198765',
    accountType: 'checking'
  },
  standardBank: {
    accountNumber: '5544332211',
    routingNumber: '051001',
    accountType: 'checking'
  }
};

// Stripe Webhook Events for South African Compliance
export const webhookEvents = {
  paymentIntentSucceeded: 'payment_intent.succeeded',
  paymentIntentFailed: 'payment_intent.payment_failed',
  chargeSucceeded: 'charge.succeeded',
  chargeFailed: 'charge.failed',
  customerCreated: 'customer.created',
  customerUpdated: 'customer.updated',
  invoiceCreated: 'invoice.created',
  invoicePaymentSucceeded: 'invoice.payment_succeeded',
  invoicePaymentFailed: 'invoice.payment_failed'
};

// FICA Compliance Metadata
export const ficaMetadata = {
  verificationStatus: 'pending',
  documentType: 'sa_id',
  documentNumber: '1234567890123',
  verificationDate: new Date().toISOString(),
  complianceLevel: 'basic'
};

export default stripeConfig;
