'use client';

import { useState } from 'react';

/**
 * Calculadora interactiva del margen extra del canal directo. Vive dentro de la
 * sección "espresso" (fondo oscuro cálido) del home v4. Slider → margen anual
 * estimado vs comisión típica de marketplaces (~27%).
 */

const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-MX')}`;

export function SavingsCalculator() {
  const [sales, setSales] = useState(80000);
  const savings = sales * 0.27 * 12;

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-[30px] backdrop-blur-sm">
      <div>
        <label htmlFor="calc-sales" className="mb-3 block text-sm font-medium text-[#b8ac99]">
          Ventas mensuales por tu tienda propia
        </label>
        <div className="mb-[14px] font-mono text-[31px] font-bold text-[#fbf7ef]">{fmt(sales)}</div>
        <input
          id="calc-sales"
          type="range"
          min={10000}
          max={500000}
          step={5000}
          value={sales}
          onChange={(e) => setSales(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-brand"
        />
      </div>
      <div className="mt-[26px] border-t border-white/10 pt-[26px]">
        <div className="mb-2 text-sm text-[#b8ac99]">
          Tu margen extra al año con tu canal directo
        </div>
        <div className="font-mono text-4xl font-bold leading-none tracking-tight text-[#7fe0b0] sm:text-5xl">
          {fmt(savings)}
        </div>
        <div className="mt-[10px] text-[13.5px] text-[#93887a]">
          Frente a la comisión típica de 25–30% de los marketplaces.
        </div>
      </div>
    </div>
  );
}
