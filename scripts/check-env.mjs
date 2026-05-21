#!/usr/bin/env node
/**
 * Sprint 8 — validador de credenciales antes de arrancar el runbook real.
 *
 * Lee SPRINT8_SECRETS.md (gitignored) parseando líneas KEY=value (ignora
 * comentarios). Reporta presentes/faltantes para cada slot definido más
 * abajo. Exit 0 si todas presentes, 1 si falta alguna.
 *
 * Uso:   pnpm check:env
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const secretsPath = resolve(repoRoot, 'SPRINT8_SECRETS.md');

// Definición canónica de slots requeridos por servicio. Mantener sincronizado
// con SPRINT8_SECRETS.md.example.
// Fase Railway-only: NO se valida Cloudflare (diferido al demo con kobi.mx).
const REQUIRED = [
  {
    service: 'Railway',
    vars: [
      'RAILWAY_TOKEN',
      'RAILWAY_PROJECT_ID',
      'RAILWAY_SERVICE_ID_OMS',
      'RAILWAY_SERVICE_ID_STOREFRONT',
      'RAILWAY_OMS_URL',
      'RAILWAY_STOREFRONT_URL',
    ],
  },
  {
    service: 'Supabase prod',
    vars: [
      'NEXT_PUBLIC_SUPABASE_URL_PROD',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD',
      'SUPABASE_SERVICE_ROLE_KEY_PROD',
      'SUPABASE_PROJECT_REF_PROD',
      'SUPABASE_DB_PASSWORD_PROD',
    ],
  },
  {
    service: 'Supabase staging',
    vars: [
      'NEXT_PUBLIC_SUPABASE_URL_STAGING',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING',
      'SUPABASE_SERVICE_ROLE_KEY_STAGING',
      'SUPABASE_PROJECT_REF_STAGING',
      'SUPABASE_DB_PASSWORD_STAGING',
    ],
  },
  { service: 'Resend', vars: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'] },
  {
    service: 'Mercado Pago',
    vars: [
      'MERCADO_PAGO_ACCESS_TOKEN_PROD',
      'MERCADO_PAGO_ACCESS_TOKEN_TEST',
      'NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_PROD',
      'NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST',
      'MERCADO_PAGO_WEBHOOK_SECRET',
    ],
  },
  {
    service: 'Sentry',
    vars: [
      'NEXT_PUBLIC_SENTRY_DSN_OMS',
      'NEXT_PUBLIC_SENTRY_DSN_STOREFRONT',
      'SENTRY_AUTH_TOKEN',
      'SENTRY_ORG',
    ],
  },
  { service: 'Mapbox', vars: ['NEXT_PUBLIC_MAPBOX_TOKEN'] },
  { service: 'Internas', vars: ['JWT_SECRET_PROD', 'JWT_SECRET_STAGING'] },
];

const COLOR = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};
const isTTY = process.stdout.isTTY;
const c = (color, s) => (isTTY ? `${COLOR[color]}${s}${COLOR.reset}` : s);

function parseSecrets(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    // Sólo aceptar líneas tipo KEY=value (puede estar dentro de bloques ``` en
    // el .md; los respetamos igual, ya que el patrón KEY= con mayúsculas+guion
    // bajo es inequívoco).
    const m = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(t);
    if (!m) continue;
    const [, k, vRaw] = m;
    const v = vRaw
      .split('#')[0]
      .trim()
      .replace(/^["']|["']$/g, '');
    out[k] = v;
  }
  return out;
}

let secrets = {};
const fileExists = existsSync(secretsPath);
if (fileExists) {
  secrets = parseSecrets(readFileSync(secretsPath, 'utf-8'));
} else {
  console.log(c('yellow', `⚠ SPRINT8_SECRETS.md no encontrado en ${secretsPath}`));
  console.log(c('dim', '  Copia SPRINT8_SECRETS.md.example → SPRINT8_SECRETS.md y rellena.\n'));
}

let missingCount = 0;
let presentCount = 0;
const missingByService = [];

for (const { service, vars } of REQUIRED) {
  console.log(c('dim', `\n# ${service}`));
  const missingHere = [];
  for (const k of vars) {
    const v = secrets[k];
    if (v && v.length > 0) {
      console.log(`  ${c('green', '✓')} ${k}`);
      presentCount += 1;
    } else {
      console.log(`  ${c('red', '✗')} ${k} ${c('dim', '(FALTANTE)')}`);
      missingCount += 1;
      missingHere.push(k);
    }
  }
  if (missingHere.length) missingByService.push({ service, missing: missingHere });
}

const total = presentCount + missingCount;
console.log('');
if (missingCount === 0) {
  console.log(c('green', `✓ Todas las ${total} variables presentes. OK para arrancar Sprint 8.`));
  process.exit(0);
} else {
  console.log(
    c(
      'red',
      `✗ ${missingCount} de ${total} variables faltantes. No arrancar Sprint 8 hasta completar.`,
    ),
  );
  for (const { service, missing } of missingByService) {
    console.log(c('dim', `  · ${service}: ${missing.join(', ')}`));
  }
  process.exit(1);
}
