import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-dvh bg-dark-950">
      <button
        type="button"
        className="fixed z-50 md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-dark-800 border border-dark-600 text-dark-100 shadow-lg top-[max(0.75rem,env(safe-area-inset-top))] left-3 active:scale-95 transition-transform"
        onClick={() => setMenuOpen(true)}
        aria-label="Abrir menú"
      >
        ☰
      </button>
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-dark-950/70 backdrop-blur-sm md:hidden"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      )}
      <Sidebar menuOpen={menuOpen} onNavigate={closeMenu} />
      <main className="min-h-dvh pl-0 md:pl-64 pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[100vw] overflow-x-hidden pb-safe">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
