import { NextRequest, NextResponse } from 'next/server';
import { tenantFromHost } from './services/tenant-routing';
export function proxy(request: NextRequest) {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const slug = root && tenantFromHost(request.headers.get('host') || '', root);
  if (!slug) return NextResponse.next();
  const path = request.nextUrl.pathname;
  if (path === '/' || path === '/admin' || path === '/cms') {
    const url = request.nextUrl.clone(); url.pathname = `/s/${slug}${path === '/' ? '' : '/manage'}`;
    if (path === '/cms') url.searchParams.set('tab', 'cms');
    return NextResponse.rewrite(url);
  }
  if (path.startsWith('/s/') && path.split('/')[2] !== slug) return new NextResponse('Not found', { status: 404 });
  return NextResponse.next();
}
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
