import type { CSSProperties } from "react";

type Shape = { cls: string; k?: number; r?: number; style?: CSSProperties };

/**
 * Formas geométricas decorativas de fondo (círculos, anillos, cuadrados, tiras).
 * Cada una se mueve a distinta velocidad con el scroll (variable --sy) para dar profundidad.
 */
const sets: Record<string, Shape[]> = {
  hero: [
    { cls: "right-[-12rem] top-[-8rem] size-[40rem] rounded-full border border-dashed border-accent/60", k: 0.06 },
    { cls: "right-[-4rem] top-[6rem] size-[22rem] rounded-full bg-accent/15", k: -0.05 },
    { cls: "left-[-9rem] bottom-[-6rem] size-[26rem] rounded-full border-[28px] border-accent/15", k: 0.08 },
    { cls: "right-[7%] top-[14%] h-24 w-48 rounded-b-full bg-primary", k: -0.09 },
    { cls: "right-[15%] top-[34%] size-16 rounded-full bg-accent", k: -0.13 },
    { cls: "right-[4%] top-[42%] size-24 bg-ink", k: 0.07, style: { clipPath: "polygon(50% 0, 100% 100%, 0 100%)" } },
    { cls: "right-[24%] top-[44%] size-40 border border-primary/40", k: -0.1, r: 18 },
    { cls: "left-[46%] top-[8%] size-4 bg-impact", k: -0.14, r: 12 },
    { cls: "left-[30%] bottom-[8%] h-40 w-3 bg-primary/20", k: 0.1, style: { ["--sk" as string]: "-7deg" } },
    { cls: "left-[34%] bottom-[2%] h-24 w-3 bg-accent/40", k: 0.14, style: { ["--sk" as string]: "-7deg" } },
  ],
  light: [
    { cls: "left-[-14rem] top-[10%] size-[34rem] rounded-full bg-accent/15", k: 0.05 },
    { cls: "right-[-6rem] bottom-[6%] size-[22rem] rounded-full border border-dashed border-primary/50", k: -0.06 },
    { cls: "right-[18%] top-[12%] size-24 border border-primary/40", k: 0.09, r: 20 },
    { cls: "left-[40%] bottom-[10%] size-5 bg-impact", k: -0.1, r: 15 },
  ],
  green: [
    { cls: "right-[-10rem] top-[-10rem] size-[34rem] rounded-full border border-white/25", k: 0.04 },
    { cls: "right-[-5rem] top-[-5rem] size-[24rem] rounded-full border border-white/25", k: 0.05 },
    { cls: "right-[0rem] top-[0rem] size-[14rem] rounded-full bg-white/10", k: 0.06 },
    { cls: "left-[48%] bottom-[-3rem] size-32 border border-white/30", k: -0.08, r: 22 },
  ],
  soft: [
    { cls: "right-[-8rem] top-[8%] size-[28rem] rounded-full bg-accent/10", k: 0.05 },
    { cls: "left-[-4rem] bottom-[10%] size-40 border border-primary/30", k: -0.07, r: 16 },
    { cls: "left-[12%] top-[6%] size-5 bg-accent", k: 0.1, r: 20 },
  ],
  dark: [
    { cls: "right-[-10rem] top-[-8rem] size-[36rem] rounded-full border border-dashed border-accent/40", k: 0.05 },
    { cls: "left-[-7rem] bottom-[-6rem] size-[24rem] rounded-full bg-accent/10", k: -0.05 },
    { cls: "right-[10%] bottom-[8%] size-28 border border-accent/40", k: 0.09, r: 18 },
    { cls: "left-[44%] top-[6%] h-20 w-40 rounded-t-full bg-accent", k: -0.07 },
    { cls: "left-[50%] bottom-[10%] size-20 bg-impact", k: 0.08, style: { clipPath: "polygon(50% 0, 100% 100%, 0 100%)" } },
    { cls: "left-[4%] top-[8%] size-6 rounded-full bg-accent", k: -0.12 },
  ],
};

export function Geo({ variant }: { variant: keyof typeof sets }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-clip" aria-hidden="true">
      {sets[variant]?.map((shape, i) => (
        <div
          key={i}
          className={`geo ${shape.cls}`}
          style={{ ["--k" as string]: shape.k ?? 0, ["--r" as string]: `${shape.r ?? 0}deg`, ...shape.style } as CSSProperties}
        />
      ))}
    </div>
  );
}
