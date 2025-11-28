import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getApiEndpoint } from '../../../utils/apiConfig';
import { departments, municipalities, lotNames } from '../data/geoData';
import GeoPolygonMap from '../map/GeoPolygonMap';
import './admin-dashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { session, logout } = useAdminAuth();
  const contactRequestsEndpoint = useMemo(
    () => getApiEndpoint('/contact-requests'),
    []
  );
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [departmentInput, setDepartmentInput] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [municipalityInput, setMunicipalityInput] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');
  const [selectedLotInput, setSelectedLotInput] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');

  const filteredMunicipalities = useMemo(() => {
    if (!selectedDepartmentId) return municipalities;
    return municipalities.filter(
      (municipality) => municipality.departmentId === selectedDepartmentId
    );
  }, [selectedDepartmentId]);

  const selectedDepartmentName =
    departments.find((dept) => dept.id === selectedDepartmentId)?.name || '';
  const selectedMunicipalityName =
    municipalities.find((municipality) => municipality.id === selectedMunicipalityId)?.name || '';
  const selectedLotName = lotNames.find((lot) => lot.id === selectedLotId)?.name || '';

  useEffect(() => {
    let ignore = false;

    const fetchContactRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(contactRequestsEndpoint);
        if (!response.ok) {
          throw new Error('No se pudieron cargar los mensajes.');
        }

        const data = await response.json();
        if (!ignore) {
          setContactRequests(data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchContactRequests();
    return () => {
      ignore = true;
    };
  }, [contactRequestsEndpoint]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleDepartmentChange = (event) => {
    const value = event.target.value;
    setDepartmentInput(value);
    const match = departments.find(
      (department) => department.name.toLowerCase() === value.toLowerCase()
    );
    setSelectedDepartmentId(match?.id || '');
    if (!match) {
      setMunicipalityInput('');
      setSelectedMunicipalityId('');
    }
  };

  const handleMunicipalityChange = (event) => {
    const value = event.target.value;
    setMunicipalityInput(value);
    const match = filteredMunicipalities.find(
      (municipality) => municipality.name.toLowerCase() === value.toLowerCase()
    );
    setSelectedMunicipalityId(match?.id || '');
  };

  const handleLotChange = (event) => {
    const value = event.target.value;
    setSelectedLotInput(value);
    const match = lotNames.find((lot) => lot.name.toLowerCase() === value.toLowerCase());
    setSelectedLotId(match?.id || '');
  };

  return (
    <div className="admin-dashboard__wrapper">
      <header className="admin-dashboard__header">
        <div>
          <h1>Dashboard TerraControl</h1>
          <p>Bienvenido, {session?.user?.username}</p>
        </div>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <div className="admin-dashboard__grid">
        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--map">
          <p className="admin-dashboard__quadrant-label">Cuadrante 1</p>
          <div className="admin-dashboard__map">
            <div className="admin-dashboard__map-filters">
              <label>
                <span>Departamento</span>
                <input
                  type="text"
                  list="departments-list"
                  placeholder="Busca un departamento"
                  value={departmentInput}
                  onChange={handleDepartmentChange}
                />
                <datalist id="departments-list">
                  {departments.map((department) => (
                    <option key={department.id} value={department.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span>Municipio</span>
                <input
                  type="text"
                  list="municipalities-list"
                  placeholder="Busca municipio"
                  value={municipalityInput}
                  onChange={handleMunicipalityChange}
                />
                <datalist id="municipalities-list">
                  {filteredMunicipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span>Lote</span>
                <input
                  type="text"
                  list="lots-list"
                  placeholder="Selecciona un lote"
                  value={selectedLotInput}
                  onChange={handleLotChange}
                />
                <datalist id="lots-list">
                  {lotNames.map((lot) => (
                    <option key={lot.id} value={lot.name} />
                  ))}
                </datalist>
              </label>
            </div>
            <GeoPolygonMap
              selectedDepartment={selectedDepartmentName}
              selectedMunicipality={selectedMunicipalityName}
              selectedLot={selectedLotName}
            />
          </div>
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--summary">
          <div>
            <p className="admin-dashboard__quadrant-label">Cuadrante 2</p>
            <h2>Resumen operativo</h2>
            <p>Última sincronización: {new Date().toLocaleString()}</p>
          </div>
          <div className="admin-dashboard__summary-stats">
            <article>
              <span>Solicitudes</span>
              <strong>{contactRequests.length}</strong>
            </article>
            <article>
              <span>Polígonos</span>
              <strong>Listo para trazar</strong>
            </article>
            <article>
              <span>Departamento</span>
              <strong>{selectedDepartmentName || 'Todos'}</strong>
            </article>
          </div>
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--requests">
          <p className="admin-dashboard__quadrant-label">Cuadrante 3</p>
          <h2>Solicitudes de contacto</h2>
          {loading && <p>Cargando información...</p>}
          {error && <p className="admin-dashboard__error">{error}</p>}
          {!loading && !error && (
            <ul className="admin-dashboard__list">
              {contactRequests.length === 0 && <li>No hay solicitudes pendientes.</li>}
              {contactRequests.map((request) => (
                <li key={request.id}>
                  <div>
                    <p className="admin-dashboard__email">{request.email}</p>
                    <p className="admin-dashboard__message">{request.message}</p>
                  </div>
                  <span className="admin-dashboard__date">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--activity">
          <p className="admin-dashboard__quadrant-label">Cuadrante 4</p>
          <h2>Actividad reciente</h2>
          <ul className="admin-dashboard__activity">
            <li>Nuevos lotes registrados: 3</li>
            <li>Último usuario conectado: {session?.user?.username}</li>
            <li>Filtros activos: {selectedLotName || 'Sin lotes seleccionados'}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
