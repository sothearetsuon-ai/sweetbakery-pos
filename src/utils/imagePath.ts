/// <reference types="vite/client" />

/**
 * Utility to resolve image URLs reliably in all environments:
 * - Localhost dev server (/)
 * - GitHub Pages subpath (/sweetbakery-pos/)
 * - Base64 Data URLs & Blob URLs
 * - External HTTPS URLs (Unsplash, CDNs)
 */
export function getProductImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs, Blobs, and full HTTP/HTTPS URLs work as-is
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
  const base = (import.meta as any).env?.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  return `${cleanBase}${cleanPath}`;
}
