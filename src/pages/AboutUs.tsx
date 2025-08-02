import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { Shield, Globe, Users, Award, Target, Eye } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold mb-4">About STOLEN</h1>
          <p className="text-xl text-muted-foreground">
            Revolutionizing device security through blockchain technology
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              STOLEN is dedicated to creating a safer digital world by providing universal, 
              blockchain-powered digital identification for electronic devices. We prevent theft 
              and fraud while enabling transparent ownership transfers, making device transactions 
              secure and trustworthy for everyone.
            </p>
          </CardContent>
        </Card>

        {/* Vision Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              To establish STOLEN as the global standard for device verification, creating 
              an ecosystem where every electronic device has an immutable digital identity 
              that ensures security, trust, and transparency in the digital marketplace.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Every aspect of our platform is built with security as the foundation, 
                ensuring your devices and data are always protected.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Transparency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Blockchain technology ensures complete transparency in all device 
                transactions and ownership history.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Building a global community of users, retailers, law enforcement, 
                and organizations working together for device security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Excellence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Committed to delivering the highest quality platform and user 
                experience through continuous innovation and improvement.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What Makes Us Different */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Makes STOLEN Different</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Blockchain Immutability</h4>
                  <p className="text-muted-foreground">
                    Device records are permanently stored on blockchain, making them tamper-proof and verifiable.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">AI-Enhanced Fraud Detection</h4>
                  <p className="text-muted-foreground">
                    Advanced AI algorithms help identify potential fraud and suspicious activities in real-time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Multi-Stakeholder Integration</h4>
                  <p className="text-muted-foreground">
                    Supporting individuals, retailers, law enforcement, insurers, and NGOs with tailored solutions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">STOLEN Pay (S-Pay)</h4>
                  <p className="text-muted-foreground">
                    Built-in escrow payment system ensuring secure transactions for all parties.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Ready to secure your devices with STOLEN? Have questions about our platform?
            </p>
            <p className="text-muted-foreground">
              Contact our team at <span className="font-semibold">support@stolen.app</span> or 
              visit our support center for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutUs;