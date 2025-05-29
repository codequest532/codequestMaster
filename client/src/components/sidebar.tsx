import { Link, useLocation } from "wouter";
import { Code, Trophy, TrendingUp, Medal, LogOut, Settings } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Puzzles", href: "/puzzles", icon: Code },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Achievements", href: "/achievements", icon: Medal },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();

  if (!user) return null;

  const xpProgress = ((user.currentXP % 1000) / 1000) * 100;
  const nextLevelXP = Math.ceil(user.currentXP / 1000) * 1000;

  const handleLogout = () => {
    localStorage.removeItem('codequest_token');
    window.dispatchEvent(new Event('tokenChanged'));
    toast({
      title: "Logged out successfully",
      description: "See you next time on CodeQuest!",
    });
    setLocation('/');
  };

  // Add admin navigation for admin users
  const allNavigation = user.isAdmin 
    ? [...navigation, { name: "Admin Panel", href: "/admin", icon: Settings }]
    : navigation;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Code className="text-white text-sm" />
          </div>
          <h1 className="text-xl font-bold text-foreground">CodeQuest</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {allNavigation.map((item) => {
            const isActive = location === item.href || (item.href === "/puzzles" && location === "/");
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>


    </aside>
  );
}
