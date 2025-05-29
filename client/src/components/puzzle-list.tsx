import { useState } from "react";
import { Check, Lock, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PuzzleWithProgress, Category } from "@shared/schema";

interface PuzzleListProps {
  categories: Category[];
  puzzles: PuzzleWithProgress[];
  selectedCategory: number | null;
  selectedPuzzle: PuzzleWithProgress | null;
  onCategorySelect: (categoryId: number | null) => void;
  onPuzzleSelect: (puzzle: PuzzleWithProgress) => void;
}

export default function PuzzleList({
  categories,
  puzzles,
  selectedCategory,
  selectedPuzzle,
  onCategorySelect,
  onPuzzleSelect,
}: PuzzleListProps) {
  const [sortBy, setSortBy] = useState("difficulty");

  const sortedPuzzles = [...puzzles].sort((a, b) => {
    switch (sortBy) {
      case "progress":
        const aStatus = a.progress?.status || "not_started";
        const bStatus = b.progress?.status || "not_started";
        if (aStatus === bStatus) return a.order - b.order;
        return aStatus === "completed" ? 1 : -1;
      case "recent":
        const aDate = a.progress?.completedAt || new Date(0);
        const bDate = b.progress?.completedAt || new Date(0);
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      default:
        return a.order - b.order;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-accent bg-accent/20 border-accent/30";
      case "medium":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "hard":
        return "text-destructive bg-destructive/20 border-destructive/30";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getStatusIcon = (puzzle: PuzzleWithProgress) => {
    if (!puzzle.isUnlocked) {
      return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
    
    if (puzzle.progress?.status === "completed") {
      return <Check className="h-4 w-4 text-accent" />;
    }
    
    return <Play className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="w-80 bg-card border-r border-border overflow-y-auto">
      {/* Category Filter */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onCategorySelect(null)}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => onCategorySelect(category.id)}
            >
              <i className={`${category.icon} mr-2`} />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Puzzle List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Puzzles</h3>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {sortedPuzzles.map((puzzle) => {
            const isSelected = selectedPuzzle?.id === puzzle.id;
            const isCompleted = puzzle.progress?.status === "completed";
            
            return (
              <div
                key={puzzle.id}
                className={cn(
                  "rounded-lg p-4 cursor-pointer transition-all border hover:shadow-sm",
                  isSelected 
                    ? "bg-primary/20 border-primary/50 ring-2 ring-primary/30" 
                    : "bg-card hover:bg-muted/80 border-border hover:border-primary/30",
                  isCompleted && "border-l-4 border-l-green-500"
                )}
                onClick={() => onPuzzleSelect(puzzle)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">{puzzle.title}</h4>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < puzzle.stars ? "text-yellow-400 fill-current" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {puzzle.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-1 text-xs rounded-full border font-medium",
                    getDifficultyColor(puzzle.difficulty)
                  )}>
                    {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">+{puzzle.points} XP</span>
                    {getStatusIcon(puzzle)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
