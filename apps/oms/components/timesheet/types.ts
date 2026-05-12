export interface ShiftRow {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  branch_id: string;
  type: string;
  started_at: string;
  ended_at: string | null;
  break_minutes: number;
  auto_closed: boolean;
}
