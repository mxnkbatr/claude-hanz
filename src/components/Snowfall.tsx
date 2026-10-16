import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

const COUNT = 42;

export function Snowfall() {
  const reduce = useReducedMotion();
  const flakes = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${(i * 41 + 7) % 100}%`,
        delay: `${(i % 16) * 0.35}s`,
        duration: `${7 + (i % 9)}s`,
        size: 4 + (i % 6),
        opacity: 0.55 + (i % 5) * 0.08,
      })),
    [],
  );

  if (reduce) return null;

  return (
    <div className="snowfall" aria-hidden>
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake"
          style={{
            left: f.left,
            animationDelay: f.delay,
            animationDuration: f.duration,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
          }}
        />
      ))}
    </div>
  );
}
