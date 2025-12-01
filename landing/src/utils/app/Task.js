
/**
 * @typedef {Object} TaskTypeOption
 * @property {number} id Identificador numérico usado por la API/base de datos.
 * @property {string} type Etiqueta visible del tipo de tarea.
 */

/**
 * Catálogo estático de tipos de tareas disponibles para los formularios y filtros del APP.
 * Mantener el orden asegura que los IDs sigan siendo consistentes con la plataforma móvil.
 * @type {TaskTypeOption[]}
 */
export const TASKTYPE = [
  'Nutrición',
  'Manejo de Tejidos',
  'Manejo de Sombra',
  'Manejo Plagas y Enfermedades',
  'Manejo de Malezas',
  'Siembra',
  'Corte (Cosecha)',
  'Preparación de Tierras',
  'Trabajos Varios'
].map((name, index) => ({
  id: index,
  type: name
}));

/**
 * Mapa auxiliar para hacer lookups rápidos por id.
 * @type {Record<string, TaskTypeOption>}
 */
export const TASKTYPE_BY_ID = TASKTYPE.reduce((acc, option) => {
  acc[String(option.id)] = option;
  return acc;
}, {});

/**
 * Devuelve el tipo de tarea asociado a un id.
 * @param {number|string} id
 * @returns {TaskTypeOption | undefined}
 */
export const getTaskTypeById = (id) => TASKTYPE_BY_ID[String(id)];
