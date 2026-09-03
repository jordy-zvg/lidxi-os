import type { ReceiptOrder } from '@kobi/printing';
import { CHANNELS, formatTimeMX } from '@kobi/shared';

/**
 * Comanda de cocina imprimible en navegador. Soporta rollo de 58mm y de 80mm.
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
 * Reglas de impresión que rompen esto si se ignoran (ver printCss):
 *   - Colores de fondo NO se imprimen por defecto → diseño en blanco y negro.
 *   - El ancho útil es menor que el nominal del rollo (zona muerta del cabezal).
 *   - Fuentes del sistema: una webfont que no carga cambia las métricas.
 */

export type PaperWidthMm = 58 | 80;

/**
 * Ancho de papel por defecto.
 *
 * La cocina de Miztli Burguers tiene una Ykioea de 58mm. Es una constante y no
 * una columna de `branches_v2` a propósito: hoy hay UNA impresora, y una
 * columna antes de que existan dos configuraciones distintas es especulación
 * que hay que migrar igual cuando llegue el caso real. El día que una sucursal
 * tenga otro rollo, esto pasa a dato — el `paperWidth` del componente ya está
 * parametrizado, así que ese cambio no toca layout.
 */
export const DEFAULT_PAPER_WIDTH_MM: PaperWidthMm = 58;

/**
 * Medidas por ancho de rollo. UNA sola plantilla de CSS las consume: dos hojas
 * de estilo separadas duplicarían cada regla de jerarquía y derivarían en
 * cuanto alguien tocara una sola.
 *
 * Lo que cede a 58mm y por qué:
 *   - El ancho útil pasa de 72mm a 48mm: un tercio menos. A 3.2mm de base
 *     caben ~30 caracteres por línea contra ~45 en 80mm (aprox., con avance
 *     medio de 0.5em), así que los nombres largos envuelven mucho antes.
 *   - Baja el folio (9mm → 7mm): a 9mm un folio de 8 caracteres desborda un
 *     rollo de 48mm. Sigue siendo, con diferencia, el elemento más grande.
 *   - Baja el nombre del ítem (4.4mm → 4mm) y el modificador (3.4mm → 3.1mm)
 *     MANTENIENDO la razón entre ambos (1.29 en los dos anchos): el criterio
 *     era que el modificador nunca pese lo mismo que el platillo, y esa
 *     distancia relativa es justo lo que no se puede sacrificar.
 *   - La sangría del modificador pasa de 4mm a 2.5mm — a 48mm, 4mm de sangría
 *     se come el 8% de la línea. Se conserva sangría porque es lo que marca la
 *     subordinación; solo se abarata.
 *   - Lo que NO cede: negro sobre blanco, el folio como elemento dominante, la
 *     nota con su barra lateral, y que un ítem no se parta entre páginas.
 */
interface PaperSpec {
  /** Ancho nominal del rollo, para `@page size`. */
  rollMm: number;
  /** Ancho imprimible real (el resto es zona muerta del cabezal). */
  printableMm: number;
  baseMm: number;
  /** Una sola línea discreta de identidad (negocio · sucursal). */
  negocioMm: number;
  canalMm: number;
  horaMm: number;
  folioMm: number;
  folioLabelMm: number;
  clienteMm: number;
  itemNombreMm: number;
  /** Ancho de la columna fija de cantidad, para que no quede huérfana. */
  qtyColMm: number;
  /** Separación ENTRE platillos. Debe superar con claridad a modGapMm. */
  itemGapMm: number;
  modMm: number;
  /** Separación INTERNA, del platillo a sus modificadores. */
  modGapMm: number;
  /** La nota tiene tamaño propio: es lo más consecuente de la comanda. */
  notaMm: number;
  pieMm: number;
}

const PAPER: Record<PaperWidthMm, PaperSpec> = {
  58: {
    rollMm: 58,
    printableMm: 48,
    baseMm: 3.2,
    negocioMm: 2.8,
    canalMm: 3.1,
    horaMm: 3.4,
    folioMm: 7,
    folioLabelMm: 2.6,
    clienteMm: 3.2,
    itemNombreMm: 4,
    qtyColMm: 7,
    itemGapMm: 5.5,
    modMm: 3.1,
    modGapMm: 0.2,
    notaMm: 3.6,
    pieMm: 2.8,
  },
  80: {
    rollMm: 80,
    printableMm: 72,
    baseMm: 3.2,
    negocioMm: 3,
    canalMm: 3.4,
    horaMm: 3.6,
    folioMm: 9,
    folioLabelMm: 2.8,
    clienteMm: 3.4,
    itemNombreMm: 4.4,
    qtyColMm: 8,
    itemGapMm: 6,
    modMm: 3.4,
    modGapMm: 0.2,
    notaMm: 3.9,
    pieMm: 3,
  },
};

/**
 * Alto de página de reserva, en mm, cuando todavía no se ha medido la comanda.
 *
 * Generoso a propósito: si la medición falla, preferimos alimentar papel de más
 * a cortar contenido. Una comanda típica ronda los 100-140mm.
 */
const FALLBACK_PAGE_HEIGHT_MM = 300;

/**
 * CSS de impresión para un ancho de rollo. Se inyecta en la página que imprime;
 * no toca los estilos globales, compartidos por marketing, admin y operación.
 *
 * OJO con `@page size` (esto costó una tarde y habría costado un rollo de papel):
 * la gramática CSS admite `<length>{1,2}` o `auto`, pero NO mezclarlos. El
 * `size: 80mm auto` que tenía este archivo era inválido, así que el navegador
 * descartaba la declaración entera y imprimía en tamaño Carta — verificado
 * imprimiendo a PDF: 215.9mm de ancho en vez de 80. Por eso el alto se pasa
 * SIEMPRE explícito, en milímetros.
 */
export const printCss = (
  width: PaperWidthMm = DEFAULT_PAPER_WIDTH_MM,
  pageHeightMm: number = FALLBACK_PAGE_HEIGHT_MM,
): string => {
  const p = PAPER[width];
  return `
@page {
  size: ${p.rollMm}mm ${pageHeightMm}mm;
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
    width: ${p.printableMm}mm;
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
  /* En papel vuelve al flujo normal: si conservara el desplazamiento de
     pantalla, la comanda se imprimiría fuera de la página. */
  .kobi-comanda-solo-impresion {
    position: static !important;
    left: auto !important;
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

/* Montada para imprimir, invisible en pantalla.
   Fuera de la vista con posición absoluta y NO con display:none: un elemento
   con display:none tiene offsetHeight 0, así que printComanda() no podría
   medirlo y cada comanda alimentaría los 300mm de reserva. Absoluta y
   desplazada, se maquetea de verdad y no ocupa espacio en la captura. */
.kobi-comanda-solo-impresion {
  position: absolute;
  left: -10000px;
  top: 0;
}

.kobi-comanda {
  /* Pila de sistema: una webfont que no carga cambiaría las métricas
     respecto a lo que se probó en papel. */
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  width: ${p.printableMm}mm;
  color: #000;
  background: #fff;
  /* Tamaño base en mm, no rem: no debe depender del font-size del root. */
  font-size: ${p.baseMm}mm;
  line-height: 1.25;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Identidad del negocio en UNA línea discreta. El cocinero no necesita que
   se le recuerde dónde trabaja; el espacio vertical de un rollo de 48mm sí
   hace falta. Antes eran dos bloques (nombre en grande a varias líneas +
   sucursal debajo) que se comían ~10mm de papel. */
.kobi-comanda__negocio {
  text-align: center;
  font-size: ${p.negocioMm}mm;
  font-weight: 400;
  margin: 0;
  overflow-wrap: break-word;
}

.kobi-comanda__sep {
  border: 0;
  border-top: 0.4mm dashed #000;
  margin: 2mm 0;
}

/* El badge quedó solo en su fila al bajar la hora al bloque del folio, así
   que se centra con el resto en vez de flotar contra el margen izquierdo. */
.kobi-comanda__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2mm;
}

/* Badge de canal: borde + texto negro, NUNCA fondo de color.
   Los navegadores no imprimen backgrounds por defecto y saldría invisible. */
.kobi-comanda__canal {
  font-size: ${p.canalMm}mm;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2mm;
  border: 0.4mm solid #000;
  border-radius: 1mm;
  padding: 0.6mm 1.6mm;
  white-space: nowrap;
}

/* La hora baja al bloque del folio y se etiqueta. Arriba competía con el
   badge de canal por la misma fila y se leía como decoración.
   Es la hora de ENTRADA, no el tiempo transcurrido: el papel es estático y
   un "hace 3 min" impreso queda desactualizado al minuto siguiente — y en
   una reimpresión mentiría directamente. Con la hora de entrada, el cocinero
   la compara contra el reloj de la pared y siempre acierta. */
.kobi-comanda__hora {
  text-align: center;
  font-size: ${p.horaMm}mm;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  margin: 1.5mm 0 0;
}

/* El elemento más grande de la comanda: es lo que canta el repartidor. */
.kobi-comanda__folio {
  font-size: ${p.folioMm}mm;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  letter-spacing: 0.4mm;
  margin: 2mm 0 0;
  word-break: break-all;
}

.kobi-comanda__folio-label {
  text-align: center;
  font-size: ${p.folioLabelMm}mm;
  text-transform: uppercase;
  letter-spacing: 0.3mm;
  margin: 1.5mm 0 0;
}

.kobi-comanda__cliente {
  text-align: center;
  font-size: ${p.clienteMm}mm;
  margin: 1.5mm 0 0;
  overflow-wrap: break-word;
}

.kobi-comanda__items {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Un ítem nunca se parte entre páginas: la cocina leería medio platillo.
   La separación ENTRE platillos es varias veces la interna (modGapMm), para
   que cada uno se lea como un bloque y no como una lista plana. Antes ambas
   eran casi iguales y los modificadores flotaban entre dos platillos. */
.kobi-comanda__item {
  break-inside: avoid;
  page-break-inside: avoid;
  margin: 0 0 ${p.itemGapMm}mm;
}

.kobi-comanda__item:last-child {
  margin-bottom: 0;
}

/* Cantidad y nombre en DOS COLUMNAS, no en un párrafo corrido.
   Un nombre largo ("Hamburguesa de la casa con doble carne y tocino")
   envuelve a tres líneas en 48mm, y en un párrafo corrido la cantidad
   quedaba huérfana al principio de la primera línea, visualmente tragada
   por el nombre. Con la cantidad en columna fija, el nombre envuelve dentro
   de la suya y todas sus líneas quedan alineadas bajo la primera.

   Se descartó truncar (la cocina necesita el nombre completo: es la
   restricción explícita) y también reducir el cuerpo en nombres largos, que
   haría del platillo más complejo el más difícil de leer — justo al revés
   de lo que conviene. */
.kobi-comanda__item-nombre {
  display: flex;
  gap: 1mm;
  font-size: ${p.itemNombreMm}mm;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.kobi-comanda__item-qty {
  flex: 0 0 ${p.qtyColMm}mm;
  font-variant-numeric: tabular-nums;
}

.kobi-comanda__item-texto {
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
}

/* Modificadores: subordinados y claramente distintos del nombre.
   Confundir "sin cebolla" con un ítem es el error caro. Se alinean con la
   columna del nombre (no con la de la cantidad), así que la sangría sale de
   qtyColMm y no de un valor suelto. */
.kobi-comanda__mod {
  font-size: ${p.modMm}mm;
  font-weight: 400;
  line-height: 1.2;
  margin: ${p.modGapMm}mm 0 0 ${p.qtyColMm + 1}mm;
  overflow-wrap: break-word;
}

/* La nota es lo más consecuente que lleva la comanda — en los datos de
   prueba, una alergia. Antes tenía el tamaño de un modificador y solo una
   barra lateral, así que pesaba igual que un "extra queso". Ahora tiene
   cuerpo propio (mayor que el modificador), recuadro completo y aire
   alrededor: se ve como un bloque aparte antes de leerse.
   Recuadro y no fondo negro: los navegadores no imprimen fondos de forma
   fiable y la nota es justo lo que no puede desaparecer.
   Va a ancho completo, sin la sangría de los modificadores: sangrada quedaba
   en 40mm y se partía en seis líneas, y además romper la columna del nombre
   es justo lo que la distingue de un modificador más. */
.kobi-comanda__nota {
  font-size: ${p.notaMm}mm;
  font-weight: 700;
  line-height: 1.25;
  margin: 1.6mm 0 0;
  padding: 1.2mm 1.6mm;
  border: 0.5mm solid #000;
  overflow-wrap: break-word;
}

.kobi-comanda__pie {
  text-align: center;
  font-size: ${p.pieMm}mm;
  margin: 0;
}

/* Alimenta papel antes del corte para que la comanda se pueda arrancar
   sin cortar la última línea. */
.kobi-comanda__feed {
  height: 12mm;
}
`;
};

/**
 * CSS del ancho por defecto. Se conserva el nombre exportado anterior para no
 * romper importadores que no necesitan elegir ancho.
 */
export const PRINT_CSS = printCss();

/** Id del <style> que lleva el @page medido. Uno solo por documento. */
const PAGE_SIZE_STYLE_ID = 'kobi-comanda-page-size';

/**
 * Imprime la comanda montada en el documento, ajustando el alto de página al
 * alto real del contenido.
 *
 * Por qué se mide en vez de fijar un alto: el rollo térmico es continuo y el
 * driver alimenta hasta el largo de página declarado. Con un alto fijo de
 * 300mm, cada comanda de 12cm desperdiciaría 18cm de papel en blanco.
 *
 * Devuelve false si el navegador rechaza imprimir (bloqueo de popup, sandbox).
 * El llamador decide qué avisar — nunca debe interpretarse como que el pedido
 * no se guardó.
 */
export const printComanda = (width: PaperWidthMm = DEFAULT_PAPER_WIDTH_MM): boolean => {
  try {
    const nodo = document.querySelector<HTMLElement>('.kobi-comanda');
    // 96 px por pulgada es la referencia CSS, no la del monitor.
    const altoMm = nodo ? (nodo.offsetHeight * 25.4) / 96 : 0;
    // +4mm de holgura: el redondeo a la baja cortaría la última línea.
    const pageHeightMm = altoMm > 0 ? Math.ceil(altoMm) + 4 : FALLBACK_PAGE_HEIGHT_MM;

    let styleEl = document.getElementById(PAGE_SIZE_STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = PAGE_SIZE_STYLE_ID;
    }
    // Solo la regla @page: el resto del CSS ya está inyectado por el componente.
    styleEl.textContent = `@page { size: ${PAPER[width].rollMm}mm ${pageHeightMm}mm; margin: 0; }`;
    // Se re-anexa al FINAL del body en cada impresión, no al <head>: el
    // componente renderiza su <style> dentro del body, y con igual
    // especificidad gana la regla que aparece después en el documento. En el
    // head, el @page de reserva (300mm) ganaría y cada comanda alimentaría
    // 15cm de papel en blanco.
    document.body.appendChild(styleEl);

    window.print();
    return true;
  } catch {
    return false;
  }
};

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
      <p className="kobi-comanda__negocio">
        {tenantName}
        {branchName ? ` · ${branchName}` : ''}
      </p>

      <hr className="kobi-comanda__sep" />

      <div className="kobi-comanda__meta">
        <span className="kobi-comanda__canal">{channel.short}</span>
      </div>

      <p className="kobi-comanda__folio-label">Pedido</p>
      <p className="kobi-comanda__folio">{folio}</p>
      {/* El nombre del cliente NO es para la cocina, que no lo usa: es para
          identificar la comanda. El repartidor llega preguntando por él, y
          con varias comandas colgadas es lo que las distingue. No quitarlo
          para recuperar espacio vertical. */}
      {order.customer?.name && <p className="kobi-comanda__cliente">{order.customer.name}</p>}
      <p className="kobi-comanda__hora">Entró {formatTimeMX(order.createdAt)}</p>

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
                <span className="kobi-comanda__item-qty">{item.qty}×</span>
                <span className="kobi-comanda__item-texto">{item.name}</span>
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
