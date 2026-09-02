'use client';

import type { ReceiptOrder } from '@kobi/printing';
import { useState } from 'react';
import {
  DEFAULT_PAPER_WIDTH_MM,
  KitchenTicketPrint,
  type PaperWidthMm,
  printComanda,
  printCss,
} from './KitchenTicketPrint';

/**
 * Envoltorio de verificación para la comanda imprimible.
 *
 * Muestra la comanda a escala real sobre la pantalla, con un botón de imprimir
 * y la lista de verificación física en su orden exacto. Todo lo que no es la
 * comanda lleva `kobi-comanda-no-print` y desaparece en el papel.
 *
 * El selector de ancho existe para comparar 58 y 80 con los mismos datos: es la
 * única forma de ver, antes de gastar papel, dónde envuelve cada uno.
 */

/** Ancho útil por rollo — el mismo dato que consume printCss(). */
const ANCHOS: Record<PaperWidthMm, { label: string; util: number }> = {
  58: { label: '58 mm', util: 48 },
  80: { label: '80 mm', util: 72 },
};

const OPCIONES: PaperWidthMm[] = [58, 80];

export const KitchenTicketPrintPreview = ({
  order,
  tenantName,
  branchName,
}: {
  order: ReceiptOrder;
  tenantName: string;
  branchName?: string;
}) => {
  const [paperWidth, setPaperWidth] = useState<PaperWidthMm>(DEFAULT_PAPER_WIDTH_MM);
  const activo = ANCHOS[paperWidth];

  return (
    <>
      {/* Estilos de impresión acoplados a la comanda: no se tocan los globales,
          que son compartidos por marketing, admin y operación. La clave fuerza
          a React a reemplazar el nodo al cambiar de ancho, en vez de intentar
          parchear el CSS en sitio. */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS estático propio, sin entrada de usuario. */}
      <style key={paperWidth} dangerouslySetInnerHTML={{ __html: printCss(paperWidth) }} />

      <div className="kobi-comanda-no-print min-h-screen bg-canvas p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-lg font-semibold text-ink">Prueba de impresión de comanda</h1>
          <p className="mt-1 text-sm text-ink-400">
            Página de verificación de hardware. Los datos son falsos y no se guarda nada.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink-300">Ancho de rollo:</span>
            <div className="inline-flex overflow-hidden rounded-md border border-line">
              {OPCIONES.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPaperWidth(w)}
                  className={`h-9 px-4 text-sm font-medium transition-colors ${
                    w === paperWidth
                      ? 'bg-brand text-white'
                      : 'bg-surface text-ink-200 hover:bg-surface-2'
                  }`}
                >
                  {ANCHOS[w].label}
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-400">
              {activo.util} mm útiles
              {paperWidth === DEFAULT_PAPER_WIDTH_MM ? ' · configurado en cocina' : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={() => printComanda(paperWidth)}
            className="mt-4 h-11 rounded-md bg-brand px-5 text-sm font-medium text-white hover:opacity-90"
          >
            Imprimir comanda de prueba ({activo.label})
          </button>

          <ol className="mt-6 space-y-2 text-sm text-ink-300">
            <li>
              1. Verifica la versión de Chrome en chrome://version (necesitas 144 o superior).
            </li>
            <li>2. Imprime una página de prueba desde Windows. Si falla aquí, es el driver.</li>
            <li>
              3. Deja la impresora térmica como predeterminada y <strong>desactiva</strong>{' '}
              &ldquo;Permitir que Windows administre mi impresora predeterminada&rdquo;. Si la
              predeterminada es &ldquo;Guardar como PDF&rdquo;, el trabajo se guarda en Descargas en
              silencio y nadie lo nota.
            </li>
            <li>
              4. Imprime con Ctrl+P desde Chrome, todavía con diálogo, para confirmar el ancho.
            </li>
            <li>
              5. Aplica la política SilentPrintingEnabled y verifícala en chrome://policy. Repite
              Ctrl+P: debe salir papel sin diálogo.
            </li>
            <li>6. Usa el botón de arriba: la comanda debe salir sola y legible a un metro.</li>
            <li>7. Reinicia la PC y repite el paso 6 sin tocar nada más.</li>
          </ol>

          <p className="mt-4 text-xs text-ink-400">
            Al aplicar la política, Chrome mostrará &ldquo;Tu navegador está gestionado por tu
            organización&rdquo;. Es normal e inofensivo.
          </p>

          <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Vista previa (tamaño real, {activo.util} mm de ancho útil)
          </p>
        </div>
      </div>

      {/* En pantalla se ve encuadrada; al imprimir, el CSS la reposiciona en 0,0. */}
      <div className="kobi-comanda-preview-frame mx-auto w-fit border border-line bg-white p-3 shadow-sm">
        <KitchenTicketPrint order={order} tenantName={tenantName} branchName={branchName} />
      </div>
    </>
  );
};
