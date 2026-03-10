import { useState } from 'react';
import { Link } from 'react-router-dom';

// Aceptar image, imageUrl, secure_url (Cloudinary) o ruta relativa
function imageUrlFrom(product) {
  const raw = product?.image ?? product?.imageUrl ?? product?.secure_url;
  if (!raw || typeof raw !== 'string') return null;
  const url = raw.trim();
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

export default function ProductCard({ product, isAdmin, onDelete }) {
  const imageUrl = imageUrlFrom(product);
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !imageUrl || imageFailed;
  const id = product?.id ?? product?._id;

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden shadow-lg hover:border-dark-600 transition-colors">
      <div className="aspect-square bg-dark-800 flex items-center justify-center overflow-hidden relative">
        {imageUrl && !imageFailed && (
          <img
            src={imageUrl}
            alt={product?.name ?? 'Producto'}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        {showPlaceholder && (
          <span className="text-5xl text-dark-500" aria-hidden>📦</span>
        )}
      </div>
      <div className="p-4">
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
