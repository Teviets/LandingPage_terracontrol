import React from "react";
import "./about.css"; // si deseas estilos separados
import TeamImg from "../../assets/Images/tel.png"; // simula tu imagen de equipo

export default function About() {
  return (
    <section id="nosotros" className="about">
      <div className="about-container">
        {/* Imagen ilustrativa */}
        <div className="about-media">
          <img src={TeamImg} alt="Equipo TerraControl" className="about-image" />
        </div>

        {/* Texto principal */}
        <div className="about-text svc-rich">
          <h2 className="about-title">Sobre Nosotros</h2>
          <p className="lead">
            En <strong>TerraControl</strong> creemos que la innovación tecnológica puede
            transformar la agricultura. Nuestra misión es ayudar a productores y
            administradores a <strong>optimizar sus fincas</strong> mediante datos claros,
            herramientas simples y reportes inteligentes.
          </p>

          <ul className="svc-list">
            <li>
              <span className="icon">🌱</span>
              <div>
                <strong>Misión</strong><br />
                Empoderar a los productores agrícolas con una herramienta digital integral que simplifique la gestión de sus fincas.

              </div>
            </li>
            <li>
              <span className="icon">🌍</span>
              <div>
                <strong>Visión</strong><br />
                Ser la aplicación líder en el sector agropecuario, reconocida por transformar la gestión tradicional de fincas en un modelo digital, eficiente y transparente.

              </div>
            </li>
            <li>
              <span className="icon">🤝</span>
              <div>
                <strong>Valores</strong><br />
                Eficiencia, innovación, transparencia
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
