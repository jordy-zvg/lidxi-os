export const metadata = { title: 'Detalle del pedido' };

import { OrderDetailView } from '@/components/order-detail/OrderDetailView';

interface Props {
  params: { id: string };
}

export default function OrderDetailPage({ params }: Props) {
  return <OrderDetailView orderId={params.id} />;
}
