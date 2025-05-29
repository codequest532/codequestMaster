import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Bell, User, LogOut, Search, Trophy, TrendingUp, Medal, Eye, Mail, Phone, Lock, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PuzzleList from "@/components/puzzle-list";
import CodeEditor from "@/components/code-editor";
import TestPanel from "@/components/test-panel";
import AchievementModal from "@/components/achievement-modal";
import HintModal from "@/components/hint-modal";
import AIPuzzleGenerator from "@/components/ai-puzzle-generator";
import PasswordResetModal from "@/components/password-reset-modal";
import { useUser } from "@/hooks/use-user";
import type { PuzzleWithProgress, Category } from "@shared/schema";

export default function PuzzlesPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleWithProgress | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [achievementData, setAchievementData] = useState(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [compilationError, setCompilationError] = useState<string>("");
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('codequest_token');
    window.dispatchEvent(new Event('tokenChanged'));
    toast({
      title: "Logged out successfully",
      description: "See you next time on CodeQuest!",
    });
    setLocation('/');
  };

  const handleAddMobile = async () => {
    try {
      const token = localStorage.getItem('codequest_token');
      if (!token) return;

      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mobile: mobileNumber })
      });

      if (response.ok) {
        setShowMobileForm(false);
        setMobileNumber('');
        toast({
          title: "Mobile number added successfully!",
          description: "Your profile has been updated.",
        });
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating mobile:', error);
      toast({
        title: "Error",
        description: "Failed to update mobile number. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordResetEmail = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/auth/reset-password-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('codequest_token')}`
        },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        toast({
          title: "Password reset email sent!",
          description: "Check your email for reset instructions",
        });
      } else {
        toast({
          title: "Reset failed",
          description: "Unable to send reset email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordResetSMS = async () => {
    if (!user?.mobile) return;
    
    try {
      const response = await fetch('/api/auth/reset-password-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('codequest_token')}`
        },
        body: JSON.stringify({ mobile: user.mobile })
      });

      if (response.ok) {
        toast({
          title: "Password reset SMS sent!",
          description: "Check your mobile for reset code",
        });
      } else {
        toast({
          title: "Reset failed",
          description: "Unable to send reset SMS. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: puzzles = [] } = useQuery<PuzzleWithProgress[]>({
    queryKey: ["/api/puzzles", user?.id],
    enabled: !!user,
  });

  const filteredPuzzles = selectedCategory 
    ? puzzles.filter(p => p.categoryId === selectedCategory)
    : puzzles;

  // Auto-select first available puzzle if none selected and not showing dashboard
  if (!selectedPuzzle && filteredPuzzles.length > 0 && !showDashboard && selectedCategory) {
    // For now, assume all puzzles are unlocked - adjust logic as needed
    setSelectedPuzzle(filteredPuzzles[0]);
  }

  const handleAchievementUnlocked = (achievement: any) => {
    setAchievementData(achievement);
    setShowAchievement(true);
  };

  const onCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSelectedPuzzle(null); // Clear selected puzzle when changing category
    setShowDashboard(false); // Hide dashboard when selecting a category
  };

  const handleNextPuzzle = () => {
    if (!selectedPuzzle) return;
    
    const currentIndex = filteredPuzzles.findIndex(p => p.id === selectedPuzzle.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < filteredPuzzles.length) {
      const nextPuzzle = filteredPuzzles[nextIndex];
      setSelectedPuzzle(nextPuzzle);
    }
  };

  const hasNextPuzzle = () => {
    if (!selectedPuzzle) return false;
    
    const currentIndex = filteredPuzzles.findIndex(p => p.id === selectedPuzzle.id);
    return currentIndex >= 0 && currentIndex < filteredPuzzles.length - 1;
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to CodeQuest</h2>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name || "Puzzles"
                  : "Algorithm Challenges"
                }
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Master fundamental algorithms through interactive puzzles
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{user.solvedCount}</p>
                <p className="text-xs text-muted-foreground">Solved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{user.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">#{user.rank}</p>
                <p className="text-xs text-muted-foreground">Global Rank</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {/* User Info */}
                <div className="px-3 py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <User className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">Level {user.level}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="px-3 py-2 border-b">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{user.solvedCount || 0}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center">
                        <Trophy className="mr-1 h-3 w-3" />
                        Solved
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-500">{user.streak || 0}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Streak
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">#{user.rank || '--'}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center">
                        <Medal className="mr-1 h-3 w-3" />
                        Rank
                      </p>
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="px-3 py-2 border-b">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>XP Progress</span>
                    <span>{user.currentXP || 0} / {(Math.ceil((user.currentXP || 0) / 1000) * 1000) || 1000}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(((user.currentXP || 0) % 1000) / 1000) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Menu Actions */}
                <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                
                {/* Admin Panel - Only show for admin users */}
                {user.isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Puzzle List */}
        <PuzzleList
          categories={categories}
          puzzles={filteredPuzzles}
          selectedCategory={selectedCategory}
          selectedPuzzle={selectedPuzzle}
          onCategorySelect={setSelectedCategory}
          onPuzzleSelect={setSelectedPuzzle}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {selectedPuzzle ? (
            <>
              <CodeEditor
                puzzle={selectedPuzzle}
                user={user}
                onHintRequest={() => setShowHint(true)}
                onAchievementUnlocked={handleAchievementUnlocked}
                onExecutionResult={(result, error) => {
                  setExecutionResult(result);
                  setCompilationError(error || "");
                }}
                onSubmitResult={(result) => {
                  setSubmitResult(result);
                }}
                onNextPuzzle={handleNextPuzzle}
                hasNextPuzzle={hasNextPuzzle()}
                onClose={() => {
                  setSelectedPuzzle(null);
                  setSelectedCategory(null);
                  setShowDashboard(true);
                }}
              />
              <TestPanel 
                puzzle={selectedPuzzle} 
                executionResult={executionResult}
                compilationError={compilationError}
                submitResult={submitResult}
              />
            </>
          ) : showDashboard ? (
            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full flex flex-col space-y-6">
                {/* Welcome Section */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Welcome to Your Coding Journey!</h2>
                  <p className="text-muted-foreground">Choose a puzzle from the categories below or generate new challenges</p>
                </div>

                {/* Categories Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const categoryPuzzles = puzzles.filter(p => p.categoryId === category.id);
                    const completedCount = categoryPuzzles.filter(p => p.progress?.status === 'completed').length;
                    
                    return (
                      <div 
                        key={category.id}
                        className="p-6 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => onCategorySelect(category.id)}
                      >
                        <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>{categoryPuzzles.length} puzzles</span>
                          <span className="text-green-600">{completedCount} completed</span>
                        </div>
                        <div className="mt-2 w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${categoryPuzzles.length ? (completedCount / categoryPuzzles.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Puzzle Generator */}
                <div className="border-t pt-6">
                  <AIPuzzleGenerator />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {categories.find(c => c.id === selectedCategory)?.name} Puzzles
                </h3>
                <p className="text-muted-foreground">
                  Select a puzzle from the list to start coding
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AchievementModal
        open={showAchievement}
        onOpenChange={setShowAchievement}
        achievement={achievementData}
      />
      
      <HintModal
        open={showHint}
        onOpenChange={setShowHint}
        puzzle={selectedPuzzle}
      />

      {/* Password Change Modal */}
      <PasswordResetModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <User className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-muted-foreground">Level {user.level} • CodeQuest Member</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Manage your profile, view achievements, and update account settings
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Mobile Number</p>
                      <p className="text-sm text-muted-foreground">{user.mobile || 'Not provided'}</p>
                    </div>
                  </div>
                  {!user.mobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMobileForm(true)}
                    >
                      Add Mobile
                    </Button>
                  )}
                </div>

                {showMobileForm && (
                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-medium mb-3">Add Mobile Number</h4>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleAddMobile}
                        disabled={!mobileNumber.trim()}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowMobileForm(false);
                          setMobileNumber('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
                    </p>
                  </div>
                </div>

                <Separator />
                
                {/* Password Change Option */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Security Settings</span>
                  </h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowPasswordModal(true)}>
                      <Lock className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress & Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Progress Statistics</span>
                </CardTitle>
                <CardDescription>Your coding journey and achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>XP Progress</span>
                    <span className="font-medium">{user.currentXP || 0} / {(Math.ceil((user.currentXP || 0) / 1000) * 1000) || 1000}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(((user.currentXP || 0) % 1000) / 1000) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-primary">{user.solvedCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Problems Solved</p>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                    <TrendingUp className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-500">{user.streak || 0}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-accent/10">
                    <Medal className="h-8 w-8 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-accent">#{user.rank || '--'}</p>
                    <p className="text-sm text-muted-foreground">Global Rank</p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-secondary/10">
                    <User className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-secondary">{user.level || 1}</p>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Recent Achievements</h4>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-start py-2">
                      <Trophy className="mr-2 h-4 w-4" />
                      First Problem Solved
                    </Badge>
                    <Badge variant="outline" className="w-full justify-start py-2">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Algorithm Explorer
                    </Badge>
                    <Badge variant="outline" className="w-full justify-start py-2">
                      <Medal className="mr-2 h-4 w-4" />
                      CodeQuest Champion
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>
              Close
            </Button>
            <Button>
              Update Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
