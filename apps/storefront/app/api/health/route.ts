import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'storefront',
    env: process.env.NODE_ENV ?? 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
    timestamp: new Date().toISOString(),
  });
}
