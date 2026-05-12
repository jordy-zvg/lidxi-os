'use client';

import { useCallback, useMemo, useState } from 'react';
import { KdsStationFilters } from './KdsStationFilters';
import { KdsTicket } from './KdsTicket';
import { KdsTopbar } from './KdsTopbar';
import { MOCK_TICKETS, type Station, type Ticket } from './mock-tickets';

export const KdsScreen = () => {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [station, setStation] = useState<Station>('all');
  const [exitingId, setExitingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (station === 'all' ? tickets : tickets.filter((t) => t.station === station)),
    [tickets, station],
  );

  const handleReady = useCallback((id: string) => {
    setExitingId(id);
    setTimeout(() => {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setExitingId(null);
    }, 300);
  }, []);

  const lateCount = tickets.filter((t) => t.elapsed >= 600).length;

  const avgSecs =
    tickets.length > 0
      ? Math.round(tickets.reduce((sum, t) => sum + t.elapsed, 0) / tickets.length)
      : 0;
  const avgTime = `${Math.floor(avgSecs / 60)}:${(avgSecs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full text-dark-ink">
      <KdsTopbar activeCount={tickets.length} lateCount={lateCount} avgTime={avgTime} />
      <KdsStationFilters active={station} onChange={setStation} tickets={tickets} />
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full items-start">
          {filtered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-dark-ink-300 text-sm">
              Sin tickets en esta estación
            </div>
          ) : (
            filtered.map((ticket) => (
              <KdsTicket
                key={ticket.id}
                ticket={ticket}
                exiting={exitingId === ticket.id}
                onReady={() => handleReady(ticket.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
