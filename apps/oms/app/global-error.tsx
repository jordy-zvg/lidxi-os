'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error?.digest, error?.message);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F6F9FC',
          color: '#0A2540',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <p style={{ fontWeight: 700, letterSpacing: '0.1em', marginBottom: 24, color: '#7C71FF' }}>
          KOBI
        </p>
        <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 600 }}>Algo salió mal.</h1>
        <p style={{ marginTop: 12, maxWidth: 420, fontSize: '14px', opacity: 0.6 }}>
          Estamos enterados del problema y trabajando en solucionarlo. Si esto persiste, escríbenos.
        </p>
        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <a
            href="/admin/inicio"
            style={{
              background: '#7C71FF',
              color: 'white',
              borderRadius: 999,
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Volver al panel
          </a>
          <a
            href="/contacto"
            style={{
              border: '1px solid rgba(10,37,64,0.15)',
              background: 'white',
              color: '#0A2540',
              borderRadius: 999,
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Contactar soporte
          </a>
          <button
            type="button"
            onClick={reset}
            style={{
              background: 'transparent',
              border: 0,
              color: 'rgba(10,37,64,0.6)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
