import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_BODY,
  DEFAULT_PREHEADER,
  DEFAULT_SUBJECTS,
  countWords,
  fill,
  renderEmail,
} from "@/lib/email-template";
import { checkMailerPassword, sendMail } from "@/lib/mailer";

export const Route = createFileRoute("/enviar")({
  head: () => ({
    meta: [{ title: "Mandador · Tacuara" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Mailer,
});

const field = "w-full border border-dashed border-ink/55 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-impact";
const hint = "text-xs text-ink/60";

/** Una línea por destinatario: email; negocio; rubro; ciudad (separa con ; , o tab: sirve pegar desde una planilla). */
function parseRecipients(raw: string) {
  const seen = new Set<string>();
  const list: { email: string; nombre_negocio?: string | undefined; rubro?: string | undefined; ciudad?: string | undefined }[] = [];
  const invalid: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [email = "", nombre_negocio, rubro, ciudad] = line.split(/[\t;,]/).map((s) => s.trim());
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      invalid.push(line.trim());
      continue;
    }
    if (seen.has(email.toLowerCase())) continue;
    seen.add(email.toLowerCase());
    list.push({ email, nombre_negocio: nombre_negocio || undefined, rubro: rubro || undefined, ciudad: ciudad || undefined });
  }
  return { list, invalid };
}

function Mailer() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [raw, setRaw] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECTS[0]!);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; msg?: string }>({ kind: "idle" });

  // La firma se recuerda en este navegador.
  useEffect(() => {
    setNombre(localStorage.getItem("mailer.nombre") ?? "");
    setRol(localStorage.getItem("mailer.rol") ?? "");
  }, []);
  useEffect(() => {
    localStorage.setItem("mailer.nombre", nombre);
    localStorage.setItem("mailer.rol", rol);
  }, [nombre, rol]);

  const { list, invalid } = useMemo(() => parseRecipients(raw), [raw]);
  const first = list[0];
  const vars = { ...first, remitente_nombre: nombre, remitente_rol: rol };
  // Gmail web no aplica el @media de modo oscuro; Apple Mail sí. El selector fuerza uno u otro en la vista previa.
  const preview = useMemo(
    () =>
      renderEmail({ body, preheader: DEFAULT_PREHEADER, vars }).html.replace(
        "@media (prefers-color-scheme: dark)",
        dark ? "@media all" : "@media not all",
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [body, first, nombre, rol, dark],
  );

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "busy" });
    try {
      const { ok } = await checkMailerPassword({ data: { password } });
      setUnlocked(ok);
      setStatus(ok ? { kind: "idle" } : { kind: "error", msg: "Contraseña incorrecta." });
    } catch {
      setStatus({ kind: "error", msg: "No se pudo validar." });
    }
  }

  async function send() {
    setConfirmOpen(false);
    setStatus({ kind: "busy" });
    try {
      const res = await sendMail({
        data: {
          password,
          recipients: list,
          subject,
          body,
          preheader: DEFAULT_PREHEADER,
          remitente_nombre: nombre || undefined,
          remitente_rol: rol || undefined,
        },
      });
      setRaw("");
      setSubject(DEFAULT_SUBJECTS[0]!);
      setBody(DEFAULT_BODY);
      setStatus({ kind: "ok", msg: `Enviado a ${res.sent} destinatario(s). El formulario quedó limpio.` });
    } catch (err) {
      setStatus({ kind: "error", msg: err instanceof Error ? err.message : "Error al enviar." });
    }
  }

  if (!unlocked) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 text-ink">
        <form onSubmit={unlock} className="w-full max-w-sm space-y-4">
          <p className="mono-label">Mandador · acceso interno</p>
          <input
            type="password"
            className={field}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button className="btn-solid h-12 w-full" disabled={status.kind === "busy"}>
            Entrar
          </button>
          {status.kind === "error" && <p className="text-sm text-destructive">{status.msg}</p>}
        </form>
      </main>
    );
  }

  const words = countWords(body);
  const ready = list.length > 0 && subject.trim() && body.trim() && nombre.trim() && invalid.length === 0 && status.kind !== "busy";

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background px-4 py-3 text-ink sm:px-6">
      <div className="mx-auto flex min-h-0 w-full max-w-[96rem] flex-1 flex-col">
        <div className="mb-2 flex items-baseline justify-between gap-4 border-b border-dashed border-ink/55 pb-2">
          <h1 className="display text-2xl">Enviar presentación</h1>
          <p className="mono-label">Sale como hola@tacuara.com.ar</p>
        </div>
        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,26rem)_1fr] xl:grid-cols-[minmax(0,30rem)_1fr]">
          <div className="flex min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
            <label className="block space-y-1">
              <span className="mono-label">1 · Destinatarios ({list.length})</span>
              <textarea
                className={`${field} font-mono text-xs`}
                rows={3}
                spellCheck={false}
                placeholder={"info@ferreteria.com; Ferretería El Tornillo; Ferretería; Posadas"}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
              />
              <p className={hint}>Una línea por contacto: email; negocio; rubro; ciudad. Solo el email es obligatorio.</p>
              {invalid.length > 0 && <p className="text-xs text-destructive">Email inválido: {invalid.join(" | ")}</p>}
            </label>

            <label className="block space-y-1">
              <span className="mono-label">2 · Asunto</span>
              <select className={field} value={DEFAULT_SUBJECTS.includes(subject) ? subject : ""} onChange={(e) => e.target.value && setSubject(e.target.value)}>
                <option value="">Personalizado…</option>
                {DEFAULT_SUBJECTS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>

            <label className="flex min-h-0 flex-1 flex-col space-y-1">
              <span className="mono-label">3 · Mensaje ({words} palabras)</span>
              <textarea className={`${field} min-h-[8rem] flex-1`} value={body} onChange={(e) => setBody(e.target.value)} />
              <p className={hint}>
                Línea en blanco = párrafo nuevo. «- » al inicio = viñeta. {"{{nombre_negocio}}"}, {"{{rubro}}"} y {"{{ciudad}}"} se completan solos.{" "}
                <button type="button" className="underline" onClick={() => setBody(DEFAULT_BODY)}>
                  Texto original
                </button>
              </p>
              {words > 150 && <p className="text-xs text-destructive">Quedó largo: conviene no pasar de 150 palabras.</p>}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="mono-label">4 · Tu nombre</span>
                <input className={field} value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </label>
              <label className="block space-y-1">
                <span className="mono-label">Tu rol</span>
                <input className={field} placeholder="Ej: Comercial" value={rol} onChange={(e) => setRol(e.target.value)} />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button className="btn-solid h-10 shrink-0 disabled:opacity-50" disabled={!ready} onClick={() => setConfirmOpen(true)}>
                {status.kind === "busy" ? "Enviando…" : `Enviar a ${list.length}`}
              </button>
              {status.kind === "ok" && <p className="text-xs text-impact">{status.msg}</p>}
              {status.kind === "error" && <p className="text-xs text-destructive">{status.msg}</p>}
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <span className="mono-label truncate">Asunto: {fill(subject, vars)}</span>
              <div className="flex shrink-0 gap-1 text-xs">
                {[false, true].map((d) => (
                  <button
                    key={String(d)}
                    type="button"
                    onClick={() => setDark(d)}
                    className={`rounded-full border border-ink/60 px-2.5 py-0.5 ${dark === d ? "bg-ink text-white" : "hover:bg-warm"}`}
                  >
                    {d ? "Oscuro" : "Claro"}
                  </button>
                ))}
              </div>
            </div>
            <iframe title="Vista previa" sandbox="" srcDoc={preview} className="min-h-0 w-full flex-1 border border-dashed border-ink/55 bg-white" />
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-4" role="presentation" onClick={() => setConfirmOpen(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md border border-dashed border-ink/55 bg-white p-6 shadow-[10px_10px_0_0_var(--color-accent)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mono-label text-impact">Confirmar envío</p>
            <h2 id="confirm-title" className="display mt-2 text-3xl">
              ¿Enviar a {list.length}?
            </h2>
            <p className="mt-3 text-sm leading-snug">
              <span className="mono-label block text-ink/60">Asunto</span>
              {fill(subject, vars)}
            </p>
            <p className="mt-2 break-words text-sm leading-snug text-ink/70">
              {list.slice(0, 3).map((r) => r.email).join(", ")}
              {list.length > 3 && ` y ${list.length - 3} más`}
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn-dashed h-11 flex-1" autoFocus onClick={() => setConfirmOpen(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-solid h-11 flex-1" onClick={send}>
                Sí, enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
