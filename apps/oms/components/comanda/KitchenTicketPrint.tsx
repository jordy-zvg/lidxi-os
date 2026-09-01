import type { ReceiptOrder } from '@kobi/printing';
import { CHANNELS, formatTimeMX } from '@kobi/shared';

/**
 * Comanda de cocina imprimible en navegador (rollo de 80mm).
 *
 * Por qué existe además de `@kobi/printing`:
 *   Las plantillas de ese package son JSX de `react-thermal-printer`: se
 *   renderizan a BYTES ESC/POS, no a DOM, y viajan por TCP al puerto 9100.
 *   En esta topología (app en Railway, impresora USB detrás del NAT de la
 *   cocina) ese camino no aplica: se imprime desde el navegador con el driver
 *   de Windows. El package queda intacto para el día que haya impresora de red.
 *
 *   Lo que SÍ se reutiliza es el contrato de datos: `ReceiptOrder` se importa,
 *   no se duplica. La jerarquía visual se copia de `kitchen-ticket.tsx`.
 *
 * Criterio de legibilidad: un cocinero debe poder leerla a un metro, de reojo,
 * con las manos ocupadas. De ahí los tamaños en mm y la jerarquía marcada.
 *
 * Reglas de impresión que rompen esto si se ignoran (ver PRINT_CSS):
 *   - Colores de fondo NO se imprimen por defecto → diseño en blanco y negro.
 *   - El ancho útil de un rollo de 80mm ronda 72mm, no 80.
 *   - Fuentes del sistema: una webfont que no carga cambia las métricas.
 */

/** Ancho útil real de un rollo de 80mm (el resto es zona muerta del cabezal). */
const PRINTABLE_WIDTH_MM = 72;

export const PRINT_CSS = `
@page {
  size: 80mm auto;
  margin: 0;
}

@media print {
  /* El layout (operations) envuelve todo en <Chrome>: sidebar, topbar,
     breadcrumb, botones. Nada de eso puede llegar al papel. Se oculta todo
     y se re-muestra solo la comanda y su cadena de ancestros. */
  body * {
    visibility: hidden;
  }
  .kobi-comanda,
  .kobi-comanda * {
    visibility: visible;
  }
  .kobi-comanda {
    position: absolute;
    top: 0;
    left: 0;
    width: ${PRINTABLE_WIDTH_MM}mm;
    margin: 0;
    padding: 0;
  }
  /* La térmica es monocroma, pero si alguien imprime a PDF o a láser
     queremos el mismo resultado: negro sobre blanco, sin sorpresas. */
  html, body {
    background: #fff !important;
  }
  .kobi-comanda-no-print {
    display: none !important;
  }
  /* El marco de vista previa es cosmético de pantalla: borde, padding y
     sombra no deben desplazar ni recuadrar la comanda en el papel. */
  .kobi-comanda-preview-frame {
    border: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    width: auto !important;
  }
}

.kobi-comanda {
  /* Pila de sistema: una webfont que no carga cambiaría las métricas
     respecto a lo que se probó en papel. */
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  width: ${PRINTABLE_WIDTH_MM}mm;
  color: #000;
  background: #fff;
  /* Tamaño base en mm, no rem: no debe depender del font-size del root. */
  font-size: 3.2mm;
  line-height: 1.25;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.kobi-comanda__negocio {
  text-align: center;
  font-size: 4.6mm;
  font-weight: 700;
  letter-spacing: 0.3mm;
  text-transform: uppercase;
  margin: 0;
}

.kobi-comanda__sucursal {
  text-align: center;
  font-size: 3mm;
  margin: 0.5mm 0 0;
}

.kobi-comanda__sep {
  border: 0;
  border-top: 0.4mm dashed #000;
  margin: 2mm 0;
}

.kobi-comanda__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2mm;
}

/* Badge de canal: borde + texto negro, NUNCA fondo de color.
   Los navegadores no imprimen backgrounds por defecto y saldría invisible. */
.kobi-comanda__canal {
  font-size: 3.4mm;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2mm;
  border: 0.4mm solid #000;
  border-radius: 1mm;
  padding: 0.6mm 1.6mm;
}

.kobi-comanda__hora {
  font-size: 3.2mm;
  font-variant-numeric: tabular-nums;
}

/* El elemento más grande de la comanda: es lo que canta el repartidor. */
.kobi-comanda__folio {
  font-size: 9mm;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  letter-spacing: 0.4mm;
  margin: 2mm 0 0;
  word-break: break-all;
}

.kobi-comanda__folio-label {
  text-align: center;
  font-size: 2.8mm;
  text-transform: uppercase;
  letter-spacing: 0.3mm;
  margin: 0;
}

.kobi-comanda__cliente {
  text-align: center;
  font-size: 3.4mm;
  margin: 1.5mm 0 0;
}

.kobi-comanda__items {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Un ítem nunca se parte entre páginas: la cocina leería medio platillo. */
.kobi-comanda__item {
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0 0 3mm;
}

/* Cantidad pegada al nombre y del mismo tamaño ("2× Hamburguesa"),
   nunca en letra pequeña aparte. */
.kobi-comanda__item-nombre {
  font-size: 4.4mm;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

/* Modificadores: subordinados y claramente distintos del nombre.
   Confundir "sin cebolla" con un ítem es el error caro. */
.kobi-comanda__mod {
  font-size: 3.4mm;
  font-weight: 400;
  margin: 0.4mm 0 0 4mm;
}

.kobi-comanda__nota {
  font-size: 3.4mm;
  font-weight: 700;
  margin: 0.8mm 0 0 4mm;
  padding-left: 1.6mm;
  border-left: 0.6mm solid #000;
}

.kobi-comanda__pie {
  text-align: center;
  font-size: 3mm;
  margin: 0;
}

/* Alimenta papel antes del corte para que la comanda se pueda arrancar
   sin cortar la última línea. */
.kobi-comanda__feed {
  height: 12mm;
}
`;

export interface KitchenTicketPrintProps {
  order: ReceiptOrder;
  /** Nombre del negocio. Viene del tenant de la sesión — NUNCA hardcodeado. */
  tenantName: string;
  branchName?: string;
}

export const KitchenTicketPrint = ({ order, tenantName, branchName }: KitchenTicketPrintProps) => {
  const channel = CHANNELS[order.channel];
  // El ID corto de Uber (external_id) es lo que canta el repartidor al llegar.
  // Si no existe (pedido sin referencia externa), caemos al id interno.
  const folio = order.externalId ?? order.id.slice(0, 8).toUpperCase();

  return (
    <article className="kobi-comanda">
      <p className="kobi-comanda__negocio">{tenantName}</p>
      {branchName && <p className="kobi-comanda__sucursal">{branchName}</p>}

      <hr className="kobi-comanda__sep" />

      <div className="kobi-comanda__meta">
        <span className="kobi-comanda__canal">{channel.short}</span>
        <span className="kobi-comanda__hora">{formatTimeMX(order.createdAt)}</span>
      </div>

      <p className="kobi-comanda__folio-label">Pedido</p>
      <p className="kobi-comanda__folio">{folio}</p>
      {order.customer?.name && <p className="kobi-comanda__cliente">{order.customer.name}</p>}

      <hr className="kobi-comanda__sep" />

      <ul className="kobi-comanda__items">
        {order.items.map((item, idx) => {
          // El índice ES la identidad correcta aquí: ReceiptOrder no trae id por
          // ítem y dos filas pueden ser idénticas en todos sus campos (el POS
          // parte una línea con nota en una fila por unidad). Una clave derivada
          // del contenido las colapsaría y la comanda perdería ítems — se
          // cocinaría de menos. La lista es estática: se renderiza una vez para
          // imprimir, nunca se reordena ni se edita.
          const itemKey = `${idx}`;
          return (
            <li className="kobi-comanda__item" key={itemKey}>
              <p className="kobi-comanda__item-nombre">
                {item.qty}× {item.name}
              </p>
              {item.modifiers?.map((mod, modIdx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: dos modificadores repetidos ("extra queso" dos veces) deben imprimirse los dos; una clave por contenido los colapsaría. Lista estática de impresión, nunca se reordena.
                <p className="kobi-comanda__mod" key={`${idx}-${modIdx}`}>
                  + {mod}
                </p>
              ))}
              {item.notes && <p className="kobi-comanda__nota">NOTA: {item.notes}</p>}
            </li>
          );
        })}
      </ul>

      <hr className="kobi-comanda__sep" />

      <p className="kobi-comanda__pie">--- preparar lo antes posible ---</p>
      <div className="kobi-comanda__feed" />
    </article>
  );
};
