import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { parseDayReportResponse, parseProfitsReportResponse } from '../utils/dashboardMetrics';

export default function Dashboard() {
  const [dayReport, setDayReport] = useState(null);
  const [profits, setProfits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dayRes, profitsRes] = await Promise.allSettled([
          api.get('/sales/reports/day'),
          api.get('/sales/reports/profits'),
        ]);
        if (dayRes.status === 'fulfilled' && dayRes.value?.data?.success !== false) {
          const raw = dayRes.value.data;
          const parsed = parseDayReportResponse(raw);
          setDayReport(parsed.raw ?? raw);
        }
        if (profitsRes.status === 'fulfilled' && profitsRes.value?.data?.success !== false) {
          const raw = profitsRes.value.data;
          const parsed = parseProfitsReportResponse(raw);
          setProfits(parsed.raw ?? raw);
        }
        if (dayRes.status === 'rejected' && dayRes.reason?.response?.status !== 404) {
          toast.error(dayRes.reason?.response?.data?.message || 'Error al cargar ventas del día');
        }
        if (profitsRes.status === 'rejected' && profitsRes.reason?.response?.status !== 404) {
          toast.error(profitsRes.reason?.response?.data?.message || 'Error al cargar ganancias');
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
          <p className="text-dark-400 text-sm">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  const dayParsed = parseDayReportResponse(dayReport ?? {});
  const profitsParsed = parseProfitsReportResponse(profits ?? {});
  const profitsAsDay = parseDayReportResponse(profits ?? {});

  let daySales = dayParsed.sales;
  let dayProfit = dayParsed.profit;
  if (daySales === 0 && profitsAsDay.sales > 0) daySales = profitsAsDay.sales;
  if (dayProfit === 0 && profitsAsDay.profit > 0) dayProfit = profitsAsDay.profit;

  const totalProfit = profitsParsed.totalProfit;

  const cards = [
    {
      title: 'Ventas del día',
      value: `Q${Number(daySales).toLocaleString()}`,
      subtitle: 'Total vendido hoy',
      icon: '📊',
      bg: 'bg-primary-500/10',
      border: 'border-l-primary-500',
      text: 'text-primary-400',
      href: '/reports',
    },
    {
      title: 'Ganancia del día',
      value: `Q${Number(dayProfit).toLocaleString()}`,
      subtitle: 'Utilidad de hoy',
      icon: '💰',
      bg: 'bg-emerald-500/10',
      border: 'border-l-emerald-500',
      text: 'text-emerald-400',
      href: '/reports',
    },
    {
      title: 'Ganancia total',
      value: `Q${Number(totalProfit).toLocaleString()}`,
      subtitle: 'Histórico acumulado',
      icon: '📈',
      bg: 'bg-violet-500/10',
      border: 'border-l-violet-500',
      text: 'text-violet-400',
      href: '/reports',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
          <p className="text-dark-400 mt-1 text-sm">Resumen de ventas y ganancias</p>
        </div>
        <Link
          to="/pos"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition text-sm"
        >
          <span>🛒</span>
          Abrir POS
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className={`block ${card.bg} border border-dark-700 rounded-xl p-6 shadow-lg border-l-4 ${card.border} hover:border-dark-600 transition`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-dark-400 uppercase tracking-wide">
                  {card.title}
                </p>
                <p className={`mt-2 text-2xl font-bold ${card.text}`}>{card.value}</p>
                <p className="mt-1 text-xs text-dark-500">{card.subtitle}</p>
              </div>
              <span className="text-3xl opacity-80" aria-hidden>{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-200 mb-4">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/products"
            className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-dark-200 font-medium text-sm transition"
          >
            Productos
          </Link>
          <Link
            to="/products/new"
            className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-dark-200 font-medium text-sm transition"
          >
            Nuevo producto
          </Link>
          <Link
            to="/pos"
            className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-dark-200 font-medium text-sm transition"
          >
            Punto de venta
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-dark-200 font-medium text-sm transition"
          >
            Reportes
          </Link>
          <Link
            to="/dashboard/quotes"
            className="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-dark-200 font-medium text-sm transition"
          >
            Cotizaciones
          </Link>
        </div>
      </div>
    </div>
  );
}
