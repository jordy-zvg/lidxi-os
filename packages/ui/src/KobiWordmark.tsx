import { cn } from '@kobi/shared';

const FONT_SIZES: Record<string, { wordmark: string; tagline: string }> = {
  sm: { wordmark: '16px', tagline: '10px' },
  md: { wordmark: '20px', tagline: '12px' },
  lg: { wordmark: '40px', tagline: '24px' },
  xl: { wordmark: '80px', tagline: '48px' },
};

export interface KobiWordmarkProps {
  /** sm=16 / md=20 / lg=40 / xl=80px */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** light = sobre fondo claro (wordmark en brand purple);
   *  dark  = sobre fondo oscuro (wordmark en blanco) */
  variant?: 'light' | 'dark';
  /** Muestra tagline "El sistema operativo de la cocina moderna" debajo */
  withTagline?: boolean;
  className?: string;
}

export const KobiWordmark = ({
  size = 'md',
  variant = 'light',
  withTagline = false,
  className,
}: KobiWordmarkProps) => {
  const { wordmark: wSize, tagline: tSize } =
    FONT_SIZES[size] ?? (FONT_SIZES.md as { wordmark: string; tagline: string });

  const wordmarkColor =
    variant === 'dark'
      ? 'var(--brand-wordmark-color-inverse, #fff)'
      : 'var(--brand-wordmark-color, #635BFF)';

  const taglineColor =
    variant === 'dark'
      ? 'var(--brand-tagline-color-inverse, rgba(255,255,255,0.7))'
      : 'var(--brand-tagline-color, #425466)';

  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span
        style={{
          fontSize: wSize,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: wordmarkColor,
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        Kobi
      </span>
      {withTagline && (
        <span
          style={{
            fontSize: tSize,
            fontWeight: 400,
            letterSpacing: 0,
            color: taglineColor,
            fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
            lineHeight: 1.4,
            marginTop: '0.35em',
          }}
        >
          El sistema operativo de la cocina moderna
        </span>
      )}
    </span>
  );
};
