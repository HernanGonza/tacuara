import { ExternalLink, Plus, RefreshCw, Search, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { crmCreate, crmDelete, crmList, crmUpdate, ESTADOS, type Empresa, type Estado } from "@/lib/crm";

const field = "w-full border border-dashed border-ink/55 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-impact";
const small = "border border-dashed border-ink/55 bg-white px-2 py-1 text-xs outline-none focus:border-impact";

const ESTADO_LABEL: Record<Estado, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  respondio: "Respondió",
  visita: "Visita",
  descartado: "Descartado",
};
const ESTADO_STYLE: Record<Estado, string> = {
  nuevo: "bg-white text-ink",
  contactado: "bg-warm text-ink",
  respondio: "bg-accent/40 text-ink",
  visita: "bg-impact text-impact-foreground",
  descartado: "bg-ink/10 text-ink/50",
};

type GroupBy = "zona" | "rubro" | "none";

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).replace(".", "") : "";

/** Iguazú y Posadas primero; el resto por cantidad de empresas. */
function sortZonas(empresas: Empresa[]) {
  const count = new Map<string, number>();
  empresas.forEach((e) => count.set(e.zona, (count.get(e.zona) ?? 0) + 1));
  const first = ["Puerto Iguazú", "Posadas"];
  return [...count.keys()].sort((a, b) => {
    const ia = first.indexOf(a);
    const ib = first.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return (count.get(b) ?? 0) - (count.get(a) ?? 0) || a.localeCompare(b, "es");
  });
}

/** Una línea por empresa: email; nombre; rubro; zona (separados por ; o tab). */
function parseImport(raw: string) {
  const rows: { email: string; nombre: string; rubro?: string; zona?: string }[] = [];
  const invalid: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [email = "", nombre = "", rubro, zona] = line.split(/[;\t]/).map((f) => f.trim());
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && nombre) {
      rows.push({ email, nombre, ...(rubro ? { rubro } : {}), ...(zona ? { zona } : {}) });
    } else invalid.push(line.trim());
  }
  return { rows, invalid };
}

export function Crm({
  password,
  reloadKey,
  onCompose,
}: {
  password: string;
  /** Cambia cuando se registró un envío desde la pestaña Enviar, para refrescar la lista. */
  reloadKey: number;
  /** Lleva las empresas a la pestaña Enviar (con email, nombre, rubro y zona cargados). */
  onCompose: (empresas: Empresa[]) => void;
}) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [zona, setZona] = useState("");
  const [rubro, setRubro] = useState("");
  const [estado, setEstado] = useState<"" | Estado>("");
  const [tamano, setTamano] = useState<"" | "pyme" | "grande">("");
  const [soloSinEnviar, setSoloSinEnviar] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("zona");
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", rubro: "", zona: "", web: "" });
  const [bulk, setBulk] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await crmList({ data: { password } });
      setEmpresas(res.empresas);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la lista.");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const zonas = useMemo(() => sortZonas(empresas), [empresas]);
  const rubros = useMemo(() => [...new Set(empresas.map((e) => e.rubro))].sort((a, b) => a.localeCompare(b, "es")), [empresas]);
  const stats = useMemo(() => {
    const s: Record<Estado, number> = { nuevo: 0, contactado: 0, respondio: 0, visita: 0, descartado: 0 };
    empresas.forEach((e) => (s[e.estado] += 1));
    return s;
  }, [empresas]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return empresas.filter(
      (e) =>
        (!zona || e.zona === zona) &&
        (!rubro || e.rubro === rubro) &&
        (!estado || e.estado === estado) &&
        (!tamano || e.tamano === tamano) &&
        (!soloSinEnviar || e.envios_count === 0) &&
        (!term || `${e.nombre} ${e.email} ${e.rubro} ${e.zona} ${e.notas}`.toLowerCase().includes(term)),
    );
  }, [empresas, q, zona, rubro, estado, tamano, soloSinEnviar]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: "", rows: filtered }];
    const map = new Map<string, Empresa[]>();
    filtered.forEach((e) => {
      const k = groupBy === "zona" ? e.zona : e.rubro;
      map.set(k, [...(map.get(k) ?? []), e]);
    });
    const order = groupBy === "zona" ? zonas : rubros;
    return order.filter((k) => map.has(k)).map((k) => ({ key: k, rows: map.get(k)! }));
  }, [filtered, groupBy, zonas, rubros]);

  // Paginado: se corta la lista ya agrupada/ordenada, así los grupos siguen en orden de una página a la siguiente.
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageStart = safePage * pageSize;
  const pageGroups = useMemo(() => {
    let skip = pageStart;
    let left = pageSize;
    const out: { key: string; rows: Empresa[]; total: number }[] = [];
    for (const g of groups) {
      if (left <= 0) break;
      if (skip >= g.rows.length) {
        skip -= g.rows.length;
        continue;
      }
      const rows = g.rows.slice(skip, skip + left);
      out.push({ key: g.key, rows, total: g.rows.length });
      left -= rows.length;
      skip = 0;
    }
    return out;
  }, [groups, pageStart, pageSize]);

  useEffect(() => setPage(0), [q, zona, rubro, estado, tamano, soloSinEnviar, groupBy, pageSize]);

  function toggle(ids: string[], on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  async function patch(id: string, p: { estado?: Estado; notas?: string }) {
    const before = empresas;
    setEmpresas((prev) => prev.map((e) => (e.id === id ? ({ ...e, ...p } as Empresa) : e)));
    try {
      await crmUpdate({ data: { password, id, patch: p } });
    } catch (e) {
      setEmpresas(before);
      setError(e instanceof Error ? e.message : "No se pudo guardar el cambio.");
    }
  }

  async function remove(id: string) {
    setConfirmDelete(null);
    try {
      await crmDelete({ data: { password, id } });
      setEmpresas((prev) => prev.filter((e) => e.id !== id));
      toggle([id], false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar.");
    }
  }

  async function add(rows: { email: string; nombre: string; rubro?: string; zona?: string; web?: string }[]) {
    setAdding(true);
    setError("");
    setNotice("");
    try {
      const res = await crmCreate({ data: { password, empresas: rows } });
      setNotice(`Se agregaron ${res.created} empresa(s).${res.skipped ? ` ${res.skipped} ya existían (mismo email) y se ignoraron.` : ""}`);
      setForm({ nombre: "", email: "", rubro: "", zona: "", web: "" });
      setBulk("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo agregar.");
    } finally {
      setAdding(false);
    }
  }

  function compose(ids: string[]) {
    const rows = empresas.filter((e) => ids.includes(e.id) && e.estado !== "descartado");
    if (rows.length === 0) return;
    setNotice(rows.length < ids.length ? `${ids.length - rows.length} descartada(s) quedaron afuera.` : "");
    setSelected(new Set());
    onCompose(rows);
  }

  const visibleIds = pageGroups.flatMap((g) => g.rows.map((e) => e.id));
  const allVisible = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const importParsed = useMemo(() => parseImport(bulk), [bulk]);
  const showZona = groupBy !== "zona";
  const showRubro = groupBy !== "rubro";
  const cols = 6 + (showZona ? 1 : 0) + (showRubro ? 1 : 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {ESTADOS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setEstado(estado === s ? "" : s)}
            className={`mono-label ${estado === s ? "text-impact underline" : "text-ink/70 hover:text-ink"}`}
          >
            {ESTADO_LABEL[s]} {stats[s]}
          </button>
        ))}
        <span className="mono-label text-ink/50">Total {empresas.length}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search size={14} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink/50" />
          <input className={`${small} w-48 pl-7`} placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        </label>
        <select className={small} value={zona} onChange={(e) => setZona(e.target.value)} aria-label="Zona">
          <option value="">Todas las zonas</option>
          {zonas.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <select className={small} value={rubro} onChange={(e) => setRubro(e.target.value)} aria-label="Rubro">
          <option value="">Todos los rubros</option>
          {rubros.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select className={small} value={estado} onChange={(e) => setEstado(e.target.value as "" | Estado)} aria-label="Estado">
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {ESTADO_LABEL[s]}
            </option>
          ))}
        </select>
        <select className={small} value={tamano} onChange={(e) => setTamano(e.target.value as "" | "pyme" | "grande")} aria-label="Tamaño">
          <option value="">Pyme y grandes</option>
          <option value="pyme">Solo pymes</option>
          <option value="grande">Solo grandes</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={soloSinEnviar} onChange={(e) => setSoloSinEnviar(e.target.checked)} />
          Sin enviar
        </label>
        <span className="mono-label ml-auto flex items-center gap-1">
          Agrupar
          {(["zona", "rubro", "none"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupBy(g)}
              className={`rounded-full border border-ink/60 px-2.5 py-0.5 normal-case ${groupBy === g ? "bg-ink text-white" : "hover:bg-warm"}`}
            >
              {g === "none" ? "Nada" : g === "zona" ? "Zona" : "Rubro"}
            </button>
          ))}
        </span>
        <button type="button" className="btn-dashed !min-h-8 !px-3 text-xs" onClick={() => setAddOpen((v) => !v)}>
          <Plus size={14} /> Agregar
        </button>
        <button type="button" className="btn-dashed !min-h-8 !px-3 text-xs" onClick={() => void load()} disabled={loading} aria-label="Actualizar">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {addOpen && (
        <div className="grid gap-3 border border-dashed border-ink/55 bg-white p-3 lg:grid-cols-2">
          <form
            className="grid grid-cols-2 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void add([
                {
                  nombre: form.nombre,
                  email: form.email,
                  ...(form.rubro ? { rubro: form.rubro } : {}),
                  ...(form.zona ? { zona: form.zona } : {}),
                  ...(form.web ? { web: form.web } : {}),
                },
              ]);
            }}
          >
            <p className="mono-label col-span-2">Una empresa</p>
            <input className={field} placeholder="Nombre *" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input className={field} type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={field} placeholder="Rubro" list="crm-rubros" value={form.rubro} onChange={(e) => setForm({ ...form, rubro: e.target.value })} />
            <input className={field} placeholder="Zona" list="crm-zonas" value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })} />
            <input className={`${field} col-span-2`} placeholder="Web (opcional)" value={form.web} onChange={(e) => setForm({ ...form, web: e.target.value })} />
            <button className="btn-solid col-span-2 !min-h-9" disabled={adding}>
              Agregar
            </button>
            <datalist id="crm-rubros">
              {rubros.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <datalist id="crm-zonas">
              {zonas.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </form>
          <div className="space-y-2">
            <p className="mono-label">Varias a la vez</p>
            <textarea
              className={`${field} font-mono text-xs`}
              rows={4}
              spellCheck={false}
              placeholder={"info@ferreteria.com; Ferretería El Tornillo; Ferretería; Posadas"}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
            />
            <p className="text-xs text-ink/60">Una por línea: email; nombre; rubro; zona (separado por ; o tab, sirve pegar desde una planilla). Los emails repetidos se ignoran.</p>
            {importParsed.invalid.length > 0 && <p className="text-xs text-destructive">Línea inválida: {importParsed.invalid.join(" | ")}</p>}
            <button
              type="button"
              className="btn-solid !min-h-9"
              disabled={adding || importParsed.rows.length === 0 || importParsed.invalid.length > 0}
              onClick={() => void add(importParsed.rows)}
            >
              Importar {importParsed.rows.length}
            </button>
          </div>
        </div>
      )}

      {(selected.size > 0 || notice || error) && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {selected.size > 0 && (
            <>
              <span className="mono-label">{selected.size} seleccionada(s)</span>
              <button type="button" className="btn-solid !min-h-8 !px-3 text-xs" onClick={() => compose([...selected])}>
                <Send size={14} /> Escribir a {selected.size}
              </button>
              <button type="button" className="underline" onClick={() => setSelected(new Set())}>
                Limpiar selección
              </button>
            </>
          )}
          {notice && <span className="text-impact">{notice}</span>}
          {error && <span className="text-destructive">{error}</span>}
        </div>
      )}

      <div className="min-h-[24rem] flex-1 overflow-auto border border-dashed border-ink/55 bg-white lg:min-h-0">
        <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="mono-label border-b border-dashed border-ink/55 text-ink/70">
              <th className="w-8 px-2 py-1.5">
                <input type="checkbox" aria-label="Seleccionar todas las visibles" checked={allVisible} onChange={(e) => toggle(visibleIds, e.target.checked)} />
              </th>
              <th className="px-2 py-1.5 font-normal">Empresa</th>
              {showRubro && <th className="px-2 py-1.5 font-normal">Rubro</th>}
              {showZona && <th className="px-2 py-1.5 font-normal">Zona</th>}
              <th className="px-2 py-1.5 font-normal">Email</th>
              <th className="px-2 py-1.5 font-normal">Estado</th>
              <th className="px-2 py-1.5 font-normal">Enviado</th>
              <th className="px-2 py-1.5 font-normal">Notas</th>
              <th className="w-20 px-2 py-1.5" />
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 && !loading && (
              <tr>
                <td colSpan={cols + 1} className="px-3 py-8 text-center text-ink/60">
                  {error ? "No se pudo cargar." : "Todavía no hay empresas. Corré la migración con los datos iniciales o agregá algunas."}
                </td>
              </tr>
            )}
            {empresas.length > 0 && filtered.length === 0 && (
              <tr>
                <td colSpan={cols + 1} className="px-3 py-8 text-center text-ink/60">
                  Ninguna empresa coincide con los filtros.
                </td>
              </tr>
            )}
            {pageGroups.map((g) => {
              const ids = g.rows.map((r) => r.id);
              const sentCount = g.rows.filter((r) => r.envios_count > 0).length;
              return (
                <GroupRows
                  key={g.key || "all"}
                  label={g.key}
                  groupBy={groupBy}
                  total={g.total}
                  sentCount={sentCount}
                  allSelected={ids.every((id) => selected.has(id))}
                  onToggle={(on) => toggle(ids, on)}
                  colSpan={cols + 1}
                >
                  {g.rows.map((e) => (
                    <tr key={e.id} className={`border-b border-dashed border-ink/25 align-top hover:bg-warm/50 ${e.estado === "descartado" ? "text-ink/45" : ""}`}>
                      <td className="px-2 py-1.5">
                        <input type="checkbox" aria-label={`Seleccionar ${e.nombre}`} checked={selected.has(e.id)} onChange={(ev) => toggle([e.id], ev.target.checked)} />
                      </td>
                      <td className="max-w-[16rem] px-2 py-1.5">
                        <span className="font-semibold leading-tight">{e.nombre}</span>
                        {e.tamano === "grande" && <span className="mono-label ml-1.5 text-ink/50">grande</span>}
                        {e.web && (
                          <a
                            href={e.web.startsWith("http") ? e.web : `https://${e.web}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="ml-1 inline-block align-middle text-ink/50 hover:text-impact"
                            aria-label={`Abrir web de ${e.nombre}`}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </td>
                      {showRubro && <td className="px-2 py-1.5 text-xs">{e.rubro}</td>}
                      {showZona && <td className="px-2 py-1.5 text-xs">{e.zona}</td>}
                      <td className="max-w-[14rem] break-all px-2 py-1.5 font-mono text-xs">{e.email}</td>
                      <td className="px-2 py-1.5">
                        <select
                          className={`${small} ${ESTADO_STYLE[e.estado]}`}
                          value={e.estado}
                          aria-label={`Estado de ${e.nombre}`}
                          onChange={(ev) => void patch(e.id, { estado: ev.target.value as Estado })}
                        >
                          {ESTADOS.map((s) => (
                            <option key={s} value={s}>
                              {ESTADO_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-xs">
                        {e.envios_count > 0 ? (
                          <span title={`Primer envío: ${fmtDate(e.primer_envio_at)}`}>
                            ✓ {fmtDate(e.ultimo_envio_at)}
                            {e.envios_count > 1 && <span className="text-ink/50"> · {e.envios_count}×</span>}
                          </span>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className="min-w-[10rem] px-2 py-1.5">
                        <input
                          key={`${e.id}-${e.notas}`}
                          className={`${small} w-full`}
                          defaultValue={e.notas}
                          maxLength={2000}
                          aria-label={`Notas de ${e.nombre}`}
                          placeholder="Notas…"
                          onBlur={(ev) => ev.target.value !== e.notas && void patch(e.id, { notas: ev.target.value })}
                        />
                      </td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right">
                        <button
                          type="button"
                          className="inline-grid size-7 place-items-center hover:bg-ink hover:text-white disabled:opacity-30"
                          aria-label={`Escribir mail a ${e.nombre}`}
                          title="Abrir en la pestaña Enviar"
                          disabled={e.estado === "descartado"}
                          onClick={() => compose([e.id])}
                        >
                          <Send size={14} />
                        </button>
                        {confirmDelete === e.id ? (
                          <button type="button" className="ml-1 bg-destructive px-1.5 py-1 text-[0.7rem] text-white" onClick={() => void remove(e.id)} onBlur={() => setConfirmDelete(null)} autoFocus>
                            ¿Borrar?
                          </button>
                        ) : (
                          <button type="button" className="inline-grid size-7 place-items-center hover:bg-destructive hover:text-white" aria-label={`Borrar ${e.nombre}`} onClick={() => setConfirmDelete(e.id)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </GroupRows>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="mono-label">
          {filtered.length === 0 ? "0" : `${pageStart + 1}–${Math.min(pageStart + pageSize, filtered.length)}`} de {filtered.length}
          {filtered.length !== empresas.length ? ` (filtradas, ${empresas.length} en total)` : ""}
        </span>
        <button type="button" className="btn-dashed !min-h-8 !px-3 text-xs" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
          ← Anterior
        </button>
        <span className="mono-label">
          Página {safePage + 1} / {pageCount}
        </span>
        <button type="button" className="btn-dashed !min-h-8 !px-3 text-xs" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
          Siguiente →
        </button>
        <select className={`${small} ml-auto`} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Filas por página">
          {[25, 50, 100, 300].map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function GroupRows({
  label,
  groupBy,
  total,
  sentCount,
  allSelected,
  onToggle,
  colSpan,
  children,
}: {
  label: string;
  groupBy: GroupBy;
  total: number;
  sentCount: number;
  allSelected: boolean;
  onToggle: (on: boolean) => void;
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <>
      {groupBy !== "none" && (
        <tr className="bg-background">
          <td colSpan={colSpan} className="border-y border-dashed border-ink/55 px-2 py-1.5">
            <label className="mono-label flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={(e) => onToggle(e.target.checked)} aria-label={`Seleccionar ${label}`} />
              <span className="display text-base normal-case">{label}</span>
              <span className="text-ink/60">
                {total} empresa(s) · {sentCount} con mail enviado
              </span>
            </label>
          </td>
        </tr>
      )}
      {children}
    </>
  );
}
