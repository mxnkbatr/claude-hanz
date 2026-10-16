import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { hapticLight } from "../lib/native";
import { ease } from "../lib/motion";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
};

const panelSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 0.86,
};

export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  children,
  className = "",
}: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`bottom-sheet${className ? ` ${className}` : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.32, ease }}
        >
          <motion.button
            type="button"
            className="bottom-sheet-backdrop"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.28, ease }}
            onClick={() => {
              void hapticLight();
              onClose();
            }}
          />
          <motion.div
            className="bottom-sheet-panel"
            initial={
              reduce
                ? { opacity: 1 }
                : { y: "108%", scale: 0.97, opacity: 0.92 }
            }
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { y: "108%", scale: 0.985, opacity: 0.9 }
            }
            transition={
              reduce
                ? { duration: 0.16 }
                : {
                    y: panelSpring,
                    scale: panelSpring,
                    opacity: { duration: 0.28, ease },
                  }
            }
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.035, bottom: 0.62 }}
            dragTransition={{ bounceStiffness: 420, bounceDamping: 32 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 88 || info.velocity.y > 620) {
                void hapticLight();
                onClose();
              }
            }}
            style={{ willChange: "transform" }}
          >
            <div className="bottom-sheet-grab" aria-hidden />
            {title && (
              <motion.div
                className="bottom-sheet-head"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.32, ease }}
              >
                <strong>{title}</strong>
              </motion.div>
            )}
            <div className="bottom-sheet-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
