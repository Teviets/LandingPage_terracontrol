export const ABREVIATURASUNIDADAREA = [
    "Mza.",
    "Ha.",
    "C40x40",
    "C20x20",
    "Cba."
].map((abreviatura, index) => ({
    id: index,
    abreviatura
}));

export const ABREVIATURASUNIDADCOMPRAS = [
    "U.",
    "Lbs.",
    "Lts.",
    "Oz.",
    "ml.",
    "Kg.",
    "g.",
    "Tn.",
    "Qtl.",
    "Gal.",
    "Caneca.",
    "15kg.",
    "25kg.",
    "1/4lt.",
    "1/2lt.",
    "1/8lt."
].map((abreviatura, index) => ({
    id: index,
    abreviatura
}));

export const UNIDADCOMPRAS = [
    "Unidad",
    "Libras",
    "Litros",
    "Onzas",
    "Mililitros",
    "Kilogramos",
    "Gramos",
    "Toneladas",
    "Quintales",
    "Galones",
    "Caneca",
    "15 kgs",
    "25 kgs",
    "1/4 lts",
    "1/2 lts",
    "1/8 lts"
].map((nombre, index) => ({
    id: index,
    nombre,
    abreviatura: ABREVIATURASUNIDADCOMPRAS[index].abreviatura
}));

export const UNIDADAREA = [
    "Manzanas",
    "Hectárea",
    "Cuerda 40x40",
    "Cuerda 20x20",
    "Caballería"
].map((nombre, index) => ({
    id: index,
    nombre,
    abreviatura: ABREVIATURASUNIDADAREA[index].abreviatura
}));

export const TIPOPLANTACION = [
    "Invernadero",
    "Campo abierto",
    "Filas"
].map((nombre, index) => ({
    id: index,
    nombre
}));


export const CONVERSION_MAP = {
  'Unidad': {}, // identidad

  // Libras -> otras
  'Libras': {
    'Litros': 0.4536,
    'Onzas': 16.0,
    'Mililitros': 453.36,
    'Kilogramos': 0.4536,
    'Gramos': 453.36,
    'Toneladas': 0.0004536,
    'Quintales': 0.01,
    'Galones': 0.119,
    'Caneca': 0.0238,
    '15 kgs': 0.0302,
    '25 kgs': 0.01814,
    '1/4 lts': 0.1134,
    '1/2 lts': 0.2268,
    '1/8 lts': 0.0567,
  },

  // Litros -> otras
  'Litros': {
    'Libras': 2.2045,
    'Onzas': 33.814,
    'Mililitros': 1000.0,
    'Kilogramos': 1.0,
    'Gramos': 1000.0,
    'Toneladas': 0.001,
    'Quintales': 0.022,
    'Galones': 0.2642,
    'Caneca': 0.05284,
    '15 kgs': 0.0667,
    '25 kgs': 0.04,
    '1/4 lts': 4.0,
    '1/2 lts': 2.0,
    '1/8 lts': 8.0,
  },

  // Onzas -> otras
  'Onzas': {
    'Libras': 0.0625,
    'Litros': 0.02957,
    'Mililitros': 29.57,
    'Kilogramos': 0.0283495,
    'Gramos': 28.3511,
    'Toneladas': 0.0000283495,
    'Quintales': 0.000625,
    'Galones': 0.0078125,
    'Caneca': 0.0015625,
    '15 kgs': 0.001889,
    '25 kgs': 0.0011339,
    '1/4 lts': 0.11828,
    '1/2 lts': 0.05914,
    '1/8 lts': 0.23656,
  },

  // Mililitros -> otras
  'Mililitros': {
    'Libras': 0.00220462,
    'Litros': 0.001,
    'Onzas': 0.033,
    'Kilogramos': 0.001,
    'Gramos': 1.0,
    'Toneladas': 0.000001,
    'Quintales': 0.00022,
    'Galones': 0.000264172,
    'Caneca': 0.0000528402,
    '15 kgs': 0.0000667,
    '25 kgs': 0.00004,
    '1/4 lts': 0.004,
    '1/2 lts': 0.002,
    '1/8 lts': 0.008,
  },

  // Kilogramos -> otras
  'Kilogramos': {
    'Libras': 2.2045,
    'Litros': 1.0,
    'Onzas': 35.274,
    'Mililitros': 1000.0,
    'Gramos': 1000.0,
    'Toneladas': 0.001,
    'Quintales': 0.022,
    'Galones': 0.2641,
    'Caneca': 0.05282,
    '15 kgs': 0.0667,
    '25 kgs': 0.04,
    '1/4 lts': 4.0,
    '1/2 lts': 2.0,
    '1/8 lts': 8.0,
  },

  // Gramos -> otras
  'Gramos': {
    'Libras': 0.00220462,
    'Litros': 0.001,
    'Onzas': 0.03527,
    'Mililitros': 1.0,
    'Kilogramos': 0.001,
    'Toneladas': 0.000001,
    'Quintales': 0.000022,
    'Galones': 0.000264172,
    'Caneca': 0.000528344,
    '15 kgs': 0.0000667,
    '25 kgs': 0.00004,
    '1/4 lts': 0.004,
    '1/2 lts': 0.002,
    '1/8 lts': 0.008,
  },

  // Toneladas -> otras
  'Toneladas': {
    'Libras': 2204.62,
    'Litros': 1000.0,
    'Onzas': 35274.0,
    'Mililitros': 1000000.0,
    'Kilogramos': 1000.0,
    'Gramos': 1000000.0,
    'Quintales': 22.0,
    'Galones': 268.47,
    'Caneca': 53.69,
    '15 kgs': 66.667,
    '25 kgs': 40.0,
    '1/4 lts': 4000.0,
    '1/2 lts': 2000.0,
    '1/8 lts': 8000.0,
  },

  // Quintales -> otras
  'Quintales': {
    'Libras': 100.0,
    'Litros': 45.36,
    'Onzas': 1533.80,
    'Mililitros': 45360.0,
    'Kilogramos': 45.45,
    'Gramos': 45454.54,
    'Toneladas': 0.045,
    'Galones': 11.984,
    'Caneca': 2.396,
    '15 kgs': 3.03,
    '25 kgs': 1.818,
    '1/4 lts': 181.44,
    '1/2 lts': 90.72,
    '1/8 lts': 362.88,
  },

  // Galones -> otras
  'Galones': {
    'Libras': 8.3454,
    'Litros': 3.78541253,
    'Onzas': 128.0,
    'Mililitros': 3785.41,
    'Kilogramos': 3.78541253,
    'Gramos': 3785.41,
    'Toneladas': 0.0037854,
    'Quintales': 0.083454,
    'Caneca': 0.2,
    '15 kgs': 0.25236,
    '25 kgs': 0.151416,
    '1/4 lts': 15.1416,
    '1/2 lts': 7.5708,
    '1/8 lts': 30.2832,
  },

  // Caneca -> otras
  'Caneca': {
    'Libras': 41.72,
    'Litros': 18.9285,
    'Onzas': 640.0,
    'Mililitros': 18927.05,
    'Kilogramos': 18.927,
    'Gramos': 18927.05,
    'Toneladas': 0.018927,
    'Quintales': 0.41727,
    'Galones': 5.0,
    '15 kgs': 1.2618,
    '25 kgs': 0.75708,
    '1/4 lts': 75.708,
    '1/2 lts': 37.854,
    '1/8 lts': 151.416,
  },

  // 15 kgs -> otras
  '15 kgs': {
    'Libras': 33.0693,
    'Litros': 15.0,
    'Onzas': 529.109,
    'Mililitros': 15000.0,
    'Kilogramos': 15.0,
    'Gramos': 15000.0,
    'Toneladas': 0.015,
    'Quintales': 0.33,
    'Galones': 3.96258,
    'Caneca': 0.7923,
    '25 kgs': 0.6,
    '1/4 lts': 60.0,
    '1/2 lts': 30.0,
    '1/8 lts': 120.0,
  },

  // 25 kgs -> otras
  '25 kgs': {
    'Libras': 55.1156,
    'Litros': 25.0,
    'Onzas': 881.849,
    'Mililitros': 25000.0,
    'Kilogramos': 25.0,
    'Gramos': 25000.0,
    'Toneladas': 0.025,
    'Quintales': 0.55,
    'Galones': 6.6043,
    'Caneca': 1.3205,
    '15 kgs': 1.66667,
    '1/4 lts': 100.0,
    '1/2 lts': 50.0,
    '1/8 lts': 200.0,
  },

  // 1/4 lts -> otras
  '1/4 lts': {
    'Libras': 0.551155655,
    'Litros': 0.25,
    'Onzas': 8.4535,
    'Mililitros': 250.0,
    'Kilogramos': 0.25,
    'Gramos': 250.0,
    'Toneladas': 0.00025,
    'Quintales': 0.0055,
    'Galones': 0.066043,
    'Caneca': 0.000113215,
    '15 kgs': 0.01667,
    '25 kgs': 0.01,
    '1/2 lts': 2.0,
    '1/8 lts': 0.5,
  },

  // 1/2 lts -> otras
  '1/2 lts': {
    'Libras': 1.102311,
    'Litros': 0.5,
    'Onzas': 16.9,
    'Mililitros': 500.0,
    'Kilogramos': 0.5,
    'Gramos': 500.0,
    'Toneladas': 0.0005,
    'Quintales': 0.00552,
    'Galones': 0.132086,
    'Caneca': 0.0125,
    '15 kgs': 0.03334,
    '25 kgs': 0.02,
    '1/4 lts': 2.0,
    '1/8 lts': 0.25,
  },

  // 1/8 lts -> otras
  '1/8 lts': {
    'Libras': 0.275577,
    'Litros': 0.125,
    'Onzas': 4.227,
    'Mililitros': 125.0,
    'Kilogramos': 0.125,
    'Gramos': 125.0,
    'Toneladas': 0.0001261,
    'Quintales': 0.00276,
    'Galones': 0.03302,
    'Caneca': 0.00625,
    '15 kgs': 0.008335,
    '25 kgs': 0.005,
    '1/4 lts': 2.0,
    '1/2 lts': 0.25,
  },
};