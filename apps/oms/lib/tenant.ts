/**
 * Configuración del tenant activo.
 *
 * Desde Sprint 19 (Fase 3a) el hook real vive en OperationSessionProvider y
 * lee la sesión operativa que Chrome (server) resuelve del JWT de empleado.
 * Este módulo conserva el contrato público: cualquier componente que necesite
 * datos del tenant importa este hook — nunca hardcodea el nombre del
 * establecimiento.
 *
 * displayName/address/phone/rfc vienen de la fila de `tenants`; logoUrl queda
 * null hasta que exista en el modelo (deuda anotada). La dirección y el RFC
 * son para el ticket fiscal del cliente, fuera del alcance del día 1.
 */

export interface TenantConfig {
  displayName: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  rfc: string | null;
}

export { useTenant } from '@/components/OperationSessionProvider';
