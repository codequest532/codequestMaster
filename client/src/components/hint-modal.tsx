import { Lightbulb, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PuzzleWithProgress } from "@shared/schema";

interface HintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  puzzle: PuzzleWithProgress | null;
}

export default function HintModal({
  open,
  onOpenChange,
  puzzle,
}: HintModalProps) {
  if (!puzzle) return null;

  const hints = (puzzle.hints as string[]) || [];
  const firstHint = hints[0] || "No hints available for this puzzle.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            Hint
          </DialogTitle>
        </DialogHeader>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
          <p className="text-foreground">{firstHint}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            -10 XP for using this hint
          </div>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              onClick={() => onOpenChange(false)}
            >
              Use Hint
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
