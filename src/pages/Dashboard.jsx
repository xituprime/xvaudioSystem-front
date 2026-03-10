import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const [dayReport, setDayReport] = useState(null);
  const [profits, setProfits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dayRes, profitsRes] = await Promise.all([
          api.get('/sales/reports/day'),
          api.get('/sales/reports/profits'),
        ]);
        if (dayRes.data?.success !== false) setDayReport(dayRes.data);
        if (profitsRes.data?.success !== false) setProfits(profitsRes.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  const daySales = dayReport?.totalSales ?? 0;
  const dayProfit = dayReport?.totalProfit ?? 0;
  const totalProfit = profits?.totalProfit ?? 0;

  const cards = [
    { title: 'Ventas del día', value: `Q${Number(daySales).toLocaleString()}`, color: 'primary' },
    { title: 'Ganancia del día', value: `Q${Number(dayProfit).toLocaleString()}`, color: 'emerald' },
    { title: 'Ganancia total histórica', value: `Q${Number(totalProfit).toLocaleString()}`, color: 'violet' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-100 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-dark-900 border border-dark-700 rounded-xl p-6 shadow-lg"
          >
            <p className="text-sm font-medium text-dark-400 uppercase tracking-wide">{card.title}</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                card.color === 'primary'
                  ? 'text-primary-400'
                  : card.color === 'emerald'
                  ? 'text-emerald-400'
                  : 'text-violet-400'
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
