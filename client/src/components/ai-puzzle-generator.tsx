import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Code, Zap, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GeneratedPuzzle {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  stars: number;
}

export default function AIPuzzleGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [generatedPuzzles, setGeneratedPuzzles] = useState<GeneratedPuzzle[]>([]);
  const { toast } = useToast();

  const handleGeneratePuzzles = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/puzzles/generate", {
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        count: 3
      });

      // Parse JSON from the response
      const data = await response.json();
      
      if (data && data.success) {
        setGeneratedPuzzles(data.puzzles || []);
        toast({
          title: "Puzzles Generated Successfully!",
          description: `Created ${data.count || 0} new coding challenges using AI.`,
        });
        
        // Refresh the puzzle list without reloading the page
        queryClient.invalidateQueries({ queryKey: ["/api/puzzles"] });
      } else {
        throw new Error("Failed to generate puzzles");
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate new puzzles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoUpdate = async () => {
    setIsAutoUpdating(true);
    try {
      // Generate puzzles for all categories
      const categories = ['Algorithms', 'Data Structures', 'Logic Puzzles'];
      let totalGenerated = 0;
      
      for (const category of categories) {
        const response = await apiRequest("POST", "/api/puzzles/generate", {
          category: category,
          count: 2
        });
        
        const data = await response.json();
        if (data && data.success) {
          totalGenerated += data.count || 0;
        }
      }

      toast({
        title: "Auto-Update Complete!",
        description: `Generated ${totalGenerated} new puzzles across all categories.`,
      });
      
      // Refresh puzzle list
      queryClient.invalidateQueries({ queryKey: ["/api/puzzles"] });
    } catch (error) {
      toast({
        title: "Auto-Update Failed",
        description: "Failed to auto-update puzzles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoUpdating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Brain className="h-5 w-5" />
            AI Puzzle Generator
          </CardTitle>
          <CardDescription>
            Generate new coding challenges automatically using our advanced AI system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category (Optional)</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Logic Puzzles">Logic Puzzles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty (Optional)</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            onClick={handleGeneratePuzzles} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate New Puzzles
          </Button>
          
          <Button 
            onClick={handleAutoUpdate} 
            disabled={isAutoUpdating}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isAutoUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Auto-Update All Categories
          </Button>
        </CardFooter>
      </Card>

      {generatedPuzzles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5" />
            Recently Generated Puzzles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedPuzzles.map((puzzle) => (
              <Card key={puzzle.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base leading-tight">{puzzle.title}</CardTitle>
                    <Badge className={getDifficultyColor(puzzle.difficulty)}>
                      {puzzle.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {puzzle.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                    <span>{puzzle.points} XP</span>
                    <span>{'⭐'.repeat(puzzle.stars)}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">🚀 Real-time Compiler Features</CardTitle>
          <CardDescription>
            Enhanced code execution with performance metrics and intelligent analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 dark:text-blue-400">Execution Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Real-time code compilation</li>
                <li>• Performance metrics tracking</li>
                <li>• Memory usage analysis</li>
                <li>• Runtime optimization hints</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 dark:text-blue-400">Supported Languages:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• JavaScript (ES6+)</li>
                <li>• Python 3</li>
                <li>• Java 11+</li>
                <li>• C++ (C++17)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}