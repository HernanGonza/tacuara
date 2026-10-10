import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type FormEvent } from "react";

import markUrl from "@/assets/tacuara-mark-bn-96.webp";
import photoUrl from "@/assets/bambu-bn.webp";
import { Bauhaus, palettes, ShapeStrip } from "@/components/bauhaus";
import { Geo } from "@/components/geo";
import { BackToTop } from "@/components/back-to-top";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MethodDeck } from "@/components/method-deck";
import { ServiceArt } from "@/components/service-art";
import { sendContact } from "@/lib/contact";
import { ScrollWords } from "@/components/scroll-words";
import { openCookiePreferences } from "@/components/cookie-consent";

/** X (Twitter) glyph — lucide only ships the legacy bird. */
function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socials: { label: string; href: string; Icon: ComponentType<{ size?: number }> }[] = [
  // TODO: reemplazar con las URLs reales de Tacuara.
  { label: "Instagram", href: "https://instagram.com/", Icon: Instagram },
  { label: "Facebook", href: "https://facebook.com/", Icon: Facebook },
  { label: "LinkedIn", href: "https://linkedin.com/", Icon: Linkedin },
  { label: "X", href: "https://x.com/", Icon: XIcon },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tacuara | Tecnología, datos y formación" },
      {
        name: "description",
        content:
          "Consultora misionera dedicada a la transformación digital, en Posadas, Misiones. Diseño, software a medida, datos, procesos y capacitación con un mismo equipo.",
      },
      { property: "og:title", content: "Tacuara | Un equipo para sostener tu proyecto" },
      {
        property: "og:description",
        content:
          "Diseño, software, datos, procesos y formación pensados en conjunto para organizaciones que necesitan avanzar con coherencia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.tacuara.com.ar/" }],
  }),
  component: Index,
});

const navLinks = [
  ["#servicios", "Servicios"],
  ["#proceso", "Método"],
  ["#contacto", "Contacto"],
];

const services = [
  {
    title: "Diseño e identidad",
    copy: "Identidad visual y piezas que hacen reconocible a tu organización, con plantillas que tu equipo usa solo.",
    tags: ["Identidad visual", "Piezas gráficas", "Plantillas propias"],
  },
  {
    title: "Software y sitios",
    copy: "Sitios y aplicaciones a medida que encajan con tu forma de trabajar. Sin plantillas forzadas.",
    tags: ["Sitios web", "Aplicaciones a medida", "Sin plantillas forzadas"],
  },
  {
    title: "Datos y bases de datos",
    copy: "Relevamos, ordenamos y visualizamos tu información para decidir con evidencia, no con intuición.",
    tags: ["Relevamientos", "Tableros", "Bases bien diseñadas"],
  },
  {
    title: "Rediseño de procesos",
    copy: "Menos pasos manuales, roles claros y herramientas que acompañan en lugar de estorbar.",
    tags: ["Menos pasos manuales", "Roles claros", "Herramientas que acompañan"],
  },
  {
    title: "Capacitación",
    copy: "Academia Digital forma a tu equipo para que gane autonomía y criterio propio.",
    tags: ["Academia Digital", "Autonomía", "Criterio propio"],
  },
];

const steps = [
  { title: "Escuchar", copy: "Entendemos tu proyecto y tu equipo antes de proponer nada.", tone: "bg-accent text-ink", art: "listen", palette: "onLime" },
  { title: "Diagnóstico", copy: "Vemos qué funciona, qué no y por dónde empezar.", tone: "bg-ink text-white", art: "diagnose", palette: "onInk" },
  { title: "Construcción", copy: "Entregas cortas, con seguimiento y decisiones compartidas.", tone: "bg-primary text-white", art: "build", palette: "onDeep" },
  { title: "Acompañamiento", copy: "Dejamos documentación, formación y soporte para seguir sin nosotros.", tone: "bg-warm text-ink border border-dashed border-ink/50", art: "accompany", palette: "onPaper" },
];

const values = ["Cercanía real", "Una mirada compartida", "Flexibilidad con estructura", "Raíz en el territorio"];

/**
 * Tiras irregulares del hero (l = izquierda, w = ancho, t = arriba, h = alto, todo en %).
 * tl/tr/bl/br = cuánto se inclinan las esquinas (% del ancho de la tira); step = muesca en el borde superior.
 */
const strips = [
  { l: 0, w: 8.5, t: 10, h: 84, tl: 24, tr: 0, bl: 0, br: 24 },
  { l: 9.6, w: 11, t: 0, h: 92, tl: 0, tr: 18, bl: 20, br: 0, step: [55, 6] },
  { l: 21.8, w: 7, t: 14, h: 80, tl: 34, tr: 0, bl: 0, br: 34 },
  { l: 29.8, w: 12, t: 4, h: 96, tl: 0, tr: 14, bl: 12, br: 0 },
  { l: 43, w: 8, t: 18, h: 76, tl: 28, tr: 0, bl: 0, br: 22, step: [40, 8] },
  { l: 52, w: 13, t: 0, h: 88, tl: 0, tr: 12, bl: 22, br: 0 },
  { l: 66.2, w: 7.5, t: 8, h: 90, tl: 26, tr: 0, bl: 0, br: 30 },
  { l: 74.7, w: 10, t: 20, h: 78, tl: 0, tr: 18, bl: 16, br: 0, step: [60, 7] },
  { l: 86, w: 6.5, t: 2, h: 92, tl: 30, tr: 0, bl: 0, br: 28 },
  { l: 93.5, w: 6.5, t: 12, h: 84, tl: 0, tr: 22, bl: 22, br: 0 },
] as { l: number; w: number; t: number; h: number; tl: number; tr: number; bl: number; br: number; step?: number[] }[];

function stripClip({ tl, tr, bl, br, step }: (typeof strips)[number]) {
  const top = step
    ? `${tl}% 0, ${step[0]}% 0, ${step[0]}% ${step[1]}%, ${100 - tr}% ${step[1]}%`
    : `${tl}% 0, ${100 - tr}% 0`;
  return `polygon(${top}, ${100 - br}% 100%, ${bl}% 100%)`;
}

function ServiceCard({ service, index, live = false, showTitle = true }: { service: (typeof services)[number]; index: number; live?: boolean; showTitle?: boolean }) {
  return (
    <article
      className="flex flex-col border border-dashed border-ink/55 bg-white shadow-[10px_10px_0_0_var(--color-accent)]"
      {...(live ? { "aria-live": "polite" as const } : {})}
    >
      <div className="flex items-center justify-between px-5 pt-4 sm:px-6">
        <span className="mono-label text-ink/70">0{index + 1} / 05</span>
        <span className="mono-label text-impact">{service.title}</span>
      </div>
      <div className="dots mx-5 mt-3 border border-dashed border-ink/40 bg-warm sm:mx-6">
        <div className="aspect-[400/220]" key={index}>
          <ServiceArt index={index} />
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {showTitle && <p className="display text-3xl sm:text-4xl">{service.title}</p>}
        <p className={`${showTitle ? "mt-3" : ""} text-base leading-snug sm:text-lg`}>{service.copy}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-ink/60 px-3 py-1 text-sm">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const bandRef = useRef<HTMLDivElement>(null);

  // Servicios en escritorio: la sección queda pegada y el scroll va abriendo un servicio tras otro.
  // El hover/click sigue funcionando: salta al servicio elegido hasta el próximo cambio por scroll.
  const [pinned, setPinned] = useState(false);
  const pinRef = useRef<HTMLElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const scrollIdx = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const apply = () => setPinned(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = pinRef.current;
      const pane = paneRef.current;
      if (!section || !pane) return;
      const scrollable = Math.max(1, section.offsetHeight - pane.offsetHeight);
      const p = Math.min(1, Math.max(0, (72 - section.getBoundingClientRect().top) / scrollable));
      const idx = Math.min(services.length - 1, Math.floor(p * services.length));
      if (idx !== scrollIdx.current) {
        scrollIdx.current = idx;
        setActive(idx);
      }
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
  }, [pinned]);

  // Celular: cada tarjeta va debajo de su palabra y se abre cuando esa palabra pasa la mitad de la pantalla.
  // Las que ya se abrieron quedan abiertas, así lo que ya se ve arriba no se mueve al seguir bajando.
  const [openUpTo, setOpenUpTo] = useState(-1);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpenUpTo(services.length - 1);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.5;
      let idx = -1;
      itemRefs.current.forEach((li, i) => {
        if (li && li.offsetParent !== null && li.getBoundingClientRect().top <= line) idx = i;
      });
      setOpenUpTo(idx);
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

  // Scroll: --sy para las formas de fondo.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      document.documentElement.style.setProperty("--sy", String(Math.round(window.scrollY)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Parallax de la foto con el mouse: se desplaza hacia el lado contrario, con inercia suave.
  useEffect(() => {
    const band = bandRef.current;
    if (!band || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let frame = 0;
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.08;
      pos.y += (target.y - pos.y) * 0.08;
      band.style.setProperty("--px", `${(-pos.x * 56).toFixed(1)}px`);
      band.style.setProperty("--py", `${(-pos.y * 40).toFixed(1)}px`);
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = band.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.y = (event.clientY / window.innerHeight - 0.5) * 2;
      kick();
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setContactStatus("sending");
    try {
      await sendContact({
        data: {
          nombre: String(data.get("nombre") ?? ""),
          email: String(data.get("email") ?? ""),
          mensaje: String(data.get("mensaje") ?? ""),
          web: String(data.get("web") ?? ""),
        },
      });
      form.reset();
      setContactStatus("sent");
    } catch {
      setContactStatus("error");
    }
  }

  const current = services[active] ?? services[0]!;

  return (
    <main className="overflow-x-clip bg-background text-ink">
      <ScrollReveal />
      <BackToTop />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-dashed border-ink/55 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[96rem] items-center justify-between px-4 sm:px-8">
          <a href="#inicio" aria-label="Tacuara, inicio" className="flex items-center gap-2.5">
            <img src={markUrl} alt="" className="h-9 w-9 object-contain" />
            <span className="text-2xl font-extrabold lowercase tracking-tight">tacuara</span>
          </a>
          <nav aria-label="Navegación principal" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 text-[0.95rem] lg:flex">
            {navLinks.slice(0, 2).map(([href, label]) => (
              <a key={href} className="nav-link !text-ink !font-medium" href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <a href="mailto:hola@tacuara.com.ar" className="btn-dashed">
              Escribinos
            </a>
            <a href="#contacto" className="btn-solid">
              Conversemos
            </a>
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center lg:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-dashed border-ink/55 bg-background px-4 py-6 lg:hidden" aria-label="Navegación móvil">
            <div className="flex flex-col gap-5 text-2xl font-extrabold uppercase tracking-tight">
              {navLinks.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="section-anchor dots relative">
        <Geo variant="hero" />
        <div className="frame frame-corners dashed-b relative mx-auto max-w-[96rem] px-4 pb-8 pt-10 sm:px-8 sm:pt-14">
          <p className="mono-label mb-5 text-ink/70">Transformación digital · Misiones, Argentina</p>
          <h1 className="display text-[clamp(2.6rem,9.8vw,10.5rem)]" data-sr="up">
            Un solo equipo.
            <br />
            Tu proyecto,
            <br />
            <span className="text-impact">bien sostenido.</span>
          </h1>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-lg text-lg leading-snug sm:text-xl">
              Diseño, software, datos, procesos y formación, pensados por un mismo equipo. Sin coordinar cinco
              proveedores distintos.
            </p>
            <a href="#contacto" className="btn-solid h-14 w-full sm:w-fit">
              Conversemos tu proyecto <ArrowDownRight size={18} />
            </a>
          </div>
        </div>

        <div className="relative mx-auto max-w-[96rem] px-4 py-8 sm:px-8">
          <div
            ref={bandRef}
            className="slice-band"
            style={{ ["--photo" as string]: `url(${photoUrl})` } as CSSProperties}
            data-sr-group
            aria-hidden="true"
          >
            {strips.map((strip, i) => (
              <div
                key={i}
                className="strip"
                style={
                  {
                    ["--l" as string]: strip.l,
                    ["--w" as string]: strip.w,
                    ["--t" as string]: strip.t,
                    ["--h" as string]: strip.h,
                    clipPath: stripClip(strip),
                  } as CSSProperties
                }
              >
                <div className="strip-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="dashed-t border-b border-dashed border-ink/55">
        <div className="marquee mx-auto flex max-w-[96rem] items-center overflow-hidden">
          <p className="relative z-10 shrink-0 bg-background px-4 py-6 text-lg font-extrabold uppercase leading-none tracking-tight sm:px-8 sm:text-2xl">
            Lo que
            <br />
            nos define
          </p>
          <div className="min-w-0 flex-1 overflow-hidden">
            <span className="sr-only">{values.join(", ")}</span>
            <div className="marquee-track" aria-hidden="true">
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center">
                  {values.map((value, vi) => (
                    <li key={value} className="mono-label flex items-center whitespace-nowrap text-sm">
                      <span className="px-10">{value}</span>
                      <span className="text-impact">{["■", "●", "▲", "◆"][vi % 4]}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS: título */}
      <section id="servicios" className="section-anchor relative overflow-clip bg-impact text-white">
        <Geo variant="green" />
        <div className="relative mx-auto max-w-[96rem] px-4 py-16 sm:px-8 lg:py-24" data-sr="up">
          <p className="mono-label mb-6 text-white/80">Servicios · 05 frentes</p>
          <h2 className="display max-w-4xl text-[clamp(2.4rem,7vw,6.5rem)]">Cómo Tacuara sostiene tu proyecto.</h2>
        </div>
      </section>

      {/* SERVICIOS: lista + detalle */}
      <section
        ref={pinRef}
        className="dots relative border-b border-dashed border-ink/55 bg-background"
        style={pinned ? { height: `${100 + (services.length - 1) * 60}svh` } : undefined}
      >
        {/* Celular: cada tarjeta debajo de su palabra, abierta por el scroll */}
        <ul className="mx-auto max-w-[96rem] px-4 py-14 sm:px-8 lg:hidden">
          {services.map((service, index) => {
            const open = index <= openUpTo;
            return (
              <li
                key={service.title}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    className="svc-line display flex w-full cursor-pointer items-start gap-3 text-left text-[clamp(1.9rem,8.5vw,3.4rem)]"
                    aria-expanded={open}
                    aria-current={index === openUpTo}
                    onClick={() => setOpenUpTo(index)}
                  >
                    <span className="mono-label shrink-0 text-[0.7rem] tracking-normal">0{index + 1}</span>
                    <span>{service.title}</span>
                  </button>
                </h3>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  aria-hidden={!open}
                >
                  <div className="overflow-hidden">
                    <div className="pb-8 pl-1 pr-3 pt-3">
                      {open && <ServiceCard service={service} index={index} showTitle={false} />}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Escritorio: lista a la izquierda y detalle a la derecha (con la sección pegada) */}
        <div ref={paneRef} className={`hidden lg:block ${pinned ? "sticky top-[72px] h-[calc(100svh-72px)]" : ""}`}>
          <div
            className={`mx-auto grid w-full max-w-[96rem] gap-10 px-4 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:py-16 ${pinned ? "h-full" : "lg:min-h-[calc(100svh-4.5rem)]"}`}
          >
            <ul className="space-y-1" data-sr-group>
              {services.map(({ title }, index) => (
                <li key={title}>
                  <button
                    type="button"
                    className="svc-line display flex w-full cursor-pointer items-start gap-3 text-left text-[clamp(1.9rem,4.6vw,4.4rem)]"
                    aria-current={index === active}
                    onMouseEnter={() => setActive(index)}
                    onMouseLeave={() => {
                      if (pinned) setActive(scrollIdx.current);
                    }}
                    onFocus={() => setActive(index)}
                    onBlur={() => {
                      if (pinned) setActive(scrollIdx.current);
                    }}
                    onClick={() => setActive(index)}
                  >
                    <span className="mono-label shrink-0 text-[0.7rem] tracking-normal">0{index + 1}</span>
                    <span>{title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <ServiceCard service={current} index={active} live />
          </div>
        </div>
      </section>

      {/* DECLARACIÓN */}
      <section className="relative bg-warm">
        <Geo variant="light" />
        <div data-pin>
          <div className="sticky top-[72px] flex min-h-[calc(100svh-72px)] items-center">
            <div className="frame relative mx-auto w-full max-w-[96rem] px-4 py-12 sm:px-8">
              <div className="grid items-center gap-10 lg:grid-cols-[1.7fr_1fr]">
                <ScrollWords
                  className="display text-[clamp(2.2rem,5.6vw,5.6rem)]"
                  text="Tacuara no cambia cómo trabajás. Construimos sobre lo que ya tenés, con un solo equipo detrás."
                />
                <Bauhaus kind="statement" palette={palettes.onPaper} className="mx-auto hidden w-full max-w-sm lg:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MÉTODO */}
      <div id="proceso" className="section-anchor dashed-t relative bg-muted/60">
        <Geo variant="soft" />
        <MethodDeck steps={steps} />
      </div>

      {/* CONTACTO */}
      <section id="contacto" className="section-anchor relative overflow-clip bg-ink text-white">
        <Geo variant="dark" />
        <div className="relative mx-auto grid max-w-[96rem] gap-14 px-4 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-28">
          <div data-sr="left">
            <p className="mono-label mb-6 text-white/60">Hablemos</p>
            <h2 className="display text-[clamp(2.6rem,7.4vw,7rem)]">
              Empecemos por una <span className="text-accent">conversación.</span>
            </h2>
            <p className="mt-8 max-w-md text-lg leading-snug text-white/75">
              Contanos qué necesita tu organización. Te respondemos nosotros, sin intermediarios.
            </p>
            <div className="mono-label mt-10 space-y-3 text-sm text-white">
              <a href="mailto:hola@tacuara.com.ar" className="flex items-center gap-3 hover:text-accent">
                <Mail size={18} /> hola@tacuara.com.ar
              </a>
              <p className="flex items-center gap-3">
                <MapPin size={18} /> Misiones, Argentina
              </p>
            </div>
          </div>
          <form onSubmit={submitContact} className="grid content-start gap-6" data-sr="right">
            {[
              { name: "nombre", label: "Nombre", type: "text", auto: "name", ph: "Tu nombre" },
              { name: "email", label: "Email", type: "email", auto: "email", ph: "vos@organizacion.com" },
            ].map((f) => (
              <label key={f.name} className="mono-label grid gap-2 text-white/70">
                {f.label}
                <input
                  required
                  name={f.name}
                  type={f.type}
                  autoComplete={f.auto}
                  placeholder={f.ph}
                  className="border border-dashed border-white/40 bg-transparent px-4 py-3.5 font-sans text-base normal-case tracking-normal text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                />
              </label>
            ))}
            <label className="mono-label grid gap-2 text-white/70">
              Mensaje
              <textarea
                required
                name="mensaje"
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                className="resize-none border border-dashed border-white/40 bg-transparent px-4 py-3.5 font-sans text-base normal-case tracking-normal text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
              />
            </label>
            <input name="web" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <button type="submit" disabled={contactStatus === "sending"} className="btn-solid h-14 w-full text-base disabled:opacity-60 sm:ml-auto sm:w-fit">
              {contactStatus === "sending" ? "Enviando…" : "Enviar consulta"} <ArrowRight size={18} />
            </button>
            <p role="status" aria-live="polite" className="mono-label min-h-[1.25rem] text-white/80 sm:text-right">
              {contactStatus === "sent" && "¡Listo! Recibimos tu consulta y te respondemos pronto."}
              {contactStatus === "error" && "No pudimos enviarla. Probá de nuevo o escribinos a hola@tacuara.com.ar."}
            </p>
          </form>
        </div>
      </section>

      <div className="border-t border-dashed border-ink/55">
        <ShapeStrip />
      </div>

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-[oklch(0.16_0.015_130)] text-white/70">
        <div className="relative z-10 mx-auto flex max-w-[96rem] flex-col gap-6 border-t border-dashed border-white/25 px-4 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-sm bg-warm">
              <img src={markUrl} alt="" className="h-7 w-7 object-contain" />
            </span>
            <p className="text-2xl font-extrabold lowercase text-white">tacuara</p>
          </div>
          <div className="flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid size-10 place-items-center border border-dashed border-white/40 text-white transition-colors hover:border-accent hover:bg-accent hover:text-ink"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        <div className="relative z-10 mx-auto flex max-w-[96rem] flex-col gap-2 px-4 pb-6 text-xs sm:flex-row sm:justify-between sm:px-8 mono-label">
          <p>© {new Date().getFullYear()} Tacuara. Todos los derechos reservados.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <a href="/privacidad" className="underline-offset-4 hover:text-accent hover:underline">
              Privacidad
            </a>
            <a href="/terminos" className="underline-offset-4 hover:text-accent hover:underline">
              Términos
            </a>
            <button type="button" onClick={openCookiePreferences} className="underline-offset-4 hover:text-accent hover:underline">
              Cookies
            </button>
            <span>Hecho en Misiones 🧉</span>
          </p>
        </div>
        <p className="display pointer-events-none -mb-[3vw] select-none text-center text-[24vw] leading-[0.8] text-white/[0.06]" aria-hidden="true">
          tacuara
        </p>
      </footer>
    </main>
  );
}
