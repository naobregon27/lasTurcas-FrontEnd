import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useInventoryStore from '../store/useInventoryStore';

const SPARKS = [
  { size: 3, left: '20%', delay: '0s',   duration: '3.2s', drift: '-10px', color: '#f59e0b' },
  { size: 2, left: '30%', delay: '0.8s', duration: '2.8s', drift: '8px',   color: '#fbbf24' },
  { size: 4, left: '50%', delay: '0.3s', duration: '3.8s', drift: '-6px',  color: '#f97316' },
  { size: 2, left: '62%', delay: '1.4s', duration: '3.0s', drift: '12px',  color: '#fcd34d' },
  { size: 3, left: '75%', delay: '0.6s', duration: '3.5s', drift: '-8px',  color: '#f59e0b' },
  { size: 2, left: '85%', delay: '1.1s', duration: '2.6s', drift: '5px',   color: '#fbbf24' },
  { size: 3, left: '10%', delay: '1.8s', duration: '3.3s', drift: '10px',  color: '#f97316' },
  { size: 2, left: '42%', delay: '2.2s', duration: '2.9s', drift: '-14px', color: '#fcd34d' },
  { size: 4, left: '90%', delay: '0.5s', duration: '4.0s', drift: '-7px',  color: '#f59e0b' },
  { size: 2, left: '55%', delay: '1.9s', duration: '3.1s', drift: '9px',   color: '#fbbf24' },
];

function FlameLogo() {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <path
        d="M32 6 C32 6, 40 14, 40 22 C44 18, 44 13, 42 9 C47 13, 50 21, 47 29 C50 26, 52 21, 50 18 C54 22, 55 31, 51 38 C48 44, 41 48, 32 48 C23 48, 16 44, 13 38 C9 31, 10 22, 14 18 C12 21, 14 26, 17 29 C14 21, 17 13, 22 9 C20 13, 20 18, 24 22 C24 14, 32 6, 32 6Z"
        fill="#f59e0b"
      />
      <path
        d="M32 20 C32 20, 36 25, 36 30 C38 28, 38 25, 37 22 C40 25, 41 30, 39 35 C41 32, 42 29, 41 26 C43 29, 43 35, 40 39 C38 42, 35 43, 32 43 C29 43, 26 42, 24 39 C21 35, 21 29, 23 26 C22 29, 23 32, 25 35 C23 30, 24 25, 27 22 C26 25, 26 28, 28 30 C28 25, 32 20, 32 20Z"
        fill="#fef3c7"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useInventoryStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'El usuario es requerido';
    if (!form.password) errs.password = 'La contraseña es requerida';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = login(form.username, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('¡Bienvenido de vuelta!', { icon: '🔥' });
      navigate('/dashboard');
    } else {
      toast.error(result.error);
      setErrors({ password: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center relative overflow-hidden">

      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Floating sparks */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 pointer-events-none" style={{ height: '1px' }}>
        {SPARKS.map((s, i) => (
          <div
            key={i}
            className="spark-particle"
            style={{
              width: s.size,
              height: s.size,
              left: s.left,
              bottom: 0,
              background: s.color,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
              '--duration': s.duration,
              '--delay': s.delay,
              '--drift': s.drift,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 px-4"
      >
        {/* Card */}
        <div className="bg-card border border-card-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.06)' }}>

          {/* Top amber gradient bar */}
          <div className="h-[3px] bg-gradient-to-r from-amber-700 via-amber-400 to-orange-500" />

          <div className="px-8 py-9">

            {/* Logo + Title */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-4 relative"
              >
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-2xl blur-xl"
                  style={{ background: 'rgba(245,158,11,0.35)', transform: 'scale(1.2)' }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 40%, #f59e0b 100%)' }}>
                  <FlameLogo />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-center"
              >
                <h1 className="text-2xl font-extrabold tracking-tight"
                  style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Almacén Fénix
                </h1>
                <p className="text-xs text-slate-400 mt-1 tracking-widest uppercase font-medium">Sistema de Gestión</p>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-card-border" />
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Acceso</span>
              <div className="flex-1 h-px bg-card-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide">Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User size={14} className="text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ingresá tu usuario"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className={`w-full bg-input border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600
                      focus:outline-none focus:ring-2 transition-all duration-150
                      ${errors.username
                        ? 'border-red-500/60 focus:ring-red-500/30'
                        : 'border-input-border focus:ring-amber-500/40 focus:border-amber-500/60'
                      }`}
                  />
                </div>
                {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock size={14} className="text-slate-500" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Ingresá tu contraseña"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full bg-input border rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600
                      focus:outline-none focus:ring-2 transition-all duration-150
                      ${errors.password
                        ? 'border-red-500/60 focus:ring-red-500/30'
                        : 'border-input-border focus:ring-amber-500/40 focus:border-amber-500/60'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-2 flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-xl
                  shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>Ingresar al sistema <ArrowRight size={16} /></>
                )}
              </motion.button>
            </form>

            {/* Demo hint */}
            <div className="mt-5 p-3 rounded-xl border" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.15)' }}>
              <p className="text-xs text-slate-400 text-center">
                <span className="text-amber-400/80 font-semibold">Demo:</span>{' '}
                usuario <code className="text-amber-300 px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'rgba(245,158,11,0.12)' }}>admin</code>
                {' '}· contraseña{' '}
                <code className="text-amber-300 px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'rgba(245,158,11,0.12)' }}>admin123</code>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-5">
          © {new Date().getFullYear()} Almacén Fénix · Sistema de Gestión de Inventario
        </p>
      </motion.div>
    </div>
  );
}
