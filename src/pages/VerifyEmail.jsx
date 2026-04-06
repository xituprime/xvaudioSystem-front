import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const token = searchParams.get('token')?.trim();

  useEffect(() => {
    if (!token) {
      setStatus('missing');
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        try {
          await api.post('/auth/verify-email', { token });
        } catch (postErr) {
          try {
            await api.get('/auth/verify-email', { params: { token } });
          } catch {
            throw postErr;
          }
        }
        if (!cancelled) {
          setStatus('ok');
          toast.success('Correo verificado. Ya puedes iniciar sesión.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          toast.error(err.response?.data?.message || 'No se pudo verificar el enlace');
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-primary-400">XV Audio</h1>
        <div className="mt-8 bg-dark-900 border border-dark-700 rounded-xl p-8 shadow-xl">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent mx-auto" />
              <p className="mt-4 text-dark-300">Verificando tu correo…</p>
            </>
          )}
          {status === 'missing' && (
            <>
              <p className="text-dark-300">Falta el token en el enlace. Abre el link que te enviamos por correo.</p>
              <Link
                to="/login"
                className="mt-6 inline-block text-primary-400 hover:text-primary-300 font-medium"
              >
                Ir a iniciar sesión
              </Link>
            </>
          )}
          {status === 'ok' && (
            <>
              <p className="text-dark-200 font-medium">Tu cuenta está activa.</p>
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="mt-6 w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition"
              >
                Iniciar sesión
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-dark-300">El enlace puede haber expirado o ya fue usado.</p>
              <Link
                to="/login"
                className="mt-6 inline-block text-primary-400 hover:text-primary-300 font-medium"
              >
                Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
