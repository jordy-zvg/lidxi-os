/**
 * Roles dentro de un branch. El rol determina permisos en RLS y qué
 * pantallas del OMS son visibles.
 */

export const ROLES = ['manager', 'cashier', 'cook', 'courier'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  manager: 'Gerente',
  cashier: 'Cajero',
  cook: 'Cocinero',
  courier: 'Repartidor',
};

export const canAccessAdmin = (role: Role): boolean => role === 'manager';
