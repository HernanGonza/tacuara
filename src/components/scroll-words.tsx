import { useEffect, useRef } from "react";

/**
 * Texto enorme que se "enciende" palabra por palabra a medida que se scrollea.
 * Sin JS (o con "reducir movimiento") todo el texto se ve en el color final.
 */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = [...el.querySelectorAll<HTMLElement>(".word")];
    el.classList.add("words-armed");

    // Si hay un contenedor [data-pin] (alto) con un hijo sticky, la página queda clavada ahí
    // mientras el scroll solo "pinta" las palabras; al terminar, la página sigue bajando.
    const pin = el.closest<HTMLElement>("[data-pin]");
    const pane = pin?.firstElementChild as HTMLElement | null;
    const HEADER = 72;

    let frame = 0;
    const sizePin = () => {
      if (pin && pane) pin.style.height = `${pane.offsetHeight + window.innerHeight * 1.2}px`;
    };
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      let progress: number;
      if (pin && pane) {
        const scrollable = Math.max(1, pin.offsetHeight - pane.offsetHeight);
        progress = Math.min(1, Math.max(0, (HEADER - pin.getBoundingClientRect().top) / scrollable / 0.9));
      } else {
        const rect = el.getBoundingClientRect();
        // 0 cuando el bloque asoma por abajo, 1 cuando su final llega al 45% de la pantalla.
        progress = Math.min(1, Math.max(0, (vh * 0.9 - rect.top) / (rect.height + vh * 0.45)));
      }
      const lit = Math.round(progress * nodes.length);
      nodes.forEach((node, i) => node.classList.toggle("on", i < lit));
    };
    const onResize = () => {
      sizePin();
      onScroll();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    sizePin();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      if (pin) pin.style.height = "";
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="word">
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
