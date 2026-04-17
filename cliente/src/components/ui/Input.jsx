export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon size={14} className="text-slate-500" />
          </div>
        )}
        <input
          className={`
            w-full bg-input border border-input-border rounded-lg px-3 py-2 text-sm text-white
            placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70
            transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : ''} ${error ? 'border-red-500/60 focus:ring-red-500/50' : ''} ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
      <select
        className={`
          w-full bg-input border border-input-border rounded-lg px-3 py-2 text-sm text-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70
          transition-all duration-150 disabled:opacity-50
          ${error ? 'border-red-500/60' : ''} ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
      <textarea
        rows={3}
        className={`
          w-full bg-input border border-input-border rounded-lg px-3 py-2 text-sm text-white
          placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70
          transition-all duration-150 resize-none
          ${error ? 'border-red-500/60' : ''} ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
