# Employee Branch Assignment — Multi-Sucursal

## Overview

Empleados en Kobi pueden ser asignados a sucursales específicas, limitando su acceso operativo solo a esas branches. Sin asignación explícita, pueden acceder a todas las sucursales activas (backwards compatibility).

## Flow

### Admin: Crear o editar empleado

1. **Equipo screen** (`/admin/equipo`)
   - Formulario para create/edit employee
   - Solo si hay 2+ sucursales: mostrar checkbox list de branches asignadas
   - Si no marcas ninguna: empleado accede a todas las active (default)

2. **Server Action**: `updateEmployee(id, input)`
   - Valida nombre, rol, PIN (si aplica)
   - Si `input.branchIds` está definida, actualiza assignments via `setEmployeeBranches()`
   - `undefined` = no tocar; `[]` = limpiar todas; `[id1, id2]` = asignar esas

### Employee: Login (PIN entry)

1. **Login screen** (`/app/(auth)/login`)
   - Employee ingresa PIN
   - Server action `activatePosStation(pin, tenantId, forceBranchId?)`

2. **Resolve candidate branches**
   - `resolveCandidateBranches(employeeId, tenantId)` retorna:
     - Si employee tiene asignaciones explícitas: solo esas (filtradas por status=active)
     - Si no: todas las sucursales active del tenant

3. **Three outcomes**:
   - **1 candidate**: Activate automáticamente, no UI selector
   - **2+ candidates**: Return `needsBranchSelection`, mostrar radio list en UI
   - **0 candidates**: Error "No hay sucursales activas asignadas"

4. **Branch selection UI** (si aplica)
   - Radio buttons con nombre de cada branch candidata
   - Click: server action `activatePosStationWithBranch(pin, tenantId, branchId)`
   - Re-valida que branchId está en candidatas
   - Si válida: emite JWT con `branch_id` claim

### JWT Claims

Sesión empleado contiene:

```typescript
{
  sub: employeeId,                  // employees_v2.id
  employee_role: role,              // 'manager' | 'cashier' | 'cook' | 'courier'
  tenant_id: tenantId,              // restaurants.tenant_id
  branch_id: activeBranchId,        // branches_v2.id elegida en login
  restaurant_id: restaurantId,      // restaurants.id
  station_id: stationId,            // computed from device
  pos_session_id: shiftId,          // shifts.id de la activación
}
```

Todas las operaciones en POS filtra por `branch_id` del JWT.

## Database

### Tables

- **employees_v2**: full_name, role, pin_hash, status, etc.
- **employee_branches**: many-to-many (employee_id_v2, branch_id_v2, tenant_id)
- **branches_v2**: id, name, status (active/inactive)

### Queries

- `listBranchesForEmployee(supabase, employeeId, tenantId)`: Retorna branch_id_v2[] asignadas
- `setEmployeeBranches(supabase, employeeId, tenantId, branchIds)`: Diff-based update (delete old, insert new)
- `resolveCandidateBranches(supabase, employeeId, tenantId)`: Con backwards compat logic

## Testing

### Test Employees (Miztli Pardo)

Created in `scripts/create-test-employees.mjs`:

| Name | Role | PIN | Branches |
|------|------|-----|----------|
| Test Manager | manager | 1111 | Juriquilla only |
| Test Cashier | cashier | 2222 | Juriquilla only |
| Test Cook | cook | 3333 | None (all active) |

### Test Scenarios

1. **Manager (1111)**
   - Login: Should resolve to Juriquilla only (1 candidate)
   - Auto-activate, no selector

2. **Cashier (2222)**
   - Same as manager (1 candidate)

3. **Cook (3333)**
   - No branches assigned
   - Should resolve to all active branches
   - If 2+ active: show selector
   - Can pick any active branch and operate there

4. **Invalid branch attempt**
   - Try to login with a `forceBranchId` not in candidates
   - Error: "Esta tablet está vinculada a una sucursal que no puedes operar"

## Backwards Compatibility

Employees created before branch assignment feature (no rows in employee_branches) can operate in any active branch. This is the default behavior when explicit assignments are absent.

To restrict an employee to specific branches:
- Set their assignments via admin UI or `setEmployeeBranches()`
- Once any assignment exists, they can ONLY access those branches

To "unrestrict" (return to all-active):
- Clear all branches: `setEmployeeBranches(employeeId, tenantId, [])`
- Result: empty employee_branches rows → can access all active branches again
