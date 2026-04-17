import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Package, ArrowDownToLine, ShoppingCart,
  ClipboardList, ChartColumnBig, Tags, Truck, Settings, X,
  ArrowRight, Command,
} from 'lucide-react';
import useInventoryStore from '../../store/useInventoryStore';

const PAGES = [
  { label: 'Dashboard',          path: '/dashboard',     icon: LayoutDashboard, desc: 'Panel de control' },
  { label: 'Productos',          path: '/products',      icon: Package,          desc: 'Catálogo de productos' },
  { label: 'Carga de Stock',     path: '/stock-entry',   icon: ArrowDownToLine,  desc: 'Ingresar mercadería' },
  { label: 'Nueva Venta',        path: '/sales',         icon: ShoppingCart,     desc: 'Registrar venta' },
  { label: 'Historial Ventas',   path: '/sales-history', icon: ClipboardList,    desc: 'Historial de ventas' },
  { label: 'Reportes',           path: '/reports',       icon: ChartColumnBig,   desc: 'Análisis e informes' },
  { label: 'Categorías',         path: '/categories',    icon: Tags,             desc: 'Gestión de categorías' },
  { label: 'Proveedores',        path: '/suppliers',     icon: Truck,            desc: 'Gestión de proveedores' },
  { label: 'Configuración',      path: '/settings',      icon: Settings,         desc: 'Ajustes del sistema' },
];

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate();
  const { products, categories } = useInventoryStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const getCategoryName = useCallback((id) => {
    return categories.find((c) => c.id === id)?.name || '';
  }, [categories]);

  const results = (() => {
    if (!query.trim()) {
      return [{ type: 'section', label: 'Navegación rápida', items: PAGES.slice(0, 5) }];
    }
    const q = query.toLowerCase();
    const matchPages = PAGES.filter(
      (p) => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    ).map((p) => ({ ...p, type: 'page' }));
    const matchProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        type: 'product',
        label: p.name,
        desc: `${p.code} · ${getCategoryName(p.categoryId)} · Stock: ${p.stock}`,
        path: '/products',
        icon: Package,
        stockLow: p.stock <= p.minStock,
      }));

    const sections = [];
    if (matchPages.length) sections.push({ type: 'section', label: 'Páginas', items: matchPages });
    if (matchProducts.length) sections.push({ type: 'section', label: 'Productos', items: matchProducts });
    return sections;
  })();

  const flatItems = results.flatMap((s) => s.items);

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, flatItems.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && flatItems[selected]) { handleSelect(flatItems[selected]); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, flatItems, selected]);

  let itemIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[max(0.75rem,8svh)] sm:pt-[12vh] px-3 sm:px-4 pb-[env(safe-area-inset-bottom)]"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-xl max-h-[min(calc(100dvh-2rem),520px)] flex flex-col bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 40px rgba(245,158,11,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="h-[2px] flex-shrink-0 bg-gradient-to-r from-amber-700 via-amber-400 to-orange-500" />

            {/* Search input */}
            <div className="flex flex-shrink-0 items-center gap-3 px-4 py-3.5 border-b border-card-border">
              <Search size={16} className="text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Buscar páginas, productos..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-500 border border-slate-700 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
              {flatItems.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">Sin resultados para &ldquo;{query}&rdquo;</p>
              ) : (
                results.map((section) => (
                  <div key={section.label}>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold px-4 py-2">
                      {section.label}
                    </p>
                    {section.items.map((item) => {
                      itemIndex++;
                      const idx = itemIndex;
                      const isActive = selected === idx;
                      return (
                        <button
                          key={item.path + item.label}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelected(idx)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={isActive ? { background: 'rgba(245,158,11,0.1)' } : {}}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)' }}>
                            <item.icon size={13} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                              {item.label}
                              {item.stockLow && (
                                <span className="ml-2 text-[10px] text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                                  Stock bajo
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                          </div>
                          {isActive && <ArrowRight size={12} className="text-amber-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-2.5 border-t border-card-border flex flex-wrap items-center justify-between gap-2"
              style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><kbd className="font-mono border border-slate-700 rounded px-1">↑↓</kbd> navegar</span>
                <span className="flex items-center gap-1"><kbd className="font-mono border border-slate-700 rounded px-1">↵</kbd> abrir</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-600">
                <Command size={10} />
                <span>Ctrl+K</span>
              </div>
              <p className="sm:hidden text-[10px] text-slate-600 w-full text-center">Tocá un resultado para abrir</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
