import { useMemo, useRef, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  FileSpreadsheet, Printer, TrendingUp, Package, ShoppingCart,
  DollarSign, AlertTriangle, ChartColumnBig,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import { formatCurrency, formatDate, groupSalesByDay } from '../utils/dateUtils';
import { exportInventoryToExcel, exportSalesToExcel } from '../utils/exportExcel';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name === 'total' || p.name === 'Total ($)' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const { products, sales, categories, stockEntries, getLowStockProducts, getTotalStockValue } = useInventoryStore();
  const [activeTab, setActiveTab] = useState('ventas');
  const printRef = useRef(null);
  const lowStock = getLowStockProducts();

  const salesStats = useMemo(() => {
    const total = sales.reduce((a, s) => a + s.total, 0);
    const avgTicket = sales.length ? total / sales.length : 0;
    const today = new Date().toISOString().slice(0, 10);
    const todayRevenue = sales.filter((s) => s.date.startsWith(today)).reduce((a, s) => a + s.total, 0);
    return { total, avgTicket, count: sales.length, todayRevenue };
  }, [sales]);

  const salesByDay = useMemo(() => {
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400000);
      return d.toISOString().slice(0, 10);
    });
    const grouped = groupSalesByDay(sales);
    return last14.map((day) => {
      const found = grouped.find((g) => g.date === day);
      const label = new Date(day + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      return { date: label, 'Total ($)': found?.total || 0, Ventas: found?.count || 0 };
    });
  }, [sales]);

  const productSales = useMemo(() => {
    const counts = {};
    const revenue = {};
    sales.forEach((s) => s.items.forEach((item) => {
      counts[item.productId] = (counts[item.productId] || 0) + item.quantity;
      revenue[item.productId] = (revenue[item.productId] || 0) + item.quantity * item.unitPrice;
    }));
    return products.map((p) => ({
      name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
      fullName: p.name,
      code: p.code,
      vendidas: counts[p.id] || 0,
      ingresos: revenue[p.id] || 0,
      stock: p.stock,
      salePrice: p.salePrice,
    })).sort((a, b) => b.vendidas - a.vendidas);
  }, [products, sales]);

  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catProds = products.filter((p) => p.categoryId === cat.id);
      const value = catProds.reduce((a, p) => a + p.stock * p.salePrice, 0);
      const count = catProds.length;
      return { name: cat.name, icon: cat.icon, value, count, color: cat.color };
    }).filter((c) => c.count > 0).sort((a, b) => b.value - a.value);
  }, [categories, products]);

  const paymentStats = useMemo(() => {
    const byMethod = {};
    sales.forEach((s) => {
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.total;
    });
    return Object.entries(byMethod).map(([name, value]) => ({ name, value }));
  }, [sales]);

  const handlePrint = () => {
    window.print();
    toast.success('Enviando reporte a impresora...');
  };

  const handleExportInventory = () => {
    exportInventoryToExcel(products, categories);
    toast.success('Inventario exportado a Excel');
  };

  const handleExportSales = () => {
    exportSalesToExcel(sales);
    toast.success('Ventas exportadas a Excel');
  };

  const TABS = [
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'productos', label: 'Productos', icon: ChartColumnBig },
  ];

  return (
    <div className="space-y-5" ref={printRef}>
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex bg-card border border-card-border rounded-xl p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrint}>Imprimir</Button>
          <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={handleExportInventory}>Export Inventario</Button>
          <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={handleExportSales}>Export Ventas</Button>
        </div>
      </div>

      {/* Sales Tab */}
      {activeTab === 'ventas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Ventas" value={formatCurrency(salesStats.total)} subtitle={`${salesStats.count} transacciones`} icon={DollarSign} color="emerald" />
            <StatCard title="Ticket Promedio" value={formatCurrency(salesStats.avgTicket)} subtitle="Por venta" icon={TrendingUp} color="indigo" />
            <StatCard title="Ventas Hoy" value={formatCurrency(salesStats.todayRevenue)} subtitle="Día actual" icon={ShoppingCart} color="violet" />
            <StatCard title="Total Ingresos" value={formatCurrency(getTotalStockValue())} subtitle="Valor stock actual" icon={Package} color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Evolución de Ventas — Últimos 14 días</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={salesByDay} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="Total ($)" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-card-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Métodos de Pago</h3>
              <p className="text-xs text-slate-500 mb-4">Distribución por monto</p>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={paymentStats} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                    {paymentStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#0f1929', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {paymentStats.map((p, i) => (
                  <div key={p.name} className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-400 capitalize">{p.name}</span>
                    </div>
                    <span className="text-white font-medium">{formatCurrency(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventario' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Productos" value={products.length} subtitle="En catálogo" icon={Package} color="indigo" />
            <StatCard title="Valor Stock" value={formatCurrency(getTotalStockValue())} subtitle="Total valorizado" icon={TrendingUp} color="emerald" />
            <StatCard title="Stock Bajo" value={lowStock.length} subtitle="Necesitan reposición" icon={AlertTriangle} color={lowStock.length > 0 ? 'red' : 'emerald'} />
            <StatCard title="Ingresos Registrados" value={stockEntries.length} subtitle="Total de cargas" icon={Package} color="violet" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-card-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Valor de Stock por Categoría</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryStats} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v.split(' ')[0]} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" name="Valor ($)" radius={[4, 4, 0, 0]}>
                    {categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Low stock alert table */}
            <div className="bg-card border border-card-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={14} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Productos con Stock Bajo</h3>
              </div>
              {lowStock.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">¡Todo el stock está en buen nivel!</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.map((p) => {
                    const pct = Math.round((p.stock / p.minStock) * 100);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-white">{p.name}</p>
                          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-bold text-red-400">{p.stock}</p>
                          <p className="text-[10px] text-slate-500">mín. {p.minStock}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Full inventory table */}
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-card-border flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Inventario Completo</h3>
              <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={handleExportInventory}>Exportar Excel</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    {['Código', 'Producto', 'Categoría', 'Stock', 'Mín.', 'Precio Venta', 'Valor Stock', 'Estado'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    const isLow = p.stock <= p.minStock;
                    return (
                      <tr key={p.id} className="border-b border-card-border/50 hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 text-[10px] font-mono text-slate-400">{p.code}</td>
                        <td className="px-4 py-2.5 text-xs text-white font-medium">{p.name}</td>
                        <td className="px-4 py-2.5 text-[10px] text-slate-400">{cat?.icon} {cat?.name}</td>
                        <td className="px-4 py-2.5 text-xs font-bold text-white">{p.stock} {p.fractionUnit}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{p.minStock}</td>
                        <td className="px-4 py-2.5 text-xs text-emerald-400 font-semibold">{formatCurrency(p.salePrice)}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-300">{formatCurrency(p.stock * p.salePrice)}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={isLow ? 'danger' : 'success'} className="text-[10px]">{isLow ? 'Bajo' : 'OK'}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'productos' && (
        <div className="space-y-4">
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Unidades Vendidas por Producto</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={productSales.slice(0, 10)} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Bar dataKey="vendidas" name="Unidades vendidas" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-card-border">
              <h3 className="text-sm font-semibold text-white">Ranking de Productos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    {['#', 'Código', 'Producto', 'Unidades Vendidas', 'Ingresos', 'Stock Actual', 'Precio'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productSales.map((p, i) => (
                    <tr key={p.code} className="border-b border-card-border/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-500">#{i + 1}</td>
                      <td className="px-4 py-2.5 text-[10px] font-mono text-slate-400">{p.code}</td>
                      <td className="px-4 py-2.5 text-xs text-white font-medium">{p.fullName}</td>
                      <td className="px-4 py-2.5 text-sm font-bold text-indigo-400">{p.vendidas}</td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-emerald-400">{formatCurrency(p.ingresos)}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-300">{p.stock}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-300">{formatCurrency(p.salePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
