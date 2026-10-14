import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

const COUNT = 36;

export function Snowfall() {
  const reduce = useReducedMotion();
  const flakes = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 14) * 0.4}s`,
        duration: `${8 + (i % 8)}s`,
        size: 3 + (i % 5),
        opacity: 0.4 + (i % 5) * 0.1,
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
