import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { quotesMinePath } from '../config/apiPaths';
import { unwrapList } from '../utils/apiData';
import { QUOTE_STATUS_LABEL } from '../constants/quoteStatus';

function quoteId(q) {
  return q?.id ?? q?._id;
}

export default function MyQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiMissing, setApiMissing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(quotesMinePath());
        if (data?.success === false) {
          toast.error(data?.message || 'Error al cargar');
          setQuotes([]);
          return;
        }
        setApiMissing(false);
        setQuotes(unwrapList(data, ['quotes', 'data', 'items']));
      } catch (err) {
        if (err.response?.status === 404) {
          setApiMissing(true);
          setQuotes([]);
        } else {
          toast.error(err.response?.data?.message || 'Error al cargar cotizaciones');
          setQuotes([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-12 pt-safe">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Mis cotizaciones</h1>
          <p className="text-dark-500 text-sm mt-1">Estado de tus solicitudes</p>
        </div>
        <Link
          to="/quote-cart"
          className="inline-flex justify-center px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-dark-200 text-sm font-medium transition"
        >
          Nueva cotización
        </Link>
      </div>

      {apiMissing ? (
        <div className="text-dark-300 text-center py-14 px-4 bg-dark-900/50 border border-amber-600/30 rounded-xl text-sm space-y-3">
          <p className="font-medium text-amber-200">El servidor respondió 404 en la API de cotizaciones.</p>
          <p className="text-dark-400 max-w-lg mx-auto">
            El backend debe registrar rutas como <span className="font-mono text-dark-200">GET /api/quotes/mine</span>.
            Si usas otra base (ej. <span className="font-mono">/cotizaciones</span>), en <span className="font-mono">.env</span>{' '}
            define <span className="font-mono">VITE_API_QUOTES_BASE=/cotizaciones</span> y reinicia Vite.
          </p>
        </div>
      ) : quotes.length === 0 ? (
        <p className="text-dark-400 text-center py-16 bg-dark-900/50 border border-dark-700 rounded-xl">
          Aún no has enviado cotizaciones.{' '}
          <Link to="/products" className="text-primary-400 hover:text-primary-300">
            Explorar catálogo
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => {
            const id = quoteId(q);
            const status = q.status || q.estado || 'pending';
            return (
              <li key={id}>
                <Link
                  to={`/my-quotes/${id}`}
                  className="block bg-dark-900/80 border border-dark-700 hover:border-primary-500/40 rounded-xl p-4 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-dark-500">#{id}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary-400">
                      {QUOTE_STATUS_LABEL[status] || status}
                    </span>
                  </div>
                  <p className="text-dark-200 mt-2 text-sm">
                    {new Date(q.createdAt || q.created_at || Date.now()).toLocaleString()}
                  </p>
                  {q.total != null && (
                    <p className="text-primary-400 font-semibold mt-1">
                      Total: Q{Number(q.total).toLocaleString()}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
