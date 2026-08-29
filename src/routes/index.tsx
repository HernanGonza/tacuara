import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Braces,
  GraduationCap,
  MapPin,
  Menu,
  MessageCircle,
  PenTool,
  Sprout,
  UsersRound,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import logoUrl from "@/assets/Tacuara-logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tacuara | Comunicación, tecnología y formación" },
      {
        name: "description",
        content:
          "Consultora cooperativa de Misiones. Comunicación, tecnología a medida, datos y formación con un mismo equipo.",
      },
      { property: "og:title", content: "Tacuara | Un equipo para sostener tu proyecto" },
      {
        property: "og:description",
        content: "Comunicación, tecnología, datos y formación para organizaciones que necesitan avanzar con coherencia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const fronts = [
  {
    number: "01",
    icon: PenTool,
    title: "Comunicación y marca",
    copy: "Construimos una imagen pública reconocible y la sostenemos en el tiempo. Estrategia, identidad, diseño y gestión de redes trabajan como una sola voz, no como piezas sueltas.",
  },
  {
    number: "02",
    icon: Braces,
    title: "Tecnología a medida",
    copy: "Convertimos necesidades reales en software y sitios que encajan con la forma de trabajar de tu organización. Sin plantillas forzadas ni herramientas que terminan siendo un problema más.",
  },
  {
    number: "03",
    icon: GraduationCap,
    title: "Formación",
    copy: "Academia Digital fortalece las capacidades de los equipos para que puedan usar mejor las herramientas, tomar decisiones con criterio y ganar autonomía en lo cotidiano.",
  },
];

const reasons = [
  ["Cercanía real", "Hablás con quienes piensan y hacen tu proyecto. Sin capas de cuentas ni pases de mano."],
  ["Una mirada compartida", "Comunicación y tecnología se deciden juntas desde el inicio, con un rumbo común."],
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
      <header className="absolute inset-x-0 top-0 z-40">
        <div className="site-container grid h-24 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-foreground/10">
          <a href="#inicio" aria-label="Tacuara, inicio" className="w-32 sm:w-36">
            <img src={logoUrl} alt="Tacuara" className="logo-crop h-14 w-full object-cover mix-blend-multiply" />
          </a>
          <nav aria-label="Navegación principal" className="hidden items-center gap-8 lg:flex">
            <a className="nav-link" href="#trabajo">Qué hacemos</a>
            <a className="nav-link" href="#datos">Datos</a>
            <a className="nav-link" href="#nosotros">Por qué Tacuara</a>
            <Button asChild variant="impact"><a href="#contacto">Conversemos</a></Button>
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
              {[["#trabajo", "Qué hacemos"], ["#datos", "Datos"], ["#nosotros", "Por qué Tacuara"], ["#contacto", "Conversemos"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <section id="inicio" className="relative flex min-h-[760px] items-end bg-warm pb-16 pt-36 sm:pb-20 lg:min-h-[min(88vh,900px)] lg:pb-24">
        <div className="bamboo-lines" aria-hidden="true" />
        <div className="site-container relative z-10">
          <div className="max-w-5xl">
            <p className="eyebrow mb-6">Consultora cooperativa · Misiones, Argentina</p>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.98] text-primary sm:text-6xl lg:text-8xl">
              Un solo equipo.<br />Tu proyecto, <span className="text-impact">bien sostenido.</span>
            </h1>
            <div className="mt-9 grid gap-8 border-t border-primary/25 pt-7 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-2xl text-lg leading-relaxed text-secondary-foreground sm:text-xl">
                Comunicación, tecnología, datos y formación pensados en conjunto. Para que tu organización avance con coherencia, sin coordinar cinco proveedores distintos.
              </p>
              <Button asChild variant="impact" className="w-full sm:w-fit">
                <a href="#contacto">Conversemos tu proyecto <ArrowDownRight size={18} /></a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="trabajo" className="section-space bg-background">
        <div className="site-container">
          <div className="section-heading">
            <p className="eyebrow">Tres frentes. Un mismo rumbo.</p>
            <h2>Lo que tu organización necesita, pensado como un todo.</h2>
          </div>
          <div className="mt-14 grid border-t border-primary/25 lg:grid-cols-3">
            {fronts.map(({ number, icon: Icon, title, copy }) => (
              <article key={title} className="front-item group border-b border-primary/25 py-9 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                <div className="flex items-center justify-between text-accent">
                  <span className="font-mono text-sm font-bold">{number}</span>
                  <Icon strokeWidth={1.6} size={30} />
                </div>
                <h3 className="mt-16 text-3xl font-extrabold text-primary">{title}</h3>
                <p className="mt-5 leading-relaxed text-secondary-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="datos" className="bg-primary text-primary-foreground">
        <div className="site-container grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between border-b border-primary-foreground/25 py-16 lg:min-h-[620px] lg:border-b-0 lg:border-r lg:py-24 lg:pr-16">
            <div>
              <p className="eyebrow text-brand-light">Datos e información</p>
              <h2 className="mt-6 text-5xl font-extrabold leading-[0.95] sm:text-7xl lg:text-8xl">Tu territorio,<br /><span className="text-impact">en cifras.</span></h2>
            </div>
            <BarChart3 className="mt-16 text-brand-light" size={72} strokeWidth={1.2} />
          </div>
          <div className="flex flex-col justify-center py-16 lg:py-24 lg:pl-20">
            <p className="text-3xl font-bold leading-tight sm:text-5xl">Decidir con datos propios cambia la conversación.</p>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
              Levantamos y procesamos información del territorio para que campañas, gestiones y organizaciones produzcan evidencia confiable, entiendan qué está pasando y actúen a tiempo, sin depender de reportes ajenos o intuiciones tardías.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {["Relevamiento", "Lectura de datos", "Decisión"].map((item, index) => (
                <li key={item} className="border-t border-brand-light/60 pt-3 text-sm font-bold uppercase">0{index + 1} · {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="nosotros" className="section-space bg-warm">
        <div className="site-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow">Por qué Tacuara</p>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-primary sm:text-5xl">Firmes para sostener.<br />Flexibles para resolver.</h2>
            <p className="mt-7 max-w-md leading-relaxed text-secondary-foreground">Somos un equipo chico que se involucra de verdad. Crecemos trabajando con otros, combinando oficio, criterio y una relación de confianza que no se terceriza.</p>
          </div>
          <div className="grid gap-px bg-primary/20 sm:grid-cols-2">
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
        <div className="site-container grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
          <div className="flex items-center gap-4 text-primary"><UsersRound size={38} strokeWidth={1.4} /><p className="eyebrow">Confían en este modo de trabajar</p></div>
          <p className="text-2xl font-bold leading-snug text-primary sm:text-3xl">Organizaciones políticas, equipos de gestión, instituciones y empresas que necesitan ordenar su presencia, comunicar mejor y construir herramientas propias.</p>
        </div>
      </section>

      <section id="contacto" className="section-space bg-warm">
        <div className="site-container grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div>
            <p className="eyebrow">Hablemos</p>
            <h2 className="mt-5 text-5xl font-extrabold leading-none text-primary sm:text-6xl">Empecemos por una conversación.</h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-secondary-foreground">Contanos qué necesita tu organización. Te respondemos nosotros, sin intermediarios.</p>
            <div className="mt-10 space-y-4 text-sm font-bold text-primary">
              <a href="mailto:hola@tacuara.coop" className="flex items-center gap-3 hover:text-accent"><MessageCircle size={19} /> hola@tacuara.coop</a>
              <p className="flex items-center gap-3"><MapPin size={19} /> Misiones, Argentina</p>
            </div>
          </div>
          <form onSubmit={submitContact} className="grid gap-7">
            <label className="field-label">Nombre<input required name="nombre" autoComplete="name" className="field-input" placeholder="Tu nombre" /></label>
            <label className="field-label">Email<input required type="email" name="email" autoComplete="email" className="field-input" placeholder="vos@organizacion.com" /></label>
            <label className="field-label">Mensaje<textarea required name="mensaje" rows={4} className="field-input resize-none" placeholder="¿En qué podemos ayudarte?" /></label>
            <Button variant="impact" type="submit" className="w-full sm:ml-auto sm:w-fit">Enviar consulta <ArrowRight size={18} /></Button>
          </form>
        </div>
      </section>

      <footer className="bg-secondary py-9 text-secondary-foreground">
        <div className="site-container grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
          <div className="min-w-0"><p className="text-3xl font-extrabold text-primary">tacuara</p><p className="mt-2 text-xs">Comunicación · Tecnología · Formación</p></div>
          <a href="#inicio" aria-label="Volver arriba" className="grid size-11 shrink-0 place-items-center border border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"><ArrowDownRight className="rotate-180" /></a>
        </div>
      </footer>
    </main>
  );
}
