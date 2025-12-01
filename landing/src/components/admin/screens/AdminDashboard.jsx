import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { TASKTYPE } from '../../../utils/app/Task';
import { PERSONALTEST, VENTASTEST } from '../../../utils/app/Test';
import { TYPEPROD, CATEGORYPROD } from '../../../utils/app/Inventary';
import { CULTIVOS } from '../../../utils/app/Cultivos';
import { departments, municipalities, lotNames } from '../data/geoData';
import GeoPolygonMap from '../map/GeoPolygonMap';
import './admin-dashboard.css';

const taskTypes = TASKTYPE.map(({ id, type }) => ({
  id: String(id),
  label: type
}));

const CROP_NAME_BY_ID = (Array.isArray(CULTIVOS) ? CULTIVOS : []).reduce((acc, item) => {
  acc[item.id] = item.nombre;
  return acc;
}, {});

const LOT_SUMMARY = {
  'lote-aurora-norte': { hectares: 48, inventoryValue: 31200 },
  'lote-terra-sur': { hectares: 44, inventoryValue: 28600 },
  'lote-natura': { hectares: 52, inventoryValue: 29800 },
  'lote-horizonte': { hectares: 41, inventoryValue: 25700 }
};

const DEFAULT_LOT_SUMMARY = { hectares: 40, inventoryValue: 25000 };
const TOTAL_HECTARES = Object.values(LOT_SUMMARY).reduce((sum, lot) => sum + lot.hectares, 0);
const TOTAL_INVENTORY_VALUE = Object.values(LOT_SUMMARY).reduce(
  (sum, lot) => sum + lot.inventoryValue,
  0
);

const CHART_SORT_OPTIONS = [
  { value: 'amount-desc', label: 'Monto: mayor a menor' },
  { value: 'amount-asc', label: 'Monto: menor a mayor' },
  { value: 'completed-desc', label: 'Tareas completadas: mayor a menor' },
  { value: 'completed-asc', label: 'Tareas completadas: menor a mayor' },
  { value: 'alphabetical', label: 'Orden alfabético' }
];

const CHART_SORTERS = {
  'amount-desc': (a, b) => (b.amount - a.amount) || (b.completed - a.completed),
  'amount-asc': (a, b) => (a.amount - b.amount) || (a.completed - b.completed),
  'completed-desc': (a, b) => (b.completed - a.completed) || (b.amount - a.amount),
  'completed-asc': (a, b) => (a.completed - b.completed) || (a.amount - b.amount),
  alphabetical: (a, b) => a.label.localeCompare(b.label, 'es')
};

const PIE_COLORS = {
  payroll: '#2e7d32',
  offPayroll: '#a5d6a7',
  men: '#1e88e5',
  women: '#f06292',
  fallback: '#dfe7df'
};

const INVENTORY_PIE_COLORS = ['#0d9488', '#14b8a6', '#0ea5e9', '#6366f1', '#7c4dff', '#f97316', '#22c55e'];

const createPieSegments = (counts, total, blueprint) => {
  if (total <= 0) {
    return [
      {
        label: 'Sin datos',
        count: 0,
        percent: 100,
        color: PIE_COLORS.fallback
      }
    ];
  }

  return blueprint.map((item) => {
    const value = counts[item.key] || 0;
    return {
      label: item.label,
      count: value,
      percent: total ? (value / total) * 100 : 0,
      color: item.color
    };
  });
};

const buildPieGradient = (segments = []) => {
  if (!segments.length) {
    return `conic-gradient(${PIE_COLORS.fallback} 0% 100%)`;
  }

  let cumulative = 0;
  const stops = segments.map((segment, index) => {
    const start = cumulative;
    cumulative += segment.percent;
    const end = index === segments.length - 1 ? 100 : Math.min(100, cumulative);
    return `${segment.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${stops.join(', ')})`;
};

const buildDynamicSegments = (entries = [], total = 0) => {
  if (!total) {
    return [
      {
        label: 'Sin datos',
        count: 0,
        percent: 100,
        color: PIE_COLORS.fallback
      }
    ];
  }

  return entries.map((entry, index) => ({
    label: entry.label,
    count: entry.count,
    percent: total ? (entry.count / total) * 100 : 0,
    color: entry.color || INVENTORY_PIE_COLORS[index % INVENTORY_PIE_COLORS.length]
  }));
};

const unitToKg = (quantity = 0, unit = '') => {
  const value = Number(quantity) || 0;
  if (!value) return 0;
  const normalizedUnit = (unit || '').toLowerCase();
  if (normalizedUnit === 'libras' || normalizedUnit === 'lb' || normalizedUnit === 'lbs') {
    return value * 0.453592;
  }
  if (normalizedUnit === 'quintales' || normalizedUnit === 'qq') {
    return value * 45.3592;
  }
  return value;
};

const buildTasks = (values = []) =>
  taskTypes.reduce((acc, taskType, index) => {
    acc[taskType.id] = values[index] || { amount: 0, completed: 0 };
    return acc;
  }, {});

const mockTaskPerformance = [
  {
    date: '2023-09-17',
    tasks: buildTasks([
      { amount: 11200, completed: 6 },
      { amount: 9400, completed: 5 },
      { amount: 8100, completed: 4 },
      { amount: 8800, completed: 7 },
      { amount: 7600, completed: 6 },
      { amount: 7100, completed: 8 },
      { amount: 9900, completed: 10 },
      { amount: 6500, completed: 5 },
      { amount: 5400, completed: 4 }
    ])
  },
  {
    date: '2023-11-23',
    tasks: buildTasks([
      { amount: 13400, completed: 8 },
      { amount: 9800, completed: 6 },
      { amount: 8700, completed: 5 },
      { amount: 9300, completed: 8 },
      { amount: 8200, completed: 7 },
      { amount: 7600, completed: 9 },
      { amount: 10500, completed: 11 },
      { amount: 7200, completed: 6 },
      { amount: 5900, completed: 5 }
    ])
  },
  {
    date: '2023-12-10',
    tasks: buildTasks([
      { amount: 15200, completed: 10 },
      { amount: 11200, completed: 7 },
      { amount: 9100, completed: 6 },
      { amount: 9900, completed: 9 },
      { amount: 8500, completed: 8 },
      { amount: 7900, completed: 10 },
      { amount: 11800, completed: 13 },
      { amount: 7800, completed: 7 },
      { amount: 6100, completed: 6 }
    ])
  },
  {
    date: '2024-01-08',
    tasks: buildTasks([
      { amount: 18100, completed: 13 },
      { amount: 12500, completed: 9 },
      { amount: 10200, completed: 7 },
      { amount: 11000, completed: 11 },
      { amount: 9300, completed: 9 },
      { amount: 8600, completed: 12 },
      { amount: 12600, completed: 15 },
      { amount: 8400, completed: 8 },
      { amount: 6700, completed: 7 }
    ])
  },
  {
    date: '2024-01-18',
    tasks: buildTasks([
      { amount: 17400, completed: 12 },
      { amount: 11900, completed: 8 },
      { amount: 9800, completed: 7 },
      { amount: 10800, completed: 10 },
      { amount: 9100, completed: 8 },
      { amount: 8300, completed: 11 },
      { amount: 12100, completed: 14 },
      { amount: 8100, completed: 7 },
      { amount: 6400, completed: 6 }
    ])
  },
  {
    date: '2024-02-19',
    tasks: buildTasks([
      { amount: 16500, completed: 11 },
      { amount: 11500, completed: 8 },
      { amount: 9500, completed: 6 },
      { amount: 10200, completed: 9 },
      { amount: 8700, completed: 8 },
      { amount: 9000, completed: 12 },
      { amount: 13500, completed: 16 },
      { amount: 8600, completed: 8 },
      { amount: 6900, completed: 7 }
    ])
  },
  {
    date: '2024-04-14',
    tasks: buildTasks([
      { amount: 17900, completed: 12 },
      { amount: 12800, completed: 9 },
      { amount: 10900, completed: 8 },
      { amount: 11700, completed: 11 },
      { amount: 9600, completed: 9 },
      { amount: 9400, completed: 13 },
      { amount: 14200, completed: 17 },
      { amount: 9200, completed: 9 },
      { amount: 7300, completed: 7 }
    ])
  },
  {
    date: '2024-05-26',
    tasks: buildTasks([
      { amount: 19400, completed: 14 },
      { amount: 13600, completed: 10 },
      { amount: 11500, completed: 9 },
      { amount: 12300, completed: 12 },
      { amount: 10100, completed: 10 },
      { amount: 9800, completed: 14 },
      { amount: 14900, completed: 18 },
      { amount: 9600, completed: 10 },
      { amount: 7800, completed: 8 }
    ])
  }
];

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const getMonthLabel = (month) => {
  const index = Number(month) - 1;
  return MONTH_LABELS[index] || month;
};

const getDateParts = (dateString) => {
  const [year = '', month = '', day = ''] = dateString.split('-');
  return { year, month, day };
};

const formatCurrency = (value = 0, options = {}) => {
  const { maximumFractionDigits = 0, minimumFractionDigits = maximumFractionDigits } = options;
  const safeValue = Number.isFinite(value) ? value : 0;
  return `Q${safeValue.toLocaleString('es-GT', {
    minimumFractionDigits,
    maximumFractionDigits
  })}`;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { session, logout } = useAdminAuth();
  const [departmentInput, setDepartmentInput] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [municipalityInput, setMunicipalityInput] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');
  const [selectedLotInput, setSelectedLotInput] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const availableYears = useMemo(() => {
    const years = new Set();
    mockTaskPerformance.forEach((entry) => {
      const { year } = getDateParts(entry.date);
      if (year) {
        years.add(year);
      }
    });
    return Array.from(years).sort().reverse();
  }, []);
  const [selectedYearFilter, setSelectedYearFilter] = useState(() => availableYears[0] || '');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('todos');
  const [selectedDayFilter, setSelectedDayFilter] = useState('todos');
  const [selectedSortOption, setSelectedSortOption] = useState('amount-desc');
  const availableMonths = useMemo(() => {
    const months = new Set();
    mockTaskPerformance.forEach((entry) => {
      const { year, month } = getDateParts(entry.date);
      if (year === selectedYearFilter && month) {
        months.add(month);
      }
    });
    return Array.from(months).sort();
  }, [selectedYearFilter]);
  const availableDays = useMemo(() => {
    if (selectedMonthFilter === 'todos') return [];
    const days = new Set();
    mockTaskPerformance.forEach((entry) => {
      const { year, month, day } = getDateParts(entry.date);
      if (year === selectedYearFilter && month === selectedMonthFilter && day) {
        days.add(day);
      }
    });
    return Array.from(days).sort();
  }, [selectedYearFilter, selectedMonthFilter]);
  const filteredOperationalData = useMemo(
    () =>
      mockTaskPerformance.filter((entry) => {
        const { year, month, day } = getDateParts(entry.date);
        if (!selectedYearFilter || year !== selectedYearFilter) return false;
        if (selectedMonthFilter !== 'todos' && month !== selectedMonthFilter) return false;
        if (selectedDayFilter !== 'todos' && day !== selectedDayFilter) return false;
        return true;
      }),
    [selectedYearFilter, selectedMonthFilter, selectedDayFilter]
  );
  const aggregatedTaskMetrics = useMemo(() => {
    const totals = taskTypes.reduce((acc, type) => {
      acc[type.id] = { amount: 0, completed: 0 };
      return acc;
    }, {});
    filteredOperationalData.forEach((entry) => {
      taskTypes.forEach((type) => {
        const values = entry.tasks[type.id];
        if (!values) return;
        totals[type.id].amount += values.amount;
        totals[type.id].completed += values.completed;
      });
    });
    return totals;
  }, [filteredOperationalData]);
  const { totalAmount, totalCompleted } = useMemo(() => {
    return taskTypes.reduce(
      (acc, type) => {
        acc.totalAmount += aggregatedTaskMetrics[type.id]?.amount || 0;
        acc.totalCompleted += aggregatedTaskMetrics[type.id]?.completed || 0;
        return acc;
      },
      { totalAmount: 0, totalCompleted: 0 }
    );
  }, [aggregatedTaskMetrics]);
  const chartData = useMemo(() => {
    const dataPoints = taskTypes.map((type) => ({
      id: type.id,
      label: type.label,
      amount: aggregatedTaskMetrics[type.id]?.amount || 0,
      completed: aggregatedTaskMetrics[type.id]?.completed || 0
    }));
    const sorter = CHART_SORTERS[selectedSortOption] || CHART_SORTERS['amount-desc'];
    const sorted = [...dataPoints].sort(sorter);
    if (sorted.length <= 4) {
      return sorted;
    }
    const topFour = sorted.slice(0, 4);
    const remaining = sorted.slice(4);
    const aggregatedOthers = remaining.reduce(
      (acc, entry) => {
        acc.amount += entry.amount;
        acc.completed += entry.completed;
        return acc;
      },
      { amount: 0, completed: 0 }
    );
    return [
      ...topFour,
      {
        id: 'others',
        label: 'Otros',
        amount: aggregatedOthers.amount,
        completed: aggregatedOthers.completed,
        isAggregate: true,
        count: remaining.length
      }
    ];
  }, [aggregatedTaskMetrics, selectedSortOption]);
  const maxAmount = useMemo(() => {
    const highest = chartData.reduce((currentMax, dataPoint) => {
      return Math.max(currentMax, dataPoint.amount);
    }, 0);
    return highest || 1;
  }, [chartData]);
  const hasOperationalData = filteredOperationalData.length > 0;
  const selectedPeriodLabel = useMemo(() => {
    if (!selectedYearFilter) return 'Selecciona un año para visualizar los datos.';
    if (selectedMonthFilter === 'todos') {
      return `Datos consolidados de todo el año ${selectedYearFilter}`;
    }
    const monthLabel = getMonthLabel(selectedMonthFilter);
    if (selectedDayFilter === 'todos') {
      return `Resultados de ${monthLabel.toLowerCase()} ${selectedYearFilter}`;
    }
    return `Resultados del ${Number(selectedDayFilter)} de ${monthLabel.toLowerCase()} ${selectedYearFilter}`;
  }, [selectedYearFilter, selectedMonthFilter, selectedDayFilter]);

  const filteredMunicipalities = useMemo(() => {
    if (!selectedDepartmentId) return municipalities;
    return municipalities.filter(
      (municipality) => municipality.departmentId === selectedDepartmentId
    );
  }, [selectedDepartmentId]);

  const selectedDepartmentName =
    departments.find((dept) => dept.id === selectedDepartmentId)?.name || '';
  const selectedMunicipalityName =
    municipalities.find((municipality) => municipality.id === selectedMunicipalityId)?.name || '';
  const selectedLotName = lotNames.find((lot) => lot.id === selectedLotId)?.name || '';
  const kpiHighlights = useMemo(() => {
    const lotSummary = LOT_SUMMARY[selectedLotId];
    const lotCount = selectedLotId ? 1 : lotNames.length || 1;
    const activeHectares = selectedLotId
      ? lotSummary?.hectares || DEFAULT_LOT_SUMMARY.hectares
      : TOTAL_HECTARES || DEFAULT_LOT_SUMMARY.hectares;
    const inventoryValuation = selectedLotId
      ? lotSummary?.inventoryValue || DEFAULT_LOT_SUMMARY.inventoryValue
      : TOTAL_INVENTORY_VALUE || DEFAULT_LOT_SUMMARY.inventoryValue;
    const safeAmount = totalAmount || 0;
    const safeCompleted = totalCompleted || 0;

    const costPerTask =
      safeCompleted > 0
        ? formatCurrency(safeAmount / safeCompleted, { maximumFractionDigits: 2 })
        : formatCurrency(0, { maximumFractionDigits: 2 });
    const costPerLot = formatCurrency(safeAmount / Math.max(lotCount, 1));
    const costPerHectare =
      activeHectares > 0
        ? formatCurrency(safeAmount / activeHectares, { maximumFractionDigits: 2 })
        : formatCurrency(0, { maximumFractionDigits: 2 });

    return [
      {
        label: 'Costo por tarea',
        value: costPerTask,
        helper: safeCompleted
          ? `${safeCompleted.toLocaleString('es-GT')} tareas completadas`
          : 'Sin registros de tareas'
      },
      {
        label: 'Costo promedio por lote',
        value: costPerLot,
        helper: selectedLotName || `${lotCount} lotes simulados`
      },
      {
        label: 'Costo promedio por hectárea',
        value: costPerHectare,
        helper: selectedLotName
          ? `${activeHectares} ha estimadas`
          : `${activeHectares} ha monitoreadas`
      },
      {
        label: 'Valor de inventario',
        value: formatCurrency(inventoryValuation),
        helper: selectedLotName ? `Inventario de ${selectedLotName}` : 'Inventario consolidado'
      }
    ];
  }, [selectedLotId, selectedLotName, totalAmount, totalCompleted]);

  const inventoryStats = useMemo(() => {
    const types = Array.isArray(TYPEPROD) ? TYPEPROD : [];
    const categories = Array.isArray(CATEGORYPROD) ? CATEGORYPROD : [];

    const typeCounts = types.reduce((acc, typeItem) => {
      const label = typeItem?.type || 'No definido';
      acc[label] = (acc[label] || 0) + 1;
      acc.__total += 1;
      const categoryId = Number(typeItem?.category);
      acc.__categories[categoryId] = (acc.__categories[categoryId] || 0) + 1;
      return acc;
    }, { __total: 0, __categories: {} });

    const totalTypes = typeCounts.__total || 0;
    const categoryCounts = typeCounts.__categories;

    const typeEntries = Object.entries(typeCounts)
      .filter(([key]) => key !== '__total' && key !== '__categories')
      .map(([label, count], index) => ({
        label,
        count,
        color: INVENTORY_PIE_COLORS[index % INVENTORY_PIE_COLORS.length]
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));

    const displayedTypes = typeEntries.slice(0, 6);
    const displayedTotal = displayedTypes.reduce((sum, entry) => sum + entry.count, 0);
    const remaining = Math.max(totalTypes - displayedTotal, 0);
    if (remaining > 0) {
      displayedTypes.push({
        label: 'Otros tipos',
        count: remaining,
        color: '#cfd8dc'
      });
    }

    const typeSegments = buildDynamicSegments(displayedTypes, totalTypes);

    const categoryEntries = categories.map((category, index) => ({
      label: category.name,
      count: categoryCounts[category.id] || 0,
      color: INVENTORY_PIE_COLORS[(index + 3) % INVENTORY_PIE_COLORS.length]
    }));

    const categorySegments = buildDynamicSegments(
      categoryEntries,
      totalTypes || categoryEntries.reduce((sum, entry) => sum + entry.count, 0)
    );

    return {
      totalTypes,
      totalCategories: categories.length,
      typeSegments,
      categorySegments
    };
  }, []);

  const salesInsights = useMemo(() => {
    const sales = Array.isArray(VENTASTEST) ? VENTASTEST : [];
    if (!sales.length) {
      return {
        hasSales: false,
        topClient: null,
        cropBars: [],
        maxCropKg: 0
      };
    }

    const clientTotals = {};
    const cropTotals = {};

    sales.forEach((sale) => {
      const clientName = sale?.nombre || `Cliente ${sale?.id_cliente || 'N/D'}`;
      const amount = Number(sale?.monto) || 0;
      const quantityKg = unitToKg(sale?.cantidad, sale?.unidad);
      if (!clientTotals[clientName]) {
        clientTotals[clientName] = { amount: 0, quantityKg: 0 };
      }
      clientTotals[clientName].amount += amount;
      clientTotals[clientName].quantityKg += quantityKg;

      const cropId = Number(sale?.id_cultivo);
      const cropLabel = CROP_NAME_BY_ID[cropId] || sale?.nombre_lote || 'Cultivo sin nombre';
      cropTotals[cropLabel] = (cropTotals[cropLabel] || 0) + amount;
    });

    const clientEntries = Object.entries(clientTotals).map(([label, stats]) => ({
      label,
      ...stats
    }));
    clientEntries.sort((a, b) => b.amount - a.amount);
    const topClient = clientEntries[0] || null;

    const cropEntries = Object.entries(cropTotals).map(([label, amount]) => ({
      label,
      amount
    }));
    cropEntries.sort((a, b) => b.amount - a.amount);
    const cropBars = cropEntries.slice(0, 5).map((entry) => ({
      label: entry.label,
      amount: Number((entry.amount || 0).toFixed(2))
    }));
    const maxCropAmount = cropBars.reduce((max, entry) => Math.max(max, entry.amount), 0);

    return {
      hasSales: true,
      topClient,
      cropBars,
      maxCropAmount
    };
  }, [VENTASTEST]);

  const workforceStats = useMemo(() => {
    const personnel = Array.isArray(PERSONALTEST) ? PERSONALTEST : [];
    const counts = personnel.reduce(
      (acc, person) => {
        const isInPayroll = Number(person?.isinplanilla) === 1;
        const normalizedGender = (person?.genero || '').toLowerCase();

        if (isInPayroll) {
          acc.onPayroll += 1;
        } else {
          acc.offPayroll += 1;
        }

        if (normalizedGender === 'masculino') {
          acc.men += 1;
        } else if (normalizedGender === 'femenino') {
          acc.women += 1;
        } else {
          acc.unknownGender += 1;
        }

        return acc;
      },
      { onPayroll: 0, offPayroll: 0, men: 0, women: 0, unknownGender: 0 }
    );

    const payrollTotal = counts.onPayroll + counts.offPayroll;
    const genderTotal = counts.men + counts.women;

    return {
      totalPersonnel: personnel.length,
      payroll: {
        total: payrollTotal,
        segments: createPieSegments(counts, payrollTotal, [
          { key: 'onPayroll', label: 'En planilla', color: PIE_COLORS.payroll },
          { key: 'offPayroll', label: 'Fuera de planilla', color: PIE_COLORS.offPayroll }
        ])
      },
      gender: {
        total: genderTotal,
        segments: createPieSegments(counts, genderTotal, [
          { key: 'men', label: 'Hombres', color: PIE_COLORS.men },
          { key: 'women', label: 'Mujeres', color: PIE_COLORS.women }
        ]),
        missing: counts.unknownGender
      }
    };
  }, [PERSONALTEST]);

  useEffect(() => {
    setSelectedMonthFilter('todos');
    setSelectedDayFilter('todos');
  }, [selectedYearFilter]);

  useEffect(() => {
    setSelectedDayFilter('todos');
  }, [selectedMonthFilter]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleDepartmentChange = (event) => {
    const value = event.target.value;
    setDepartmentInput(value);
    const match = departments.find(
      (department) => department.name.toLowerCase() === value.toLowerCase()
    );
    setSelectedDepartmentId(match?.id || '');
    if (!match) {
      setMunicipalityInput('');
      setSelectedMunicipalityId('');
    }
  };

  const handleMunicipalityChange = (event) => {
    const value = event.target.value;
    setMunicipalityInput(value);
    const match = filteredMunicipalities.find(
      (municipality) => municipality.name.toLowerCase() === value.toLowerCase()
    );
    setSelectedMunicipalityId(match?.id || '');
  };

  const handleLotChange = (event) => {
    const value = event.target.value;
    setSelectedLotInput(value);
    const match = lotNames.find((lot) => lot.name.toLowerCase() === value.toLowerCase());
    setSelectedLotId(match?.id || '');
  };

  return (
    <div className="admin-dashboard__wrapper">
      <header className="admin-dashboard__header">
        <div>
          <h1>Dashboard TerraControl</h1>
          <p>Bienvenido, {session?.user?.username}</p>
        </div>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <div className="admin-dashboard__grid">
        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--map">
          <p className="admin-dashboard__quadrant-label">Cuadrante 1</p>
          <div className="admin-dashboard__map">
            <div className="admin-dashboard__map-filters">
              <label>
                <span>Departamento</span>
                <input
                  type="text"
                  list="departments-list"
                  placeholder="Busca un departamento"
                  value={departmentInput}
                  onChange={handleDepartmentChange}
                />
                <datalist id="departments-list">
                  {departments.map((department) => (
                    <option key={department.id} value={department.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span>Municipio</span>
                <input
                  type="text"
                  list="municipalities-list"
                  placeholder="Busca municipio"
                  value={municipalityInput}
                  onChange={handleMunicipalityChange}
                />
                <datalist id="municipalities-list">
                  {filteredMunicipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.name} />
                  ))}
                </datalist>
              </label>
              <label>
                <span>Lote</span>
                <input
                  type="text"
                  list="lots-list"
                  placeholder="Selecciona un lote"
                  value={selectedLotInput}
                  onChange={handleLotChange}
                />
                <datalist id="lots-list">
                  {lotNames.map((lot) => (
                    <option key={lot.id} value={lot.name} />
                  ))}
                </datalist>
              </label>
            </div>
            <GeoPolygonMap
              selectedDepartment={selectedDepartmentName}
              selectedMunicipality={selectedMunicipalityName}
              selectedLot={selectedLotName}
            />
          </div>
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--summary">
          <div className="admin-dashboard__summary-header">
            <div>
              <p className="admin-dashboard__quadrant-label">Cuadrante 2</p>
              <h2>Resumen operativo</h2>
              <p>Última sincronización: {new Date().toLocaleString()}</p>
            </div>
            <div className="admin-dashboard__chart-filters">
              <label>
                <span>Año</span>
                <select
                  value={selectedYearFilter}
                  onChange={(event) => setSelectedYearFilter(event.target.value)}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Mes</span>
                <select
                  value={selectedMonthFilter}
                  onChange={(event) => setSelectedMonthFilter(event.target.value)}
                  disabled={!availableMonths.length}
                >
                  <option value="todos">Todos</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {getMonthLabel(month)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Día</span>
                <select
                  value={selectedDayFilter}
                  onChange={(event) => setSelectedDayFilter(event.target.value)}
                  disabled={selectedMonthFilter === 'todos' || !availableDays.length}
                >
                  <option value="todos">Todos</option>
                  {availableDays.map((day) => (
                    <option key={day} value={day}>
                      {Number(day)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Orden</span>
                <select
                  value={selectedSortOption}
                  onChange={(event) => setSelectedSortOption(event.target.value)}
                >
                  {CHART_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="admin-dashboard__chart">
            <div className="admin-dashboard__chart-bars">
              {chartData.map((entry, index) => {
                const amount = entry.amount || 0;
                const completed = entry.completed || 0;
                const normalizedHeight = amount ? Math.max((amount / maxAmount) * 100, 8) : 0;
                const barKey = [
                  entry.id,
                  selectedSortOption,
                  selectedYearFilter,
                  selectedMonthFilter,
                  selectedDayFilter,
                  amount,
                  completed
                ].join('-');
                return (
                  <div
                    key={barKey}
                    className="admin-dashboard__chart-bar"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div
                      className="admin-dashboard__chart-bar-fill"
                      style={{ height: `${normalizedHeight}%` }}
                    >
                      <span>{`Q${amount.toLocaleString('es-GT')}`}</span>
                    </div>
                    <p>
                      {entry.label}
                      {entry.isAggregate && entry.count ? ` (${entry.count})` : ''}
                    </p>
                    <small>{`${completed.toLocaleString('es-GT')} tareas${
                      entry.isAggregate ? ' totales' : ''
                    }`}</small>
                  </div>
                );
              })}
            </div>
            <p className="admin-dashboard__chart-caption">
              {hasOperationalData
                ? selectedPeriodLabel
                : 'No hay datos simulados para este periodo.'}
            </p>
          </div>
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--requests">
          <p className="admin-dashboard__quadrant-label">Cuadrante 3</p>
          <h2>Distribución del personal</h2>
          <p className="admin-dashboard__workforce-summary">
            {`Total de colaboradores: ${workforceStats.totalPersonnel}`}
          </p>
          <div className="admin-dashboard__pie-grid">
            <article className="admin-dashboard__pie-card">
              <div className="admin-dashboard__pie-card-header">
                <h3>Planilla</h3>
                <span>{`Base: ${workforceStats.payroll.total} personas`}</span>
              </div>
              <div
                className="admin-dashboard__pie-chart"
                style={{ backgroundImage: buildPieGradient(workforceStats.payroll.segments) }}
              >
                <div className="admin-dashboard__pie-center">
                  <strong>{workforceStats.payroll.total}</strong>
                  <small>colaboradores</small>
                </div>
              </div>
              <ul className="admin-dashboard__pie-legend">
                {workforceStats.payroll.segments.map((segment) => (
                  <li key={segment.label}>
                    <span
                      className="admin-dashboard__legend-dot"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p>{segment.label}</p>
                      <small>{`${segment.count} (${segment.percent.toFixed(1)}%)`}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
            <article className="admin-dashboard__pie-card">
              <div className="admin-dashboard__pie-card-header">
                <h3>Género</h3>
                <span>{`Base: ${workforceStats.gender.total} personas`}</span>
              </div>
              <div
                className="admin-dashboard__pie-chart"
                style={{ backgroundImage: buildPieGradient(workforceStats.gender.segments) }}
              >
                <div className="admin-dashboard__pie-center">
                  <strong>{workforceStats.gender.total}</strong>
                  <small>registros</small>
                </div>
              </div>
              <ul className="admin-dashboard__pie-legend">
                {workforceStats.gender.segments.map((segment) => (
                  <li key={segment.label}>
                    <span
                      className="admin-dashboard__legend-dot"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p>{segment.label}</p>
                      <small>{`${segment.count} (${segment.percent.toFixed(1)}%)`}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
          {workforceStats.gender.missing > 0 && (
            <p className="admin-dashboard__workforce-note">
              {`${workforceStats.gender.missing} colaborador(es) sin registro de género.`}
            </p>
          )}
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--activity">
          <p className="admin-dashboard__quadrant-label">Cuadrante 4</p>
          <div className="admin-dashboard__activity-header">
            <h2>KPIs financieros</h2>
            <p>
              {selectedLotName
                ? `Contexto financiero para ${selectedLotName}`
                : 'Promedios consolidados de los lotes simulados'}
            </p>
          </div>
          <div className="admin-dashboard__kpi-grid">
            {kpiHighlights.map((kpi) => (
              <article key={kpi.label} className="admin-dashboard__kpi-card">
                <p className="admin-dashboard__kpi-label">{kpi.label}</p>
                <strong className="admin-dashboard__kpi-value">{kpi.value}</strong>
                <small className="admin-dashboard__kpi-helper">{kpi.helper}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--inventory">
          <p className="admin-dashboard__quadrant-label">Cuadrante 5</p>
          <div className="admin-dashboard__inventory-header">
            <h2>Inventario</h2>
            <p>
              {inventoryStats.totalTypes
                ? `${inventoryStats.totalTypes} tipos registrados`
                : 'Sin datos de inventario'}
            </p>
          </div>
          <div className="admin-dashboard__pie-grid">
            <article className="admin-dashboard__pie-card">
              <div className="admin-dashboard__pie-card-header">
                <h3>Tipos de inventario</h3>
                <span>{`Mostrando hasta 6 tipos destacados`}</span>
              </div>
              <div
                className="admin-dashboard__pie-chart"
                style={{ backgroundImage: buildPieGradient(inventoryStats.typeSegments) }}
              >
                <div className="admin-dashboard__pie-center">
                  <strong>{inventoryStats.totalTypes}</strong>
                  <small>tipos definidos</small>
                </div>
              </div>
              <ul className="admin-dashboard__pie-legend">
                {inventoryStats.typeSegments.map((segment) => (
                  <li key={segment.label}>
                    <span
                      className="admin-dashboard__legend-dot"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p>{segment.label}</p>
                      <small>{`${segment.count} (${segment.percent.toFixed(1)}%)`}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
            <article className="admin-dashboard__pie-card">
              <div className="admin-dashboard__pie-card-header">
                <h3>Categorías</h3>
                <span>{`${inventoryStats.totalCategories} categorías activas`}</span>
              </div>
              <div
                className="admin-dashboard__pie-chart"
                style={{ backgroundImage: buildPieGradient(inventoryStats.categorySegments) }}
              >
                <div className="admin-dashboard__pie-center">
                  <strong>{inventoryStats.totalCategories}</strong>
                  <small>categorías</small>
                </div>
              </div>
              <ul className="admin-dashboard__pie-legend">
                {inventoryStats.categorySegments.map((segment) => (
                  <li key={segment.label}>
                    <span
                      className="admin-dashboard__legend-dot"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div>
                      <p>{segment.label}</p>
                      <small>{`${segment.count} (${segment.percent.toFixed(1)}%)`}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="admin-dashboard__quadrant admin-dashboard__quadrant--sales">
          <p className="admin-dashboard__quadrant-label">Cuadrante 6</p>
          <div className="admin-dashboard__sales-header">
            <h2>Ventas destacadas</h2>
            <p>{salesInsights.hasSales ? 'Datos simulados de ventas' : 'Sin registros de ventas'}</p>
          </div>
          <div className="admin-dashboard__sales-content">
            <article className="admin-dashboard__sales-card">
              <h3>Cliente con mayor facturación</h3>
              {salesInsights.topClient ? (
                <>
                  <p className="admin-dashboard__sales-client">{salesInsights.topClient.label}</p>
                  <strong className="admin-dashboard__sales-value">
                    {formatCurrency(salesInsights.topClient.amount)}
                  </strong>
                  <small>
                    {`${salesInsights.topClient.quantityKg.toLocaleString('es-GT', {
                      maximumFractionDigits: 2
                    })} kg despachados`}
                  </small>
                </>
              ) : (
                <p className="admin-dashboard__sales-empty">Agrega ventas para ver este KPI.</p>
              )}
            </article>
            <div className="admin-dashboard__sales-chart">
              <div className="admin-dashboard__sales-chart-header">
                <h3>Top 5 cultivos vendidos (Q)</h3>
                <span>Comparativo por ingresos</span>
              </div>
              {salesInsights.cropBars.length ? (
                <div className="admin-dashboard__sales-bars">
                  {salesInsights.cropBars.map((bar) => {
                    const normalized =
                      salesInsights.maxCropAmount > 0
                        ? Math.max((bar.amount / salesInsights.maxCropAmount) * 100, 4)
                        : 0;
                    return (
                      <div key={bar.label} className="admin-dashboard__sales-bar">
                        <div className="admin-dashboard__sales-bar-info">
                          <p>{bar.label}</p>
                          <strong>{formatCurrency(bar.amount)}</strong>
                        </div>
                        <div className="admin-dashboard__sales-bar-track">
                          <div
                            className="admin-dashboard__sales-bar-fill"
                            style={{ width: `${normalized}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="admin-dashboard__sales-empty">
                  Registra ventas para visualizar los cultivos destacados.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
