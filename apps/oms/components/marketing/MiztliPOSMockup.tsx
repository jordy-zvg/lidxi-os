import Image from 'next/image';

/**
 * Mockup del POS de Kobi operando con el menú de Miztli Pardo (dark kitchen real
 * en Roma Norte). Pieza única del home v4 — presentacional, sin estado.
 * Paleta cálida del landing (ver tokens --mkt-* / --cream / --terra en tokens.css).
 */

const CATEGORIES = [
  { label: '🍕 Tradicionales', active: true },
  { label: '✨ Especiales', active: false },
  { label: '👨‍🍳 Gourmet', active: false },
  { label: '🍟 Entradas', active: false },
  { label: '🥤 Bebidas', active: false },
];

const ITEMS = [
  { name: 'Pizza Pepperoni', price: '$209' },
  { name: 'Pizza Hawaiana', price: '$209' },
  { name: 'Pizza Mexicana', price: '$209' },
  { name: 'Pizza 4 Quesos', price: '$259' },
  { name: 'Pizza Mar y Tierra', price: '$325' },
  { name: 'Papas Gajo', price: '$79' },
  { name: 'Aros de cebolla', price: '$69' },
  { name: 'Elote amarillo', price: '$69' },
  { name: 'Coca-Cola 355ml', price: '$30' },
];

const ORDER_TYPES = ['Mostrador', 'Para llevar', 'Envío'];

const TICKET_LINES = [
  { qty: '1×', name: 'Pizza Pepperoni (G)', amt: '$209' },
  { qty: '1×', name: 'Papas Gajo', amt: '$79' },
  { qty: '2×', name: 'Coca-Cola 355ml', amt: '$60' },
];

export function MiztliPOSMockup() {
  return (
    <div className="mx-auto max-w-[980px] overflow-hidden rounded-[22px] border border-[var(--mkt-line)] bg-surface shadow-lg">
      {/* Browser bar */}
      <div className="flex items-center gap-2 border-b border-[var(--mkt-line-soft)] bg-[#fcfaf6] px-[18px] py-[13px]">
        <span className="h-[11px] w-[11px] rounded-full bg-[var(--mkt-line)]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[var(--mkt-line)]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[var(--mkt-line)]" />
        <span className="flex-1 text-center text-[12.5px] font-medium text-[var(--mkt-muted)]">
          kobi.mx · punto de venta
        </span>
        <span className="w-[33px]" />
      </div>

      {/* App grid */}
      <div className="grid min-h-[430px] grid-cols-1 md:grid-cols-[1fr_250px] lg:grid-cols-[150px_1fr_290px]">
        {/* Sidebar (hidden on small) */}
        <div className="hidden flex-col gap-1 border-r border-[var(--mkt-line-soft)] bg-[#fcfaf6] px-3 py-[18px] lg:flex">
          <div className="flex items-center gap-2 px-[10px] pt-[6px] pb-[14px] text-sm font-bold text-[var(--mkt-ink)]">
            <Image
              src="/brand/logo_oficial_letra.png"
              alt="Kobi"
              width={18}
              height={18}
              className="shrink-0 rounded"
            />
            <span className="font-display text-base">Kobi</span>
            <span className="flex items-center gap-[5px] text-[12.5px] font-medium text-[var(--mkt-muted)]">
              <span className="h-[7px] w-[7px] rounded-full bg-miztli" />
              Miztli Pardo
            </span>
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className={`rounded-[9px] px-[10px] py-[9px] text-[13.5px] font-semibold ${
                cat.active ? 'bg-brand-soft text-brand' : 'text-[var(--mkt-ink-soft)]'
              }`}
            >
              {cat.label}
            </div>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-2 content-start gap-3 p-5 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <div
              key={item.name}
              className="rounded-[13px] border border-[var(--mkt-line-soft)] px-[14px] py-[13px]"
            >
              <div className="mb-[7px] text-[13.5px] font-semibold leading-tight text-[var(--mkt-ink)]">
                {item.name}
              </div>
              <div className="font-mono text-[13px] font-semibold text-[var(--mkt-ink-soft)]">
                {item.price}
              </div>
            </div>
          ))}
        </div>

        {/* Ticket */}
        <div className="flex flex-col border-t border-[var(--mkt-line-soft)] bg-[#fcfaf6] p-[18px] md:border-t-0 md:border-l">
          <div className="mb-3 text-[13px] font-bold text-[var(--mkt-ink)]">Pedido nuevo</div>
          <div className="mb-4 flex gap-[6px]">
            {ORDER_TYPES.map((t, i) => (
              <span
                key={t}
                className={`rounded-full border px-[10px] py-[6px] text-[11px] font-bold ${
                  i === 2
                    ? 'border-[var(--mkt-ink)] bg-[var(--mkt-ink)] text-[var(--cream)]'
                    : 'border-[var(--mkt-line)] text-[var(--mkt-muted)]'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          {TICKET_LINES.map((line) => (
            <div
              key={line.name}
              className="flex justify-between border-b border-dashed border-[var(--mkt-line)] py-[7px] text-[13px] text-[var(--mkt-ink)]"
            >
              <span>
                <span className="mr-[6px] text-[var(--mkt-muted)]">{line.qty}</span>
                {line.name}
              </span>
              <span className="font-mono font-semibold">{line.amt}</span>
            </div>
          ))}
          <div className="mt-auto flex justify-between pt-[14px] text-[15px] font-bold text-[var(--mkt-ink)]">
            <span>Total</span>
            <span className="font-mono">$348</span>
          </div>
          <div className="mt-3 rounded-[11px] bg-brand py-3 text-center text-[14.5px] font-bold text-white">
            Cobrar $348 · Pedir repartidor
          </div>
        </div>
      </div>
    </div>
  );
}
