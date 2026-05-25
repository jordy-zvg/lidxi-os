import { cookies } from 'next/headers';

export const DEVICE_COOKIE = 'kobi-device';
const ONE_YEAR_S = 60 * 60 * 24 * 365;

export const setDeviceCookie = (rawToken: string): void => {
  cookies().set(DEVICE_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR_S,
  });
};

export const clearDeviceCookie = (): void => {
  cookies().delete(DEVICE_COOKIE);
};

export const readDeviceCookie = (): string | null => cookies().get(DEVICE_COOKIE)?.value ?? null;
