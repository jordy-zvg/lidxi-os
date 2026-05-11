import { getBranchId } from '@/lib/station';
import {
  createSupabaseServiceClient,
  getBranchWithRestaurant,
  getLastPosActivation,
} from '@lidxi/db';
import { LoginShell } from './LoginShell';

export default async function LoginPage() {
  const supabase = createSupabaseServiceClient();
  const branchId = getBranchId();
  const [branch, lastActivation] = await Promise.all([
    getBranchWithRestaurant(supabase, branchId),
    getLastPosActivation(supabase, branchId),
  ]);

  if (!branch) {
    return (
      <div className="max-w-md rounded-lg border border-danger-soft bg-danger-soft p-6 text-center text-sm text-danger-text">
        Branch <code className="font-mono">{branchId}</code> no existe en la base de datos. Revisa{' '}
        <code className="font-mono">BRANCH_ID</code> en .env.local o corre{' '}
        <code className="font-mono">pnpm db:reset</code>.
      </div>
    );
  }

  return (
    <LoginShell
      stationName="Mostrador 1"
      branch={{ id: branch.id, name: branch.name, restaurantName: branch.restaurant.name }}
      lastActivation={lastActivation}
    />
  );
}
