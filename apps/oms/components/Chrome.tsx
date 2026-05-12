import { Sidebar, Topbar } from '@lidxi/ui';
import { IconSettingsAutomation } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { ChromeSidebarNav } from './ChromeSidebarNav';
import { ClockOverlayProvider } from './ClockOverlayProvider';
import { EntradaSalidaButton } from './EntradaSalidaButton';
import { SessionMenu } from './SessionMenu';

export const Chrome = ({ children }: { children: ReactNode }) => (
  <ClockOverlayProvider>
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        brand={
          <div className="flex items-center gap-2">
            <IconSettingsAutomation size={20} className="text-brand" />
            <span className="font-semibold text-ink">LidxiOS</span>
          </div>
        }
      >
        <ChromeSidebarNav />
      </Sidebar>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          breadcrumbs={<span>LidxiOS</span>}
          actions={<EntradaSalidaButton />}
          session={<SessionMenu />}
        />
        <main className="flex-1 overflow-y-auto bg-canvas p-6">{children}</main>
      </div>
    </div>
  </ClockOverlayProvider>
);
