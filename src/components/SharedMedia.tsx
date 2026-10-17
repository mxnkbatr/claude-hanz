import { SafeImage } from "./SafeImage";

type Props = {
  id: string;
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

/** Media wrapper (shared-element morph disabled). */
export function SharedMedia({
  id: _id,
  src,
  alt = "",
  className = "",
  loading,
}: Props) {
  return (
    <div className={`shared-media${className ? ` ${className}` : ""}`}>
      <SafeImage src={src} alt={alt} loading={loading} />
    </div>
  );
}
