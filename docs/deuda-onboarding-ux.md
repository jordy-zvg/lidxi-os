# Deuda — onboarding UX

Anotada al cerrar la rama `fix/onboarding-ux` (2026-09-01).

## Asimetría en el mensaje de PIN entre el camino v2 y el legacy

`activateV2` (multi-tenant, `findEmployeeByPinV2` por `tenant_id`) ya distingue
"no hay ningún empleado dado de alta" de "el PIN no coincide": cuenta empleados
activos cuando la búsqueda falla y devuelve `NO_EMPLOYEES_ERROR`, que la UI
renderiza con enlace a `/admin/equipo`.

**El camino legacy NO hace esa distinción.** `apps/oms/lib/auth-actions.ts`
conserva `'PIN incorrecto'` en dos sitios que usan `findEmployeeByPin`
(single-tenant, resuelto por `BRANCH_ID` de env vía `lib/station.ts`):

- `activatePosStation` — path legacy, ~línea 201 tras este cambio.
- `lookupForClock` — reloj checador, ~línea 280.

Ambos devuelven "PIN incorrecto" aunque la sucursal no tenga ningún empleado.

**Por qué no se tocó**: un tenant recién salido del onboarding nunca pasa por
ahí — ese flujo resuelve tenant por sesión Supabase o por cookie de dispositivo
y entra por `activateV2`. El camino legacy exige `BRANCH_ID` en el entorno, que
solo existe en instalaciones single-tenant previas al modelo multi-tenant.

**Cuándo cobrarla**: al retirar el path legacy de activación, o antes si alguna
instalación single-tenant reporta el mismo callejón sin salida. El arreglo es
el mismo patrón: contar empleados de la sucursal cuando la búsqueda falla y
devolver `NO_EMPLOYEES_ERROR` — la constante ya está exportada y la UI ya sabe
renderizarla, así que es solo el conteo en cada sitio.

## El wizard sigue sin crear empleados

Se decidió NO crear un empleado gerente desde el wizard: mezclaría la captura
de credencial operativa (PIN) con el alta de cuenta (Supabase auth), dos capas
que el repo mantiene separadas a propósito. En su lugar el hueco se cubre por
señalización: `ListoSuccess` pone el alta del primer empleado como paso 1, y la
pantalla de PIN explica el estado real con enlace accionable.

Si más adelante se decide que el wizard cree el primer gerente, este documento
es el registro de por qué no se hizo en su momento.
