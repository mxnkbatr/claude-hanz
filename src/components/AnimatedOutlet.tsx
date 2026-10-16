import { cloneElement, isValidElement, type ReactElement } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";

/**
 * AnimatePresence needs a keyed direct child. Putting `key` on `<Outlet />`
 * does not work — every page remounted/flickered the same way.
 */
export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        if ((window.scrollY || 0) > 0) window.scrollTo(0, 0);
      }}
    >
      {outlet && isValidElement(outlet)
        ? cloneElement(outlet as ReactElement, { key: location.pathname })
        : null}
    </AnimatePresence>
  );
}
