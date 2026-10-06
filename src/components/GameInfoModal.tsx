import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface GameInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  tag?: string;
  image?: string | ReactNode;
}

export function GameInfoModal({
  open,
  onOpenChange,
  title,
  description,
  tag,
  image,
}: GameInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {image && (
            <div className="mb-4 flex justify-center">
              {typeof image === "string" ? (
                <img
                  src={image}
                  alt={title}
                  className="h-32 w-auto object-contain drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
                />
              ) : (
                <div className="h-32 w-auto">{image}</div>
              )}
            </div>
          )}
          {tag && <span className="text-[10px] uppercase tracking-widest text-primary">{tag}</span>}
          <DialogTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
