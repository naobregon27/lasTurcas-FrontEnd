import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Truck, Phone, Mail,
  MapPin, X, User, FileText, Package, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/dateUtils';

const EMPTY_FORM = {
  name: '', contact: '', phone: '', email: '', address: '', notes: '',
};

export default function Suppliers() {
  const { suppliers, stockEntries, addSupplier, updateSupplier, deleteSupplier } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const enriched = useMemo(() => {
    return suppliers.map((sup) => {
      const entries = stockEntries.filter((e) => e.supplier === sup.name);
      const totalSpent = entries.reduce((a, e) => a + (e.totalCost || 0), 0);
      const lastEntry = entries[0];
      return { ...sup, totalEntries: entries.length, totalSpent, lastEntry };
    });
  }, [suppliers, stockEntries]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched.filter((s) =>
      !q || s.name.toLowerCase().includes(q) || (s.contact || '').toLowerCase().includes(q)
    );
  }, [enriched, search]);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setModal({ open: true, editing: null }); };
  const openEdit = (s) => { setForm({ ...s }); setErrors({}); setModal({ open: true, editing: s.id }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (modal.editing) {
      updateSupplier(modal.editing, form);
      toast.success('Proveedor actualizado');
    } else {
      addSupplier(form);
      toast.success('Proveedor agregado correctamente');
    }
    setSaving(false);
    closeModal();
  };

  const handleDelete = async () => {
    await new Promise((r) => setTimeout(r, 300));
    deleteSupplier(deleteDialog.id);
    toast.success('Proveedor eliminado');
    setDeleteDialog({ open: false, id: null });
  };

  const totalSuppliers = suppliers.length;
  const totalSpentAll = enriched.reduce((a, s) => a + s.totalSpent, 0);
  const totalEntriesAll = enriched.reduce((a, s) => a + s.totalEntries, 0);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Proveedores activos', value: totalSuppliers, icon: Truck, color: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b' },
          { label: 'Ingresos registrados', value: totalEntriesAll, icon: Package, color: 'rgba(99,102,241,0.12)', iconColor: '#818cf8' },
          { label: 'Total compras', value: formatCurrency(totalSpentAll), icon: DollarSign, color: 'rgba(16,185,129,0.12)', iconColor: '#34d399' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.color }}>
              <s.icon size={18} style={{ color: s.iconColor }} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{s.label}</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-card-border rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proveedor..."
            className="w-full bg-input border border-input-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} proveedor{filtered.length !== 1 ? 'es' : ''}</span>
        <Button icon={Plus} onClick={openAdd}>Nuevo Proveedor</Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-card-border rounded-xl">
          <EmptyState
            icon={Truck}
            title="Sin proveedores registrados"
            description="Cargá tus proveedores para tener todo organizado y acceder rápido al registrar stock"
            action={<Button icon={Plus} onClick={openAdd}>Agregar proveedor</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((sup, i) => (
              <motion.div
                key={sup.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-card-border rounded-2xl p-5 phoenix-card-hover"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-amber-900 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
                      {sup.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{sup.name}</p>
                      {sup.contact && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><User size={10} />{sup.contact}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(sup)}
                      className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteDialog({ open: true, id: sup.id })}
                      className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 mb-3">
                  {sup.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone size={11} className="text-slate-600 flex-shrink-0" />
                      <span>{sup.phone}</span>
                    </div>
                  )}
                  {sup.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                      <Mail size={11} className="text-slate-600 flex-shrink-0" />
                      <span className="truncate">{sup.email}</span>
                    </div>
                  )}
                  {sup.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={11} className="text-slate-600 flex-shrink-0" />
                      <span className="truncate">{sup.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats bar */}
                <div className="border-t border-card-border pt-3 mt-3 grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{sup.totalEntries}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Ingresos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-amber-400">{formatCurrency(sup.totalSpent)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Compras</p>
                  </div>
                </div>

                {sup.lastEntry && (
                  <div className="mt-2 px-2 py-1.5 rounded-lg text-[10px] text-slate-500 flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span>Último ingreso</span>
                    <span className="text-slate-400">{formatDate(sup.lastEntry.date)}</span>
                  </div>
                )}

                {sup.notes && (
                  <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500">
                    <FileText size={10} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{sup.notes}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        subtitle="Datos de contacto del proveedor"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving} icon={modal.editing ? Edit2 : Plus}>
              {modal.editing ? 'Guardar cambios' : 'Agregar proveedor'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Nombre del proveedor *"
                placeholder="Ej: Distribuidora El Sur"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
            </div>
            <Input
              label="Contacto (persona)"
              placeholder="Nombre del vendedor"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            <Input
              label="Teléfono"
              placeholder="Ej: 011-4444-5555"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="proveedor@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Dirección"
              placeholder="Calle y número"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <div className="col-span-2">
              <Textarea
                label="Notas"
                placeholder="Días de entrega, condiciones de pago, etc."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Eliminar proveedor"
        message="¿Estás seguro que querés eliminar este proveedor? El historial de ingresos no se verá afectado."
        confirmLabel="Sí, eliminar"
      />
    </div>
  );
}
