'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TrackingSnapshot } from '../lib/tracker';

export type TrackingStatus = 'connecting' | 'live' | 'disconnected' | 'closed';

interface UseOrderTrackingResult {
  tracking: TrackingSnapshot | null;
  status: TrackingStatus;
  error: string | null;
}

const MAX_BACKOFF_MS = 30_000;

export function useOrderTracking(orderId: string | null): UseOrderTrackingResult {
  const [tracking, setTracking] = useState<TrackingSnapshot | null>(null);
  const [status, setStatus] = useState<TrackingStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  const retryRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);
  const closedRef = useRef(false);

  const connect = useCallback(() => {
    if (!orderId || closedRef.current) return;

    setStatus('connecting');
    const es = new EventSource(`/api/orders/${orderId}/tracking/stream`);
    esRef.current = es;

    es.onopen = () => {
      setStatus('live');
      setError(null);
      retryRef.current = 0;
    };

    es.addEventListener('snapshot', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (data) setTracking(data as TrackingSnapshot);
    });

    es.addEventListener('update', (e) => {
      setTracking(JSON.parse((e as MessageEvent).data) as TrackingSnapshot);
    });

    es.addEventListener('done', () => {
      closedRef.current = true;
      setStatus('closed');
      es.close();
    });

    es.onerror = () => {
      es.close();
      if (closedRef.current) return;
      setStatus('disconnected');
      const backoff = Math.min(1000 * 2 ** retryRef.current, MAX_BACKOFF_MS);
      retryRef.current += 1;
      setTimeout(connect, backoff);
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    closedRef.current = false;
    retryRef.current = 0;
    connect();
    return () => {
      closedRef.current = true;
      esRef.current?.close();
    };
  }, [orderId, connect]);

  return { tracking, status, error };
}
