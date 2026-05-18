import { type TrackingSnapshot, subscribeTracking } from '@/lib/tracker';
import { createSupabaseServiceClient } from '@kobi/db';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 15_000;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const orderId = params.id;

  // Cargar snapshot inicial desde BD
  const supabase = createSupabaseServiceClient();
  const { data: initial } = await supabase
    .from('delivery_tracking')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller ya cerrado
        }
      };

      // Enviar snapshot inicial
      if (initial) {
        send('snapshot', initial);
      } else {
        send('snapshot', null);
      }

      // Suscribirse a updates en tiempo real
      const unsubscribe = subscribeTracking(orderId, (snapshot: TrackingSnapshot) => {
        send('update', snapshot);
        // Cerrar el stream cuando el pedido se entregó o canceló
        if (snapshot.status === 'delivered' || snapshot.status === 'canceled') {
          send('done', { status: snapshot.status });
          unsubscribe();
          clearInterval(heartbeat);
          try {
            controller.close();
          } catch {
            // ya cerrado
          }
        }
      });

      // Heartbeat cada 15s para mantener la conexión viva
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, HEARTBEAT_MS);

      // Cleanup al cancelar la request (cliente desconecta)
      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
