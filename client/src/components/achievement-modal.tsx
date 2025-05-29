import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AchievementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: any;
}

export default function AchievementModal({
  open,
  onOpenChange,
  achievement,
}: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white text-2xl h-8 w-8" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2">
              {achievement.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mb-4">
              {achievement.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-2xl font-bold text-accent">+{achievement.xpReward}</span>
            <span className="text-muted-foreground">XP</span>
          </div>

          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
