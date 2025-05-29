import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Calendar, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import type { PuzzleWithProgress, Category } from "@shared/schema";

export default function ProgressPage() {
  const { user } = useUser();

  const { data: puzzles = [] } = useQuery<PuzzleWithProgress[]>({
    queryKey: ["/api/puzzles", user?.id],
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Progress...</h2>
        </div>
      </div>
    );
  }

  const totalPuzzles = puzzles.length;
  const solvedPuzzles = puzzles.filter(p => p.progress?.status === "completed").length;
  const inProgressPuzzles = puzzles.filter(p => p.progress?.status === "in_progress").length;
  const overallProgress = totalPuzzles > 0 ? (solvedPuzzles / totalPuzzles) * 100 : 0;

  const categoryStats = categories.map(category => {
    const categoryPuzzles = puzzles.filter(p => p.categoryId === category.id);
    const categorySolved = categoryPuzzles.filter(p => p.progress?.status === "completed").length;
    const categoryProgress = categoryPuzzles.length > 0 ? (categorySolved / categoryPuzzles.length) * 100 : 0;
    
    return {
      ...category,
      total: categoryPuzzles.length,
      solved: categorySolved,
      progress: categoryProgress,
    };
  });

  const xpProgress = ((user.currentXP % 1000) / 1000) * 100;
  const nextLevelXP = Math.ceil(user.currentXP / 1000) * 1000;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">
            Track your coding journey and achievements
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puzzles Solved</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{solvedPuzzles}</div>
              <p className="text-xs text-muted-foreground">
                out of {totalPuzzles} total
              </p>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{user.level}</div>
              <p className="text-xs text-muted-foreground">
                {user.currentXP} / {nextLevelXP} XP
              </p>
              <Progress value={xpProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{user.streak}</div>
              <p className="text-xs text-muted-foreground">
                days in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">#{user.rank}</div>
              <p className="text-xs text-muted-foreground">
                worldwide
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryStats.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className={`${category.icon} text-lg`} />
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {category.solved}/{category.total}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(category.progress)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={category.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {puzzles
                .filter(p => p.progress?.completedAt)
                .sort((a, b) => {
                  const aDate = new Date(a.progress!.completedAt!);
                  const bDate = new Date(b.progress!.completedAt!);
                  return bDate.getTime() - aDate.getTime();
                })
                .slice(0, 5)
                .map((puzzle) => (
                  <div
                    key={puzzle.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                        <Target className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{puzzle.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Completed {new Date(puzzle.progress!.completedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`difficulty-${puzzle.difficulty}`}>
                        {puzzle.difficulty}
                      </Badge>
                      <span className="text-sm font-medium text-accent">+{puzzle.points} XP</span>
                    </div>
                  </div>
                ))}
              
              {puzzles.filter(p => p.progress?.completedAt).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed puzzles yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start solving puzzles to see your activity here!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
