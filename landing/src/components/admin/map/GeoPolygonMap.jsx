import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useMemo, useRef } from 'react';

const containerStyle = { width: '100%', height: '100%', minHeight: '360px' };
const defaultCenter = { lat: 14.6349, lng: -90.5069 };
const normalizeName = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const polygonPalette = ['#66bb6a', '#43a047', '#26a69a', '#5c6bc0', '#ef6c00'];

const buildPolygonPath = (lot) => {
  if (!lot || !lot.latitudes || !lot.longitudes) return [];
  const keys = Object.keys(lot.latitudes);
  if (!keys.length) return [];

  return keys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => {
      const latRaw = lot.latitudes[key];
      const lngRaw = lot.longitudes[key];
      const lat = typeof latRaw === 'number' ? latRaw : parseFloat(latRaw);
      const lng = typeof lngRaw === 'number' ? lngRaw : parseFloat(lngRaw);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      return { lat, lng };
    })
    .filter(Boolean);
};

const departmentViews = {
  'alta-verapaz': { center: { lat: 15.6, lng: -90.2 }, zoom: 8 },
  'baja-verapaz': { center: { lat: 15.1, lng: -90.3 }, zoom: 9 },
  chimaltenango: { center: { lat: 14.66, lng: -90.83 }, zoom: 9 },
  chiquimula: { center: { lat: 14.8, lng: -89.54 }, zoom: 9 },
  'el-progreso': { center: { lat: 14.85, lng: -90.02 }, zoom: 9 },
  escuintla: { center: { lat: 14.3, lng: -90.78 }, zoom: 9 },
  guatemala: { center: { lat: 14.62, lng: -90.53 }, zoom: 10 },
  huehuetenango: { center: { lat: 15.32, lng: -91.47 }, zoom: 8 },
  izabal: { center: { lat: 15.39, lng: -88.99 }, zoom: 8 },
  jalapa: { center: { lat: 14.63, lng: -89.99 }, zoom: 9 },
  jutiapa: { center: { lat: 14.29, lng: -89.9 }, zoom: 8 },
  peten: { center: { lat: 16.91, lng: -89.89 }, zoom: 7 },
  quetzaltenango: { center: { lat: 14.83, lng: -91.52 }, zoom: 9 },
  quiche: { center: { lat: 15.03, lng: -91.15 }, zoom: 8 },
  retalhuleu: { center: { lat: 14.53, lng: -91.67 }, zoom: 9 },
  sacatepequez: { center: { lat: 14.56, lng: -90.74 }, zoom: 10 },
  'san-marcos': { center: { lat: 14.96, lng: -91.79 }, zoom: 8 },
  'santa-rosa': { center: { lat: 14.3, lng: -90.3 }, zoom: 9 },
  solola: { center: { lat: 14.77, lng: -91.18 }, zoom: 9 },
  suchitepequez: { center: { lat: 14.54, lng: -91.5 }, zoom: 9 },
  totonicapan: { center: { lat: 14.91, lng: -91.36 }, zoom: 9 },
  zacapa: { center: { lat: 14.97, lng: -89.53 }, zoom: 9 }
};

function GeoPolygonMap({
  selectedDepartment,
  selectedMunicipality,
  selectedLot,
  locations = [],
  isLoadingLocations = false,
  showSummary = true,
  onToggleSummary
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'terracontrol-admin-map',
    googleMapsApiKey: apiKey || '',
    libraries: ['drawing']
  });
  const mapRef = useRef(null);
  const geocodeCache = useRef({});
  const locationPolygons = useMemo(() => {
    if (!Array.isArray(locations) || !locations.length) return [];
    let colorIndex = 0;
    return locations
      .flatMap((location) => {
        if (!Array.isArray(location?.lotes)) {
          return [];
        }
        return location.lotes
          .map((lot, idx) => {
            const path = buildPolygonPath(lot);
            if (!path.length) {
              return null;
            }
            const color = polygonPalette[colorIndex % polygonPalette.length];
            colorIndex += 1;
            return {
              id: `${location.id}-${lot.id_lote || idx}`,
              finca: location.nombre,
              lotName: lot.nombre_lote,
              path,
              color
            };
          })
          .filter(Boolean);
      })
      .filter(Boolean);
  }, [locations]);

  const fincasPreview = useMemo(() => {
    if (!Array.isArray(locations) || !locations.length) return '';
    const names = locations
      .map((location) => location?.nombre)
      .filter(Boolean);
    if (!names.length) return '';
    const preview = names.slice(0, 3).join(', ');
    return names.length > 3 ? `${preview}…` : preview;
  }, [locations]);

  const selectionContext = useMemo(() => {
    return [
      selectedLot || 'Sin finca seleccionada',
      selectedMunicipality || 'Todos los municipios',
      selectedDepartment || 'Todos los departamentos'
    ].join(' · ');
  }, [selectedLot, selectedMunicipality, selectedDepartment]);

  const hasLocationData = Array.isArray(locations) && locations.length > 0;
  const shouldShowSummary = showSummary && hasLocationData;

  useEffect(() => {
    if (!mapRef.current || !isLoaded || typeof window === 'undefined' || !window.google) return;
    let cancelled = false;
    const map = mapRef.current;

    const resetToDefault = () => {
      map.panTo(defaultCenter);
      map.setZoom(7);
    };

    const fitToGeometry = (geometry) => {
      if (!geometry) return;
      if (geometry.viewport) {
        map.fitBounds(geometry.viewport);
      } else if (geometry.location) {
        map.panTo(geometry.location);
        map.setZoom(11);
      }
    };

    const applyFallbackView = (view) => {
      if (!view) return;
      map.panTo(view.center);
      map.setZoom(view.zoom);
    };

    const geocodeWithGoogle = (request) =>
      new Promise((resolve) => {
        if (!window.google?.maps?.Geocoder) {
          resolve(null);
          return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { ...request, componentRestrictions: { country: 'GT' } },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0].geometry);
            } else {
              resolve(null);
            }
          }
        );
      });

    const geocodeWithNominatim = async (query, radius = 0.1) => {
      if (typeof fetch === 'undefined') return null;
      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '0',
          limit: '1',
          countrycodes: 'gt',
          email: 'info@terracontrolgt.com'
        });
        const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) return null;
        const [result] = await response.json();
        if (!result) return null;
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const delta = radius;
        const bounds = new window.google.maps.LatLngBounds(
          { lat: lat - delta, lng: lng - delta },
          { lat: lat + delta, lng: lng + delta }
        );
        return {
          location: new window.google.maps.LatLng(lat, lng),
          viewport: bounds
        };
      } catch {
        return null;
      }
    };

    const geocodeAndFocus = async ({ query, cacheKey, fallbackView, radius = 0.15 }) => {
      if (!query) {
        if (fallbackView) {
          applyFallbackView(fallbackView);
        } else {
          resetToDefault();
        }
        return;
      }

      const cached = geocodeCache.current[cacheKey];
      if (cached) {
        fitToGeometry(cached);
        return;
      }

      const geometry = await geocodeWithGoogle({ address: query });
      if (cancelled || !mapRef.current) return;
      if (geometry) {
        geocodeCache.current[cacheKey] = geometry;
        fitToGeometry(geometry);
        return;
      }

      const nominatimGeometry = await geocodeWithNominatim(query, radius);
      if (cancelled || !mapRef.current) return;
      if (nominatimGeometry) {
        geocodeCache.current[cacheKey] = nominatimGeometry;
        fitToGeometry(nominatimGeometry);
        return;
      }

      if (fallbackView) {
        applyFallbackView(fallbackView);
      } else {
        resetToDefault();
      }
    };

    if (selectedMunicipality) {
      const normalizedMunicipality = normalizeName(selectedMunicipality);
      const normalizedDepartment = selectedDepartment ? normalizeName(selectedDepartment) : '';
      const cacheKey = `municipality:${normalizedMunicipality}-${normalizedDepartment || 'any'}`;
      const fallbackView = selectedDepartment ? departmentViews[normalizedDepartment] : undefined;
      const queryParts = [selectedMunicipality];
      if (selectedDepartment) {
        queryParts.push(selectedDepartment);
      }
      queryParts.push('Guatemala');
      geocodeAndFocus({
        query: queryParts.join(', '),
        cacheKey,
        fallbackView,
        radius: 0.08
      });
    } else if (selectedDepartment) {
      const normalizedDepartment = normalizeName(selectedDepartment);
      const cacheKey = `department:${normalizedDepartment}`;
      const fallbackView = departmentViews[normalizedDepartment];
      geocodeAndFocus({
        query: `${selectedDepartment}, Guatemala`,
        cacheKey,
        fallbackView,
        radius: 0.25
      });
    } else {
      resetToDefault();
    }

    return () => {
      cancelled = true;
    };
  }, [selectedDepartment, selectedMunicipality, isLoaded]);

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
          onLoad={(map) => {
            mapRef.current = map;
            if (map && window.google?.maps?.MapTypeId?.HYBRID) {
              map.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
            }
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            clickableIcons: false,
            mapTypeId: window.google?.maps?.MapTypeId?.HYBRID
          }}
        >
          {locationPolygons.map((polygon) => (
            <Polygon
              key={polygon.id}
              paths={polygon.path}
              options={{
                fillColor: polygon.color,
                strokeColor: polygon.color,
                fillOpacity: 0.25,
                strokeOpacity: 0.85,
                strokeWeight: 2,
                clickable: false
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <div className="geo-map__fallback">Cargando mapa...</div>
      )}

      {isLoadingLocations && (
        <div className="geo-map__status-pill">Actualizando fincas...</div>
      )}
      {shouldShowSummary ? (
        <div className="geo-map__summary">
          <button
            type="button"
            className="geo-map__summary-toggle"
            onClick={() => onToggleSummary?.()}
          >
            Ocultar resumen
          </button>
          {hasLocationData && (
            <>
              <p>
                Fincas encontradas: <strong>{locations.length}</strong>
              </p>
              {fincasPreview && <p className="geo-map__summary-context">{fincasPreview}</p>}
            </>
          )}
          <p className="geo-map__summary-context">{selectionContext}</p>
        </div>
      ) : (
        <button
          type="button"
          className="geo-map__summary-toggle geo-map__summary-toggle--floating"
          onClick={() => onToggleSummary?.()}
        >
          Mostrar resumen
        </button>
      )}
    </div>
  );
}

export default GeoPolygonMap;
