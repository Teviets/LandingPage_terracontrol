import {CONVERSION_MAP, UNIDADCOMPRAS} from './Unidades'

// Normalización simple (Evita problemas de espacios o mayúsculas)
const normalize = (s) => String(s ?? '').trim();


// Convierte directamente por nombre de unidad
export function convertValue(valor, unidadAnterior, unidadActual) {
    const from = normalize(unidadAnterior);
    const to = normalize(unidadActual);

    if (!from || !to) return NaN;
    if (from === to) return Number(valor);

    const fromMap = CONVERSION_MAP[from];
    if (!fromMap) return NaN;

    let factor = fromMap[to];

    // Si no existe A->B, intenta usar B->A inverso
    if (factor == null) {
        const toMap = CONVERSION_MAP[to];
        if (toMap && toMap[from] != null) {
            factor = 1 / toMap[from];
        }
    }

    if (factor == null) return NaN;
    return Number(valor) * factor;
}

export function unitNameById(id) {
  const u = UNIDADCOMPRAS.find(u => String(u.id) === String(id));
  return u?.nombre ?? null;
}

export function convertValueById(valor, fromId, toId) {
  const fromName = unitNameById(fromId);
  const toName = unitNameById(toId);
  if (!fromName || !toName) return NaN;
  return convertValue(valor, fromName, toName);
}

// task: objeto de tarea (como el que pegaste)
// convertValueById(qty:number, fromId:number, toId:number) => number
export const calculateTaskCost = (task, convertValueById) => {
    const personal = Array.isArray(task?.personal_json) ? task.personal_json : [];
    const insumos  = Array.isArray(task?.insumo_json)  ? task.insumo_json  : [];

    const personalCost = personal.reduce((sum, p) => {
        const pago = Number(p?.pago) || 0;
        const realizadas = Number(p?.tareas_realizadas) || 0;
        return sum + pago * realizadas;
    }, 0);

    const insumosCost = insumos.reduce((sum, i) => {
        const qty  = Number(i?.cantidad) || 0;
        const from = i?.unidad;       // id unidad origen
        const to   = i?.unidad_prod;  // id unidad destino
        const unit = Number(i?.costo_unitario) || 0;

        // Si hay convertidor y las unidades difieren, convierte
        const qtyInTarget =
            typeof convertValueById === 'function' && from !== undefined && to !== undefined && from !== to
                ? convertValueById(qty, from, to)
                : qty;

        return sum + unit * qtyInTarget;
    }, 0);

    return (personalCost + insumosCost).toFixed(2);
};


// utils/date.ts (o cerca del componente)
export const formatISOCalendarDate = (iso) => {
  if (!iso) return '';
  // Tomamos solo YYYY-MM-DD y creamos Date local a medianoche local
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [_, y, mo, d] = m;
  const localDate = new Date(Number(y), Number(mo) - 1, Number(d));
  return localDate.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short', // ej: "ago"
    year: 'numeric',
  });
};


export const objIndexToArray = (obj) =>
  Object.keys(obj || {})
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => obj[k]);

// Convierte int ARGB de Android a rgba(r,g,b,a)
// Si no tiene alpha en el int, se usa el alpha pasado
// Ignora el canal alpha del int y usa el alpha que pases
export function intArgbToRgbaString(intColor, alpha = 0.2) {
  const a = Math.min(1, Math.max(0, Number(alpha) || 0)); // clamp 0..1
  if (typeof intColor !== 'number') return `rgba(0,150,136,${a})`;

  const c = intColor >>> 0;          // a 32 bits sin signo
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;

  return `rgba(${r},${g},${b},${a})`;
}

// Si alguna vez quieres "respetar" el alpha entrante, usa esta variante:
export function intArgbToRgbaStringRespectAlpha(intColor, fallbackAlpha = 0.2) {
  if (typeof intColor !== 'number') return `rgba(0,150,136,${fallbackAlpha})`;
  const c = intColor >>> 0;
  const a = (c >> 24) & 0xff;
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;
  const finalA = a ? a / 255 : fallbackAlpha;
  return `rgba(${r},${g},${b},${finalA})`;
}

// Construye el polígono: fill transparente y stroke opaco del mismo color
const parseLatLngList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return objIndexToArray(parsed);
      return [];
    } catch {
      return [];
    }
  }
  if (value && typeof value === 'object') return objIndexToArray(value);
  return [];
};

export function buildPolygonFromLote(lote) {
  const lats = parseLatLngList(lote?.latitudlist);
  const lngs = parseLatLngList(lote?.longitudlist);

  const coordinates = lats
    .map((lat, i) => ({
      latitude: Number(lat),
      longitude: Number(lngs[i]),
    }))
    .filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

  const base = lote.color;                 // p.ej. -16776961 (azul)
  const fillColor   = intArgbToRgbaString(base, 0.45); // más transparente
  const strokeColor = intArgbToRgbaString(base, 1);    // mismo color, opaco

  return {
    coordinates,
    strokeWidth: 2,
    strokeColor,
    fillColor,
  };
}

// Convierte entero ARGB (puede venir negativo) a componentes y strings útiles
export function intToARGB(colorInt) {
  const u = (colorInt >>> 0);          // a sin signo
  const a = (u >>> 24) & 0xff;
  const r = (u >>> 16) & 0xff;
  const g = (u >>>  8) & 0xff;
  const b = (u       ) & 0xff;
  return { a, r, g, b };
}

export function argbToHexRGB(colorInt) {
  const { r, g, b } = intToARGB(colorInt);
  const to2 = (n) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${to2(r)}${to2(g)}${to2(b)}`;      // #RRGGBB
}

export function argbToHexAARRGGBB(colorInt) {
  const { a, r, g, b } = intToARGB(colorInt);
  const to2 = (n) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${to2(a)}${to2(r)}${to2(g)}${to2(b)}`; // #AARRGGBB
}

export function argbToRgba(colorInt, alphaOverride) {
  const { a, r, g, b } = intToARGB(colorInt);
  const alpha = alphaOverride != null ? alphaOverride : (a / 255);
  return `rgba(${r},${g},${b},${alpha})`;
}


export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString; // fallback si no es válida
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}


export const toBaseId = (id) => {
  const s = String(id);
  const idx = s.indexOf('-');
  return idx >= 0 ? s.slice(idx + 1) : s;
};
export const toRemoteId = (base) => `DBO-${base}`;
export const toLocalId  = (base) => `DBL-${base}`;

// Timeout helper
export const withTimeout = (ms, promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms))
  ]);

// Combina y prioriza online (si vienen ambos con mismo baseId)
export const combineAndPrioritizeOnline = (online = [], local = []) => {
  const onlineMap = new Map(online.map(o => [toBaseId(o.id), o]));
  const result = [...online];
  for (const l of local) {
    const base = toBaseId(l.id);
    if (!onlineMap.has(base)) result.push(l);
  }
  return result;
};
