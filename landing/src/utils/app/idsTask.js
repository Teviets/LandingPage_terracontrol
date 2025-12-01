// utils/idsTask.js
import { toBaseId, toLocalId, toRemoteId } from '../../utils/constants';

/**
 * Convierte un id a local o remoto de forma segura.
 */
export function convertId(id, target /* 'local' | 'remote' */) {
  if (id == null || id === '') return id;
  const base = toBaseId(String(id));
  return target === 'local' ? toLocalId(base) : toRemoteId(base);
}

/**
 * Convierte TODOS los ids de una tarea (incluye anidados).
 * - target: 'local' | 'remote'
 * - options.setChildTaskId: si true, setea row.tarea = id de la tarea convertida (útil si tu detalle usa FK al padre)
 */
export function convertTaskIds(task, target = 'local', options = { setChildTaskId: false }) {
  if (!task || typeof task !== 'object') return task;

  const out = { ...task };

  // padre
  if (out.id) out.id = convertId(out.id, target);
  if (out.id_lote) out.id_lote = convertId(out.id_lote, target);
  if (out.id_cosecha) out.id_cosecha = convertId(out.id_cosecha, target);

  // detalle de personal
  if (Array.isArray(out.personal_json)) {
    out.personal_json = out.personal_json.map((r) => {
      const row = { ...r };
      if (row.personal) row.personal = convertId(row.personal, target);

      // Opcional: amarra la fila al id del padre si tu tabla usa FK (personal_tareas.tarea = tareas.id)
      if (options?.setChildTaskId && out.id) {
        row.tarea = out.id;
      }
      return row;
    });
  }

  // detalle de insumos
  if (Array.isArray(out.insumo_json)) {
    out.insumo_json = out.insumo_json.map((r) => {
      const row = { ...r };
      if (row.insumo) row.insumo = convertId(row.insumo, target);
      // Si tu tabla de detalle también guarda FK al padre, puedes setear row.tarea aquí:
      if (options?.setChildTaskId && out.id) {
        row.tarea = out.id;
      }
      return row;
    });
  }

  return out;
}

/**
 * Convierte una lista de tareas completa.
 */
export function convertTasksList(tasks, target = 'local', options) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((t) => convertTaskIds(t, target, options));
}
