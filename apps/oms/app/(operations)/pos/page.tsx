export const metadata = { title: 'POS' };

import { OpeningFloatGate } from '@/components/caja/OpeningFloatGate';
import { PosScreen } from '@/components/pos/PosScreen';

export default function PosPage() {
  return (
    <>
      <OpeningFloatGate />
      <PosScreen />
    </>
  );
}
