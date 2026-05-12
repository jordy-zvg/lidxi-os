import { getBranchId } from '@/lib/station';
import { createSupabaseServerClient } from '@lidxi/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end required' }, { status: 400 });
  }

  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const branchId = getBranchId();

    const { data, error } = await supabase
      .from('shifts')
      .select('*, employees(full_name, role)')
      .eq('branch_id', branchId)
      .gte('started_at', start)
      .lte('started_at', end)
      .order('started_at', { ascending: false });

    if (error || !data) {
      return NextResponse.json([], { status: 200 });
    }

    const rows = (
      data as Array<{
        id: string;
        employee_id: string;
        branch_id: string;
        type: string;
        started_at: string;
        ended_at: string | null;
        break_minutes: number;
        auto_closed: boolean;
        employees: { full_name: string; role: string } | null;
      }>
    ).map((s) => ({
      id: s.id,
      employee_id: s.employee_id,
      employee_name: s.employees?.full_name ?? 'Desconocido',
      employee_role: s.employees?.role ?? '',
      branch_id: s.branch_id,
      type: s.type,
      started_at: s.started_at,
      ended_at: s.ended_at,
      break_minutes: s.break_minutes,
      auto_closed: s.auto_closed,
    }));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
