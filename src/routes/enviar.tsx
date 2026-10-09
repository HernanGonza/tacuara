import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { checkMailerPassword, sendMail } from "@/lib/mailer";

export const Route = createFileRoute("/enviar")({
  head: () => ({
    meta: [{ title: "Mandador · Tacuara" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Mailer,
});

const field = "w-full border border-dashed border-ink/55 bg-white px-3 py-2 text-base outline-none focus:border-impact";

function Mailer() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; msg?: string }>({ kind: "idle" });

  const recipients = useMemo(
    () => [...new Set(to.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean))],
    [to],
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
    if (!window.confirm(`¿Enviar "${subject}" a ${recipients.length} destinatario(s)?`)) return;
    setStatus({ kind: "busy" });
    try {
      const res = await sendMail({ data: { password, to: recipients, subject, html, text: text || undefined } });
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

  const ready = recipients.length > 0 && subject.trim() && html.trim() && status.kind !== "busy";

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-[96rem]">
        <p className="mono-label mb-1">Mandador · sale como hola@tacuara.com.ar</p>
        <h1 className="display mb-6 text-4xl">Enviar mail</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="mono-label">Para (separados por coma, espacio o salto de línea) · {recipients.length}</span>
              <textarea className={field} rows={3} value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className="mono-label">Asunto</span>
              <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className="mono-label">HTML</span>
              <textarea
                className={`${field} font-mono text-sm`}
                rows={16}
                spellCheck={false}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="mono-label">Texto plano (opcional)</span>
              <textarea className={`${field} font-mono text-sm`} rows={6} value={text} onChange={(e) => setText(e.target.value)} />
            </label>
            <button className="btn-solid h-12 w-full sm:w-fit" disabled={!ready} onClick={send}>
              {status.kind === "busy" ? "Enviando…" : `Enviar a ${recipients.length}`}
            </button>
            {status.kind === "ok" && <p className="text-sm text-impact">{status.msg}</p>}
            {status.kind === "error" && <p className="text-sm text-destructive">{status.msg}</p>}
          </div>
          <div className="space-y-1">
            <span className="mono-label">Vista previa</span>
            <iframe
              title="Vista previa"
              sandbox=""
              srcDoc={html}
              className="h-[48rem] w-full border border-dashed border-ink/55 bg-white"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
