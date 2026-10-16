import { Link, type LinkProps } from "react-router-dom";
import { hapticLight } from "../lib/native";

type Props = Omit<LinkProps, "className"> & {
  className?: string;
  children: React.ReactNode;
};

/** iOS-style pressable link with light haptic feedback. */
export function AppLink({ className = "", onClick, children, ...rest }: Props) {
  return (
    <Link
      className={`app-press ${className}`}
      onClick={(e) => {
        void hapticLight();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
