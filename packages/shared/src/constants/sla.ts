import type { ChannelKey } from './channels';

/**
 * Umbrales de SLA en minutos desde la creación del pedido hasta `ready`.
 * Mantén alineado con el contrato del marketplace correspondiente; estos
 * son defaults conservadores y se sobreescriben por branch si hace falta.
 *
 *   green  → todavía dentro de holgura
 *   amber  → falta poco, alertar al cook
 *   red    → ya en riesgo de incumplimiento
 */

export type SlaLevel = 'green' | 'amber' | 'red';

export interface SlaConfig {
  green: number;
  amber: number;
  red: number;
}

export const SLA_BY_CHANNEL: Record<ChannelKey, SlaConfig> = {
  direct: { green: 25, amber: 30, red: 40 },
  eats: { green: 15, amber: 18, red: 22 },
  rappi: { green: 15, amber: 18, red: 22 },
  didi: { green: 15, amber: 18, red: 22 },
  mostrador: { green: 20, amber: 25, red: 30 },
  // Sin contrato de marketplace de por medio: mismos umbrales que direct.
  whatsapp: { green: 25, amber: 30, red: 40 },
};

export const slaLevel = (channel: ChannelKey, elapsedMinutes: number): SlaLevel => {
  const cfg = SLA_BY_CHANNEL[channel];
  if (elapsedMinutes >= cfg.red) return 'red';
  if (elapsedMinutes >= cfg.amber) return 'amber';
  return 'green';
};
