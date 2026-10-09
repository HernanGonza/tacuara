import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import markUrl from "@/assets/tacuara-mark-bn-96.webp";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-ink">
      <header className="border-b border-dashed border-ink/55">
        <div className="mx-auto flex h-[4.5rem] max-w-3xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Tacuara, inicio">
            <img src={markUrl} alt="" className="h-9 w-9 object-contain" />
            <span className="text-2xl font-extrabold lowercase tracking-tight">tacuara</span>
          </Link>
          <Link to="/" className="btn-dashed">
            Volver al sitio
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <p className="mono-label mb-4 text-ink/70">Última actualización: {updated}</p>
        <h1 className="display mb-10 text-[clamp(2.2rem,6vw,4rem)]">{title}</h1>
        <div className="space-y-4 text-base leading-relaxed [&_a]:text-impact [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-tight [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
          {children}
        </div>
      </article>
    </main>
  );
}
