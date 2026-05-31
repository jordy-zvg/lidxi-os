'use client';

import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

export interface AddressValue {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (v: AddressValue) => void;
  disabled?: boolean;
}

const INPUT_CLASS =
  'w-full h-8 text-sm text-ink bg-canvas border border-line-2 rounded px-2 focus:outline-none focus:border-brand';

/**
 * Input interno: se monta el widget de Google Places en cuanto la librería
 * 'places' está disponible. Mientras carga, sigue siendo un input usable
 * (degrada a texto plano emitiendo lat/lng null).
 */
function PlacesInput({ value, onChange, disabled }: AddressAutocompleteProps) {
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  // Ref para no re-montar el Autocomplete cuando cambia la identidad de onChange.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 'mx' },
      types: ['address'],
    });
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const loc = place.geometry?.location;
      onChangeRef.current({
        address: place.formatted_address ?? inputRef.current?.value ?? '',
        lat: loc ? loc.lat() : null,
        lng: loc ? loc.lng() : null,
      });
    });
    return () => {
      listener.remove();
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [places]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      disabled={disabled}
      placeholder="Calle, número, colonia, CP…"
      autoComplete="off"
      // Texto libre (sin elegir sugerencia) actualiza la dirección pero limpia
      // las coords — Uber Direct usará su geocoding de fallback hasta que se
      // elija una sugerencia con geometry.
      onChange={(e) => onChangeRef.current({ address: e.target.value, lat: null, lng: null })}
      className={INPUT_CLASS}
    />
  );
}

/**
 * Autocomplete de dirección con Google Places (@vis.gl/react-google-maps).
 * Captura `formatted_address` + lat/lng para el despacho de envío.
 *
 * Sin NEXT_PUBLIC_GOOGLE_MAPS_API_KEY degrada a un <input> de texto plano
 * (address sin coords) para no bloquear la captura en entornos sin key.
 */
export function AddressAutocomplete(props: AddressAutocompleteProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <input
        type="text"
        value={props.value}
        disabled={props.disabled}
        placeholder="Calle, número, colonia, CP…"
        onChange={(e) => props.onChange({ address: e.target.value, lat: null, lng: null })}
        className={INPUT_CLASS}
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <PlacesInput {...props} />
    </APIProvider>
  );
}
