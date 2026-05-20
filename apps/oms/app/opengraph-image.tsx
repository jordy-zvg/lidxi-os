import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Kobi — El sistema operativo de la cocina moderna';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG image generada con Satori (next/og, edge runtime).
 *
 * Diseño: fondo indigo #635BFF full-bleed + wordmark Inter SemiBold en
 * blanco + tagline + url. No usa el PNG del wordmark porque el archivo
 * kobi-wordmark.png es indigo sobre transparente: sobre fondo indigo
 * desaparece. La cuchara integrada en la O es un detalle del login hero,
 * no del OG donde el thumbnail mide ~300px de ancho.
 */
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#635BFF',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          fontSize: 180,
          fontWeight: 600,
          color: '#FFFFFF',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        Kobi
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 32,
          fontSize: 36,
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.75)',
          letterSpacing: 0,
        }}
      >
        El sistema operativo de la cocina moderna
      </div>

      {/* URL — esquina inferior derecha */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          right: 64,
          fontSize: 20,
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        kobi.mx
      </div>
    </div>,
    { ...size },
  );
}
