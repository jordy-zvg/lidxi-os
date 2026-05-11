import type { UberDirectDelivery, UberDirectQuote, UberDirectQuoteRequest } from './types';

const isoIn = (minutes: number): string => new Date(Date.now() + minutes * 60_000).toISOString();

export const mockQuote = (req: UberDirectQuoteRequest): UberDirectQuote => ({
  id: `qt_mock_${Math.random().toString(36).slice(2, 10)}`,
  feeCents: 5500,
  currency: 'MXN',
  pickupEta: req.pickupReadyAt,
  dropoffEta: isoIn(28),
  expiresAt: isoIn(5),
});

export const mockDelivery = (quoteId: string): UberDirectDelivery => ({
  id: `del_mock_${quoteId.slice(-6)}`,
  status: 'pending',
  trackingUrl: `https://track.example.test/${quoteId}`,
  pickupEta: isoIn(10),
  dropoffEta: isoIn(28),
});
