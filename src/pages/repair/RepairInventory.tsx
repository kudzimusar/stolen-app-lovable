import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/navigation/AppHeader";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Box,
  Truck,
  Receipt,
  BarChart3,
  Filter,
  Download,
  Scan,
  X
} from "lucide-react";

const RepairInventory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    sku: "",
    supplier: "",
    costPrice: "",
    sellPrice: "",
    quantity: "",
    minStock: "",
    location: "",
    description: ""
  });

  // Mock inventory data
  const [inventory] = useState([
    {
      id: "1",
      name: "iPhone 13 Pro Screen (Black)",
      category: "Screens",
      sku: "SCR-IP13P-BLK",
      supplier: "TechParts Suppliers",
      costPrice: 450,
      sellPrice: 650,
      quantity: 12,
      minStock: 5,
      location: "Shelf A-3",
      status: "in_stock",
      lastOrdered: "2024-01-10",
      description: "High-quality OLED replacement screen for iPhone 13 Pro"
    },
    {
      id: "2",
      name: "Samsung Galaxy S22 Battery",
      category: "Batteries",
      sku: "BAT-S22-OEM",
      supplier: "Mobile Components Ltd",
      costPrice: 85,
      sellPrice: 150,
      quantity: 3,
      minStock: 8,
      location: "Drawer B-2",
      status: "low_stock",
      lastOrdered: "2023-12-15",
      description: "Original capacity battery for Galaxy S22 series"
    },
    {
      id: "3",
      name: "Lightning Charging Port Flex Cable",
      category: "Charging Ports",
      sku: "CHG-IP-LTNG",
      supplier: "Apple Parts Direct",
      costPrice: 25,
      sellPrice: 45,
      quantity: 25,
      minStock: 10,
      location: "Drawer C-1",
      status: "in_stock",
      lastOrdered: "2024-01-05",
      description: "Replacement charging port flex cable for iPhone models"
    },
    {
      id: "4",
      name: "iPad Air 4 Touch Digitizer",
      category: "Touch Digitizers",
      sku: "DIG-IPA4-WHT",
      supplier: "TechParts Suppliers",
      costPrice: 180,
      sellPrice: 280,
      quantity: 0,
      minStock: 3,
      location: "Shelf D-1",
      status: "out_of_stock",
      lastOrdered: "2023-11-20",
      description: "Touch sensitive digitizer for iPad Air 4th generation"
    },
    {
      id: "5",
      name: "Precision Screwdriver Set",
      category: "Tools",
      sku: "TOOL-PREC-SET",
      supplier: "Professional Tools Inc",
      costPrice: 65,
      sellPrice: 0, // Tools not sold
      quantity: 8,
      minStock: 2,
      location: "Tool Cabinet",
      status: "in_stock",
      lastOrdered: "2023-10-30",
      description: "Professional precision screwdriver set for device repair"
    },
    {
      id: "6",
      name: "Thermal Paste (5g Tube)",
      category: "Consumables",
      sku: "CONS-THERM-5G",
      supplier: "Repair Supplies Co",
      costPrice: 15,
      sellPrice: 25,
      quantity: 1,
      minStock: 5,
      location: "Supply Drawer",
      status: "low_stock",
      lastOrdered: "2024-01-08",
      description: "High-quality thermal compound for CPU/GPU repairs"
    }
  ]);

  const categories = [...new Set(inventory.map(item => item.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock": return "bg-success text-success-foreground";
      case "low_stock": return "bg-warning text-warning-foreground";
      case "out_of_stock": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock": return "In Stock";
      case "low_stock": return "Low Stock";
      case "out_of_stock": return "Out of Stock";
      default: return "Unknown";
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const inventoryStats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0),
    lowStockItems: inventory.filter(item => item.quantity <= item.minStock).length,
    outOfStockItems: inventory.filter(item => item.quantity === 0).length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const handleAddItem = () => {
    toast({
      title: "Item Added",
      description: "New inventory item has been added successfully.",
    });
    setIsAddingItem(false);
    setNewItem({
      name: "",
      category: "",
      sku: "",
      supplier: "",
      costPrice: "",
      sellPrice: "",
      quantity: "",
      minStock: "",
      location: "",
      description: ""
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parts & Inventory Management</h1>
            <p className="text-muted-foreground">Track repair parts, tools, and supplies inventory</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Scan className="w-4 h-4 mr-2" />
              Scan
            </Button>
            <Button onClick={() => setIsAddingItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{inventoryStats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(inventoryStats.totalValue)}</p>
              </div>
              <Receipt className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-warning">{inventoryStats.lowStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-destructive">{inventoryStats.outOfStockItems}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, SKU, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Inventory List */}
        <div className="grid gap-4">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">SKU</p>
                      <p className="font-medium text-foreground">{item.sku}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Supplier</p>
                      <p className="font-medium text-foreground">{item.supplier}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{item.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Ordered</p>
                      <p className="font-medium text-foreground">{new Date(item.lastOrdered).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className={`font-bold text-lg ${item.quantity <= item.minStock ? 'text-warning' : 'text-foreground'}`}>
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Stock</p>
                      <p className="font-medium text-foreground">{item.minStock}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost Price</p>
                      <p className="font-medium text-foreground">{formatCurrency(item.costPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sell Price</p>
                      <p className="font-medium text-foreground">
                        {item.sellPrice > 0 ? formatCurrency(item.sellPrice) : "N/A"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic">{item.description}</p>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Truck className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Item Modal */}
        {isAddingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Add Inventory Item</h2>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingItem(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        placeholder="e.g., iPhone 13 Pro Screen"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={newItem.category}
                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">Select Category</option>
                        <option value="Screens">Screens</option>
                        <option value="Batteries">Batteries</option>
                        <option value="Charging Ports">Charging Ports</option>
                        <option value="Touch Digitizers">Touch Digitizers</option>
                        <option value="Tools">Tools</option>
                        <option value="Consumables">Consumables</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={newItem.sku}
                        onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                        placeholder="e.g., SCR-IP13P-BLK"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={newItem.supplier}
                        onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                        placeholder="Supplier name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Storage Location</Label>
                      <Input
                        id="location"
                        value={newItem.location}
                        onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                        placeholder="e.g., Shelf A-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="cost-price">Cost Price (R)</Label>
                      <Input
                        id="cost-price"
                        type="number"
                        value={newItem.costPrice}
                        onChange={(e) => setNewItem({...newItem, costPrice: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sell-price">Sell Price (R)</Label>
                      <Input
                        id="sell-price"
                        type="number"
                        value={newItem.sellPrice}
                        onChange={(e) => setNewItem({...newItem, sellPrice: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-stock">Min Stock Level</Label>
                      <Input
                        id="min-stock"
                        type="number"
                        value={newItem.minStock}
                        onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      placeholder="Brief description of the item"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddItem} className="flex-1">
                      Add Item
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingItem(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{selectedItem.name}</h2>
                    <Badge className={getStatusColor(selectedItem.status)}>
                      {getStatusText(selectedItem.status)}
                    </Badge>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3">Item Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SKU:</span>
                        <span className="text-foreground">{selectedItem.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="text-foreground">{selectedItem.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Supplier:</span>
                        <span className="text-foreground">{selectedItem.supplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-foreground">{selectedItem.location}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3">Stock & Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Stock:</span>
                        <span className={`font-bold ${selectedItem.quantity <= selectedItem.minStock ? 'text-warning' : 'text-foreground'}`}>
                          {selectedItem.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Stock:</span>
                        <span className="text-foreground">{selectedItem.minStock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost Price:</span>
                        <span className="text-foreground">{formatCurrency(selectedItem.costPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sell Price:</span>
                        <span className="text-foreground">
                          {selectedItem.sellPrice > 0 ? formatCurrency(selectedItem.sellPrice) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-4 mt-6">
                  <h3 className="font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                </Card>

                <div className="flex gap-3 mt-6">
                  <Button size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Item
                  </Button>
                  <Button variant="outline" size="sm">
                    <Truck className="w-4 h-4 mr-2" />
                    Reorder
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adjust Stock
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairInventory;