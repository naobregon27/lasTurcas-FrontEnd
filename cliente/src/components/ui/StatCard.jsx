import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
  phoenix: {
    icon: 'bg-amber-500/15 text-amber-400',
    glow: '',
    bar: 'from-amber-600 to-orange-500',
    glowStyle: '0 0 30px rgba(245,158,11,0.12)',
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-400',
    glow: '',
    bar: 'from-amber-600 to-orange-500',
    glowStyle: '0 0 30px rgba(245,158,11,0.12)',
  },
  indigo: {
    icon: 'bg-indigo-500/15 text-indigo-400',
    glow: '',
    bar: 'from-indigo-600 to-violet-600',
    glowStyle: '0 0 30px rgba(99,102,241,0.1)',
  },
  emerald: {
    icon: 'bg-emerald-500/15 text-emerald-400',
    glow: '',
    bar: 'from-emerald-600 to-teal-600',
    glowStyle: '0 0 30px rgba(16,185,129,0.1)',
  },
  red: {
    icon: 'bg-red-500/15 text-red-400',
    glow: '',
    bar: 'from-red-600 to-rose-600',
    glowStyle: '0 0 30px rgba(239,68,68,0.1)',
  },
  violet: {
    icon: 'bg-violet-500/15 text-violet-400',
    glow: '',
    bar: 'from-violet-600 to-purple-600',
    glowStyle: '0 0 30px rgba(139,92,246,0.1)',
  },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'phoenix', trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.phoenix;

  return (
    <div
      className="bg-card border border-card-border rounded-2xl p-4 sm:p-5 relative overflow-hidden phoenix-card-hover"
      style={{ boxShadow: `0 4px 24px rgba(0,0,0,0.3), ${c.glowStyle}` }}
    >
      {/* Gradient bar top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.bar} opacity-70`} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{title}</p>
          <p className="text-lg sm:text-2xl font-extrabold text-white mt-1.5 leading-tight break-words">{value}</p>
          {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend)}% vs ayer
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}
