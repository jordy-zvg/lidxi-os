'use client';

import { IconChefHat, IconPlug, IconRocket, IconUsers } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';

export default function InicioAdminPage() {
  // Mock flag to test empty state (Decision 3B) vs active state
  const hasOrders = false;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {hasOrders ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Hero Metrics */}
          <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Ventas hoy</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="font-mono text-4xl text-[#0A2540]">$12,450</p>
              <span className="mb-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
                +12% vs ayer
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-ink/50">
              <Link href="/pedidos" className="hover:underline">
                24 órdenes activas ahora
              </Link>
            </p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
              Ahorrado este mes
            </p>
            <p className="mt-2 font-mono text-4xl text-[#0A2540]">$8,230</p>
            <p className="mt-2 font-mono text-xs text-ink/50">142 órdenes directas</p>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-start gap-6 rounded-xl border border-[#635BFF]/20 bg-gradient-to-br from-[#635BFF]/5 to-[#F6F9FC] p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#635BFF]/10 text-[#635BFF]">
            <IconRocket size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#0A2540]">Tu operación arranca aquí.</h2>
            <p className="mt-1 text-sm text-ink/60">
              Configura tu equipo, tu menú y conecta canales para empezar a recibir órdenes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={'/admin/equipo' as Route}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#635BFF] shadow-sm border border-ink/5 hover:bg-gray-50"
              >
                Invitar equipo →
              </Link>
              <Link
                href={'/admin/menu' as Route}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#635BFF] shadow-sm border border-ink/5 hover:bg-gray-50"
              >
                Configurar menú →
              </Link>
              <Link
                href={'/admin/integraciones' as Route}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#635BFF] shadow-sm border border-ink/5 hover:bg-gray-50"
              >
                Conectar canales →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm transition-colors hover:border-ink/20">
          <IconUsers size={20} className="text-ink/40 mb-3" />
          <h3 className="font-semibold text-[#0A2540]">Invita a tu equipo</h3>
          <p className="mt-1 mb-4 text-sm text-ink/60">
            Crea PINs para cajeros, cocineros y runners.
          </p>
          <Link
            href={'/admin/equipo' as Route}
            className="text-sm font-medium text-[#635BFF] hover:underline"
          >
            Ir a Equipo →
          </Link>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm transition-colors hover:border-ink/20">
          <IconChefHat size={20} className="text-ink/40 mb-3" />
          <h3 className="font-semibold text-[#0A2540]">Configura tu menú</h3>
          <p className="mt-1 mb-4 text-sm text-ink/60">Agrega items, precios y fotos.</p>
          <Link
            href={'/admin/menu' as Route}
            className="text-sm font-medium text-[#635BFF] hover:underline"
          >
            Ir a Menú →
          </Link>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-5 shadow-sm transition-colors hover:border-ink/20">
          <IconPlug size={20} className="text-ink/40 mb-3" />
          <h3 className="font-semibold text-[#0A2540]">Conecta marketplaces</h3>
          <p className="mt-1 mb-4 text-sm text-ink/60">Uber Eats, Rappi, Didi Food.</p>
          <Link
            href={'/admin/integraciones' as Route}
            className="text-sm font-medium text-[#635BFF] hover:underline"
          >
            Ir a Integraciones →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-ink/60 flex items-center gap-2">
          Sucursal configurada ✅ <span className="text-ink/20">|</span> Menú vacío ⚠{' '}
          <span className="text-ink/20">|</span> Sin equipo invitado ⚠
        </p>
      </div>
    </div>
  );
}
