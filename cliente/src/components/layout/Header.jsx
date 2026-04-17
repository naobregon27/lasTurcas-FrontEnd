import { Bell, AlertTriangle, Search, Menu } from 'lucide-react';
import useInventoryStore from '../../store/useInventoryStore';
import { formatCurrency } from '../../utils/dateUtils';

const PAGE_TITLES = {
  '/dashboard':     { title: 'Dashboard',          subtitle: 'Resumen general del almacén' },
  '/products':      { title: 'Productos',           subtitle: 'Catálogo y gestión de productos' },
  '/stock-entry':   { title: 'Carga de Stock',      subtitle: 'Registrar ingreso de mercadería' },
  '/sales':         { title: 'Nueva Venta',         subtitle: 'Registrar venta y salida de stock' },
  '/sales-history': { title: 'Historial de Ventas', subtitle: 'Todas las ventas registradas' },
  '/reports':       { title: 'Reportes',            subtitle: 'Análisis e informes del almacén' },
  '/categories':    { title: 'Categorías',          subtitle: 'Gestión de categorías de productos' },
  '/suppliers':     { title: 'Proveedores',         subtitle: 'Gestión de proveedores del almacén' },
  '/settings':      { title: 'Configuración',       subtitle: 'Ajustes del sistema y del negocio' },
};

export default function Header({ pathname, onSearchOpen, onMenuClick }) {
  const { getLowStockProducts, getTodaySales } = useInventoryStore();
  const lowStock = getLowStockProducts();
  const todaySales = getTodaySales();
  const todayTotal = todaySales.reduce((acc, s) => acc + s.total, 0);
  const page = PAGE_TITLES[pathname] || { title: 'Panel', subtitle: '' };

  return (
    <header className="min-h-16 border-b border-sidebar-border bg-sidebar/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 py-2 px-3 sm:px-6 sticky top-0 z-20 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.1] transition-colors flex-shrink-0"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-white truncate">{page.title}</h2>
          {page.subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden sm:block">{page.subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
        {/* Search shortcut chip */}
        <button
          onClick={onSearchOpen}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs text-slate-500 hover:text-slate-300 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <Search size={12} />
          <span>Buscar...</span>
          <span className="text-[10px] font-mono bg-white/5 border border-white/10 rounded px-1">Ctrl K</span>
        </button>
        {/* Today sales chip */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
          style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">
            Ventas hoy: {formatCurrency(todayTotal)}
          </span>
        </div>

        {/* Low stock alert chip */}
        {lowStock.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
            style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.14)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}>
            <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs text-amber-400 font-medium whitespace-nowrap">
              <span className="sm:hidden">{lowStock.length}</span>
              <span className="hidden sm:inline">{lowStock.length} bajo stock</span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onSearchOpen}
          className="lg:hidden w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all border border-white/[0.07]"
          aria-label="Buscar"
        >
          <Search size={16} />
        </button>

        {/* Bell */}
        <button type="button" className="relative w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all border border-white/[0.07]">
          <Bell size={14} />
          {lowStock.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
              {lowStock.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
