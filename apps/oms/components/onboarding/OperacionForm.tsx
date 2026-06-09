'use client';

import { saveOperacionStep } from '@/app/(onboarding)/onboarding/actions';
import { IconAlertCircle, IconMapPin } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const CANALES = [
  { value: 'uber_eats', label: 'Uber Eats' },
  { value: 'rappi', label: 'Rappi' },
  { value: 'didi_food', label: 'Didi Food' },
  { value: 'sitio_propio', label: 'Tu propio sitio (storefront)' },
  { value: 'presencial', label: 'Solo presencial / sala' },
];

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
];

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type Hours = Record<DayKey, { open: string; close: string; closed: boolean }>;

const DEFAULT_HOURS: Hours = {
  mon: { open: '09:00', close: '22:00', closed: false },
  tue: { open: '09:00', close: '22:00', closed: false },
  wed: { open: '09:00', close: '22:00', closed: false },
  thu: { open: '09:00', close: '22:00', closed: false },
  fri: { open: '09:00', close: '23:00', closed: false },
  sat: { open: '10:00', close: '23:00', closed: false },
  sun: { open: '10:00', close: '21:00', closed: false },
};

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

interface OperacionFormProps {
  mapboxToken?: string;
  branchName?: string;
}

export function OperacionForm({ mapboxToken, branchName }: OperacionFormProps) {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [hours, setHours] = useState<Hours>(DEFAULT_HOURS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mapboxToken || address.length < 3 || (lat != null && lng != null)) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const url = new URL(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      );
      url.searchParams.set('access_token', mapboxToken);
      url.searchParams.set('country', 'mx');
      url.searchParams.set('language', 'es');
      url.searchParams.set('limit', '5');
      try {
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const body = (await res.json()) as { features: MapboxFeature[] };
        setSuggestions(body.features ?? []);
      } catch {
        // network errors: silenciar — el usuario puede mandar sin lat/lng
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [address, mapboxToken, lat, lng]);

  function pickSuggestion(s: MapboxFeature) {
    setAddress(s.place_name);
    setLng(s.center[0]);
    setLat(s.center[1]);
    setSuggestions([]);
  }

  function updateDay(day: DayKey, patch: Partial<Hours[DayKey]>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    if (!address.trim()) errs.address = 'Necesitamos la dirección de tu sucursal';
    const canales = data.getAll('canales');
    if (canales.length === 0) errs.canales = 'Selecciona al menos un canal';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setPending(true);
    data.set('address', address);
    if (lat != null) data.set('lat', String(lat));
    if (lng != null) data.set('lng', String(lng));
    data.set('hours_json', JSON.stringify(hours));
    if (branchName) data.set('branch_name', branchName);
    await saveOperacionStep(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Sucursal */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#0A2540]">
          Dirección de tu sucursal <span className="text-[#7C71FF]">*</span>
        </legend>
        <div className="relative">
          <IconMapPin
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <input
            type="text"
            name="address_input"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setLat(null);
              setLng(null);
            }}
            placeholder="Av. Insurgentes Sur 1234, Roma Norte, CDMX"
            className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3.5 text-sm text-[#0A2540] outline-none transition-all focus:border-[#7C71FF] focus:ring-2 focus:ring-[#7C71FF]/20 ${
              errors.address ? 'border-[#DC2626]' : 'border-ink/15 hover:border-ink/30'
            }`}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-ink/10 bg-white shadow-lg">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="block w-full px-3.5 py-2 text-left text-sm text-[#0A2540] hover:bg-[#7C71FF]/5"
                  >
                    {s.place_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.address && (
          <p className="mt-1 flex items-center gap-1 text-sm text-[#DC2626]">
            <IconAlertCircle size={14} /> {errors.address}
          </p>
        )}
        {!mapboxToken && (
          <p className="mt-1 text-xs text-ink/40">
            Autocomplete deshabilitado (sin token Mapbox). Captura tu dirección manualmente; podemos
            geolocalizar después desde Ajustes.
          </p>
        )}
        {lat != null && lng != null && (
          <p className="mt-1 font-mono text-xs text-ink/40">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
      </fieldset>

      {/* Horario */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#0A2540]">
          Horario de operación
        </legend>
        <div className="overflow-hidden rounded-lg border border-ink/10">
          {DAYS.map((d, idx) => {
            const h = hours[d.key];
            return (
              <div
                key={d.key}
                className={`flex items-center gap-3 px-3.5 py-2 ${idx > 0 ? 'border-t border-ink/5' : ''}`}
              >
                <span className="w-10 text-xs font-medium text-[#0A2540]">{d.label}</span>
                <label className="flex items-center gap-1.5 text-xs text-ink/60">
                  <input
                    type="checkbox"
                    checked={!h.closed}
                    onChange={(e) => updateDay(d.key, { closed: !e.target.checked })}
                    className="accent-[#7C71FF]"
                  />
                  Abierto
                </label>
                <input
                  type="time"
                  value={h.open}
                  onChange={(e) => updateDay(d.key, { open: e.target.value })}
                  disabled={h.closed}
                  className="rounded border border-ink/15 bg-white px-2 py-1 text-xs text-[#0A2540] disabled:bg-ink/5 disabled:text-ink/30"
                />
                <span className="text-xs text-ink/40">a</span>
                <input
                  type="time"
                  value={h.close}
                  onChange={(e) => updateDay(d.key, { close: e.target.value })}
                  disabled={h.closed}
                  className="rounded border border-ink/15 bg-white px-2 py-1 text-xs text-[#0A2540] disabled:bg-ink/5 disabled:text-ink/30"
                />
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Canales */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#0A2540]">
          Canales activos <span className="text-[#7C71FF]">*</span>
        </legend>
        <div className="space-y-2">
          {CANALES.map((c) => (
            <label
              key={c.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 px-3.5 py-3 transition hover:border-[#7C71FF]/40 has-[:checked]:border-[#7C71FF] has-[:checked]:bg-[#7C71FF]/5"
            >
              <input type="checkbox" name="canales" value={c.value} className="accent-[#7C71FF]" />
              <span className="text-sm text-[#0A2540]">{c.label}</span>
            </label>
          ))}
        </div>
        {errors.canales && (
          <p className="mt-1 flex items-center gap-1 text-sm text-[#DC2626]">
            <IconAlertCircle size={14} /> {errors.canales}
          </p>
        )}
      </fieldset>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#7C71FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5E52F5] disabled:opacity-60 active:scale-[0.98]"
        >
          {pending ? 'Guardando…' : 'Continuar'}
        </button>
      </div>
    </form>
  );
}
