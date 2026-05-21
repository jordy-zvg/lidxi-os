export const metadata = { title: 'Pedidos' };

import { PedidosScreen } from '@/components/operations/PedidosScreen';
import { getEmployeeContext } from '@/lib/operations/employee-context';
import { loadActiveOrders } from '@/lib/operations/order-actions';
import { loadActiveShift, loadShiftSummary } from '@/lib/operations/shift-actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  const ctx = await getEmployeeContext();
  if (!ctx) redirect('/login');

  const [shiftRes, ordersRes, summaryRes] = await Promise.all([
    loadActiveShift(),
    loadActiveOrders(),
    loadShiftSummary(),
  ]);

  if (!shiftRes.ok) redirect('/login');
  if (!ordersRes.ok) {
    return (
      <div className="p-8 text-sm text-danger-text">Error cargando pedidos: {ordersRes.error}</div>
    );
  }

  return (
    <PedidosScreen
      shift={shiftRes.data}
      orders={ordersRes.data}
      summary={summaryRes.ok ? summaryRes.data : null}
    />
  );
}
