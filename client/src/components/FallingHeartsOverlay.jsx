// src/components/FallingHeartsOverlay.jsx
import { useMemo } from "react";

export default function FallingHeartsOverlay({ count = 18 }) {
  const hearts = useMemo(() => {
    const colors = [
      "#f472b6", // pink
      "#ec4899",
      "#f9a8d4",
      "#c084fc", // lavender
      "#a78bfa",
      "#fbbf24", // soft gold
      "#ffffff",
    ];

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${7 + Math.random() * 5}s`,
      size: `${12 + Math.random() * 10}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.4 + Math.random() * 0.4,
    }));
  }, [count]);

  return (
    <div className="falling-hearts-overlay" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="falling-heart"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            width: h.size,
            height: h.size,
            color: h.color,
            opacity: h.opacity,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-6.7-4.35-9.2-8.18C.9 9.93 2.1 5.9 5.7 4.6c2.1-.75 4.2.02 5.5 1.74 1.3-1.72 3.4-2.5 5.5-1.74 3.6 1.3 4.8 5.3 2.9 8.2C18.7 16.65 12 21 12 21z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
