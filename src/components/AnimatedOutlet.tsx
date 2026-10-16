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
    <AnimatePresence mode="popLayout" initial={false}>
      {outlet && isValidElement(outlet)
        ? cloneElement(outlet as ReactElement, { key: location.pathname })
        : null}
    </AnimatePresence>
  );
}
