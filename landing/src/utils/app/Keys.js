// utils/coordsStorage.js
export const coordsKeyFor = ({ mode, loteId }) =>
  mode === 'edit' && loteId ? `editCoords:${loteId}` : 'newCoords';
