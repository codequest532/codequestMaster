import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Play, 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Users, 
  ArrowRight,
  CheckCircle,
  Clock,
  Award
} from "lucide-react";

export default function DemoPage() {
  const [currentTab, setCurrentTab] = useState("editor");
  const [demoProgress, setDemoProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Simulate demo progression
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoProgress(prev => (prev < 100 ? prev + 1 : 0));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">⚡</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CodeQuest Demo
                  </h1>
                  <p className="text-xs text-gray-500">Interactive Platform Preview</p>
                </div>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                🎮 Demo Mode
              </Badge>
              <Link href="/">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  ← Back to Home
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Your Quest
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Demo Introduction */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            Experience CodeQuest
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Live Demo</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our gamified coding platform with real puzzles, interactive editor, and progression system.
          </p>
        </div>

        {/* Demo Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Code Editor</span>
            </TabsTrigger>
            <TabsTrigger value="puzzles" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Puzzles</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          {/* Code Editor Demo */}
          <TabsContent value="editor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Interactive Code Editor</span>
                  </CardTitle>
                  <CardDescription>Write, test, and submit your solutions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                    <div className="text-gray-500">// Two Sum Problem - Easy (C)</div>
                    <div className="text-blue-400">#include</div> <div className="text-yellow-400">&lt;stdio.h&gt;</div>
                    <div className="text-blue-400">#include</div> <div className="text-yellow-400">&lt;stdlib.h&gt;</div>
                    <div className="text-blue-400">int</div><div className="text-gray-300">* </div><div className="text-yellow-400">twoSum</div>(int* nums, int numsSize, int target) {"{"}
                    <div className="ml-4 text-blue-400">int</div> <div className="text-gray-300">* result = malloc(2 * sizeof(int));</div>
                    <div className="ml-4 text-purple-400">for</div> <div className="text-gray-300">(int i = 0; i &lt; numsSize; i++) {"{"}</div>
                    <div className="ml-8 text-purple-400">for</div> <div className="text-gray-300">(int j = i + 1; j &lt; numsSize; j++) {"{"}</div>
                    <div className="ml-12 text-purple-400">if</div> <div className="text-gray-300">(nums[i] + nums[j] == target) {"{"}</div>
                    <div className="ml-16 text-gray-300">result[0] = i; result[1] = j;</div>
                    <div className="ml-16 text-purple-400">return</div> <div className="text-gray-300">result;</div>
                    <div className="ml-12">{"}"}</div>
                    <div className="ml-8">{"}"}</div>
                    <div className="ml-4">{"}"}</div>
                    <div>{"}"}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? "Running..." : "Run Code"}
                    </Button>
                    <Badge variant="outline">C</Badge>
                    <Badge variant="outline">Python</Badge>
                    <Badge variant="outline">Java</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Test Results</span>
                  </CardTitle>
                  <CardDescription>Real-time feedback and validation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Test Case 1: [2,7,11,15], target = 9</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Passed</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Test Case 2: [3,2,4], target = 6</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Passed</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Hidden Test Case</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Passed</Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Execution Time: 52ms</span>
                      <span>Memory: 42MB</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">+50 XP Earned!</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Puzzles Demo */}
          <TabsContent value="puzzles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Two Sum", difficulty: "Easy", points: 50, category: "Arrays", solved: true },
                { title: "Valid Parentheses", difficulty: "Easy", points: 50, category: "Stack", solved: true },
                { title: "Binary Tree Traversal", difficulty: "Medium", points: 100, category: "Trees", solved: false },
                { title: "Longest Substring", difficulty: "Medium", points: 100, category: "Sliding Window", solved: false },
                { title: "Merge K Sorted Lists", difficulty: "Hard", points: 200, category: "Linked Lists", solved: false },
                { title: "Word Ladder", difficulty: "Hard", points: 200, category: "Graph", solved: false },
              ].map((puzzle, index) => (
                <Card key={index} className={`cursor-pointer transition-all hover:shadow-lg ${puzzle.solved ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{puzzle.title}</CardTitle>
                      {puzzle.solved && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={puzzle.difficulty === 'Easy' ? 'default' : puzzle.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                        {puzzle.difficulty}
                      </Badge>
                      <Badge variant="outline">{puzzle.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{puzzle.points} XP</span>
                      </div>
                      <Button size="sm" variant={puzzle.solved ? "outline" : "default"}>
                        {puzzle.solved ? "Review" : "Solve"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Demo */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Your Progress</span>
                  </CardTitle>
                  <CardDescription>Track your coding journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level 3 Progress</span>
                      <span>{demoProgress}%</span>
                    </div>
                    <Progress value={demoProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>250 XP</span>
                      <span>500 XP</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-sm text-gray-600">Problems Solved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">7</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Achievements</span>
                  </CardTitle>
                  <CardDescription>Unlock badges and rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "First Solve", description: "Complete your first puzzle", unlocked: true },
                      { name: "Speed Demon", description: "Solve 5 problems in under 10 minutes", unlocked: true },
                      { name: "Week Warrior", description: "Maintain a 7-day streak", unlocked: true },
                      { name: "Algorithm Master", description: "Solve 50 algorithm problems", unlocked: false },
                    ].map((achievement, index) => (
                      <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${achievement.unlocked ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                          <Trophy className={`h-4 w-4 ${achievement.unlocked ? 'text-yellow-900' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{achievement.name}</div>
                          <div className="text-xs text-gray-600">{achievement.description}</div>
                        </div>
                        {achievement.unlocked && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leaderboard Demo */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Global Leaderboard</span>
                </CardTitle>
                <CardDescription>Compete with developers worldwide</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "CodeMaster", score: 2450, streak: 21 },
                    { rank: 2, name: "AlgoExpert", score: 2280, streak: 15 },
                    { rank: 3, name: "DevNinja", score: 2150, streak: 12 },
                    { rank: 4, name: "You (Demo)", score: 1850, streak: 7 },
                    { rank: 5, name: "PythonPro", score: 1720, streak: 9 },
                  ].map((player, index) => (
                    <div key={index} className={`flex items-center space-x-4 p-3 rounded-lg ${player.rank === 4 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        player.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        player.rank === 2 ? 'bg-gray-300 text-gray-700' :
                        player.rank === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-blue-500 text-white'
                      }`}>
                        {player.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">{player.score} XP</div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{player.streak} day streak</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Coding Quest?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of developers improving their skills through gamified learning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}