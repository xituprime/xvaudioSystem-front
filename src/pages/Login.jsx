import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/dashboard' : '/products', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, headers } = await api.post('/auth/login', { email, password });
      // Aceptar varias formas de respuesta del backend (body o header Authorization)
      const token =
        data?.token ??
        data?.accessToken ??
        (typeof headers?.authorization === 'string' && headers.authorization.replace(/^Bearer\s+/i, '').trim());
      const userData = data?.user ?? data?.data?.user ?? data?.data;
      if (!token || !userData) {
        toast.error(data?.message || 'Respuesta inválida del servidor');
        return;
      }
      if (data?.success === false) {
        toast.error(data?.message || 'Error al iniciar sesión');
        return;
      }
      login(token, typeof userData === 'object' ? userData : { email: userData, role: 'client' });
      const role = userData?.role ?? userData?.roleName;
      const redirect = role === 'admin' ? '/dashboard' : '/products';
      toast.success('Bienvenido');
      setLoading(false);
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED' && 'El servidor no respondió a tiempo.') ||
        (err.message?.includes('Network') && 'No se pudo conectar. ¿Backend en http://127.0.0.1:5000?') ||
        'Error de conexión';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-400">XV Audio</h1>
          <p className="text-dark-400 mt-1">Iniciar sesión</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-dark-900 border border-dark-700 rounded-xl p-8 shadow-xl"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="mt-6 text-center text-sm text-dark-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
