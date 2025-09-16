import logo from './assets/Images/logo_ico_green1.webp';
import Header from './components/header/header';
import Home from './components/home/home';
import Services from './components/services/services';
import About from './components/about/about';
import google from './assets/Images/googleplay.png';
import './App.css';

function App() {
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
        <h2>¿Por qué TerraControl?</h2>
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
      </footer>
    </div>
  );
}

export default App;
