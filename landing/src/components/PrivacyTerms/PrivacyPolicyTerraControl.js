// PrivacyPolicyTerraControl.jsx
import React from "react";

export default function PrivacyPolicyTerraControl() {
  return (
    <article lang="es" className="policy-container">
      <style>{`
        .policy-container { max-width: 880px; margin: 0 auto; padding: 2rem 1.25rem; line-height: 1.7; color: #1f2937; }
        .policy-title { font-size: clamp(1.5rem, 2vw + 1rem, 2.25rem); font-weight: 800; margin: 0 0 .5rem; color: #0f172a; }
        .policy-meta { color: #475569; margin: 0 0 1.25rem; }
        .policy-toc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin: 1.5rem 0; }
        .policy-toc h2 { font-size: 1rem; margin: 0 0 .5rem; color: #334155; }
        .policy-toc ol { margin: 0; padding-left: 1.25rem; }
        .policy-section { margin: 2rem 0; }
        .policy-section h3 { font-size: 1.125rem; margin: 0 0 .5rem; color: #111827; }
        .policy-section p { margin: .5rem 0; }
        .policy-list { padding-left: 1.25rem; }
        .policy-footer { margin-top: 2rem; font-weight: 600; }
        .muted { color: #64748b; }
        a.anchor { text-decoration: none; color: inherit; }
        .divider { height: 1px; background: #e5e7eb; margin: 1.5rem 0; border: 0; }
      `}</style>

      <header>
        <h1 className="policy-title">Políticas de privacidad y términos de uso</h1>
        <p className="policy-meta"><strong>Última actualización:</strong> 7/7/2023</p>
        <p>
          Esta política de privacidad y términos de uso (“política”) establece los lineamientos y condiciones para el uso de la aplicación móvil TerraControl y describe como se recopila, utiliza y protege la información personal del usuario. Al utilizar TerraControl, el usuario acepta los términos y condiciones establecidos en esta política.
        </p>
      </header>

      <nav className="policy-toc" aria-label="Tabla de contenido">
        <h2>Contenido</h2>
        <ol>
          <li><a className="anchor" href="#info-recopilada">1. Información recopilada</a></li>
          <li><a className="anchor" href="#uso-informacion">2. Uso de información</a></li>
          <li><a className="anchor" href="#proteccion-informacion">3. Protección de la información</a></li>
          <li><a className="anchor" href="#divulgacion">4. Divulgación de información</a></li>
          <li><a className="anchor" href="#enlaces-terceros">5. Enlaces a terceros</a></li>
          <li><a className="anchor" href="#cambios-politica">6. Cambios en la política</a></li>
          <li><a className="anchor" href="#ley-aplicable">7. Ley aplicable</a></li>
        </ol>
      </nav>

      <hr className="divider" />

      <section id="info-recopilada" className="policy-section">
        <h3>1. Información recopilada</h3>
        <p>
          TerraControl puede recopilar información personal del usuario, como nombre, dirección de correo electrónico, número de teléfono y otros datos necesarios para proporcionar los servicios ofrecidos por la aplicación. Esta información se recopila de manera voluntaria y con el consentimiento del usuario.
        </p>
        <p>
          Además, TerraControl puede recopilar información no personal, como datos de uso y estadísticas anónimas, con el objeto de mejorar la experiencia del usuario y optimizar servicios ofrecidos.
        </p>
      </section>

      <section id="uso-informacion" className="policy-section">
        <h3>2. Uso de información</h3>
        <p>La información personal proporcionada por el usuario se utilizará exclusivamente para los siguientes fines:</p>
        <ul className="policy-list">
          <li>Proporcionar y mantener los servicios de TerraControl.</li>
          <li>Mejorar y personalizar la experiencia del usuario.</li>
          <li>Responder a consultas, preguntas y solicitudes de usuario.</li>
          <li>Enviar actualización y notificaciones relacionadas con la TerraControl y sus servicios.</li>
          <li>Cumplir con las obligaciones legales y reglamentarias aplicables.</li>
        </ul>
      </section>

      <section id="proteccion-informacion" className="policy-section">
        <h3>3. Protección de la información</h3>
        <p>
          TerraControl se compromete a proteger la información personal del usuario mediante medidas técnicas y organizativas apropiadas para prevenir la perdida, el uso indebido, la divulgación no autorizada o la modificación de dicha información.
        </p>
        <p className="muted">
          No obstante, ninguna transmisión de datos a través de internet o sistema de almacenamiento electrónico puede garantizar la seguridad absoluta. Por lo tanto, se insta al usuario a tomar precauciones adicionales al proporcionar información personal en línea.
        </p>
      </section>

      <section id="divulgacion" className="policy-section">
        <h3>4. Divulgación de información</h3>
        <p>TerraControl no compartirá, venderá ni alquilará la información personal del usuario a terceros, excepto en los siguientes casos:</p>
        <ul className="policy-list">
          <li>Cuando sea necesario cumplir con una obligación legal o reglamentaría.</li>
          <li>Con el consentimiento expreso del usuario.</li>
          <li>Para proteger los derechos, la propiedad o la seguridad de TerraControl, sus usuarios u otros.</li>
        </ul>
      </section>

      <section id="enlaces-terceros" className="policy-section">
        <h3>5. Enlaces a terceros</h3>
        <p>
          TerraControl puede contener enlaces a sitios web o servicios de terceros. Esta política de privacidad y términos de uso se aplica únicamente a TerraControl, por lo que se recomienda al usuario revisar políticas de privacidad y términos de uso de cualquier sitio web o servicio de terceros al que acceda a través de la aplicación.
        </p>
      </section>

      <section id="cambios-politica" className="policy-section">
        <h3>6. Cambios en la política</h3>
        <p>
          La aplicación se reservará el derecho de actualizar o modificar esta política de privacidad y términos de uso en cualquier momento. Se notificará al usuario cualquier cambio relevante a través de la aplicación o por otros medios razonables. El uso continuado de TerraControl después de dichas modificaciones constituirá la aceptación de los términos actualizados.
        </p>
      </section>

      <section id="ley-aplicable" className="policy-section">
        <h3>7. Ley aplicable</h3>
        <p>
          Esta política de privacidad y términos de uso se regirá e interpretará de acuerdo con las leyes de Guatemala. Cualquier disputa que surja en relación con esta política esta sujeta a la jurisdicción exclusiva de los tribunales de Guatemala.
        </p>
        <p>
          Al utilizar TerraControl, el usuario reconoce haber leído, comprendido y aceptado los términos y condiciones de esta política de privacidad y términos de uso. En caso de desacuerdo con alguno de los términos aquí establecidos, se recomienda al usuario abstenerse de utilizar de TerraControl.
        </p>
        <p className="policy-footer">Fecha de entrada en vigencia: 1 de Agosto de 2024</p>
      </section>
    </article>
  );
}