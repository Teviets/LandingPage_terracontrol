import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { TASKTYPE } from '../../../utils/app/Task';
import { PERSONALTEST, VENTASTEST } from '../../../utils/app/Test';
import { TYPEPROD, CATEGORYPROD } from '../../../utils/app/Inventary';
import { CULTIVOS } from '../../../utils/app/Cultivos';
import { departments, municipalities, lotNames } from '../data/geoData';
import GeoPolygonMap from '../map/GeoPolygonMap';
import { externalApiClient } from '../../../utils/externalApiClient';
import './admin-dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

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

const DASHBOARD_MENU_OPTIONS = [
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'usuarios', label: 'Usuarios' }
];

const USER_ACTIVITY_WINDOWS = {
  activeDays: 30,
  newDays: 15,
  upcomingPaymentDays: 20
};

const PERMISSION_LABELS = {
  lotes: 'Lotes',
  inventario: 'Inventario',
  tareas: 'Tareas',
  compras: 'Compras',
  ventas: 'Ventas',
  personal: 'Personal'
};

const MOCK_USER_ACCOUNTS = [
  {
    id: 101,
    nombre: 'Ana López',
    correo: 'ana@terracontrol.gt',
    usuario: 'alopez',
    cultivo: 'Café',
    areaCultivo: 42,
    unidadArea: 'ha',
    ubicacion: 'Alta Verapaz',
    payment: {
      metodo: 'Tarjeta',
      finalizacion: '2024-11-05',
      estado: 'Activo',
      detalle: 'Visa **** 2845'
    },
    permissions: {
      lotes: 1,
      inventario: 1,
      tareas: 1,
      compras: 0,
      ventas: 1,
      personal: 0
    },
    createdAt: '2024-01-12',
    updatedAt: '2024-05-20',
    lastLogin: '2024-06-05'
  },
  {
    id: 102,
    nombre: 'Diego Hernández',
    correo: 'dhernandez@terracontrol.gt',
    usuario: 'dhernandez',
    cultivo: 'Cardamomo',
    areaCultivo: 18,
    unidadArea: 'ha',
    ubicacion: 'Quiché',
    payment: {
      metodo: 'Depósito',
      finalizacion: '2024-07-02',
      estado: 'Pendiente',
      detalle: 'Banco Industrial 654789'
    },
    permissions: {
      lotes: 1,
      inventario: 0,
      tareas: 1,
      compras: 1,
      ventas: 1,
      personal: 0
    },
    createdAt: '2023-12-01',
    updatedAt: '2024-04-10',
    lastLogin: '2024-05-12'
  },
  {
    id: 103,
    nombre: 'María Rivera',
    correo: 'mrivera@terracontrol.gt',
    usuario: 'mrivera',
    cultivo: 'Cacao',
    areaCultivo: 25,
    unidadArea: 'ha',
    ubicacion: 'Suchitepéquez',
    payment: {
      metodo: 'Transferencia',
      finalizacion: '2024-06-10',
      estado: 'Vencido',
      detalle: 'Interbanco 874512'
    },
    permissions: {
      lotes: 1,
      inventario: 1,
      tareas: 1,
      compras: 0,
      ventas: 0,
      personal: 1
    },
    createdAt: '2023-11-15',
    updatedAt: '2024-05-02',
    lastLogin: '2024-03-28'
  },
  {
    id: 104,
    nombre: 'Carlos Méndez',
    correo: 'cmendez@terracontrol.gt',
    usuario: 'cmendez',
    cultivo: 'Aguacate',
    areaCultivo: 30,
    unidadArea: 'ha',
    ubicacion: 'Chimaltenango',
    payment: {
      metodo: 'Tarjeta',
      finalizacion: '2024-08-18',
      estado: 'Activo',
      detalle: 'Mastercard **** 9101'
    },
    permissions: {
      lotes: 1,
      inventario: 1,
      tareas: 1,
      compras: 1,
      ventas: 1,
      personal: 1
    },
    createdAt: '2024-02-05',
    updatedAt: '2024-05-30',
    lastLogin: '2024-06-10'
  },
  {
    id: 105,
    nombre: 'Luisa García',
    correo: 'lgarcia@terracontrol.gt',
    usuario: 'lgarcia',
    cultivo: 'Hortalizas',
    areaCultivo: 12,
    unidadArea: 'ha',
    ubicacion: 'Sacatepéquez',
    payment: {
      metodo: 'Mixto',
      finalizacion: '2024-09-01',
      estado: 'Activo',
      detalle: 'Tarjeta + depósito'
    },
    permissions: {
      lotes: 1,
      inventario: 1,
      tareas: 0,
      compras: 0,
      ventas: 1,
      personal: 0
    },
    createdAt: '2024-06-02',
    updatedAt: '2024-06-06',
    lastLogin: '2024-06-07'
  }
];

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

const buildDoughnutChartConfig = (segments = []) => {
  const labels = segments.map((segment) => segment.label);
  const counts = segments.map((segment) => segment.count);
  const colors = segments.map((segment) => segment.color);
  return {
    data: {
      labels: labels.length ? labels : ['Sin datos'],
      datasets: [
        {
          data: counts.length ? counts : [1],
          backgroundColor: colors.length ? colors : [PIE_COLORS.fallback],
          borderWidth: 0,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const segment = segments[context.dataIndex];
              if (!segment) {
                return `${context.label}: ${context.parsed}`;
              }
              return `${segment.label}: ${segment.count} (${segment.percent.toFixed(1)}%)`;
            }
          }
        }
      }
    }
  };
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

const formatFullDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Sin registro';
  }
  return date.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatElapsedDays = (days) => {
  if (!Number.isFinite(days)) return 'Sin registro';
  if (Math.abs(days) < 1) return 'Hoy';
  const rounded = Math.round(days);
  return `Hace ${rounded} día${rounded === 1 ? '' : 's'}`;
};

const formatFutureDays = (days) => {
  if (!Number.isFinite(days)) return 'Sin registro';
  if (Math.abs(days) < 1) return 'Hoy';
  const rounded = Math.round(Math.abs(days));
  if (days >= 0) {
    return `En ${rounded} día${rounded === 1 ? '' : 's'}`;
  }
  return `Vencido hace ${rounded} día${rounded === 1 ? '' : 's'}`;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { session, logout } = useAdminAuth();
  const [activeView, setActiveView] = useState('operaciones');
  const [departmentInput, setDepartmentInput] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [municipalityInput, setMunicipalityInput] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [locationsData, setLocationsData] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState('');
  const [showMapFilters, setShowMapFilters] = useState(true);
  const [showMapSummary, setShowMapSummary] = useState(true);
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
        acc.breakdown.push({
          id: entry.id,
          label: entry.label,
          amount: entry.amount,
          completed: entry.completed
        });
        return acc;
      },
      { amount: 0, completed: 0, breakdown: [] }
    );
    return [
      ...topFour,
      {
        id: 'others',
        label: 'Otros',
        amount: aggregatedOthers.amount,
        completed: aggregatedOthers.completed,
        isAggregate: true,
        count: remaining.length,
        breakdown: aggregatedOthers.breakdown
      }
    ];
  }, [aggregatedTaskMetrics, selectedSortOption]);
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

  const operationalBarChart = useMemo(() => {
    const labels = chartData.map((entry) =>
      entry.isAggregate && entry.count ? `${entry.label} (${entry.count})` : entry.label
    );
    const datasetValues = chartData.map((entry) => entry.amount || 0);
    const backgroundColors = chartData.map((entry) =>
      entry.isAggregate ? 'rgba(67, 160, 71, 0.35)' : 'rgba(46, 125, 50, 0.85)'
    );
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Monto',
            data: datasetValues,
            backgroundColor: backgroundColors,
            borderRadius: 8,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value =
                  typeof context.parsed.y === 'number' ? context.parsed.y : context.parsed;
                return `Monto: ${formatCurrency(value)}`;
              },
              afterLabel: (context) => {
                const entry = chartData[context.dataIndex];
                if (!entry) return '';
                const tasksLabel = entry.isAggregate ? 'tareas totales' : 'tareas';
                return `Tareas: ${(
                  entry.completed || 0
                ).toLocaleString('es-GT')} ${tasksLabel}`;
              },
              footer: (contexts) => {
                const entry = chartData[contexts[0]?.dataIndex];
                if (!entry?.isAggregate || !entry.breakdown?.length) return '';
                const breakdownPreview = entry.breakdown.slice(0, 3).map((item) => {
                  return `${item.label}: ${formatCurrency(item.amount || 0)}`;
                });
                if (entry.breakdown.length > 3) {
                  breakdownPreview.push('...');
                }
                return ['Desglose:', ...breakdownPreview];
              }
            }
          }
        },
        layout: {
          padding: { top: 10, bottom: 0, left: 0, right: 0 }
        },
        scales: {
          x: {
            ticks: {
              color: 'var(--tc-text-muted)',
              maxRotation: 0
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: 'var(--tc-text-muted)',
              callback: (value) => `Q${Number(value).toLocaleString('es-GT')}`
            },
            grid: {
              color: 'rgba(67, 160, 71, 0.12)'
            }
          }
        }
      }
    };
  }, [chartData]);

  const filteredMunicipalities = useMemo(() => {
    if (!selectedDepartmentId) return municipalities;
    return municipalities.filter(
      (municipality) => municipality.departmentId === selectedDepartmentId
    );
  }, [selectedDepartmentId]);

  const fincaOptions = useMemo(
    () =>
      (Array.isArray(locationsData) ? locationsData : []).map((location) => ({
        id: String(location.id),
        name: location.nombre || `Finca ${location.id}`
      })),
    [locationsData]
  );

  const selectedDepartmentName =
    departments.find((dept) => dept.id === selectedDepartmentId)?.name || '';
  const selectedMunicipalityName =
    municipalities.find((municipality) => municipality.id === selectedMunicipalityId)?.name || '';
  const selectedLotName = fincaOptions.find((lot) => lot.id === selectedLotId)?.name || '';

  useEffect(() => {
    let cancelled = false;

    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError('');
      const fincaQueryParam =
        selectedLotId && /^\d+$/.test(String(selectedLotId)) ? String(selectedLotId) : '';
      const query = {};
      if (fincaQueryParam) {
        query.finca = fincaQueryParam;
      }
      if (selectedDepartmentName) {
        query.departamento = selectedDepartmentName;
      }
      if (selectedMunicipalityName) {
        query.municipio = selectedMunicipalityName;
      }

      try {
        const payload = await externalApiClient.get('/dashboard/locations', {
          query
        });
        if (cancelled) return;
        const records = Array.isArray(payload?.data) ? payload.data : [];
        setLocationsData(records);
      } catch (error) {
        if (cancelled) return;
        setLocationsData([]);
        setLocationsError(error.message || 'No se pudieron cargar las fincas.');
      } finally {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      }
    };

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [selectedDepartmentName, selectedMunicipalityName, selectedLotId]);
  const kpiHighlights = useMemo(() => {
    const lotSummary = LOT_SUMMARY[selectedLotId];
    const lotCount = selectedLotId ? 1 : fincaOptions.length || lotNames.length || 1;
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
        label: 'Costo promedio por finca',
        value: costPerLot,
        helper: selectedLotName || `${lotCount} fincas monitoreadas`
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
  }, [selectedLotId, selectedLotName, totalAmount, totalCompleted, fincaOptions.length]);

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

    const typeSegments = buildDynamicSegments(typeEntries, totalTypes);

    const categoryEntries = categories.map((category, index) => {
      const baseColor = INVENTORY_PIE_COLORS[(index + 3) % INVENTORY_PIE_COLORS.length];
      const normalizedName = (category.name || '').toLowerCase();
      const customColor =
        normalizedName === 'agroquimicos' || normalizedName === 'agroquímicos'
          ? '#f59e0b'
          : baseColor;
      return {
        label: category.name,
        count: categoryCounts[category.id] || 0,
        color: customColor
      };
    });

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
    const taskTypeAssignments = taskTypes
      .map((taskType) => {
        let assignedPeople = 0;
        let totalTasks = 0;

        personnel.forEach((person) => {
          const tasksByType = person?.info_tareas?.tareas_por_tipo || {};
          const count = Number(tasksByType?.[taskType.label]) || 0;
          if (count > 0) {
            assignedPeople += 1;
          }
          totalTasks += count;
        });

        return {
          id: taskType.id,
          label: taskType.label,
          assignedPeople,
          percentage: personnel.length ? (assignedPeople / personnel.length) * 100 : 0,
          averageTasksPerPerson: assignedPeople ? totalTasks / assignedPeople : 0
        };
      })
      .filter((entry) => entry.assignedPeople > 0)
      .sort((a, b) => b.assignedPeople - a.assignedPeople);

    const maxAssignedPeople = taskTypeAssignments.reduce(
      (max, entry) => Math.max(max, entry.assignedPeople),
      0
    );

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
      },
      taskAssignments: {
        entries: taskTypeAssignments,
        maxAssigned: maxAssignedPeople
      }
    };
  }, [PERSONALTEST]);

  const payrollPieChart = useMemo(
    () => buildDoughnutChartConfig(workforceStats.payroll.segments),
    [workforceStats.payroll.segments]
  );
  const genderPieChart = useMemo(
    () => buildDoughnutChartConfig(workforceStats.gender.segments),
    [workforceStats.gender.segments]
  );

  const userInsights = useMemo(() => {
    const now = new Date();
    const MS_IN_DAY = 1000 * 60 * 60 * 24;
    const accounts = (Array.isArray(MOCK_USER_ACCOUNTS) ? MOCK_USER_ACCOUNTS : []).map((account) => {
      const createdAt = account.createdAt ? new Date(account.createdAt) : null;
      const updatedAt = account.updatedAt ? new Date(account.updatedAt) : null;
      const lastLogin = account.lastLogin ? new Date(account.lastLogin) : null;
      const paymentEnd = account.payment?.finalizacion ? new Date(account.payment.finalizacion) : null;
      const daysSinceLastLogin = lastLogin ? (now - lastLogin) / MS_IN_DAY : Infinity;
      const daysSinceCreated = createdAt ? (now - createdAt) / MS_IN_DAY : Infinity;
      const daysUntilRenewal = paymentEnd ? (paymentEnd - now) / MS_IN_DAY : Infinity;
      return {
        ...account,
        createdAt,
        updatedAt,
        lastLogin,
        paymentEnd,
        daysSinceLastLogin,
        daysSinceCreated,
        daysUntilRenewal
      };
    });

    const totalUsers = accounts.length;
    const activeUsers = accounts.filter(
      (account) => account.daysSinceLastLogin <= USER_ACTIVITY_WINDOWS.activeDays
    ).length;
    const newUsers = accounts.filter(
      (account) => account.daysSinceCreated <= USER_ACTIVITY_WINDOWS.newDays
    ).length;
    const inactiveUsers = Math.max(totalUsers - activeUsers, 0);

    const paymentStatus = accounts.reduce(
      (acc, account) => {
        if (!account.paymentEnd || Number.isNaN(account.paymentEnd.getTime())) {
          acc.desconocido += 1;
          return acc;
        }
        if (account.daysUntilRenewal < 0) {
          acc.vencido += 1;
        } else if (account.daysUntilRenewal <= USER_ACTIVITY_WINDOWS.upcomingPaymentDays) {
          acc.proximo += 1;
        } else {
          acc.alDia += 1;
        }
        return acc;
      },
      { alDia: 0, proximo: 0, vencido: 0, desconocido: 0 }
    );

    const methodUsage = accounts.reduce(
      (acc, account) => {
        const methodLabel = (account.payment?.metodo || 'Sin método').trim();
        acc[methodLabel] = (acc[methodLabel] || 0) + 1;
        acc.__total += 1;
        return acc;
      },
      { __total: 0 }
    );

    const methodEntries = Object.entries(methodUsage)
      .filter(([label]) => label !== '__total')
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const maxMethodCount = methodEntries.reduce((max, entry) => Math.max(max, entry.count), 0);

    const permissionStats = Object.entries(PERMISSION_LABELS).map(([key, label]) => {
      const granted = accounts.filter((account) => Number(account.permissions?.[key]) === 1).length;
      return {
        key,
        label,
        granted,
        coverage: accounts.length ? (granted / accounts.length) * 100 : 0
      };
    });

    const upcomingRenewals = accounts
      .filter((account) => account.paymentEnd && Number.isFinite(account.daysUntilRenewal) && account.daysUntilRenewal >= 0)
      .sort((a, b) => a.paymentEnd - b.paymentEnd)
      .slice(0, 3);

    const highlightedUsers = accounts
      .slice()
      .sort((a, b) => a.daysSinceLastLogin - b.daysSinceLastLogin)
      .slice(0, 5);

    const monthlyTotals = new Map();
    accounts.forEach((account) => {
      if (!account.createdAt || Number.isNaN(account.createdAt.getTime())) return;
      const year = account.createdAt.getFullYear();
      const monthIndex = account.createdAt.getMonth();
      const key = `${year}-${monthIndex}`;
      const existing = monthlyTotals.get(key) || { year, monthIndex, count: 0 };
      existing.count += 1;
      monthlyTotals.set(key, existing);
    });

    const orderedMonths = Array.from(monthlyTotals.values()).sort((a, b) => {
      if (a.year === b.year) {
        return a.monthIndex - b.monthIndex;
      }
      return a.year - b.year;
    });
    const monthlySignups = orderedMonths
      .slice(-6)
      .map((entry) => ({
        label: `${MONTH_LABELS[entry.monthIndex]} ${entry.year}`,
        count: entry.count
      }));
    const maxMonthlySignups = monthlySignups.reduce(
      (max, entry) => Math.max(max, entry.count),
      0
    );

    return {
      accounts,
      totalUsers,
      activeUsers,
      newUsers,
      inactiveUsers,
      paymentStatus,
      methodEntries,
      maxMethodCount,
      permissionStats,
      upcomingRenewals,
      highlightedUsers,
      monthlySignups,
      maxMonthlySignups
    };
  }, []);

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
    setSelectedLotId(value);
  };

  const formatPermissionsList = (permissions = {}) => {
    const grantedLabels = Object.entries(PERMISSION_LABELS)
      .filter(([key]) => Number(permissions[key]) === 1)
      .map(([, label]) => label);
    if (!grantedLabels.length) {
      return 'Sin permisos';
    }
    const preview = grantedLabels.slice(0, 3).join(', ');
    return grantedLabels.length > 3 ? `${preview}…` : preview;
  };

  const pendingPayments = userInsights.paymentStatus.vencido + userInsights.paymentStatus.proximo;

  const userKpiCards = [
    {
      label: 'Usuarios totales',
      value: userInsights.totalUsers,
      helper: 'Registros simulados'
    },
    {
      label: 'Activos (30 días)',
      value: userInsights.activeUsers,
      helper: `${USER_ACTIVITY_WINDOWS.activeDays} días de actividad`
    },
    {
      label: 'Nuevos ingresos',
      value: userInsights.newUsers,
      helper: `Últimos ${USER_ACTIVITY_WINDOWS.newDays} días`
    },
    {
      label: 'Pagos a revisar',
      value: pendingPayments,
      helper: 'Próximos o vencidos'
    }
  ];

  const paymentStatusEntries = [
    { key: 'alDia', label: 'Al día', accent: 'success' },
    { key: 'proximo', label: 'Por vencer', accent: 'warning' },
    { key: 'vencido', label: 'Vencido', accent: 'danger' }
  ];

  const userGrowthChart = useMemo(() => {
    const labels = userInsights.monthlySignups.map((entry) => entry.label);
    const dataValues = userInsights.monthlySignups.map((entry) => entry.count);
    const maxValue = userInsights.maxMonthlySignups || 1;
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Altas de usuarios',
            data: dataValues,
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.2)',
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#2e7d32',
            pointBorderColor: '#ffffff',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => `Altas: ${context.parsed.y}`
            }
          }
        },
        layout: {
          padding: { top: 8, bottom: 8, right: 12, left: 12 }
        },
        scales: {
          x: {
            ticks: {
              color: 'var(--tc-text-muted)',
              maxRotation: 0,
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(maxValue, 4),
            ticks: {
              stepSize: Math.max(1, Math.ceil(maxValue / 4)),
              color: 'var(--tc-text-muted)',
              callback: (value) => Number(value).toFixed(0)
            },
            grid: {
              color: 'rgba(67, 160, 71, 0.15)'
            }
          }
        }
      }
    };
  }, [userInsights.monthlySignups, userInsights.maxMonthlySignups]);

  const renderWorkforceQuadrant = () => (
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
          <div className="admin-dashboard__pie-chart">
            <Doughnut data={payrollPieChart.data} options={payrollPieChart.options} />
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
          <div className="admin-dashboard__pie-chart">
            <Doughnut data={genderPieChart.data} options={genderPieChart.options} />
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
      {workforceStats.taskAssignments.entries.length > 0 && (
        <article className="admin-dashboard__task-assignment-card">
          <div className="admin-dashboard__task-assignment-header">
            <h3>Promedio por tipo de tarea</h3>
            <span>Colaboradores con asignaciones registradas</span>
          </div>
          <ul className="admin-dashboard__task-assignment-list">
            {workforceStats.taskAssignments.entries.map((entry) => {
              const barPercent = workforceStats.taskAssignments.maxAssigned
                ? (entry.assignedPeople / workforceStats.taskAssignments.maxAssigned) * 100
                : 0;
              return (
                <li key={entry.id} className="admin-dashboard__task-assignment-row">
                  <div className="admin-dashboard__task-assignment-info">
                    <p>{entry.label}</p>
                    <strong>{`Promedio: ${entry.assignedPeople.toLocaleString('es-GT')} ${
                      entry.assignedPeople === 1 ? 'persona' : 'personas'
                    }`}</strong>
                    <small>{`${entry.percentage.toFixed(1)}% del personal con registros`}</small>
                    {entry.averageTasksPerPerson > 0 && (
                      <small>{`≈ ${entry.averageTasksPerPerson.toFixed(1)} tareas por persona`}</small>
                    )}
                  </div>
                  <div className="admin-dashboard__task-assignment-bar">
                    <span style={{ width: `${barPercent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      )}
      {workforceStats.gender.missing > 0 && (
        <p className="admin-dashboard__workforce-note">
          {`${workforceStats.gender.missing} colaborador(es) sin registro de género.`}
        </p>
      )}
    </section>
  );

  return (
    <div className="admin-dashboard__wrapper">
      <header className="admin-dashboard__header">
        <div>
          <h1>Dashboard TerraControl</h1>
          <p>Bienvenido, {session?.user?.username}</p>
        </div>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>
      <nav className="admin-dashboard__menu" aria-label="Cambiar vista del dashboard">
        {DASHBOARD_MENU_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`admin-dashboard__menu-button${
              activeView === option.value ? ' admin-dashboard__menu-button--active' : ''
            }`}
            onClick={() => setActiveView(option.value)}
            aria-pressed={activeView === option.value}
          >
            {option.label}
          </button>
        ))}
      </nav>

      {activeView === 'operaciones' ? (
        <div className="admin-dashboard__grid">
          <div className="admin-dashboard__quadrant-stack admin-dashboard__quadrant-stack--map">
            <section className="admin-dashboard__quadrant admin-dashboard__quadrant--map">
              <p className="admin-dashboard__quadrant-label">Cuadrante 1</p>
              <div className="admin-dashboard__map">
                {showMapFilters ? (
                  <div className="admin-dashboard__map-filters">
                    <button
                      type="button"
                      className="admin-dashboard__map-toggle"
                      onClick={() => setShowMapFilters(false)}
                    >
                      Ocultar filtros
                    </button>
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
                      <span>Finca</span>
                      <select value={selectedLotId} onChange={handleLotChange} disabled={!fincaOptions.length}>
                        <option value="">Todas las fincas</option>
                        {fincaOptions.map((finca) => (
                          <option key={finca.id} value={finca.id}>
                            {finca.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="admin-dashboard__map-statuses">
                      {locationsLoading && (
                        <p className="admin-dashboard__map-status">Cargando fincas...</p>
                      )}
                      {locationsError && (
                        <p className="admin-dashboard__map-status admin-dashboard__map-status--error">
                          {locationsError}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="admin-dashboard__map-toggle admin-dashboard__map-toggle--floating"
                    onClick={() => setShowMapFilters(true)}
                  >
                    Mostrar filtros
                  </button>
                )}
                <GeoPolygonMap
                  selectedDepartment={selectedDepartmentName}
                  selectedMunicipality={selectedMunicipalityName}
                  selectedLot={selectedLotName}
                  locations={locationsData}
                  isLoadingLocations={locationsLoading}
                  showSummary={showMapSummary}
                  onToggleSummary={() => setShowMapSummary((prev) => !prev)}
                />
              </div>
            </section>
            {renderWorkforceQuadrant()}
          </div>

          <div className="admin-dashboard__quadrant-stack admin-dashboard__quadrant-stack--analytics">
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
              {chartData.length ? (
                <div className="admin-dashboard__chart-canvas">
                  <Bar data={operationalBarChart.data} options={operationalBarChart.options} />
                </div>
              ) : (
                <p className="admin-dashboard__chart-empty">Sin datos para este periodo.</p>
              )}
              <p className="admin-dashboard__chart-caption">
                {hasOperationalData
                  ? selectedPeriodLabel
                  : 'No hay datos simulados para este periodo.'}
              </p>
            </div>
          </section>

          <section className="admin-dashboard__quadrant admin-dashboard__quadrant--activity">
            <p className="admin-dashboard__quadrant-label">Cuadrante 4</p>
            <div className="admin-dashboard__activity-header">
              <h2>KPIs financieros</h2>
              <p>
                {selectedLotName
                  ? `Contexto financiero para ${selectedLotName}`
                  : 'Promedios consolidados de las fincas simuladas'}
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

          <section className="admin-dashboard__quadrant admin-dashboard__quadrant--sales">
            <p className="admin-dashboard__quadrant-label">Cuadrante 6</p>
            <div className="admin-dashboard__sales-header">
              <h2>Ventas destacadas</h2>
              <p>
                {salesInsights.hasSales
                  ? 'Datos simulados de ventas'
                  : 'Sin registros de ventas'}
              </p>
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
            <h3>Tipos de insumo</h3>
            <span>{`${inventoryStats.totalTypes} tipos registrados`}</span>
          </div>
          <div className="admin-dashboard__pie-content admin-dashboard__pie-content--legend-left">
            <div className="admin-dashboard__pie-chart">
              <Doughnut
                data={buildDoughnutChartConfig(inventoryStats.typeSegments).data}
                options={buildDoughnutChartConfig(inventoryStats.typeSegments).options}
              />
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
              </div>
            </article>
            <article className="admin-dashboard__pie-card">
              <div className="admin-dashboard__pie-card-header">
            <h3>Categorías</h3>
            <span>{`${inventoryStats.totalCategories} categorías activas`}</span>
          </div>
          <div className="admin-dashboard__pie-content admin-dashboard__pie-content--legend-left">
            <div className="admin-dashboard__pie-chart">
              <Doughnut
                data={buildDoughnutChartConfig(inventoryStats.categorySegments).data}
                options={buildDoughnutChartConfig(inventoryStats.categorySegments).options}
              />
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
              </div>
            </article>
          </div>
        </section>

      </div>
      ) : (
        <div className="admin-dashboard__users-view">
          <section className="admin-dashboard__quadrant admin-dashboard__quadrant--users-summary">
            <div className="admin-dashboard__users-summary-header">
              <p className="admin-dashboard__quadrant-label">Panel de usuarios</p>
              <h2>Estado de las cuentas</h2>
              <p>Monitor de actividad, pagos y permisos simulados.</p>
            </div>
            <div className="admin-dashboard__users-kpi-grid">
              {userKpiCards.map((card) => (
                <article key={card.label} className="admin-dashboard__users-kpi-card">
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                  <small>{card.helper}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-dashboard__quadrant admin-dashboard__quadrant--users-insights">
            <article className="admin-dashboard__users-insight-card admin-dashboard__users-insight-card--growth">
              <div className="admin-dashboard__users-insight-card-header">
                <h3>Crecimiento mensual</h3>
                <small>Altas por mes (últimos 6)</small>
              </div>
              {userInsights.monthlySignups.length ? (
                <div className="admin-dashboard__users-growth-chart">
                  <Line data={userGrowthChart.data} options={userGrowthChart.options} />
                </div>
              ) : (
                <p className="admin-dashboard__users-empty">Sin registros de altas.</p>
              )}
            </article>

            <article className="admin-dashboard__users-insight-card admin-dashboard__users-insight-card--metrics">
              <div className="admin-dashboard__users-metrics-grid">
                <section className="admin-dashboard__users-metric">
                  <div className="admin-dashboard__users-insight-card-header">
                    <h3>Estado de pagos</h3>
                    <small>{`Base: ${userInsights.totalUsers} usuarios`}</small>
                  </div>
                  <ul className="admin-dashboard__users-status-list">
                    {paymentStatusEntries.map((entry) => (
                      <li key={entry.key}>
                        <div className="admin-dashboard__users-status-row">
                          <span
                            className={`admin-dashboard__users-status-dot admin-dashboard__users-status-dot--${entry.accent}`}
                          />
                          <p>{entry.label}</p>
                        </div>
                        <strong>{userInsights.paymentStatus[entry.key] || 0}</strong>
                      </li>
                    ))}
                  </ul>
                  {userInsights.paymentStatus.desconocido > 0 && (
                    <small className="admin-dashboard__users-note">
                      {`${userInsights.paymentStatus.desconocido} usuarios sin datos de pago.`}
                    </small>
                  )}
                </section>

                <section className="admin-dashboard__users-metric">
                  <div className="admin-dashboard__users-insight-card-header">
                    <h3>Métodos de pago</h3>
                    <small>Preferencias registradas</small>
                  </div>
                  {userInsights.methodEntries.length ? (
                    <ul className="admin-dashboard__users-method-list">
                      {userInsights.methodEntries.map((entry) => {
                        const percent = userInsights.maxMethodCount
                          ? (entry.count / userInsights.maxMethodCount) * 100
                          : 0;
                        return (
                          <li key={entry.label}>
                            <div className="admin-dashboard__users-method-row">
                              <p>{entry.label}</p>
                              <span>{entry.count}</span>
                            </div>
                            <div className="admin-dashboard__users-progress-bar">
                              <span style={{ width: `${percent}%` }} />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="admin-dashboard__users-empty">Sin registros de método.</p>
                  )}
                </section>

                <section className="admin-dashboard__users-metric">
                  <div className="admin-dashboard__users-insight-card-header">
                    <h3>Renovaciones próximas</h3>
                    <small>{`Próximos ${USER_ACTIVITY_WINDOWS.upcomingPaymentDays} días`}</small>
                  </div>
                  {userInsights.upcomingRenewals.length ? (
                    <ul className="admin-dashboard__users-renewal-list">
                      {userInsights.upcomingRenewals.map((account) => (
                        <li key={account.id}>
                          <div>
                            <strong>{account.nombre}</strong>
                            <p>{account.payment?.metodo || 'Sin método'}</p>
                          </div>
                          <div className="admin-dashboard__users-renewal-meta">
                            <span>{formatFullDate(account.paymentEnd)}</span>
                            <small>{formatFutureDays(account.daysUntilRenewal)}</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-dashboard__users-empty">Sin vencimientos cercanos.</p>
                  )}
                </section>

                <section className="admin-dashboard__users-metric">
                  <div className="admin-dashboard__users-insight-card-header">
                    <h3>Permisos habilitados</h3>
                    <small>{`Cobertura sobre ${userInsights.totalUsers} usuarios`}</small>
                  </div>
                  <ul className="admin-dashboard__users-permissions">
                    {userInsights.permissionStats.map((permission) => (
                      <li key={permission.key}>
                        <div className="admin-dashboard__users-method-row">
                          <p>{permission.label}</p>
                          <span>{`${permission.granted} usuarios`}</span>
                        </div>
                        <div className="admin-dashboard__users-progress-bar admin-dashboard__users-progress-bar--thin">
                          <span style={{ width: `${permission.coverage}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </article>
          </section>

          <section className="admin-dashboard__quadrant admin-dashboard__quadrant--users-table">
            <div className="admin-dashboard__users-table-header">
              <h3>Usuarios destacados</h3>
              <span>Ordenado por última actividad</span>
            </div>
            {userInsights.highlightedUsers.length ? (
              <div className="admin-dashboard__users-table-wrapper">
                <table className="admin-dashboard__users-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Contacto</th>
                      <th>Pago</th>
                      <th>Último acceso</th>
                      <th>Permisos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userInsights.highlightedUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.usuario}</strong>
                          <small>{user.nombre}</small>
                        </td>
                        <td>
                          <p>{user.correo}</p>
                          <small>{user.ubicacion}</small>
                        </td>
                        <td>
                          <p>{user.payment?.metodo || 'Sin método'}</p>
                          <small>{user.payment?.estado || 'Sin estado'}</small>
                        </td>
                        <td>
                          <p>{formatFullDate(user.lastLogin)}</p>
                          <small>{formatElapsedDays(user.daysSinceLastLogin)}</small>
                        </td>
                        <td>
                          <p>{formatPermissionsList(user.permissions)}</p>
                          <small>{`Actualizado: ${formatFullDate(user.updatedAt)}`}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-dashboard__users-empty">Sin registros de usuarios.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
