import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  mensaje: z.string().trim().min(1).max(5000),
  // Campo trampa: los humanos no lo ven ni lo completan.
  web: z.string().max(200).optional(),
});

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Envía la consulta del formulario a hola@tacuara.com.ar (alias de ImprovMX → Gmail) usando Resend.
 * Variables de entorno (solo servidor): RESEND_API_KEY (obligatoria), CONTACT_TO y CONTACT_FROM (opcionales).
 */
export const sendContact = createServerFn({ method: "POST" })
  .inputValidator(contactSchema)
  .handler(async ({ data }) => {
    if (data.web) return { ok: true as const }; // bot: se descarta en silencio

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      console.error("[contact] Falta RESEND_API_KEY");
      throw new Error("El envío no está configurado.");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env["CONTACT_FROM"] ?? "Tacuara Web <web@tacuara.com.ar>",
        to: [process.env["CONTACT_TO"] ?? "hola@tacuara.com.ar"],
        reply_to: data.email,
        subject: `Consulta de ${data.nombre.replace(/[\r\n]+/g, " ")}`,
        text: `${data.mensaje}\n\n—\n${data.nombre} <${data.email}>`,
        html: `<p>${escapeHtml(data.mensaje).replace(/\n/g, "<br>")}</p><hr><p><b>${escapeHtml(data.nombre)}</b> &lt;${escapeHtml(data.email)}&gt;</p>`,
      }),
    });

    if (!res.ok) {
      console.error("[contact] Resend respondió", res.status, await res.text());
      throw new Error("No se pudo enviar el mensaje.");
    }
    return { ok: true as const };
  });
