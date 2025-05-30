import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Lightbulb, Eye, Clock, Sparkles, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PuzzleWithProgress, UserWithStats } from "@shared/schema";

interface CodeEditorProps {
  puzzle: PuzzleWithProgress;
  user: UserWithStats;
  onHintRequest: () => void;
  onAchievementUnlocked: (achievement: any) => void;
  onExecutionResult?: (result: any, error: string) => void;
  onSubmitResult?: (result: any) => void;
  onNextPuzzle?: () => void;
  hasNextPuzzle?: boolean;
  onClose?: () => void;
}

export default function CodeEditor({ 
  puzzle, 
  user, 
  onHintRequest, 
  onAchievementUnlocked,
  onExecutionResult,
  onSubmitResult,
  onNextPuzzle,
  hasNextPuzzle = false,
  onClose
}: CodeEditorProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [compilationError, setCompilationError] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timerRef = useRef<NodeJS.Timeout>();

  // Initialize code when puzzle changes
  useEffect(() => {
    const starterCode = puzzle.starterCode as any;
    setCode(starterCode[language] || "");
    setTimeElapsed(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [puzzle.id, language]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const runCodeMutation = useMutation({
    mutationFn: async (data: { code: string; language: string; puzzleId: number }) => {
      console.log("Making API request to run code with:", { language: data.language, codeLength: data.code.length });
      
      const response = await apiRequest("POST", "/api/code/run", {
        code: data.code,
        language: data.language,
        puzzleId: data.puzzleId,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Run code response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Run code success:", data);
      setIsRunning(false);
      
      if (data.error) {
        setCompilationError(data.error);
        setExecutionResult(null);
        onExecutionResult?.(null, data.error);
        toast({
          title: "Compilation Error",
          description: "Check the Output tab for details",
          variant: "destructive",
        });
      } else {
        setCompilationError("");
        setExecutionResult(data);
        onExecutionResult?.(data, "");
        toast({
          title: "Code Executed Successfully! 🎉",
          description: `Passed ${data.passedCount || 0}/${data.totalCount || 0} visible test cases`,
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      console.error("Run code mutation error:", error);
      setIsRunning(false);
      toast({
        title: "Connection Error",
        description: "Failed to execute code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitSolutionMutation = useMutation({
    mutationFn: async (data: { code: string; language: string; puzzleId: number; userId: number }) => {
      console.log("Making API request to /api/code/submit with:", data);
      const response = await apiRequest("POST", `/api/code/submit?userId=${data.userId}`, {
        code: data.code,
        language: data.language,
        puzzleId: data.puzzleId,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Submit response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Submit success:", data);
      setIsRunning(false);
      queryClient.invalidateQueries({ queryKey: ["/api/puzzles", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      
      // Trigger a custom event to refresh user data in useUser hook
      window.dispatchEvent(new CustomEvent('tokenChanged'));
      
      // Pass submit results to parent component for display in Results tab
      if (onSubmitResult) {
        onSubmitResult(data);
      }
      
      // Force success display since API call worked
      if (data && (data.success === true || data.message === "Solution accepted!")) {
        toast({
          title: "Solution Accepted! 🎉",
          description: `Earned ${data.xpGained || 100} XP! All test cases passed.`,
          variant: "default",
        });
        
        // Check for new achievements
        if (data.newAchievements && data.newAchievements.length > 0) {
          data.newAchievements.forEach((achievement: any) => {
            onAchievementUnlocked(achievement);
          });
        }
      } else {
        const failedTests = data.results ? data.results.filter((r: any) => !r.passed).length : 0;
        toast({
          title: "Solution Incorrect",
          description: `${failedTests} test case(s) failed. Keep trying!`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error("Submit mutation error:", error);
      setIsRunning(false);
      toast({
        title: "Connection Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRunCode = () => {
    console.log("Run Code clicked - Code:", code.substring(0, 50) + "...");
    console.log("Language:", language, "Puzzle ID:", puzzle.id);
    
    if (!code.trim()) {
      toast({
        title: "No Code Entered",
        description: "Please write some code before running",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    runCodeMutation.mutate({
      code,
      language,
      puzzleId: puzzle.id,
    });
  };

  const handleSubmit = () => {
    console.log("Submit clicked - Code:", code.substring(0, 50) + "...");
    console.log("Language:", language, "Puzzle ID:", puzzle.id, "User ID:", user.id);
    
    if (!code.trim()) {
      toast({
        title: "No Code Entered",
        description: "Please write some code before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    submitSolutionMutation.mutate({
      code,
      language,
      puzzleId: puzzle.id,
      userId: user.id,
    });
  };

  const handleReset = () => {
    const starterCode = puzzle.starterCode as any;
    setCode(starterCode[language] || "");
  };

  const handleFormat = () => {
    // Basic formatting for demonstration
    const formatted = code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    setCode(formatted);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Puzzle Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{puzzle.title}</h1>
              <span className={`px-3 py-1 text-sm rounded-full font-medium border difficulty-${puzzle.difficulty}`}>
                {puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1)}
              </span>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <span
                    key={i}
                    className={i < puzzle.stars ? "text-yellow-400" : "text-muted-foreground"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              {(puzzle.problemStatement || '').split('\n\n').map((paragraph, index) => (
                <div key={index}>
                  {paragraph.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex} className="mb-1">
                      {line.includes('**') ? (
                        <div 
                          className="font-semibold text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }}
                        />
                      ) : (
                        <div className={line.startsWith('Input:') || line.startsWith('Output:') || line.startsWith('Example:') || line.startsWith('Explanation:') ? 'font-mono text-sm bg-muted/50 px-2 py-1 rounded' : ''}>
                          {line}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-6">
            <Button variant="outline" onClick={onHintRequest}>
              <Lightbulb className="mr-2 h-4 w-4" />
              Hint
            </Button>
            <Button variant="outline" onClick={() => setShowSolution(!showSolution)}>
              <Eye className="mr-2 h-4 w-4" />
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("Close button clicked");
                  onClose();
                }}
                className="h-8 w-8 p-0 hover:bg-muted"
                title="Close puzzle"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Examples */}
        {puzzle.examples && Array.isArray(puzzle.examples) && puzzle.examples.length > 0 && (
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Examples:</h3>
            <div className="font-mono text-sm space-y-3">
              {(puzzle.examples as any[]).map((example, index) => (
                <div key={index} className="bg-background rounded p-3 border">
                  <div className="text-muted-foreground">
                    <span className="font-semibold">Input:</span> <span className="text-foreground">{example.input}</span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-semibold">Output:</span> <span className="text-green-600 dark:text-green-400">{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="text-muted-foreground mt-2 text-xs">
                      <span className="font-semibold">Explanation:</span> {example.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution Display */}
        {showSolution && puzzle.solution && (() => {
          const solutions = typeof puzzle.solution === 'string' 
            ? JSON.parse(puzzle.solution) 
            : puzzle.solution;
          
          return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Complete Solutions
              </h3>
              <div className="space-y-4">
                {/* C Solution */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border-b">
                    <span className="font-medium text-gray-800 dark:text-gray-200">C</span>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-800 p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>{solutions?.c || 'Solution not available'}</code>
                  </pre>
                </div>

                {/* Java Solution */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-red-100 dark:bg-red-900/30 px-3 py-2 border-b">
                    <span className="font-medium text-red-800 dark:text-red-200">Java</span>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-800 p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>{solutions?.java || 'Solution not available'}</code>
                  </pre>
                </div>

                {/* Python Solution */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 border-b">
                    <span className="font-medium text-blue-800 dark:text-blue-200">Python</span>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-800 p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    <code>{solutions?.python || 'Solution not available'}</code>
                  </pre>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Editor Header */}
      <div className="bg-muted border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleFormat}>
            <Sparkles className="mr-1 h-4 w-4" />
            Format
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          {hasNextPuzzle && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNextPuzzle}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <ChevronRight className="mr-1 h-4 w-4" />
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 bg-muted relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            toast({
              title: "Paste Disabled",
              description: "Copy and paste is disabled in the code editor. Please type your solution.",
              variant: "destructive",
            });
          }}
          onCopy={(e) => {
            e.preventDefault();
            toast({
              title: "Copy Disabled",
              description: "Copy and paste is disabled in the code editor.",
              variant: "destructive",
            });
          }}
          className="absolute inset-0 p-4 font-mono text-sm leading-relaxed resize-none bg-transparent text-foreground focus:outline-none"
          placeholder="// Write your solution here"
          spellCheck={false}
        />
      </div>

      {/* Editor Footer - Always Visible Action Buttons */}
      <div className="bg-card border-t border-border p-6 flex items-center justify-between min-h-[80px]">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleRunCode} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-semibold"
            size="lg"
          >
            <span className="mr-2 text-xl">✓</span>
            Submit Solution
          </Button>
        </div>
        <div className="flex items-center space-x-6 text-base text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>Memory:</span>
            <span className="font-mono">12.3 MB</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Runtime:</span>
            <span className="font-mono">2ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
