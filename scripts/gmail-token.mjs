// Obtiene el GOOGLE_REFRESH_TOKEN para la bandeja (una sola vez).
// Uso: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/gmail-token.mjs
// Requiere un cliente OAuth de tipo "Aplicación de escritorio" con la API de Gmail habilitada.
import { createServer } from "node:http";

const id = process.env.GOOGLE_CLIENT_ID;
const secret = process.env.GOOGLE_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.");
  process.exit(1);
}
const port = 53682;
const redirect = `http://localhost:${port}`;
const url =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: id,
    redirect_uri: redirect,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.modify",
    access_type: "offline",
    prompt: "consent",
  });
console.log("\nAbrí este link, elegí la cuenta de Gmail donde llega hola@tacuara.com.ar y aceptá:\n\n" + url + "\n");

const server = createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get("code");
  if (!code) return void res.end("Esperando…");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: "authorization_code" }),
  });
  const json = await r.json();
  res.end(json.refresh_token ? "Listo, volvé a la terminal." : "Error, mirá la terminal.");
  console.log(json.refresh_token ? `GOOGLE_REFRESH_TOKEN=${json.refresh_token}` : json);
  server.close();
});
server.listen(port);
