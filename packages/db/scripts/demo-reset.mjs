#!/usr/bin/env node
/**
 * Cierra todos los shifts abiertos (ended_at IS NULL) marcándolos auto_closed.
 * Deja la BD en estado predecible para demos — sin truncar tablas.
 *
 * Uso:
 *   pnpm db:demo-reset          (desde la raíz del monorepo)
 *   node packages/db/scripts/demo-reset.mjs
 *
 * Lee variables de entorno desde .env.local en la raíz del monorepo.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Cargar .env.local desde la raíz del monorepo
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../.env.local');

try {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
} catch {
  // .env.local missing — rely on process.env being pre-populated
}

// ---------------------------------------------------------------------------
// Verificar variables requeridas
// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    '✗ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY\n' +
      '  Asegúrate de que .env.local existe en la raíz del monorepo.',
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Conectar y ejecutar el reset
// ---------------------------------------------------------------------------

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log('🔍 Buscando shifts abiertos…');

const { data: open, error: fetchErr } = await supabase
  .from('shifts')
  .select('id, employee_id, started_at, type')
  .is('ended_at', null);

if (fetchErr) {
  console.error('✗ Error al consultar shifts:', fetchErr.message);
  process.exit(1);
}

if (!open || open.length === 0) {
  console.log('✅ No hay shifts abiertos. BD ya está en estado limpio.');
  process.exit(0);
}

console.log(`⚡ Cerrando ${open.length} shift(s) abierto(s)…`);

const ids = open.map((s) => s.id);

const { error: updateErr } = await supabase
  .from('shifts')
  .update({ ended_at: new Date().toISOString(), auto_closed: true })
  .in('id', ids);

if (updateErr) {
  console.error('✗ Error al cerrar shifts:', updateErr.message);
  process.exit(1);
}

console.log('✅ Shifts cerrados:');
for (const s of open) {
  console.log(`   • ${s.id}  tipo: ${s.type}  inicio: ${s.started_at}`);
}
console.log('\n🎬 BD lista para la próxima demo.');
