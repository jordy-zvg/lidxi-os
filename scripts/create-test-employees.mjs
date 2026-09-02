/**
 * Script para crear test employees en Miztli Pardo con asignaciones de branch.
 * Uso: node scripts/create-test-employees.mjs
 *
 * Nota: Usa Supabase REST API para crear employees y branches.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf-8');
  for (const line of env.split('\n')) {
    if (line && !line.startsWith('#')) {
      const [key, ...val] = line.split('=');
      if (key) process.env[key.trim()] = val.join('=').trim();
    }
  }
}

const MIZTLI_TENANT_ID = 'b27036fa-c1d1-4138-85c6-844d89637b1a';
const JURIQUILLA_BRANCH_ID = '85f408dc-f7f7-4693-af20-049526fd4182';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

// Simple PIN hash function (mimics @kobi/db hashPin)
function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

const TEST_EMPLOYEES = [
  {
    name: 'Test Manager',
    role: 'manager',
    pin: '1111',
    branchIds: [JURIQUILLA_BRANCH_ID],
  },
  {
    name: 'Test Cashier',
    role: 'cashier',
    pin: '2222',
    branchIds: [JURIQUILLA_BRANCH_ID],
  },
  {
    name: 'Test Cook',
    role: 'cook',
    pin: '3333',
    branchIds: [], // No explicit branch
  },
];

async function createEmployee(emp) {
  const pinHash = hashPin(emp.pin);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/employees_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      tenant_id: MIZTLI_TENANT_ID,
      name: emp.name,
      role: emp.role,
      pin_hash: pinHash,
      status: 'activo',
      fingerprint_enrolled: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to create employee: ${JSON.stringify(err)}`);
  }

  const [data] = await res.json();
  return data;
}

async function assignBranches(employeeId, branchIds) {
  if (branchIds.length === 0) return;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/employee_branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(
      branchIds.map((branchId) => ({
        employee_id: employeeId,
        branch_id: branchId,
      })),
    ),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to assign branches: ${JSON.stringify(err)}`);
  }
}

async function main() {
  console.log('🚀 Creando test employees en Miztli Pardo...\n');

  for (const emp of TEST_EMPLOYEES) {
    try {
      const data = await createEmployee(emp);
      const employeeId = data.id;

      console.log(`✅ Created ${emp.name} (${emp.role}) | ID: ${employeeId}`);
      console.log(`   PIN: ${emp.pin}`);

      if (emp.branchIds.length > 0) {
        await assignBranches(employeeId, emp.branchIds);
        console.log(`   ✓ Assigned to ${emp.branchIds.length} branch(es)`);
      } else {
        console.log('   ✓ No explicit branch assignment (can access all active)');
      }
    } catch (err) {
      console.error(`❌ Error creating ${emp.name}:`, err.message);
    }
    console.log();
  }

  console.log('✨ Done!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
