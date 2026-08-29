import { useEffect } from "react";

/**
 * Lightweight scroll-reveal, in the spirit of scrollrevealjs.org but with no
 * dependency and SSR-safe:
 *
 *  - Opt in with `data-sr` (reveal the element) or `data-sr-group` (reveal its
 *    direct children in sequence).
 *  - Runs only after hydration, and only hides elements that are still BELOW
 *    the fold — anything already on screen (and every visitor without JS) sees
 *    the page as-is, so content is never trapped behind a broken animation.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const margin = 80;
    const belowFold = (el: HTMLElement) => el.getBoundingClientRect().top > window.innerHeight - margin;

    const pending: HTMLElement[] = [];
    const hide = (el: HTMLElement, delay: number) => {
      if (!belowFold(el)) return;
      el.classList.add("sr");
      if (delay) el.style.setProperty("--sr-delay", `${delay}ms`);
      pending.push(el);
    };

    document.querySelectorAll<HTMLElement>("[data-sr]").forEach((el) => hide(el, 0));
    document.querySelectorAll<HTMLElement>("[data-sr-group]").forEach((group) => {
      ([...group.children] as HTMLElement[]).forEach((child, i) => hide(child, i * 70));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: `0px 0px -${margin}px 0px` },
    );
    pending.forEach((el) => observer.observe(el));

    // Safety net: if anything is still hidden after a few seconds (e.g. the tab
    // was backgrounded and the observer never fired), just show it.
    const failsafe = window.setTimeout(() => pending.forEach((el) => el.classList.add("sr-in")), 4000);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  return null;
}
