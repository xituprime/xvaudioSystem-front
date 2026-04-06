import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { getPrimaryImageUrl } from '../utils/productImages';

export default function POS() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selling, setSelling] = useState(false);
  const [lastReceiptUrl, setLastReceiptUrl] = useState(null);

  const filteredProducts = useMemo(() => {
    const withStock = products.filter((p) => Number(p?.stock ?? 0) > 0);
    const q = (search || '').trim().toLowerCase();
    if (!q) return withStock;
    return withStock.filter((p) => {
      const name = (p?.name ?? p?.nombre ?? '').toLowerCase();
      const category = (p?.category ?? p?.categoria ?? '').toLowerCase();
      const brand = (p?.brand ?? p?.marca ?? '').toLowerCase();
      const desc = (p?.description ?? p?.descripcion ?? '').toLowerCase();
      return name.includes(q) || category.includes(q) || brand.includes(q) || desc.includes(q);
    });
  }, [products, search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.products)) list = data.products;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data?.data?.products)) list = data.data.products;
        setProducts(list);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al cargar productos');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const productId = (p) => p?.id ?? p?._id;

  const addToCart = (product) => {
    const id = productId(product);
    if (!id) return;
    const inCart = cart.find((c) => (c.id ?? c._id) === id);
    const stock = Number(product?.stock ?? 0);
    const currentQty = inCart?.qty ?? 0;
    if (currentQty >= stock) {
      toast.error('No hay más stock');
      return;
    }
    if (inCart) {
      setCart((prev) =>
        prev.map((c) => ((c.id ?? c._id) === id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          _id: id,
          id,
          name: product?.name ?? product?.nombre ?? 'Producto',
          publicPrice: product?.publicPrice ?? 0,
          purchasePrice: product?.purchasePrice ?? 0,
          qty: 1,
        },
      ]);
    }
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
  };

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const item = prev.find((c) => (c.id ?? c._id) === id);
      if (!item) return prev;
      const newQty = Math.max(0, item.qty + delta);
      if (newQty === 0) return prev.filter((c) => (c.id ?? c._id) !== id);
      return prev.map((c) => (c.id ?? c._id) === id ? { ...c, qty: newQty } : c);
    });
  };

  const total = useMemo(
    () => cart.reduce((acc, c) => acc + Number(c.publicPrice) * c.qty, 0),
    [cart]
  );
  const totalProfit = useMemo(
    () =>
      cart.reduce(
        (acc, c) =>
          acc + (Number(c.publicPrice) - Number(c.purchasePrice)) * c.qty,
        0
      ),
    [cart]
  );

  const finishSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    const items = cart
      .map((c) => {
        const productId = c.id ?? c._id;
        const quantity = Number(c.qty) || 1;
        if (productId == null || productId === '') return null;
        const idStr = String(productId);
        return {
          productId: idStr,
          product_id: idStr,
          quantity,
          qty: quantity,
        };
      })
      .filter(Boolean);
    if (items.length === 0) {
      toast.error('No hay ítems válidos en el carrito.');
      return;
    }
    setSelling(true);
    setLastReceiptUrl(null);
    try {
      // Varias formas por compatibilidad con distintos backends
      const itemPayload = items.map((item) => ({
        productId: item.productId,
        product_id: item.product_id,
        quantity: item.quantity,
        qty: item.qty,
      }));
      const payload = {
        items: itemPayload,
        products: itemPayload,
      };
      const { data } = await api.post('/sales', payload);
      if (data?.success === false) {
        toast.error(data.message || 'Error al registrar venta');
        return;
      }
      toast.success('Venta registrada');
      setLastReceiptUrl(data?.receiptUrl ?? data?.sale?.receiptUrl ?? null);
      setCart([]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED' && 'El servidor no respondió a tiempo.') ||
        (err.message?.toLowerCase().includes('network') && 'No se pudo conectar. ¿El backend está en marcha en el puerto 5000?') ||
        'Error al registrar venta. Revisa que el backend esté activo y la ruta POST /api/sales.';
      toast.error(msg);
    } finally {
      setSelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-[100vw] overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-bold text-dark-100 mb-4 sm:mb-6">POS - Punto de venta</h1>

      {lastReceiptUrl && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-emerald-400 font-medium">Venta realizada correctamente.</p>
          <a
            href={lastReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 underline mt-2 inline-block"
          >
            Ver recibo (PDF)
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Lista productos */}
        <div className="lg:col-span-2 bg-dark-900 border border-dark-700 rounded-xl p-3 sm:p-4 min-h-0 h-[min(50dvh,360px)] sm:h-[min(56dvh,420px)] lg:h-[70vh] flex flex-col">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, categoría o marca..."
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:ring-2 focus:ring-primary-500 outline-none mb-4"
          />
          <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {filteredProducts.length === 0 ? (
              <p className="col-span-full text-dark-500 text-sm py-8 text-center">
                {search.trim() ? 'Ningún producto coincide con la búsqueda.' : 'No hay productos con stock.'}
              </p>
            ) : (
              filteredProducts.map((p) => {
                const imgUrl = getPrimaryImageUrl(p);
                return (
                  <button
                    key={productId(p)}
                    type="button"
                    onClick={() => addToCart(p)}
                    className="flex flex-col bg-dark-800 border border-dark-600 rounded-lg overflow-hidden text-left hover:border-primary-500 hover:bg-dark-700 transition"
                  >
                    <div className="h-[4.25rem] sm:h-24 md:h-28 shrink-0 bg-dark-700 flex items-center justify-center overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={p?.name ?? p?.nombre ?? ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-dark-500">📦</span>
                      )}
                    </div>
                    <div className="p-3 flex-1 min-w-0">
                      <p className="font-medium text-dark-100 truncate text-sm">{p?.name ?? p?.nombre ?? 'Producto'}</p>
                      <p className="text-primary-400 font-semibold mt-1 text-sm">
                        Q{Number(p?.publicPrice ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-dark-500">Stock: {p?.stock ?? 0}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Carrito */}
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 sm:p-4 min-h-0 h-[min(42dvh,320px)] sm:h-[min(48dvh,380px)] lg:h-[70vh] flex flex-col">
          <h2 className="font-semibold text-dark-200 mb-4">Carrito</h2>
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <p className="text-dark-500 text-sm">Sin productos</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id ?? item._id}
                  className="flex items-center gap-2 p-3 bg-dark-800 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-100 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-dark-400">
                      Q{Number(item.publicPrice).toLocaleString()} × {item.qty} = Q{(Number(item.publicPrice) * item.qty).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id ?? item._id, -1)}
                      className="w-8 h-8 rounded bg-dark-600 hover:bg-dark-500 text-dark-200 font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id ?? item._id, 1)}
                      className="w-8 h-8 rounded bg-dark-600 hover:bg-dark-500 text-dark-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id ?? item._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    title="Quitar"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-dark-700 space-y-2">
            <div className="flex justify-between text-dark-300">
              <span>Total</span>
              <span className="font-bold text-dark-100 text-lg">
                Q{total.toLocaleString()}
              </span>
            </div>
            {isAdmin && (
              <div className="flex justify-between text-dark-400 text-sm">
                <span>Ganancia est.</span>
                <span className="text-emerald-400">Q{totalProfit.toLocaleString()}</span>
              </div>
            )}
            <button
              type="button"
              onClick={finishSale}
              disabled={cart.length === 0 || selling}
              className="w-full mt-4 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selling ? 'Procesando...' : 'Finalizar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
