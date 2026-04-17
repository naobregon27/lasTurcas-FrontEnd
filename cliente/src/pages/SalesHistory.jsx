import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, Trash2, Download, ChevronDown, ChevronUp,
  ShoppingCart, X, FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';
import { exportSalesToExcel } from '../utils/exportExcel';

const PAYMENT_BADGE = {
  efectivo: 'success',
  transferencia: 'info',
  debito: 'purple',
  credito: 'warning',
};

export default function SalesHistory() {
  const { sales, deleteSale } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.saleNumber.toLowerCase().includes(q) || (s.customerName || '').toLowerCase().includes(q) || s.items.some((i) => i.productName.toLowerCase().includes(q));
      const saleDate = s.date.slice(0, 10);
      const matchFrom = !dateFrom || saleDate >= dateFrom;
      const matchTo = !dateTo || saleDate <= dateTo;
      return matchSearch && matchFrom && matchTo;
    });
  }, [sales, search, dateFrom, dateTo]);

  const totalFiltered = filtered.reduce((acc, s) => acc + s.total, 0);

  const handleDelete = async () => {
    deleteSale(deleteDialog.id);
    toast.success('Venta anulada. El stock fue restaurado.');
    setDeleteDialog({ open: false, id: null });
  };

  const handleExport = () => {
    exportSalesToExcel(filtered);
    toast.success('Exportando a Excel...');
  };

  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); };
  const hasFilters = search || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card border border-card-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por N° venta, cliente o producto..."
            className="w-full bg-input border border-input-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="bg-input border border-input-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          <span className="text-slate-500 text-sm">→</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="bg-input border border-input-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
            <X size={12} /> Limpiar
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-xs text-slate-500">{filtered.length} ventas · <span className="text-emerald-400 font-semibold">{formatCurrency(totalFiltered)}</span></div>
          <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={handleExport}>Exportar Excel</Button>
        </div>
      </div>

      {/* Sales list */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-card-border rounded-xl">
          <EmptyState icon={ShoppingCart} title="No se encontraron ventas" description="Intentá con otros filtros o registrá una nueva venta" />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((sale, i) => {
              const isExpanded = expandedId === sale.id;
              return (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-card-border rounded-xl overflow-hidden"
                >
                  {/* Sale row */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : sale.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart size={14} className="text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white font-mono">{sale.saleNumber}</p>
                          <Badge variant={PAYMENT_BADGE[sale.paymentMethod] || 'default'} className="text-[10px]">
                            {sale.paymentMethod}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {sale.customerName || 'Mostrador'} · {formatDateTime(sale.date)} · {sale.items.length} ítem(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-emerald-400">{formatCurrency(sale.total)}</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: sale.id }); }}
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                          title="Anular venta"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-card-border"
                      >
                        <div className="px-4 py-4 bg-white/[0.01]">
                          <table className="w-full">
                            <thead>
                              <tr className="text-[10px] text-slate-500 uppercase tracking-wider">
                                <th className="text-left pb-2">Producto</th>
                                <th className="text-right pb-2">Cant.</th>
                                <th className="text-right pb-2">Precio Unit.</th>
                                <th className="text-right pb-2">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {sale.items.map((item) => (
                                <tr key={item.productId}>
                                  <td className="py-2">
                                    <p className="text-xs text-white">{item.productName}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{item.productCode}</p>
                                  </td>
                                  <td className="text-right text-xs text-slate-300 py-2">{item.quantity}</td>
                                  <td className="text-right text-xs text-slate-300 py-2">{formatCurrency(item.unitPrice)}</td>
                                  <td className="text-right text-xs font-semibold text-white py-2">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-card-border">
                                <td colSpan={3} className="pt-3 text-xs font-semibold text-slate-300 text-right pr-4">TOTAL:</td>
                                <td className="pt-3 text-right text-base font-bold text-emerald-400">{formatCurrency(sale.total)}</td>
                              </tr>
                            </tfoot>
                          </table>
                          {sale.notes && (
                            <div className="mt-3 text-xs text-slate-500">
                              <strong className="text-slate-400">Nota:</strong> {sale.notes}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Anular venta"
        message="Se anulará la venta y el stock será restaurado. Esta acción no se puede deshacer."
        confirmLabel="Anular venta"
      />
    </div>
  );
}
