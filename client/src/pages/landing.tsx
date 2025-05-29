import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Trophy, Users, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900">⚡</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CodeQuest
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 border-blue-200">
            🚀 Master Programming Through Gaming
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Level Up Your
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Coding Skills
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your programming journey into an epic adventure. Solve challenges, earn XP, unlock achievements, and compete with developers worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Your Quest
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2">
                View Demo
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>150+ Challenges</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>3 Languages</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Real-time Compiler</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 lg:px-8 py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose CodeQuest?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Experience programming like never before with our gamified learning platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Multi-Language Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Code in Java, Python, and C with real-time compilation and error detection
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Gamified Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn XP, unlock achievements, and level up as you master programming concepts
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Global Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compete with developers worldwide and track your progress against peers
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Instant Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get immediate results with detailed test case analysis and performance metrics
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Adventure</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Three distinct paths to programming mastery
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all hover:-translate-y-2">
              <CardHeader>
                <div className="text-4xl mb-4">🧮</div>
                <CardTitle className="text-2xl">Algorithms</CardTitle>
                <CardDescription className="text-lg">
                  Master fundamental algorithms and problem-solving techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Sorting & Searching</div>
                  <div>• Dynamic Programming</div>
                  <div>• Graph Algorithms</div>
                  <div>• Recursion & Backtracking</div>
                </div>
                <Badge className="mt-4 bg-blue-100 text-blue-700">50 Challenges</Badge>
              </CardContent>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-all hover:-translate-y-2">
              <CardHeader>
                <div className="text-4xl mb-4">🏗️</div>
                <CardTitle className="text-2xl">Data Structures</CardTitle>
                <CardDescription className="text-lg">
                  Learn arrays, trees, graphs, and advanced data structures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Arrays & Linked Lists</div>
                  <div>• Trees & Binary Search</div>
                  <div>• Stacks & Queues</div>
                  <div>• Hash Tables & Graphs</div>
                </div>
                <Badge className="mt-4 bg-green-100 text-green-700">50 Challenges</Badge>
              </CardContent>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-all hover:-translate-y-2">
              <CardHeader>
                <div className="text-4xl mb-4">🧩</div>
                <CardTitle className="text-2xl">Logic Puzzles</CardTitle>
                <CardDescription className="text-lg">
                  Challenge your logical thinking with brain teasers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Mathematical Logic</div>
                  <div>• Pattern Recognition</div>
                  <div>• Brain Teasers</div>
                  <div>• Critical Thinking</div>
                </div>
                <Badge className="mt-4 bg-purple-100 text-purple-700">50 Challenges</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-8 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who are leveling up their skills with CodeQuest
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-12 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100">
              Start Coding Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-8 py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold">CodeQuest</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Transforming programming education through gamification
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <span>© 2025 CodeQuest</span>
            <span>•</span>
            <span>Made with ❤️ for developers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}