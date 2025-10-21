import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  X,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  brand: string;
  model: string;
  createdAt: string;
}

interface MarketplaceStats {
  totalListings: number;
  activeSales: number;
  totalRevenue: number;
  pendingReviews: number;
}

const MarketplacePanel = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState<MarketplaceStats>({
    totalListings: 0,
    activeSales: 0,
    totalRevenue: 0,
    pendingReviews: 0
  });

  // Fetch marketplace listings for admin review
  const fetchListings = async (status = "all") => {
    try {
      setLoading(true);
      console.log("🔍 Fetching listings for admin review...");
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch(`/api/v1/marketplace/listings?status=${status}&limit=100`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log("📋 Admin listings fetched:", result);
        
        if (result.success) {
          setListings(result.listings || []);
          
          // Calculate stats
          const totalListings = result.listings?.length || 0;
          const activeSales = result.listings?.filter((l: Listing) => l.status === 'approved').length || 0;
          const pendingReviews = result.listings?.filter((l: Listing) => l.status === 'pending').length || 0;
          const totalRevenue = result.listings?.reduce((sum: number, l: Listing) => 
            l.status === 'approved' ? sum + (l.price || 0) : sum, 0) || 0;

          setStats({
            totalListings,
            activeSales,
            totalRevenue,
            pendingReviews
          });
        }
      } else {
        console.error("❌ Failed to fetch listings:", response.status);
        toast.error("Failed to fetch marketplace listings");
      }
    } catch (error) {
      console.error("❌ Error fetching listings:", error);
      toast.error("Error fetching marketplace listings");
    } finally {
      setLoading(false);
    }
  };

  // Approve a listing
  const approveListing = async (listingId: string) => {
    try {
      console.log("✅ Approving listing:", listingId);
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch(`/api/v1/admin/approve-listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          action: 'approve'
        })
      });

      if (response.ok) {
        toast.success("Listing approved successfully");
        await fetchListings(selectedStatus);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve listing');
      }
    } catch (error: any) {
      console.error("❌ Error approving listing:", error);
      toast.error(`Failed to approve listing: ${error.message}`);
    }
  };

  // Reject a listing
  const rejectListing = async (listingId: string) => {
    try {
      console.log("❌ Rejecting listing:", listingId);
      
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch(`/api/v1/admin/approve-listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          action: 'reject'
        })
      });

      if (response.ok) {
        toast.success("Listing rejected");
        await fetchListings(selectedStatus);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject listing');
      }
    } catch (error: any) {
      console.error("❌ Error rejecting listing:", error);
      toast.error(`Failed to reject listing: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchListings(selectedStatus);
  }, [selectedStatus]);

  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Overview Stats - Native Mobile First */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">All marketplace listings</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Active Sales</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.activeSales}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">Approved and live</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">R{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">From approved listings</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Pending Reviews</CardTitle>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{stats.pendingReviews}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Management - Native Mobile */}
      <Card className="p-2 sm:p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base">Marketplace Management</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Review and manage marketplace listings</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-full min-w-max sm:grid sm:w-full sm:grid-cols-4 gap-1">
                <TabsTrigger value="all" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">
                  Rejected
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={selectedStatus} className="space-y-3">
              {/* Search and Filter - Native Mobile */}
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => fetchListings(selectedStatus)}
                  disabled={loading}
                  size="sm"
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>

              {/* Listings Table - Native Mobile Cards */}
              <div className="space-y-2 sm:hidden">
                {/* Mobile Card View */}
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-xs">Loading...</span>
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-xs">No listings found</div>
                ) : (
                  filteredListings.map((listing) => (
                    <Card key={listing.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-medium truncate">{listing.title}</h3>
                            <p className="text-[10px] text-gray-500">{listing.brand} {listing.model}</p>
                          </div>
                          <Badge 
                            variant={
                              listing.status === 'approved' ? 'default' :
                              listing.status === 'pending' ? 'secondary' :
                              'destructive'
                            }
                            className="text-[9px]"
                          >
                            {listing.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                          <span>{listing.seller.name}</span>
                          <span className="font-medium">R{listing.price.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/marketplace/product/${listing.id}`, '_blank')}
                            className="h-6 text-[9px] flex-1"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {listing.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveListing(listing.id)}
                                className="h-6 text-[9px] text-green-600 border-green-300 flex-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectListing(listing.id)}
                                className="h-6 text-[9px] text-red-600 border-red-300 flex-1"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Loading listings...
                          </td>
                        </tr>
                      ) : filteredListings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No listings found
                          </td>
                        </tr>
                      ) : (
                        filteredListings.map((listing) => (
                          <tr key={listing.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <div>
                                <div className="font-medium text-sm">{listing.title}</div>
                                <div className="text-xs text-gray-500">
                                  {listing.brand} {listing.model}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-gray-400" />
                                <div>
                                  <div className="font-medium text-sm">{listing.seller.name}</div>
                                  <div className="text-xs text-gray-500">{listing.seller.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-medium text-sm">R{listing.price.toLocaleString()}</div>
                            </td>
                            <td className="px-3 py-2">
                              <Badge 
                                variant={
                                  listing.status === 'approved' ? 'default' :
                                  listing.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }
                                className="text-xs"
                              >
                                {listing.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {new Date(listing.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/marketplace/product/${listing.id}`, '_blank')}
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                {listing.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => approveListing(listing.id)}
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => rejectListing(listing.id)}
                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplacePanel;
