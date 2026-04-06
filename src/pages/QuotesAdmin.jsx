import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { quotesBase } from '../config/apiPaths';
import { unwrapList } from '../utils/apiData';
import { QUOTE_STATUS_LABEL } from '../constants/quoteStatus';

function quoteId(q) {
  return q?.id ?? q?._id;
}

function contactEmail(q) {
  return q.contactEmail || q.userEmail || q.email || q.user?.email || '—';
}

function contactName(q) {
  return q.contactName || q.userName || q.name || q.user?.name || '';
}

export default function QuotesAdmin() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [apiMissing, setApiMissing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const params = filter ? { status: filter } : undefined;
        const { data } = await api.get(quotesBase(), { params });
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
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Cotizaciones</h1>
          <p className="text-dark-400 text-sm mt-1">Contacta al cliente y actualiza el estado</p>
        </div>
        <div>
          <label className="sr-only" htmlFor="quote-filter">
            Filtrar por estado
          </label>
          <select
            id="quote-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="contacted">En contacto</option>
            <option value="offered">Propuesta enviada</option>
            <option value="accepted">Aceptada por el cliente</option>
            <option value="rejected">Rechazada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      {apiMissing ? (
        <div className="text-dark-300 py-12 px-4 text-center border border-amber-600/30 rounded-xl bg-dark-900/50 text-sm space-y-2">
          <p className="font-medium text-amber-200">404 en {quotesBase()} — el backend no expone esta ruta.</p>
          <p className="text-dark-500 max-w-xl mx-auto">
            Implementa <span className="font-mono text-dark-300">GET /api/quotes</span> o ajusta{' '}
            <span className="font-mono">VITE_API_QUOTES_BASE</span> en <span className="font-mono">.env</span>.
          </p>
        </div>
      ) : quotes.length === 0 ? (
        <p className="text-dark-500 py-12 text-center border border-dark-700 rounded-xl bg-dark-900/50">
          No hay cotizaciones.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-dark-700 bg-dark-900/50">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-dark-700 text-dark-400">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const id = quoteId(q);
                const status = q.status || q.estado || 'pending';
                return (
                  <tr key={id} className="border-b border-dark-800 hover:bg-dark-800/40">
                    <td className="p-4 font-mono text-dark-500">#{id}</td>
                    <td className="p-4">
                      <p className="text-dark-100 font-medium">{contactEmail(q)}</p>
                      {contactName(q) && <p className="text-dark-500 text-xs mt-0.5">{contactName(q)}</p>}
                    </td>
                    <td className="p-4 text-dark-400">
                      {new Date(q.createdAt || q.created_at || Date.now()).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="text-primary-400 font-medium">{QUOTE_STATUS_LABEL[status] || status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/dashboard/quotes/${id}`}
                        className="text-primary-400 hover:text-primary-300 font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
