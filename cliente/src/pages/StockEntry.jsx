import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownToLine, Search, Package, Calculator, CircleCheckBig,
  ChevronRight, Truck, ClipboardCheck, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Button from '../components/ui/Button';
import Input, { Select, Textarea } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';

const STEPS = ['Seleccionar Producto', 'Fraccionamiento', 'Confirmar Ingreso'];

export default function StockEntry() {
  const { products, categories, stockEntries, suppliers, addStockEntry } = useInventoryStore();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [entryData, setEntryData] = useState({
    baseUnitsReceived: 1,
    margin: 5,
    customFractions: '',
    totalFractionsCreated: 0,
    purchasePricePerBase: '',
    supplier: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }, [products, search]);

  const calcFractions = () => {
    if (!selectedProduct) return 0;
    const raw = parseFloat(entryData.baseUnitsReceived || 0) * parseFloat(selectedProduct.fractionsPerBase || 1);
    const withMargin = Math.floor(raw * (1 - (parseFloat(entryData.margin) || 0) / 100));
    return withMargin;
  };

  const autoFractions = calcFractions();
  const finalFractions = parseInt(entryData.customFractions) || autoFractions;

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setEntryData((d) => ({
      ...d,
      purchasePricePerBase: product.purchasePrice || '',
    }));
    setStep(1);
    setSearch('');
  };

  const handleConfirmEntry = async () => {
    if (finalFractions <= 0) { toast.error('La cantidad de fracciones debe ser mayor a 0'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = addStockEntry({
      productId: selectedProduct.id,
      baseUnitsReceived: parseFloat(entryData.baseUnitsReceived),
      baseUnitLabel: selectedProduct.baseUnit,
      totalFractionsCreated: finalFractions,
      fractionUnitLabel: `${selectedProduct.fractionUnit}s de ${selectedProduct.fractionSize} ${selectedProduct.fractionUnitLabel}`,
      purchasePricePerBase: parseFloat(entryData.purchasePricePerBase) || selectedProduct.purchasePrice,
      totalCost: (parseFloat(entryData.purchasePricePerBase) || selectedProduct.purchasePrice) * parseFloat(entryData.baseUnitsReceived),
      supplier: entryData.supplier,
      notes: entryData.notes,
    });

    setSaving(false);

    if (result.success) {
      toast.success(`¡Stock cargado exitosamente! +${finalFractions} ${selectedProduct.fractionUnit}s de ${selectedProduct.name}`, { duration: 5000 });
      setStep(0);
      setSelectedProduct(null);
      setEntryData({ baseUnitsReceived: 1, margin: 5, customFractions: '', totalFractionsCreated: 0, purchasePricePerBase: '', supplier: '', notes: '' });
    } else {
      toast.error(result.error);
    }
  };

  const getCategoryById = (id) => categories.find((c) => c.id === id);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Steps indicator */}
      <div className="bg-card border border-card-border rounded-xl px-6 py-4">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-0 flex-1">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-500'
                }`}>
                  {i < step ? <CircleCheckBig size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? 'text-white' : i < step ? 'text-emerald-400' : 'text-slate-500'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-600 mx-3 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 0: Select product */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Package size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Paso 1: Seleccioná el producto</h3>
                  <p className="text-xs text-slate-500">Buscá el producto que vas a ingresar al stock</p>
                </div>
              </div>
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto por nombre o código..."
                  className="w-full bg-input border border-input-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map((p) => {
                  const cat = getCategoryById(p.categoryId);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 text-left transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat?.icon || '📦'}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.code} · {p.baseUnit} de {p.baseQuantity} {p.baseUnitLabel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Stock actual</p>
                        <p className={`text-sm font-bold ${p.stock <= p.minStock ? 'text-red-400' : 'text-white'}`}>{p.stock} {p.fractionUnit}s</p>
                        {p.stock <= p.minStock && <Badge variant="danger" className="text-[10px]">Bajo</Badge>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 1: Fractioning */}
          {step === 1 && selectedProduct && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-card-border rounded-xl p-5 space-y-5">
              {/* Selected product info */}
              <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryById(selectedProduct.categoryId)?.icon || '📦'}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedProduct.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{selectedProduct.code}</p>
                  </div>
                </div>
                <button onClick={() => setStep(0)} className="text-xs text-indigo-400 hover:text-indigo-300">Cambiar</button>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Truck size={12} /> Datos del Ingreso
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={`Cantidad de ${selectedProduct.baseUnit}s recibidas *`}
                    type="number"
                    min="1"
                    value={entryData.baseUnitsReceived}
                    onChange={(e) => setEntryData({ ...entryData, baseUnitsReceived: e.target.value })}
                  />
                  <Input
                    label={`Precio de compra por ${selectedProduct.baseUnit} ($)`}
                    type="number"
                    value={entryData.purchasePricePerBase}
                    onChange={(e) => setEntryData({ ...entryData, purchasePricePerBase: e.target.value })}
                  />
                  <div className="col-span-2 space-y-1">
                    <label className="block text-xs font-medium text-slate-400">Proveedor</label>
                    <div className="relative">
                      <select
                        value={entryData.supplier}
                        onChange={(e) => setEntryData({ ...entryData, supplier: e.target.value })}
                        className="w-full bg-input border border-input-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50"
                      >
                        <option value="">Sin proveedor / otro</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}{s.contact ? ` (${s.contact})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    {suppliers.length === 0 && (
                      <p className="text-[10px] text-slate-600">Podés registrar proveedores desde la sección Proveedores del menú.</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedProduct.isFractioned && (
                <div className="border-t border-card-border pt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calculator size={12} /> Calculador de Fraccionamiento
                  </h4>

                  {/* Calculation visualization */}
                  <div className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5 border border-indigo-500/15 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-3 text-center">
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-white">{entryData.baseUnitsReceived}</p>
                        <p className="text-xs text-slate-400">{selectedProduct.baseUnit}s</p>
                        <p className="text-[10px] text-slate-500">× {selectedProduct.baseQuantity} {selectedProduct.baseUnitLabel}</p>
                      </div>
                      <div className="text-slate-500 text-xl">÷</div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-white">{selectedProduct.fractionSize}</p>
                        <p className="text-xs text-slate-400">{selectedProduct.fractionUnitLabel}</p>
                        <p className="text-[10px] text-slate-500">por {selectedProduct.fractionUnit}</p>
                      </div>
                      <div className="text-slate-500 text-xl">−</div>
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-amber-400">{entryData.margin}%</p>
                        <p className="text-xs text-slate-400">merma</p>
                      </div>
                      <div className="text-slate-500 text-xl">=</div>
                      <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                        <p className="text-2xl font-bold text-emerald-400">{autoFractions}</p>
                        <p className="text-xs text-slate-400">{selectedProduct.fractionUnit}s</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Margen de merma (%)"
                      type="number"
                      min="0"
                      max="50"
                      value={entryData.margin}
                      onChange={(e) => setEntryData({ ...entryData, margin: e.target.value, customFractions: '' })}
                    />
                    <Input
                      label={`Ajustar manualmente (deja vacío para usar ${autoFractions})`}
                      type="number"
                      placeholder={`${autoFractions} (automático)`}
                      value={entryData.customFractions}
                      onChange={(e) => setEntryData({ ...entryData, customFractions: e.target.value })}
                    />
                  </div>

                  <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                    <CircleCheckBig size={14} className="text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-slate-300">
                      Se van a registrar <strong className="text-emerald-400">{finalFractions} {selectedProduct.fractionUnit}s</strong> de{' '}
                      <strong className="text-white">{selectedProduct.name}</strong> en el inventario.
                      Stock pasará de <strong className="text-slate-300">{selectedProduct.stock}</strong> a{' '}
                      <strong className="text-indigo-300">{selectedProduct.stock + finalFractions}</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Textarea
                  label="Observaciones"
                  placeholder="Notas del ingreso..."
                  value={entryData.notes}
                  onChange={(e) => setEntryData({ ...entryData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)}>Volver</Button>
                <Button className="flex-1" onClick={() => setStep(2)} icon={ChevronRight}>
                  Ver resumen y confirmar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && selectedProduct && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-card-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ClipboardCheck size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Paso 3: Confirmá el ingreso</h3>
                  <p className="text-xs text-slate-500">Revisá los datos antes de confirmar</p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-card-border rounded-xl p-4 space-y-3">
                {[
                  { label: 'Producto', value: selectedProduct.name },
                  { label: 'Código', value: selectedProduct.code, mono: true },
                  { label: 'Unidades recibidas', value: `${entryData.baseUnitsReceived} ${selectedProduct.baseUnit}(s)` },
                  { label: 'Fracciones a registrar', value: `${finalFractions} ${selectedProduct.fractionUnit}s`, highlight: true },
                  { label: 'Proveedor', value: entryData.supplier || 'No especificado' },
                  { label: 'Costo total', value: formatCurrency((parseFloat(entryData.purchasePricePerBase) || 0) * parseFloat(entryData.baseUnitsReceived)), green: true },
                ].map(({ label, value, mono, highlight, green }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className={`text-xs font-semibold ${highlight ? 'text-indigo-300' : green ? 'text-emerald-400' : 'text-white'} ${mono ? 'font-mono' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>

              {entryData.notes && (
                <div className="bg-white/[0.03] border border-card-border rounded-xl p-3">
                  <p className="text-[10px] text-slate-500 mb-1">Observaciones</p>
                  <p className="text-xs text-slate-300">{entryData.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">Una vez confirmado, el stock se actualizará de forma inmediata.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>Volver</Button>
                <Button variant="success" className="flex-1" onClick={handleConfirmEntry} loading={saving} icon={CircleCheckBig}>
                  Confirmar ingreso de stock
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar: recent entries */}
        <div className="space-y-3">
          <div className="bg-card border border-card-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Últimos ingresos</h3>
            <div className="space-y-2">
              {stockEntries.slice(0, 8).map((entry) => (
                <div key={entry.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{entry.productName}</p>
                      <p className="text-[10px] text-emerald-400 font-medium">+{entry.totalFractionsCreated} {entry.fractionUnitLabel}</p>
                      {entry.supplier && <p className="text-[10px] text-slate-500 truncate">{entry.supplier}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-slate-500">{formatDateTime(entry.date).split(',')[0]}</p>
                      <p className="text-xs text-amber-400 font-medium">{formatCurrency(entry.totalCost)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {stockEntries.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">Sin ingresos registrados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
