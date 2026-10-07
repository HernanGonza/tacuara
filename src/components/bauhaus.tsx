import type { ReactNode } from "react";

export type Palette = { a: string; b: string; c: string; line: string };

export const ink = "var(--color-ink)";
export const deep = "var(--color-impact)";
export const lime = "var(--color-accent)";
export const mist = "oklch(0.88 0.06 128)";
export const paper = "oklch(0.97 0.02 125)";

/** Paletas listas según el fondo donde se apoye la composición. */
export const palettes = {
  onLime: { a: ink, b: paper, c: deep, line: ink },
  onInk: { a: lime, b: paper, c: mist, line: paper },
  onDeep: { a: lime, b: paper, c: ink, line: paper },
  onPaper: { a: deep, b: lime, c: ink, line: ink },
} satisfies Record<string, Palette>;

const compositions: Record<string, (p: Palette) => ReactNode> = {
  // Escuchar: ondas que salen de un semicírculo
  listen: ({ a, b, c }) => (
    <>
      <path d="M0 120a80 80 0 0 1 0 160z" fill={a} />
      {[130, 190, 250].map((r, i) => (
        <path key={r} d={`M0 ${200 - r}a${r} ${r} 0 0 1 0 ${2 * r}`} fill="none" stroke={[b, c, a][i]} strokeWidth="26" />
      ))}
      <circle cx="320" cy="90" r="34" fill={c} />
      <rect x="290" y="290" width="70" height="70" fill={b} />
      <path d="M330 290l30 0-30 30z" fill={a} />
    </>
  ),
  // Diagnóstico: lupa con una trama adentro
  diagnose: ({ a, b, c }) => (
    <>
      <circle cx="170" cy="170" r="105" fill="none" stroke={a} strokeWidth="26" />
      <path d="M248 248L350 350" stroke={a} strokeWidth="34" />
      <rect x="110" y="110" width="50" height="50" fill={b} />
      <circle cx="205" cy="135" r="25" fill={c} />
      <path d="M110 230h50l-25-45z" fill={c} />
      <rect x="180" y="190" width="52" height="52" fill="none" stroke={b} strokeWidth="6" />
      <rect x="40" y="320" width="110" height="18" fill={b} />
      <rect x="40" y="350" width="70" height="18" fill={c} />
    </>
  ),
  // Construcción: pirámide de bloques
  build: ({ a, b, c }) => (
    <>
      <rect x="40" y="290" width="100" height="100" fill={a} />
      <circle cx="200" cy="340" r="50" fill={b} />
      <rect x="260" y="290" width="100" height="100" fill={c} />
      <rect x="90" y="190" width="100" height="100" fill={c} />
      <path d="M210 290v-100a100 100 0 0 1 100 100z" fill={a} />
      <path d="M150 190l50-100 50 100z" fill={b} />
      <circle cx="200" cy="60" r="16" fill={a} />
    </>
  ),
  // Acompañamiento: dos círculos que se encuentran y un puente
  accompany: ({ a, b, c, line }) => (
    <>
      <defs>
        <clipPath id="lens">
          <circle cx="150" cy="170" r="100" />
        </clipPath>
      </defs>
      <circle cx="150" cy="170" r="100" fill={a} />
      <circle cx="260" cy="170" r="100" fill={b} />
      <circle cx="260" cy="170" r="100" fill={c} clipPath="url(#lens)" />
      <path d="M30 330a190 100 0 0 1 340 0" fill="none" stroke={line} strokeWidth="10" />
      <rect x="22" y="326" width="16" height="50" fill={line} />
      <rect x="362" y="326" width="16" height="50" fill={line} />
      <circle cx="200" cy="262" r="12" fill={a} />
    </>
  ),
  // Frase central: composición libre
  statement: ({ a, b, c, line }) => (
    <>
      <path d="M40 220a160 160 0 0 1 320 0z" fill={a} />
      <circle cx="270" cy="120" r="56" fill={b} />
      <path d="M60 220h200l-100 150z" fill={c} />
      <rect x="260" y="250" width="100" height="100" fill="none" stroke={line} strokeWidth="6" />
      <circle cx="310" cy="300" r="22" fill={line} />
      <path d="M40 390h320" stroke={line} strokeWidth="6" strokeDasharray="2 12" strokeLinecap="round" />
    </>
  ),
};

export function Bauhaus({ kind, palette, className }: { kind: keyof typeof compositions; palette: Palette; className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" role="presentation">
      {compositions[kind]?.(palette)}
    </svg>
  );
}

/** Tiles de la franja decorativa (antes del pie). */
const tiles: { bg: string; shape: ReactNode }[] = [
  { bg: ink, shape: <circle cx="50" cy="50" r="34" fill={lime} /> },
  { bg: lime, shape: <path d="M10 90a40 40 0 0 1 80 0z M10 10h40v40z" fill={ink} /> },
  { bg: mist, shape: <path d="M50 12l40 76H10z" fill={deep} /> },
  { bg: deep, shape: <><rect x="14" y="14" width="72" height="72" fill="none" stroke={paper} strokeWidth="8" /><circle cx="50" cy="50" r="14" fill={lime} /></> },
  { bg: paper, shape: <><path d="M0 100V0a100 100 0 0 1 100 100z" fill={deep} /><circle cx="68" cy="68" r="12" fill={paper} /></> },
  { bg: ink, shape: <>{[0, 1, 2, 3].map((i) => <rect key={i} x={14 + i * 20} y="14" width="12" height="72" fill={i % 2 ? paper : lime} />)}</> },
  { bg: lime, shape: <><circle cx="50" cy="50" r="38" fill={paper} /><path d="M12 50a38 38 0 0 1 76 0z" fill={ink} /></> },
  { bg: deep, shape: <path d="M50 8l42 42-42 42-42-42z" fill={mist} /> },
];

/** Tiles de 32px repetidas (desfasadas) hasta cubrir el ancho; lo que sobra se recorta. */
const strip = Array.from({ length: 64 }, (_, i) => tiles[(i * 3) % tiles.length]!);

export function ShapeStrip() {
  return (
    <div className="flex h-8 overflow-hidden" aria-hidden="true">
      {strip.map((tile, i) => (
        <svg key={i} viewBox="0 0 100 100" className="block size-8 shrink-0" style={{ background: tile.bg }}>
          {tile.shape}
        </svg>
      ))}
    </div>
  );
}
