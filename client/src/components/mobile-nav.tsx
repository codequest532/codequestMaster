import { Link, useLocation } from "wouter";
import { Code, Trophy, TrendingUp, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Puzzles", href: "/puzzles", icon: Code },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Achievements", href: "/achievements", icon: Medal },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === "/puzzles" && location === "/");
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex flex-col items-center py-2 transition-colors cursor-pointer",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
