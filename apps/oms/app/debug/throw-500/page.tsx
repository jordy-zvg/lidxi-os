export const dynamic = 'force-dynamic';

export default function ThrowPage() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEBUG_ENDPOINTS !== 'true') {
    return null;
  }
  throw new Error('Synthetic 500 for audit purposes — safe to ignore (page render)');
}
