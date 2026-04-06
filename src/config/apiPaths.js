/** Normaliza path: siempre empieza con / */
function p(path, fallback) {
  const raw = (path || '').trim() || fallback;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

const quotesBaseRaw = import.meta.env.VITE_API_QUOTES_BASE;

/** Base de cotizaciones (ej. /quotes o /api/cotizaciones si tu backend usa otro prefijo). */
export function quotesBase() {
  return p(quotesBaseRaw, '/quotes').replace(/\/$/, '') || '/quotes';
}

export function quotesMinePath() {
  return `${quotesBase()}/mine`;
}

export function quoteByIdPath(id) {
  return `${quotesBase()}/${id}`;
}

export function quoteAcceptPath(id) {
  return `${quotesBase()}/${id}/accept`;
}

export function quoteRejectPath(id) {
  return `${quotesBase()}/${id}/reject`;
}

const userMeRaw = import.meta.env.VITE_API_USER_ME;

/** Perfil del usuario autenticado. */
export function userMePath() {
  return p(userMeRaw, '/users/me').replace(/\/$/, '') || '/users/me';
}

export function userMePasswordPath() {
  return `${userMePath()}/password`;
}
