import { KobiWordmark, Topbar } from '@kobi/ui';
import type { ReactNode } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { ChromeSidebarNav } from './ChromeSidebarNav';
import { ClockOverlayProvider } from './ClockOverlayProvider';
import { EntradaSalidaButton } from './EntradaSalidaButton';
import { DesktopSidebar, MobileNavButton, MobileNavDrawer, MobileNavProvider } from './MobileNav';
import { SessionMenu } from './SessionMenu';
import { OpeningFloatGate } from './caja/OpeningFloatGate';

export const Chrome = ({ children }: { children: ReactNode }) => (
  <MobileNavProvider>
    <ClockOverlayProvider>
      <OpeningFloatGate />
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
);
