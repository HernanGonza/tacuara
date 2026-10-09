import { Archive, RefreshCw, Reply, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { listInbox, readMessage, replyMessage, updateMessage } from "@/lib/inbox";

type Item = Awaited<ReturnType<typeof listInbox>>["messages"][number];
type Full = Awaited<ReturnType<typeof readMessage>>;

const fmt = (ms: number) =>
  new Date(ms).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/** "Nombre <mail@x.com>" → "Nombre" */
const who = (from: string) => from.replace(/<.*>/, "").replace(/"/g, "").trim() || from;

export function Inbox({ password, nombre, rol }: { password: string; nombre: string; rol: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [open, setOpen] = useState<Full | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (pageToken?: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await listInbox({ data: { password, ...(pageToken ? { pageToken } : {}) } });
        setItems((prev) => (pageToken ? [...prev, ...res.messages] : res.messages));
        setNext(res.nextPageToken);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar la bandeja.");
      } finally {
        setLoading(false);
      }
    },
    [password],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function show(id: string) {
    setSelected(id);
    setOpen(null);
    setReplying(false);
    setReply("");
    setNotice("");
    try {
      setOpen(await readMessage({ data: { password, id } }));
      if (items.find((m) => m.id === id)?.unread) {
        setItems((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
        void updateMessage({ data: { password, id, action: "read" } });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir el mensaje.");
    }
  }

  async function act(action: "archive" | "trash") {
    if (!open) return;
    setBusy(true);
    try {
      await updateMessage({ data: { password, id: open.id, action } });
      setItems((prev) => prev.filter((m) => m.id !== open.id));
      setOpen(null);
      setSelected(null);
      setNotice(action === "archive" ? "Archivado." : "Movido a la papelera.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la acción.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!open) return;
    setBusy(true);
    setError("");
    try {
      const res = await replyMessage({
        data: { password, id: open.id, body: reply, ...(nombre ? { remitente_nombre: nombre } : {}), ...(rol ? { remitente_rol: rol } : {}) },
      });
      setReplying(false);
      setReply("");
      setNotice(`Respuesta enviada a ${res.to}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la respuesta.");
    } finally {
      setBusy(false);
    }
  }

  const doc = open
    ? open.html ||
      `<pre style="font:14px/1.5 Arial,sans-serif;white-space:pre-wrap;margin:16px">${open.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`
    : "";

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,24rem)_1fr]">
      <div className="flex min-h-0 flex-col border border-dashed border-ink/55 bg-white">
        <div className="flex items-center justify-between border-b border-dashed border-ink/55 px-3 py-1.5">
          <span className="mono-label">Recibidos · hola@tacuara.com.ar</span>
          <button type="button" aria-label="Actualizar" className="text-ink/70 hover:text-ink" onClick={() => void load()}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => void show(m.id)}
                className={`block w-full border-b border-dashed border-ink/25 px-3 py-2 text-left hover:bg-warm ${selected === m.id ? "bg-warm" : ""}`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate text-sm ${m.unread ? "font-bold" : ""}`}>
                    {m.unread && <span className="mr-1.5 inline-block size-2 rounded-full bg-impact" />}
                    {who(m.from)}
                  </span>
                  <span className="mono-label shrink-0 text-[0.65rem] text-ink/60">{fmt(m.date)}</span>
                </span>
                <span className={`block truncate text-sm ${m.unread ? "font-semibold" : ""}`}>{m.subject}</span>
                <span className="block truncate text-xs text-ink/60">{m.snippet}</span>
              </button>
            </li>
          ))}
          {!loading && items.length === 0 && !error && <li className="p-4 text-sm text-ink/60">No hay mensajes.</li>}
          {next && (
            <li className="p-2">
              <button type="button" className="btn-dashed h-9 w-full text-sm" disabled={loading} onClick={() => void load(next)}>
                Cargar más
              </button>
            </li>
          )}
        </ul>
        {error && <p className="border-t border-dashed border-ink/55 p-3 text-xs text-destructive">{error}</p>}
        {notice && <p className="border-t border-dashed border-ink/55 p-3 text-xs text-impact">{notice}</p>}
      </div>

      <div className="flex min-h-0 flex-col border border-dashed border-ink/55 bg-white">
        {open ? (
          <>
            <div className="space-y-0.5 border-b border-dashed border-ink/55 px-4 py-2.5">
              <h2 className="text-base font-bold leading-tight">{open.subject}</h2>
              <p className="text-xs text-ink/70">
                De: {open.from} · {fmt(open.date)}
              </p>
              {open.files.length > 0 && <p className="text-xs text-ink/70">Adjuntos: {open.files.join(", ")} (abrilos en Gmail)</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" className="btn-solid h-8 gap-1.5 px-3 text-xs" onClick={() => setReplying((v) => !v)}>
                  <Reply size={14} /> Responder
                </button>
                <button type="button" className="btn-dashed h-8 gap-1.5 px-3 text-xs" disabled={busy} onClick={() => void act("archive")}>
                  <Archive size={14} /> Archivar
                </button>
                <button type="button" className="btn-dashed h-8 gap-1.5 px-3 text-xs" disabled={busy} onClick={() => void act("trash")}>
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
            <iframe title="Mensaje" sandbox="" srcDoc={doc} className="min-h-0 w-full flex-1 bg-white" />
            {replying && (
              <div className="space-y-2 border-t border-dashed border-ink/55 p-3">
                <p className="mono-label">Respuesta a {open.replyTo} · sale como hola@tacuara.com.ar</p>
                <textarea
                  className="w-full border border-dashed border-ink/55 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-impact"
                  rows={5}
                  autoFocus
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <button type="button" className="btn-solid h-9 text-sm disabled:opacity-50" disabled={busy || !reply.trim() || !nombre.trim()} onClick={() => void sendReply()}>
                    {busy ? "Enviando…" : "Enviar respuesta"}
                  </button>
                  {!nombre.trim() && <span className="text-xs text-ink/60">Completá tu nombre en la pestaña Enviar para la firma.</span>}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="grid flex-1 place-items-center p-6 text-sm text-ink/60">{selected ? "Abriendo…" : "Elegí un mensaje."}</p>
        )}
      </div>
    </div>
  );
}
