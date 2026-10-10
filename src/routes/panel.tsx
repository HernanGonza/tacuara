import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_BODY,
  DEFAULT_PREHEADER,
  DEFAULT_SUBJECTS,
  countWords,
  fill,
  renderEmail,
} from "@/lib/email-template";
import { Crm } from "@/components/crm";
import { Inbox } from "@/components/inbox";
import { checkMailerPassword, sendMail } from "@/lib/mailer";
import { crmMarkSent } from "@/lib/crm";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [{ title: "Mail · Tacuara" }, { name: "robots", content: "noindex, nofollow" }],
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
  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const add = (email: string, data: { nombre_negocio?: string | undefined; rubro?: string | undefined; ciudad?: string | undefined } = {}) => {
    if (seen.has(email.toLowerCase())) return;
    seen.add(email.toLowerCase());
    list.push({ email, ...data });
  };
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const fields = line.split(/[\t;,\s]*[\t;,][\t;,\s]*|\s+(?=\S+@)/).map((f) => f.trim()).filter(Boolean);
    const emails = fields.filter(isEmail);
    if (emails.length > 1) {
      // Varios emails en la misma línea: cada uno es un destinatario (sin datos).
      emails.forEach((e) => add(e));
    } else if (emails.length === 1 && isEmail(fields[0] ?? "")) {
      const [email = "", nombre_negocio, rubro, ciudad] = fields;
      add(email, { nombre_negocio: nombre_negocio || undefined, rubro: rubro || undefined, ciudad: ciudad || undefined });
    } else {
      invalid.push(line.trim());
    }
  }
  return { list, invalid };
}

/** Reemplaza solo las variables de la empresa ({{nombre_negocio}}, {{rubro}}, {{ciudad}}), con su texto de respaldo incluido. */
function fillCompany(text: string, e: { nombre: string; rubro: string; zona: string }) {
  return text.replace(/\{\{\s*(nombre_negocio|rubro|ciudad)\s*(?:\|[^}]*)?\}\}/g, (_m, key: string) =>
    key === "rubro" ? e.rubro.toLowerCase() : key === "ciudad" ? e.zona : e.nombre,
  );
}

function Mailer() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [raw, setRaw] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECTS[0]!);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("");
  const [tab, setTab] = useState<"enviar" | "bandeja" | "empresas">("enviar");
  // Plantilla de asunto/mensaje antes de completarla con una empresa, para poder rehacerla con la siguiente.
  const tpl = useRef<{ subject: string; body: string; subjectOut: string; bodyOut: string } | null>(null);
  const [crmReload, setCrmReload] = useState(0);
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

  // Datos de las empresas traídas desde el CRM (por email): el campo de destinatarios muestra solo el email.
  const [known, setKnown] = useState<Record<string, { nombre_negocio: string; rubro: string; ciudad: string }>>({});
  const parsed = useMemo(() => parseRecipients(raw), [raw]);
  const invalid = parsed.invalid;
  const list = useMemo(
    () =>
      parsed.list.map((r) => {
        const k = known[r.email.toLowerCase()];
        return {
          email: r.email,
          nombre_negocio: r.nombre_negocio ?? k?.nombre_negocio,
          rubro: r.rubro ?? k?.rubro,
          ciudad: r.ciudad ?? k?.ciudad,
        };
      }),
    [parsed.list, known],
  );
  // La vista previa usa los datos del primer destinatario si los hay; si no, la versión genérica (con los textos de reemplazo).
  const first = list[0];
  const vars = {
    remitente_nombre: nombre,
    remitente_rol: rol,
    nombre_negocio: first?.nombre_negocio,
    rubro: first?.rubro,
    ciudad: first?.ciudad,
  };
  // Gmail web no aplica el @media de modo oscuro; Apple Mail sí. El selector fuerza uno u otro en la vista previa.
  const preview = useMemo(
    () =>
      renderEmail({ body, preheader: DEFAULT_PREHEADER, vars }).html.replace(
        "@media (prefers-color-scheme: dark)",
        dark ? "@media all" : "@media not all",
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [body, nombre, rol, dark, first?.nombre_negocio, first?.rubro, first?.ciudad],
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
      if (res.failed.length) {
        setStatus({ kind: "error", msg: `No se pudo enviar a: ${res.failed.join(", ")}.${res.sent ? ` Se enviaron ${res.sent}.` : ""}` });
        return;
      }
      // Si alguno es una empresa del CRM, queda anotado como enviado. Si esto falla, el mail ya salió igual.
      try {
        await crmMarkSent({ data: { password, emails: list.map((r) => r.email), subject: fill(subject, vars) } });
        setCrmReload((n) => n + 1);
      } catch (err) {
        console.error("[panel] no se pudo registrar en el CRM", err);
      }
      tpl.current = null;
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
          <p className="mono-label">Mail · acceso interno</p>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className={`${field} pr-10`}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-ink/70 hover:text-ink"
              aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-background px-4 py-3 text-ink sm:px-6 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col lg:min-h-0">
        <div className="mb-2 flex items-baseline justify-between gap-4 border-b border-dashed border-ink/55 pb-2">
          <div className="flex items-baseline gap-5">
            {(["enviar", "bandeja", "empresas"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`display text-2xl ${tab === t ? "" : "text-ink/35 hover:text-ink/70"}`}
              >
                {t === "enviar" ? "Enviar" : t === "bandeja" ? "Bandeja" : "Empresas"}
              </button>
            ))}
          </div>
          <p className="mono-label hidden sm:block">Sale como hola@tacuara.com.ar</p>
        </div>
        {tab === "bandeja" && <Inbox password={password} nombre={nombre} rol={rol} />}
        <div className={`${tab === "empresas" ? "flex" : "hidden"} min-h-0 flex-1 flex-col`}>
          <Crm
            password={password}
            reloadKey={crmReload}
            onCompose={(rows) => {
              setKnown(Object.fromEntries(rows.map((e) => [e.email.toLowerCase(), { nombre_negocio: e.nombre, rubro: e.rubro, ciudad: e.zona }])));
              setRaw(rows.map((e) => e.email).join("\n"));
              // Con una sola empresa, el asunto y el mensaje quedan con su nombre ya puesto (editable). Con varias, siguen las variables.
              const t = tpl.current;
              const baseSubject = t && subject === t.subjectOut ? t.subject : subject;
              const baseBody = t && body === t.bodyOut ? t.body : body;
              const one = rows.length === 1 ? rows[0] : undefined;
              const subjectOut = one ? fillCompany(baseSubject, one) : baseSubject;
              const bodyOut = one ? fillCompany(baseBody, one) : baseBody;
              tpl.current = { subject: baseSubject, body: baseBody, subjectOut, bodyOut };
              setSubject(subjectOut);
              setBody(bodyOut);
              setStatus({ kind: "idle" });
              setTab("enviar");
            }}
          />
        </div>
        <div className={`${tab === "enviar" ? "grid" : "hidden"} flex-1 grid-cols-[minmax(0,1fr)] gap-5 lg:min-h-0 lg:grid-cols-[minmax(0,26rem)_1fr] xl:grid-cols-[minmax(0,30rem)_1fr]`}>
          <div className="flex min-w-0 flex-col gap-2.5 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
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

            <label className="flex flex-col space-y-1 lg:min-h-0 lg:flex-1">
              <span className="mono-label">3 · Mensaje ({words} palabras)</span>
              <textarea className={`${field} min-h-[14rem] lg:min-h-[8rem] lg:flex-1`} value={body} onChange={(e) => setBody(e.target.value)} />
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

          <div className="flex min-w-0 flex-col gap-1 lg:min-h-0">
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
            <iframe key={tab} title="Vista previa" sandbox="" srcDoc={preview} className="h-[34rem] w-full border border-dashed border-ink/55 bg-white lg:h-auto lg:min-h-0 lg:flex-1" />
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
