export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getTodayString = () => new Date().toISOString().slice(0, 10);

export const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = now.toISOString().slice(0, 10);
  return { start, end };
};

export const groupSalesByDay = (sales) => {
  const grouped = {};
  sales.forEach((sale) => {
    const day = sale.date.slice(0, 10);
    if (!grouped[day]) grouped[day] = { date: day, total: 0, count: 0 };
    grouped[day].total += sale.total;
    grouped[day].count += 1;
  });
  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};
