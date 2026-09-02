/**
 * Umbrales de tiempo de la operación (Sprint 20, H20.3).
 *
 * Vive en su propio módulo, sin `'use server'`, por dos razones: lo consume
 * código de cliente (el cronómetro corre en el navegador), y Next solo permite
 * exportar funciones async desde un módulo de server actions — una constante
 * exportada desde `order-actions.ts` rompería el build de la ruta entera.
 */

/**
 * Cuánto puede esperar un pedido en `ready` antes de que la tarjeta avise.
 *
 * Diez minutos es el punto de partida, no un número medido: se va a recalibrar
 * con datos reales de cocina. Por eso es UNA constante exportada y no un
 * literal dentro del componente — recalibrar debe ser cambiar este valor.
 */
export const READY_ALERT_THRESHOLD_MS = 10 * 60 * 1000;
