import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { quoteAcceptPath, quoteByIdPath, quoteRejectPath } from '../config/apiPaths';
import { unwrapEntity } from '../utils/apiData';
import { getQuoteClientRequestMessage, getQuoteOfferMessage } from '../utils/quotes';
import { QUOTE_STATUS_LABEL } from '../constants/quoteStatus';

export default function QuoteDetailClient() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await api.get(quoteByIdPath(id));
    if (data?.success === false) {
      toast.error(data?.message || 'No encontrada');
      setQuote(null);
      return;
    }
    const q = unwrapEntity(data, 'quote', 'data') ?? data;
    setQuote(q);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) {
          toast.error(err.response?.data?.message || 'No se pudo cargar');
          setQuote(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const handleAccept = async () => {
    setActing(true);
    try {
      try {
        await api.post(quoteAcceptPath(id));
      } catch (e) {
        if (e.response?.status === 404) {
          await api.patch(quoteByIdPath(id), { status: 'accepted' });
        } else {
          throw e;
        }
      }
      toast.success('Aceptaste la propuesta. Te contactaremos para concretar la compra.');
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo registrar tu aceptación');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('¿Seguro que quieres rechazar esta propuesta?')) return;
    setActing(true);
    try {
      try {
        await api.post(quoteRejectPath(id));
      } catch (e) {
        if (e.response?.status === 404) {
          await api.patch(quoteByIdPath(id), { status: 'rejected' });
        } else {
          throw e;
        }
      }
      toast.success('Propuesta rechazada.');
      await refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo registrar el rechazo');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-safe text-center py-16">
        <p className="text-dark-400">Cotización no disponible.</p>
        <Link to="/my-quotes" className="inline-block mt-4 text-primary-400">
          Volver al listado
        </Link>
      </div>
    );
  }

  const status = quote.status || quote.estado || 'pending';
  const myRequestText = getQuoteClientRequestMessage(quote);
  const items =
    quote.items ||
    quote.quoteItems ||
    quote.lineItems ||
    quote.lines ||
    [];

  const offerText = getQuoteOfferMessage(quote);
  const awaitingOffer = status === 'offered';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-12 pt-safe">
      <Link to="/my-quotes" className="text-sm text-primary-400 hover:text-primary-300 mb-6 inline-block">
        ← Mis cotizaciones
      </Link>
      <div className="bg-dark-900/80 border border-dark-700 rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap justify-between gap-2">
          <h1 className="text-xl font-bold text-dark-50">Cotización #{quote.id ?? quote._id ?? id}</h1>
          <span className="text-sm font-semibold text-primary-400">
            {QUOTE_STATUS_LABEL[status] || status}
          </span>
        </div>
        <p className="text-dark-500 text-sm mt-2">
          {new Date(quote.createdAt || quote.created_at || Date.now()).toLocaleString()}
        </p>
        {myRequestText && (
          <p className="mt-4 text-dark-300 text-sm border-l-2 border-dark-600 pl-3">
            <span className="text-dark-500 text-xs uppercase block mb-1">Tu mensaje</span>
            {myRequestText}
          </p>
        )}

        {awaitingOffer && !offerText && (
          <p className="mt-4 text-amber-200/90 text-sm bg-amber-500/10 border border-amber-500/25 rounded-lg p-3">
            El equipo está preparando los detalles de tu propuesta. Vuelve a revisar pronto.
          </p>
        )}

        {awaitingOffer && offerText && (
          <div className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
            <p className="text-xs font-semibold text-primary-300 uppercase tracking-wide">Propuesta de XV Audio</p>
            <p className="text-dark-100 mt-2 text-sm whitespace-pre-wrap">{offerText}</p>
          </div>
        )}

        {awaitingOffer && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={acting}
              onClick={handleAccept}
              className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {acting ? 'Enviando…' : 'Aceptar propuesta'}
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={handleReject}
              className="flex-1 py-3 px-4 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-200 font-medium rounded-lg transition disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>
        )}

        <ul className="mt-6 space-y-3 border-t border-dark-700 pt-4">
          {items.map((line, idx) => {
            const name =
              line.productName ||
              line.name ||
              line.product?.name ||
              `Producto ${idx + 1}`;
            const qty = line.quantity ?? line.qty ?? 1;
            const price = Number(line.unitPrice ?? line.price ?? line.publicPrice ?? 0);
            return (
              <li key={idx} className="flex justify-between gap-4 text-sm">
                <span className="text-dark-200">
                  {name} × {qty}
                </span>
                <span className="text-dark-400 shrink-0">Q{(price * qty).toLocaleString()}</span>
              </li>
            );
          })}
        </ul>
        {quote.total != null && (
          <p className="mt-4 text-right text-lg font-bold text-primary-400">
            Total: Q{Number(quote.total).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
