'use client';

import { type ChannelRow, disconnectChannel, saveChannelConnection } from '@/lib/channel-actions';
import type { CHANNEL_SCHEMAS, ChannelId } from '@/lib/channel-schemas';
import { StatusPill } from '@kobi/ui';
import { IconLink, IconUnlink, IconX } from '@tabler/icons-react';
import { useState, useTransition } from 'react';

interface IntegracionesScreenProps {
  channels: ChannelRow[];
  schemas: typeof CHANNEL_SCHEMAS;
}

function statusLabel(s: ChannelRow['status']): string {
  return s === 'connected'
    ? 'Conectado'
    : s === 'pending'
      ? 'Pendiente'
      : s === 'error'
        ? 'Error'
        : 'Desconectado';
}

function statusVariant(s: ChannelRow['status']): 'ok' | 'warn' | 'danger' {
  if (s === 'connected') return 'ok';
  if (s === 'pending') return 'warn';
  if (s === 'error') return 'danger';
  return 'danger';
}

export const IntegracionesScreen = ({ channels, schemas }: IntegracionesScreenProps) => {
  const [editing, setEditing] = useState<ChannelId | null>(null);

  return (
    <div className="flex flex-col gap-section-sm overflow-y-auto pb-6">
      <div className="shrink-0">
        <h1 className="text-xl font-medium text-ink">Integraciones</h1>
        <p className="mt-1 text-sm text-ink-400 max-w-xl">
          Guarda las credenciales que cada canal te pidió. La conexión real se activará cuando la
          integración esté disponible — por ahora las credenciales quedan listas y aisladas en tu
          tenant.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-card-gap">
        {channels.map((ch) => {
          const schema = schemas[ch.channel];
          return (
            <div
              key={ch.channel}
              className="bg-surface border border-line rounded-lg p-card-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: schema.brand }}
                  >
                    {schema.label[0]}
                  </div>
                  <span className="font-medium text-sm text-ink">{schema.label}</span>
                </div>
                <StatusPill variant={statusVariant(ch.status)}>{statusLabel(ch.status)}</StatusPill>
              </div>

              {ch.status !== 'disconnected' && (
                <div className="space-y-1 text-xs">
                  {schema.fields
                    .filter((f) => f.type === 'text' && ch.credentials[f.name])
                    .map((f) => (
                      <div key={f.name} className="flex justify-between">
                        <span className="text-ink-400">{f.label}</span>
                        <span className="font-mono text-ink-300 truncate max-w-[140px]">
                          {ch.credentials[f.name]}
                        </span>
                      </div>
                    ))}
                  {ch.last_error && (
                    <p className="text-danger-text text-xs mt-1 line-clamp-2">{ch.last_error}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {ch.status === 'disconnected' ? (
                  <button
                    type="button"
                    onClick={() => setEditing(ch.channel)}
                    className="flex-1 h-8 rounded bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors flex items-center justify-center gap-1.5"
                  >
                    <IconLink size={13} />
                    Conectar
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(ch.channel)}
                      className="flex-1 h-8 rounded border border-line-2 text-xs font-medium text-ink-200 hover:bg-surface-2 transition-colors"
                    >
                      Editar
                    </button>
                    <DisconnectButton channel={ch.channel} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <ChannelFormDrawer
          channel={editing}
          schema={schemas[editing]}
          existing={channels.find((c) => c.channel === editing)?.credentials ?? {}}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

function DisconnectButton({ channel }: { channel: ChannelId }) {
  const [pending, startTransition] = useTransition();
  const onClick = () => {
    if (!confirm('¿Desconectar este canal? Las credenciales se borran de la base de datos.'))
      return;
    startTransition(async () => {
      await disconnectChannel(channel);
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="h-8 px-3 rounded border border-line-2 text-xs font-medium text-danger-text hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
    >
      <IconUnlink size={13} />
      Desconectar
    </button>
  );
}

interface ChannelFormDrawerProps {
  channel: ChannelId;
  schema: (typeof CHANNEL_SCHEMAS)[ChannelId];
  existing: Record<string, string>;
  onClose: () => void;
}

function ChannelFormDrawer({ channel, schema, existing, onClose }: ChannelFormDrawerProps) {
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...existing }));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveChannelConnection(channel, values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/70"
        role="presentation"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label={`Configurar ${schema.label}`}
        className="fixed right-0 top-0 bottom-0 z-50 w-[440px] m-0 p-0 bg-surface border-l border-line shadow-lg flex flex-col overflow-hidden"
      >
        <header className="shrink-0 border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: schema.brand }}
            >
              {schema.label[0]}
            </div>
            <span className="font-medium text-sm text-ink">Conectar {schema.label}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-xs text-ink-400">
            Captura las credenciales que {schema.label} te proporcionó. Se guardan cifradas a nivel
            de fila (RLS) y solo tu tenant puede leerlas.
          </p>

          {error && (
            <div className="rounded-md bg-danger-soft border border-danger px-4 py-2.5 text-sm text-danger-text">
              {error}
            </div>
          )}

          {schema.fields.map((f) => (
            <div key={f.name}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-1"
                htmlFor={`f-${f.name}`}
              >
                {f.label}
                {f.required && ' *'}
              </label>
              <input
                id={`f-${f.name}`}
                type={f.type}
                placeholder={f.placeholder}
                value={values[f.name] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm font-mono text-ink focus:outline-none focus:border-brand"
              />
            </div>
          ))}

          <div className="rounded-lg bg-warn-soft border border-warn px-3 py-2.5 text-xs text-warn-text">
            La conexión se marca como <strong>Pendiente</strong> al guardar. La activación real con
            la API del canal llegará cuando obtengamos acceso de partner.
          </div>
        </div>

        <footer className="shrink-0 border-t border-line px-5 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-9 px-4 rounded-md border border-line-2 text-sm text-ink-200 hover:bg-surface-2 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover disabled:opacity-40"
          >
            {pending ? 'Guardando…' : 'Guardar credenciales'}
          </button>
        </footer>
      </dialog>
    </>
  );
}
