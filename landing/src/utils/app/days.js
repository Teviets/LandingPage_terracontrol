// Usa las mismas potencias de 2
export const DAY_BITS = {
    LUN: 1,
    MAR: 2,
    MIE: 4,
    JUE: 8,
    VIE: 16,
    SAB: 32,
    DOM: 64,
};

// Para mostrar etiquetas con acentos sin afectar las keys
export const DAYS_FOR_UI = [
    { key: 'DOM', label: 'DOM' },
    { key: 'LUN', label: 'LUN' },
    { key: 'MAR', label: 'MAR' },
    { key: 'MIE', label: 'MIÉ' },
    { key: 'JUE', label: 'JUE' },
    { key: 'VIE', label: 'VIE' },
    { key: 'SAB', label: 'SÁB' },
];
