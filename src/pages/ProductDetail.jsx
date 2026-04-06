import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { getProductImageUrls } from '../utils/productImages';
import { useAuth } from '../context/AuthContext';
import { useQuoteCart } from '../context/QuoteCartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { addItem } = useQuoteCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        const p = data?.product ?? data?.data ?? data;
        setProduct(p || null);
        setActive(0);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const images = product ? getProductImageUrls(product) : [];
  const goPrev = useCallback(() => {
    setActive((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);
  const goNext = useCallback(() => {
    setActive((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12 pt-safe">
      <div className="rounded-2xl overflow-hidden border border-dark-700/80 bg-gradient-to-b from-dark-900 to-dark-950 shadow-2xl lg:grid lg:grid-cols-12 lg:items-start">
        <div className="relative h-[min(36dvh,220px)] sm:h-[min(40dvh,260px)] md:h-[min(44dvh,280px)] lg:col-span-5 lg:h-[min(220px,32vh)] lg:max-h-[280px] xl:max-h-[300px] lg:min-h-[200px] bg-dark-800/90 group flex items-center justify-center p-3 sm:p-4 lg:border-r lg:border-dark-700/60">
          {images.length > 0 ? (
            <>
              <img
                src={images[active]}
                alt={product?.name ?? 'Producto'}
                className="w-full h-full object-contain bg-dark-900/50"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-dark-950/80 border border-dark-600 text-dark-100 hover:bg-primary-600/90 hover:border-primary-500 transition flex items-center justify-center text-lg"
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-dark-950/80 border border-dark-600 text-dark-100 hover:bg-primary-600/90 hover:border-primary-500 transition flex items-center justify-center text-lg"
                    aria-label="Imagen siguiente"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActive(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === active ? 'w-8 bg-primary-400' : 'w-2 bg-dark-500 hover:bg-dark-400'
                        }`}
                        aria-label={`Ver imagen ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl sm:text-7xl md:text-8xl text-dark-600">📦</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 md:p-8 lg:col-span-7 lg:border-t-0 border-t border-dark-700/60 lg:py-8 lg:px-8 xl:px-10">
          <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest">
            {product.category || 'Sin categoría'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-50 mt-2">{product.name}</h1>
          {product.brand && (
            <p className="text-dark-400 mt-2 text-sm">Marca: <span className="text-dark-200">{product.brand}</span></p>
          )}
          {product.description && (
            <p className="text-dark-300 mt-5 leading-relaxed max-w-2xl">{product.description}</p>
          )}
          <div className="mt-8 flex flex-wrap items-baseline gap-4">
            <p className="text-3xl md:text-4xl font-bold text-primary-400">
              Q{Number(product.publicPrice).toLocaleString()}
            </p>
            <span className="text-sm text-dark-500">Stock: {product.stock ?? 0} unidades</span>
          </div>
          {!isAdmin && (
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-dark-400">
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                  className="w-20 px-2 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 text-center"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  addItem(product, qty);
                  toast.success('Añadido a cotización');
                }}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition"
              >
                Añadir a cotización
              </button>
              <Link
                to="/quote-cart"
                className="inline-flex items-center justify-center px-6 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-200 font-medium rounded-lg transition text-sm"
              >
                Ver cotización
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
