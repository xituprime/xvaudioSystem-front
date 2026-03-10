import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
