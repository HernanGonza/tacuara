import { createServerFn } from "@tanstack/react-start";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { fill, renderEmail } from "./email-template";
import { sendViaGmail } from "./inbox";

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
 * (src/lib/email-template.ts): quien envía solo escribe texto. Sale por Gmail con el alias "Enviar como"
 * hola@tacuara.com.ar (queda en Enviados); las respuestas llegan por ImprovMX a Gmail. Cada destinatario recibe su propio mail.
 * Variables de entorno (solo servidor): MAILER_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN.
 */
export const sendMail = createServerFn({ method: "POST" })
  .inputValidator(mailSchema)
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) throw new Error("Contraseña incorrecta.");

    const emails = data.recipients.map(({ email, ...vars }) => {
      const v = { ...vars, remitente_nombre: data.remitente_nombre, remitente_rol: data.remitente_rol };
      const { html, text } = renderEmail({ body: data.body, preheader: data.preheader, vars: v });
      return {
        to: email,
        subject: fill(data.subject, v).replace(/[\r\n]+/g, " "),
        html,
        text,
        headers: { "Content-Language": "es", "List-Unsubscribe": `<mailto:${CONTACT}?subject=BAJA>` },
      };
    });

    // Uno por uno; Gmail guarda cada copia en Enviados.
    const failed: string[] = [];
    for (const e of emails) {
      try {
        await sendViaGmail(e);
      } catch (err) {
        console.error("[mailer] Gmail no pudo enviar a", e.to, err);
        failed.push(e.to);
      }
    }
    return { ok: true as const, sent: emails.length - failed.length, failed };
  });

const CONTACT = "hola@tacuara.com.ar";

/** Valida la contraseña sin enviar nada (para destrabar la pantalla). */
export const checkMailerPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().max(200) }))
  .handler(async ({ data }) => ({ ok: passwordOk(data.password) }));
