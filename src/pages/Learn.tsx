import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/AppHeader";
import { 
  Search, 
  Play,
  BookOpen,
  Shield,
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  Clock,
  CheckCircle,
  Video,
  FileText,
  Headphones
} from "lucide-react";

const Learn = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: BookOpen },
    { id: "fraud", name: "Fraud Prevention", icon: Shield },
    { id: "marketplace", name: "Marketplace Safety", icon: TrendingUp },
    { id: "blockchain", name: "Blockchain Basics", icon: Users },
    { id: "legal", name: "Legal & Rights", icon: AlertTriangle }
  ];

  const lessons = [
    {
      id: "1",
      title: "How to Spot Fake Device Listings",
      description: "Learn to identify red flags in online device listings",
      category: "fraud",
      type: "video",
      duration: "8 min",
      difficulty: "beginner",
      completed: false,
      rating: 4.8,
      thumbnail: "🔍"
    },
    {
      id: "2",
      title: "Safe Marketplace Transactions",
      description: "Best practices for buying and selling devices safely",
      category: "marketplace",
      type: "article",
      duration: "12 min",
      difficulty: "beginner",
      completed: true,
      rating: 4.9,
      thumbnail: "🛡️"
    },
    {
      id: "3",
      title: "Understanding Device Verification",
      description: "How STOLEN's verification system protects you",
      category: "blockchain",
      type: "interactive",
      duration: "15 min",
      difficulty: "intermediate",
      completed: false,
      rating: 4.7,
      thumbnail: "✅"
    },
    {
      id: "4",
      title: "Your Rights When Buying Second-Hand",
      description: "Legal protections and what to do if things go wrong",
      category: "legal",
      type: "podcast",
      duration: "20 min",
      difficulty: "intermediate",
      completed: false,
      rating: 4.6,
      thumbnail: "⚖️"
    },
    {
      id: "5",
      title: "Common Online Scams in 2024",
      description: "Latest scam techniques and how to avoid them",
      category: "fraud",
      type: "video",
      duration: "18 min",
      difficulty: "advanced",
      completed: false,
      rating: 4.8,
      thumbnail: "🚨"
    },
    {
      id: "6",
      title: "Blockchain Technology Explained",
      description: "Simple explanation of how blockchain secures your devices",
      category: "blockchain",
      type: "article",
      duration: "10 min",
      difficulty: "beginner",
      completed: false,
      rating: 4.5,
      thumbnail: "🔗"
    }
  ];

  const userProgress = {
    totalLessons: lessons.length,
    completedLessons: lessons.filter(l => l.completed).length,
    currentStreak: 3,
    totalPoints: 250,
    certificates: 1
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'podcast': return Headphones;
      case 'interactive': return Play;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-orange-600 bg-orange-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const progressPercentage = (userProgress.completedLessons / userProgress.totalLessons) * 100;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">STOLEN Academy</h1>
          <p className="text-muted-foreground">
            Learn how to protect yourself from device fraud and scams
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Course Completion</span>
                  <span className="text-sm text-muted-foreground">
                    {userProgress.completedLessons}/{userProgress.totalLessons} lessons
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(progressPercentage)}% complete
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:col-span-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userProgress.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{userProgress.totalPoints}</p>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search lessons..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Lessons Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLessons.map((lesson) => {
                const TypeIcon = getTypeIcon(lesson.type);
                return (
                  <Card key={lesson.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl">{lesson.thumbnail}</div>
                        {lesson.completed && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {lesson.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="capitalize">{lesson.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(lesson.difficulty)}>
                          {lesson.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>⭐ {lesson.rating}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        variant={lesson.completed ? "outline" : "default"}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {lesson.completed ? "Review" : "Start Lesson"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredLessons.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No lessons found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCategory !== 'all' 
                      ? "Try adjusting your search or filters." 
                      : "Lessons coming soon!"
                    }
                  </p>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Safety Tips</CardTitle>
            <CardDescription>Essential tips for safe device transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-800">Always Verify</h3>
                </div>
                <p className="text-sm text-green-700">
                  Check device verification status before purchasing any second-hand device.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Meet in Public</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Always meet in safe, public locations when buying or selling devices.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-orange-800">Trust Your Instincts</h3>
                </div>
                <p className="text-sm text-orange-700">
                  If a deal seems too good to be true, it probably is. Walk away from suspicious offers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learn;