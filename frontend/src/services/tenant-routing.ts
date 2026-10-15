const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function tenantFromHost(host: string, root: string): string | null {
  const hostname = host.toLowerCase().split(':')[0]; const domain = root.toLowerCase().split(':')[0];
  if (!domain || !hostname.endsWith(`.${domain}`)) return null;
  const slug = hostname.slice(0, -(domain.length + 1));
  return slugPattern.test(slug) && !['www', 'api', 'admin'].includes(slug) ? slug : null;
}
export function micrositeUrl(slug: string, book = false): string {
  if (!slugPattern.test(slug)) throw new Error('Invalid venue slug');
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const path = root ? `${root.startsWith('localhost') ? 'http' : 'https'}://${slug}.${root}/` : `/s/${slug}`;
  return `${path}${book ? '?book=1' : ''}`;
}
