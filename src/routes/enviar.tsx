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

const field = "w-full border border-dashed border-ink/55 bg-white px-3 py-2 text-base outline-none focus:border-impact";
const hint = "text-sm text-ink/60";

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
  const preview = useMemo(
    () => renderEmail({ body, preheader: DEFAULT_PREHEADER, vars }).html,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [body, first, nombre, rol],
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
    if (!window.confirm(`¿Enviar a ${list.length} destinatario(s)?\n\nAsunto: ${fill(subject, vars)}`)) return;
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
      setStatus({ kind: "ok", msg: `Enviado a ${res.sent} destinatario(s).` });
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
    <main className="min-h-screen bg-background px-4 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-[96rem]">
        <p className="mono-label mb-1">Mandador · sale como hola@tacuara.com.ar</p>
        <h1 className="display mb-6 text-4xl">Enviar presentación</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <label className="block space-y-1">
              <span className="mono-label">1 · Destinatarios ({list.length})</span>
              <textarea
                className={`${field} font-mono text-sm`}
                rows={5}
                spellCheck={false}
                placeholder={"info@ferreteria.com; Ferretería El Tornillo; Ferretería; Posadas\ncontacto@panaderia.com; Panadería Sol; Panadería; Oberá"}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
              />
              <p className={hint}>Una línea por contacto: email; negocio; rubro; ciudad. Solo el email es obligatorio.</p>
              {invalid.length > 0 && <p className="text-sm text-destructive">Email inválido: {invalid.join(" | ")}</p>}
            </label>

            <div className="space-y-1">
              <span className="mono-label">2 · Asunto</span>
              <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} />
              <div className="flex flex-wrap gap-2 pt-1">
                {DEFAULT_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-full border border-ink/60 px-3 py-1 text-sm hover:bg-warm"
                    onClick={() => setSubject(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1">
              <span className="mono-label">3 · Mensaje ({words} palabras)</span>
              <textarea className={field} rows={16} value={body} onChange={(e) => setBody(e.target.value)} />
              <p className={hint}>
                Línea en blanco = párrafo nuevo. Una línea que empieza con «- » es una viñeta. {"{{nombre_negocio}}"}, {"{{rubro}}"} y{" "}
                {"{{ciudad}}"} se completan solos; si falta el dato, queda un texto genérico.
              </p>
              {words > 150 && <p className="text-sm text-destructive">Quedó largo: conviene no pasar de 150 palabras.</p>}
              <button type="button" className="text-sm underline" onClick={() => setBody(DEFAULT_BODY)}>
                Volver al texto original
              </button>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="mono-label">4 · Tu nombre</span>
                <input className={field} value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </label>
              <label className="block space-y-1">
                <span className="mono-label">Tu rol</span>
                <input className={field} placeholder="Ej: Comercial" value={rol} onChange={(e) => setRol(e.target.value)} />
              </label>
            </div>

            <button className="btn-solid h-12 w-full sm:w-fit" disabled={!ready} onClick={send}>
              {status.kind === "busy" ? "Enviando…" : `Enviar a ${list.length}`}
            </button>
            {status.kind === "ok" && <p className="text-sm text-impact">{status.msg}</p>}
            {status.kind === "error" && <p className="text-sm text-destructive">{status.msg}</p>}
          </div>

          <div className="space-y-1">
            <span className="mono-label">
              Vista previa · asunto: {fill(subject, vars)}
            </span>
            <iframe title="Vista previa" sandbox="" srcDoc={preview} className="h-[60rem] w-full border border-dashed border-ink/55 bg-white" />
          </div>
        </div>
      </div>
    </main>
  );
}
