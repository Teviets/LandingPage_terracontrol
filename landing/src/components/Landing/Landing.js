import Header from "../header/header";
import Home from "../home/home";
import Services from "../services/services";
import About from "../about/about";
import google from '../../assets/Images/googleplay.png';
import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="App">
            <Header />
            <Home />
            <section id="servicios">
                <Services />
            </section>
            <section id="nosotros">
                <About />
            </section>

            {/* Sección extra */}
            <section id="info" className="App-section">
                <h2>Descarga ya TerraControl</h2>
                <a 
                href="https://play.google.com/store/apps/details?id=com.terracontrol" 
                target="_blank" 
                rel="noopener noreferrer"
                >
                <img 
                    src={google} 
                    alt="Descargar en Google Play" 
                    className="google-badge"
                />
                </a>
            </section>

            <footer className="App-footer">
                <p>© {new Date().getFullYear()} TerraControl. Todos los derechos reservados.</p>
                <Link to='/terms'>Terminos y condiciones</Link>
            </footer>
        </div>
    );
}

export default Landing;