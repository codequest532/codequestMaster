import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import PuzzlesPage from "@/pages/puzzles";
import LeaderboardPage from "@/pages/leaderboard";
import ProgressPage from "@/pages/progress";
import AchievementsPage from "@/pages/achievements";
import DemoPage from "@/pages/demo";
import AdminTest from "@/pages/admin-test";
import ResetPasswordPage from "@/pages/reset-password";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { UserProvider } from "@/hooks/use-user";

function Router() {
  const [token, setToken] = useState(localStorage.getItem('codequest_token'));
  const isAuthenticated = !!token;

  // Listen for token changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('codequest_token'));
    };
    
    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for our custom event when token is set in the same tab
    window.addEventListener('tokenChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChanged', handleStorageChange);
    };
  }, []);

  // Special routes that should be accessible regardless of auth status
  return (
    <Switch>
      <Route path="/demo" component={DemoPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/">
        {isAuthenticated ? <DashboardLayout /> : <LandingPage />}
      </Route>
      <Route path="*">
        {isAuthenticated ? <DashboardLayout /> : <LandingPage />}
      </Route>
    </Switch>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={PuzzlesPage} />
          <Route path="/dashboard" component={PuzzlesPage} />
          <Route path="/puzzles" component={PuzzlesPage} />
          <Route path="/leaderboard" component={LeaderboardPage} />
          <Route path="/progress" component={ProgressPage} />
          <Route path="/achievements" component={AchievementsPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/admin-test" component={AdminTest} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <div className="dark">
            <Toaster />
            <Router />
          </div>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
