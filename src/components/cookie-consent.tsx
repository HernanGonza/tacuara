import { Analytics } from "@vercel/analytics/react";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const KEY = "tacuara-consent";
const OPEN_EVENT = "tacuara:cookies";

type Choice = "accepted" | "rejected" | null;

/** Abre de nuevo el banner (lo usa el enlace "Cookies" del footer). */
export const openCookiePreferences = () => window.dispatchEvent(new Event(OPEN_EVENT));

/**
 * Banner de consentimiento. La elección se guarda en localStorage (no usa cookies).
 * Vercel Analytics solo se carga si la persona acepta.
 */
export function CookieConsent() {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "accepted" || saved === "rejected") setChoice(saved);
    else setOpen(true);
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  function decide(value: "accepted" | "rejected") {
    localStorage.setItem(KEY, value);
    setChoice(value);
    setOpen(false);
  }

  // La herramienta interna no lleva banner ni medición.
  if (!ready || pathname.startsWith("/panel")) return null;

  return (
    <>
      {choice === "accepted" && <Analytics />}
      {open && (
        <div
          role="dialog"
          aria-label="Preferencias de cookies"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl border border-dashed border-ink/55 bg-white p-4 shadow-[8px_8px_0_0_var(--color-accent)] sm:inset-x-6 sm:bottom-6 sm:p-5"
        >
          <p className="mono-label text-impact">Cookies y medición</p>
          <p className="mt-2 text-sm leading-snug">
            Usamos una herramienta de estadísticas (Vercel Analytics) para saber cuánta gente visita el sitio. Mide visitas de forma agregada, sin
            cookies publicitarias y sin identificarte. Solo se activa si aceptás. Más info en nuestra{" "}
            <a href="/privacidad" className="underline">
              política de privacidad
            </a>
            .
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-dashed h-11" onClick={() => decide("rejected")}>
              Rechazar
            </button>
            <button type="button" className="btn-solid h-11" onClick={() => decide("accepted")} autoFocus>
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
