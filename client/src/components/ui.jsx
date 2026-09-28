// Shared primitives — Button, Card, Badge, Modal, Spinner, VCT display

export function Button({ children, variant = 'primary', className = '', disabled, loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-abyss disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed';
  const variants = {
    primary:   'h-11 px-5 bg-gold text-text-on-gold hover:bg-gold-bright focus:ring-gold active:scale-[0.98] shadow-glow-gold',
    secondary: 'h-11 px-5 border border-line text-text-primary hover:bg-hull-raised focus:ring-line',
    danger:    'h-11 px-5 border border-crimson text-crimson hover:bg-crimson hover:text-white focus:ring-crimson',
    ghost:     'h-9 px-3 text-text-secondary hover:text-text-primary',
    compact:   'h-9 px-4 bg-gold text-text-on-gold hover:bg-gold-bright focus:ring-gold text-sm',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

export function Card({ children, className = '', hot }) {
  return (
    <div className={`bg-hull border rounded-md shadow-e1 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-glow-gold ${hot ? 'border-t-2 border-t-ember border-line' : 'border-line'} ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, color = 'text-text-secondary', className = '' }) {
  const colors = {
    gold: 'bg-gold/10 text-gold border-gold/30',
    ember: 'bg-ember/10 text-ember border-ember/30',
    tide: 'bg-tide/10 text-tide border-tide/30',
    foam: 'bg-foam/10 text-foam border-foam/30',
    crimson: 'bg-crimson/10 text-crimson border-crimson/30',
    muted: 'bg-line/30 text-text-muted border-line',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide ${colors[color] || color} ${className}`}>
      {children}
    </span>
  );
}

export function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-hull-raised border border-line rounded-lg shadow-e2 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-up">
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-line">
            <h2 className="font-display text-xl text-text-primary">{title}</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors" aria-label="Close">✕</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function VCT({ amount, className = '' }) {
  return (
    <span className={`font-mono font-bold text-gold inline-flex items-center gap-1 ${className}`}>
      <span>🃏</span>
      {Number(amount).toLocaleString()} VCT
    </span>
  );
}

export function TierBadge({ tier }) {
  const map = {
    Rookie:    { color: 'muted', icon: '💀' },
    Supernova: { color: 'tide',  icon: '⭐' },
    Warlord:   { color: 'gold',  icon: '👑' },
    Legend:    { color: 'ember', icon: '🔥' },
  };
  const { color, icon } = map[tier] || map.Rookie;
  return <Badge color={color}>{icon} {tier}</Badge>;
}

export function StatusChip({ status }) {
  const map = {
    PENDING:   { color: 'gold',   label: 'Awaiting Reply' },
    ACCEPTED:  { color: 'tide',   label: 'Accepted' },
    COMPLETED: { color: 'foam',   label: 'Completed' },
    REJECTED:  { color: 'crimson',label: 'Declined' },
    EXPIRED:   { color: 'muted',  label: 'Expired' },
    CANCELLED: { color: 'muted',  label: 'Cancelled' },
  };
  const { color, label } = map[status] || { color: 'muted', label: status };
  return <Badge color={color}>{label}</Badge>;
}

export function EmptyState({ icon = '🌊', title, description, action }) {
  return (
    <div className="text-center py-16 flex flex-col items-center gap-3">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-text-secondary font-medium">{title}</h3>
      {description && <p className="text-text-muted text-sm max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-12 flex flex-col items-center gap-3">
      <div className="text-crimson text-3xl">⚠️</div>
      <p className="text-crimson">{message || 'Rough seas. Something went wrong.'}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
