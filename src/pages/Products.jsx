import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      // Aceptar varias formas de respuesta del backend
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.products)) list = data.products;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.data?.products)) list = data.data.products;
      else if (data?.data && Array.isArray(data.data)) list = data.data;
      setProducts(list);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      const { data } = await api.delete(`/products/${product._id}`);
      if (data?.success === false) {
        toast.error(data.message || 'Error al eliminar');
        return;
      }
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-dark-100">
          {isAdmin ? 'Productos' : 'Catálogo'}
        </h1>
        {isAdmin && (
          <Link
            to="/products/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition"
          >
            + Nuevo producto
          </Link>
        )}
      </div>
      {products.length === 0 ? (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-12 text-center text-dark-400">
          No hay productos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p, index) => (
            <ProductCard
              key={p?.id ?? p?._id ?? `product-${index}`}
              product={p}
              isAdmin={isAdmin}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
