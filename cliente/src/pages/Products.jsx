import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Barcode, Package,
  AlertTriangle, SlidersHorizontal, X, CircleCheckBig,
  History, ArrowDownToLine, ShoppingCart, TrendingDown, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input, { Select, Textarea } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import BarcodeDisplay from '../components/barcode/BarcodeDisplay';
import { formatCurrency, formatDate, formatDateTime } from '../utils/dateUtils';

const UNITS = ['unidad', 'kg', 'bolsa', 'paquete', 'caja', 'docena', 'horma', 'botella', 'litro', 'porción', 'atado'];

const EMPTY_FORM = {
  name: '', description: '', categoryId: '',
  baseUnit: 'caja', baseQuantity: 1, baseUnitLabel: '',
  purchasePrice: '', isFractioned: true,
  fractionUnit: 'bolsa', fractionSize: 1, fractionUnitLabel: 'kg',
  fractionsPerBase: 1, stock: 0, minStock: 5, salePrice: '',
};

function ProductForm({ form, setForm, categories, errors }) {
  const calcFractions = () => {
    if (!form.baseQuantity || !form.fractionSize) return;
    const raw = parseFloat(form.baseQuantity) / parseFloat(form.fractionSize);
    const withMargin = Math.floor(raw * 0.95);
    setForm((f) => ({ ...f, fractionsPerBase: withMargin || 1 }));
    toast.success(`Calculado: ~${withMargin} fracciones con 5% margen`);
  };

  return (
    <div className="space-y-5">
      {/* Basic info */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Información del Producto</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input label="Nombre del producto *" placeholder="Ej: Manzana Roja" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors?.name} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Descripción" placeholder="Descripción del producto..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Select label="Categoría *" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} error={errors?.categoryId}>
            <option value="">Seleccionar categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
          <Input label="Precio de venta ($) *" type="number" placeholder="0" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} error={errors?.salePrice} />
        </div>
      </div>

      {/* Base unit (how it's purchased) */}
      <div className="border-t border-card-border pt-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Unidad de Compra (cómo lo recibe)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Unidad base" value={form.baseUnit} onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
          <Input label="Contenido por unidad" type="number" placeholder="20" value={form.baseQuantity} onChange={(e) => setForm({ ...form, baseQuantity: e.target.value })} />
          <Input label="Descripción (ej: kg por caja)" placeholder="kg por caja" value={form.baseUnitLabel} onChange={(e) => setForm({ ...form, baseUnitLabel: e.target.value })} />
          <Input label="Precio de compra ($) por unidad base" type="number" placeholder="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} className="sm:col-span-3" />
        </div>
      </div>

      {/* Fractioning */}
      <div className="border-t border-card-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fraccionamiento</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setForm({ ...form, isFractioned: !form.isFractioned })}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${form.isFractioned ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFractioned ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs text-slate-300">Fraccionar mercadería</span>
          </label>
        </div>

        {form.isFractioned && (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 space-y-3">
            <p className="text-xs text-indigo-300">
              Define cómo vas a dividir cada unidad base al ingresar al stock.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select label="Unidad de fracción" value={form.fractionUnit} onChange={(e) => setForm({ ...form, fractionUnit: e.target.value })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
              <Input label="Tamaño de fracción" type="number" step="0.01" placeholder="1" value={form.fractionSize} onChange={(e) => setForm({ ...form, fractionSize: e.target.value })} />
              <Input label="Etiqueta (ej: kg)" placeholder="kg" value={form.fractionUnitLabel} onChange={(e) => setForm({ ...form, fractionUnitLabel: e.target.value })} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 min-w-0">
                <Input
                  label="Fracciones por unidad base"
                  type="number"
                  placeholder="18"
                  value={form.fractionsPerBase}
                  onChange={(e) => setForm({ ...form, fractionsPerBase: e.target.value })}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={calcFractions} type="button" className="w-full sm:w-auto flex-shrink-0">
                Calcular automático
              </Button>
            </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-2">
                  <CircleCheckBig size={12} className="text-emerald-400 flex-shrink-0" />
              Por cada <strong className="text-white mx-1">{form.baseUnit}</strong> de
              <strong className="text-white mx-1">{form.baseQuantity} {form.baseUnitLabel || 'unidades'}</strong>
              → <strong className="text-indigo-300 mx-1">{form.fractionsPerBase} {form.fractionUnit}s</strong>
              de <strong className="text-white mx-1">{form.fractionSize} {form.fractionUnitLabel}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Stock */}
      <div className="border-t border-card-border pt-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Stock</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Stock inicial" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <Input label="Stock mínimo (alerta)" type="number" placeholder="5" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct, getProductMovements } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [barcodeModal, setBarcodeModal] = useState({ open: false, product: null });
  const [historyModal, setHistoryModal] = useState({ open: false, product: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      const matchCat = !filterCat || p.categoryId === filterCat;
      const matchStock = filterStock === 'all' || (filterStock === 'low' && p.stock <= p.minStock) || (filterStock === 'ok' && p.stock > p.minStock);
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, filterCat, filterStock]);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setModal({ open: true, editing: null }); };
  const openEdit = (p) => {
    setForm({ ...p, purchasePrice: p.purchasePrice || '', salePrice: p.salePrice || '' });
    setErrors({});
    setModal({ open: true, editing: p.id });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Requerido';
    if (!form.categoryId) errs.categoryId = 'Requerido';
    if (!form.salePrice || isNaN(form.salePrice)) errs.salePrice = 'Ingresá un precio válido';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const data = {
      ...form,
      baseQuantity: parseFloat(form.baseQuantity) || 1,
      fractionSize: parseFloat(form.fractionSize) || 1,
      fractionsPerBase: parseInt(form.fractionsPerBase) || 1,
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 5,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      salePrice: parseFloat(form.salePrice),
    };
    if (modal.editing) {
      updateProduct(modal.editing, data);
      toast.success('Producto actualizado correctamente');
    } else {
      const p = addProduct(data);
      toast.success(`Producto creado · Código: ${p.code}`, { duration: 5000 });
    }
    setSaving(false);
    closeModal();
  };

  const handleDelete = async () => {
    await new Promise((r) => setTimeout(r, 300));
    deleteProduct(deleteDialog.id);
    toast.success('Producto eliminado');
    setDeleteDialog({ open: false, id: null });
  };

  const getCategoryById = (id) => categories.find((c) => c.id === id);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card border border-card-border rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-0 w-full sm:min-w-[12rem]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full bg-input border border-input-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="w-full sm:w-auto min-w-0 sm:min-w-[10rem] bg-input border border-input-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="w-full sm:w-auto min-w-0 sm:min-w-[9rem] bg-input border border-input-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="all">Todo el stock</option>
          <option value="low">⚠ Stock bajo</option>
          <option value="ok">✓ Stock OK</option>
        </select>
        <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-center sm:justify-start sm:ml-auto order-last sm:order-none">
          <SlidersHorizontal size={12} />
          {filtered.length} de {products.length}
        </div>
        <Button icon={Plus} onClick={openAdd} className="w-full sm:w-auto">Nuevo Producto</Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-card-border rounded-xl">
          <EmptyState
            icon={Package}
            title="No se encontraron productos"
            description="Intentá con otros filtros o creá tu primer producto"
            action={<Button icon={Plus} onClick={openAdd}>Crear producto</Button>}
          />
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Producto</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Categoría</th>
                  <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Unidad</th>
                  <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Stock</th>
                  <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Precio Venta</th>
                  <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Valor Stock</th>
                  <th className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => {
                    const cat = getCategoryById(p.categoryId);
                    const isLow = p.stock <= p.minStock;
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-card-border/50 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">{cat?.icon || '📦'}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{p.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{p.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="default" className="text-[10px]">{cat?.icon} {cat?.name || '-'}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-slate-300">{p.fractionUnit}</p>
                          {p.isFractioned && <p className="text-[10px] text-slate-500">{p.fractionSize} {p.fractionUnitLabel}</p>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <span className={`text-sm font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>{p.stock}</span>
                            {isLow && <Badge variant="danger" className="ml-2 text-[10px]">Bajo</Badge>}
                          </div>
                          <p className="text-[10px] text-slate-500">mín. {p.minStock}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-emerald-400">{formatCurrency(p.salePrice)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-slate-300">{formatCurrency(p.stock * p.salePrice)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setHistoryModal({ open: true, product: p })}
                              className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center text-amber-400 transition-colors" title="Historial de movimientos">
                              <History size={13} />
                            </button>
                            <button onClick={() => setBarcodeModal({ open: true, product: p })}
                              className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 flex items-center justify-center text-violet-400 transition-colors" title="Ver código de barras">
                              <Barcode size={13} />
                            </button>
                            <button onClick={() => openEdit(p)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Editar">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => setDeleteDialog({ open: true, id: p.id })}
                              className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors" title="Eliminar">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.editing ? 'Editar Producto' : 'Nuevo Producto'}
        subtitle={modal.editing ? 'Modificá los datos del producto' : 'Completá los datos para registrar el producto'}
        size="lg"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 w-full">
            <Button variant="ghost" onClick={closeModal} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} icon={modal.editing ? Edit2 : Plus} className="w-full sm:w-auto">
              {modal.editing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        }
      >
        <ProductForm form={form} setForm={setForm} categories={categories} errors={errors} />
      </Modal>

      {/* Barcode Modal */}
      <Modal
        open={barcodeModal.open}
        onClose={() => setBarcodeModal({ open: false, product: null })}
        title="Código de Barras"
        subtitle={barcodeModal.product?.name}
        size="sm"
      >
        {barcodeModal.product && (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="bg-white rounded-xl p-4 w-full flex flex-col items-center">
              <BarcodeDisplay value={barcodeModal.product.code} dark={false} height={70} />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Código del producto</p>
              <code className="text-lg font-bold text-white tracking-wider">{barcodeModal.product.code}</code>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-500">Producto</p>
                <p className="text-xs font-medium text-white mt-0.5">{barcodeModal.product.name}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-500">Precio venta</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(barcodeModal.product.salePrice)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                window.print();
                toast.success('Enviando código de barras a impresora');
              }}
            >
              Imprimir código de barras
            </Button>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        open={historyModal.open}
        onClose={() => setHistoryModal({ open: false, product: null })}
        title="Historial de Movimientos"
        subtitle={historyModal.product?.name}
        size="lg"
      >
        {historyModal.product && (() => {
          const movements = getProductMovements(historyModal.product.id);
          const totalIn = movements.filter((m) => m.type === 'entry').reduce((a, m) => a + m.qty, 0);
          const totalOut = movements.filter((m) => m.type === 'sale').reduce((a, m) => a + m.qty, 0);
          return (
            <div>
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 rounded-xl border border-card-border" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-xl font-bold text-white">{historyModal.product.stock}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Stock actual</p>
                </div>
                <div className="text-center p-3 rounded-xl border" style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.2)' }}>
                  <p className="text-xl font-bold text-emerald-400">+{totalIn}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total ingresado</p>
                </div>
                <div className="text-center p-3 rounded-xl border" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
                  <p className="text-xl font-bold text-amber-400">−{totalOut}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total vendido</p>
                </div>
              </div>

              {/* Timeline */}
              {movements.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">Sin movimientos registrados para este producto</p>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {movements.map((mov) => {
                    const isEntry = mov.type === 'entry';
                    return (
                      <div key={mov.id} className="flex items-center gap-3 p-3 rounded-xl border border-card-border/60 hover:border-card-border transition-colors"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: isEntry ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)' }}>
                          {isEntry
                            ? <ArrowDownToLine size={13} className="text-emerald-400" />
                            : <ShoppingCart size={13} className="text-amber-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${isEntry ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {isEntry ? `+${mov.qty}` : `−${mov.qty}`} {historyModal.product.fractionUnit}s
                            </span>
                            <span className="text-[10px] text-slate-600">·</span>
                            <span className="text-[10px] text-slate-500 truncate">
                              {isEntry ? (mov.supplier || 'Sin proveedor') : (mov.customerName || 'Mostrador')}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600">
                            {isEntry ? 'Ingreso de stock' : `Venta · ${mov.saleNumber}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {!isEntry && mov.subtotal && (
                            <p className="text-xs font-semibold text-emerald-400">{formatCurrency(mov.subtotal)}</p>
                          )}
                          {isEntry && mov.totalCost && (
                            <p className="text-xs text-slate-400">{formatCurrency(mov.totalCost)}</p>
                          )}
                          <p className="text-[10px] text-slate-600">{formatDate(mov.date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message="Esta acción no se puede deshacer. ¿Estás seguro que querés eliminar este producto?"
        confirmLabel="Sí, eliminar"
      />
    </div>
  );
}
