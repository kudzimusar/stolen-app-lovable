import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Gift,
  Trophy,
  Star,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Shield,
  Award,
  Zap,
  Target,
  Crown,
  Heart
} from "lucide-react";

const CommunityRewards = () => {
  const [claimingReward, setClaimingReward] = useState<number | null>(null);
  const { toast } = useToast();

  // User stats
  const userStats = {
    totalEarned: 275,
    devicesReturned: 3,
    reportsSubmitted: 7,
    communityRank: 42,
    currentStreak: 15,
    level: "Silver Helper"
  };

  // Available rewards
  const availableRewards = [
    {
      id: 1,
      title: "$50 Cash Reward",
      description: "For returning Sarah's iPhone 15 Pro",
      sponsor: "TechGuard Insurance",
      amount: 50,
      type: "device_return",
      status: "claimable",
      expiryDays: 7,
      requirements: "Device successfully returned to owner"
    },
    {
      id: 2,
      title: "$25 Amazon Gift Card",
      description: "Active community member bonus",
      sponsor: "STOLEN Platform",
      amount: 25,
      type: "community_bonus",
      status: "claimable",
      expiryDays: 14,
      requirements: "5+ verified tips this month"
    }
  ];

  // Claimed rewards history
  const rewardHistory = [
    {
      id: 1,
      title: "$100 Cash Reward",
      description: "MacBook Pro recovery assistance",
      sponsor: "SecureDevice Inc",
      amount: 100,
      claimedDate: "2025-01-15",
      status: "paid"
    },
    {
      id: 2,
      title: "$25 Starbucks Gift Card",
      description: "Community participation reward",
      sponsor: "STOLEN Platform",
      amount: 25,
      claimedDate: "2025-01-10",
      status: "paid"
    },
    {
      id: 3,
      title: "$75 Recovery Reward",
      description: "AirPods Pro return assistance",
      sponsor: "FindMyGadget",
      amount: 75,
      claimedDate: "2025-01-05",
      status: "paid"
    }
  ];

  // Leaderboard
  const leaderboard = [
    { rank: 1, name: "Alex Chen", returns: 12, earnings: 850, badge: "Gold" },
    { rank: 2, name: "Maria Rodriguez", returns: 9, earnings: 675, badge: "Gold" },
    { rank: 3, name: "John Smith", returns: 8, earnings: 600, badge: "Silver" },
    { rank: 4, name: "You", returns: userStats.devicesReturned, earnings: userStats.totalEarned, badge: "Silver" },
    { rank: 5, name: "Emma Wilson", returns: 2, earnings: 200, badge: "Bronze" }
  ];

  const handleClaimReward = async (rewardId: number) => {
    setClaimingReward(rewardId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Reward Claimed!",
      description: "Your reward has been processed and will be transferred shortly.",
      variant: "default"
    });
    
    setClaimingReward(null);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="font-semibold">Community Rewards</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* User Stats Overview */}
        <Card className="p-6 bg-gradient-hero text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Your Impact</h1>
              <p className="text-white/90">Making the community safer, one device at a time</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${userStats.totalEarned}</div>
              <div className="text-sm text-white/90">Total Earned</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{userStats.devicesReturned}</div>
              <div className="text-xs text-white/80">Devices Returned</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{userStats.reportsSubmitted}</div>
              <div className="text-xs text-white/80">Reports Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">#{userStats.communityRank}</div>
              <div className="text-xs text-white/80">Community Rank</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{userStats.currentStreak}</div>
              <div className="text-xs text-white/80">Day Streak</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {userStats.level}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <span className="text-sm">4.9 Community Rating</span>
            </div>
          </div>
        </Card>

        {/* Available Rewards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Rewards</h2>
          
          {availableRewards.length > 0 ? (
            <div className="grid gap-4">
              {availableRewards.map((reward) => (
                <Card key={reward.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{reward.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {reward.expiryDays}d left
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        <span>Sponsored by {reward.sponsor}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong>Requirements:</strong> {reward.requirements}
                      </p>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-success">
                        ${reward.amount}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={claimingReward === reward.id}
                        className="w-full"
                      >
                        {claimingReward === reward.id ? "Claiming..." : "Claim Reward"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rewards Available</h3>
              <p className="text-muted-foreground mb-4">
                Keep helping the community to unlock new rewards!
              </p>
              <Button variant="outline" asChild>
                <Link to="/lost-found-board">Browse Community Board</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Progress to Next Level */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Progress to Gold Helper</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>5 more device returns needed</span>
                <span className="font-medium">3/8 completed</span>
              </div>
              <Progress value={37.5} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Submit 5+ reports ✓</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span>Return 8 devices (3/8)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Maintain 4+ rating ✓</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span>30-day activity streak (15/30)</span>
              </div>
            </div>

            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Gold Helper Benefits:</span>
              </div>
              <ul className="text-sm text-success/80 mt-1 space-y-1">
                <li>• 20% bonus on all rewards</li>
                <li>• Priority support access</li>
                <li>• Exclusive sponsored rewards</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Community Leaderboard */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Community Leaderboard</h2>
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div 
                key={user.rank} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.name === 'You' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(user.rank)}
                    <span className="font-medium">#{user.rank}</span>
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {user.name}
                      {user.name === 'You' && <Heart className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.returns} returns • ${user.earnings} earned
                    </div>
                  </div>
                </div>
                <Badge variant={
                  user.badge === 'Gold' ? 'default' :
                  user.badge === 'Silver' ? 'secondary' : 'outline'
                }>
                  {user.badge}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Reward History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reward History</h2>
          <div className="space-y-3">
            {rewardHistory.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{reward.title}</div>
                  <div className="text-sm text-muted-foreground">{reward.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {reward.sponsor} • Claimed {reward.claimedDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success">${reward.amount}</div>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommunityRewards;