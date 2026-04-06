import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPrimaryImageUrl } from '../utils/productImages';

export default function ProductCard({ product, isAdmin, onDelete }) {
  const imageUrl = getPrimaryImageUrl(product);
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !imageUrl || imageFailed;
  const id = product?.id ?? product?._id;

  return (
    <div className="group bg-dark-900/80 border border-dark-700/80 rounded-2xl overflow-hidden shadow-lg hover:border-primary-500/30 hover:shadow-primary-900/10 hover:shadow-2xl transition-all duration-300">
      <div className="h-32 sm:h-36 md:h-44 lg:h-48 xl:h-52 w-full shrink-0 bg-dark-800 flex items-center justify-center overflow-hidden relative">
        {imageUrl && !imageFailed && (
          <img
            src={imageUrl}
            alt={product?.name ?? 'Producto'}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        {showPlaceholder && (
          <span className="text-4xl sm:text-5xl text-dark-500" aria-hidden>📦</span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-xs font-medium text-primary-400 uppercase tracking-wide">
          {product?.category || 'Sin categoría'}
        </p>
        <h3 className="mt-1 font-semibold text-dark-100 truncate">{product?.name ?? ''}</h3>
        <p className="mt-2 text-lg font-bold text-primary-400">
          Q{Number(product?.publicPrice ?? 0).toLocaleString()}
        </p>
        <p className="text-sm text-dark-400">Stock: {product?.stock ?? 0}</p>
        {isAdmin && (
          <>
            <p className="text-sm text-dark-500">Compra: Q{Number(product?.purchasePrice ?? 0).toLocaleString()}</p>
            <div className="mt-4 flex gap-2">
              <Link
                to={`/products/edit/${id}`}
                className="flex-1 text-center py-2 px-3 bg-primary-600/20 text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-600/30 transition"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => onDelete?.(product)}
                className="flex-1 py-2 px-3 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition"
              >
                Eliminar
              </button>
            </div>
          </>
        )}
        {!isAdmin && (
          <Link
            to={`/products/${id}`}
            className="mt-4 block text-center py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition"
          >
            Ver detalle
          </Link>
        )}
      </div>
    </div>
  );
}
