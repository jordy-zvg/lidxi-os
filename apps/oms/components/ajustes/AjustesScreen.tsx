import { PreviewBadge } from '@/components/admin/PreviewBadge';
import {
  IconBell,
  IconBuildingStore,
  IconCash,
  IconClock,
  IconPalette,
  IconUsersGroup,
} from '@tabler/icons-react';

const OPERATION_LABEL: Record<string, string> = {
  dark_kitchen: 'Dark kitchen',
  restaurante_delivery: 'Restaurante con delivery',
  restaurante_sala: 'Restaurante con sala',
  cadena: 'Cadena multi-sucursal',
  comida_rapida: 'Comida rápida',
};

interface AjustesScreenProps {
  tenant: {
    name: string;
    rfc: string | null;
    address: string | null;
    phone: string | null;
    plan: string | null;
    operation_type?: string;
  };
}

export const AjustesScreen = ({ tenant }: AjustesScreenProps) => (
  <div className="flex flex-col gap-6 pb-8">
    <header>
      <h1 className="text-xl font-medium text-ink">Ajustes</h1>
      <p className="mt-1 text-sm text-ink-400">
        Datos del restaurante, preferencias y configuración del tenant.
      </p>
    </header>

    {/* SECCIÓN 1 — Datos del negocio (REAL, del onboarding) */}
    <section className="bg-surface border border-line rounded-lg p-card">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <IconBuildingStore size={14} />
          Datos del negocio
        </h2>
        <span className="text-[11px] text-ink-400">desde el onboarding</span>
      </header>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Field label="Nombre del restaurante" value={tenant.name} />
        <Field
          label="Tipo de operación"
          value={
            tenant.operation_type
              ? (OPERATION_LABEL[tenant.operation_type] ?? tenant.operation_type)
              : null
          }
        />
        <Field label="Dirección" value={tenant.address} />
        <Field label="Teléfono" value={tenant.phone} />
        <Field label="RFC" value={tenant.rfc} />
        <Field
          label="Plan Kobi"
          value={tenant.plan ? tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1) : null}
        />
      </dl>
      <p className="mt-4 text-xs text-ink-400">
        Editar estos datos llegará en un sprint próximo. Si necesitas un cambio urgente, contacta a
        soporte.
      </p>
    </section>

    {/* SECCIONES SOON — placeholders honestos */}
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-card-gap">
      <SoonCard
        icon={<IconClock size={14} />}
        title="Horarios y zonas"
        description="Horario de atención por sucursal, zona horaria, días festivos."
      />
      <SoonCard
        icon={<IconCash size={14} />}
        title="Moneda e impuestos"
        description="Moneda principal (MXN), IVA, retenciones, propinas sugeridas."
      />
      <SoonCard
        icon={<IconBell size={14} />}
        title="Notificaciones"
        description="Email + WhatsApp para alertas operativas y resúmenes diarios."
      />
      <SoonCard
        icon={<IconPalette size={14} />}
        title="Branding"
        description="Logo, color primario, recibo personalizado para tu tienda directa."
      />
      <SoonCard
        icon={<IconUsersGroup size={14} />}
        title="Usuarios admin"
        description="Invitar otros administradores con sus propios permisos."
      />
      <SoonCard
        icon={<IconBuildingStore size={14} />}
        title="Sucursales adicionales"
        description="Multi-sucursal con configuración independiente por punto de venta."
      />
    </section>
  </div>
);

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">
        {value ?? <span className="text-ink-400 italic">—</span>}
      </dd>
    </div>
  );
}

function SoonCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-card">
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
          {icon}
          {title}
        </h3>
        <PreviewBadge variant="soon" />
      </header>
      <p className="text-xs text-ink-400 leading-relaxed">{description}</p>
    </div>
  );
}
