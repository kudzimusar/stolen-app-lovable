import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Lock, Mail, Smartphone, Fingerprint } from "lucide-react";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <STOLENLogo />
          <div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your device security dashboard
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={loginMethod === "email" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setLoginMethod("email")}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button
            variant={loginMethod === "phone" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setLoginMethod("phone")}
          >
            <Smartphone className="w-4 h-4" />
            Phone
          </Button>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credential">
              {loginMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            <Input
              id="credential"
              type={loginMethod === "email" ? "email" : "tel"}
              placeholder={
                loginMethod === "email" ? "user@example.com" : "+1 (555) 123-4567"
              }
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="h-12"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-12" size="lg">
            <Lock className="w-4 h-4" />
            Sign In
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            size="lg"
          >
            <Fingerprint className="w-4 h-4" />
            Use Biometric Login
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up for free
            </Link>
          </p>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;