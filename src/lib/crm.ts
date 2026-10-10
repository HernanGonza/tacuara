import { createServerFn } from "@tanstack/react-start";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { fill, renderEmail } from "./email-template";
import { sendViaGmail } from "./inbox";

/**
 * Mini CRM de empresas (pestaña "Empresas" de /enviar). Los datos viven en Supabase (tablas public.empresas y
 * public.envios, ver supabase/migrations). El acceso es SOLO desde el servidor: las tablas tienen RLS sin políticas,
 * así que la clave pública (anon) no puede leer ni escribir nada. Se usa la clave secreta (service_role).
 * Variables de entorno (solo servidor): SUPABASE_URL, SUPABASE_SECRET_KEY, MAILER_PASSWORD (+ las de Google para enviar).
 */

export const ESTADOS = ["nuevo", "contactado", "respondio", "visita", "descartado"] as const;
export type Estado = (typeof ESTADOS)[number];

export interface Empresa {
  id: string;
  nombre: string;
  rubro: string;
  zona: string;
  email: string;
  web: string | null;
  tamano: "pyme" | "grande";
  fuente: string | null;
  estado: Estado;
  notas: string;
  envios_count: number;
  primer_envio_at: string | null;
  ultimo_envio_at: string | null;
  created_at: string;
}

const MAX_SEND = 50;

function passwordOk(input: string): boolean {
  const expected = process.env["MAILER_PASSWORD"];
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function assertAuth(password: string) {
  if (!passwordOk(password)) throw new Error("Contraseña incorrecta.");
}

async function db<T>(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  const base = process.env["SUPABASE_URL"]?.replace(/\/+$/, "");
  const key = process.env["SUPABASE_SECRET_KEY"];
  if (!base || !key) throw new Error("La base de datos no está configurada (faltan SUPABASE_URL o SUPABASE_SECRET_KEY).");
  const res = await fetch(`${base}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      apikey: key,
      // Las claves nuevas (sb_secret_...) no son JWT: solo van en apikey. Las viejas (service_role) también como Bearer.
      ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      "Content-Type": "application/json",
      Prefer: init.prefer ?? "return=representation",
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("[crm] supabase", res.status, text);
    if (res.status === 409) throw new Error("Ya existe una empresa con ese email.");
    throw new Error(`La base respondió ${res.status}.`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : []) as T;
}

const auth = z.object({ password: z.string().max(200) });
const text = (max: number) => z.string().trim().max(max);
const emailField = z.string().trim().toLowerCase().email().max(200);

const empresaInput = z.object({
  nombre: text(200).min(1),
  email: emailField,
  rubro: text(100).optional(),
  zona: text(100).optional(),
  web: text(300).optional(),
  tamano: z.enum(["pyme", "grande"]).optional(),
  fuente: text(200).optional(),
  notas: text(2000).optional(),
});

const clean = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

export const crmList = createServerFn({ method: "POST" })
  .inputValidator(auth)
  .handler(async ({ data }) => {
    assertAuth(data.password);
    const empresas = await db<Empresa[]>("empresas?select=*&order=zona.asc,rubro.asc,nombre.asc&limit=5000");
    return { empresas };
  });

export const crmCreate = createServerFn({ method: "POST" })
  .inputValidator(auth.extend({ empresas: z.array(empresaInput).min(1).max(500) }))
  .handler(async ({ data }) => {
    assertAuth(data.password);
    // Duplicados (por email) se ignoran en vez de cortar toda la carga.
    const rows = data.empresas.map((e) => clean({ ...e, fuente: e.fuente ?? "Carga manual" }));
    const created = await db<Empresa[]>("empresas?on_conflict=email", {
      method: "POST",
      body: rows,
      prefer: "return=representation,resolution=ignore-duplicates",
    });
    return { created: created.length, skipped: rows.length - created.length };
  });

export const crmUpdate = createServerFn({ method: "POST" })
  .inputValidator(
    auth.extend({
      id: z.string().uuid(),
      patch: empresaInput.partial().extend({ estado: z.enum(ESTADOS).optional() }),
    }),
  )
  .handler(async ({ data }) => {
    assertAuth(data.password);
    const body = Object.fromEntries(Object.entries(data.patch).filter(([, v]) => v !== undefined));
    if (!Object.keys(body).length) return { empresa: null };
    const [empresa] = await db<Empresa[]>(`empresas?id=eq.${data.id}`, { method: "PATCH", body });
    return { empresa: empresa ?? null };
  });

export const crmDelete = createServerFn({ method: "POST" })
  .inputValidator(auth.extend({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    assertAuth(data.password);
    await db(`empresas?id=eq.${data.id}`, { method: "DELETE", prefer: "return=minimal" });
    return { ok: true as const };
  });

/**
 * Envía el mismo mensaje (con {{nombre_negocio}}, {{rubro}} y {{ciudad}} completados por empresa) a las empresas elegidas,
 * y deja registrado el envío. Las "descartado" se saltean. Una "nuevo" pasa a "contactado".
 */
export const crmSend = createServerFn({ method: "POST" })
  .inputValidator(
    auth.extend({
      ids: z.array(z.string().uuid()).min(1).max(MAX_SEND),
      subject: text(200).min(1),
      body: text(10_000).min(1),
      preheader: text(200).optional(),
      remitente_nombre: text(100).optional(),
      remitente_rol: text(100).optional(),
    }),
  )
  .handler(async ({ data }) => {
    assertAuth(data.password);
    const empresas = await db<Empresa[]>(`empresas?id=in.(${data.ids.join(",")})&select=*`);
    const sent: string[] = [];
    const failed: string[] = [];
    const skipped: string[] = [];

    for (const e of empresas) {
      if (e.estado === "descartado") {
        skipped.push(e.nombre);
        continue;
      }
      const vars = {
        nombre_negocio: e.nombre,
        rubro: e.rubro,
        ciudad: e.zona,
        remitente_nombre: data.remitente_nombre,
        remitente_rol: data.remitente_rol,
      };
      const subject = fill(data.subject, vars).replace(/[\r\n]+/g, " ");
      const { html, text: plain } = renderEmail({ body: data.body, preheader: data.preheader, vars });
      let error: string | null = null;
      try {
        await sendViaGmail({
          to: e.email,
          subject,
          html,
          text: plain,
          headers: { "Content-Language": "es", "List-Unsubscribe": "<mailto:hola@tacuara.com.ar?subject=BAJA>" },
        });
      } catch (err) {
        console.error("[crm] Gmail no pudo enviar a", e.email, err);
        error = err instanceof Error ? err.message : "Error de envío";
      }
      // El registro no debe tumbar el resultado: el mail ya salió (o falló) y eso es lo que importa mostrar.
      try {
        await db("envios", {
          method: "POST",
          body: { empresa_id: e.id, asunto: subject, ok: error === null, error },
          prefer: "return=minimal",
        });
        if (error === null) {
          const now = new Date().toISOString();
          await db(`empresas?id=eq.${e.id}`, {
            method: "PATCH",
            body: {
              envios_count: e.envios_count + 1,
              ultimo_envio_at: now,
              primer_envio_at: e.primer_envio_at ?? now,
              ...(e.estado === "nuevo" ? { estado: "contactado" } : {}),
            },
            prefer: "return=minimal",
          });
        }
      } catch (err) {
        console.error("[crm] no se pudo registrar el envío de", e.email, err);
      }
      (error === null ? sent : failed).push(e.nombre);
    }
    return { sent, failed, skipped };
  });
