import { useMemo } from "react";

export default function SparkleOverlay({ count = 12 }) {
  const stars = useMemo(() => {
    const colors = ["#fbbf24", "#f472b6", "#c4b5fd"]; // gold, pink, lavender

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${3 + Math.random() * 3}s`,
      size: `${4 + Math.random() * 10}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="heart-sparkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            background: star.color, // 👈 THIS is where it goes
          }}
        />
      ))}
    </div>
  );
}
