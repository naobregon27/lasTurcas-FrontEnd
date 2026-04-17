import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  ShoppingCart, Package, AlertTriangle, TrendingUp,
  ArrowDownToLine, DollarSign, Plus, Eye,
} from 'lucide-react';
import useInventoryStore from '../store/useInventoryStore';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate, groupSalesByDay } from '../utils/dateUtils';

const CHART_COLORS = ['#f59e0b', '#10B981', '#f97316', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-card-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {typeof p.value === 'number' && p.name === 'total' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, sales, categories, getLowStockProducts, getTotalStockValue } = useInventoryStore();
  const lowStock = getLowStockProducts();

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter((s) => s.date.startsWith(today));
    const todayRevenue = todaySales.reduce((a, s) => a + s.total, 0);

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const yesterdaySales = sales.filter((s) => s.date.startsWith(yesterday));
    const yesterdayRevenue = yesterdaySales.reduce((a, s) => a + s.total, 0);
    const trend = yesterdayRevenue ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;

    return {
      todayRevenue,
      todaySalesCount: todaySales.length,
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      totalStockValue: getTotalStockValue(),
      trend,
    };
  }, [products, sales, lowStock]);

  const salesChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      return d.toISOString().slice(0, 10);
    });
    const grouped = groupSalesByDay(sales);
    return last7Days.map((day) => {
      const found = grouped.find((g) => g.date === day);
      const label = new Date(day + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      return { date: label, total: found?.total || 0, count: found?.count || 0 };
    });
  }, [sales]);

  const categoryData = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      const value = catProducts.reduce((a, p) => a + p.stock * p.salePrice, 0);
      return { name: cat.name, value, icon: cat.icon };
    }).filter((c) => c.value > 0).sort((a, b) => b.value - a.value);
  }, [categories, products]);

  const topProducts = useMemo(() => {
    const saleCount = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        saleCount[item.productId] = (saleCount[item.productId] || 0) + item.quantity;
      });
    });
    return products
      .map((p) => ({ ...p, sold: saleCount[p.id] || 0 }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [products, sales]);

  const recentSales = useMemo(() => sales.slice(0, 5), [sales]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative rounded-2xl px-4 sm:px-6 py-4 overflow-hidden border" style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.15) 0%, rgba(245,158,11,0.08) 50%, transparent 100%)', borderColor: 'rgba(245,158,11,0.2)' }}>
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-violet-500/5 to-transparent" />
        <h2 className="text-base sm:text-lg font-bold text-white">Bienvenido al Panel de Control</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
          <Button size="sm" icon={Plus} onClick={() => navigate('/stock-entry')}>Cargar Stock</Button>
          <Button size="sm" variant="ghost" icon={ShoppingCart} onClick={() => navigate('/sales')}>Nueva Venta</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Ventas Hoy"
          value={formatCurrency(stats.todayRevenue)}
          subtitle={`${stats.todaySalesCount} transacción${stats.todaySalesCount !== 1 ? 'es' : ''}`}
          icon={DollarSign}
          color="emerald"
          trend={stats.trend}
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          subtitle="En catálogo"
          icon={Package}
          color="phoenix"
        />
        <StatCard
          title="Valor de Stock"
          value={formatCurrency(stats.totalStockValue)}
          subtitle="Stock total valorizado"
          icon={TrendingUp}
          color="violet"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockCount}
          subtitle="Productos a reponer"
          icon={AlertTriangle}
          color={stats.lowStockCount > 0 ? 'red' : 'emerald'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Area Chart */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Ventas — Últimos 7 días</h3>
              <p className="text-xs text-slate-500">Total facturado por día</p>
            </div>
            <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate('/reports')}>Ver más</Button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-card border border-card-border rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Valor por Categoría</h3>
          <p className="text-xs text-slate-500 mb-4">Distribución del stock</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ background: '#0f1020', border: '1px solid #1a1d2e', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-xs text-slate-400 truncate max-w-[100px]">{cat.icon} {cat.name}</span>
                </div>
                <span className="text-xs text-slate-300 font-medium">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="bg-card border border-red-500/20 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={14} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Alerta de Stock Bajo</h3>
                <p className="text-xs text-slate-500">{lowStock.length} producto(s) necesitan reposición</p>
              </div>
            </div>
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-red-500/5 border border-red-500/15">
                  <div>
                    <p className="text-xs font-medium text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{p.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-400">{p.stock} {p.fractionUnit}</p>
                    <p className="text-[10px] text-slate-500">mín. {p.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" icon={ArrowDownToLine} className="mt-3 w-full" onClick={() => navigate('/stock-entry')}>
              Cargar Stock Ahora
            </Button>
          </div>
        )}

        {/* Recent sales */}
        <div className="bg-card border border-card-border rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Últimas Ventas</h3>
              <p className="text-xs text-slate-500">Transacciones recientes</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/sales-history')}>Ver todo</Button>
          </div>
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                    <ShoppingCart size={13} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{sale.customerName || 'Mostrador'}</p>
                    <p className="text-[10px] text-slate-500">{sale.saleNumber} · {formatDate(sale.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{formatCurrency(sale.total)}</p>
                  <Badge variant={sale.paymentMethod === 'efectivo' ? 'success' : 'info'} className="text-[10px]">
                    {sale.paymentMethod}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card border border-card-border rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Productos Más Vendidos</h3>
              <p className="text-xs text-slate-500">Por unidades despachadas</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1d2e" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: '#0f1020', border: '1px solid #1a1d2e', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="sold" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Vendidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
