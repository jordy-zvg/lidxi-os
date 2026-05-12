'use client';

import { useCallback, useEffect, useState } from 'react';
import { TimesheetClient } from './TimesheetClient';
import type { ShiftRow } from './types';

function weekBounds(offset: number): { start: Date; end: Date; label: string } {
  const now = new Date();
  const day = now.getDay(); // 0 Sun, 1 Mon…
  const diffToMon = (day === 0 ? -6 : 1 - day) + offset * 7;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      timeZone: 'America/Mexico_City',
    });
  const label = `${fmt(start)} – ${fmt(end)}`;
  return { start, end, label };
}

export const TimesheetWrapper = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);

  const { start, end, label } = weekBounds(weekOffset);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/timesheet?start=${start.toISOString()}&end=${end.toISOString()}`,
      );
      if (res.ok) {
        const data = (await res.json()) as ShiftRow[];
        setShifts(data);
      } else {
        setShifts([]);
      }
    } catch {
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    void fetchShifts();
  }, [fetchShifts]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-ink-400">Cargando registros…</span>
      </div>
    );
  }

  return (
    <TimesheetClient
      shifts={shifts}
      weekLabel={label}
      onPrevWeek={() => setWeekOffset((w) => w - 1)}
      onNextWeek={() => setWeekOffset((w) => w + 1)}
      onExport={() => {}}
    />
  );
};
