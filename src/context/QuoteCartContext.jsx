import { createContext, useContext, useMemo, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'xvaudio_quote_cart';

const QuoteCartContext = createContext(null);

export function QuoteCartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    const id = product?.id ?? product?._id;
    if (id == null) return;
    const q = Math.max(1, Math.min(999, Number(quantity) || 1));
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(999, next[idx].quantity + q),
        };
        return next;
      }
      return [
        ...prev,
        {
          productId: id,
          quantity: q,
          product: {
            id,
            name: product.name,
            publicPrice: product.publicPrice,
            stock: product.stock,
          },
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    const q = Math.max(1, Math.min(999, Number(quantity) || 1));
    setItems((prev) => prev.map((x) => (x.productId === productId ? { ...x, quantity: q } : x)));
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      setQuantity,
      removeItem,
      clear,
      itemCount: items.reduce((s, x) => s + x.quantity, 0),
    }),
    [items, addItem, setQuantity, removeItem, clear]
  );

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error('useQuoteCart must be used within QuoteCartProvider');
  return ctx;
}
