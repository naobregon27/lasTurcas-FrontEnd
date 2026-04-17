import * as XLSX from 'xlsx';

export const exportInventoryToExcel = (products, categories) => {
  const data = products.map((p) => {
    const cat = categories.find((c) => c.id === p.categoryId);
    return {
      Código: p.code,
      Nombre: p.name,
      Categoría: cat?.name || '-',
      'Unidad Base': p.baseUnit,
      'Cantidad Base': p.baseQuantity,
      'Unidad Fracción': p.fractionUnit,
      'Tamaño Fracción': p.fractionSize,
      'Stock Actual': p.stock,
      'Stock Mínimo': p.minStock,
      'Precio Compra (base)': p.purchasePrice,
      'Precio Venta': p.salePrice,
      'Valor Stock Total': p.stock * p.salePrice,
      'Estado Stock': p.stock <= p.minStock ? 'BAJO' : 'OK',
      'Última Actualización': new Date(p.updatedAt).toLocaleString('es-AR'),
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const colWidths = [
    { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
    { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 22 },
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
  XLSX.writeFile(wb, `Inventario_LasTurcas_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportSalesToExcel = (sales) => {
  const data = [];
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      data.push({
        'N° Venta': sale.saleNumber,
        Fecha: new Date(sale.date).toLocaleString('es-AR'),
        Cliente: sale.customerName || 'Mostrador',
        'Pago': sale.paymentMethod,
        Código: item.productCode,
        Producto: item.productName,
        Cantidad: item.quantity,
        'Precio Unitario': item.unitPrice,
        Subtotal: item.subtotal,
        'Total Venta': sale.total,
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 15 },
    { wch: 25 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
  XLSX.writeFile(wb, `Ventas_LasTurcas_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
