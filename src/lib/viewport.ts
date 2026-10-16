/** Mark phone-class viewports for CSS (no width=390 lock — that caused Safari jank). */
export function lockPhoneViewport() {
  const apply = () => {
    const short = Math.min(screen.width || 0, screen.height || 0);
    const phone =
      (short > 0 && short <= 520) ||
      window.matchMedia("(max-width: 899px) and (pointer: coarse)").matches;
    document.documentElement.classList.toggle("is-phone", phone);
  };

  apply();
  window.addEventListener("orientationchange", () => {
    window.setTimeout(apply, 80);
  });
  window.addEventListener("resize", apply, { passive: true });
}
