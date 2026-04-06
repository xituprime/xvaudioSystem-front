import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur border-b border-dark-700 pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-2 min-h-14 py-2 sm:h-16 sm:py-0">
          <Link to="/products" className="flex items-center gap-2 shrink-0 min-w-0">
            <span className="text-lg sm:text-xl font-bold text-primary-400">XV Audio</span>
            <span className="text-dark-400 text-xs sm:text-sm hidden sm:inline">Catálogo</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm sm:text-base max-w-full">
            <Link
              to="/products"
              className="text-dark-300 hover:text-primary-400 font-medium transition-colors shrink-0"
            >
              Productos
            </Link>
            <span className="text-dark-500 hidden sm:inline">|</span>
            <span className="text-xs sm:text-sm text-dark-400 truncate max-w-[min(140px,40vw)] sm:max-w-[180px]">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-medium transition-colors shrink-0"
            >
              Salir
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
