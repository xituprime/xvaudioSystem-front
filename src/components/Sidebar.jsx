import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/dashboard/quotes', label: 'Cotizaciones', icon: '📋' },
  { to: '/account', label: 'Mi cuenta', icon: '👤' },
  { to: '/products', label: 'Productos', icon: '📦' },
  { to: '/pos', label: 'POS', icon: '🛒' },
  { to: '/reports', label: 'Reportes', icon: '📈' },
];

export default function Sidebar({ onNavigate, menuOpen = false }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-[100dvh] w-64 max-w-[min(16rem,88vw)] bg-dark-900 border-r border-dark-700 flex flex-col transition-transform duration-200 ease-out md:translate-x-0 pt-safe ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 sm:p-6 border-b border-dark-700 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-primary-400">XV Audio</h1>
          <p className="text-xs text-dark-400 mt-1">Sistema de inventario y POS</p>
        </div>
        <button
          type="button"
          className="md:hidden shrink-0 w-10 h-10 rounded-lg border border-dark-600 text-dark-300 hover:bg-dark-800 text-lg leading-none"
          onClick={() => onNavigate?.()}
          aria-label="Cerrar menú"
        >
          ×
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border-l-2 border-primary-500'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-700">
        <p className="text-xs text-dark-400 px-4 mb-2 truncate">{user?.email}</p>
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
