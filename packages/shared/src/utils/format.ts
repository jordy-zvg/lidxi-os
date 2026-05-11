import type { CentsMXN } from '../types/money';

const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

export const formatMXN = (cents: CentsMXN): string => mxnFormatter.format(cents / 100);

const timeFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Mexico_City',
});

export const formatTimeMX = (isoOrDate: string | Date): string =>
  timeFormatter.format(typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate);

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Mexico_City',
});

export const formatDateMX = (isoOrDate: string | Date): string =>
  dateFormatter.format(typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate);

export const formatOrderId = (id: string): string => `#${id.slice(0, 8).toUpperCase()}`;

export const minutesBetween = (a: string | Date, b: string | Date = new Date()): number => {
  const aMs = typeof a === 'string' ? new Date(a).getTime() : a.getTime();
  const bMs = typeof b === 'string' ? new Date(b).getTime() : b.getTime();
  return Math.floor((bMs - aMs) / 60_000);
};
