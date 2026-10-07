import { useEffect, useRef, useState } from "react";

import { Bauhaus, palettes, type Palette } from "@/components/bauhaus";

export type DeckStep = { title: string; copy: string; tone: string; art: string; palette: keyof typeof palettes };

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const HEADER = 72; // alto del header fijo (4.5rem)

/**
 * Mazo de cartas guiado por el scroll: la sección es alta y su contenido queda pegado (sticky).
 * Cada carta nueva sube desde el fondo, llegando "de adelante hacia atrás" (grande y cerca → a
 * tamaño normal), y las anteriores se van hundiendo en el mazo. Se ve una sola carta a la vez.
 */
export function MethodDeck({ steps }: { steps: DeckStep[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [still, setStill] = useState(false);
  const count = steps.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const pane = paneRef.current;
      if (!section || !pane) return;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - pane.offsetHeight);
      // 0..count-1, con una pausa final para que la última carta se pueda leer.
      const p = clamp(((HEADER - rect.top) / scrollable) / 0.88) * (count - 1);
      const travel = pane.offsetHeight * 1.6;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const enter = i === 0 ? 1 : easeOut(clamp(p - (i - 1)));
        const depth = clamp(p - i, 0, count);
        const y = (1 - enter) * travel - depth * 16;
        const z = (1 - enter) * 260 - depth * 70;
        const tilt = (1 - enter) * 16;
        const scale = 1 - depth * 0.035;
        card.style.transform = `translate3d(0, ${y}px, ${z}px) rotateX(${tilt}deg) scale(${scale})`;
        card.style.filter = depth > 0 ? `brightness(${1 - Math.min(depth, 3) * 0.14})` : "";
        card.style.visibility = enter === 0 && i > 0 ? "hidden" : "visible";
      });
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
  }, [count]);

  const heading = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="display text-[clamp(2rem,5vw,4.6rem)]">
        Un método claro, <span className="text-impact">sin sorpresas.</span>
      </h2>
      <p className="mono-label max-w-xs text-ink/70">Cuatro pasos, entregas cortas y decisiones compartidas.</p>
    </div>
  );

  const cardBody = (step: DeckStep, index: number) => (
    <div className={`relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden p-6 shadow-[0_-18px_40px_-18px_rgb(0_0_0/0.45)] sm:p-10 ${step.tone}`}>
      <Bauhaus
        kind={step.art as never}
        palette={palettes[step.palette] as Palette}
        className="pointer-events-none absolute -bottom-6 -right-6 h-[88%] w-auto max-w-[62%] opacity-90 sm:right-4 sm:h-[104%] sm:max-w-[34%]"
      />
      <span className="relative z-10 display text-5xl sm:text-7xl">0{index + 1}</span>
      <div className="relative z-10">
        <h3 className="display text-4xl sm:text-7xl">{step.title}</h3>
        <p className="mono-label mt-4 max-w-md text-[0.78rem] opacity-90">{step.copy}</p>
      </div>
    </div>
  );

  if (still) {
    return (
      <div className="mx-auto max-w-[96rem] space-y-6 px-4 py-16 sm:px-8">
        {heading}
        <ol className="mx-auto max-w-4xl space-y-6">
          {steps.map((step, i) => (
            <li key={step.title}>{cardBody(step, i)}</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${100 + (count - 1) * 80 + 20}svh` }} aria-label="Método de trabajo">
      <div ref={paneRef} className="sticky overflow-hidden" style={{ top: HEADER, height: `calc(100svh - ${HEADER}px)` }}>
        <div className="mx-auto flex h-full max-w-[96rem] flex-col gap-6 px-4 pb-6 pt-8 sm:px-8 sm:pt-10">
          {heading}
          <ol className="relative mx-auto min-h-0 w-full max-w-5xl flex-1" style={{ perspective: "1400px" }}>
            {steps.map((step, i) => (
              <li
                key={step.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute inset-0 will-change-transform"
                style={{ zIndex: i, transformOrigin: "50% 100%" }}
              >
                {cardBody(step, i)}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
