import React, { useState, useMemo } from "react";
import "./services.css";

// ⬇️ Simula tus imágenes (ajusta rutas/nombres reales)
import ImgLotes from "../../assets/Images/Lotes.png";
import ImgInventario from "../../assets/Images/Inventario.png";
import ImgVentas from "../../assets/Images/Ventas.png";
import ImgPersonal from "../../assets/Images/Personal.png";
import ImgTareas from "../../assets/Images/Tareas.png";

const SERVICES = [
    {
        key: "lotes",
        label: "Lotes",
        image: ImgLotes,
        description: `
            <div class="svc-rich">
                <p class="lead">
                    Organiza y administra cada una de tus parcelas por <strong>ubicación</strong>, <strong>cultivo</strong> y
                    <strong>estado fenológico</strong>. Aprovecha datos <strong>satelitales</strong> para monitorear la evolución
                    de tus lotes en tiempo real y planifica con mayor certeza.
                </p>

                <ul class="svc-list">
                    <li>
                        <span class="icon">🛰️</span>
                        <div>
                        <strong>Imágenes satelitales</strong><br/>
                        Visualiza cambios, tendencias y alertas para decidir intervenciones a tiempo.
                        </div>
                    </li>
                    <li>
                        <span class="icon">💰</span>
                        <div>
                        <strong>Costos por lote y por cosecha</strong><br/>
                        Calcula insumos, jornales y gastos operativos para conocer la <em>rentabilidad real</em>.
                        </div>
                    </li>
                    <li>
                        <span class="icon">📊</span>
                        <div>
                        <strong>Historial y rendimiento</strong><br/>
                        Compara campañas, superfícies y resultados para optimizar recursos.
                        </div>
                    </li>
                    <li>
                        <span class="icon">🗺️</span>
                        <div>
                        <strong>Mapas y superficies</strong><br/>
                        Delimita parcelas, integra capas y consulta métricas clave por área.
                        </div>
                    </li>
                </ul>

                <div class="svc-badges">
                    <span class="badge">Fenología</span>
                    <span class="badge">ROI por lote</span>
                    <span class="badge">Series históricas</span>
                </div>
            </div>
        `
    },
    {
        key: "inventario",
        label: "Inventario",
        image: ImgInventario,
        description: `
            <div class="svc-rich">
                <p class="lead">
                    Controla de manera integral las <strong>entradas</strong> y <strong>salidas</strong> de insumos, 
                    lleva registro de <strong>costos unitarios</strong> y establece <strong>stock mínimos</strong> 
                    para asegurar la disponibilidad de recursos en todo momento.
                </p>

                <ul class="svc-list">
                    <li>
                        <span class="icon">📦</span>
                        <div>
                        <strong>Gestión de insumos</strong><br/>
                        Administra fertilizantes, semillas, herramientas y más desde un solo lugar.
                        </div>
                    </li>
                    <li>
                        <span class="icon">💲</span>
                        <div>
                        <strong>Costos unitarios</strong><br/>
                        Calcula el valor real de cada insumo y optimiza el uso de tus recursos.
                        </div>
                    </li>
                    <li>
                        <span class="icon">🔗</span>
                        <div>
                        <strong>Vinculación con tareas</strong><br/>
                        Asigna insumos a labores específicas para conocer el costo real por lote o cosecha.
                        </div>
                    </li>
                    <li>
                        <span class="icon">⚠️</span>
                        <div>
                        <strong>Alertas de stock mínimo</strong><br/>
                        Configura notificaciones cuando un insumo esté por agotarse.
                        </div>
                    </li>
                </ul>

                <div class="svc-badges">
                    <span class="badge">Compras</span>
                    <span class="badge">Stock mínimo</span>
                    <span class="badge">Costos unitarios</span>
                    <span class="badge">Optimización de recursos</span>
                </div>
            </div>`,
    },
    {
        key: "ventas",
        label: "Ventas",
        image: ImgVentas,
        description: `
        <div class="svc-rich">
            <p class="lead">
                Registra <strong>pedidos</strong> y controla <strong>precios</strong> de forma centralizada. 
                Obtén una visión clara de tus ventas con márgenes por producto, cliente o temporada, y genera reportes listos para compartir.
            </p>

            <ul class="svc-list">
                <li>
                    <span class="icon">📝</span>
                    <div>
                        <strong>Gestión de pedidos</strong><br/>
                        Registra cada venta con detalles de producto, cantidades y clientes.
                    </div>
                </li>
                <li>
                    <span class="icon">💵</span>
                    <div>
                        <strong>Control de precios</strong><br/>
                        Define precios por producto y ajusta según cliente o temporada.
                    </div>
                </li>
                <li>
                    <span class="icon">📊</span>
                    <div>
                        <strong>Análisis de márgenes</strong><br/>
                        Consulta rentabilidad por cliente, producto o campaña para optimizar ventas.
                    </div>
                </li>
            </ul>

            <div class="svc-badges">
                <span class="badge">Precios dinámicos</span>
                <span class="badge">Reportes de ventas</span>
            </div>
        </div>`
    },
    {
        key: "personal",
        label: "Personal",
        image: ImgPersonal,
        description: `
        <div class="svc-rich">
            <p class="lead">
                Administra <strong>planillas</strong>, <strong>roles</strong> y <strong>jornales</strong> de manera sencilla. 
                Asigna equipos por tarea, controla <strong>asistencias</strong> y <strong>ausencias</strong>, 
                y calcula los costos laborales de cada actividad para una gestión más eficiente.
            </p>

            <ul class="svc-list">
                <li>
                    <span class="icon">👥</span>
                    <div>
                    <strong>Gestión de planillas</strong><br/>
                    Organiza pagos, horarios y beneficios de tu personal en un solo sistema.
                    </div>
                </li>
                <li>
                    <span class="icon">🛠️</span>
                    <div>
                    <strong>Asignación por tarea</strong><br/>
                    Distribuye equipos de trabajo según lote, actividad o fase de la cosecha.
                    </div>
                </li>
                <li>
                    <span class="icon">📅</span>
                    <div>
                    <strong>Control de ausencias</strong><br/>
                    Lleva un registro detallado de asistencias, descansos y bajas laborales.
                    </div>
                </li>
                <li>
                    <span class="icon">💰</span>
                    <div>
                    <strong>Cálculo de costos laborales</strong><br/>
                    Conoce cuánto cuesta realmente cada actividad al integrar jornales y planilla.
                    </div>
                </li>
            </ul>

            <div class="svc-badges">
                <span class="badge">Planillas</span>
                <span class="badge">Roles</span>
                <span class="badge">Asistencias</span>
                <span class="badge">Costos laborales</span>
            </div>
        </div>`
    },
    {
        key: "tareas",
        label: "Tareas",
        image: ImgTareas,
        description: `
        <div class="svc-rich">
            <p class="lead">
            Planifica <strong>labores</strong> por lote definiendo <strong>fechas</strong>, <strong>responsables</strong> e <strong>insumos</strong>. 
            Da seguimiento en tiempo real al <strong>avance de las actividades</strong>.
            </p>

            <ul class="svc-list">
            <li>
                <span class="icon">🗓️</span>
                <div>
                <strong>Planificación de labores</strong><br/>
                Define fechas y prioridades para cada tarea en tus lotes.
                </div>
            </li>
            <li>
                <span class="icon">👤</span>
                <div>
                <strong>Asignación de responsables</strong><br/>
                Designa encargados y equipos de trabajo para cada actividad.
                </div>
            </li>
            <li>
                <span class="icon">🧾</span>
                <div>
                <strong>Registro de insumos</strong><br/>
                Vincula insumos a cada tarea para conocer el costo real de ejecución.
                </div>
            </li>
            </ul>

            <div class="svc-badges">
            <span class="badge">Planificación</span>
            <span class="badge">Responsables</span>
            <span class="badge">Insumos</span>
            </div>
        </div> `

    },
];

export default function Services() {
  const [activeKey, setActiveKey] = useState("lotes");

  const activeItem = useMemo(
    () => SERVICES.find((s) => s.key === activeKey) ?? SERVICES[0],
    [activeKey]
  );

  return (
    <section className="svc">
      {/* Lateral izquierdo: navegación */}
      <aside className="svc-sidebar" role="tablist" aria-label="Secciones de TerraControl">
        {SERVICES.map((item) => {
          const selected = item.key === activeKey;
          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={selected}
              className={`svc-tab ${selected ? "is-active" : ""}`}
              onClick={() => setActiveKey(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </aside>

      {/* Panel derecho: contenido */}
      <div className="svc-panel" role="tabpanel" aria-live="polite">
        <div className="svc-card">
          <div className="svc-text">
            <h2 className="svc-title">{activeItem.label}</h2>
            <div
                className="svc-desc"
                dangerouslySetInnerHTML={{ __html: activeItem.description }}
            />
          </div>
          <div className="svc-media">
            <img
              key={activeItem.key} // fuerza animación suave al cambiar
                src={activeItem.image}
              alt={`${activeItem.label} - TerraControl`}
              className="svc-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// {/*src={activeItem.image}*/}