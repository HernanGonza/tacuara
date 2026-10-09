import { createServerFn } from "@tanstack/react-start";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const MAX_RECIPIENTS = 50;

const mailSchema = z.object({
  password: z.string().max(200),
  to: z.array(z.string().trim().email().max(200)).min(1).max(MAX_RECIPIENTS),
  subject: z.string().trim().min(1).max(200),
  html: z.string().min(1).max(300_000),
  text: z.string().max(100_000).optional(),
});

function passwordOk(input: string): boolean {
  const expected = process.env["MAILER_PASSWORD"];
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Mandador interno (ruta oculta /enviar). Sale como hola@tacuara.com.ar por Resend; las respuestas
 * llegan por ImprovMX a Gmail. Cada destinatario recibe su propio mail (nadie ve a los demás).
 * Variables de entorno (solo servidor): RESEND_API_KEY, MAILER_PASSWORD (obligatorias), MAILER_FROM (opcional).
 */
export const sendMail = createServerFn({ method: "POST" })
  .inputValidator(mailSchema)
  .handler(async ({ data }) => {
    if (!passwordOk(data.password)) throw new Error("Contraseña incorrecta.");

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) throw new Error("Falta RESEND_API_KEY en el servidor.");

    const from = process.env["MAILER_FROM"] ?? "Tacuara <hola@tacuara.com.ar>";
    const subject = data.subject.replace(/[\r\n]+/g, " ");
    const emails = data.to.map((to) => ({
      from,
      to: [to],
      reply_to: "hola@tacuara.com.ar",
      subject,
      html: data.html,
      ...(data.text ? { text: data.text } : {}),
      headers: { "List-Unsubscribe": "<mailto:hola@tacuara.com.ar?subject=BAJA>" },
    }));

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

/** Valida la contraseña sin enviar nada (para destrabar la pantalla). */
export const checkMailerPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().max(200) }))
  .handler(async ({ data }) => ({ ok: passwordOk(data.password) }));
