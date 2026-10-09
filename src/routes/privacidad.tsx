import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad | Tacuara" },
      { name: "description", content: "Cómo Tacuara trata los datos personales que recibe a través del sitio y del correo." },
    ],
  }),
  component: Privacidad,
});

function Privacidad() {
  return (
    <LegalPage title="Política de privacidad" updated="9 de octubre de 2026">
      <p>
        Tacuara es una consultora de transformación digital de Misiones, Argentina. Esta política explica qué datos personales tratamos a través de
        www.tacuara.com.ar y de nuestro correo (hola@tacuara.com.ar), para qué los usamos y cómo podés ejercer tus derechos.
      </p>

      <h2>Datos que tratamos</h2>
      <ul>
        <li>
          <strong>Formulario de contacto:</strong> nombre, email y el mensaje que nos escribís.
        </li>
        <li>
          <strong>Correo electrónico:</strong> los mensajes que nos enviás a hola@tacuara.com.ar y nuestras respuestas.
        </li>
        <li>
          <strong>Datos comerciales públicos:</strong> para presentar nuestros servicios a negocios y organizaciones, podemos usar datos de contacto que
          ellos mismos publican (nombre del negocio, rubro, ciudad, email de contacto).
        </li>
      </ul>
      <p>No usamos cookies de seguimiento ni herramientas de publicidad en este sitio.</p>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Responder consultas y mantener la conversación con quien nos escribe.</li>
        <li>Presentar nuestros servicios a negocios y organizaciones, con la posibilidad de darse de baja en cualquier momento.</li>
        <li>Cumplir obligaciones legales y proteger nuestros derechos.</li>
      </ul>
      <p>No vendemos ni alquilamos datos personales, ni los usamos para publicidad de terceros.</p>

      <h2>Herramienta interna de correo y datos de Google</h2>
      <p>
        Tacuara usa una herramienta interna ("Mandador") para enviar y gestionar el correo de hola@tacuara.com.ar. La usa únicamente el equipo de Tacuara y
        se conecta, con autorización expresa, a la cuenta de Gmail del equipo mediante la API de Gmail. A través de ella:
      </p>
      <ul>
        <li>Leemos los mensajes dirigidos a hola@tacuara.com.ar para mostrarlos al equipo.</li>
        <li>Marcamos mensajes como leídos, los archivamos o los enviamos a la papelera, a pedido del equipo.</li>
        <li>No almacenamos el contenido de esos mensajes en nuestros servidores: se consulta en el momento y no se guarda.</li>
        <li>No compartimos esos datos con terceros, no los usamos para publicidad ni para entrenar modelos de inteligencia artificial.</li>
        <li>Solo una persona autorizada del equipo puede acceder, con contraseña.</li>
      </ul>
      <p>
        El uso y la transferencia de la información recibida de las API de Google se ajustan a la{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
          Política de datos de usuario de los servicios de API de Google
        </a>
        , incluidos los requisitos de uso limitado.
      </p>

      <h2>Con quién compartimos datos</h2>
      <p>Para operar el servicio usamos proveedores que tratan datos en nuestro nombre:</p>
      <ul>
        <li>Resend (envío de correo).</li>
        <li>ImprovMX (reenvío de correo del dominio).</li>
        <li>Google (Gmail, almacenamiento del correo).</li>
        <li>Vercel (alojamiento del sitio).</li>
      </ul>
      <p>Algunos de estos proveedores pueden procesar datos fuera de Argentina, con sus propias medidas de seguridad.</p>

      <h2>Conservación</h2>
      <p>
        Conservamos los mensajes mientras dure la relación comercial o la consulta, y luego el tiempo necesario para cumplir obligaciones legales. Si pedís
        la baja, dejamos de escribirte y mantenemos solo lo imprescindible para respetar ese pedido.
      </p>

      <h2>Tus derechos</h2>
      <p>
        De acuerdo con la Ley 25.326 de Protección de Datos Personales, podés acceder a tus datos, rectificarlos, actualizarlos o pedir su supresión. Para
        dejar de recibir mensajes respondé BAJA a cualquier mail nuestro. Para cualquier otro pedido escribinos a{" "}
        <a href="mailto:hola@tacuara.com.ar">hola@tacuara.com.ar</a>.
      </p>
      <p>
        La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control de la Ley 25.326 y atiende denuncias y reclamos por incumplimientos de
        la normativa de protección de datos personales.
      </p>

      <h2>Cambios</h2>
      <p>Podemos actualizar esta política. Publicaremos la versión vigente en esta página, con su fecha de actualización.</p>

      <h2>Contacto</h2>
      <p>
        Tacuara · Misiones, Argentina · <a href="mailto:hola@tacuara.com.ar">hola@tacuara.com.ar</a>
      </p>
    </LegalPage>
  );
}
