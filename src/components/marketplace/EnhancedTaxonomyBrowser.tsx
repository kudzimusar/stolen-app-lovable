import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Grid, 
  List, 
  Filter,
  Star,
  TrendingUp,
  Package,
  ArrowLeft,
  Upload,
  Download,
  BarChart3,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { enhancedTaxonomyService, TaxonomyCategory } from '@/lib/services/enhanced-taxonomy-service';

interface EnhancedTaxonomyBrowserProps {
  onCategorySelect?: (category: TaxonomyCategory) => void;
  onFilterChange?: (filters: any) => void;
  mode?: 'browse' | 'search' | 'admin';
  initialCategory?: string;
  showStats?: boolean;
}

export const EnhancedTaxonomyBrowser: React.FC<EnhancedTaxonomyBrowserProps> = ({
  onCategorySelect,
  onFilterChange,
  mode = 'browse',
  initialCategory,
  showStats = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [currentPath, setCurrentPath] = useState<TaxonomyCategory[]>([]);
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TaxonomyCategory[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [taxonomyStats, setTaxonomyStats] = useState<any>(null);

  useEffect(() => {
    loadInitialCategories();
    if (showStats) {
      loadTaxonomyStats();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchCategories();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadInitialCategories = async () => {
    setIsLoading(true);
    try {
      if (initialCategory) {
        const category = await enhancedTaxonomyService.getCategory(initialCategory);
        if (category) {
          const path = await enhancedTaxonomyService.getCategoryPath(category.id);
          setCurrentPath(path);
          const children = await enhancedTaxonomyService.getChildCategories(category.id);
          setCategories(children);
        }
      } else {
        const rootCategories = await enhancedTaxonomyService.getRootCategories();
        setCategories(rootCategories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: 'Loading Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTaxonomyStats = async () => {
    try {
      const stats = await enhancedTaxonomyService.getTaxonomyStats();
      setTaxonomyStats(stats);
    } catch (error) {
      console.error('Failed to load taxonomy stats:', error);
    }
  };

  const searchCategories = async () => {
    try {
      const results = await enhancedTaxonomyService.searchCategories(searchQuery, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const navigateToCategory = async (category: TaxonomyCategory) => {
    try {
      const path = await enhancedTaxonomyService.getCategoryPath(category.id);
      setCurrentPath(path);
      
      const children = await enhancedTaxonomyService.getChildCategories(category.id);
      setCategories(children);
      
      onCategorySelect?.(category);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const navigateBack = async () => {
    if (currentPath.length > 1) {
      const parentCategory = currentPath[currentPath.length - 2];
      await navigateToCategory(parentCategory);
    } else if (currentPath.length === 1) {
      // Go back to root
      setCurrentPath([]);
      const rootCategories = await enhancedTaxonomyService.getRootCategories();
      setCategories(rootCategories);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvText = await file.text();
      const result = await enhancedTaxonomyService.importTaxonomyFromCSV(csvText);
      
      toast({
        title: 'Import Complete',
        description: `Imported ${result.imported} categories. ${result.errors.length} errors.`,
        variant: result.errors.length > 0 ? 'destructive' : 'default'
      });

      // Refresh categories
      await loadInitialCategories();
      setShowUploadDialog(false);
    } catch (error) {
      console.error('CSV import failed:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import CSV file',
        variant: 'destructive'
      });
    }
  };

  const handleCSVExport = async () => {
    try {
      const csvData = await enhancedTaxonomyService.exportTaxonomyToCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taxonomy-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Taxonomy exported to CSV',
        variant: 'default'
      });
    } catch (error) {
      console.error('CSV export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export CSV file',
        variant: 'destructive'
      });
    }
  };

  const renderCategoryCard = (category: TaxonomyCategory, isSearchResult = false) => {
    return (
      <Card
        key={category.id}
        className={`overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
          viewMode === 'grid' ? 'h-32' : 'h-auto'
        }`}
        onClick={() => navigateToCategory(category)}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{category.name}</h3>
                  {isSearchResult && (
                    <div className="text-xs text-muted-foreground">
                      {category.path.join(' > ')}
                    </div>
                  )}
                </div>
              </div>
              {category.featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            {category.description && viewMode === 'list' && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {category.childCount > 0 && (
                <span className="flex items-center gap-1">
                  <Grid className="w-3 h-3" />
                  {category.childCount} sub
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {category.productCount}
              </span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    );
  };

  const renderBreadcrumb = () => {
    if (currentPath.length === 0) return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span 
            className="cursor-pointer hover:underline"
            onClick={() => {
              setCurrentPath([]);
              loadInitialCategories();
            }}
          >
            All Categories
          </span>
          {currentPath.map((category, index) => (
            <div key={category.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span 
                className={`cursor-pointer hover:underline ${
                  index === currentPath.length - 1 ? 'font-semibold' : ''
                }`}
                onClick={() => navigateToCategory(category)}
              >
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Browse Categories</h2>
            <p className="text-sm text-muted-foreground">
              Explore our comprehensive product taxonomy
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {mode === 'admin' && (
              <>
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Taxonomy from CSV</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Upload a CSV file with category data. Required columns: name, slug, level
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="w-full"
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={handleCSVExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}

            <div className="flex items-center border rounded">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats Section */}
      {showStats && taxonomyStats && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Taxonomy Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{taxonomyStats.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{taxonomyStats.totalProducts}</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{taxonomyStats.maxDepth + 1}</div>
              <div className="text-sm text-muted-foreground">Max Depth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{taxonomyStats.topCategories.length}</div>
              <div className="text-sm text-muted-foreground">Top Categories</div>
            </div>
          </div>
        </Card>
      )}

      {/* Breadcrumb */}
      {renderBreadcrumb()}

      {/* Content Area */}
      <div className="space-y-6">
        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Search Results ({searchResults.length})</h3>
            <div className={`grid gap-3 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}>
              {searchResults.map(category => renderCategoryCard(category, true))}
            </div>
          </Card>
        )}

        {/* Category Grid/List */}
        {!searchQuery && (
          <Card className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No Subcategories</h3>
                <p className="text-muted-foreground">
                  This category doesn't have any subcategories. 
                  Browse products directly or go back to parent category.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate(`/marketplace?category=${currentPath[currentPath.length - 1]?.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Products
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {currentPath.length === 0 ? 'All Categories' : `${currentPath[currentPath.length - 1]?.name} Subcategories`}
                    <span className="text-sm text-muted-foreground ml-2">({categories.length})</span>
                  </h3>
                </div>

                <div className={`grid gap-3 ${
                  viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                }`}>
                  {categories.map(category => renderCategoryCard(category))}
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
