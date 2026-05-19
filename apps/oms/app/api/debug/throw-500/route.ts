import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEBUG_ENDPOINTS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  throw new Error('Synthetic 500 for audit purposes — safe to ignore');
}
