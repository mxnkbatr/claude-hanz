import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

export function TiltCard({
  children,
  className = "",
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const rotateX = useSpring(rx, { stiffness: 220, damping: 20 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 20 });
  const shine = useMotionTemplate`radial-gradient(420px circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.35), transparent 45%)`;

  if (reduce) {
    return <div className={`tilt-card ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(e) => {
        if (window.matchMedia("(pointer: fine)").matches === false) return;
        if (window.innerWidth < 900) return;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        ry.set((px - 0.5) * max * 2);
        rx.set((0.5 - py) * max * 2);
        glowX.set(px * 100);
        glowY.set(py * 100);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
        glowX.set(50);
        glowY.set(50);
      }}
    >
      <div className="tilt-card-inner">{children}</div>
      <motion.div className="tilt-shine" style={{ background: shine }} aria-hidden />
    </motion.div>
  );
}
