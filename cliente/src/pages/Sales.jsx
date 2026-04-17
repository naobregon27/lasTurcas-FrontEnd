import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, CircleCheckBig,
  Barcode, User, Banknote, CreditCard, Smartphone, Printer, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'transferencia', label: 'Transferencia', icon: Smartphone },
  { id: 'debito', label: 'Débito', icon: CreditCard },
  { id: 'credito', label: 'Crédito', icon: CreditCard },
];

export default function Sales() {
  const { products, categories, addSale } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successSale, setSuccessSale] = useState(null);
  const receiptRef = useRef(null);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products.filter((p) => p.stock > 0);
    return products.filter(
      (p) => p.stock > 0 && (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    );
  }, [products, search]);

  const cartTotal = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const addToCart = (product) => {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Stock insuficiente. Disponible: ${product.stock} ${product.fractionUnit}s`);
        return;
      }
      setCart(cart.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      setCart([...cart, {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        fractionUnit: product.fractionUnit,
        availableStock: product.stock,
        quantity: 1,
        unitPrice: product.salePrice,
        subtotal: product.salePrice,
      }]);
    }
    setSearch('');
    toast.success(`${product.name} agregado`, { duration: 1500 });
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    const item = cart.find((i) => i.productId === productId);
    if (qty > item.availableStock) { toast.error(`Máximo disponible: ${item.availableStock}`); return; }
    setCart(cart.map((i) => i.productId === productId ? { ...i, quantity: qty, subtotal: qty * i.unitPrice } : i));
  };

  const updatePrice = (productId, price) => {
    const p = parseFloat(price) || 0;
    setCart(cart.map((i) => i.productId === productId ? { ...i, unitPrice: p, subtotal: i.quantity * p } : i));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((i) => i.productId !== productId));
  };

  const handleSale = async () => {
    if (cart.length === 0) { toast.error('Agregá al menos un producto al carrito'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = addSale({
      items: cart.map((i) => ({ ...i, subtotal: i.quantity * i.unitPrice })),
      total: cartTotal,
      customerName: customerName.trim() || 'Cliente Mostrador',
      paymentMethod,
      notes,
    });
    setSaving(false);
    if (result.success) {
      setSuccessSale(result.sale);
      setCart([]);
      setCustomerName('');
      setNotes('');
      toast.success(`¡Venta registrada! ${result.sale.saleNumber}`, { duration: 6000 });
    } else {
      toast.error('Error al registrar la venta');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Enviando ticket a impresora...');
  };

  const getCategoryById = (id) => categories.find((c) => c.id === id);

  if (successSale) {
    return (
      <div className="max-w-lg mx-auto w-full px-1 sm:px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-emerald-500/30 rounded-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 px-6 py-6 text-center border-b border-emerald-500/20">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-3">
              <CircleCheckBig size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">¡Venta Registrada!</h2>
            <p className="text-sm text-emerald-400 font-mono mt-1">{successSale.saleNumber}</p>
          </div>

          {/* Receipt */}
          <div ref={receiptRef} className="px-6 py-5 space-y-4">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatDateTime(successSale.date)}</span>
              <span>{successSale.paymentMethod}</span>
            </div>

            <div className="border-t border-card-border pt-3 space-y-2">
              {successSale.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{formatCurrency(item.quantity * item.unitPrice)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-card-border pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-300">TOTAL</span>
              <span className="text-2xl font-bold text-emerald-400">{formatCurrency(successSale.total)}</span>
            </div>

            {successSale.customerName !== 'Cliente Mostrador' && (
              <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-slate-400">
                Cliente: <strong className="text-white">{successSale.customerName}</strong>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 pb-5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button variant="ghost" icon={Printer} className="w-full sm:flex-1" onClick={handlePrint}>Imprimir ticket</Button>
            <Button className="w-full sm:flex-1" icon={Plus} onClick={() => setSuccessSale(null)}>Nueva venta</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-full">
      {/* Products search */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none gap-1">
              <Search size={14} className="text-slate-500" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código de barras..."
              className="w-full bg-input border border-input-border rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[min(520px,55vh)] sm:max-h-[520px] overflow-y-auto">
            {filteredProducts.map((p) => {
              const cat = getCategoryById(p.categoryId);
              const inCart = cart.find((i) => i.productId === p.id);
              return (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(p)}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    inCart
                      ? 'bg-indigo-500/15 border-indigo-500/40'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-indigo-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{cat?.icon || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.code}</p>
                    </div>
                    {inCart && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(p.salePrice)}</span>
                    <span className={`text-[10px] ${p.stock <= p.minStock ? 'text-red-400' : 'text-slate-500'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                </motion.button>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="sm:col-span-2 text-center py-8 text-sm text-slate-500">
                {search ? `Sin resultados para "${search}"` : 'No hay productos con stock disponible'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="bg-card border border-card-border rounded-xl flex flex-col flex-1">
          {/* Cart header */}
          <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className="text-indigo-400" />
              <span className="text-sm font-semibold text-white">Carrito</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{cart.length}</span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Vaciar</button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0" style={{ maxHeight: '280px' }}>
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.03] border border-white/5 rounded-xl p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-medium text-white leading-tight flex-1">{item.productName}</p>
                    <button onClick={() => removeFromCart(item.productId)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        className="w-10 text-center bg-input border border-input-border rounded-lg py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">$</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updatePrice(item.productId, e.target.value)}
                        className="w-16 text-right bg-input border border-input-border rounded-lg py-0.5 px-1 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                    </div>
                    <span className="text-xs font-bold text-white">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart size={28} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Seleccioná productos del catálogo</p>
              </div>
            )}
          </div>

          {/* Cart footer */}
          {cart.length > 0 && (
            <div className="px-4 pb-4 border-t border-card-border pt-3 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Total</span>
                <span className="text-2xl font-bold text-emerald-400">{formatCurrency(cartTotal)}</span>
              </div>

              {/* Customer */}
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente (opcional)"
                  className="w-full bg-input border border-input-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>

              {/* Payment method */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-medium transition-all border ${
                      paymentMethod === id
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>

              <Button
                variant="success"
                className="w-full"
                icon={CircleCheckBig}
                onClick={handleSale}
                loading={saving}
                size="lg"
              >
                Confirmar venta · {formatCurrency(cartTotal)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
