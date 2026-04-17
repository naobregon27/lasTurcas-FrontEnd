import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Tags, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/dateUtils';

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#D97706', '#14B8A6', '#F43F5E', '#6366F1'];
const ICONS = ['🥦', '🏪', '🥛', '🥤', '🧹', '🥩', '🍞', '🍎', '🍺', '🧀', '🥚', '🧆', '🍫', '🌽', '🍅'];

const EMPTY_FORM = { name: '', color: COLORS[0], icon: ICONS[0] };

export default function Categories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useInventoryStore();
  const [modal, setModal] = useState({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setModal({ open: true, editing: null }); };
  const openEdit = (c) => { setForm({ name: c.name, color: c.color, icon: c.icon }); setErrors({}); setModal({ open: true, editing: c.id }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const getProductCount = (catId) => products.filter((p) => p.categoryId === catId).length;
  const getStockValue = (catId) => products.filter((p) => p.categoryId === catId).reduce((a, p) => a + p.stock * p.salePrice, 0);

  const handleSave = async () => {
    if (!form.name.trim()) { setErrors({ name: 'El nombre es requerido' }); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    if (modal.editing) {
      updateCategory(modal.editing, form);
      toast.success('Categoría actualizada');
    } else {
      addCategory(form);
      toast.success('Categoría creada');
    }
    setSaving(false);
    closeModal();
  };

  const handleDelete = async () => {
    const inUse = products.some((p) => p.categoryId === deleteDialog.id);
    if (inUse) { toast.error('No se puede eliminar: hay productos asignados a esta categoría'); setDeleteDialog({ open: false, id: null }); return; }
    deleteCategory(deleteDialog.id);
    toast.success('Categoría eliminada');
    setDeleteDialog({ open: false, id: null });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-400">{categories.length} categorías registradas</p>
        </div>
        <Button icon={Plus} onClick={openAdd}>Nueva Categoría</Button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-card border border-card-border rounded-xl">
          <EmptyState icon={Tags} title="Sin categorías" description="Creá la primera categoría para organizar tus productos" action={<Button icon={Plus} onClick={openAdd}>Crear categoría</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {categories.map((cat, i) => {
              const count = getProductCount(cat.id);
              const value = getStockValue(cat.id);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-card-border rounded-2xl p-4 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: cat.color + '20', border: `1px solid ${cat.color}40` }}>
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                          <span className="text-[10px] text-slate-500 font-mono">{cat.color}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => setDeleteDialog({ open: true, id: cat.id })} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-lg font-bold text-white">{count}</p>
                      <p className="text-[10px] text-slate-500">Productos</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-sm font-bold text-emerald-400">{formatCurrency(value)}</p>
                      <p className="text-[10px] text-slate-500">Valor stock</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.editing ? 'Editar Categoría' : 'Nueva Categoría'}
        size="sm"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 w-full">
            <Button variant="ghost" onClick={closeModal} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} icon={modal.editing ? Edit2 : Plus} className="w-full sm:w-auto">
              {modal.editing ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input label="Nombre de la categoría *" placeholder="Ej: Frutas y Verduras" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />

          {/* Icon picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Ícono</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all border ${
                    form.icon === icon ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-lg transition-all border-2 ${form.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: form.color + '25', border: `1px solid ${form.color}50` }}>
              {form.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{form.name || 'Nombre de categoría'}</p>
              <p className="text-[10px] text-slate-500">Vista previa</p>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        message="¿Estás seguro que querés eliminar esta categoría? Si tiene productos asignados, no se podrá eliminar."
        confirmLabel="Eliminar"
      />
    </div>
  );
}
