import { useQuery } from "@tanstack/react-query";
import { Trophy, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import type { Achievement } from "@shared/schema";

export default function AchievementsPage() {
  const { user } = useUser();

  const { data: allAchievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements = [] } = useQuery<any[]>({
    queryKey: ["/api/achievements/user", user?.id],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Achievements...</h2>
        </div>
      </div>
    );
  }

  const unlockedIds = new Set(userAchievements.map(ua => ua.id));
  const totalXP = userAchievements.reduce((sum, ua) => sum + (ua.xpReward || 0), 0);

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return "🏆";
      case "puzzle":
        return "🧩";
      case "streak":
        return "🔥";
      case "special":
        return "⭐";
      default:
        return "🏅";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "milestone":
        return "bg-yellow-500/20 text-yellow-400";
      case "puzzle":
        return "bg-blue-500/20 text-blue-400";
      case "streak":
        return "bg-red-500/20 text-red-400";
      case "special":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Achievements</h1>
          <p className="text-muted-foreground">
            Unlock achievements by solving puzzles and reaching milestones
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unlocked</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{userAchievements.length}</div>
              <p className="text-xs text-muted-foreground">
                out of {allAchievements.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">XP from Achievements</CardTitle>
              <span className="text-lg">⭐</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalXP}</div>
              <p className="text-xs text-muted-foreground">
                bonus experience points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <span className="text-lg">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {Math.round((userAchievements.length / allAchievements.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                achievements unlocked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const userAchievement = userAchievements.find(ua => ua.id === achievement.id);
            
            return (
              <Card
                key={achievement.id}
                className={cn(
                  "transition-all duration-300",
                  isUnlocked
                    ? "bg-gradient-to-br from-card to-accent/5 border-accent/20"
                    : "bg-muted/20 opacity-75"
                )}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center text-2xl",
                      isUnlocked
                        ? "bg-gradient-to-br from-yellow-400 to-accent"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isUnlocked ? getAchievementIcon(achievement.type) : <Lock className="h-6 w-6" />}
                    </div>
                  </div>
                  
                  <CardTitle className={cn(
                    "text-lg",
                    isUnlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {achievement.name}
                  </CardTitle>
                  
                  <div className="flex justify-center">
                    <Badge className={getTypeColor(achievement.type)}>
                      {achievement.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="text-center">
                  <p className={cn(
                    "text-sm mb-4",
                    isUnlocked ? "text-muted-foreground" : "text-muted-foreground/60"
                  )}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <span className={cn(
                      "text-lg font-bold",
                      isUnlocked ? "text-accent" : "text-muted-foreground"
                    )}>
                      +{achievement.xpReward}
                    </span>
                    <span className="text-muted-foreground text-sm">XP</span>
                  </div>
                  
                  {isUnlocked && userAchievement?.unlockedAt && (
                    <p className="text-xs text-muted-foreground">
                      Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {allAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No Achievements Yet
            </h3>
            <p className="text-muted-foreground">
              Start solving puzzles to unlock your first achievement!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
