import { useEffect, useRef } from "react";

export function CharacterSpriteAnimation({
  image,
  frameDuration = 160,
}: {
  image: string;
  frameDuration?: number;
}) {
  const rows = 1;
  const cols = 6;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalFrames = cols * rows;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = image.replace(/\.png$/, "-sprite.png");
    let loaded = false;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();

    const observer = new ResizeObserver(() => resize());
    observer.observe(container);

    let frame = 0;
    let lastTime = 0;
    let animId: number;

    const animate = (time: number) => {
      if (time - lastTime >= frameDuration && loaded) {
        frame = (frame + 1) % totalFrames;
        lastTime = time;
      }
      if (loaded && canvas.width > 0 && canvas.height > 0 && img.complete) {
        const cols = img.width / img.height;
        const frameWidth = img.width / cols;
        const frameHeight = img.height / rows;
        const col = frame % cols;
        const row = Math.floor(frame / cols);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          col * frameWidth,
          row * frameHeight,
          frameWidth,
          frameHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }
      animId = requestAnimationFrame(animate);
    };

    img.onload = () => {
      loaded = true;
      resize();
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [image, cols, rows, frameDuration, totalFrames]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
