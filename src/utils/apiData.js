/** Normaliza respuestas { data, quotes, user, ... } del backend. */
export function unwrapEntity(data, ...preferredKeys) {
  if (data == null) return null;
  for (const key of preferredKeys) {
    const v = data[key];
    if (v != null && typeof v === 'object' && !Array.isArray(v)) return v;
  }
  if (data.data != null && typeof data.data === 'object' && !Array.isArray(data.data)) {
    return data.data;
  }
  return data;
}

export function unwrapList(data, arrayKeys = ['data', 'quotes', 'items', 'products']) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  for (const key of arrayKeys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  return [];
}
