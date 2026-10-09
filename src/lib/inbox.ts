import { createServerFn } from "@tanstack/react-start";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { CONTACT_EMAIL, fill, renderFooter } from "./email-template";

/**
 * Bandeja de entrada y envío sobre la API de Gmail: leer, marcar leído, archivar, eliminar y responder/enviar como
 * hola@tacuara.com.ar (alias "Enviar como"; todo queda en Enviados). Los mails a hola@ llegan a consultoratacuara@gmail.com vía ImprovMX.
 * Variables de entorno (solo servidor): MAILER_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * y, opcional, INBOX_QUERY (búsqueda de Gmail; por defecto los mails dirigidos a hola@tacuara.com.ar).
 * El refresh token se obtiene una vez con: node scripts/gmail-token.mjs
 */

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const PAGE_SIZE = 25;

function passwordOk(input: string): boolean {
  const expected = process.env["MAILER_PASSWORD"];
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

let cached: { token: string; exp: number } | undefined;

async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 30_000) return cached.token;
  const id = process.env["GOOGLE_CLIENT_ID"];
  const secret = process.env["GOOGLE_CLIENT_SECRET"];
  const refresh = process.env["GOOGLE_REFRESH_TOKEN"];
  if (!id || !secret || !refresh) {
    throw new Error("La bandeja no está configurada (faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REFRESH_TOKEN).");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: "refresh_token" }),
  });
  if (!res.ok) {
    console.error("[inbox] token", res.status, await res.text());
    throw new Error("Google rechazó las credenciales de la bandeja. Hay que generar el token de nuevo.");
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

async function gmail<T>(path: string, post?: unknown): Promise<T> {
  const res = await fetch(`${GMAIL}${path}`, {
    method: post === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      ...(post === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(post === undefined ? {} : { body: JSON.stringify(post) }),
  });
  if (!res.ok) {
    console.error("[inbox] gmail", res.status, await res.text());
    throw new Error(`Gmail respondió ${res.status}.`);
  }
  return (await res.json()) as T;
}


const b64Lines = (s: string) => (Buffer.from(s, "utf8").toString("base64").match(/.{1,76}/g) ?? []).join("\r\n");
const encodeHeader = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`);

export interface SentCopy {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  inReplyTo?: string | undefined;
  references?: string | undefined;
  threadId?: string | undefined;
  headers?: Record<string, string> | undefined;
}

function buildRaw(m: SentCopy): string {
  const boundary = `tacuara-${crypto.randomUUID()}`;
  const raw = [
    `From: ${m.from}`,
    `To: ${m.to}`,
    `Subject: ${encodeHeader(m.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@tacuara.com.ar>`,
    ...(m.inReplyTo ? [`In-Reply-To: ${m.inReplyTo}`] : []),
    ...(m.references ? [`References: ${m.references}`] : []),
    ...Object.entries(m.headers ?? {}).map(([k, v]) => `${k}: ${v}`),
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64Lines(m.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64Lines(m.html),
    `--${boundary}--`,
    "",
  ].join("\r\n");
  return Buffer.from(raw, "utf8").toString("base64url");
}

const FROM = `Tacuara <${CONTACT_EMAIL}>`;
let aliasOk = false;

/** Falla si hola@tacuara.com.ar no es un alias "Enviar como" verificado: así Gmail nunca cambia el remitente sin avisar. */
async function ensureAlias(): Promise<void> {
  if (aliasOk) return;
  const { sendAs = [] } = await gmail<{ sendAs?: { sendAsEmail: string; verificationStatus?: string }[] }>("/settings/sendAs");
  const alias = sendAs.find((a) => a.sendAsEmail.toLowerCase() === CONTACT_EMAIL);
  if (!alias || (alias.verificationStatus && alias.verificationStatus !== "accepted")) {
    throw new Error(`Gmail no tiene ${CONTACT_EMAIL} como alias "Enviar como" verificado, así que no se envió (saldría con otra dirección).`);
  }
  aliasOk = true;
}

/** Envía el mail por Gmail siempre como hola@tacuara.com.ar (alias "Enviar como"). Gmail ya lo deja en Enviados. */
export async function sendViaGmail(m: Omit<SentCopy, "from">): Promise<void> {
  await ensureAlias();
  await gmail("/messages/send", { raw: buildRaw({ ...m, from: FROM }), ...(m.threadId ? { threadId: m.threadId } : {}) });
}


/** Decodifica encabezados MIME tipo =?UTF-8?B?...?= por si Gmail los devuelve sin decodificar. */
function decodeWords(s: string): string {
  return s.replace(/=\?([\w-]+)\?([BbQq])\?([^?]*)\?=/g, (_m, charset: string, enc: string, text: string) => {
    try {
      const buf =
        enc.toUpperCase() === "B"
          ? Buffer.from(text, "base64")
          : Buffer.from(text.replace(/_/g, " ").replace(/=([0-9A-F]{2})/gi, (_x, h: string) => String.fromCharCode(parseInt(h, 16))), "latin1");
      return new TextDecoder(charset).decode(buf);
    } catch {
      return text;
    }
  });
}

type Header = { name: string; value: string };
type Part = { mimeType?: string; filename?: string; body?: { data?: string }; parts?: Part[] };
type Msg = { id: string; threadId: string; snippet?: string; labelIds?: string[]; internalDate?: string; payload?: Part & { headers?: Header[] } };

const header = (m: Msg, name: string) =>
  decodeWords(m.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "");

const b64 = (data: string) => Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

function collect(part: Part | undefined, out: { html: string; text: string; files: string[] }) {
  if (!part) return;
  if (part.filename) out.files.push(part.filename);
  else if (part.mimeType === "text/html" && part.body?.data) out.html += b64(part.body.data);
  else if (part.mimeType === "text/plain" && part.body?.data) out.text += b64(part.body.data);
  part.parts?.forEach((p) => collect(p, out));
}

/** "Nombre <mail@x.com>" → "mail@x.com" */
const addressOf = (v: string) => /<([^>]+)>/.exec(v)?.[1]?.trim() ?? v.trim();

const auth = z.object({ password: z.string().max(200) });

const META = new URLSearchParams([
  ["format", "metadata"],
  ["metadataHeaders", "From"],
  ["metadataHeaders", "To"],
  ["metadataHeaders", "Subject"],
  ["metadataHeaders", "Date"],
]);

async function gmailItems(q: string, max: number, pageToken?: string) {
  const params = new URLSearchParams({ q, maxResults: String(max) });
  if (pageToken) params.set("pageToken", pageToken);
  const list = await gmail<{ messages?: { id: string }[]; nextPageToken?: string }>(`/messages?${params}`);
  const messages = await Promise.all(
    (list.messages ?? []).map(async ({ id }) => {
      const m = await gmail<Msg>(`/messages/${id}?${META}`);
      return {
        id,
        from: header(m, "From"),
        to: header(m, "To"),
        subject: header(m, "Subject") || "(sin asunto)",
        snippet: m.snippet ?? "",
        date: Number(m.internalDate ?? 0),
        unread: Boolean(m.labelIds?.includes("UNREAD")),
      };
    }),
  );
  return { messages, nextPageToken: list.nextPageToken ?? null };
}

export const listInbox = createServerFn({ method: "POST" })
  .inputValidator(auth.extend({ pageToken: z.string().max(500).optional(), box: z.enum(["recibidos", "enviados"]).default("recibidos") }))
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) throw new Error("Contraseña incorrecta.");
    if (data.box === "enviados") return gmailItems("in:sent", PAGE_SIZE, data.pageToken);
    return gmailItems(process.env["INBOX_QUERY"] ?? "in:inbox to:hola@tacuara.com.ar", PAGE_SIZE, data.pageToken);
  });

export const readMessage = createServerFn({ method: "POST" })
  .inputValidator(auth.extend({ id: z.string().regex(/^[\w-]+$/).max(64) }))
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) throw new Error("Contraseña incorrecta.");
    const m = await gmail<Msg>(`/messages/${data.id}?format=full`);
    const out = { html: "", text: "", files: [] as string[] };
    collect(m.payload, out);
    return {
      id: m.id,
      from: header(m, "From"),
      to: header(m, "To"),
      replyTo: addressOf(header(m, "Reply-To") || header(m, "From")),
      subject: header(m, "Subject") || "(sin asunto)",
      date: Number(m.internalDate ?? 0),
      html: out.html,
      text: out.text || m.snippet || "",
      files: out.files,
    };
  });

const id = z.string().regex(/^[\w-]+$/).max(64);

/** Marcar como leído, archivar o mandar a la papelera (recuperable 30 días desde Gmail). */
export const updateMessage = createServerFn({ method: "POST" })
  .inputValidator(auth.extend({ id, action: z.enum(["read", "archive", "trash"]) }))
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) throw new Error("Contraseña incorrecta.");
    if (data.action === "trash") await gmail(`/messages/${data.id}/trash`, {});
    else await gmail(`/messages/${data.id}/modify`, { removeLabelIds: data.action === "read" ? ["UNREAD"] : ["INBOX", "UNREAD"] });
    return { ok: true as const };
  });

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Responde por Gmail como hola@tacuara.com.ar, dentro del mismo hilo. El destinatario sale del mensaje original, no del cliente. */
export const replyMessage = createServerFn({ method: "POST" })
  .inputValidator(
    auth.extend({
      id,
      body: z.string().trim().min(1).max(10_000),
      remitente_nombre: z.string().trim().max(100).optional(),
      remitente_rol: z.string().trim().max(100).optional(),
    }),
  )
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) throw new Error("Contraseña incorrecta.");
    const m = await gmail<Msg>(`/messages/${data.id}?format=full`);
    const to = z.string().email().safeParse(addressOf(header(m, "Reply-To") || header(m, "From")));
    if (!to.success) throw new Error("No se pudo determinar a quién responder.");
    const out = { html: "", text: "", files: [] as string[] };
    collect(m.payload, out);
    const original = (out.text || m.snippet || "").trim().slice(0, 2000);
    const subject = header(m, "Subject") || "(sin asunto)";
    const messageId = header(m, "Message-ID") || header(m, "Message-Id");
    const refs = [header(m, "References"), messageId].filter(Boolean).join(" ");

    const vars = { remitente_nombre: data.remitente_nombre, remitente_rol: data.remitente_rol };
    const paragraphs = esc(data.body).replace(/\n/g, "<br>");
    const html = `<!DOCTYPE html><html lang="es"><body lang="es" style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#161A11;"><div style="max-width:600px;">${paragraphs}<div style="height:16px;"></div>${fill(renderFooter(), vars, true)}${
      original ? `<blockquote style="margin:24px 0 0;padding:0 0 0 12px;border-left:2px solid #9AA48F;color:#5B6652;font-size:13px;line-height:19px;">${esc(original).replace(/\n/g, "<br>")}</blockquote>` : ""
    }</div></body></html>`;
    const text = `${data.body}\n\n--\n${fill("{{remitente_nombre}}\n{{remitente_rol}} · Tacuara", vars)}\n${CONTACT_EMAIL}\nwww.tacuara.com.ar${original ? `\n\n> ${original.replace(/\n/g, "\n> ")}` : ""}\n`;

    const finalSubject = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
    const copy: Omit<SentCopy, "from"> = {
      to: to.data,
      subject: finalSubject,
      html,
      text,
      inReplyTo: messageId || undefined,
      references: refs || undefined,
      threadId: m.threadId,
      headers: { "Content-Language": "es" },
    };

    await sendViaGmail(copy);
    return { ok: true as const, to: to.data };
  });
