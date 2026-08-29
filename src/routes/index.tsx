import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  Database,
  Facebook,
  GraduationCap,
  Instagram,
  LayoutGrid,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  PenTool,
  TerminalSquare,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";
import { useState, type ComponentType, type FormEvent } from "react";

import markUrl from "@/assets/tacuara-mark.png";
import { BackToTop } from "@/components/back-to-top";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";

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
      { title: "Tacuara | Comunicación, tecnología y formación" },
      {
        name: "description",
        content:
          "Consultora de Misiones en transformación digital: comunicación, diseño, software a medida, datos, rediseño de procesos y capacitación, con un mismo equipo.",
      },
      { property: "og:title", content: "Tacuara | Un equipo para sostener tu proyecto" },
      {
        property: "og:description",
        content:
          "Comunicación, diseño, software, datos, procesos y formación pensados en conjunto para organizaciones que necesitan avanzar con coherencia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const navLinks = [
  ["#servicios", "Servicios"],
  ["#proceso", "Cómo trabajamos"],
  ["#nosotros", "Por qué Tacuara"],
];

const services = [
  {
    number: "01",
    icon: Megaphone,
    title: "Comunicación y redes",
    copy: "Estrategia, mensajes y gestión de redes sociales que sostienen una voz pública coherente. Planificamos, producimos y medimos, no improvisamos posteos.",
  },
  {
    number: "02",
    icon: PenTool,
    title: "Diseño e identidad",
    copy: "Identidad visual, piezas y sistemas de diseño que hacen a tu organización reconocible. Del logo a la plantilla que tu equipo puede usar sin depender de nosotros.",
  },
  {
    number: "03",
    icon: TerminalSquare,
    title: "Software y sitios",
    copy: "Sitios web y aplicaciones a medida que encajan con tu forma de trabajar. Sin plantillas forzadas ni herramientas que terminan siendo un problema más.",
  },
  {
    number: "04",
    icon: Database,
    title: "Datos y bases de datos",
    copy: "Ordenamos, cruzamos y visualizamos tu información. Relevamientos, tableros y bases bien diseñadas para decidir con evidencia y no con intuición.",
  },
  {
    number: "05",
    icon: Workflow,
    title: "Rediseño de procesos",
    copy: "Miramos cómo trabaja tu equipo hoy y lo volvemos a dibujar: menos pasos manuales, roles claros y herramientas que acompañan en lugar de estorbar.",
  },
  {
    number: "06",
    icon: GraduationCap,
    title: "Capacitación",
    copy: "Academia Digital forma a los equipos en las herramientas que ya usan o van a usar, para que ganen autonomía y tomen decisiones con criterio propio.",
  },
];

const steps = [
  ["Escuchar", "Entendemos el proyecto, el equipo y el contexto antes de proponer nada."],
  ["Diagnóstico", "Ponemos sobre la mesa qué está funcionando, qué no y por dónde conviene empezar."],
  ["Construcción", "Trabajamos en entregas cortas, con seguimiento y decisiones compartidas."],
  ["Acompañamiento", "Dejamos capacidad instalada: documentación, formación y soporte para seguir sin nosotros."],
];

const reasons = [
  ["Cercanía real", "Hablás con quienes piensan y hacen tu proyecto. Sin capas de cuentas ni pases de mano."],
  ["Una mirada compartida", "Comunicación, tecnología y datos se deciden juntas desde el inicio, con un rumbo común."],
  ["Flexibilidad con estructura", "Nos adaptamos al contexto sin improvisar: procesos claros, seguimiento y compromiso."],
  ["Raíz en el territorio", "Trabajamos desde Misiones, entendiendo de cerca las dinámicas políticas, sociales y productivas."],
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("nombre") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("mensaje") ?? "");
    window.location.href = `mailto:hola@tacuara.coop?subject=${encodeURIComponent(`Consulta de ${name}`)}&body=${encodeURIComponent(`${message}\n\nContacto: ${email}`)}`;
  }

  return (
    <main className="overflow-hidden">
      <ScrollReveal />
      <BackToTop />
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="site-container grid h-24 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-foreground/10">
          <a href="#inicio" aria-label="Tacuara, inicio" className="flex items-center gap-2.5">
            <img src={markUrl} alt="" className="h-9 w-9 object-contain" />
            <span className="wordmark text-2xl font-extrabold lowercase tracking-tight">tacuara</span>
          </a>
          <nav aria-label="Navegación principal" className="hidden items-center gap-8 lg:flex">
            {navLinks.map(([href, label]) => (
              <a key={href} className="nav-link" href={href}>
                {label}
              </a>
            ))}
            <Button asChild variant="impact">
              <a href="#contacto">Conversemos</a>
            </Button>
          </nav>
          <button
            type="button"
            className="grid size-11 place-items-center text-primary lg:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-b border-border bg-background px-6 py-6 lg:hidden" aria-label="Navegación móvil">
            <div className="flex flex-col gap-5 font-bold text-primary">
              {[...navLinks, ["#contacto", "Conversemos"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <section
        id="inicio"
        className="section-anchor relative flex min-h-[760px] items-end bg-warm pb-16 pt-36 sm:pb-20 lg:min-h-[min(88vh,900px)] lg:pb-24"
      >
        <div className="bamboo-lines" aria-hidden="true" />
        <div className="site-container relative z-10">
          <div className="max-w-5xl" data-sr-group>
            <p className="eyebrow mb-6">Consultora en transformación digital · Misiones, Argentina</p>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.98] text-primary sm:text-6xl lg:text-8xl">
              Un solo equipo.
              <br />
              Tu proyecto, <span className="text-impact">bien sostenido.</span>
            </h1>
            <div className="mt-9 grid gap-8 border-t border-primary/25 pt-7 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-2xl text-lg leading-relaxed text-secondary-foreground sm:text-xl">
                Acompañamos la transformación digital de tu organización: comunicación, diseño, software, datos,
                procesos y formación, pensados por un mismo equipo. Para avanzar con coherencia, sin coordinar
                cinco proveedores distintos.
              </p>
              <Button asChild variant="impact" className="w-full sm:w-fit">
                <a href="#contacto">
                  Conversemos tu proyecto <ArrowDownRight size={18} />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="section-anchor section-space bg-background">
        <div className="site-container">
          <div className="section-heading" data-sr>
            <p className="eyebrow">Todo lo que tenga que ver con tecnología</p>
            <h2>Seis frentes de trabajo, un mismo equipo detrás.</h2>
          </div>
          <div className="mt-14 grid border-t border-primary/25 sm:grid-cols-2 lg:grid-cols-3" data-sr-group>
            {services.map(({ number, icon: Icon, title, copy }) => (
              <article
                key={title}
                className="front-item group border-b border-primary/25 py-9 sm:odd:border-r sm:odd:pr-8 lg:border-r lg:px-8 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:pr-0 lg:[&:nth-child(3n+1)]:pl-0"
              >
                <div className="flex items-center justify-between text-accent">
                  <span className="font-mono text-sm font-bold">{number}</span>
                  <Icon strokeWidth={1.6} size={30} />
                </div>
                <h3 className="mt-14 text-2xl font-extrabold text-primary">{title}</h3>
                <p className="mt-4 leading-relaxed text-secondary-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="datos" className="section-anchor bg-primary text-primary-foreground">
        <div className="site-container grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            className="flex flex-col justify-between border-b border-primary-foreground/25 py-16 lg:min-h-[620px] lg:border-b-0 lg:border-r lg:py-24 lg:pr-16"
            data-sr
          >
            <div>
              <p className="eyebrow text-brand-light">Datos e información</p>
              <h2 className="mt-6 text-5xl font-extrabold leading-[0.95] sm:text-7xl lg:text-8xl">
                Tu territorio,
                <br />
                <span className="text-impact">en cifras.</span>
              </h2>
            </div>
            <LayoutGrid className="mt-16 text-brand-light" size={64} strokeWidth={1.2} />
          </div>
          <div className="flex flex-col justify-center py-16 lg:py-24 lg:pl-20" data-sr>
            <p className="text-3xl font-bold leading-tight sm:text-5xl">
              Decidir con datos propios cambia la conversación.
            </p>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
              Levantamos, ordenamos y procesamos información del territorio para que campañas, gestiones y
              organizaciones produzcan evidencia confiable, entiendan qué está pasando y actúen a tiempo, sin
              depender de reportes ajenos o intuiciones tardías.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {["Relevamiento", "Bases y tableros", "Decisión"].map((item, index) => (
                <li key={item} className="border-t border-brand-light/60 pt-3 text-sm font-bold uppercase">
                  0{index + 1} · {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="proceso" className="section-anchor section-space bg-background">
        <div className="site-container">
          <div className="section-heading" data-sr>
            <p className="eyebrow">Cómo trabajamos</p>
            <h2>Un método claro, sin sorpresas.</h2>
          </div>
          <ol className="mt-14 grid border-t border-primary/25 md:grid-cols-2 lg:grid-cols-4" data-sr-group>
            {steps.map(([title, copy], index) => (
              <li
                key={title}
                className="border-b border-primary/25 py-9 md:odd:border-r md:odd:pr-8 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <span className="font-mono text-sm font-bold text-accent">0{index + 1}</span>
                <h3 className="mt-10 text-xl font-extrabold text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="nosotros" className="section-anchor section-space bg-warm">
        <div className="site-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div data-sr>
            <p className="eyebrow">Por qué Tacuara</p>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-primary sm:text-5xl">
              Firmes para sostener.
              <br />
              Flexibles para resolver.
            </h2>
            <p className="mt-7 max-w-md leading-relaxed text-secondary-foreground">
              Somos un equipo chico que se involucra de verdad. Crecemos trabajando con otros, combinando oficio,
              criterio y una relación de confianza que no se terceriza.
            </p>
          </div>
          <div className="grid gap-px bg-primary/20 sm:grid-cols-2" data-sr-group>
            {reasons.map(([title, copy], index) => (
              <article key={title} className="bg-warm p-7 sm:p-9">
                <span className="font-mono text-xs font-bold text-accent">0{index + 1}</span>
                <h3 className="mt-8 text-xl font-extrabold text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-20" data-sr>
          <div className="flex items-center gap-4 text-primary">
            <UsersRound size={38} strokeWidth={1.4} />
            <p className="eyebrow">Con quiénes trabajamos</p>
          </div>
          <p className="text-2xl font-bold leading-snug text-primary sm:text-3xl">
            Acompañamos a organizaciones políticas, equipos de gestión, instituciones y empresas que están
            cambiando su forma de trabajar: ordenar su presencia, comunicar mejor, construir herramientas propias
            y decidir con datos.
          </p>
        </div>
      </section>

      <section id="contacto" className="section-anchor section-space bg-warm">
        <div className="site-container grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div data-sr>
            <p className="eyebrow">Hablemos</p>
            <h2 className="mt-5 text-5xl font-extrabold leading-none text-primary sm:text-6xl">
              Empecemos por una conversación.
            </h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-secondary-foreground">
              Contanos qué necesita tu organización. Te respondemos nosotros, sin intermediarios.
            </p>
            <div className="mt-10 space-y-4 text-sm font-bold text-primary">
              <a href="mailto:hola@tacuara.coop" className="flex items-center gap-3 hover:text-accent">
                <MessageCircle size={19} /> hola@tacuara.coop
              </a>
              <p className="flex items-center gap-3">
                <MapPin size={19} /> Misiones, Argentina
              </p>
            </div>
          </div>
          <form onSubmit={submitContact} className="grid gap-7" data-sr>
            <label className="field-label">
              Nombre
              <input required name="nombre" autoComplete="name" className="field-input" placeholder="Tu nombre" />
            </label>
            <label className="field-label">
              Email
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                className="field-input"
                placeholder="vos@organizacion.com"
              />
            </label>
            <label className="field-label">
              Mensaje
              <textarea
                required
                name="mensaje"
                rows={4}
                className="field-input resize-none"
                placeholder="¿En qué podemos ayudarte?"
              />
            </label>
            <Button variant="impact" type="submit" className="w-full sm:ml-auto sm:w-fit">
              Enviar consulta <ArrowRight size={18} />
            </Button>
          </form>
        </div>
      </section>

      <footer className="bg-secondary text-warm/70">
        <div className="site-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <img src={markUrl} alt="" className="h-8 w-8 object-contain" />
              <p className="text-2xl font-extrabold lowercase text-warm">tacuara</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Consultora en tecnología de Misiones, Argentina. Comunicación, diseño, software, datos, procesos y
              formación con un mismo equipo.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-warm/20 text-warm transition-colors hover:border-warm/50 hover:bg-warm hover:text-secondary"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Navegación del pie" className="text-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-warm">Navegación</p>
            <ul className="mt-4 space-y-3">
              {[["#inicio", "Inicio"], ...navLinks, ["#contacto", "Contacto"]].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="transition-colors hover:text-warm">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-warm">Contacto</p>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="mailto:hola@tacuara.coop" className="flex items-center gap-2 transition-colors hover:text-warm">
                  <Mail size={16} /> hola@tacuara.coop
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} /> Misiones, Argentina
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm/15">
          <div className="site-container flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Tacuara. Todos los derechos reservados.
            </p>
            <p>Hecho en Misiones 🧉</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
