/**
 * Configuración del tenant activo.
 *
 * Por ahora retorna valores hardcodeados del cliente demo (Miztli Pardo).
 * Cuando se sume el segundo cliente, reemplazar por un Context Provider
 * que lea del JWT o del env del branch.
 *
 * Convención: cualquier componente que necesite datos del tenant importa
 * este hook — nunca hardcodea el nombre del establecimiento.
 */

export interface TenantConfig {
  displayName: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  rfc: string | null;
}

export const useTenant = (): TenantConfig => ({
  displayName: 'Miztli Pardo',
  logoUrl: null,
  address: 'Av. Álvaro Obregón 123, Roma Norte, CDMX',
  phone: '55 1234 5678',
  rfc: 'MAPJ850312AB1',
});
