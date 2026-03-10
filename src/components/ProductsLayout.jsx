import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';

export default function ProductsLayout() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminLayout /> : <PublicLayout />;
}
