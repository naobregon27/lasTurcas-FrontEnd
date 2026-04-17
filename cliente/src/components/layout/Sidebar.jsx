import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowDownToLine, ShoppingCart,
  ClipboardList, ChartColumnBig, Tags, LogOut, Truck, Settings, Search,
} from 'lucide-react';
import useInventoryStore from '../../store/useInventoryStore';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',      icon: Package,          label: 'Productos' },
  { to: '/stock-entry',   icon: ArrowDownToLine,  label: 'Carga de Stock' },
  { to: '/sales',         icon: ShoppingCart,     label: 'Nueva Venta' },
  { to: '/sales-history', icon: ClipboardList,    label: 'Historial Ventas' },
  { to: '/reports',       icon: ChartColumnBig,   label: 'Reportes' },
  { to: '/categories',    icon: Tags,             label: 'Categorías' },
  { to: '/suppliers',     icon: Truck,            label: 'Proveedores' },
];

function FlameMini() {
  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <path d="M20 4C20 4,25 9,25 14C27.5 11,27.5 8,26 5C30 8,32 14,30 19C32 17,33.5 13.5,32 11C34.5 14,35 20,32 24.5C30 28,25.5 30,20 30C14.5 30,10 28,8 24.5C5 20,5.5 14,8 11C6.5 13.5,8 17,10 19C8 14,10 8,14 5C12.5 8,12.5 11,15 14C15 9,20 4,20 4Z" fill="#f59e0b"/>
      <path d="M20 13C20 13,22.5 16,22.5 19C24 17.5,24 15.5,23 13C25 15,26 18.5,24.5 22C25.5 20.5,26.5 18,25.5 16C27 18,27 22,24.5 24.5C23 26.5,21.5 27,20 27C18.5 27,17 26.5,15.5 24.5C13 22,13 18,14.5 16C13.5 18,14.5 20.5,15.5 22C14 18.5,15 15,17 13C16 15.5,16 17.5,18 19C18 15.5,20 13,20 13Z" fill="#fef3c7"/>
    </svg>
  );
}

export default function Sidebar({ onSearchOpen, mobileOpen, onCloseMobile }) {
  const { user, logout, getLowStockProducts } = useInventoryStore();
  const navigate = useNavigate();
  const lowStock = getLowStockProducts();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <aside
      className={`
        z-40 w-64 min-h-screen min-h-[100dvh] bg-sidebar flex flex-col border-r border-sidebar-border
        pt-[env(safe-area-inset-top)] lg:pt-0
        transition-transform duration-200 ease-out
        max-lg:fixed max-lg:inset-y-0 max-lg:left-0
        ${mobileOpen ? 'max-lg:translate-x-0 max-lg:shadow-2xl' : 'max-lg:-translate-x-full'}
        lg:translate-x-0
      `}
    >

      {/* Brand */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl blur-md"
              style={{ background: 'rgba(245,158,11,0.3)', transform: 'scale(1.1)' }} />
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #92400e, #d97706, #f59e0b)' }}>
              <FlameMini />
            </div>
          </div>
          {/* Text */}
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold leading-tight tracking-tight"
              style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Almacén Fénix
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.18em] font-medium mt-0.5">Gestión de Inventario</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-3 pt-4 pb-1">
        <div className="px-3 py-2.5 rounded-xl border flex items-center gap-2.5"
          style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-amber-900 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <p className="text-[9px] text-slate-600 uppercase tracking-[0.18em] font-semibold px-3 pb-2 pt-1">Menú Principal</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onCloseMobile?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'text-amber-300 border'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'rgba(245,158,11,0.1)',
              borderColor: 'rgba(245,158,11,0.2)',
            } : {}}
          >
            {({ isActive }) => (
              <>
                {/* Left accent bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'linear-gradient(to bottom, #fbbf24, #f97316)' }} />
                )}
                <Icon size={15} className={isActive ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-400'} />
                <span className="flex-1 truncate">{label}</span>
                {to === '/products' && lowStock.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {lowStock.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Separator */}
      <div className="mx-4 h-px bg-sidebar-border mb-2" />

      {/* Search shortcut */}
      <div className="px-3 pb-2">
        <button
          id="tour-search"
          onClick={onSearchOpen}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-150 group"
        >
          <Search size={15} className="group-hover:text-slate-400 transition-colors" />
          <span className="flex-1 text-left">Buscar...</span>
          <div className="hidden sm:flex items-center gap-0.5">
            <kbd className="text-[9px] font-mono bg-white/5 border border-white/10 rounded px-1 py-0.5 text-slate-600">Ctrl</kbd>
            <span className="text-[9px] text-slate-700">+</span>
            <kbd className="text-[9px] font-mono bg-white/5 border border-white/10 rounded px-1 py-0.5 text-slate-600">K</kbd>
          </div>
        </button>
      </div>

      {/* Settings */}
      <div className="px-3 pb-1">
        <NavLink
          to="/settings"
          onClick={() => onCloseMobile?.()}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
              isActive ? 'text-amber-300 border' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
            }`
          }
          style={({ isActive }) => isActive ? { background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' } : {}}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: 'linear-gradient(to bottom, #fbbf24, #f97316)' }} />
              )}
              <Settings size={15} className={isActive ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-400'} />
              <span>Configuración</span>
            </>
          )}
        </NavLink>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 group"
        >
          <LogOut size={15} className="group-hover:text-red-400 transition-colors" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
