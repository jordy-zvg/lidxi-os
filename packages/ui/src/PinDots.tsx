import { cn } from '@kobi/shared';

export interface PinDotsProps {
  /** Cantidad de dígitos ingresados. Renderiza `length` dots llenos. */
  value: string;
  /** Cantidad total de dots a renderizar. Default 4. */
  length?: number;
  /** Activa animación de shake (PIN incorrecto). El consumidor controla el toggle. */
  shake?: boolean;
  /** Para feedback de éxito: pinta los dots con color ok. */
  success?: boolean;
  className?: string;
}

export const PinDots = ({
  value,
  length = 4,
  shake = false,
  success = false,
  className,
}: PinDotsProps) => {
  const filled = value.length;
  return (
    <output
      className={cn('flex items-center gap-4', shake && 'animate-shake', className)}
      aria-label={`PIN: ${filled} de ${length} dígitos`}
    >
      {Array.from({ length }).map((_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: dots de PIN, posición fija, sin estado.
          key={i}
          className={cn(
            'h-3.5 w-3.5 rounded-full transition-colors',
            i < filled ? (success ? 'bg-ok' : 'bg-ink') : 'border-2 border-ink-500 bg-transparent',
          )}
        />
      ))}
    </output>
  );
};
