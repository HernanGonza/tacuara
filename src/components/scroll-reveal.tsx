import { useEffect } from "react";

/**
 * Animaciones de entrada con ScrollReveal (https://scrollrevealjs.org).
 *
 * Se marca el HTML con atributos y acá se configuran los efectos:
 *  - `data-sr="up"`     → el elemento aparece subiendo.
 *  - `data-sr-group`   → sus hijos directos aparecen en cascada.
 *  - `data-sr="left"`  → entra desde la izquierda (también "right", "fade", "scale").
 *
 * La librería toca `window`, así que se importa recién después de hidratar (SSR-safe).
 * Si el usuario prefiere menos movimiento, no se activa nada y el contenido queda visible.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;

    import("scrollreveal").then(({ default: ScrollRevealJS }) => {
      if (cancelled) return;
      const sr = ScrollRevealJS({
        distance: "40px",
        duration: 900,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: 0,
        viewFactor: 0.15,
        mobile: true,
        cleanup: true,
      });
      destroy = () => sr.destroy();

      sr.reveal("[data-sr='up']", { origin: "bottom" });
      sr.reveal("[data-sr='left']", { origin: "left", distance: "80px" });
      sr.reveal("[data-sr='right']", { origin: "right", distance: "80px" });
      sr.reveal("[data-sr='fade']", { distance: "0px" });
      sr.reveal("[data-sr='scale']", { distance: "0px", scale: 0.88 });
      document.querySelectorAll<HTMLElement>("[data-sr-group]").forEach((group) => {
        sr.reveal([...group.children], { origin: "bottom", interval: 110 });
      });
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return null;
}
