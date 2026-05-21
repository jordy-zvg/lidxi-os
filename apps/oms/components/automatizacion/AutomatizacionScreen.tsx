'use client';

import { PreviewBadge } from '@/components/admin/PreviewBadge';
import { Button, Toggle } from '@kobi/ui';
import { useState } from 'react';

type Categoria = 'Inventario' | 'SLA' | 'Precios' | 'Notificaciones';

interface Regla {
  id: string;
  activa: boolean;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  ultimo_disparo: string;
}

const CATEGORIA_COLORS: Record<Categoria, string> = {
  Inventario: 'bg-brand-soft text-brand-text',
  SLA: 'bg-warn-soft text-warn-text',
  Precios: 'bg-ok-soft text-ok-text',
  Notificaciones: 'bg-surface-2 text-ink-200',
};

const INITIAL_REGLAS: Regla[] = [
  {
    id: 'r1',
    activa: true,
    nombre: '86 automático por inventario',
    descripcion:
      'Cuando el stock de un insumo baja del mínimo, apaga ese platillo en todas las plataformas automáticamente.',
    categoria: 'Inventario',
    ultimo_disparo: 'Hoy 13:42',
  },
  {
    id: 'r2',
    activa: true,
    nombre: 'Escalamiento de SLA',
    descripcion:
      'Si un pedido lleva más de 12 min en preparación, notifica al gerente. A los 15 min, notifica al dueño.',
    categoria: 'SLA',
    ultimo_disparo: 'Hoy 14:18',
  },
  {
    id: 'r3',
    activa: false,
    nombre: 'Precio dinámico en hora pico',
    descripcion:
      'Entre las 13:00 y 15:00 de viernes y sábado, sube los precios en Uber Eats y Rappi un 8%.',
    categoria: 'Precios',
    ultimo_disparo: 'Sáb pasado 14:00',
  },
  {
    id: 'r4',
    activa: true,
    nombre: 'Reorden automático de insumos',
    descripcion:
      'Cuando la cobertura de un insumo baja de 2 días, genera una orden de compra borrador para el proveedor.',
    categoria: 'Inventario',
    ultimo_disparo: 'Ayer 09:15',
  },
  {
    id: 'r5',
    activa: true,
    nombre: 'Notificación de corte',
    descripcion:
      'Envía un resumen del turno por WhatsApp al gerente 30 minutos antes del horario de cierre configurado.',
    categoria: 'Notificaciones',
    ultimo_disparo: 'Ayer 21:30',
  },
];

const PLANTILLAS: Record<Categoria, { condicion: string; accion: string }> = {
  Inventario: {
    condicion: 'Cuando el stock de [insumo] baje de [cantidad] unidades',
    accion: 'Entonces desactivar el platillo en todas las plataformas',
  },
  SLA: {
    condicion: 'Cuando un pedido lleve más de [N] minutos en preparación',
    accion: 'Entonces notificar al gerente por WhatsApp',
  },
  Precios: {
    condicion: 'Cuando sea [día] entre [hora inicio] y [hora fin]',
    accion: 'Entonces subir precios en [canal] un [N]%',
  },
  Notificaciones: {
    condicion: 'Cuando ocurra [evento]',
    accion: 'Entonces enviar notificación a [destinatario]',
  },
};

const CANAL_OPTIONS = ['Direct', 'Uber Eats', 'Rappi', 'Didi Food'];

export const AutomatizacionScreen = () => {
  const [reglas, setReglas] = useState<Regla[]>(INITIAL_REGLAS);
  const [categoria, setCategoria] = useState<Categoria>('Inventario');
  const [condicion, setCondicion] = useState(PLANTILLAS.Inventario.condicion);
  const [accion, setAccion] = useState(PLANTILLAS.Inventario.accion);
  const [canales, setCanales] = useState<string[]>([]);
  const [activaDesdeInicio, setActivaDesdeInicio] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const handleCategoria = (c: Categoria) => {
    setCategoria(c);
    setCondicion(PLANTILLAS[c].condicion);
    setAccion(PLANTILLAS[c].accion);
  };

  const toggleRegla = (id: string) =>
    setReglas((prev) => prev.map((r) => (r.id === id ? { ...r, activa: !r.activa } : r)));

  const toggleCanal = (canal: string) =>
    setCanales((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal],
    );

  const handleCrear = () => {
    const nueva: Regla = {
      id: `r${Date.now()}`,
      activa: activaDesdeInicio,
      nombre: `${condicion.slice(0, 40)}…`,
      descripcion: `${condicion} → ${accion}`,
      categoria,
      ultimo_disparo: 'Nunca',
    };
    setReglas((prev) => [nueva, ...prev]);
    setToast('Regla creada correctamente');
    setTimeout(() => setToast(null), 3000);
    setCondicion(PLANTILLAS[categoria].condicion);
    setAccion(PLANTILLAS[categoria].accion);
    setCanales([]);
  };

  return (
    <div className="flex flex-col gap-section-sm h-full">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-ink">Automatización</h1>
          <PreviewBadge variant="preview" />
        </div>
        {toast && (
          <span className="text-xs text-ok-text bg-ok-soft px-3 py-1.5 rounded-full">{toast}</span>
        )}
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Lista de reglas */}
        <div className="flex-[60] flex flex-col gap-3 overflow-y-auto">
          {reglas.map((regla) => (
            <div
              key={regla.id}
              className="bg-surface border border-line rounded-lg p-card-sm flex gap-3"
            >
              <div className="pt-0.5 shrink-0">
                <Toggle
                  checked={regla.activa}
                  onChange={() => toggleRegla(regla.id)}
                  label={regla.nombre}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span className="font-medium text-sm text-ink">{regla.nombre}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${CATEGORIA_COLORS[regla.categoria]}`}
                  >
                    {regla.categoria}
                  </span>
                </div>
                <p className="text-xs text-ink-300 leading-relaxed">{regla.descripcion}</p>
                <p className="text-[11px] text-ink-500 font-mono">
                  Último disparo: {regla.ultimo_disparo}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 self-start">
                Editar
              </Button>
            </div>
          ))}
        </div>

        {/* Panel nueva regla */}
        <div className="flex-[40] bg-surface border border-line rounded-lg flex flex-col overflow-hidden">
          <div className="border-b border-line px-5 py-4 shrink-0">
            <h2 className="text-sm font-semibold text-ink">Nueva regla</h2>
            <p className="text-xs text-ink-400 mt-0.5">Si esto… entonces aquello</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Categoría */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                Categoría
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PLANTILLAS) as Categoria[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCategoria(c)}
                    className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${
                      categoria === c
                        ? CATEGORIA_COLORS[c]
                        : 'bg-canvas text-ink-300 hover:bg-surface-2'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Condición */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
                htmlFor="cond"
              >
                Cuando…
              </label>
              <textarea
                id="cond"
                rows={3}
                value={condicion}
                onChange={(e) => setCondicion(e.target.value)}
                className="w-full rounded-md border border-line-2 bg-canvas px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:border-brand"
              />
            </div>

            {/* Acción */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
                htmlFor="accion"
              >
                Entonces…
              </label>
              <textarea
                id="accion"
                rows={3}
                value={accion}
                onChange={(e) => setAccion(e.target.value)}
                className="w-full rounded-md border border-line-2 bg-canvas px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:border-brand"
              />
            </div>

            {/* Canales */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                Canales afectados
              </span>
              <div className="flex flex-wrap gap-2">
                {CANAL_OPTIONS.map((canal) => (
                  <button
                    key={canal}
                    type="button"
                    onClick={() => toggleCanal(canal)}
                    className={`h-7 px-3 rounded text-xs font-medium border transition-colors ${
                      canales.includes(canal)
                        ? 'bg-brand text-white border-brand'
                        : 'bg-canvas text-ink-300 border-line-2 hover:border-line-3'
                    }`}
                  >
                    {canal}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle activa */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-200">Activa desde el inicio</span>
              <Toggle
                checked={activaDesdeInicio}
                onChange={(v) => setActivaDesdeInicio(v)}
                label="Activa desde el inicio"
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-line px-5 py-4">
            <Button className="w-full" onClick={handleCrear}>
              Crear regla
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
