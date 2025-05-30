import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@shared/schema";

export default function LeaderboardPage() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-black";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-amber-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Leaderboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top performers in the CodeQuest community
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <Card key={entry.user.id} className={`relative ${index === 0 ? 'md:order-2 md:-mt-4' : index === 1 ? 'md:order-1' : 'md:order-3'}`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {getRankIcon(entry.rank)}
                </div>
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-secondary text-white">
                    {entry.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{entry.user.username}</CardTitle>
                <Badge className={getRankBadgeColor(entry.rank)}>
                  {(() => {
                    const totalSolved = Math.floor(entry.totalXP / 100);
                    if (totalSolved >= 100) return "👑 Code Warrior";
                    if (totalSolved >= 50) return "🏆 Algorithm Master";
                    if (totalSolved >= 25) return "🚀 Coding Enthusiast";
                    if (totalSolved >= 10) return "💻 Problem Solver";
                    if (totalSolved >= 5) return "📈 Getting Started";
                    if (totalSolved >= 1) return "⭐ First Steps";
                    return "🌱 Beginner";
                  })()}
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2">
                  <div>
                    <span className="text-2xl font-bold text-primary">{entry.totalXP}</span>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-accent">{entry.solvedCount}</span>
                    <p className="text-xs text-muted-foreground">Puzzles Solved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Global Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 text-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        {entry.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-foreground">{entry.user.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const totalSolved = Math.floor(entry.totalXP / 100);
                          if (totalSolved >= 100) return "👑 Code Warrior";
                          if (totalSolved >= 50) return "🏆 Algorithm Master";
                          if (totalSolved >= 25) return "🚀 Coding Enthusiast";
                          if (totalSolved >= 10) return "💻 Problem Solver";
                          if (totalSolved >= 5) return "📈 Getting Started";
                          if (totalSolved >= 1) return "⭐ First Steps";
                          return "🌱 Beginner";
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-primary">{entry.totalXP}</p>
                      <p className="text-muted-foreground">XP</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-accent">{entry.solvedCount}</p>
                      <p className="text-muted-foreground">Solved</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-yellow-500">{entry.user.streak}</p>
                      <p className="text-muted-foreground">Streak</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
