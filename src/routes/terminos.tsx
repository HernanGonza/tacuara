import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y condiciones | Tacuara" },
      { name: "description", content: "Condiciones de uso del sitio y de la comunicación con Tacuara." },
      { property: "og:url", content: "https://www.tacuara.com.ar/terminos" },
    ],
    links: [{ rel: "canonical", href: "https://www.tacuara.com.ar/terminos" }],
  }),
  component: Terminos,
});

function Terminos() {
  return (
    <LegalPage title="Términos y condiciones" updated="9 de octubre de 2026">
      <p>
        Estos términos regulan el uso de www.tacuara.com.ar y la comunicación con Tacuara, consultora de transformación digital de Misiones, Argentina. Al
        usar el sitio aceptás estas condiciones.
      </p>

      <h2>El sitio</h2>
      <p>
        El sitio presenta información sobre nuestros servicios (diseño, software, datos, procesos y capacitación). El contenido es informativo y no
        constituye una oferta vinculante. Podemos modificarlo o retirarlo en cualquier momento.
      </p>

      <h2>Consultas y servicios</h2>
      <p>
        Enviar una consulta por el formulario o por correo no genera por sí solo una relación contractual. Los servicios se contratan mediante una propuesta o
        un acuerdo particular entre las partes, que fija alcances, plazos y condiciones económicas.
      </p>

      <h2>Comunicaciones comerciales</h2>
      <p>
        Podemos escribir a negocios y organizaciones para presentar nuestros servicios. Todos nuestros mensajes incluyen la forma de darse de baja:
        respondiendo BAJA dejamos de escribirte. Los datos se tratan según nuestra <a href="/privacidad">política de privacidad</a>.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        La marca, el logo, los textos, el diseño y las ilustraciones del sitio pertenecen a Tacuara o se usan con autorización. No pueden reproducirse ni
        utilizarse sin permiso previo y por escrito.
      </p>

      <h2>Uso adecuado</h2>
      <p>
        No está permitido usar el sitio para actividades ilícitas, intentar acceder sin autorización a sus sistemas, enviar spam a través del formulario ni
        interferir con su funcionamiento.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Hacemos lo posible por mantener el sitio disponible y la información actualizada, pero se ofrece "tal cual", sin garantía de disponibilidad
        continua. Tacuara no responde por daños derivados del uso del sitio ni por contenido de sitios de terceros enlazados.
      </p>

      <h2>Herramientas internas</h2>
      <p>
        Las herramientas internas de gestión de correo de Tacuara son de uso exclusivo del equipo y no están disponibles al público. Su tratamiento de datos
        se describe en la <a href="/privacidad">política de privacidad</a>.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Para cualquier controversia, las partes se someten a los tribunales ordinarios de
        la provincia de Misiones, salvo que la ley disponga otra jurisdicción.
      </p>

      <h2>Contacto</h2>
      <p>
        <a href="mailto:hola@tacuara.com.ar">hola@tacuara.com.ar</a>
      </p>
    </LegalPage>
  );
}
