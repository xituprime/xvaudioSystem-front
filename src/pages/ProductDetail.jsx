import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

function imageUrlFrom(product) {
  const raw = product?.image ?? product?.imageUrl ?? product?.secure_url;
  if (!raw || typeof raw !== 'string') return null;
  const url = raw.trim();
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        const p = data?.product ?? data?.data ?? data;
        setProduct(p || null);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!product) return null;

  const imageUrl = imageUrlFrom(product);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 aspect-square bg-dark-800 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={product?.name ?? 'Producto'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl text-dark-500">📦</span>
          )}
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <p className="text-sm font-medium text-primary-400 uppercase tracking-wide">
            {product.category || 'Sin categoría'}
          </p>
          <h1 className="text-2xl font-bold text-dark-100 mt-2">{product.name}</h1>
          {product.brand && (
            <p className="text-dark-400 mt-1">Marca: {product.brand}</p>
          )}
          {product.description && (
            <p className="text-dark-300 mt-4">{product.description}</p>
          )}
          <p className="mt-6 text-3xl font-bold text-primary-400">
            Q{Number(product.publicPrice).toLocaleString()}
          </p>
          <p className="text-dark-400">Stock disponible: {product.stock ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
