export const metadata = { title: 'Detalle del pedido' };

import { OrderDetailView } from '@/components/order-detail/OrderDetailView';
import { loadOrderDetail } from '@/lib/operations/order-actions';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: Props) {
  const res = await loadOrderDetail(params.id);

  // Sin fallback a otro pedido: antes, un id desconocido renderizaba el mock
  // de otro cliente con su nombre y dirección, como si fuera este pedido.
  if (!res.ok) {
    return (
      <div className="p-6">
        <h1 className="mb-2 font-semibold text-ink text-lg">Pedido no encontrado</h1>
        <p className="mb-4 text-ink-300 text-sm">{res.error}</p>
        <Link href="/pedidos" className="text-brand text-sm hover:underline">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  return <OrderDetailView order={res.data} />;
}
