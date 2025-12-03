export const TYPEPROD = [
    { id: 0, category: 0, type: "Fertilizante Foliar" },
    { id: 1, category: 0, type: "Fertilizante Granulado" },
    { id: 2, category: 0, type: "Fungicida" },
    { id: 3, category: 0, type: "Insecticida" },
    { id: 4, category: 0, type: "Herbicida" },
    { id: 5, category: 0, type: "Adherentes" },
    { id: 6, category: 0, type: "Coadyuvantes" },
    { id: 7, category: 0, type: "Reguladores de pH" },

    { id: 8,  category: 1, type: "Repuestos" },
    { id: 9,  category: 1, type: "Materiales" },
    { id: 10, category: 1, type: "Equipo protector" },
    { id: 11, category: 1, type: "Herramientas" },
    { id: 12, category: 1, type: "Combustible" },

    // "Semilla Cafe", "Semilla de Piña"
    { id: 13, category: 2, type: "Semilla Cafe" },
    { id: 14, category: 2, type: "Semilla de Piña" },
];


export const CATEGORYPROD =[
    "Agroquímicos",
    "Equipo e Insumo",
    "Semilla"
].map((category, index) => ({
    id: index,
    name: category
}))
