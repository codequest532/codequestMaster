import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Plus, Edit, Trash2, Save, Users, Trophy, BookOpen, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";

export default function AdminPage() {
  const [selectedPuzzle, setSelectedPuzzle] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: puzzles = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/puzzles"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    totalPuzzles: number;
    solutionsToday: number;
    activeSessions: number;
    todaySolutionsWithUsers: any[];
  }>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 0, // Always fetch fresh admin statistics
  });

  const createPuzzleMutation = useMutation({
    mutationFn: async (puzzleData: any) => {
      const response = await apiRequest("POST", "/api/admin/puzzles", puzzleData);
      if (!response.ok) throw new Error("Failed to create puzzle");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Puzzle created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/puzzles"] });
      setShowCreateForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create puzzle", variant: "destructive" });
    },
  });

  const deletePuzzleMutation = useMutation({
    mutationFn: async (puzzleId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/puzzles/${puzzleId}`);
      if (!response.ok) throw new Error("Failed to delete puzzle");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Puzzle deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/puzzles"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete puzzle", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ userId, message }: { userId: number; message: string }) => {
      const response = await apiRequest("POST", "/api/admin/send-message", { userId, message });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Message sent successfully" });
      setShowMessageDialog(false);
      setMessageText("");
      setSelectedUser(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", "/api/admin/make-admin", { userId });
      if (!response.ok) throw new Error("Failed to make user admin");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "User promoted to admin successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to promote user to admin", variant: "destructive" });
    },
  });

  const handleSendMessage = (user: any) => {
    setSelectedUser(user);
    setShowMessageDialog(true);
  };

  const handleSubmitMessage = () => {
    if (!messageText.trim() || !selectedUser) return;
    sendMessageMutation.mutate({ userId: selectedUser.id, message: messageText });
  };

  const handleViewProgress = (user: any) => {
    // Navigate to user's progress page or show detailed progress modal
    setLocation(`/progress?userId=${user.id}`);
  };

  const handleViewUserDetail = async (solution: any) => {
    try {
      const token = localStorage.getItem('codequest_token');
      if (!token) return;

      // Fetch user puzzles with progress data
      const puzzlesResponse = await fetch(`/api/puzzles?userId=${solution.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (puzzlesResponse.ok) {
        const puzzlesData = await puzzlesResponse.json();
        setSelectedUserForDetail({
          ...solution,
          puzzles: puzzlesData
        });
        setShowUserDetailModal(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    }
  };

  const handleMakeAdmin = (user: any) => {
    makeAdminMutation.mutate(user.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CodeQuest Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Manage puzzles, users, and platform content</p>
            </div>
          </div>
          
          {/* Close Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation('/puzzles')}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="p-6 pb-32 min-h-screen">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="puzzles" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Puzzles</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Puzzle</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Stats Cards - Forced Horizontal Row */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Puzzles</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.totalPuzzles || 0}</p>
                  </div>
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Quest Master</p>
                    <p className="text-lg font-bold text-purple-600">{users?.reduce((top: any, user: any) => {
                      const userDailyXP = user.totalXP || 0;
                      const topDailyXP = top?.totalXP || 0;
                      return userDailyXP > topDailyXP ? user : top;
                    }, null)?.username || "-"}</p>
                  </div>
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                    <p className="text-2xl font-bold text-orange-600">{stats?.activeSessions || 0}</p>
                  </div>
                  <Code className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Global User Progress - Real User Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-4">Global User Progress</h3>
              <div className="space-y-3">
                {users && users.length > 0 ? (
                  users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{user.username?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <button 
                            onClick={() => handleViewProgress(user)}
                            className="text-sm font-medium hover:text-blue-600 transition-colors cursor-pointer text-left"
                          >
                            {user.username}
                          </button>
                          <p className="text-xs text-blue-600 font-medium">{user.totalXP || 0} XP Total</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Level {user.level || 1} • {Math.floor((user.totalXP || 0) / 100)} puzzles solved
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const totalSolved = Math.floor((user.totalXP || 0) / 100);
                          let icon = "🌱";
                          
                          if (totalSolved >= 100) {
                            icon = "👑";
                          } else if (totalSolved >= 50) {
                            icon = "🏆";
                          } else if (totalSolved >= 25) {
                            icon = "🚀";
                          } else if (totalSolved >= 10) {
                            icon = "💻";
                          } else if (totalSolved >= 5) {
                            icon = "📈";
                          } else if (totalSolved >= 1) {
                            icon = "⭐";
                          }
                          
                          return (
                            <span className="inline-flex items-center justify-center w-8 h-8 text-lg bg-transparent">
                              {icon}
                            </span>
                          );
                        })()}
                        <Badge variant="outline" className="text-xs">
                          +{user.totalXP || 0} XP
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No users found</p>
                    <p className="text-xs mt-1">User progress will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-4">Today's Solutions</h3>
              <div className="space-y-3">
                {stats?.todaySolutionsWithUsers && stats.todaySolutionsWithUsers.length > 0 ? (
                  stats.todaySolutionsWithUsers.map((solution: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{solution.username?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{solution.username}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Solved: {solution.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={solution.difficulty === 'easy' ? 'default' : solution.difficulty === 'medium' ? 'secondary' : 'destructive'} className="text-xs">
                          {solution.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(solution.completedAt).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No users found</p>
                    <p className="text-xs mt-1">User progress will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Puzzles Tab */}
          <TabsContent value="puzzles" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Manage Puzzles</h2>
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Puzzle
              </Button>
            </div>

            <div className="grid gap-4">
              {puzzles.map((puzzle: any) => (
                <Card key={puzzle.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{puzzle.title}</h3>
                        <Badge variant={puzzle.difficulty === 'easy' ? 'default' : puzzle.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                          {puzzle.difficulty}
                        </Badge>
                        <Badge variant="outline">{categories.find(c => c.id === puzzle.categoryId)?.name}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{puzzle.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPuzzle(puzzle)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deletePuzzleMutation.mutate(puzzle.id)}
                        disabled={deletePuzzleMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Badge variant="outline" className="text-sm">
                Total Users: {users?.length || 0}
              </Badge>
            </div>
            
            {/* Horizontal Table Layout - Full Width with Scroll */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-60">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* User Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{user.username?.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Contact */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          📱 {user.mobile || 'No mobile'}
                        </div>
                      </td>
                      
                      {/* Progress */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">Level {user.level}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.totalXP || 0} XP
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isAdmin ? (
                          <Badge variant="destructive">Admin</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">User</Badge>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 min-w-[240px]">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleViewProgress(user)}>
                            View Progress
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleSendMessage(user)} className="text-xs">
                            Send Message
                          </Button>
                          {!user.isAdmin && (
                            <Button variant="outline" size="sm" className="text-orange-600 border-orange-600 text-xs" onClick={() => handleMakeAdmin(user)}>
                              Make Admin
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Create Puzzle Tab */}
          <TabsContent value="create">
            <PuzzleCreateForm 
              categories={categories}
              onSubmit={(data: any) => createPuzzleMutation.mutate(data)}
              isLoading={createPuzzleMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Send a message to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal */}
      <Dialog open={showUserDetailModal} onOpenChange={setShowUserDetailModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{selectedUserForDetail?.username?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <span className="text-xl">{selectedUserForDetail?.username}</span>
                <p className="text-sm text-muted-foreground">{selectedUserForDetail?.totalXP || 0} XP Total</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedUserForDetail && (
            <div className="space-y-6">
              {/* Category Progress */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Progress by Category</h3>
                <div className="grid gap-4">
                  {categories.map((category: any) => {
                    const categoryPuzzles = selectedUserForDetail.puzzles?.filter((p: any) => p.categoryId === category.id) || [];
                    const solvedPuzzles = categoryPuzzles.filter((p: any) => p.progress?.status === 'completed');
                    const totalXP = solvedPuzzles.reduce((sum: number, p: any) => sum + (p.points || 100), 0);
                    
                    return (
                      <div key={category.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{category.name}</h4>
                          <span className="text-sm text-muted-foreground">{solvedPuzzles.length}/{categoryPuzzles.length} solved</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>{totalXP} XP earned</span>
                          <div className="flex space-x-1">
                            {['easy', 'medium', 'hard'].map(difficulty => {
                              const count = solvedPuzzles.filter((p: any) => p.difficulty === difficulty).length;
                              return count > 0 && (
                                <Badge 
                                  key={difficulty} 
                                  variant={difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive'} 
                                  size="default"
                                  className="text-xs"
                                >
                                  {count} {difficulty}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Solved Puzzles */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recently Solved Puzzles</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedUserForDetail.puzzles
                    ?.filter((p: any) => p.progress?.status === 'completed')
                    .sort((a: any, b: any) => new Date(b.progress.completedAt).getTime() - new Date(a.progress.completedAt).getTime())
                    .slice(0, 10)
                    .map((puzzle: any) => (
                    <div key={puzzle.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{puzzle.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Completed {new Date(puzzle.progress.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={puzzle.difficulty === 'easy' ? 'default' : puzzle.difficulty === 'medium' ? 'secondary' : 'destructive'} 
                          size="default"
                          className="text-xs"
                        >
                          {puzzle.difficulty}
                        </Badge>
                        <Badge variant="outline" size="default" className="text-xs">
                          +{puzzle.points || 100} XP
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-muted-foreground py-4">No puzzles solved yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PuzzleCreateForm({ categories, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    categoryId: "",
    problemStatement: "",
    constraints: "",
    hints: "",
    starterCodeJava: "",
    starterCodePython: "",
    starterCodeC: "",
    solutionJava: "",
    solutionPython: "",
    solutionC: "",
    testCases: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const puzzleData = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      points: formData.difficulty === 'easy' ? 10 : formData.difficulty === 'medium' ? 20 : 30,
      stars: formData.difficulty === 'easy' ? 1 : formData.difficulty === 'medium' ? 2 : 3,
      examples: [],
      hints: formData.hints.split('\n').filter(h => h.trim()),
      starterCode: {
        java: formData.starterCodeJava,
        python: formData.starterCodePython,
        c: formData.starterCodeC
      },
      solution: {
        java: formData.solutionJava,
        python: formData.solutionPython,
        c: formData.solutionC
      },
      testCases: formData.testCases.split('\n').map(tc => {
        const [input, expected] = tc.split('|');
        return { input: input?.trim(), expected: expected?.trim(), hidden: false };
      }).filter(tc => tc.input && tc.expected)
    };

    onSubmit(puzzleData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Puzzle</CardTitle>
        <CardDescription>Add a new coding challenge to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Two Sum Problem"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the problem"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemStatement">Problem Statement</Label>
            <Textarea
              id="problemStatement"
              value={formData.problemStatement}
              onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
              placeholder="Detailed problem description..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints">Constraints</Label>
            <Textarea
              id="constraints"
              value={formData.constraints}
              onChange={(e) => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
              placeholder="Problem constraints and limitations..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hints">Hints (one per line)</Label>
            <Textarea
              id="hints"
              value={formData.hints}
              onChange={(e) => setFormData(prev => ({ ...prev, hints: e.target.value }))}
              placeholder="Hint 1&#10;Hint 2&#10;Hint 3"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Starter Code</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="starterCodeJava">Java</Label>
                <Textarea
                  id="starterCodeJava"
                  value={formData.starterCodeJava}
                  onChange={(e) => setFormData(prev => ({ ...prev, starterCodeJava: e.target.value }))}
                  placeholder="public class Solution {&#10;    // Your code here&#10;}"
                  rows={4}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="starterCodePython">Python</Label>
                <Textarea
                  id="starterCodePython"
                  value={formData.starterCodePython}
                  onChange={(e) => setFormData(prev => ({ ...prev, starterCodePython: e.target.value }))}
                  placeholder="def solution():&#10;    # Your code here&#10;    pass"
                  rows={4}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="starterCodeC">C</Label>
                <Textarea
                  id="starterCodeC"
                  value={formData.starterCodeC}
                  onChange={(e) => setFormData(prev => ({ ...prev, starterCodeC: e.target.value }))}
                  placeholder="#include <stdio.h>&#10;&#10;int main() {&#10;    // Your code here&#10;    return 0;&#10;}"
                  rows={4}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Solutions</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="solutionJava">Java Solution</Label>
                <Textarea
                  id="solutionJava"
                  value={formData.solutionJava}
                  onChange={(e) => setFormData(prev => ({ ...prev, solutionJava: e.target.value }))}
                  placeholder="Complete Java solution..."
                  rows={6}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solutionPython">Python Solution</Label>
                <Textarea
                  id="solutionPython"
                  value={formData.solutionPython}
                  onChange={(e) => setFormData(prev => ({ ...prev, solutionPython: e.target.value }))}
                  placeholder="Complete Python solution..."
                  rows={6}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solutionC">C Solution</Label>
                <Textarea
                  id="solutionC"
                  value={formData.solutionC}
                  onChange={(e) => setFormData(prev => ({ ...prev, solutionC: e.target.value }))}
                  placeholder="Complete C solution..."
                  rows={6}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testCases">Test Cases (format: input|expected, one per line)</Label>
            <Textarea
              id="testCases"
              value={formData.testCases}
              onChange={(e) => setFormData(prev => ({ ...prev, testCases: e.target.value }))}
              placeholder="[1,2,3]|6&#10;[4,5,6]|15"
              rows={4}
              className="font-mono"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Puzzle"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
