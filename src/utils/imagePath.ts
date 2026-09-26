/// <reference types="vite/client" />

/**
 * Utility to resolve image URLs reliably in all environments:
 * - Localhost dev server (http://localhost:3000/)
 * - LAN phone devices (http://192.168.x.x:3000/)
 * - GitHub Pages subpath (https://sothearetsuon-ai.github.io/sweetbakery-pos/)
 * - Base64 Data URLs & Blob URLs
 * - External HTTPS URLs (Unsplash, CDNs)
 */
export function getProductImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs, Blobs, and full HTTP/HTTPS URLs work directly
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // Handle local upload paths like /uploads/products/xxx.jpg or uploads/products/xxx.jpg
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

  // In the browser, resolve dynamically with origin and subpath for 100% guarantee
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    if (pathname.includes('/sweetbakery-pos')) {
      return `${origin}/sweetbakery-pos/${cleanPath}`;
    }
    return `${origin}/${cleanPath}`;
  }

  const base = (import.meta as any).env?.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
