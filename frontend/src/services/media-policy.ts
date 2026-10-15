/**
 * Shared media policy for Smartify Stadiums / ET Smart Fields.
 * Remote images must match Next.js configured remotePatterns in next.config.ts:
 * - images.unsplash.com
 * - *.playethiopia.com or playethiopia.com
 * Local images must be root-relative paths starting with a single '/' (e.g. /venues/...).
 * Insecure HTTP, protocol-relative (//...), and unconfigured remote hosts are rejected.
 */

export const ALLOWED_IMAGE_HOSTS = ['images.unsplash.com', 'playethiopia.com'];

export function isSupportedImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Protocol-relative URLs (//example.com) are rejected
  if (trimmed.startsWith('//')) return false;
  // Local root-relative paths (e.g. /venues/bambis.jpg)
  if (trimmed.startsWith('/')) {
    return true;
  }
  // Remote URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host === 'images.unsplash.com') return true;
    if (host === 'playethiopia.com' || host.endsWith('.playethiopia.com')) return true;
    return false;
  } catch {
    return false;
  }
}

export function isSupportedVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Protocol-relative rejected
  if (trimmed.startsWith('//')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
