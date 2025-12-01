import { DEPARTAMENTOS, MUNICIPIOS } from '../../../utils/app/locations';

const normalizeId = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');

export const departments = DEPARTAMENTOS.map((name) => ({
  id: normalizeId(name),
  name
}));

export const municipalities = Object.entries(MUNICIPIOS).flatMap(
  ([departmentName, municipalityList]) => {
    const departmentId = normalizeId(departmentName);
    return municipalityList.map((municipalityName) => ({
      id: `${departmentId}-${normalizeId(municipalityName)}`,
      name: municipalityName,
      departmentId
    }));
  }
);

export const lotNames = [
  { id: 'lote-aurora-norte', name: 'Lote Aurora Norte' },
  { id: 'lote-terra-sur', name: 'Lote Terra Sur' },
  { id: 'lote-natura', name: 'Lote Natura Vista' },
  { id: 'lote-horizonte', name: 'Lote Horizonte Central' }
];
