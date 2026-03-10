import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const home = user?.role === 'admin' ? '/dashboard' : '/products';

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-dark-600">404</h1>
        <p className="mt-4 text-xl text-dark-300">Página no encontrada</p>
        <Link
          to={home}
          className="mt-8 inline-block px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
