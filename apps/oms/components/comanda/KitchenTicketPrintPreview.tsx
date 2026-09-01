'use client';

import type { ReceiptOrder } from '@kobi/printing';
import { KitchenTicketPrint, PRINT_CSS } from './KitchenTicketPrint';

/**
 * Envoltorio de verificación para la comanda imprimible.
 *
 * Muestra la comanda a escala real sobre la pantalla, con un botón de imprimir
 * y la lista de verificación física en su orden exacto. Todo lo que no es la
 * comanda lleva `kobi-comanda-no-print` y desaparece en el papel.
 */
export const KitchenTicketPrintPreview = ({
  order,
  tenantName,
  branchName,
}: {
  order: ReceiptOrder;
  tenantName: string;
  branchName?: string;
}) => (
  <>
    {/* Estilos de impresión acoplados a la comanda: no se tocan los globales,
        que son compartidos por marketing, admin y operación. */}
    {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS estático propio, sin entrada de usuario. */}
    <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

    <div className="kobi-comanda-no-print min-h-screen bg-canvas p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-lg font-semibold text-ink">Prueba de impresión de comanda</h1>
        <p className="mt-1 text-sm text-ink-400">
          Página de verificación de hardware. Los datos son falsos y no se guarda nada.
        </p>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 h-11 rounded-md bg-brand px-5 text-sm font-medium text-white hover:opacity-90"
        >
          Imprimir comanda de prueba
        </button>

        <ol className="mt-6 space-y-2 text-sm text-ink-300">
          <li>1. Verifica la versión de Chrome en chrome://version (necesitas 144 o superior).</li>
          <li>2. Imprime una página de prueba desde Windows. Si falla aquí, es el driver.</li>
          <li>
            3. Deja la impresora térmica como predeterminada y <strong>desactiva</strong>{' '}
            &ldquo;Permitir que Windows administre mi impresora predeterminada&rdquo;. Si la
            predeterminada es &ldquo;Guardar como PDF&rdquo;, el trabajo se guarda en Descargas en
            silencio y nadie lo nota.
          </li>
          <li>4. Imprime con Ctrl+P desde Chrome, todavía con diálogo, para confirmar el ancho.</li>
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
          Vista previa (tamaño real, 72 mm de ancho útil)
        </p>
      </div>
    </div>

    {/* En pantalla se ve encuadrada; al imprimir, el CSS la reposiciona en 0,0. */}
    <div className="kobi-comanda-preview-frame mx-auto w-fit border border-line bg-white p-3 shadow-sm">
      <KitchenTicketPrint order={order} tenantName={tenantName} branchName={branchName} />
    </div>
  </>
);
