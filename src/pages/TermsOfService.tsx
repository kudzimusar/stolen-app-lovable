import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Legal terms and conditions for using the STOLEN platform
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 20, 2024
          </p>
        </div>

        {/* Terms Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Agreement Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing or using the STOLEN platform, you agree to be bound by these Terms of Service. 
              Please read them carefully. If you do not agree to these terms, do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Platform Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Description</h4>
                <p className="text-muted-foreground">
                  STOLEN provides a blockchain-powered device security platform that enables users to register, 
                  track, verify, and recover electronic devices. Our services include device registration, 
                  marketplace transactions, fraud detection, and community recovery networks.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Blockchain Technology</h4>
                <p className="text-muted-foreground">
                  Device ownership records are stored on immutable blockchain networks. You understand that 
                  blockchain entries cannot be modified or deleted once confirmed, ensuring permanent ownership history.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Service Availability</h4>
                <p className="text-muted-foreground">
                  We strive for 99.9% uptime but cannot guarantee uninterrupted service. Maintenance, 
                  updates, or technical issues may temporarily affect platform availability.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Account Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Creation</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain updated contact information</li>
                    <li>Use only one account per person or business</li>
                    <li>Comply with identity verification requirements</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Account Security</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Maintain confidentiality of login credentials</li>
                    <li>Enable two-factor authentication when available</li>
                    <li>Report unauthorized access immediately</li>
                    <li>You are responsible for all account activity</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Prohibited Activities</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Register stolen or fraudulent devices</li>
                    <li>Provide false ownership information</li>
                    <li>Attempt to circumvent security measures</li>
                    <li>Use the platform for illegal activities</li>
                    <li>Harass or threaten other users</li>
                    <li>Violate intellectual property rights</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Device Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Ownership Verification</h4>
                <p className="text-muted-foreground">
                  You warrant that you are the legal owner of devices you register. Registration of stolen 
                  devices is strictly prohibited and may result in account termination and legal action.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Device Information</h4>
                <p className="text-muted-foreground">
                  Provide accurate device information including serial numbers, purchase details, and condition. 
                  False information may invalidate registration and affect recovery efforts.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Blockchain Records</h4>
                <p className="text-muted-foreground">
                  Once registered, device ownership records become permanent blockchain entries. These cannot 
                  be deleted but ownership can be transferred to new verified owners.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketplace Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Buying and Selling</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Only verified devices can be listed for sale</li>
                  <li>Sellers warrant legal ownership and accurate descriptions</li>
                  <li>Buyers accept items "as described" by sellers</li>
                  <li>All transactions are subject to escrow protection</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Transaction Fees</h4>
                <p className="text-muted-foreground">
                  We charge transaction fees for marketplace sales, payment processing, and escrow services. 
                  Fees are clearly displayed before transaction completion.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                <p className="text-muted-foreground">
                  Disputes between buyers and sellers are handled through our mediation process. We reserve 
                  the right to make final decisions on dispute outcomes and escrow release.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Limitations of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Disclaimers</h4>
                <p className="text-muted-foreground">
                  Services are provided "as is" without warranties. We do not guarantee device recovery, 
                  marketplace transaction success, or complete fraud prevention.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Liability Limits</h4>
                <p className="text-muted-foreground">
                  Our liability is limited to the amount paid for services in the 12 months preceding any claim. 
                  We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Third-Party Services</h4>
                <p className="text-muted-foreground">
                  We integrate with third-party services (payment processors, blockchain networks, APIs). 
                  We are not responsible for third-party service failures or policies.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Accepted Payments</h4>
                <p className="text-muted-foreground">
                  We accept major credit cards, PayPal, and other approved payment methods. 
                  Cryptocurrency payments may be available for certain services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Refund Policy</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Registration fees are non-refundable once devices are registered</li>
                  <li>Marketplace escrow fees are refundable if transactions fail</li>
                  <li>Subscription services have a 30-day money-back guarantee</li>
                  <li>Refund requests must be submitted within specified timeframes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Currency and Taxes</h4>
                <p className="text-muted-foreground">
                  Prices are displayed in USD unless otherwise specified. You are responsible for 
                  applicable taxes based on your jurisdiction.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Rights</h4>
                <p className="text-muted-foreground">
                  STOLEN platform, including software, designs, trademarks, and content, is our intellectual 
                  property. You may not copy, modify, or redistribute platform components without permission.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">User Content</h4>
                <p className="text-muted-foreground">
                  You retain ownership of content you submit but grant us license to use, display, and 
                  distribute it as necessary for platform operations.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Patent Protection</h4>
                <p className="text-muted-foreground">
                  Our reverse verification technology is patent-protected. Unauthorized use of our 
                  verification methods may constitute patent infringement.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Jurisdiction</h4>
                <p className="text-muted-foreground">
                  These terms are governed by California law. Disputes will be resolved in California state 
                  or federal courts, unless resolved through binding arbitration.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">International Users</h4>
                <p className="text-muted-foreground">
                  International users may be subject to additional local laws and regulations. 
                  You are responsible for compliance with your local jurisdiction.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Arbitration</h4>
                <p className="text-muted-foreground">
                  Most disputes will be resolved through binding arbitration rather than court proceedings. 
                  Class action lawsuits are waived in favor of individual arbitration.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Voluntary Termination</h4>
                <p className="text-muted-foreground">
                  You may close your account at any time. Device registrations remain on blockchain 
                  but personal data will be handled according to our Privacy Policy.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Termination for Cause</h4>
                <p className="text-muted-foreground">
                  We may terminate accounts for terms violations, illegal activities, or fraudulent behavior. 
                  Repeated violations or serious misconduct may result in permanent bans.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Effect of Termination</h4>
                <p className="text-muted-foreground">
                  Upon termination, you lose access to platform services. Outstanding transactions will be 
                  completed, and blockchain records remain permanent. Refunds follow our refund policy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We may update these Terms of Service periodically. Material changes will be announced 
                via email or platform notification 30 days before taking effect.
              </p>
              <p className="text-muted-foreground">
                Continued use of our services after changes constitutes acceptance of updated terms. 
                If you disagree with changes, you may close your account before they take effect.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms of Service, contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@stolen.com</p>
                <p><strong>Address:</strong> STOLEN Legal Team, 123 Blockchain Ave, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
              <div className="mt-6">
                <Link to="/support">
                  <Button variant="outline">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;