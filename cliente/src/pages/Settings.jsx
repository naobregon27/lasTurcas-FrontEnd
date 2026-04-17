import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Phone, Mail, MapPin, Hash, Save,
  Download, Upload, Trash2, AlertTriangle, Lock,
  Eye, EyeOff, CheckCircle2, Shield, PlayCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';

function SectionCard({ title, subtitle, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      <div className="px-4 sm:px-6 py-4 border-b border-card-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${iconColor}18` }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { settings, updateSettings, exportData, importData, clearAllData, resetTour, products, sales, suppliers } = useInventoryStore();
  const fileInputRef = useRef(null);

  const [bizForm, setBizForm] = useState({
    businessName: settings.businessName || 'Almacén Fénix',
    address: settings.address || '',
    phone: settings.phone || '',
    email: settings.email || '',
    taxId: settings.taxId || '',
  });

  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false });
  const [savingBiz, setSavingBiz] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [clearDialog, setClearDialog] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  const handleSaveBiz = async () => {
    if (!bizForm.businessName.trim()) { toast.error('El nombre del negocio es requerido'); return; }
    setSavingBiz(true);
    await new Promise((r) => setTimeout(r, 500));
    updateSettings(bizForm);
    setSavingBiz(false);
    toast.success('Información del negocio guardada');
  };

  const handleSavePass = async () => {
    const errs = {};
    const storedPass = settings._adminPassword || 'admin123';
    if (!passForm.current) errs.current = 'Ingresá la contraseña actual';
    else if (passForm.current !== storedPass) errs.current = 'Contraseña actual incorrecta';
    if (!passForm.next || passForm.next.length < 6) errs.next = 'La nueva contraseña debe tener al menos 6 caracteres';
    if (passForm.next !== passForm.confirm) errs.confirm = 'Las contraseñas no coinciden';
    if (Object.keys(errs).length) { setPassErrors(errs); return; }
    setSavingPass(true);
    await new Promise((r) => setTimeout(r, 500));
    updateSettings({ _adminPassword: passForm.next });
    setPassForm({ current: '', next: '', confirm: '' });
    setPassErrors({});
    setSavingPass(false);
    toast.success('Contraseña actualizada correctamente');
  };

  const handleExport = () => {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `fenix-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup descargado correctamente');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const result = importData(data);
        if (result.success) {
          toast.success('Datos restaurados correctamente');
        } else {
          toast.error(result.error || 'Archivo inválido');
        }
      } catch {
        toast.error('El archivo no es un JSON válido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = async () => {
    await new Promise((r) => setTimeout(r, 300));
    clearAllData();
    toast.success('Todos los datos fueron eliminados');
    setClearDialog(false);
  };

  const dataStats = [
    { label: 'Productos', value: products.length },
    { label: 'Ventas', value: sales.length },
    { label: 'Proveedores', value: suppliers.length },
  ];

  return (
    <div className="space-y-5 max-w-3xl mx-auto w-full min-w-0">

      {/* Business info */}
      <SectionCard title="Información del Negocio" subtitle="Datos que se muestran en documentos e impresiones" icon={Building2} iconColor="#f59e0b">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Nombre del negocio"
              placeholder="Almacén Fénix"
              value={bizForm.businessName}
              onChange={(e) => setBizForm({ ...bizForm, businessName: e.target.value })}
            />
          </div>
          <Input
            label="Dirección"
            placeholder="Calle 123, Ciudad"
            value={bizForm.address}
            onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
            icon={MapPin}
          />
          <Input
            label="Teléfono"
            placeholder="011-4444-5555"
            value={bizForm.phone}
            onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
            icon={Phone}
          />
          <Input
            label="Email"
            type="email"
            placeholder="almacen@email.com"
            value={bizForm.email}
            onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
            icon={Mail}
          />
          <Input
            label="CUIT / CUIL"
            placeholder="20-12345678-9"
            value={bizForm.taxId}
            onChange={(e) => setBizForm({ ...bizForm, taxId: e.target.value })}
            icon={Hash}
          />
        </div>
        <div className="mt-5 flex justify-end">
          <Button icon={Save} onClick={handleSaveBiz} loading={savingBiz}>
            Guardar información
          </Button>
        </div>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Cambiar Contraseña" subtitle="Actualizá la contraseña de acceso al sistema" icon={Shield} iconColor="#818cf8">
        <div className="space-y-3">
          {[
            { key: 'current', label: 'Contraseña actual' },
            { key: 'next', label: 'Nueva contraseña' },
            { key: 'confirm', label: 'Confirmar nueva contraseña' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">{label}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={13} className="text-slate-600" />
                </div>
                <input
                  type={showPass[key] ? 'text' : 'password'}
                  value={passForm[key]}
                  onChange={(e) => setPassForm({ ...passForm, [key]: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full bg-input border rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all
                    ${passErrors[key] ? 'border-red-500/60 focus:ring-red-500/30' : 'border-input-border focus:ring-amber-500/40 focus:border-amber-500/50'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => ({ ...p, [key]: !p[key] }))}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPass[key] ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {passErrors[key] && <p className="text-xs text-red-400">{passErrors[key]}</p>}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button icon={Lock} onClick={handleSavePass} loading={savingPass}>
            Actualizar contraseña
          </Button>
        </div>
      </SectionCard>

      {/* Backup */}
      <SectionCard title="Copia de Seguridad" subtitle="Exportá e importá todos los datos del sistema" icon={Download} iconColor="#34d399">
        {/* Data overview */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {dataStats.map((d) => (
            <div key={d.label} className="flex-1 text-center p-3 rounded-xl border border-card-border"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-xl font-bold text-white">{d.value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{d.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex flex-col items-center gap-2 p-5 rounded-xl border transition-all text-center"
            style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(52,211,153,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(52,211,153,0.06)'}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Download size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Exportar datos</p>
              <p className="text-[11px] text-slate-500">Descargar backup en JSON</p>
            </div>
          </motion.button>

          {/* Import */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-5 rounded-xl border transition-all text-center"
            style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.06)'}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Upload size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Importar datos</p>
              <p className="text-[11px] text-slate-500">Restaurar desde backup</p>
            </div>
          </motion.button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-400"
          style={{ background: 'rgba(52,211,153,0.05)', borderLeft: '2px solid rgba(52,211,153,0.3)' }}>
          <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <span>Los backups incluyen productos, ventas, ingresos de stock, proveedores, categorías y configuración.</span>
        </div>
      </SectionCard>

      {/* Tour */}
      <SectionCard title="Tour Guiado" subtitle="Volvé a ver la guía de bienvenida del sistema" icon={PlayCircle} iconColor="#f59e0b">
        <div className="flex items-center justify-between p-4 rounded-xl border"
          style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <div>
            <p className="text-sm font-semibold text-white">Reiniciar el tour de bienvenida</p>
            <p className="text-xs text-slate-500 mt-0.5">Al ir al Dashboard se iniciará nuevamente la guía paso a paso.</p>
          </div>
          <button
            onClick={() => { resetTour(); toast.success('¡Tour reiniciado! Andá al Dashboard para verlo.'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
            style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', color: '#fbbf24' }}
          >
            <PlayCircle size={14} />
            Ver tour
          </button>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Zona de Peligro" subtitle="Acciones irreversibles sobre los datos" icon={AlertTriangle} iconColor="#f87171">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border"
          style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Borrar todos los datos</p>
            <p className="text-xs text-slate-500 mt-0.5">Elimina productos, ventas, stock y movimientos. No se puede deshacer.</p>
          </div>
          <button
            onClick={() => setClearDialog(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors w-full sm:w-auto flex-shrink-0"
          >
            <Trash2 size={14} />
            Borrar todo
          </button>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={clearDialog}
        onClose={() => setClearDialog(false)}
        onConfirm={handleClearAll}
        title="¿Borrar todos los datos?"
        message="Esta acción eliminará permanentemente todos los productos, ventas, ingresos de stock y proveedores. Se recomienda exportar un backup antes de continuar."
        confirmLabel="Sí, borrar todo"
      />
    </div>
  );
}
