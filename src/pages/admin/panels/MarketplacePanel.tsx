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
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSales}</div>
            <p className="text-xs text-muted-foreground">Approved and live</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From approved listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Management */}
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Management</CardTitle>
          <CardDescription>Review and manage marketplace listings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => fetchListings(selectedStatus)}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Listings Table */}
              <div className="border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium">{listing.title}</div>
                                <div className="text-sm text-gray-500">
                                  {listing.brand} {listing.model}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium">{listing.seller.name}</div>
                                  <div className="text-sm text-gray-500">{listing.seller.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">R{listing.price.toLocaleString()}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge 
                                variant={
                                  listing.status === 'approved' ? 'default' :
                                  listing.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }
                              >
                                {listing.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {new Date(listing.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/marketplace/product/${listing.id}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {listing.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => approveListing(listing.id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => rejectListing(listing.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
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
