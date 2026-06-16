import { unwrapEntity } from './apiData';

/**
 * Extrae el documento cotización del JSON del backend (soporta anidamientos habituales).
 */
export function unwrapQuoteEntity(data) {
  if (data == null) return null;
  let q = unwrapEntity(data, 'quote', 'data') ?? data;

  if (q && typeof q === 'object' && !Array.isArray(q)) {
    if (q.quote != null && typeof q.quote === 'object' && !Array.isArray(q.quote)) {
      const inner = q.quote;
      const rest = Object.fromEntries(
        Object.entries(q).filter(([k, v]) => k !== 'quote' && v !== undefined)
      );
      return { ...inner, ...rest };
    }
    if (q.data != null && typeof q.data === 'object' && !Array.isArray(q.data) && q.data.quote) {
      const inner = q.data.quote;
      return inner && typeof inner === 'object' ? { ...inner } : q.data;
    }
  }

  if (q == null || typeof q !== 'object' || Array.isArray(q)) return null;
  return q;
}

/** id estable para listas y rutas */
export function quoteRecordId(q) {
  if (q == null || typeof q !== 'object') return null;
  const raw = q.id ?? q._id ?? q.quoteId;
  if (raw != null && raw !== '') return String(raw);
  return null;
}

function userLike(u) {
  if (u == null) return null;
  if (Array.isArray(u)) return userLike(u[0]);
  if (typeof u === 'object') return u;
  return null;
}

/** Usuario poblado: user, userId (populate), client, createdBy, etc. */
function primaryUserProfile(q) {
  if (q == null || typeof q !== 'object') return null;
  const uid = q.userId;
  const userIdProfile =
    uid != null && typeof uid === 'object' && !Array.isArray(uid) ? uid : null;
  return (
    userLike(q.user) ??
    userLike(q.client) ??
    userLike(q.createdBy) ??
    userIdProfile ??
    userLike(q.author) ??
    userLike(q.usuario) ??
    userLike(q.creator) ??
    userLike(q.account) ??
    (q.customer && typeof q.customer === 'object' ? q.customer : null)
  );
}

function profileEmailCandidates(p) {
  if (p == null || typeof p !== 'object') return [];
  return [
    p.email,
    p.correo,
    p.mail,
    p.userEmail,
    p.user_email,
  ];
}

function profileNameCandidates(p) {
  if (p == null || typeof p !== 'object') return [];
  const joined = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
  return [
    p.name,
    p.nombre,
    p.fullName,
    p.displayName,
    joined || null,
    p.username,
  ];
}

function firstNonEmptyString(...candidates) {
  for (const v of candidates) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s !== '') return s;
  }
  return '';
}

/** Email / nombre para tablas admin y detalle */
export function quoteContactEmail(q) {
  if (q == null || typeof q !== 'object') return '—';
  const profile = primaryUserProfile(q);
  const s = firstNonEmptyString(
    q.contactEmail,
    q.contact_email,
    q.userEmail,
    q.user_email,
    q.customerEmail,
    q.customer_email,
    q.clientEmail,
    q.client_email,
    q.buyerEmail,
    q.buyer_email,
    ...profileEmailCandidates(profile),
    q.email
  );
  return s || '—';
}

export function quoteContactName(q) {
  if (q == null || typeof q !== 'object') return '';
  const profile = primaryUserProfile(q);
  return firstNonEmptyString(
    q.contactName,
    q.contact_name,
    q.userName,
    q.user_name,
    q.customerName,
    q.customer_name,
    q.clientName,
    q.client_name,
    q.nombreCliente,
    q.nombre_cliente,
    q.buyerName,
    q.buyer_name,
    ...profileNameCandidates(profile),
    q.name
  );
}

export function quoteContactPhone(q) {
  if (q == null || typeof q !== 'object') return '';
  const profile = primaryUserProfile(q);
  return firstNonEmptyString(
    q.contactPhone,
    q.contact_phone,
    q.phone,
    profile?.phone,
    profile?.telefono,
    profile?.celular,
    profile?.movil
  );
}

/**
 * Texto principal para columna "Cliente": email si existe; si no, nombre; si no, —.
 */
export function quoteClientPrimaryLine(q) {
  const email = quoteContactEmail(q);
  const name = quoteContactName(q);
  if (email !== '—') return email;
  if (name) return name;
  return '—';
}

/** Subtítulo: nombre cuando la línea principal ya es el email. */
export function quoteClientSecondaryLine(q) {
  const email = quoteContactEmail(q);
  const name = quoteContactName(q);
  if (email !== '—' && name) return name;
  return '';
}

/** Líneas de ítems seguras (sin nulls) */
export function quoteLineItems(quote) {
  if (quote == null || typeof quote !== 'object') return [];
  const raw =
    quote.items ||
    quote.quoteItems ||
    quote.lineItems ||
    quote.lines ||
    quote.products ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw.filter((line) => line != null && typeof line === 'object');
}

/** Lista API → solo objetos cotización válidos */
export function normalizeQuoteList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((row) => row != null && typeof row === 'object')
    .map((row) => {
      if (row.quote != null && typeof row.quote === 'object') {
        const inner = row.quote;
        const rest = Object.fromEntries(
          Object.entries(row).filter(([k, v]) => k !== 'quote' && v !== undefined)
        );
        return { ...inner, ...rest };
      }
      return row;
    })
    .filter((row) => quoteRecordId(row) != null);
}
