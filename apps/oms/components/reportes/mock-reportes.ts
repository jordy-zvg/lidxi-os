import { cents } from '@lidxi/shared';
import type { CentsMXN } from '@lidxi/shared';

export const COMISIONES: Record<string, number> = {
  direct: 0.072,
  eats: 0.28,
  rappi: 0.27,
  didi: 0.25,
  mostrador: 0,
};

export const CH_LABELS: Record<string, string> = {
  direct: 'Uber Direct',
  eats: 'Uber Eats',
  rappi: 'Rappi',
  didi: 'Didi Food',
  mostrador: 'Mostrador',
};

export const CH_COLORS: Record<string, string> = {
  direct: 'var(--brand)',
  eats: 'var(--ch-eats)',
  rappi: 'var(--ch-rappi)',
  didi: 'var(--ch-didi)',
  mostrador: 'var(--ch-mostrador)',
};

export interface CanalData {
  pedidos: number;
  ventas: CentsMXN;
}

export const MOCK_REPORTES = {
  periodo: 'Este mes',
  ventas_totales: cents(28470000),
  ticket_promedio: cents(34800),
  tiempo_prep_prom: 9.2,
  objetivo_prep: 10,
  canal_mas_rentable: 'direct',
  por_canal: {
    direct: { pedidos: 142, ventas: cents(8847200) },
    eats: { pedidos: 203, ventas: cents(9842100) },
    rappi: { pedidos: 118, ventas: cents(5724300) },
    didi: { pedidos: 47, ventas: cents(2184600) },
    mostrador: { pedidos: 34, ventas: cents(1871800) },
  } as Record<string, CanalData>,
  top_vendidos: [
    { nombre: 'Taco de pastor', cantidad: 487, margen: 0.68 },
    { nombre: 'Quesadilla de huitlacoche', cantidad: 312, margen: 0.71 },
    { nombre: 'Pozole rojo', cantidad: 298, margen: 0.62 },
    { nombre: 'Agua de horchata', cantidad: 276, margen: 0.82 },
    { nombre: 'Taco de suadero', cantidad: 251, margen: 0.65 },
  ],
  top_rentables: [
    { nombre: 'Agua de horchata', margen: 0.82, ventas: cents(966000) },
    { nombre: 'Refresco vidrio', margen: 0.78, ventas: cents(540000) },
    { nombre: 'Quesadilla de huitlacoche', margen: 0.71, ventas: cents(2215200) },
    { nombre: 'Taco de pastor', margen: 0.68, ventas: cents(3393800) },
    { nombre: 'Guacamole 100g', margen: 0.67, ventas: cents(722400) },
  ],
  embudo: [
    { etapa: 'Recibidos', n: 744, pct: 100 },
    { etapa: 'Aceptados <60s', n: 718, pct: 96.5 },
    { etapa: 'Preparados OK', n: 681, pct: 91.5 },
    { etapa: 'Recogidos', n: 659, pct: 88.6 },
    { etapa: 'Entregados', n: 644, pct: 86.6 },
  ],
};

export function generateHeatmapMock(): { dia: number; hora: number; pedidos: number }[] {
  const data: { dia: number; hora: number; pedidos: number }[] = [];
  for (let dia = 0; dia < 7; dia++) {
    for (let hora = 8; hora <= 23; hora++) {
      const esPico = dia >= 4 && hora >= 13 && hora <= 15;
      const esMedio = (hora >= 12 && hora <= 14) || (hora >= 19 && hora <= 21);
      const pedidos = esPico
        ? 28 + Math.floor(Math.random() * 12)
        : esMedio
          ? 12 + Math.floor(Math.random() * 8)
          : 2 + Math.floor(Math.random() * 5);
      data.push({ dia, hora, pedidos });
    }
  }
  return data;
}
