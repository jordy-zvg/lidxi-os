import { listMenuItemsWithPrices } from './actions';

export const metadata = {
  title: 'Tarifas',
};

export default async function TarifasPage() {
  const result = await listMenuItemsWithPrices();
  const items = result.ok ? result.items : [];

  const CHANNELS = ['pos', 'delivery', 'web', 'app'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Tarifas</h1>
        <p className="mt-1 text-sm text-ink-400">Precios de artículos por canal</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <p className="text-ink-400">No hay artículos en el menú</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="px-4 py-3 text-left font-medium text-ink-400 text-xs">Artículo</th>
                {CHANNELS.map((ch) => (
                  <th key={ch} className="px-4 py-3 text-right font-medium text-ink-400 text-xs">
                    {ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 text-ink font-medium sticky left-0 bg-white hover:bg-canvas">
                    {item.name}
                  </td>
                  {CHANNELS.map((channel) => {
                    const priceObj = item.prices.find((p) => p.channel === channel);
                    return (
                      <td key={channel} className="px-4 py-3 text-right">
                        {priceObj ? (
                          <span className="inline-block px-2 py-1 rounded bg-ok-soft text-ok-text text-xs font-medium">
                            ${priceObj.price}
                          </span>
                        ) : (
                          <span className="text-ink-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-sm text-ink-400">
          💡 <strong>Nota:</strong> Esta sección muestra precios de artículos por canal de venta.
          Para configurar entregas y tarifas de delivery, usa la integración de proveedores en
          Integraciones.
        </p>
      </div>
    </div>
  );
}
