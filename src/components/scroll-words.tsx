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

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 cuando el bloque asoma por abajo, 1 cuando su final llega al 45% de la pantalla.
      const progress = Math.min(1, Math.max(0, (vh * 0.9 - rect.top) / (rect.height + vh * 0.45)));
      const lit = Math.round(progress * nodes.length);
      nodes.forEach((node, i) => node.classList.toggle("on", i < lit));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
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
