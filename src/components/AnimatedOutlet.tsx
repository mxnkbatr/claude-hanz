import { cloneElement, isValidElement, type ReactElement } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";

/**
 * AnimatePresence needs a keyed direct child. Putting `key` on `<Outlet />`
 * does not work — every page remounted/flickered the same way.
 *
 * `wait` keeps exit → enter sequential for a clean web feel.
 */
export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {outlet && isValidElement(outlet)
        ? cloneElement(outlet as ReactElement, { key: location.pathname })
        : null}
    </AnimatePresence>
  );
}
