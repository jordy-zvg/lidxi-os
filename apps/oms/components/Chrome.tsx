import { getOperationSession } from '@/lib/operations/session-tenant';
import { KobiWordmark, Topbar } from '@kobi/ui';
import type { ReactNode } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { ChromeSidebarNav } from './ChromeSidebarNav';
import { ClockOverlayProvider } from './ClockOverlayProvider';
import { EntradaSalidaButton } from './EntradaSalidaButton';
import { DesktopSidebar, MobileNavButton, MobileNavDrawer, MobileNavProvider } from './MobileNav';
import { OperationSessionProvider } from './OperationSessionProvider';
import { SessionMenu } from './SessionMenu';
import { OpeningFloatGate } from './caja/OpeningFloatGate';

/**
 * Shell operativo. Server component async desde Sprint 19 (Fase 3a): lee la
 * sesión de empleado en el server y la baja al cliente vía
 * OperationSessionProvider — la cookie es httpOnly, el cliente no puede leerla.
 *
 * El gate de fondo inicial solo se monta cuando la sucursal activa maneja
 * efectivo (branches_v2.handles_cash). El TURNO se conserva intacto: la sesión
 * sigue exigiendo PIN y requireEmployeeContext() resuelve igual que siempre;
 * lo que se apaga es el arqueo, no el turno. Poner el flag en true restituye
 * el comportamiento anterior sin tocar código.
 *
 * Nota: leer cookies aquí vuelve dinámicas TODAS las rutas que montan Chrome
 * (incluye /pos, /kds y el grupo de reportes, antes prerenderizables). Nada
 * depende de que sean estáticas y el middleware ya exige la cookie.
 */
export const Chrome = async ({ children }: { children: ReactNode }) => {
  const session = await getOperationSession();

  return (
    <OperationSessionProvider session={session}>
      <MobileNavProvider>
        <ClockOverlayProvider>
          {session?.handlesCash ? <OpeningFloatGate /> : null}
          <div className="flex h-screen overflow-hidden">
            <DesktopSidebar brand={<KobiWordmark size="md" />}>
              <ChromeSidebarNav />
            </DesktopSidebar>
            <MobileNavDrawer />
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
              <Topbar
                breadcrumbs={
                  <div className="flex items-center gap-2">
                    <MobileNavButton />
                    <Breadcrumb />
                  </div>
                }
                actions={<EntradaSalidaButton />}
                session={<SessionMenu />}
              />
              <main className="flex-1 overflow-y-auto bg-canvas p-3 sm:p-4 lg:p-6">{children}</main>
            </div>
          </div>
        </ClockOverlayProvider>
      </MobileNavProvider>
    </OperationSessionProvider>
  );
};
