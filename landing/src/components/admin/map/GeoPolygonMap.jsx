import { GoogleMap, DrawingManager, useJsApiLoader } from '@react-google-maps/api';
import { useMemo, useState } from 'react';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 14.6349, lng: -90.5069 };

function GeoPolygonMap({ selectedDepartment, selectedMunicipality, selectedLot }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'terracontrol-admin-map',
    googleMapsApiKey: apiKey || '',
    libraries: ['drawing']
  });
  const [drawnPolygons, setDrawnPolygons] = useState([]);

  const drawingManagerOptions = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return undefined;
    return {
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
        fillColor: '#81c784',
        fillOpacity: 0.35,
        strokeColor: '#2e7d32',
        strokeWeight: 2,
        editable: true
      }
    };
  }, [isLoaded]);

  const handlePolygonComplete = (polygon) => {
    const path = polygon.getPath().getArray().map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng()
    }));
    setDrawnPolygons((prev) => [...prev, path]);
  };

  if (!apiKey) {
    return (
      <div className="geo-map__fallback">
        Agrega `VITE_GOOGLE_MAPS_API_KEY` al archivo .env para visualizar el mapa.
      </div>
    );
  }

  if (loadError) {
    return <div className="geo-map__fallback">No se pudo cargar Google Maps.</div>;
  }

  return (
    <div className="geo-map__container">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={7}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            clickableIcons: false
          }}
        >
          {drawingManagerOptions && (
            <DrawingManager
              options={drawingManagerOptions}
              onPolygonComplete={handlePolygonComplete}
            />
          )}
        </GoogleMap>
      ) : (
        <div className="geo-map__fallback">Cargando mapa...</div>
      )}

      {drawnPolygons.length > 0 && (
        <div className="geo-map__summary">
          <p>
            Polígonos trazados: <strong>{drawnPolygons.length}</strong>
          </p>
          <p className="geo-map__summary-context">
            {selectedLot || 'Sin lote seleccionado'} ·{' '}
            {selectedMunicipality || 'Todos los municipios'} ·{' '}
            {selectedDepartment || 'Todos los departamentos'}
          </p>
        </div>
      )}
    </div>
  );
}

export default GeoPolygonMap;
