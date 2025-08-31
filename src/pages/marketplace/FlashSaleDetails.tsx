import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import FlashSaleSystem from "@/components/marketplace/FlashSaleSystem";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FlashSaleDetails = () => {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();

  if (!saleId) {
    navigate('/flash-sales');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/flash-sales')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Flash Sale Details</h1>
            <p className="text-muted-foreground">Live flash sale with limited time offers</p>
          </div>
        </div>

        {/* Flash Sale System for Specific Sale */}
        <FlashSaleSystem saleId={saleId} showUpcoming={false} />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FlashSaleDetails;
