/**
 * Plantilla del mail de presentación en frío. Función pura (sin imports) para usarla igual
 * en el servidor, en la vista previa del mandador y en scripts/build-email.ts.
 *
 * Variables: {{nombre_negocio}}, {{rubro}}, {{ciudad}} (+ {{remitente_nombre}}, {{remitente_rol}}).
 * Fallback propio con {{variable|texto}}; si no, se usa el de DEFAULTS.
 */

export const SITE_URL = "https://www.tacuara.com.ar";
export const LOGO_URL = `${SITE_URL}/email/tacuara-mark.png`;
export const HEADER_URL = `${SITE_URL}/email/header.png`;
export const CONTACT_EMAIL = "hola@tacuara.com.ar";
/** Teléfono/WhatsApp para la firma, ej. "+54 9 376 000 0000". Vacío = no se muestra. */
export const CONTACT_PHONE: string = "";

export const DEFAULTS: Record<string, string> = {
  nombre_negocio: "tu negocio",
  rubro: "tu rubro",
  ciudad: "tu zona",
  remitente_nombre: "Equipo Tacuara",
  remitente_rol: "Equipo comercial",
};

export const DEFAULT_SUBJECTS = [
  "Una idea para ordenar lo digital en {{nombre_negocio}}",
  "Una pregunta sobre {{nombre_negocio}}",
  "Tecnología y datos para negocios de {{rubro}}",
  "Hola desde Tacuara, Misiones",
  "¿Hablamos 15 minutos, {{nombre_negocio}}?",
];

export const DEFAULT_PREHEADER = "Un solo equipo para diseño, software, datos y procesos. Sin vueltas.";

export const DEFAULT_BODY = `Hola, {{nombre_negocio|equipo}}:

Somos Tacuara, una consultora de Misiones. Ayudamos a negocios de {{rubro}} en {{ciudad}} a ordenar su parte digital con un solo equipo, sin coordinar cinco proveedores distintos.

Muchos comercios pierden tiempo en tareas manuales, información dispersa y una presencia online que no los representa. Eso es lo que resolvemos:

- Sitios y software a medida, sin plantillas forzadas
- Datos y tableros para decidir con evidencia, no con intuición
- Rediseño de procesos: menos pasos manuales, roles claros

Primero escuchamos tu proyecto, después diagnosticamos y entregamos de a poco, con seguimiento. Al final te dejamos documentación y formación para que puedas seguir sin nosotros.

Si te interesa, respondé este mail y coordinamos una charla corta, sin compromiso.`;

export type EmailVars = Partial<
  Record<"nombre_negocio" | "rubro" | "ciudad" | "remitente_nombre" | "remitente_rol", string | undefined>
>;

const TOKEN = /\{\{\s*(\w+)\s*(?:\|([^}]*))?\}\}/g;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Reemplaza los {{tokens}}. Con vars = undefined deja los tokens tal cual (para los archivos estáticos).
 * En modo html el fallback ya viene escapado (salió de escapar el texto), solo se escapa el valor.
 */
export function fill(str: string, vars: EmailVars | undefined, html = false): string {
  if (!vars) return str;
  return str.replace(TOKEN, (_m, key: string, fb?: string) => {
    let value = (vars as Record<string, string | undefined>)[key]?.trim();
    if (value && key === "rubro") value = value.toLowerCase();
    if (value) return html ? esc(value) : value;
    const fallback = fb?.trim() || (html ? esc(DEFAULTS[key] ?? "") : (DEFAULTS[key] ?? ""));
    return fallback;
  });
}

type Block = { kind: "p"; lines: string[] } | { kind: "ul"; items: string[] };

/** Texto plano → bloques: párrafos separados por línea en blanco; líneas con "- " son viñetas. */
function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of body.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/)) {
    let current: Block | undefined;
    for (const raw of chunk.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const bullet = /^[-•*]\s+(.*)$/.exec(line);
      if (bullet) {
        if (current?.kind !== "ul") blocks.push((current = { kind: "ul", items: [] }));
        current.items.push(bullet[1]!);
      } else {
        if (current?.kind !== "p") blocks.push((current = { kind: "p", lines: [] }));
        current.lines.push(line);
      }
    }
  }
  return blocks;
}

const C = {
  ink: "#161A11",
  mute: "#5B6652",
  green: "#27500A",
  accent: "#639922",
  paper: "#EEF4E2",
  white: "#FFFFFF",
  line: "#9AA48F",
};
const SANS = "'Inter Tight', Arial, Helvetica, sans-serif";
const MONO = "'IBM Plex Mono', 'Courier New', Courier, monospace";

function bodyHtml(body: string): string {
  return parseBody(body)
    .map((b) => {
      if (b.kind === "p") {
        return `<tr><td class="tx" style="padding:0 0 16px 0;font-family:${SANS};font-size:17px;line-height:26px;color:${C.ink};">${b.lines.map(esc).join("<br>")}</td></tr>`;
      }
      const items = b.items
        .map(
          (i) =>
            `<tr><td width="22" valign="top" style="padding:0 0 10px 0;font-family:${MONO};font-size:14px;line-height:26px;color:${C.accent};">&#9632;</td><td class="tx" valign="top" style="padding:0 0 10px 0;font-family:${SANS};font-size:17px;line-height:26px;color:${C.ink};">${esc(i)}</td></tr>`,
        )
        .join("");
      return `<tr><td style="padding:0 0 8px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table></td></tr>`;
    })
    .join("\n");
}

/** Pie / firma: fragmento autocontenido con CSS inline, reutilizable fuera del mail. */
export function renderFooter(): string {
  const contact: string[] = [
    `<a href="mailto:${CONTACT_EMAIL}" style="color:${C.green};text-decoration:none;">${CONTACT_EMAIL}</a>`,
  ];
  if (CONTACT_PHONE) {
    const wa = CONTACT_PHONE.replace(/\D/g, "");
    contact.push(`<a href="https://wa.me/${wa}" style="color:${C.green};text-decoration:none;">${esc(CONTACT_PHONE)}</a>`);
  }
  contact.push(`<a href="${SITE_URL}" style="color:${C.green};text-decoration:none;">www.tacuara.com.ar</a>`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
<tr><td style="padding:24px 0 0 0;border-top:1px dashed ${C.line};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td>
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>
<td class="logo-cell" width="64" valign="top" style="padding:0 18px 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;border:1px solid ${C.line};padding:4px;"><img src="${LOGO_URL}" width="56" height="56" alt="Tacuara" style="display:block;width:56px;height:56px;border:0;outline:none;text-decoration:none;"></td></tr></table>
</td>
<td valign="top" style="font-family:${SANS};font-size:15px;line-height:22px;color:${C.ink};">
<div class="tx" style="font-size:17px;line-height:22px;font-weight:700;color:${C.ink};">{{remitente_nombre}}</div>
<div class="tx-mute" style="font-family:${MONO};font-size:12px;line-height:20px;letter-spacing:1px;text-transform:uppercase;color:${C.mute};">{{remitente_rol}} &middot; Tacuara</div>
<div style="padding-top:8px;">${contact.join(`<span style="color:${C.line};"> &nbsp;/&nbsp; </span>`)}</div>
</td>
</tr>
</table>
</td></tr>
<tr><td class="tx-mute" style="padding:20px 0 0 0;font-family:${MONO};font-size:11px;line-height:18px;color:${C.mute};">Tacuara &middot; Transformaci&oacute;n digital &middot; Misiones, Argentina<br>Si no quer&eacute;s recibir m&aacute;s mensajes, respond&eacute; BAJA.</td></tr>
</table>`;
}

export interface RenderInput {
  body: string;
  preheader?: string | undefined;
  /** Si es undefined, los {{tokens}} quedan literales (archivos estáticos). */
  vars?: EmailVars;
}

export function renderEmail({ body, preheader = DEFAULT_PREHEADER, vars }: RenderInput): { html: string; text: string } {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quiero saber más")}`;
  const html = `<!DOCTYPE html>
<html lang="es" xml:lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Language" content="es">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Tacuara</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;700&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
  @media only screen and (max-width:620px) {
    .container { width:100% !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .cta a { display:block !important; }
  }
  @media (prefers-color-scheme: dark) {
    .bg-page { background-color:#0E120A !important; }
    .bg-card { background-color:#1A2114 !important; }
    .tx { color:#EEF4E2 !important; }
    .tx-mute { color:#B4BEA8 !important; }
    .bd { border-color:#4A5640 !important; }
    .cta-cell { background-color:#639922 !important; }
    .cta-link { color:#0E120A !important; }
    a { color:#9BD24F !important; }
  }
  [data-ogsc] .bg-page { background-color:#0E120A !important; }
  [data-ogsc] .bg-card { background-color:#1A2114 !important; }
  [data-ogsc] .tx { color:#EEF4E2 !important; }
  [data-ogsc] .tx-mute { color:#B4BEA8 !important; }
</style>
</head>
<body class="bg-page" lang="es" style="margin:0;padding:0;background-color:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.paper};opacity:0;">${esc(preheader)}${"&zwnj;&nbsp;".repeat(60)}</div>
<table role="presentation" class="bg-page" lang="es" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper}" style="background-color:${C.paper};">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="container bg-card bd" lang="es" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.white}" style="width:100%;max-width:600px;background-color:${C.white};border:1px dashed ${C.line};">
<tr><td style="font-size:0;line-height:0;"><img src="${HEADER_URL}" width="600" height="280" alt="Tacuara: un solo equipo. Tu proyecto, bien sostenido." style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;font-family:${SANS};font-size:20px;line-height:26px;font-weight:700;color:${C.green};"></td></tr>
<tr><td class="px" style="padding:32px 40px 8px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${bodyHtml(body)}
<tr><td class="cta" style="padding:12px 0 8px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="cta-cell" bgcolor="${C.green}" style="background-color:${C.green};padding:14px 26px;"><a class="cta-link" href="${mailto}" style="font-family:${SANS};font-size:16px;line-height:20px;font-weight:700;color:#FFFFFF;text-decoration:none;display:inline-block;">Respond&eacute; este mail &rarr;</a></td>
</tr></table>
</td></tr>
</table>
</td></tr>
<tr><td class="px" style="padding:24px 40px 32px 40px;">
${renderFooter()}
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;

  const text = `${body.replace(/\r\n?/g, "\n").trim()}

--
{{remitente_nombre}}
{{remitente_rol}} · Tacuara
${CONTACT_EMAIL}${CONTACT_PHONE ? `\n${CONTACT_PHONE}` : ""}
www.tacuara.com.ar
Tacuara · Transformación digital · Misiones, Argentina

Si no querés recibir más mensajes, respondé BAJA.
`;

  return { html: fill(html, vars, true), text: fill(text, vars, false) };
}

/** Palabras del cuerpo (sin viñetas "- ", sin tokens expandidos), para controlar el largo. */
export const countWords = (s: string) => s.replace(/^[-•*]\s+/gm, "").split(/\s+/).filter(Boolean).length;
