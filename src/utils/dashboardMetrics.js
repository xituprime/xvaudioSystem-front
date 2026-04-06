/** Extrae un número de un objeto probando varias claves (APIs distintas / español). */
function pickNumber(obj, keys) {
  if (obj == null || typeof obj !== 'object') return null;
  for (const key of keys) {
    const v = obj[key];
    if (v != null && v !== '') {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

const DAY_SALES_KEYS = [
  'totalSales',
  'sales',
  'total',
  'totalVentas',
  'ventas',
  'ventasDelDia',
  'ventasHoy',
  'ventas_dia',
  'totalVendido',
  'amount',
  'totalAmount',
  'sumaVentas',
  'montoTotal',
  'ingresos',
  'ingresosDia',
  'revenue',
  'daySales',
  'todaySales',
];

const DAY_PROFIT_KEYS = [
  'totalProfit',
  'profit',
  'ganancia',
  'gananciaDia',
  'ganancia_dia',
  'gananciaDelDia',
  'utilidad',
  'utilidadDia',
  'margin',
  'profitDay',
  'dayProfit',
];

const TOTAL_PROFIT_KEYS = [
  'totalProfit',
  'profit',
  'gananciaTotal',
  'ganancia_total',
  'ganancia',
  'utilidadTotal',
  'total',
  'historicalProfit',
  'allTimeProfit',
];

/** Aplana respuestas típicas: data, report, summary, result. */
function unwrapReportPayload(raw) {
  if (raw == null) return null;
  if (typeof raw !== 'object') return null;
  return (
    raw.data ??
    raw.report ??
    raw.summary ??
    raw.result ??
    raw.payload ??
    raw.reports ??
    raw
  );
}

/** Une subobjetos comunes del backend (día, ventas, hoy) con el padre para buscar números. */
function mergeNestedDayBlock(block) {
  if (block == null || typeof block !== 'object') return block;
  const nested =
    block.dia ??
    block.day ??
    block.hoy ??
    block.today ??
    block.ventasDelDia ??
    block.ventas_dia ??
    block.ventas ??
    block.resumen ??
    null;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...nested, ...block };
  }
  return block;
}

/**
 * Normaliza respuesta de GET /sales/reports/day (o similar).
 */
export function parseDayReportResponse(responseData) {
  if (responseData == null || responseData === '') {
    return { sales: 0, profit: 0, raw: null };
  }
  const root = responseData;
  let block = unwrapReportPayload(root);
  if (block && typeof block === 'object' && pickNumber(block, DAY_SALES_KEYS) == null) {
    const inner = unwrapReportPayload(block);
    if (inner && inner !== block) block = inner;
  }
  block = mergeNestedDayBlock(block);

  let sales = pickNumber(block || {}, DAY_SALES_KEYS);
  let profit = pickNumber(block || {}, DAY_PROFIT_KEYS);

  if (sales == null && root && typeof root === 'object') {
    sales = pickNumber(root, DAY_SALES_KEYS);
  }
  if (profit == null && root && typeof root === 'object') {
    profit = pickNumber(root, DAY_PROFIT_KEYS);
  }

  return {
    sales: sales ?? 0,
    profit: profit ?? 0,
    raw: block || root,
  };
}

/**
 * Normaliza respuesta de GET /sales/reports/profits (ganancia acumulada u hoy según backend).
 */
export function parseProfitsReportResponse(responseData) {
  if (responseData == null || responseData === '') {
    return { totalProfit: 0, raw: null };
  }
  const root = responseData;
  let block = unwrapReportPayload(root);
  if (block && typeof block === 'object' && pickNumber(block, TOTAL_PROFIT_KEYS) == null) {
    const inner = unwrapReportPayload(block);
    if (inner && inner !== block) block = inner;
  }

  let total = pickNumber(block || {}, TOTAL_PROFIT_KEYS);
  if (total == null && root && typeof root === 'object') {
    total = pickNumber(root, TOTAL_PROFIT_KEYS);
  }

  return {
    totalProfit: total ?? 0,
    raw: block || root,
  };
}
