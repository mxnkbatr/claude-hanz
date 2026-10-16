import { useEffect, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hapticLight } from "../lib/native";

const PIECES = Array.from({ length: 18 }, (_, i) => i);

type Props = {
  title: string;
  message?: string;
  onDone?: () => void;
  doneLabel?: string;
};

/** Success check + lightweight confetti burst (no extra deps). */
export function SuccessBurst({ title, message, onDone, doneLabel = "OK" }: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    void hapticLight();
  }, []);

  return (
    <motion.div
      className="success-burst"
      role="status"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      {!reduce && (
        <div className="success-confetti" aria-hidden>
          {PIECES.map((i) => (
            <span
              key={i}
              className="success-confetti-piece"
              style={
                {
                  "--x": `${(i % 6) * 16 - 40}px`,
                  "--rot": `${i * 28}deg`,
                  "--delay": `${i * 0.02}s`,
                  "--hue": `${(i * 47) % 360}`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}

      <motion.div
        className="success-check"
        initial={reduce ? false : { scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.05 }}
        aria-hidden
      >
        <svg viewBox="0 0 48 48" width="40" height="40">
          <circle cx="24" cy="24" r="22" fill="currentColor" opacity="0.12" />
          <motion.path
            d="M14 25.5 L21 32.5 L34 16.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.18, duration: 0.45, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onDone && (
        <button type="button" className="success-burst-btn" onClick={onDone}>
          {doneLabel}
        </button>
      )}
    </motion.div>
  );
}
