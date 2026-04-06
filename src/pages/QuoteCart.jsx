import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { quotesBase } from '../config/apiPaths';
import { useQuoteCart } from '../context/QuoteCartContext';

export default function QuoteCart() {
  const { items, setQuantity, removeItem, clear } = useQuoteCart();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    setSubmitting(true);
    try {
      const msg = message.trim();
      const payload = {
        items: items.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
        ...(msg
          ? {
              message: msg,
              clientMessage: msg,
              client_message: msg,
            }
          : {}),
      };
      const { data } = await api.post(quotesBase(), payload);
      if (data?.success === false) {
        toast.error(data?.message || 'No se pudo enviar la cotización');
        return;
      }
      toast.success(data?.message || 'Cotización enviada. Te contactaremos pronto.');
      clear();
      setMessage('');
      navigate('/my-quotes', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar la cotización');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = items.reduce(
    (s, line) => s + Number(line.product?.publicPrice ?? 0) * line.quantity,
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-12 pt-safe">
      <h1 className="text-2xl font-bold text-dark-50">Cotización</h1>
      <p className="text-dark-500 text-sm mt-1">Revisa los productos y envía tu solicitud al equipo.</p>

      {items.length === 0 ? (
        <div className="mt-10 text-center py-16 bg-dark-900/60 border border-dark-700 rounded-xl">
          <p className="text-dark-400">Tu lista está vacía.</p>
          <Link
            to="/products"
            className="inline-block mt-4 text-primary-400 hover:text-primary-300 font-medium"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <ul className="space-y-4">
            {items.map((line) => (
              <li
                key={line.productId}
                className="flex flex-wrap items-center gap-4 bg-dark-900/80 border border-dark-700 rounded-xl p-4"
              >
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-dark-100">{line.product?.name ?? 'Producto'}</p>
                  <p className="text-sm text-primary-400 mt-1">
                    Q{Number(line.product?.publicPrice ?? 0).toLocaleString()} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-dark-500 sr-only">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={line.quantity}
                    onChange={(e) => setQuantity(line.productId, e.target.value)}
                    className="w-20 px-2 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="text-sm text-red-400 hover:text-red-300 px-2"
                  >
                    Quitar
                  </button>
                </div>
                <p className="w-full sm:w-auto sm:text-right font-semibold text-dark-200">
                  Q{(Number(line.product?.publicPrice ?? 0) * line.quantity).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-baseline border-t border-dark-700 pt-4">
            <span className="text-dark-400">Total referencial</span>
            <span className="text-xl font-bold text-primary-400">Q{subtotal.toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Mensaje (opcional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:ring-2 focus:ring-primary-500 outline-none resize-y"
              placeholder="Horario de contacto, dudas, modelo alternativo…"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Enviando…' : 'Enviar cotización'}
          </button>
        </form>
      )}
    </div>
  );
}
