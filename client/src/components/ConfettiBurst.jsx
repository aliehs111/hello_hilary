import { useMemo } from "react";

const COLORS = [
  "#ec4899", // pink-500
  "#f472b6", // pink-400
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
  "#facc15", // yellow-400
  "#34d399", // emerald-400
  "#c084fc", // purple-400
];

export default function ConfettiBurst({ trigger = 0, count = 24 }) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = -110 + Math.random() * 40 + (i / count) * 180;
      const spread = 70 + Math.random() * 110;
      const radians = (angle * Math.PI) / 180;

      const x = Math.cos(radians) * spread;
      const y = Math.sin(radians) * spread - 80; // pushes burst upward

      return {
        id: `${trigger}-${i}`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        x: `${x.toFixed(1)}px`,
        y: `${y.toFixed(1)}px`,
        r: `${Math.floor(Math.random() * 720 - 360)}deg`,
        duration: `${900 + Math.floor(Math.random() * 500)}ms`,
        delay: `${Math.floor(Math.random() * 120)}ms`,
        width: `${8 + Math.floor(Math.random() * 5)}px`,
        height: `${12 + Math.floor(Math.random() * 7)}px`,
        shape: Math.random() > 0.75 ? "999px" : "2px",
      };
    });
  }, [trigger, count]);

  return (
    <div className="confetti-burst-layer" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            backgroundColor: piece.color,
            width: piece.width,
            height: piece.height,
            borderRadius: piece.shape,
            animationDelay: piece.delay,
            ["--confetti-x"]: piece.x,
            ["--confetti-y"]: piece.y,
            ["--confetti-r"]: piece.r,
            ["--confetti-duration"]: piece.duration,
          }}
        />
      ))}
    </div>
  );
}
