import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, VCT, TierBadge } from '../components/ui.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/market', label: '⚓ Market' },
    { path: '/requests', label: '📥 Requests' },
    { path: '/sessions', label: '📚 Sessions' },
    { path: '/wallet', label: '🪙 Wallet' },
    { path: '/profile', label: '🏴‍☠️ Profile' },
    { path: '/dashboard', label: '🌊 Fleet Admin' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-abyss text-text-primary selection:bg-gold selection:text-text-on-gold flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-line sticky top-0 z-50 bg-abyss/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          
          <NavLink to="/market" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">⛵</span>
            <span className="font-display text-xl sm:text-2xl text-gold group-hover:text-gold-bright transition-colors tracking-tight">
              Grand Line Exchange
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-deep/60 p-1 rounded-xl border border-line/40">
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'bg-hull-raised text-gold shadow-sm ring-1 ring-gold/30' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-hull/50'
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action / Wallet Info */}
          {user && (
            <div className="flex items-center gap-3">
              <NavLink to="/wallet" className="flex items-center gap-2 bg-deep/80 hover:bg-deep border border-line px-3 py-1.5 rounded-xl transition-all hover:border-gold/40">
                <VCT amount={user.balance} className="text-sm font-mono font-bold" />
                <TierBadge tier={user.tier} />
              </NavLink>

              <NavLink to="/profile" className="w-9 h-9 rounded-full bg-deep flex items-center justify-center text-sm font-bold border border-line text-gold hover:border-gold transition-colors">
                {user.avatar || user.name[0]}
              </NavLink>

              <Button variant="ghost" onClick={logout} className="hidden sm:inline-flex text-xs px-3 h-8">
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-line/40 bg-deep/30 py-6 text-center text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            🏴‍☠️ Grand Line Skill Exchange • Peer-to-Peer Dynamic Economy
          </div>
          <div className="flex gap-4">
            <NavLink to="/market" className="hover:text-gold transition-colors">Market</NavLink>
            <NavLink to="/dashboard" className="hover:text-gold transition-colors">Admin Dashboard</NavLink>
            <NavLink to="/wallet" className="hover:text-gold transition-colors">Treasure Chest</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}