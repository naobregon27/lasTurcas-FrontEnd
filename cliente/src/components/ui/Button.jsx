import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'text-white font-semibold border-transparent shadow-lg active:scale-95',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-500/50',
  danger:  'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 border-red-500/50',
  warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 border-amber-500/50',
  ghost:   'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10',
  outline: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border-slate-600 hover:border-slate-400',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const isPrimary = variant === 'primary';

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border
        transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      style={isPrimary ? {
        background: 'linear-gradient(135deg, #b45309, #d97706, #f59e0b)',
        boxShadow: '0 4px 14px rgba(245,158,11,0.25)',
      } : undefined}
      onMouseEnter={isPrimary ? (e) => { e.currentTarget.style.filter = 'brightness(1.1)'; } : undefined}
      onMouseLeave={isPrimary ? (e) => { e.currentTarget.style.filter = 'brightness(1)'; } : undefined}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon && <Icon size={14} />}
      {children}
    </button>
  );
}
