'use client';

import type { OperationSession } from '@/lib/operations/session-tenant';
import type { TenantConfig } from '@/lib/tenant';
import { type ReactNode, createContext, useContext } from 'react';

/**
 * Contexto de la sesión operativa (Sprint 19, Fase 3a).
 *
 * Lo alimenta Chrome (server) con el resultado de getOperationSession():
 * el JWT de empleado vive en una cookie httpOnly que el cliente no puede
 * leer, así que todo dato de sesión llega por aquí, nunca por fetch propio.
 *
 * null = sin sesión operativa (build, /login, cookie expirada).
 */
const OperationSessionContext = createContext<OperationSession | null>(null);

export const OperationSessionProvider = ({
  session,
  children,
}: {
  session: OperationSession | null;
  children: ReactNode;
}) => (
  <OperationSessionContext.Provider value={session}>{children}</OperationSessionContext.Provider>
);

export const useOperationSession = (): OperationSession | null =>
  useContext(OperationSessionContext);

/**
 * Config del tenant activo para componentes de impresión/recibos.
 *
 * Implementación real del contrato de lib/tenant.ts: lee la sesión operativa
 * del contexto en vez del hardcode de Miztli Pardo. Sin sesión degrada a
 * 'Mi Restaurante' — el mismo fallback que usa requireTenant() en la zona
 * admin. logoUrl queda null hasta que exista en el modelo (deuda anotada).
 */
export const useTenant = (): TenantConfig => {
  const session = useOperationSession();
  return {
    displayName: session?.tenantName ?? 'Mi Restaurante',
    logoUrl: null,
    address: session?.address ?? null,
    phone: session?.phone ?? null,
    rfc: session?.rfc ?? null,
  };
};
