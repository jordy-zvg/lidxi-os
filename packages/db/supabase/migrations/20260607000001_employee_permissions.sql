-- Sprint 16: Agregar columnas de permisos especiales a employees_v2.
-- Almacena permisos que pueden ser toggleados por gerentes.

alter table public.employees_v2 add column if not exists perm_cancel_tickets boolean not null default false;
alter table public.employees_v2 add column if not exists perm_discounts boolean not null default false;
alter table public.employees_v2 add column if not exists perm_open_cash boolean not null default false;
alter table public.employees_v2 add column if not exists perm_view_reports boolean not null default false;
alter table public.employees_v2 add column if not exists perm_edit_inventory boolean not null default false;

comment on column public.employees_v2.perm_cancel_tickets is 'Permite cancelar tickets';
comment on column public.employees_v2.perm_discounts is 'Permite aplicar descuentos manuales';
comment on column public.employees_v2.perm_open_cash is 'Permite abrir caja';
comment on column public.employees_v2.perm_view_reports is 'Permite ver reportes financieros';
comment on column public.employees_v2.perm_edit_inventory is 'Permite editar inventario';
