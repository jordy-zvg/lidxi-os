export const metadata = { title: 'Reportes' };

import { ReportesScreen } from '@/components/reportes/ReportesScreen';

export default function ReportesPage() {
  // Vista operativa: no exponemos selector de sucursal (el empleado opera
  // en una sola sucursal por sesión). El filtro multi-sucursal está en
  // /admin/reportes para el dueño.
  return <ReportesScreen branches={[]} />;
}
