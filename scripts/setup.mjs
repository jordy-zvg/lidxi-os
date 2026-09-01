#!/usr/bin/env node
/**
 * Setup script para LidxiOS.
 * Crea symlinks de .env.local en cada app apuntando al .env.local raíz.
 * Correr después de clonar el repo: pnpm setup
 */

import { existsSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, '..');

const apps = ['oms', 'storefront', 'clock'];
const target = '../../.env.local'; // relativo a cada app

let created = 0;
let skipped = 0;

console.log('🔧 LidxiOS setup\n');

for (const app of apps) {
  const linkPath = join(root, 'apps', app, '.env.local');

  if (existsSync(linkPath)) {
    console.log(`  ⏭  apps/${app}/.env.local ya existe, saltando`);
    skipped++;
    continue;
  }

  try {
    symlinkSync(target, linkPath);
    console.log(`  ✓  apps/${app}/.env.local → ../../.env.local`);
    created++;
  } catch (err) {
    console.error(`  ✗  Error creando symlink para apps/${app}:`, err.message);
  }
}

console.log(`\n${created} symlinks creados, ${skipped} ya existían.`);

if (created > 0 || skipped === apps.length) {
  console.log('\n✅ Setup completo. Edita .env.local en la raíz con tus credenciales.');
  console.log('   Ver .env.example para referencia.\n');
}
