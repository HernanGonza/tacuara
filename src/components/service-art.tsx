import type { CSSProperties, ReactNode } from "react";

const ink = "var(--color-ink)";
const deep = "var(--color-impact)";
const lime = "var(--color-accent)";
const mist = "oklch(0.88 0.06 128)";
const paper = "oklch(0.97 0.02 125)";

const d = (n: number): CSSProperties => ({ ["--d" as string]: `${n}s` }) as CSSProperties;

/**
 * Composiciones Bauhaus (una por servicio): círculo, cuadrado, triángulo y sus cortes,
 * colores planos, trazos gruesos y sin textos. Se animan al cambiar de servicio.
 */
const arts: ReactNode[] = [
  // 0 · Diseño e identidad: la tríada círculo · cuadrado · triángulo
  <g key="design">
    <rect className="art-pop" style={d(0.05)} x="20" y="20" width="180" height="180" fill={lime} />
    <circle className="art-pop" style={d(0.15)} cx="110" cy="110" r="70" fill={ink} />
    <path className="art-pop" style={d(0.25)} d="M200 200V20a180 180 0 0 1 180 180z" fill={deep} />
    <path className="art-pop" style={d(0.35)} d="M290 200l45-90 45 90z" fill={paper} />
    <rect className="art-pop" style={d(0.45)} x="20" y="150" width="90" height="50" fill={paper} />
    <circle className="art-pop" style={d(0.55)} cx="65" cy="175" r="18" fill={deep} />
    <path d="M200 20V200" stroke={ink} strokeWidth="6" />
  </g>,

  // 1 · Software y sitios: la pantalla como cuadrícula de formas
  <g key="software">
    <rect className="art-pop" style={d(0.05)} x="30" y="24" width="340" height="172" fill={ink} />
    <rect className="art-rise" style={d(0.15)} x="30" y="24" width="340" height="34" fill={deep} />
    {[0, 1, 2].map((i) => (
      <circle key={i} className="art-pop" style={d(0.3 + i * 0.06)} cx={52 + i * 24} cy="41" r="7" fill={[lime, paper, mist][i]} />
    ))}
    <rect className="art-rise" style={d(0.3)} x="50" y="78" width="110" height="98" fill={lime} />
    <circle className="art-pop" style={d(0.5)} cx="105" cy="127" r="32" fill={paper} />
    <rect className="art-draw-x" style={d(0.45)} x="182" y="78" width="168" height="16" fill={paper} />
    <rect className="art-draw-x" style={d(0.55)} x="182" y="106" width="124" height="16" fill={mist} />
    <rect className="art-pop" style={d(0.7)} x="182" y="142" width="86" height="34" fill={deep} />
    <path className="art-pop" style={d(0.85)} d="M300 140l40 22-17 6 10 20-10 5-10-20-13 11z" fill={lime} />
  </g>,

  // 2 · Datos: medio círculo, bloques ascendentes y un punto
  <g key="data">
    <path className="art-pop" style={d(0.05)} d="M30 200a90 90 0 0 1 180 0z" fill={deep} />
    <path className="art-pop" style={d(0.2)} d="M75 200a45 45 0 0 1 90 0z" fill={lime} />
    <path className="art-pop" style={d(0.3)} d="M120 110V20a90 90 0 0 1 90 90z" fill={ink} />
    {[60, 100, 80, 140, 180].map((h, i) => (
      <rect key={i} className="art-rise" style={d(0.25 + i * 0.1)} x={230 + i * 30} y={200 - h} width="30" height={h} fill={[ink, lime, mist, deep, ink][i]} />
    ))}
    <circle className="art-pop" style={d(0.95)} cx="335" cy="40" r="22" fill={lime} />
    <path d="M20 200H380" stroke={ink} strokeWidth="6" />
  </g>,

  // 3 · Procesos: de formas sueltas a una secuencia ordenada
  <g key="process">
    <path className="art-draw" style={d(0.1)} pathLength="1" d="M30 110H370" fill="none" stroke={ink} strokeWidth="8" strokeDasharray="1" />
    <circle className="art-pop" style={d(0.25)} cx="70" cy="110" r="42" fill={lime} />
    <path className="art-pop" style={d(0.45)} d="M170 58l50 104H120z" fill={deep} />
    <rect className="art-pop" style={d(0.65)} x="244" y="68" width="84" height="84" fill={ink} />
    <path className="art-pop" style={d(0.85)} d="M328 152V68a84 84 0 0 1 0 84z" fill={mist} />
    <circle className="art-pop" style={d(1)} cx="370" cy="110" r="14" fill={deep} />
  </g>,

  // 4 · Capacitación: escalera de cuartos de círculo hasta una bandera
  <g key="training">
    <path className="art-pop" style={d(0.05)} d="M20 200V140a60 60 0 0 1 60 60z" fill={mist} />
    <path className="art-pop" style={d(0.18)} d="M80 200v-90a90 90 0 0 1 90 90z" fill={lime} />
    <path className="art-pop" style={d(0.31)} d="M170 200V70a130 130 0 0 1 130 130z" fill={deep} />
    <rect className="art-rise" style={d(0.44)} x="300" y="40" width="80" height="160" fill={ink} />
    <path className="art-draw" style={d(0.6)} pathLength="1" d="M340 40V6" fill="none" stroke={ink} strokeWidth="6" strokeDasharray="1" />
    <path className="art-pop" style={d(0.9)} d="M340 6l36 14-36 14z" fill={lime} />
    <circle className="art-pop" style={d(0.75)} cx="340" cy="100" r="22" fill={paper} />
  </g>,
];

export function ServiceArt({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 400 220" className="block h-full w-full" role="img" aria-label="" aria-hidden="true">
      {arts[index]}
    </svg>
  );
}
