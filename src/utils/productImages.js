/** Normaliza una ruta o URL de imagen para el navegador */
export function normalizeImageUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const url = raw.trim();
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
}

/**
 * Lista todas las URLs de imágenes del producto (images[], image string, image JSON array, etc.)
 */
export function getProductImageUrls(product) {
  if (!product) return [];
  const out = [];
  const push = (v) => {
    const u = normalizeImageUrl(typeof v === 'string' ? v : v?.url ?? v?.secure_url);
    if (u && !out.includes(u)) out.push(u);
  };
  if (Array.isArray(product.images)) {
    product.images.forEach(push);
  }
  if (Array.isArray(product.photos)) {
    product.photos.forEach(push);
  }
  if (product.image) {
    if (Array.isArray(product.image)) {
      product.image.forEach(push);
    } else if (typeof product.image === 'string' && product.image.startsWith('[')) {
      try {
        const parsed = JSON.parse(product.image);
        if (Array.isArray(parsed)) parsed.forEach(push);
        else push(product.image);
      } catch {
        push(product.image);
      }
    } else {
      push(product.image);
    }
  }
  if (product.imageUrl) push(product.imageUrl);
  if (product.secure_url) push(product.secure_url);
  return out;
}

export function getPrimaryImageUrl(product) {
  const urls = getProductImageUrls(product);
  return urls[0] ?? null;
}
