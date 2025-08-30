import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { Shield, Globe, Users, Award, Target, Eye, Sparkles, Zap, Heart } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Mobile Back Navigation */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16 relative">
          <div className="absolute inset-0 bg-gradient-primary/5 rounded-3xl blur-3xl"></div>
          <div className="relative z-10 bg-gradient-primary bg-clip-text text-transparent">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About STOLEN</h1>
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're a young, innovative team revolutionizing device security through cutting-edge blockchain technology
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <Zap className="w-5 h-5 text-purple-500 animate-pulse delay-75" />
              <Heart className="w-5 h-5 text-pink-500 animate-pulse delay-150" />
            </div>
          </div>
        </div>

        {/* Mission & Vision - Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission Section */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                STOLEN is dedicated to creating a safer digital world by providing universal, 
                blockchain-powered digital identification for electronic devices. We prevent theft 
                and fraud while enabling transparent ownership transfers, making device transactions 
                secure and trustworthy for everyone.
              </p>
            </CardContent>
          </Card>

          {/* Vision Section */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-500 text-white rounded-lg">
                  <Eye className="w-5 h-5" />
                </div>
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                To establish STOLEN as the global standard for device verification, creating 
                an ecosystem where every electronic device has an immutable digital identity 
                that ensures security, trust, and transparency in the digital marketplace.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that drive everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                  Security First
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Every aspect of our platform is built with security as the foundation, 
                  ensuring your devices and data are always protected.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-sky-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Transparency
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Blockchain technology ensures complete transparency in all device 
                  transactions and ownership history.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-violet-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Building a global community of users, retailers, law enforcement, 
                  and organizations working together for device security.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-orange-600" />
                  Excellence
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Committed to delivering the highest quality platform and user 
                  experience through continuous innovation and improvement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What Makes Us Different */}
        <Card className="mb-16 relative overflow-hidden bg-gradient-to-br from-primary/5 to-purple-500/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              What Makes STOLEN Different
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Blockchain Immutability</h4>
                  <p className="text-muted-foreground">
                    Device records are permanently stored on blockchain, making them tamper-proof and verifiable.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">AI-Enhanced Fraud Detection</h4>
                  <p className="text-muted-foreground">
                    Advanced AI algorithms help identify potential fraud and suspicious activities in real-time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Multi-Stakeholder Integration</h4>
                  <p className="text-muted-foreground">
                    Supporting individuals, retailers, law enforcement, insurers, and NGOs with tailored solutions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">STOLEN Pay (S-Pay)</h4>
                  <p className="text-muted-foreground">
                    Built-in escrow payment system ensuring secure transactions for all parties.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="max-w-2xl">
              <p className="text-lg mb-4 font-medium">
                Ready to secure your devices with STOLEN? Have questions about our platform?
              </p>
              <p className="text-muted-foreground mb-6">
                Our young, passionate team is here to help! Contact us at{" "}
                <span className="font-semibold text-primary">support@stolen.app</span> or 
                visit our support center for more information.
              </p>
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  🚀 Innovation-driven
                </div>
                <div className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-medium">
                  💡 Creative solutions
                </div>
                <div className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                  🌱 Future-focused
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutUs;