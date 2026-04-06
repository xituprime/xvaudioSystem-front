import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

export default function SessionExpiredModal() {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setEmail((prev) => prev || user?.email || '');
    setPassword('');
  }, [user?.email]);

  useEffect(() => {
    const onSessionExpired = () => handleOpen();
    window.addEventListener('auth:session-expired', onSessionExpired);
    return () => window.removeEventListener('auth:session-expired', onSessionExpired);
  }, [handleOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, headers } = await api.post('/auth/login', { email: email.trim(), password });
      const token =
        data?.token ??
        data?.accessToken ??
        (typeof headers?.authorization === 'string' && headers.authorization.replace(/^Bearer\s+/i, '').trim());
      const userData = data?.user ?? data?.data?.user ?? data?.data;
      if (!token || !userData) {
        toast.error(data?.message || 'Respuesta inválida');
        return;
      }
      if (data?.success === false) {
        toast.error(data?.message || 'No se pudo iniciar sesión');
        return;
      }
      login(token, typeof userData === 'object' ? userData : { email: userData, role: 'client' });
      setOpen(false);
      setPassword('');
      toast.success('Sesión restaurada');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    setOpen(false);
    logout();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-dark-600 bg-dark-900 shadow-2xl shadow-black/50 p-6 sm:p-8">
        <h2 id="session-expired-title" className="text-xl font-bold text-dark-50">
          Sesión expirada
        </h2>
        <p className="text-dark-400 text-sm mt-2 leading-relaxed">
          Tu sesión caducó o dejó de ser válida. Vuelve a iniciar sesión aquí para continuar en esta misma pantalla sin
          perder lo que estabas viendo.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Continuar'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleExit}
          className="w-full mt-3 py-2.5 text-sm text-dark-400 hover:text-dark-200 transition"
        >
          Cerrar sesión e ir al inicio de sesión
        </button>
      </div>
    </div>
  );
}
