import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { Menu, Home, User, Settings, LogOut } from "lucide-react";

interface HamburgerMenuProps {
  dashboardLink: string;
  profileLink: string;
  userRole: string;
}

export const HamburgerMenu = ({ dashboardLink, profileLink, userRole }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      window.location.href = "/splash-welcome";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <div className="flex flex-col space-y-4 mt-8">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to={dashboardLink} onClick={() => setIsOpen(false)}>
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to={profileLink} onClick={() => setIsOpen(false)}>
              <User className="w-4 h-4 mr-3" />
              Profile
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/support" onClick={() => setIsOpen(false)}>
              <Settings className="w-4 h-4 mr-3" />
              Support
            </Link>
          </Button>
          
          <div className="border-t pt-4">
            <Button 
              variant="destructive" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};