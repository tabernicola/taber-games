import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GameInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  tag?: string;
}

export function GameInfoModal({
  open,
  onOpenChange,
  title,
  description,
  tag,
}: GameInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {tag && (
            <span className="text-[10px] uppercase tracking-widest text-primary">
              {tag}
            </span>
          )}
          <DialogTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
