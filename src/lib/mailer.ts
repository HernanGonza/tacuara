import { createServerFn } from "@tanstack/react-start";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { fill, renderEmail } from "./email-template";

const MAX_RECIPIENTS = 50;

const recipient = z.object({
  email: z.string().trim().email().max(200),
  nombre_negocio: z.string().trim().max(200).optional(),
  rubro: z.string().trim().max(100).optional(),
  ciudad: z.string().trim().max(100).optional(),
});

const mailSchema = z.object({
  password: z.string().max(200),
  recipients: z.array(recipient).min(1).max(MAX_RECIPIENTS),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
  preheader: z.string().trim().max(200).optional(),
  remitente_nombre: z.string().trim().max(100).optional(),
  remitente_rol: z.string().trim().max(100).optional(),
});

function passwordOk(input: string): boolean {
  const expected = process.env["MAILER_PASSWORD"];
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Mandador interno (ruta oculta /enviar). El servidor arma el HTML con la plantilla fija
 * (src/lib/email-template.ts): quien envía solo escribe texto. Sale como hola@tacuara.com.ar por Resend;
 * las respuestas llegan por ImprovMX a Gmail. Cada destinatario recibe su propio mail.
 * Variables de entorno (solo servidor): RESEND_API_KEY, MAILER_PASSWORD (obligatorias), MAILER_FROM (opcional).
 */
export const sendMail = createServerFn({ method: "POST" })
  .inputValidator(mailSchema)
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) throw new Error("Contraseña incorrecta.");

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) throw new Error("Falta RESEND_API_KEY en el servidor.");

    const from = process.env["MAILER_FROM"] ?? "Tacuara <hola@tacuara.com.ar>";
    const emails = data.recipients.map(({ email, ...vars }) => {
      const v = { ...vars, remitente_nombre: data.remitente_nombre, remitente_rol: data.remitente_rol };
      const { html, text } = renderEmail({ body: data.body, preheader: data.preheader, vars: v });
      return {
        from,
        to: [email],
        reply_to: CONTACT,
        subject: fill(data.subject, v).replace(/[\r\n]+/g, " "),
        html,
        text,
        headers: { "Content-Language": "es", "List-Unsubscribe": `<mailto:${CONTACT}?subject=BAJA>` },
      };
    });

    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(emails),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[mailer] Resend respondió", res.status, body);
      throw new Error(`Resend rechazó el envío (${res.status}): ${body.slice(0, 300)}`);
    }
    return { ok: true as const, sent: emails.length };
  });

const CONTACT = "hola@tacuara.com.ar";

/** Valida la contraseña sin enviar nada (para destrabar la pantalla). */
export const checkMailerPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().max(200) }))
  .handler(async ({ data }) => ({ ok: passwordOk(data.password) }));
