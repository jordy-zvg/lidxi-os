import { cn } from '@kobi/shared';
import { IconTool } from '@tabler/icons-react';

/**
 * Placeholder usado por todas las rutas del OMS que aún no se han implementado.
 * Permite tener la navegación funcional desde día uno. Cuando una pantalla
 * pasa de stub a implementación real, simplemente se reemplaza el contenido
 * de su `page.tsx`.
 */
export interface PageStubProps {
  title: string;
  description?: string;
  className?: string;
}

export const PageStub = ({ title, description, className }: PageStubProps) => (
  <div
    className={cn(
      'flex h-full flex-col items-center justify-center gap-3 text-center text-ink-300',
      className,
    )}
  >
    <IconTool size={32} />
    <div>
      <h1 className="text-lg font-semibold text-ink-100">{title}</h1>
      <p className="mt-1 text-sm">
        {description ?? 'En construcción — esta pantalla se implementará a continuación.'}
      </p>
    </div>
  </div>
);
