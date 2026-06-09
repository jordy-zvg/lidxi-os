'use client';

import { CTASection, ComparisonTable, SectionHeader } from '@/components/marketing';
import type { ComparisonRow } from '@/components/marketing/ComparisonTable';
import { motion } from 'framer-motion';
const FADE = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' } as const,
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

// Simple inline SVG visuals per module
function PosVisual() {
  return (
    <div className="h-64 rounded-2xl bg-[#F6F9FC] border border-ink/10 p-5 overflow-hidden">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ink/30">
        POS · Mostrador 1
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['Taco Dorado', 'Enchiladas', 'Sopa del día', 'Agua Fresca', 'Horchata', 'Café'].map(
          (item, i) => (
            <div
              key={item}
              className={`rounded-lg p-3 text-center cursor-pointer transition-colors ${i === 1 ? 'bg-[#7C71FF] text-white' : 'bg-white border border-ink/10 text-[#0A2540]'}`}
            >
              <p className="text-[10px] font-medium leading-tight">{item}</p>
            </div>
          ),
        )}
      </div>
      <div className="mt-4 rounded-lg bg-[#0A2540] p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40">Total</p>
          <p className="font-mono text-lg font-semibold text-white">$285.00</p>
        </div>
        <div className="rounded-lg bg-[#7C71FF] px-4 py-2 text-xs font-semibold text-white">
          Cobrar
        </div>
      </div>
    </div>
  );
}

function OmsVisual() {
  const cols = [
    { label: 'Recibido', count: 4, color: 'bg-blue-400' },
    { label: 'Cocina', count: 3, color: 'bg-amber-400' },
    { label: 'Listo', count: 2, color: 'bg-green-400' },
  ];
  return (
    <div className="h-64 rounded-2xl bg-[#F6F9FC] border border-ink/10 p-5 overflow-hidden">
      <div className="mb-3 flex items-center gap-3">
        {['UberEats', 'Rappi', 'Didi', 'Sitio'].map((ch) => (
          <span
            key={ch}
            className="rounded bg-[#7C71FF]/10 px-2 py-0.5 text-[9px] font-semibold text-[#7C71FF]"
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cols.map((col) => (
          <div key={col.label}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${col.color}`} />
              <span className="text-[10px] font-semibold text-ink/50">{col.label}</span>
              <span className="ml-auto text-[10px] font-mono text-ink/30">{col.count}</span>
            </div>
            {Array.from({ length: Math.min(col.count, 3) }, (_, i) => i).map((i) => (
              <div key={`row-${i}`} className="mb-1 rounded bg-white border border-ink/8 p-2">
                <div className="h-1.5 w-full rounded bg-ink/8 mb-1" />
                <div className="h-1.5 w-2/3 rounded bg-ink/6" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function KdsVisual() {
  return (
    <div className="h-64 rounded-2xl bg-[#0A2540] p-5 overflow-hidden">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        KDS · Parrilla
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            id: 'RP-41',
            items: 'Tacos ×2, Agua ×1',
            time: '8:42',
            color: '#22c55e',
            elapsed: '4 min',
          },
          { id: 'UE-89', items: 'Enchiladas ×1', time: '8:44', color: '#f59e0b', elapsed: '2 min' },
          {
            id: 'DD-23',
            items: 'Sopa ×2, Pan ×2',
            time: '8:45',
            color: '#7C71FF',
            elapsed: '1 min',
          },
          { id: 'MP-05', items: 'Pozole ×1', time: '8:47', color: '#7C71FF', elapsed: 'Nuevo' },
        ].map((t) => (
          <div
            key={t.id}
            className="rounded-lg bg-white/5 p-2.5"
            style={{ borderLeft: `3px solid ${t.color}` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-white/40">{t.id}</span>
              <span className="text-[9px] font-semibold" style={{ color: t.color }}>
                {t.elapsed}
              </span>
            </div>
            <p className="text-[11px] text-white/70 leading-snug">{t.items}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StorefrontVisual() {
  return (
    <div className="h-64 rounded-2xl bg-white border border-ink/10 p-5 overflow-hidden shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-[#7C71FF]">Mi Cocina</div>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-600">
          Abierto
        </span>
      </div>
      <div className="space-y-2">
        {[
          { name: 'Taco Dorado', price: '$85', tag: 'Popular' },
          { name: 'Enchiladas Verdes', price: '$120', tag: '' },
          { name: 'Sopa del Día', price: '$95', tag: 'Nuevo' },
        ].map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-lg bg-[#F6F9FC] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-ink/6" />
              <div>
                <p className="text-xs font-medium text-[#0A2540]">{item.name}</p>
                {item.tag && (
                  <span className="text-[9px] text-[#7C71FF] font-semibold">{item.tag}</span>
                )}
              </div>
            </div>
            <span className="font-mono text-xs font-semibold text-[#0A2540]">{item.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-[#7C71FF] py-2 text-center text-xs font-semibold text-white">
        Ordenar ahora · Uber Direct
      </div>
    </div>
  );
}

function InventarioVisual() {
  return (
    <div className="h-64 rounded-2xl bg-[#F6F9FC] border border-ink/10 p-5 overflow-hidden">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ink/30">
        Inventario · Hoy
      </div>
      <div className="space-y-2.5">
        {[
          { name: 'Tortillas de maíz', stock: 85, unit: 'kg', alert: false },
          { name: 'Pollo marinado', stock: 12, unit: 'kg', alert: true },
          { name: 'Aceite vegetal', stock: 8, unit: 'L', alert: true },
          { name: 'Jitomate', stock: 95, unit: '%', alert: false },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#0A2540]">{item.name}</span>
                {item.alert && (
                  <span className="rounded bg-amber-100 px-1 text-[9px] font-semibold text-amber-600">
                    Bajo
                  </span>
                )}
              </div>
              <div className="h-1.5 w-full rounded-full bg-ink/8">
                <div
                  className={`h-1.5 rounded-full ${item.alert ? 'bg-amber-400' : 'bg-[#7C71FF]'}`}
                  style={{ width: `${item.stock}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-[10px] text-ink/40 shrink-0">
              {item.stock}
              {item.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportesVisual() {
  return (
    <div className="h-64 rounded-2xl bg-[#F6F9FC] border border-ink/10 p-5 overflow-hidden">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ink/30">
        Reportes · Esta semana
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Ventas', value: '$48,250', up: true },
          { label: 'Pedidos', value: '284', up: true },
          { label: 'Margen', value: '34%', up: false },
          { label: 'Canales', value: '4 activos', up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-white border border-ink/8 p-2.5">
            <p className="text-[9px] text-ink/40 mb-0.5">{kpi.label}</p>
            <p className="font-mono text-sm font-semibold text-[#0A2540]">{kpi.value}</p>
          </div>
        ))}
      </div>
      {/* Sparkline */}
      <svg
        viewBox="0 0 200 40"
        className="w-full h-10"
        role="img"
        aria-label="Gráfica de tendencia de ventas"
      >
        <polyline
          points="0,35 30,28 60,20 90,25 120,12 150,18 200,8"
          fill="none"
          stroke="#7C71FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="0,35 30,28 60,20 90,25 120,12 150,18 200,8 200,40 0,40"
          fill="#7C71FF"
          fillOpacity="0.06"
        />
      </svg>
    </div>
  );
}

function AutomatizacionVisual() {
  const nodes = [
    { label: 'Trigger', sub: 'Rush hour 12pm', x: 20, y: 36 },
    { label: 'Condición', sub: 'Pedidos > 20/hr', x: 50, y: 36 },
    { label: 'Acción', sub: '+10% precios delivery', x: 80, y: 36 },
  ];
  return (
    <div className="h-64 rounded-2xl bg-[#0A2540] p-5 overflow-hidden">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Automatización · Regla activa
      </div>
      <div className="relative flex items-center justify-between px-4">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex flex-col items-center gap-1 flex-1">
            <div className="relative z-10 rounded-xl bg-[#7C71FF]/20 border border-[#7C71FF]/30 px-3 py-2 text-center min-w-[80px]">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#7C71FF]">
                {node.label}
              </p>
              <p className="text-[10px] text-white/60 mt-0.5 leading-tight">{node.sub}</p>
            </div>
            {i < nodes.length - 1 && (
              <div className="absolute" style={{ left: `${(i + 1) * 33.3 - 10}%`, top: '30%' }}>
                <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
                  <path
                    d="M0 6 L14 6 M10 2 L14 6 L10 10"
                    stroke="#7C71FF"
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-1.5">
        {[
          { icon: '⚡', text: '14 reglas activas' },
          { icon: '✓', text: 'Ejecutada 47 veces esta semana' },
          { icon: '↑', text: '$8,240 de margen adicional estimado' },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 text-[11px] text-white/50">
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MODULES = [
  {
    id: 'pos',
    eyebrow: 'POS',
    headline: 'POS que vuela. Hasta cuando no hay internet.',
    subheadline:
      'Cobra en segundos. Sin lag, sin sincronización pesada. Si se cae el internet, sigues vendiendo y todo se sincroniza después.',
    bullets: [
      'Funciona 100% offline con cola de sincronización',
      'Pagos en efectivo, tarjeta, transferencia',
      'Cierres de caja con corte automático y conciliación',
      'Multi-cajón con permisos por usuario',
      'Atajos de teclado para velocidad de operador',
    ],
    Visual: PosVisual,
    flip: false,
  },
  {
    id: 'oms',
    eyebrow: 'Order Management',
    headline: 'Todos tus canales. Una sola pantalla. Cero copy-paste.',
    subheadline:
      'Uber Eats, Rappi, Didi Food, tu sitio propio, llamadas directas. Todo aterriza en el mismo tablero con el mismo flujo. Tu equipo deja de cambiar de app cada 30 segundos.',
    bullets: [
      'Integraciones nativas con APIs oficiales (no scrapers)',
      'Aceptación automática configurable por canal',
      'Reasignación de tiempos en rush con un click',
      'Pausar canal específico sin afectar los demás',
      'Alertas SLA antes de que el pedido se atrase',
    ],
    Visual: OmsVisual,
    flip: true,
  },
  {
    id: 'kds',
    eyebrow: 'Kitchen Display',
    headline: 'La cocina ve lo que debe ver, cuando debe verlo.',
    subheadline:
      'Pantallas dedicadas para barra fría, parrilla, ensamble, expedición. Cada estación ve solo sus items con timers, prioridades y notas. La cocina deja de gritar tickets.',
    bullets: [
      'Display por estación con filtros automáticos',
      'Timers con colores semánticos por SLA',
      'Notas del cliente y modificadores visibles',
      'Marcado "listo" sincronizado al tablero general',
      'Modo full-screen para tablets de cocina',
    ],
    Visual: KdsVisual,
    flip: false,
  },
  {
    id: 'storefront',
    eyebrow: 'Storefront',
    headline: 'Tu sitio. Tu marca. Sin comisiones de marketplace.',
    subheadline:
      'Activa tu storefront propio en minutos. Recibe pedidos directos, cobra con Stripe y entrega con Uber Direct. La economía del delivery pero sin pagarle 28% a nadie.',
    bullets: [
      'Sitio público con tu menú, tu marca, tu dominio',
      'Pagos con Stripe (tarjeta, OXXO, transferencia SPEI)',
      'Delivery con Uber Direct (paga solo entrega, no comisión)',
      'WhatsApp automático para confirmación y tracking',
      'Subsidio configurable: tú decides cuánto absorbe el restaurante',
    ],
    Visual: StorefrontVisual,
    flip: true,
  },
  {
    id: 'inventario',
    eyebrow: 'Inventario',
    headline: 'El inventario baja solo. Las alertas llegan antes del desastre.',
    subheadline:
      'Cada venta descuenta automáticamente. Cada compra suma. Alertas inteligentes te avisan antes de quedarte sin lo crítico, no cuando ya es tarde.',
    bullets: [
      'Recetas con descuento automático por venta',
      'Mermas y desperdicios registrables en 2 clicks',
      'Alertas configurables por umbral',
      'Órdenes de compra a proveedores',
      'Costo por platillo siempre actualizado',
    ],
    Visual: InventarioVisual,
    flip: false,
  },
  {
    id: 'reportes',
    eyebrow: 'Reportes',
    headline: 'Decisiones de operación, en segundos.',
    subheadline:
      'Reportes que entienden el negocio de un restaurante. Heatmaps por hora, ranking de platillos por margen real, comisiones por canal, performance de turno. Sin construir consultas SQL.',
    bullets: [
      'Heatmap de horas pico por día de semana',
      'Top platillos por venta, margen y velocidad',
      'Comparativa de canales con comisión real',
      'Reportes de turno con cierre de caja automático',
      'Exportable a CSV para tu contador',
    ],
    Visual: ReportesVisual,
    flip: true,
  },
  {
    id: 'automatizacion',
    eyebrow: 'Diferenciador',
    headline: 'Reglas que operan solas.',
    subheadline:
      'La automatización es lo que separa Kobi de un POS normal. Define reglas que se ejecutan cuando algo pasa. Tu equipo en lo importante, Kobi en lo repetitivo.',
    bullets: [
      'Acepta pedidos automáticamente entre 12pm y 4pm',
      'Sube precios 10% en delivery cuando hay rush',
      'Pausa el menú de Rappi si quedan menos de 5 unidades',
      'Manda WhatsApp al gerente si SLA se está por vencer',
      'Genera órdenes de compra automáticas con umbrales inteligentes',
    ],
    Visual: AutomatizacionVisual,
    flip: false,
    highlight: true,
  },
];

// TODO: validar checkmarks contra documentación oficial de cada competidor antes de publicar
const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Integraciones nativas con marketplaces',
    kobi: true,
    wansoft: true,
    softRestaurant: false,
    parrot: true,
  },
  {
    feature: 'Storefront propio sin comisión',
    kobi: true,
    wansoft: false,
    softRestaurant: false,
    parrot: false,
  },
  {
    feature: 'Uber Direct nativo',
    kobi: true,
    wansoft: false,
    softRestaurant: false,
    parrot: false,
  },
  {
    feature: 'Automatización con reglas',
    kobi: true,
    wansoft: false,
    softRestaurant: false,
    parrot: false,
  },
  {
    feature: 'KDS multi-estación moderno',
    kobi: true,
    wansoft: true,
    softRestaurant: false,
    parrot: true,
  },
  {
    feature: 'Multi-dispositivo en tiempo real',
    kobi: true,
    wansoft: false,
    softRestaurant: false,
    parrot: true,
  },
  {
    feature: 'Pricing transparente sin contrato',
    kobi: true,
    wansoft: false,
    softRestaurant: false,
    parrot: false,
  },
  {
    feature: 'Setup self-service',
    kobi: true,
    wansoft: false,
    softRestaurant: false,
    parrot: false,
  },
];

export default function CaracteristicasPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#F6F9FC] pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              {...FADE}
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#7C71FF]"
            >
              Capacidades
            </motion.p>
            <motion.h1
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.07 }}
              className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0A2540] sm:text-5xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Una plataforma. Cada parte de tu operación.
            </motion.h1>
            <motion.p
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.14 }}
              className="mt-6 text-lg leading-relaxed text-[#0A2540]/60"
            >
              Diseñada como un sistema operativo, no como una suite de productos inconexos. Cada
              módulo conoce a los demás. Lo que pasa en POS se refleja en KDS, en inventario, en
              reportes.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Module sections */}
      {MODULES.map((mod, i) => (
        <section
          key={mod.id}
          id={mod.id}
          className={`py-20 sm:py-24 ${mod.highlight ? 'bg-[#7C71FF]/[0.03] border-y border-[#7C71FF]/8' : i % 2 === 0 ? 'bg-white' : 'bg-[#F6F9FC]'}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={`grid grid-cols-1 items-center gap-16 lg:grid-cols-2 ${mod.flip ? 'lg:grid-flow-col-dense' : ''}`}
            >
              <motion.div {...FADE} className={mod.flip ? 'lg:col-start-2' : ''}>
                {mod.eyebrow && (
                  <p
                    className={`mb-3 text-xs font-semibold uppercase tracking-widest ${mod.highlight ? 'text-[#7C71FF]' : 'text-[#7C71FF]'}`}
                  >
                    {mod.eyebrow}
                  </p>
                )}
                <h2
                  className="mb-4 text-3xl font-semibold leading-[1.2] tracking-tight text-[#0A2540] sm:text-[40px]"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {mod.headline}
                </h2>
                <p className="mb-6 text-lg leading-relaxed text-ink/60">{mod.subheadline}</p>
                <ul className="space-y-2.5">
                  {mod.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-ink/70">
                      <span className="mt-0.5 shrink-0 text-[#7C71FF]">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                {...FADE}
                transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1 }}
                className={mod.flip ? 'lg:col-start-1' : ''}
              >
                <mod.Visual />
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Comparison table */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Comparativa"
            headline="Kobi frente a las alternativas."
            subheadline="Sin tirarle a nadie. Esto es lo que cambia con Kobi."
          />
          <div className="mt-12">
            <ComparisonTable rows={COMPARISON_ROWS} />
          </div>
        </div>
      </section>

      <CTASection
        headline="¿Listo para modernizar tu operación?"
        subheadline="Setup en minutos. Sin contratos. Cancela cuando quieras."
        primaryCta={{ label: 'Empezar gratis', href: '/registro' }}
        secondaryCta={{ label: 'Ver precios', href: '/precios' }}
      />
    </>
  );
}
