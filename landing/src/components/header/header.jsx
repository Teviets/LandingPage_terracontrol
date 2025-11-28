import React from "react";
import logo from '../../assets/Images/logo_ico_green1.webp';
import './header.css';

export default function Header() {
  return (
    <header className="header">
      {/* Logo */}
      <div className="header-logo">
        <img src={logo} alt="TerraControl logo" />
        <span>TerraControl</span>
      </div>

      {/* Navegación */}
      <nav className="header-nav">
        <a href="#servicios">Servicios</a>
        <a href="#nosotros">Nosotros</a>
      </nav>
    </header>
  );
}
