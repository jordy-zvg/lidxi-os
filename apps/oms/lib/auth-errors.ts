/**
 * Errores de auth compartidos entre server actions y UI.
 *
 * Viven FUERA de `auth-actions.ts` porque ese archivo es `'use server'`, y
 * Next.js solo permite exportar funciones async desde un módulo de server
 * actions: exportar una constante de ahí rompe el build de toda la ruta
 * ("Only async functions are allowed to be exported in a 'use server' file").
 * Ni type-check ni biome lo detectan — solo se ve al levantar la app.
 */

/**
 * "No hay nadie dado de alta" — distinto de credencial errónea.
 * La UI lo reconoce por igualdad para ofrecer el enlace al alta de empleados;
 * exportado para que ese acoplamiento sea explícito y no un string duplicado.
 */
export const NO_EMPLOYEES_ERROR =
  'Todavía no hay empleados dados de alta en este restaurante. Crea el primero desde Equipo, en el panel de administración.';
