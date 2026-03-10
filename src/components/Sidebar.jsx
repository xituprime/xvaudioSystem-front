import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Productos', icon: '📦' },
  { to: '/pos', label: 'POS', icon: '🛒' },
  { to: '/reports', label: 'Reportes', icon: '📈' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
      <div className="p-6 border-b border-dark-700">
        <h1 className="text-xl font-bold text-primary-400">XV Audio</h1>
        <p className="text-xs text-dark-400 mt-1">Sistema de inventario y POS</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
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
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
