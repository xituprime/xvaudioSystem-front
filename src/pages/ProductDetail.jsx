import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { getProductImageUrls } from '../utils/productImages';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

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
      <div className="rounded-2xl overflow-hidden border border-dark-700/80 bg-gradient-to-b from-dark-900 to-dark-950 shadow-2xl">
        <div className="relative h-[min(36dvh,220px)] sm:h-[min(40dvh,260px)] md:h-[min(48dvh,320px)] lg:h-auto lg:aspect-[16/10] lg:min-h-[260px] bg-dark-800 group">
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

        <div className="p-4 sm:p-6 md:p-10 border-t border-dark-700/60">
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
        </div>
      </div>
    </div>
  );
}
