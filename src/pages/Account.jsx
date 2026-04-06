import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { fetchUserMe, patchUserMe, patchUserPassword } from '../api/userProfileApi';
import { unwrapEntity } from '../utils/apiData';

function pickVerified(profile) {
  if (profile?.emailVerified === true || profile?.email_verified === true) return true;
  if (profile?.emailVerified === false || profile?.email_verified === false) return false;
  return null;
}

export default function Account() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [profileApiMissing, setProfileApiMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await fetchUserMe();
        const profile = unwrapEntity(data, 'user', 'profile') ?? data;
        if (cancelled) return;
        setProfileApiMissing(false);
        setName(profile.name ?? user?.name ?? '');
        setEmail(profile.email ?? user?.email ?? '');
        setPhone(profile.phone ?? profile.telefono ?? '');
        setAddress(profile.address ?? profile.direccion ?? '');
        const v = pickVerified(profile);
        setEmailVerified(v);
        if (v != null) {
          updateUser({
            emailVerified: v,
            email_verified: v,
          });
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setProfileApiMissing(true);
          } else {
            toast.error(err.response?.data?.message || 'No se pudo cargar tu perfil');
          }
          setName(user?.name ?? '');
          setEmail(user?.email ?? '');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [updateUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await patchUserMe({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      if (data?.success === false) {
        toast.error(data?.message || 'Error al guardar');
        return;
      }
      const profile = unwrapEntity(data, 'user', 'profile') ?? data;
      updateUser({
        name: profile.name ?? name.trim(),
        email: profile.email ?? email,
      });
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Completa contraseña actual y nueva');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      const { data } = await patchUserPassword({
        currentPassword,
        newPassword,
      });
      if (data?.success === false) {
        toast.error(data?.message || 'No se pudo cambiar la contraseña');
        return;
      }
      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('El servidor no expone cambio de contraseña en esta ruta');
      } else {
        toast.error(err.response?.data?.message || 'No se pudo cambiar la contraseña');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { data } = await api.post('/auth/resend-verification', { email: email.trim() });
      if (data?.success === false) {
        toast.error(data?.message || 'No se pudo reenviar');
        return;
      }
      toast.success(data?.message || 'Revisa tu bandeja de entrada');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo reenviar');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 pb-12 pt-safe">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-50">Mi cuenta</h1>
        <p className="text-dark-500 text-sm mt-1">Datos de contacto y seguridad</p>
      </div>

      {profileApiMissing && (
        <div className="mb-6 p-4 rounded-xl border border-amber-600/40 bg-amber-500/10 text-amber-100 text-sm">
          <p className="font-medium">No se encontró la API de perfil en el servidor (404).</p>
          <p className="mt-2 text-amber-200/85">
            El backend debe exponer algo como <span className="font-mono text-amber-50">GET/PATCH /api/users/me</span>.
            Si tu ruta es otra, crea en la raíz del proyecto un archivo <span className="font-mono">.env</span> con{' '}
            <span className="font-mono">VITE_API_USER_ME=/tu/ruta</span> y reinicia{' '}
            <span className="font-mono">npm run dev</span>.
          </p>
        </div>
      )}

      {emailVerified === false && (
        <div className="mb-6 p-4 rounded-xl border border-amber-600/40 bg-amber-500/10 text-amber-100 text-sm">
          <p className="font-medium">Tu correo aún no está verificado.</p>
          <p className="mt-1 text-amber-200/90">Revisa tu email o solicita un nuevo enlace.</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="mt-3 text-sm font-semibold text-amber-300 hover:text-amber-200 underline disabled:opacity-50"
          >
            {resendLoading ? 'Enviando…' : 'Reenviar correo de verificación'}
          </button>
        </div>
      )}

      <form
        onSubmit={handleSaveProfile}
        className="bg-dark-900/80 border border-dark-700 rounded-xl p-6 space-y-5 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-dark-200">Perfil</h2>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Correo</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-lg text-dark-400 cursor-not-allowed"
          />
          {emailVerified === true && (
            <p className="text-xs text-emerald-400 mt-1">Correo verificado</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Dirección</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none resize-y"
            placeholder="Opcional"
          />
        </div>
        <button
          type="submit"
          disabled={saving || profileApiMissing}
          className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <form
        onSubmit={handlePassword}
        className="mt-8 bg-dark-900/80 border border-dark-700 rounded-xl p-6 space-y-5 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-dark-200">Cambiar contraseña</h2>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Contraseña actual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving || profileApiMissing}
          className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-100 font-semibold rounded-lg transition disabled:opacity-50"
        >
          Actualizar contraseña
        </button>
      </form>

      <p className="mt-8 text-center">
        <Link to="/products" className="text-sm text-primary-400 hover:text-primary-300">
          Volver al catálogo
        </Link>
      </p>
    </div>
  );
}
