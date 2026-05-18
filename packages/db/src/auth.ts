import type { Role } from '@kobi/shared';
import bcrypt from 'bcryptjs';
import { type JWTPayload, SignJWT, jwtVerify } from 'jose';

/**
 * Auth de OMS: PIN custom + JWT propio.
 *
 * El secret de firma se comparte con Supabase para que PostgREST acepte
 * nuestros JWTs y `current_setting('request.jwt.claims', true)` exponga las
 * claims a las policies RLS definidas en migración 20260511000002_auth_helpers.
 */

export interface EmployeeClaims extends JWTPayload {
  sub: string; // employee_id
  role: 'authenticated';
  employee_role: Role;
  branch_id: string;
  restaurant_id: string;
  station_id?: string; // identificador de la estación POS activada
  pos_session_id?: string; // shifts.id de la activación que abrió esta sesión
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
};

const getSecret = (): Uint8Array => new TextEncoder().encode(requireEnv('JWT_SECRET'));

/**
 * Hashea un PIN para guardarlo en `employees.pin_hash`.
 * Usa bcrypt con 10 rondas — alineado con la verificación que hace pgcrypto
 * en el seed (`crypt(pin, gen_salt('bf'))`).
 */
export const hashPin = async (pin: string): Promise<string> => bcrypt.hash(pin, 10);

/**
 * Verifica un PIN contra el hash guardado.
 * Compatible con hashes generados por bcryptjs y por pgcrypto (mismo formato bcrypt).
 */
export const verifyPin = async (pin: string, hash: string): Promise<boolean> =>
  bcrypt.compare(pin, hash);

/**
 * Firma un JWT de sesión de empleado. Por defecto 12h (jornada larga).
 */
export const signEmployeeJWT = async (
  claims: Omit<EmployeeClaims, 'role'>,
  ttlSeconds = 60 * 60 * 12,
): Promise<string> => {
  const issuer = process.env.JWT_ISSUER ?? 'kobi';
  const audience = process.env.JWT_AUDIENCE ?? 'kobi-oms';
  return new SignJWT({ ...claims, role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setIssuer(issuer)
    .setAudience(audience)
    .sign(getSecret());
};

/**
 * Verifica un JWT entrante y devuelve las claims tipadas. Lanza si es inválido.
 */
export const verifyEmployeeJWT = async (token: string): Promise<EmployeeClaims> => {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: process.env.JWT_ISSUER ?? 'kobi',
    audience: process.env.JWT_AUDIENCE ?? 'kobi-oms',
  });
  return payload as EmployeeClaims;
};
