/**
 * Script para crear test employees en Miztli Pardo con asignaciones de branch.
 * Uso: pnpm exec tsx scripts/create-test-employees.ts
 */

import { createSupabaseServiceClient, hashPin } from '@kobi/db';

const MIZTLI_TENANT_ID = 'b27036fa-c1d1-4138-85c6-844d89637b1a';
const JURIQUILLA_BRANCH_ID = '85f408dc-f7f7-4693-af20-049526fd4182';

const TEST_EMPLOYEES = [
  {
    name: 'Test Manager',
    role: 'manager' as const,
    pin: '1111',
    branchIds: [JURIQUILLA_BRANCH_ID],
  },
  {
    name: 'Test Cashier',
    role: 'cashier' as const,
    pin: '2222',
    branchIds: [JURIQUILLA_BRANCH_ID],
  },
  {
    name: 'Test Cook',
    role: 'cook' as const,
    pin: '3333',
    branchIds: [], // Sin asignación → acceso a todas las active
  },
];

async function main() {
  const supabase = createSupabaseServiceClient();

  console.log('🚀 Creando test employees en Miztli Pardo...\n');

  for (const emp of TEST_EMPLOYEES) {
    const pinHash = await hashPin(emp.pin);

    const { data, error: insertError } = await supabase
      .from('employees_v2')
      .insert({
        tenant_id: MIZTLI_TENANT_ID,
        name: emp.name,
        role: emp.role,
        pin_hash: pinHash,
        status: 'activo',
        fingerprint_enrolled: false,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`❌ Error inserting ${emp.name}:`, insertError.message);
      continue;
    }

    const employeeId = (data as { id: string }).id;
    console.log(`✅ Created ${emp.name} (${emp.role}) | ID: ${employeeId}`);
    console.log(`   PIN: ${emp.pin}`);

    // Asignar branches
    if (emp.branchIds.length > 0) {
      const { error: branchError } = await supabase.from('employee_branches').insert(
        emp.branchIds.map((branchId) => ({
          employee_id: employeeId,
          branch_id: branchId,
        })),
      );

      if (branchError) {
        console.error(`   ⚠️  Error assigning branches:`, branchError.message);
      } else {
        console.log(`   ✓ Assigned to ${emp.branchIds.length} branch(es)`);
      }
    } else {
      console.log(`   ✓ No explicit branch assignment (can access all active)`);
    }
    console.log();
  }

  console.log('✨ Done!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
