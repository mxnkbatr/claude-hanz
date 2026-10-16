import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { hapticLight } from "../lib/native";
import { sheetEase } from "../lib/motion";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
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
    lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unlockBodyScroll();
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
          transition={{ duration: reduce ? 0.1 : 0.2, ease: sheetEase }}
        >
          <motion.button
            type="button"
            className="bottom-sheet-backdrop"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.08 : 0.18, ease: sheetEase }}
            onClick={() => {
              void hapticLight();
              onClose();
            }}
          />
          <motion.div
            className="bottom-sheet-panel"
            initial={reduce ? { opacity: 1 } : { y: "100%" }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={
              reduce
                ? { duration: 0.14 }
                : { duration: 0.34, ease: sheetEase }
            }
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.55 }}
            dragTransition={{ bounceStiffness: 480, bounceDamping: 36 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 88 || info.velocity.y > 620) {
                void hapticLight();
                onClose();
              }
            }}
          >
            <div className="bottom-sheet-grab" aria-hidden />
            {title && (
              <div className="bottom-sheet-head">
                <strong>{title}</strong>
              </div>
            )}
            <div className="bottom-sheet-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
