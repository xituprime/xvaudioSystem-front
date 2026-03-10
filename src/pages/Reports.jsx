import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

const PAGE_SIZE = 10;

export default function Reports() {
  const [dayReport, setDayReport] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchDay = async () => {
      try {
        const { data } = await api.get('/sales/reports/day');
        if (data?.success !== false) setDayReport(data);
      } catch {
        // opcional
      }
    };
    fetchDay();
  }, []);

  const fetchSales = async (pageNum = 1) => {
    setLoadingSales(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pageNum);
      params.set('limit', PAGE_SIZE);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      const { data } = await api.get(`/sales?${params.toString()}`);
      const list = data?.sales ?? data?.data ?? (Array.isArray(data) ? data : []);
      setSales(Array.isArray(list) ? list : []);
      const total = data?.total ?? data?.pagination?.total ?? list.length;
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      setPage(pageNum);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar ventas');
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchSales(1);
  }, [dateFrom, dateTo]);

  const loadingState = loading && !dayReport;

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-100 mb-8">Reportes</h1>

      {/* Ventas del día */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-dark-200 mb-4">Ventas del día</h2>
        {loadingState ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
              <p className="text-sm text-dark-400">Total vendido hoy</p>
              <p className="text-xl font-bold text-primary-400">
                Q{Number(dayReport?.totalSales ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
              <p className="text-sm text-dark-400">Ganancia hoy</p>
              <p className="text-xl font-bold text-emerald-400">
                Q{Number(dayReport?.totalProfit ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Filtro por fechas */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-dark-200 mb-4">Historial de ventas</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-dark-400 mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100"
            />
          </div>
        </div>
      </section>

      {/* Tabla */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
        {loadingSales ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center text-dark-500">No hay ventas en este rango.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-800/50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-dark-300">
                      Recibo
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-dark-300">
                      Fecha
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-dark-300">
                      Total
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-dark-300">
                      Ganancia
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-dark-300">
                      Recibo PDF
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale._id}
                      className="border-b border-dark-700/50 hover:bg-dark-800/30"
                    >
                      <td className="py-3 px-4 text-dark-200 font-mono text-sm">
                        {sale.receiptNumber ?? sale._id?.slice(-8) ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-dark-300 text-sm">
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleString('es')
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-dark-100">
                        Q{Number(sale.total ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400">
                        Q{Number(sale.profit ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {sale.receiptUrl ? (
                          <a
                            href={sale.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                          >
                            Ver recibo
                          </a>
                        ) : (
                          <span className="text-dark-500 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
                <p className="text-sm text-dark-400">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fetchSales(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchSales(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-sm disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
