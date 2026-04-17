import { Joyride, STATUS } from 'react-joyride';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Tour steps ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    icon: '🔥',
    title: '¡Bienvenido a Almacén Fénix!',
    content: (
      <div className="space-y-3">
        <p>Este es tu sistema de gestión de inventario y ventas. En unos pocos pasos te vamos a mostrar todo lo que podés hacer.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {['📦 Productos','📥 Stock','🛒 Ventas','🚛 Proveedores','📊 Reportes'].map((t) => (
            <span key={t} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    target: 'aside',
    placement: 'right',
    disableBeacon: true,
    icon: '🧭',
    title: 'Navegación Principal',
    content: 'Desde esta barra lateral accedés a todas las secciones del sistema. Siempre está visible para que puedas moverte rápido entre módulos.',
  },
  {
    target: 'a[href="/dashboard"]',
    placement: 'right',
    disableBeacon: true,
    icon: '📊',
    title: 'Dashboard',
    content: 'El panel central te muestra un resumen en tiempo real: ventas del día, valor del stock, productos bajo mínimo y gráficos de los últimos 7 días.',
  },
  {
    target: 'a[href="/products"]',
    placement: 'right',
    disableBeacon: true,
    icon: '📦',
    title: 'Productos',
    content: 'Acá cargás y administrás tu catálogo completo. Cada producto tiene precio de compra, precio de venta, unidades y configuración de fraccionamiento.',
  },
  {
    target: 'a[href="/stock-entry"]',
    placement: 'right',
    disableBeacon: true,
    icon: '📥',
    title: 'Carga de Stock',
    content: 'Cada vez que recibís mercadería, registrás el ingreso acá. El sistema calcula automáticamente las fracciones con el porcentaje de merma que vos definís.',
  },
  {
    target: 'a[href="/sales"]',
    placement: 'right',
    disableBeacon: true,
    icon: '🛒',
    title: 'Nueva Venta',
    content: 'Registrá cada venta seleccionando los productos y cantidades. Al confirmar, el stock se descuenta automáticamente y queda registrada con número de venta.',
  },
  {
    target: 'a[href="/sales-history"]',
    placement: 'right',
    disableBeacon: true,
    icon: '📋',
    title: 'Historial de Ventas',
    content: 'Consultá todas las ventas registradas. Podés filtrar por fecha, método de pago y cliente. Cada venta muestra el detalle completo de productos vendidos.',
  },
  {
    target: 'a[href="/reports"]',
    placement: 'right',
    disableBeacon: true,
    icon: '📈',
    title: 'Reportes',
    content: 'Analizá el rendimiento del negocio: ventas por período, productos más vendidos y comparativas. Podés exportar los reportes a Excel.',
  },
  {
    target: 'a[href="/suppliers"]',
    placement: 'right',
    disableBeacon: true,
    icon: '🚛',
    title: 'Proveedores',
    content: 'Registrá tus proveedores con datos de contacto. El sistema lleva el conteo de cuánto compraste a cada uno y vincula los ingresos de stock con el proveedor correspondiente.',
  },
  {
    target: '#tour-search',
    placement: 'right',
    disableBeacon: true,
    icon: '🔍',
    title: 'Búsqueda Rápida',
    content: (
      <div>
        <p>Presioná <strong className="text-amber-300">Ctrl + K</strong> (o Cmd+K en Mac) desde cualquier pantalla para buscar productos, páginas y navegar al instante sin usar el mouse.</p>
      </div>
    ),
  },
  {
    target: 'a[href="/settings"]',
    placement: 'right',
    disableBeacon: true,
    icon: '⚙️',
    title: 'Configuración',
    content: 'Guardá los datos de tu negocio (nombre, dirección, CUIT). También podés cambiar la contraseña y hacer backups completos de todos los datos en un archivo JSON.',
  },
  {
    target: 'body',
    placement: 'center',
    disableBeacon: true,
    icon: '🎉',
    title: '¡Todo listo para empezar!',
    content: (
      <div className="space-y-3">
        <p>Ya conocés todas las funcionalidades de Almacén Fénix. El primer paso es cargar tus categorías y productos.</p>
        <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-amber-300 font-semibold mb-1">Orden recomendado para empezar:</p>
          <ol className="text-slate-400 space-y-0.5 text-xs">
            <li>1. Cargá las <strong className="text-slate-300">Categorías</strong> de tus productos</li>
            <li>2. Registrá tus <strong className="text-slate-300">Proveedores</strong></li>
            <li>3. Creá los <strong className="text-slate-300">Productos</strong> de tu almacén</li>
            <li>4. Realizá tu primera <strong className="text-slate-300">Carga de Stock</strong></li>
            <li>5. ¡Ya podés registrar <strong className="text-slate-300">Ventas</strong>!</li>
          </ol>
        </div>
      </div>
    ),
  },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({
  backProps, closeProps, continuous, index, isLastStep,
  primaryProps, size, skipProps, step, tooltipProps,
}) {
  const progress = ((index + 1) / size) * 100;
  const isCenter = step.placement === 'center';

  return (
    <motion.div
      {...tooltipProps}
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="outline-none"
      style={{ width: isCenter ? 420 : 360, maxWidth: '92vw' }}
    >
      <div
        className="rounded-2xl overflow-hidden border border-card-border"
        style={{
          background: '#0f1020',
          boxShadow: '0 30px 90px rgba(0,0,0,0.75), 0 0 50px rgba(245,158,11,0.12)',
        }}
      >
        {/* Progress bar */}
        <div className="h-[3px] bg-card-border">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #b45309, #f59e0b)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="p-5">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {step.icon && (
                <span className="text-lg leading-none">{step.icon}</span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                Paso {index + 1} de {size}
              </span>
            </div>
            {/* Dots progress */}
            <div className="flex items-center gap-1">
              {Array.from({ length: size }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === index ? 16 : 5,
                    height: 5,
                    background: i <= index
                      ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          {step.title && (
            <h3 className="text-base font-extrabold text-white mb-2 leading-tight">
              {step.title}
            </h3>
          )}

          {/* Content */}
          <div className="text-sm text-slate-400 leading-relaxed">
            {step.content}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-card-border/60">
            <button
              {...skipProps}
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              Saltar tour
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  {...backProps}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  ← Atrás
                </button>
              )}
              <button
                {...(isLastStep ? closeProps : primaryProps)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)',
                  boxShadow: '0 3px 14px rgba(245,158,11,0.35)',
                }}
              >
                {isLastStep ? '¡Empezar! 🔥' : 'Siguiente →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingTour({ run, onFinish }) {
  const handleCallback = (data) => {
    const { status, type } = data;
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status);
    if (finished) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      showProgress={false}
      showSkipButton
      disableScrolling={false}
      scrollOffset={80}
      callback={handleCallback}
      tooltipComponent={CustomTooltip}
      floaterProps={{ disableAnimation: false }}
      styles={{
        options: {
          arrowColor: '#0f1020',
          backgroundColor: '#0f1020',
          overlayColor: 'rgba(0, 0, 0, 0.72)',
          primaryColor: '#f59e0b',
          spotlightShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
          textColor: '#94a3b8',
          zIndex: 9999,
        },
        spotlight: {
          borderRadius: 14,
          border: '2px solid rgba(245,158,11,0.4)',
        },
        overlay: {
          mixBlendMode: 'normal',
        },
      }}
    />
  );
}
