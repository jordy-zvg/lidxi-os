import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Kobi — El sistema operativo de la cocina moderna';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
        backgroundColor: '#F6F9FC',
        fontFamily: 'Inter, system-ui, sans-serif',
        gap: 24,
      }}
    >
      <span
        style={{
          fontSize: 120,
          fontWeight: 600,
          color: '#635BFF',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        Kobi
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: '#425466',
          letterSpacing: 0,
        }}
      >
        El sistema operativo de la cocina moderna
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: 48,
          fontSize: 20,
          color: '#8898AA',
        }}
      >
        kobi.com.mx
      </span>
    </div>,
    { ...size },
  );
}
