import { motion } from "framer-motion";
import { SafeImage } from "./SafeImage";

type Props = {
  id: string;
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

/** Shared-element media for list → detail morph (layoutId). */
export function SharedMedia({
  id,
  src,
  alt = "",
  className = "",
  loading,
}: Props) {
  return (
    <motion.div
      className={`shared-media${className ? ` ${className}` : ""}`}
      layoutId={`shared-media-${id}`}
      layout
      transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.85 }}
    >
      <SafeImage src={src} alt={alt} loading={loading} />
    </motion.div>
  );
}
