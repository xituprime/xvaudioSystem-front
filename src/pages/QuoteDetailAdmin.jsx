import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { quoteByIdPath } from '../config/apiPaths';
import { unwrapEntity } from '../utils/apiData';
import { getQuoteClientRequestMessage, getQuoteOfferMessage } from '../utils/quotes';
import { QUOTE_ADMIN_STATUS_ORDER } from '../constants/quoteStatus';

export default function QuoteDetailAdmin() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(quoteByIdPath(id));
        if (cancelled) return;
        if (data?.success === false) {
          toast.error(data?.message || 'No encontrada');
          setQuote(null);
          return;
        }
        const q = unwrapEntity(data, 'quote', 'data') ?? data;
        setQuote(q);
        setStatus(q.status || q.estado || 'pending');
        setAdminNotes(q.adminNotes || q.admin_notes || q.notes || '');
        setOfferMessage(getQuoteOfferMessage(q) || '');
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
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const trimmedOffer = offerMessage.trim();
      const { data } = await api.patch(quoteByIdPath(id), {
        status,
        adminNotes: adminNotes.trim() || undefined,
        offerMessage: trimmedOffer || undefined,
        offer_message: trimmedOffer || undefined,
      });
      if (data?.success === false) {
        toast.error(data?.message || 'Error al guardar');
        return;
      }
      const q = unwrapEntity(data, 'quote', 'data') ?? data;
      if (q && typeof q === 'object') setQuote((prev) => ({ ...prev, ...q }));
      toast.success('Cotización actualizada');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400">Cotización no encontrada.</p>
        <Link to="/dashboard/quotes" className="inline-block mt-4 text-primary-400">
          Volver al listado
        </Link>
      </div>
    );
  }

  const items =
    quote.items ||
    quote.quoteItems ||
    quote.lineItems ||
    quote.lines ||
    [];

  const email =
    quote.contactEmail || quote.userEmail || quote.email || quote.user?.email || '—';
  const name = quote.contactName || quote.userName || quote.name || quote.user?.name || '';
  const phone = quote.contactPhone || quote.phone || quote.user?.phone || quote.user?.telefono;

  const clientRequestText = getQuoteClientRequestMessage(quote);

  const currentStatus = quote.status || quote.estado || 'pending';
  const canOpenPos = currentStatus === 'accepted';

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/dashboard/quotes" className="text-sm text-primary-400 hover:text-primary-300 inline-block">
        ← Cotizaciones
      </Link>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <h1 className="text-xl font-bold text-dark-100">Cotización #{quote.id ?? quote._id ?? id}</h1>
        <p className="text-dark-500 text-sm mt-1">
          {new Date(quote.createdAt || quote.created_at || Date.now()).toLocaleString()}
        </p>

        <div className="mt-6 p-4 rounded-lg bg-dark-800/80 border border-dark-600 space-y-2">
          <p className="text-sm text-dark-400">Contacto</p>
          <p className="text-dark-100 font-medium">
            <a href={`mailto:${email}`} className="text-primary-400 hover:underline">
              {email}
            </a>
          </p>
          {name && <p className="text-dark-300 text-sm">{name}</p>}
          {phone && (
            <p className="text-dark-300 text-sm">
              <a href={`tel:${phone}`} className="text-primary-400 hover:underline">
                {phone}
              </a>
            </p>
          )}
        </div>

        <div className="mt-5 p-4 rounded-xl border border-dark-600 bg-dark-800/50">
          <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide">Petición del cliente</p>
          {clientRequestText ? (
            <p className="text-dark-100 mt-2 text-sm whitespace-pre-wrap leading-relaxed">{clientRequestText}</p>
          ) : (
            <p className="text-dark-500 mt-2 text-sm">El cliente no escribió un mensaje al enviar esta cotización.</p>
          )}
        </div>

        <ul className="mt-6 space-y-2 border-t border-dark-700 pt-4">
          {items.map((line, idx) => {
            const pname =
              line.productName ||
              line.name ||
              line.product?.name ||
              `Ítem ${idx + 1}`;
            const qty = line.quantity ?? line.qty ?? 1;
            const price = Number(line.unitPrice ?? line.price ?? line.publicPrice ?? 0);
            return (
              <li key={idx} className="flex justify-between gap-4 text-sm text-dark-200">
                <span>
                  {pname} × {qty}
                </span>
                <span className="text-dark-400">Q{(price * qty).toLocaleString()}</span>
              </li>
            );
          })}
        </ul>
        {quote.total != null && (
          <p className="mt-4 text-right font-bold text-primary-400">
            Total: Q{Number(quote.total).toLocaleString()}
          </p>
        )}
      </div>

      {canOpenPos && (
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4">
          <p className="text-dark-200 text-sm">
            El cliente aceptó la propuesta. Puedes cargar esta cotización en el POS y registrar la venta; el nombre del
            comprador se rellenará y podrás ajustarlo en la factura.
          </p>
          <Link
            to={`/pos?quoteId=${encodeURIComponent(id)}`}
            className="inline-flex mt-3 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm transition"
          >
            Abrir en POS
          </Link>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-dark-900 border border-dark-700 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-dark-200">Seguimiento</h2>
        <p className="text-xs text-dark-500">
          Cuando tengas listo el detalle (productos disponibles, precios finales), elige{' '}
          <strong className="text-dark-400">Propuesta enviada</strong> y escribe el mensaje para el cliente. Él podrá
          aceptar o rechazar desde su cuenta. Solo después de <strong className="text-dark-400">Aceptada por el cliente</strong>{' '}
          conviene facturar en el POS.
        </p>
        <div>
          <label className="block text-sm text-dark-400 mb-2">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100"
          >
            {QUOTE_ADMIN_STATUS_ORDER.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dark-400 mb-2">Propuesta / respuesta para el cliente</label>
          <textarea
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 resize-y"
            placeholder="Ej.: Tenemos los modelos X y Y en stock; el total quedaría en Q… Si te funciona, confirma desde la web."
          />
          <p className="text-xs text-dark-500 mt-1">Lo verá el cliente cuando el estado sea “Propuesta enviada”.</p>
        </div>
        <div>
          <label className="block text-sm text-dark-400 mb-2">Notas internas</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 resize-y"
            placeholder="Solo equipo interno…"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
