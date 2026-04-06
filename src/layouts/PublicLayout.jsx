import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-dvh bg-dark-950">
      <Navbar />
      <main className="max-w-[100vw] overflow-x-hidden pb-safe">
        <Outlet />
      </main>
    </div>
  );
}
