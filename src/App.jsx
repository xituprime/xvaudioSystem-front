import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import ProductsLayout from './components/ProductsLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import QuoteCart from './pages/QuoteCart';
import MyQuotes from './pages/MyQuotes';
import QuoteDetailClient from './pages/QuoteDetailClient';
import QuotesAdmin from './pages/QuotesAdmin';
import QuoteDetailAdmin from './pages/QuoteDetailAdmin';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import ProductDetail from './pages/ProductDetail';
import POS from './pages/POS';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/products'} replace />;
}

function App() {
  useEffect(() => {
    const onForbidden = () => toast.error('Acceso denegado');
    window.addEventListener('auth:forbidden', onForbidden);
    return () => window.removeEventListener('auth:forbidden', onForbidden);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<HomeRedirect />} />
        <Route path="dashboard" element={<RoleRoute allowedRoles="admin"><AdminLayout /></RoleRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="quotes" element={<QuotesAdmin />} />
          <Route path="quotes/:id" element={<QuoteDetailAdmin />} />
        </Route>
        <Route path="account" element={<ProductsLayout />}>
          <Route index element={<Account />} />
        </Route>
        <Route path="quote-cart" element={<ProductsLayout />}>
          <Route index element={<RoleRoute allowedRoles="client"><QuoteCart /></RoleRoute>} />
        </Route>
        <Route path="my-quotes" element={<ProductsLayout />}>
          <Route index element={<RoleRoute allowedRoles="client"><MyQuotes /></RoleRoute>} />
          <Route path=":id" element={<RoleRoute allowedRoles="client"><QuoteDetailClient /></RoleRoute>} />
        </Route>
        <Route path="products" element={<ProductsLayout />}>
          <Route index element={<Products />} />
          <Route path="new" element={<RoleRoute allowedRoles="admin"><ProductForm /></RoleRoute>} />
          <Route path="edit/:id" element={<RoleRoute allowedRoles="admin"><ProductForm /></RoleRoute>} />
          <Route path=":id" element={<ProductDetail />} />
        </Route>
        <Route path="pos" element={<RoleRoute allowedRoles="admin"><AdminLayout /></RoleRoute>}>
          <Route index element={<POS />} />
        </Route>
        <Route path="reports" element={<RoleRoute allowedRoles="admin"><AdminLayout /></RoleRoute>}>
          <Route index element={<Reports />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
