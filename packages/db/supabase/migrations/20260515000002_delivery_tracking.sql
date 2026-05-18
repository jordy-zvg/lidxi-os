-- ===========================================================================
-- Delivery Tracking — Sprint 1.6 Track B
-- Tabla para persistir el estado en tiempo real del courier de Uber Direct.
-- Se actualiza via webhook POST /webhooks/uber-direct y se consume via SSE.
-- ===========================================================================

create table if not exists public.delivery_tracking (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  status          text not null default 'pending'
                    check (status in ('pending','accepted','picking_up','on_route','arrived','delivered','canceled')),
  -- Posición del courier (actualización frecuente)
  courier_lat     numeric(9,6),
  courier_lng     numeric(9,6),
  -- ETA en segundos desde last_event_at
  eta_seconds     integer,
  -- Datos del courier (estables, vienen al aceptar)
  courier_name    text,
  courier_phone   text,
  courier_vehicle text,   -- 'bike' | 'car' | 'motorcycle'
  courier_photo   text,   -- URL
  courier_rating  numeric(3,2),
  plate           text,
  -- Ruta opcional (GeoJSON LineString como text)
  route_geometry  text,
  -- Timestamps
  last_event_at   timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Un único registro de tracking por orden
create unique index if not exists delivery_tracking_order_id_idx
  on public.delivery_tracking(order_id);

-- RLS: solo lectura autenticada + escritura service role
alter table public.delivery_tracking enable row level security;

create policy "delivery_tracking_authenticated_read"
  on public.delivery_tracking for select
  to authenticated
  using (true);
