import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'General', color: '#64748B', icon: '📦' },
];

const INITIAL_SETTINGS = {
  businessName: 'Almacén Fénix',
  address: '',
  phone: '',
  email: '',
  taxId: '',
  tourCompleted: false,
};

const useInventoryStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      categories: INITIAL_CATEGORIES,
      products: [],
      stockEntries: [],
      sales: [],
      suppliers: [],
      notes: [],
      settings: INITIAL_SETTINGS,

      // AUTH
      login: (username, password) => {
        const { settings } = get();
        const storedPass = settings._adminPassword || 'admin123';
        if (username === 'admin' && password === storedPass) {
          set({ user: { id: 'usr-1', name: 'Administrador', username: 'admin', role: 'admin' }, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      // SETTINGS
      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),

      completeTour: () =>
        set((s) => ({ settings: { ...s.settings, tourCompleted: true } })),

      resetTour: () =>
        set((s) => ({ settings: { ...s.settings, tourCompleted: false } })),

      // CATEGORIES
      addCategory: (category) => {
        const newCategory = { id: `cat-${Date.now()}`, ...category };
        set((s) => ({ categories: [...s.categories, newCategory] }));
        return newCategory;
      },
      updateCategory: (id, data) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // SUPPLIERS
      addSupplier: (supplier) => {
        const newSupplier = {
          id: `sup-${Date.now()}`,
          ...supplier,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ suppliers: [...s.suppliers, newSupplier] }));
        return newSupplier;
      },
      updateSupplier: (id, data) =>
        set((s) => ({ suppliers: s.suppliers.map((s) => (s.id === id ? { ...s, ...data } : s)) })),
      deleteSupplier: (id) =>
        set((s) => ({ suppliers: s.suppliers.filter((s) => s.id !== id) })),

      // NOTES
      addNote: (note) => {
        const newNote = {
          id: `note-${Date.now()}`,
          text: note.text,
          color: note.color || 'amber',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notes: [newNote, ...s.notes] }));
        return newNote;
      },
      updateNote: (id, text) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, text } : n)) })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // PRODUCTS
      addProduct: (product) => {
        const category = get().categories.find((c) => c.id === product.categoryId);
        const prefix = category ? category.name.slice(0, 3).toUpperCase().replace(/\s/g, '') : 'PRD';
        const namePrefix = product.name.slice(0, 3).toUpperCase().replace(/\s/g, '');
        const count = get().products.length + 1;
        const code = `${prefix}-${namePrefix}-${String(count).padStart(3, '0')}`;
        const now = new Date().toISOString();
        const newProduct = {
          id: `prod-${Date.now()}`,
          code,
          barcode: code,
          ...product,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ products: [...s.products, newProduct] }));
        return newProduct;
      },
      updateProduct: (id, data) => {
        const now = new Date().toISOString();
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now } : p)),
        }));
      },
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      // STOCK ENTRIES
      addStockEntry: (entry) => {
        const product = get().products.find((p) => p.id === entry.productId);
        if (!product) return { success: false, error: 'Producto no encontrado' };
        const newEntry = {
          id: `entry-${Date.now()}`,
          ...entry,
          productName: product.name,
          date: new Date().toISOString(),
          createdBy: get().user?.username || 'admin',
        };
        set((s) => ({
          stockEntries: [newEntry, ...s.stockEntries],
          products: s.products.map((p) =>
            p.id === entry.productId
              ? { ...p, stock: p.stock + entry.totalFractionsCreated, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
        return { success: true, entry: newEntry };
      },

      // SALES
      addSale: (sale) => {
        const saleNumber = `VTA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(get().sales.length + 1).padStart(3, '0')}`;
        const now = new Date().toISOString();
        const newSale = {
          id: `sale-${Date.now()}`,
          saleNumber,
          ...sale,
          date: now,
          createdBy: get().user?.username || 'admin',
        };
        const updatedProducts = get().products.map((product) => {
          const saleItem = sale.items.find((i) => i.productId === product.id);
          if (saleItem) {
            return { ...product, stock: Math.max(0, product.stock - saleItem.quantity), updatedAt: now };
          }
          return product;
        });
        set((s) => ({ sales: [newSale, ...s.sales], products: updatedProducts }));
        return { success: true, sale: newSale };
      },

      deleteSale: (id) => {
        const sale = get().sales.find((s) => s.id === id);
        if (!sale) return;
        const now = new Date().toISOString();
        const updatedProducts = get().products.map((product) => {
          const saleItem = sale.items.find((i) => i.productId === product.id);
          if (saleItem) {
            return { ...product, stock: product.stock + saleItem.quantity, updatedAt: now };
          }
          return product;
        });
        set((s) => ({ sales: s.sales.filter((s) => s.id !== id), products: updatedProducts }));
      },

      // COMPUTED
      getLowStockProducts: () => get().products.filter((p) => p.stock <= p.minStock),
      getTotalStockValue: () => get().products.reduce((acc, p) => acc + p.stock * p.salePrice, 0),
      getTodaySales: () => {
        const today = new Date().toISOString().slice(0, 10);
        return get().sales.filter((s) => s.date.startsWith(today));
      },
      getSalesByDateRange: (startDate, endDate) => {
        return get().sales.filter((s) => {
          const d = s.date.slice(0, 10);
          return d >= startDate && d <= endDate;
        });
      },

      getProductMovements: (productId) => {
        const entries = get().stockEntries
          .filter((e) => e.productId === productId)
          .map((e) => ({ ...e, type: 'entry', qty: e.totalFractionsCreated }));
        const exits = [];
        get().sales.forEach((sale) => {
          sale.items.forEach((item) => {
            if (item.productId === productId) {
              exits.push({
                id: `${sale.id}-${item.productId}`,
                type: 'sale',
                qty: item.quantity,
                date: sale.date,
                saleNumber: sale.saleNumber,
                customerName: sale.customerName,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
                paymentMethod: sale.paymentMethod,
              });
            }
          });
        });
        return [...entries, ...exits].sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      getSupplierStats: (supplierId) => {
        const supplier = get().suppliers.find((s) => s.id === supplierId);
        if (!supplier) return null;
        const entries = get().stockEntries.filter((e) => e.supplier === supplier.name);
        const totalSpent = entries.reduce((a, e) => a + (e.totalCost || 0), 0);
        const lastEntry = entries[0];
        return { totalEntries: entries.length, totalSpent, lastEntry };
      },

      // DATA BACKUP / RESTORE
      exportData: () => {
        const { categories, products, stockEntries, sales, suppliers, notes, settings } = get();
        return { categories, products, stockEntries, sales, suppliers, notes, settings, exportedAt: new Date().toISOString(), version: 'v2' };
      },

      importData: (data) => {
        if (!data || data.version !== 'v2') return { success: false, error: 'Formato de archivo inválido' };
        set({
          categories: data.categories || INITIAL_CATEGORIES,
          products: data.products || [],
          stockEntries: data.stockEntries || [],
          sales: data.sales || [],
          suppliers: data.suppliers || [],
          notes: data.notes || [],
          settings: { ...INITIAL_SETTINGS, ...(data.settings || {}) },
        });
        return { success: true };
      },

      clearAllData: () => {
        set({
          categories: INITIAL_CATEGORIES,
          products: [],
          stockEntries: [],
          sales: [],
          suppliers: [],
          notes: [],
          settings: INITIAL_SETTINGS,
        });
      },
    }),
    { name: 'las-turcas-inventory-v2' }
  )
);

export default useInventoryStore;
