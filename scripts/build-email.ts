// Genera emails/presentacion/*. Uso: node scripts/build-email.ts
import { mkdirSync, writeFileSync } from "node:fs";
import {
  DEFAULT_BODY,
  DEFAULT_SUBJECTS,
  DEFAULT_PREHEADER,
  LOGO_URL,
  countWords,
  renderEmail,
  renderFooter,
} from "../src/lib/email-template.ts";

const out = new URL("../emails/presentacion/", import.meta.url);
mkdirSync(out, { recursive: true });

const stat = renderEmail({ body: DEFAULT_BODY });
const sample = renderEmail({
  body: DEFAULT_BODY,
  vars: { nombre_negocio: "Ferretería El Tornillo", rubro: "Ferretería", ciudad: "Posadas", remitente_nombre: "Hernán González", remitente_rol: "Socio fundador" },
});
const empty = renderEmail({ body: DEFAULT_BODY, vars: {} });

writeFileSync(new URL("email.html", out), stat.html);
writeFileSync(new URL("email.txt", out), stat.text);
writeFileSync(new URL("footer.html", out), renderFooter());
writeFileSync(new URL("asuntos.txt", out), DEFAULT_SUBJECTS.join("\n") + `\n\nPreheader (${DEFAULT_PREHEADER.length} caracteres):\n${DEFAULT_PREHEADER}\n`);

const iframe = (src: string, w: number) =>
  `<iframe style="width:${w}px;height:1250px;border:1px solid #9AA48F;background:#fff" srcdoc="${src.replaceAll(LOGO_URL, "../../public/email/tacuara-mark.png").replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"></iframe>`;
writeFileSync(
  new URL("preview.html", out),
  `<!DOCTYPE html><html lang="es"><meta charset="utf-8"><title>Preview</title>
<body style="margin:0;padding:24px;background:#ddd;font-family:Arial,sans-serif">
<h3>Desktop (con datos) · Mobile (con datos) · Mobile (sin datos, fallbacks)</h3>
<div style="display:flex;gap:24px;align-items:flex-start">${iframe(sample.html, 660)}${iframe(sample.html, 375)}${iframe(empty.html, 375)}</div></body></html>`,
);

console.log("palabras del cuerpo:", countWords(DEFAULT_BODY), "| html:", (Buffer.byteLength(stat.html) / 1024).toFixed(1), "KB | preheader:", DEFAULT_PREHEADER.length);
