import { Bell, AlertTriangle, Search } from 'lucide-react';
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

export default function Header({ pathname, onSearchOpen }) {
  const { getLowStockProducts, getTodaySales } = useInventoryStore();
  const lowStock = getLowStockProducts();
  const todaySales = getTodaySales();
  const todayTotal = todaySales.reduce((acc, s) => acc + s.total, 0);
  const page = PAGE_TITLES[pathname] || { title: 'Panel', subtitle: '' };

  return (
    <header className="h-16 border-b border-sidebar-border bg-sidebar/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-base font-bold text-white">{page.title}</h2>
        <p className="text-xs text-slate-500">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
            style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.14)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}>
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">
              {lowStock.length} bajo stock
            </span>
          </div>
        )}

        {/* Bell */}
        <button className="relative w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all border border-white/[0.07]">
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
