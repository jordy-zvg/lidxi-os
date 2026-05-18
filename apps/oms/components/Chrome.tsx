import { KobiWordmark, Sidebar, Topbar } from '@kobi/ui';
import type { ReactNode } from 'react';
import { Breadcrumb } from './Breadcrumb';
import { ChromeSidebarNav } from './ChromeSidebarNav';
import { ClockOverlayProvider } from './ClockOverlayProvider';
import { EntradaSalidaButton } from './EntradaSalidaButton';
import { SessionMenu } from './SessionMenu';

export const Chrome = ({ children }: { children: ReactNode }) => (
  <ClockOverlayProvider>
    <div className="flex h-screen overflow-hidden">
      <Sidebar brand={<KobiWordmark size="md" />}>
        <ChromeSidebarNav />
      </Sidebar>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          breadcrumbs={<Breadcrumb />}
          actions={<EntradaSalidaButton />}
          session={<SessionMenu />}
        />
        <main className="flex-1 overflow-y-auto bg-canvas p-6">{children}</main>
      </div>
    </div>
  </ClockOverlayProvider>
);
