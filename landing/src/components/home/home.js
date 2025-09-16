import React from "react";
import Worker from "../../assets/Images/background.webp";
import "./home.css";

export default function Home() {
  return (
    <section
      className="home-hero"
      style={{ backgroundImage: `url(${Worker})` }}
    >
      <div className="overlay">
        <h1 className="hero-title">Bienvenido a <span>TerraControl</span></h1>
        <p className="hero-subtitle">
          La plataforma que revoluciona la gestión agrícola: controla tus lotes,
          tareas e inventario de forma fácil y profesional.
        </p>
        <div className="hero-buttons">
            <a 
              href="https://play.google.com/store/apps/details?id=com.terracontrol" 
              target="_blank" 
              rel="noopener noreferrer">
              <button className="btn btn-primary">
                Comenzar
              </button>
            </a>
            <a href="#servicios">
              <button className="btn btn-outline">Saber más</button>
            </a>
          
        </div>
      </div>
    </section>
  );
}
