import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/products" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-400">XV Audio</span>
            <span className="text-dark-400 text-sm hidden sm:inline">Catálogo</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/products"
              className="text-dark-300 hover:text-primary-400 font-medium transition-colors"
            >
              Productos
            </Link>
            <span className="text-dark-500">|</span>
            <span className="text-sm text-dark-400 truncate max-w-[180px]">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Salir
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
