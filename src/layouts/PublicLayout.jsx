import { Link, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function EmailVerifyBanner() {
  const { user, isClient } = useAuth();
  const verified = user?.emailVerified ?? user?.email_verified;
  if (!isClient || verified !== false) return null;
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-100 text-sm text-center px-3 py-2">
      <span>Verifica tu correo para usar todas las funciones. </span>
      <Link to="/account" className="font-semibold text-amber-300 underline hover:text-amber-200">
        Ir a mi cuenta
      </Link>
    </div>
  );
}

export default function PublicLayout() {
  return (
    <div className="min-h-dvh bg-dark-950">
      <EmailVerifyBanner />
      <Navbar />
      <main className="max-w-[100vw] overflow-x-hidden pb-safe">
        <Outlet />
      </main>
    </div>
  );
}
