import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            How we protect and handle your personal information
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 20, 2024
          </p>
        </div>

        {/* Privacy Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Our Commitment to Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At STOLEN, we are committed to protecting your privacy and personal information. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our blockchain-powered 
              device security platform.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials and authentication data</li>
                  <li>Payment information (processed securely through third parties)</li>
                  <li>Identity verification documents (for business accounts)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Device Information</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Device serial numbers, IMEI, and other identifiers</li>
                  <li>Device specifications and purchase information</li>
                  <li>Ownership history and transfer records</li>
                  <li>Device condition and repair history</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Usage Data</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Platform usage patterns and preferences</li>
                  <li>Location data (when enabled for device tracking)</li>
                  <li>Transaction history and marketplace activity</li>
                  <li>Community interactions and support requests</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide and maintain our device security services</li>
                <li>Process device registrations and ownership transfers</li>
                <li>Facilitate marketplace transactions and escrow services</li>
                <li>Detect and prevent fraud and unauthorized activities</li>
                <li>Communicate with you about your account and services</li>
                <li>Improve our platform and develop new features</li>
                <li>Comply with legal obligations and law enforcement requests</li>
                <li>Provide customer support and technical assistance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Blockchain Security</h4>
                <p className="text-muted-foreground">
                  Device ownership records are stored on blockchain with immutable, cryptographically 
                  secured entries. Personal information is never stored on-chain.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Encryption</h4>
                <p className="text-muted-foreground">
                  All personal data is encrypted at rest and in transit using industry-standard 
                  AES-256 encryption and TLS protocols.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Access Controls</h4>
                <p className="text-muted-foreground">
                  We implement strict access controls, multi-factor authentication, and regular 
                  security audits to protect your information.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We do not sell your personal information. We may share your information only in these situations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>With your consent</strong> - When you explicitly authorize sharing</li>
                <li><strong>For transactions</strong> - With other users for marketplace transactions</li>
                <li><strong>Service providers</strong> - With trusted partners who assist our operations</li>
                <li><strong>Legal requirements</strong> - When required by law or to prevent fraud</li>
                <li><strong>Business transfers</strong> - In case of merger or acquisition</li>
                <li><strong>Law enforcement</strong> - For device recovery and fraud investigation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Access</strong> - Request a copy of your personal data</li>
                <li><strong>Correction</strong> - Update or correct inaccurate information</li>
                <li><strong>Deletion</strong> - Request deletion of your personal data</li>
                <li><strong>Portability</strong> - Receive your data in a portable format</li>
                <li><strong>Opt-out</strong> - Unsubscribe from marketing communications</li>
                <li><strong>Restriction</strong> - Limit how we process your information</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Note: Blockchain records cannot be deleted due to their immutable nature, but personal 
                identifiers can be anonymized.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content and features</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can control cookies through your browser settings. However, disabling cookies may 
                affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We retain your personal information only as long as necessary to provide our services 
                and comply with legal obligations. Device ownership records on blockchain are permanent 
                by design. Personal data is typically retained for 7 years after account closure, 
                unless longer retention is required by law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>International Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place through standard contractual clauses, 
                adequacy decisions, or other approved mechanisms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our platform is not intended for children under 13. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected such 
                information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. We will notify you of material changes 
                via email or platform notification. Your continued use of our services after changes 
                constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices, contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@stolen.com</p>
                <p><strong>Address:</strong> STOLEN Privacy Team, 123 Blockchain Ave, San Francisco, CA 94105</p>
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

export default PrivacyPolicy;
